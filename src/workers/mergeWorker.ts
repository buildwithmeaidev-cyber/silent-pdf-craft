// src/workers/mergeWorker.ts
/**
 * Web Worker for merging PDFs using pdf-lib.
 * Expects a message: { files: Array<{ name: string; buffer: ArrayBuffer }> }
 * Posts progress updates and final result.
 */
import { PDFDocument } from "pdf-lib";

self.addEventListener("message", async (event: MessageEvent) => {
  const data = event.data as { files: Array<{ name: string; buffer: ArrayBuffer }> };
  const files = data.files;
  try {
    const mergedPdf = await PDFDocument.create();
    const total = files.length;
    for (let i = 0; i < total; i++) {
      const file = files[i];
      const uint8 = new Uint8Array(file.buffer);
      const pdf = await PDFDocument.load(uint8);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
      // Report progress (simple linear)
      const progress = Math.round(((i + 1) / total) * 90) + 10; // start at 10, end at 100
      self.postMessage({ type: "progress", payload: progress });
    }
    const mergedBytes = await mergedPdf.save();
    const blob = new Blob([mergedBytes], { type: "application/pdf" });
    const filename = "merged.pdf";
    self.postMessage({ type: "result", payload: { filename, blob } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unexpected error during PDF merge";
    self.postMessage({ type: "error", payload: msg });
  }
});
