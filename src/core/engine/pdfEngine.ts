// src/core/engine/pdfEngine.ts
// Central singleton PDF processing engine using a Web Worker.
// All heavy PDF operations are executed off the main thread.
// The engine exposes async methods that accept File[] inputs and optional parameters.
// Each method returns a { filename: string; blob: Blob; url: string } result.
// Memoization is based on a fingerprint (name+size+lastModified) to avoid duplicate work.

import { PDFDocument } from "pdf-lib";

type ProgressCallback = (pct: number) => void;

type WorkerMessage =
  | { id: string; result: unknown }
  | { id: string; error: string };

type AbortSignal = AbortSignal; // alias for clarity

// Simple fingerprint for caching
function fingerprint(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

// In‑memory cache of completed jobs
const cache = new Map<string, { blob: Blob; filename: string; url: string }>();

// Create a singleton worker (inline code as Blob)
const worker = (() => {
  if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
    const code = `
      importScripts('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js');
      const { PDFDocument } = self.pdfLib;
      function parseRanges(rangeStr) {
        const ranges = [];
        if (!rangeStr) return ranges;
        rangeStr.split(',').forEach(part => {
          const [start, end] = part.split('-').map(Number);
          if (isNaN(start)) return;
          if (isNaN(end)) ranges.push(start - 1);
          else for (let i = start; i <= end; i++) ranges.push(i - 1);
        });
        return ranges;
      }
      self.onmessage = async (e) => {
        const { id, action, payload, signal } = e.data;
        try {
          if (action === 'merge') {
            const { files } = payload;
            const merged = await PDFDocument.create();
            for (const f of files) {
              const arr = await f.arrayBuffer();
              const doc = await PDFDocument.load(arr);
              const copied = await merged.copyPages(doc, doc.getPageIndices());
              copied.forEach(p => merged.addPage(p));
            }
            const bytes = await merged.save();
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            postMessage({ id, result: { filename: 'merged.pdf', blob, url } });
          } else if (action === 'split') {
            const { file, ranges } = payload;
            const doc = await PDFDocument.load(await file.arrayBuffer());
            const pages = parseRanges(ranges);
            const newDoc = await PDFDocument.create();
            const copied = await newDoc.copyPages(doc, pages);
            copied.forEach(p => newDoc.addPage(p));
            const bytes = await newDoc.save();
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            postMessage({ id, result: { filename: 'split.pdf', blob, url } });
          } else if (action === 'rotate') {
            const { file, angle } = payload;
            const doc = await PDFDocument.load(await file.arrayBuffer());
            const pages = doc.getPages();
            pages.forEach(p => p.setRotation({ angle, type: 'deg' }));
            const bytes = await doc.save();
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            postMessage({ id, result: { filename: 'rotated.pdf', blob, url } });
          } else if (action === 'compress') {
            const { file, options } = payload;
            const doc = await PDFDocument.load(await file.arrayBuffer());
            // pdf-lib does not expose direct compression levels; we use object streams for modest compression.
            const bytes = await doc.save({ useObjectStreams: true });
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            postMessage({ id, result: { filename: 'compressed.pdf', blob, url } });
          } else if (action === 'removePages') {
            const { file, range } = payload;
            const doc = await PDFDocument.load(await file.arrayBuffer());
            const toRemove = new Set(parseRanges(range));
            const allPages = doc.getPageIndices();
            const keep = allPages.filter(i => !toRemove.has(i));
            const newDoc = await PDFDocument.create();
            const copied = await newDoc.copyPages(doc, keep);
            copied.forEach(p => newDoc.addPage(p));
            const bytes = await newDoc.save();
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            postMessage({ id, result: { filename: 'trimmed.pdf', blob, url } });
          }
        } catch (err) {
          postMessage({ id, error: err?.message ?? 'Worker error' });
        }
      };
    `;
    const blob = new Blob([code], { type: "application/javascript" });
    return new Worker(URL.createObjectURL(blob));
  }
  // Fallback mock for Node tests
  return {
    postMessage: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    terminate: () => {}
  } as unknown as Worker;
})();

// Helper to send a request to the worker and await a response.
function postWorker<T>(action: string, payload: unknown, signal?: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = crypto.randomUUID();
    const listener = (e: MessageEvent) => {
      const msg = e.data as WorkerMessage;
      if (msg.id !== id) return;
      worker.removeEventListener('message', listener);
      if ('error' in msg) reject(new Error(msg.error));
      else resolve(msg.result as T);
    };
    worker.addEventListener('message', listener);
    worker.postMessage({ id, action, payload, signal });
    if (signal) {
      signal.addEventListener('abort', () => {
        reject(new DOMException('Aborted', 'AbortError'));
      });
    }
  });
}

/**
 * Public API – each method checks the cache, calls the worker, and returns a Blob URL.
 */
export const pdfEngine = {
  async mergePdfs(files: File[]): Promise<{ filename: string; blob: Blob; url: string }> {
    const key = files.map(f => fingerprint(f)).join('|');
    if (cache.has(key)) return cache.get(key)!;
    const result = await postWorker<{ filename: string; blob: Blob; url: string }>('merge', { files });
    cache.set(key, { filename: result.filename, blob: result.blob, url: result.url });
    return result;
  },
  async splitPdf(file: File, range: string): Promise<{ filename: string; blob: Blob; url: string }> {
    const key = fingerprint(file) + '|split|' + range;
    if (cache.has(key)) return cache.get(key)!;
    const result = await postWorker<{ filename: string; blob: Blob; url: string }>('split', { file, ranges: range });
    cache.set(key, { filename: result.filename, blob: result.blob, url: result.url });
    return result;
  },
  async rotatePdf(file: File, angle: number): Promise<{ filename: string; blob: Blob; url: string }> {
    const key = fingerprint(file) + '|rotate|' + angle;
    if (cache.has(key)) return cache.get(key)!;
    const result = await postWorker<{ filename: string; blob: Blob; url: string }>('rotate', { file, angle });
    cache.set(key, { filename: result.filename, blob: result.blob, url: result.url });
    return result;
  },
  async compressPdf(file: File, options: unknown): Promise<{ filename: string; blob: Blob; url: string }> {
    const key = fingerprint(file) + '|compress|' + JSON.stringify(options);
    if (cache.has(key)) return cache.get(key)!;
    const result = await postWorker<{ filename: string; blob: Blob; url: string }>('compress', { file, options });
    cache.set(key, { filename: result.filename, blob: result.blob, url: result.url });
    return result;
  },
  async removePages(file: File, range: string): Promise<{ filename: string; blob: Blob; url: string }> {
    const key = fingerprint(file) + '|remove|' + range;
    if (cache.has(key)) return cache.get(key)!;
    const result = await postWorker<{ filename: string; blob: Blob; url: string }>('removePages', { file, range });
    cache.set(key, { filename: result.filename, blob: result.blob, url: result.url });
    return result;
  },
  // Placeholder methods – kept for backward compatibility.
  async splitPdfPlaceholder(_files: File[], _range: string): Promise<unknown> { throw new Error('splitPdf not implemented'); },
  async rotatePdfPlaceholder(_files: File[], _rotation: number): Promise<unknown> { throw new Error('rotatePdf not implemented'); },
  async removePagesPlaceholder(_files: File[], _range: string): Promise<unknown> { throw new Error('removePages not implemented'); },
  async compressPdfPlaceholder(_files: File[], _options: unknown): Promise<unknown> { throw new Error('compressPdf not implemented'); },
  async protectPdf(_files: File[], _password: string): Promise<unknown> { throw new Error('protectPdf not implemented'); },
  async exportPdf(_files: File[]): Promise<unknown> { throw new Error('exportPdf not implemented'); },
  async addPages(_files: File[], _extra: unknown): Promise<unknown> { throw new Error('addPages not implemented'); },
  async addWatermark(_files: File[], _options: unknown): Promise<unknown> { throw new Error('addWatermark not implemented'); },
  async photoToPdf(_files: File[]): Promise<unknown> { throw new Error('photoToPdf not implemented'); },
  async pdfToWord(_files: File[]): Promise<unknown> { throw new Error('pdfToWord not implemented'); },
  async wordToPdf(_files: File[]): Promise<unknown> { throw new Error('wordToPdf not implemented'); },
};

// Ensure worker termination when the page unloads to free resources.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    worker.terminate();
  });
}
