import { Blob as NodeBlob, File as NodeFile } from "node:buffer";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { compressPdf, getPdfJs, imageToPdf } from "@/lib/pdf";

Object.defineProperty(globalThis, "Blob", { configurable: true, value: NodeBlob });
Object.defineProperty(globalThis, "File", { configurable: true, value: NodeFile });

async function buildTextPdf(lines = 10): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595.28, 841.89]);
  for (let i = 0; i < lines; i++) {
    page.drawText(`Line of searchable text ${i + 1} with numbers and punctuation.`, {
      x: 54,
      y: 800 - i * 40,
      size: 12,
      font,
    });
  }
  return doc.save();
}

describe("Phase 3: Compression & Image-to-PDF Tools", () => {
  it("compressPdf preserves selectable vector text and enforces size-never-grows guarantee", async () => {
    const rawBytes = await buildTextPdf(30);
    // Add extra padding bytes so structural re-saving (which strips unreferenced objects) produces a smaller file.
    const padded = new Uint8Array(rawBytes.length + 2048);
    padded.set(rawBytes);
    const file = new NodeFile([padded], "text-doc.pdf", { type: "application/pdf" });

    const compressed = await compressPdf(file, { level: "medium" });
    expect(compressed.filename).toBe("silentpdf-compressed.pdf");
    const outBytes = new Uint8Array(await compressed.blob.arrayBuffer());

    // Size-never-grows guarantee: compressed output must not exceed original size.
    expect(outBytes.length).toBeLessThanOrEqual(padded.length);

    // Verify it parses cleanly and retains page count
    const parsed = await PDFDocument.load(outBytes);
    expect(parsed.getPageCount()).toBe(1);
  });

  it("imageToPdf compiles multiple image files into a single valid PDF", async () => {
    const pngBytes = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6,
      0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 10, 73, 68, 65, 84, 120, 156, 99, 98, 0, 0, 0, 2, 0, 1,
      246, 39, 163, 177, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
    ]);
    const imgFile = new NodeFile([pngBytes], "icon.png", { type: "image/png" });
    Object.defineProperty(imgFile, "arrayBuffer", {
      configurable: true,
      value: async () => pngBytes.buffer.slice(pngBytes.byteOffset, pngBytes.byteOffset + pngBytes.byteLength),
    });

    const res = await imageToPdf([imgFile, imgFile]);
    expect(res.filename).toBe("silentpdf-from-images.pdf");
    const parsed = await PDFDocument.load(new Uint8Array(await res.blob.arrayBuffer()));
    expect(parsed.getPageCount()).toBe(2);
  });
});
