import { File as NodeFileRuntime } from "node:buffer";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import DOMMatrixShim from "dommatrix";
import { PDFDocument, StandardFonts, degrees } from "pdf-lib";
import { PDFDocument as PDFDocumentEnc } from "@cantoo/pdf-lib";
import { describe, expect, it } from "vitest";
import {
  addBlankPages,
  addPagesToPdf,
  exportPdf,
  getPdfJs,
  mergePdfs,
  parseRanges,
  protectPdf,
  removePages,
  reorderPdf,
  rotatePdf,
  splitPdf,
} from "@/lib/pdf";
import { destroyPdfProxy, isJobCancelledError } from "@/lib/pdfGuards";

const NodeFile = NodeFileRuntime as unknown as {
  new (...args: ConstructorParameters<typeof NodeFileRuntime>): File;
};

Object.defineProperty(globalThis, "File", { configurable: true, value: NodeFileRuntime });
Object.defineProperty(globalThis, "DOMMatrix", { configurable: true, value: DOMMatrixShim });

async function buildTextPdf(
  labels: string[],
  options?: { width?: number; height?: number; initialRotations?: Record<number, number> },
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const w = options?.width ?? 595.28;
  const h = options?.height ?? 841.89;
  labels.forEach((label, idx) => {
    const page = doc.addPage([w, h]);
    if (label) {
      page.drawText(label, { x: 54, y: h - 72, size: 14, font });
    }
    const rot = options?.initialRotations?.[idx];
    if (rot) {
      page.setRotation(degrees(rot));
    }
  });
  return doc.save();
}

async function buildEncryptedBytes(password: string, pages = 2): Promise<Uint8Array> {
  const doc = await PDFDocumentEnc.create();
  for (let i = 0; i < pages; i++) {
    doc.addPage([400, 400]).drawText(`Locked Page ${i + 1}`);
  }
  doc.encrypt({
    userPassword: password,
    ownerPassword: `${password}-owner`,
    permissions: {
      printing: "highResolution",
      modifying: false,
      copying: false,
      annotating: false,
    },
  });
  return doc.save();
}

async function extractPageTexts(blob: Blob): Promise<string[]> {
  const pdfjs = await getPdfJs();
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
    resolve(process.cwd(), "node_modules/pdfjs-dist/build/pdf.worker.min.mjs"),
  ).href;
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const task = pdfjs.getDocument({ data: bytes, verbosity: 0 });
  const doc = await task.promise;
  try {
    const out: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const tc = await page.getTextContent();
      const text = (tc.items as Array<{ str?: string }>).map((it) => it.str ?? "").join(" ").trim();
      out.push(text);
    }
    return out;
  } finally {
    await destroyPdfProxy(doc, task);
  }
}

describe("Phase 2: Structural & Page Manipulation Tools", () => {
  it("parseRanges strictly validates bounds instead of silently clamping", () => {
    expect(parseRanges("1-3, 5", 6)).toEqual([0, 1, 2, 4]);
    expect(parseRanges(undefined, 6)).toBeNull();
    expect(() => parseRanges("1, 99", 5)).toThrow(/out of bounds/i);
    expect(() => parseRanges("0-2", 5)).toThrow(/out of bounds/i);
    expect(() => parseRanges("abc", 5)).toThrow(/invalid range/i);
  });

  it("mergePdfs combines multiple PDFs in order, handles 36-page batch, and supports cancellation", async () => {
    const f1 = new NodeFile([await buildTextPdf(["DocA-1", "DocA-2"])], "a.pdf", { type: "application/pdf" });
    const f2 = new NodeFile([await buildTextPdf(["DocB-1", "DocB-2", "DocB-3"])], "b.pdf", { type: "application/pdf" });

    const res = await mergePdfs([f1, f2]);
    expect(res.filename).toBe("silentpdf-merged.pdf");
    const texts = await extractPageTexts(res.blob);
    expect(texts).toEqual(["DocA-1", "DocA-2", "DocB-1", "DocB-2", "DocB-3"]);

    // Large batch (36 pages across 3 files)
    const batch = await Promise.all(
      [0, 1, 2].map(async (chunk) => {
        const labels = Array.from({ length: 12 }, (_, i) => `Batch-${chunk * 12 + i + 1}`);
        return new NodeFile([await buildTextPdf(labels)], `batch-${chunk}.pdf`, { type: "application/pdf" });
      }),
    );
    const largeRes = await mergePdfs(batch);
    const largeDoc = await PDFDocument.load(new Uint8Array(await largeRes.blob.arrayBuffer()));
    expect(largeDoc.getPageCount()).toBe(36);

    // Invalid inputs
    await expect(mergePdfs([f1])).rejects.toThrow(/at least 2/i);
    const spoof = new NodeFile(["not a pdf"], "fake.pdf", { type: "application/pdf" });
    await expect(mergePdfs([f1, spoof])).rejects.toThrow(/valid PDF/i);

    // Cooperative cancellation
    const controller = new AbortController();
    controller.abort();
    await expect(mergePdfs([f1, f2], { signal: controller.signal })).rejects.toSatisfy(isJobCancelledError);
  });

  it("splitPdf extracts arbitrary ranges in exact sequence and rejects out-of-bounds pages", async () => {
    const file = new NodeFile(
      [await buildTextPdf(["P1", "P2", "P3", "P4", "P5"])],
      "report.pdf",
      { type: "application/pdf" },
    );

    const res = await splitPdf(file, "4-5, 2");
    expect(await extractPageTexts(res.blob)).toEqual(["P4", "P5", "P2"]);

    const allRes = await splitPdf(file, "");
    expect(await extractPageTexts(allRes.blob)).toEqual(["P1", "P2", "P3", "P4", "P5"]);

    await expect(splitPdf(file, "1, 6")).rejects.toThrow(/out of bounds/i);
  });

  it("removePages deletes targeted pages including the trailing page and prevents empty documents", async () => {
    const file = new NodeFile(
      [await buildTextPdf(["Keep-1", "Drop-2", "Keep-3", "Keep-4", "Drop-Last-5"])],
      "trim.pdf",
      { type: "application/pdf" },
    );

    // Remove trailing page 5 as well as page 2
    const trimmed = await removePages(file, "2, 5");
    expect(await extractPageTexts(trimmed.blob)).toEqual(["Keep-1", "Keep-3", "Keep-4"]);

    await expect(removePages(file, "")).rejects.toThrow(/at least one page/i);
    await expect(removePages(file, "1-5")).rejects.toThrow(/cannot remove every page/i);
    await expect(removePages(file, "9")).rejects.toThrow(/out of bounds/i);
  });

  it("reorderPdf rearranges pages including duplicate picks", async () => {
    const file = new NodeFile(
      [await buildTextPdf(["One", "Two", "Three", "Four"])],
      "slides.pdf",
      { type: "application/pdf" },
    );

    const reordered = await reorderPdf(file, "4, 2, 1, 3, 1");
    expect(await extractPageTexts(reordered.blob)).toEqual(["Four", "Two", "One", "Three", "One"]);

    await expect(reorderPdf(file, "")).rejects.toThrow(/page order/i);
    await expect(reorderPdf(file, "1, 7")).rejects.toThrow(/out of bounds/i);
  });

  it("rotatePdf supports both batch and per-page rotations accumulated on existing angles", async () => {
    const file = new NodeFile(
      [await buildTextPdf(["Page 1", "Page 2", "Page 3"], { initialRotations: { 0: 90 } })],
      "scans.pdf",
      { type: "application/pdf" },
    );

    const batchRes = await rotatePdf(file, 90);
    const batchDoc = await PDFDocument.load(new Uint8Array(await batchRes.blob.arrayBuffer()));
    expect(batchDoc.getPages().map((p) => p.getRotation().angle)).toEqual([180, 90, 90]);

    const perPageRes = await rotatePdf(file, { 1: 180, 3: 270 });
    const perPageDoc = await PDFDocument.load(new Uint8Array(await perPageRes.blob.arrayBuffer()));
    expect(perPageDoc.getPages().map((p) => p.getRotation().angle)).toEqual([270, 0, 270]);

    await expect(rotatePdf(file, { 5: 90 })).rejects.toThrow(/out of bounds/i);
  });

  it("addPagesToPdf inserts blank pages or imported PDF pages at start, middle, or end", async () => {
    const base = new NodeFile(
      [await buildTextPdf(["Base-1", "Base-2"], { width: 500, height: 700 })],
      "base.pdf",
      { type: "application/pdf" },
    );
    const extra = new NodeFile(
      [await buildTextPdf(["Extra-1", "Extra-2", "Extra-3"])],
      "extra.pdf",
      { type: "application/pdf" },
    );

    // Cover page at index 0
    const coverRes = await addPagesToPdf(base, { mode: "blank", blankCount: 1, insertAfterPage: 0 });
    const coverDoc = await PDFDocument.load(new Uint8Array(await coverRes.blob.arrayBuffer()));
    expect(coverDoc.getPageCount()).toBe(3);
    expect([coverDoc.getPage(0).getWidth(), coverDoc.getPage(0).getHeight()]).toEqual([500, 700]);
    expect(await extractPageTexts(coverRes.blob)).toEqual(["", "Base-1", "Base-2"]);

    // Import selected pages from second PDF after page 1
    const midImport = await addPagesToPdf(base, {
      mode: "import",
      importFile: extra,
      importPages: [3, 1],
      insertAfterPage: 1,
    });
    expect(await extractPageTexts(midImport.blob)).toEqual(["Base-1", "Extra-3", "Extra-1", "Base-2"]);

    // Backward-compatible addBlankPages helper appends to end
    const appended = await addBlankPages(base, 2);
    expect(await extractPageTexts(appended.blob)).toEqual(["Base-1", "Base-2", "", ""]);

    // Rejects invalid inputs cleanly
    await expect(addPagesToPdf(base, { mode: "import" })).rejects.toThrow(/second PDF/i);
    await expect(addPagesToPdf(base, { mode: "blank", blankCount: 1, insertAfterPage: 5 })).rejects.toThrow(/between 0 and 2/i);
    const encryptedImport = new NodeFile([await buildEncryptedBytes("pass1234")], "enc.pdf", { type: "application/pdf" });
    await expect(addPagesToPdf(base, { mode: "import", importFile: encryptedImport })).rejects.toThrow(/password-protected|encrypted/i);
  });

  it("exportPdf preserves exact PDF bytes while sanitizing output filename", async () => {
    const bytes = await buildTextPdf(["Original Byte Check"]);
    const file = new NodeFile([bytes], "raw.pdf", { type: "application/pdf" });

    const res = await exportPdf(file, "../Client Report: Final (v2)");
    expect(res.filename).toBe("Client Report Final v2.pdf");
    expect(res.filename).not.toMatch(/[/\\]/);

    const outBytes = new Uint8Array(await res.blob.arrayBuffer());
    expect(outBytes).toEqual(bytes);
  });

  it("protectPdf applies verifiable AES-256 encryption and rejects invalid inputs", async () => {
    const plainFile = new NodeFile(
      [await buildTextPdf(["Confidential Payroll", "Page Two"])],
      "payroll.pdf",
      { type: "application/pdf" },
    );

    const protectedRes = await protectPdf(plainFile, "CorrectHorse42");
    expect(protectedRes.filename).toBe("silentpdf-protected.pdf");
    const encBytes = new Uint8Array(await protectedRes.blob.arrayBuffer());

    // Plain loader without password MUST fail
    await expect(PDFDocument.load(encBytes)).rejects.toThrow();

    // Wrong password MUST fail
    await expect(PDFDocumentEnc.load(encBytes, { password: "WrongPassword" })).rejects.toThrow();

    // Correct password unlocks with intact page count
    const unlocked = await PDFDocumentEnc.load(encBytes, { password: "CorrectHorse42" });
    expect(unlocked.getPageCount()).toBe(2);

    // Rejects short passwords
    await expect(protectPdf(plainFile, "abc")).rejects.toThrow(/at least 4 characters/i);

    // Rejects already-encrypted PDF cleanly instead of silently ignoring encryption
    const alreadyLocked = new NodeFile([await buildEncryptedBytes("locked-123")], "already.pdf", {
      type: "application/pdf",
    });
    await expect(protectPdf(alreadyLocked, "NewPass99")).rejects.toThrow(/password-protected|encrypted/i);
  });
});
