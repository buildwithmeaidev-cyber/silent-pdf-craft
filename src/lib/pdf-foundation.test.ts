import { Blob as NodeBlob, File as NodeFile } from "node:buffer";
import { act, renderHook } from "@testing-library/react";
import { Document, Packer, Paragraph } from "docx";
import { PDFDocument, StandardFonts, degrees } from "pdf-lib";
import { PDFDocument as PDFDocumentEnc } from "@cantoo/pdf-lib";
import { describe, expect, it } from "vitest";
import { usePdfJob } from "@/hooks/usePdfJob";
import {
  inspectDocxInput,
  inspectImageInput,
  inspectPdfInput,
  isJobCancelledError,
  throwIfAborted,
  verifyDocxOutput,
  verifyPdfOutput,
  yieldToMain,
} from "@/lib/pdfGuards";

Object.defineProperty(globalThis, "Blob", { configurable: true, value: NodeBlob });
Object.defineProperty(globalThis, "File", { configurable: true, value: NodeFile });

async function buildSamplePdf(pages = 2, rotateFirstDeg = 0): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const p = doc.addPage([595.28, 841.89]);
    p.drawText(`Sample Page ${i + 1}`, { x: 50, y: 760, size: 14, font });
    if (i === 0 && rotateFirstDeg !== 0) {
      p.setRotation(degrees(rotateFirstDeg));
    }
  }
  return doc.save();
}

async function buildEncryptedPdf(password: string): Promise<Uint8Array> {
  const doc = await PDFDocumentEnc.create();
  doc.addPage([400, 400]).drawText("Secret content");
  doc.encrypt({
    userPassword: password,
    ownerPassword: `${password}-owner`,
    permissions: { printing: true, modifying: false, copying: false, annotating: false },
  });
  return doc.save();
}

async function buildSampleDocx(): Promise<Uint8Array> {
  const doc = new Document({
    sections: [{ children: [new Paragraph("Hello SilentPDF")] }],
  });
  return Packer.toBuffer(doc);
}

describe("Phase 1 Foundation: Runtime polyfills & cooperative cancellation", () => {
  it("provides working Promise.try for sync values, promises, and synchronous throws", async () => {
    const pWithTry = Promise as unknown as {
      try: <T, A extends unknown[]>(fn: (...a: A) => T | PromiseLike<T>, ...args: A) => Promise<T>;
    };
    expect(typeof pWithTry.try).toBe("function");

    const syncVal = await pWithTry.try((a: number, b: number) => a + b, 3, 4);
    expect(syncVal).toBe(7);

    const asyncVal = await pWithTry.try(async (s: string) => s.toUpperCase(), "ok");
    expect(asyncVal).toBe("OK");

    await expect(
      pWithTry.try(() => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
  });

  it("aborts cleanly via throwIfAborted and yieldToMain", async () => {
    const controller = new AbortController();
    expect(() => throwIfAborted(controller.signal)).not.toThrow();

    controller.abort();
    expect(() => throwIfAborted(controller.signal)).toThrow();
    try {
      await yieldToMain(controller.signal);
      expect.fail("Should have thrown JobCancelledError");
    } catch (e) {
      expect(isJobCancelledError(e)).toBe(true);
    }
  });
});

describe("Phase 1 Foundation: Pre-flight input guards", () => {
  it("rejects empty, spoofed, and malformed PDF inputs cleanly", async () => {
    const emptyFile = new NodeFile([], "empty.pdf", { type: "application/pdf" });
    await expect(inspectPdfInput(emptyFile)).rejects.toThrow(/empty/i);

    const textFile = new NodeFile(["hello world"], "fake.pdf", { type: "application/pdf" });
    await expect(inspectPdfInput(textFile)).rejects.toThrow(/valid PDF/i);

    const brokenPdf = new NodeFile(["%PDF-1.7\ncorrupted garbage"], "broken.pdf", {
      type: "application/pdf",
    });
    await expect(inspectPdfInput(brokenPdf)).rejects.toThrow(/corrupted|read/i);
  });

  it("rejects password-protected PDFs cleanly instead of wiping encrypted pages", async () => {
    const lockedBytes = await buildEncryptedPdf("open-1234");
    const lockedFile = new NodeFile([lockedBytes], "locked.pdf", { type: "application/pdf" });

    await expect(inspectPdfInput(lockedFile)).rejects.toThrow(/password-protected|encrypted/i);

    const unlocked = await inspectPdfInput(lockedFile, {
      allowEncrypted: true,
      password: "open-1234",
    });
    expect(unlocked.isEncrypted).toBe(true);
    expect(unlocked.pageCount).toBe(1);
  });

  it("validates DOCX OOXML headers vs legacy .doc files", async () => {
    const legacyDoc = new NodeFile([new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0x00])], "old.doc");
    await expect(inspectDocxInput(legacyDoc)).rejects.toThrow(/legacy binary \.doc/i);

    const validDocx = new NodeFile([await buildSampleDocx()], "good.docx");
    const bytes = await inspectDocxInput(validDocx);
    expect(bytes.length).toBeGreaterThan(100);
  });

  it("sniffs PNG and JPEG magic signatures regardless of filename extension", async () => {
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    const spoofedPng = new NodeFile([pngBytes], "actually-png.jpg", { type: "image/jpeg" });
    expect((await inspectImageInput(spoofedPng)).format).toBe("png");

    const jpgBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00]);
    const spoofedJpg = new NodeFile([jpgBytes], "actually-jpg.png", { type: "image/png" });
    expect((await inspectImageInput(spoofedJpg)).format).toBe("jpg");
  });
});

describe("Phase 1 Foundation: Independent output validation", () => {
  it("validates page count and rotation angle independently from generator", async () => {
    const bytes = await buildSamplePdf(3, 90);
    const blob = new NodeBlob([bytes], { type: "application/pdf" });

    const info = await verifyPdfOutput(blob, {
      expectedPageCount: 3,
      expectedRotations: { 0: 90, 1: 0, 2: 0 },
    });
    expect(info.pageCount).toBe(3);

    await expect(verifyPdfOutput(blob, { expectedPageCount: 2 })).rejects.toThrow(/expected 2 pages/i);
    await expect(verifyPdfOutput(blob, { expectedRotations: { 0: 180 } })).rejects.toThrow(/rotation is 90/i);
  });

  it("verifies genuine encryption on protected PDFs and rejects unencrypted ones", async () => {
    const plainBlob = new NodeBlob([await buildSamplePdf(1)], { type: "application/pdf" });
    await expect(verifyPdfOutput(plainBlob, { encrypted: true })).rejects.toThrow(/not encrypted/i);

    const lockedBlob = new NodeBlob([await buildEncryptedPdf("secret99")], { type: "application/pdf" });
    const info = await verifyPdfOutput(lockedBlob, {
      encrypted: true,
      password: "secret99",
      expectedPageCount: 1,
    });
    expect(info.pageCount).toBe(1);
  });

  it("validates generated DOCX OOXML archives and rejects corrupt blobs", async () => {
    const validBlob = new NodeBlob([await buildSampleDocx()], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const info = await verifyDocxOutput(validBlob);
    expect(info.entries).toContain("word/document.xml");
    expect(info.entries).toContain("[Content_Types].xml");

    const brokenBlob = new NodeBlob([new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00])], {
      type: "application/zip",
    });
    await expect(verifyDocxOutput(brokenBlob)).rejects.toThrow(/output validation failed/i);
  });
});

describe("Phase 1 Foundation: usePdfJob cooperative cancellation & recovery", () => {
  it("transitions processing -> cancelling -> cancelled and discards late output", async () => {
    const { result } = renderHook(() => usePdfJob());

    let resolveSlow!: (v: { filename: string; blob: Blob }) => void;
    const slowPromise = new Promise<{ filename: string; blob: Blob }>((res) => {
      resolveSlow = res;
    });

    let jobPromise!: Promise<void>;
    act(() => {
      jobPromise = result.current.run(async ({ signal }) => {
        const res = await slowPromise;
        throwIfAborted(signal);
        return res;
      });
    });

    expect(result.current.state).toBe("processing");

    act(() => {
      result.current.cancel();
    });
    expect(result.current.state).toBe("cancelling");

    await act(async () => {
      resolveSlow({ filename: "late.pdf", blob: new NodeBlob(["%PDF-1.7"]) });
      await jobPromise;
    });

    expect(result.current.state).toBe("cancelled");
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();

    // Recovery: can re-run cleanly after cancellation
    await act(async () => {
      await result.current.run(async () => ({
        filename: "recovered.pdf",
        blob: new NodeBlob(["%PDF-1.7"], { type: "application/pdf" }),
      }));
    });
    expect(result.current.state).toBe("success");
    expect(result.current.result?.filename).toBe("recovered.pdf");
  });
});
