// src/core/engine/pdfEngine.ts
// Central PDF processing engine. All operations use the locally bundled `pdf-lib`
// dependency — no remote CDN scripts are loaded at runtime — which avoids supply
// chain risk from third-party CDNs serving tampered code into our PDF pipeline.
//
// Each method returns { filename, blob, url } and memoizes by fingerprint
// (name+size+lastModified+params) to avoid duplicate work.

import { PDFDocument } from "pdf-lib";

type EngineResult = { filename: string; blob: Blob; url: string };

// Simple fingerprint for caching
function fingerprint(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

// In‑memory cache of completed jobs
const cache = new Map<string, EngineResult>();

function parseRanges(rangeStr: string): number[] {
  const ranges: number[] = [];
  if (!rangeStr) return ranges;
  rangeStr.split(",").forEach((part) => {
    const [start, end] = part.split("-").map(Number);
    if (isNaN(start)) return;
    if (isNaN(end)) ranges.push(start - 1);
    else for (let i = start; i <= end; i++) ranges.push(i - 1);
  });
  return ranges;
}

function toResult(filename: string, bytes: Uint8Array): EngineResult {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  return { filename, blob, url };
}

/**
 * Public API – each method checks the cache, performs work locally with the
 * bundled pdf-lib, and returns a Blob URL.
 */
export const pdfEngine = {
  async mergePdfs(files: File[]): Promise<EngineResult> {
    const key = files.map((f) => fingerprint(f)).join("|") + "|merge";
    if (cache.has(key)) return cache.get(key)!;
    const merged = await PDFDocument.create();
    for (const f of files) {
      const doc = await PDFDocument.load(await f.arrayBuffer());
      const copied = await merged.copyPages(doc, doc.getPageIndices());
      copied.forEach((p) => merged.addPage(p));
    }
    const bytes = await merged.save();
    const result = toResult("merged.pdf", bytes);
    cache.set(key, result);
    return result;
  },
  async splitPdf(file: File, range: string): Promise<EngineResult> {
    const key = fingerprint(file) + "|split|" + range;
    if (cache.has(key)) return cache.get(key)!;
    const doc = await PDFDocument.load(await file.arrayBuffer());
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(doc, parseRanges(range));
    copied.forEach((p) => newDoc.addPage(p));
    const bytes = await newDoc.save();
    const result = toResult("split.pdf", bytes);
    cache.set(key, result);
    return result;
  },
  async rotatePdf(file: File, angle: number): Promise<EngineResult> {
    const key = fingerprint(file) + "|rotate|" + angle;
    if (cache.has(key)) return cache.get(key)!;
    const doc = await PDFDocument.load(await file.arrayBuffer());
    doc.getPages().forEach((p) => p.setRotation({ angle, type: "deg" } as never));
    const bytes = await doc.save();
    const result = toResult("rotated.pdf", bytes);
    cache.set(key, result);
    return result;
  },
  async compressPdf(file: File, options: unknown): Promise<EngineResult> {
    const key = fingerprint(file) + "|compress|" + JSON.stringify(options);
    if (cache.has(key)) return cache.get(key)!;
    const doc = await PDFDocument.load(await file.arrayBuffer());
    const bytes = await doc.save({ useObjectStreams: true });
    const result = toResult("compressed.pdf", bytes);
    cache.set(key, result);
    return result;
  },
  async removePages(file: File, range: string): Promise<EngineResult> {
    const key = fingerprint(file) + "|remove|" + range;
    if (cache.has(key)) return cache.get(key)!;
    const doc = await PDFDocument.load(await file.arrayBuffer());
    const toRemove = new Set(parseRanges(range));
    const keep = doc.getPageIndices().filter((i) => !toRemove.has(i));
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(doc, keep);
    copied.forEach((p) => newDoc.addPage(p));
    const bytes = await newDoc.save();
    const result = toResult("trimmed.pdf", bytes);
    cache.set(key, result);
    return result;
  },
  // Placeholder methods – kept for backward compatibility.
  async protectPdf(_files: File[], _password: string): Promise<unknown> { throw new Error("protectPdf not implemented"); },
  async exportPdf(_files: File[]): Promise<unknown> { throw new Error("exportPdf not implemented"); },
  async addPages(_files: File[], _extra: unknown): Promise<unknown> { throw new Error("addPages not implemented"); },
  async addWatermark(_files: File[], _options: unknown): Promise<unknown> { throw new Error("addWatermark not implemented"); },
  async photoToPdf(_files: File[]): Promise<unknown> { throw new Error("photoToPdf not implemented"); },
  async pdfToWord(_files: File[]): Promise<unknown> { throw new Error("pdfToWord not implemented"); },
  async wordToPdf(_files: File[]): Promise<unknown> { throw new Error("wordToPdf not implemented"); },
};
