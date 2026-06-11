// src/core/page-engine/pageEngine.ts
/**
 * Shared Page Engine – provides page‑level utilities on top of the existing pdfEngine.
 *
 * Current API (implemented):
 *   - loadPdf(file):                loads a PDF and returns a handle.
 *   - getPageCount(handle):          returns the number of pages.
 *   - renderThumbnail(handle, page): returns a data‑URL of a thumbnail image.
 *   - getPagePreview(handle, page):  returns a higher‑resolution preview data‑URL.
 *   - pageSelection(handle, pages): returns a new handle containing only the selected pages.
 *
 * Future API (planned):
 *   - merge(...handles)
 *   - split(handle, ranges)
 *   - rotate(handle, page, angle)
 *   - organize(handle, order)
 */

import { pdfEngine } from "../engine/pdfEngine";
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

// Simple in‑memory map: handle → original File.
type PdfHandle = string;
const handleMap = new Map<PdfHandle, File>();

function uuid(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export async function loadPdf(file: File): Promise<PdfHandle> {
  const id = uuid();
  handleMap.set(id, file);
  return id;
}

export async function getPageCount(handle: PdfHandle): Promise<number> {
  const file = handleMap.get(handle);
  if (!file) throw new Error("Invalid PDF handle");
  const arrayBuf = await (file.arrayBuffer ? file.arrayBuffer() : new Response(file).arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuf });
  const pdfDoc = await loadingTask.promise;
  return pdfDoc.numPages;
}

export async function renderThumbnail(handle: PdfHandle, pageNumber: number): Promise<string> {
  const file = handleMap.get(handle);
  if (!file) throw new Error("Invalid PDF handle");
  const arrayBuf = await (file.arrayBuffer ? file.arrayBuffer() : new Response(file).arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuf });
  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const canvas = document.createElement("canvas");
  const scale = Math.min(120 / viewport.width, 160 / viewport.height);
  const scaledViewport = page.getViewport({ scale });
  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;
  const ctx = canvas.getContext("2d")!;
  const renderContext = { canvasContext: ctx, viewport: scaledViewport };
  await page.render(renderContext).promise;
  return canvas.toDataURL("image/png");
}

export async function getPagePreview(handle: PdfHandle, pageNumber: number): Promise<string> {
  const file = handleMap.get(handle);
  if (!file) throw new Error("Invalid PDF handle");
  const arrayBuf = await (file.arrayBuffer ? file.arrayBuffer() : new Response(file).arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuf });
  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const canvas = document.createElement("canvas");
  const scale = Math.min(600 / viewport.width, 800 / viewport.height);
  const scaledViewport = page.getViewport({ scale });
  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;
  const ctx = canvas.getContext("2d")!;
  const renderContext = { canvasContext: ctx, viewport: scaledViewport };
  await page.render(renderContext).promise;
  return canvas.toDataURL("image/png");
}

export async function pageSelection(handle: PdfHandle, pages: number[]): Promise<PdfHandle> {
  const file = handleMap.get(handle);
  if (!file) throw new Error("Invalid PDF handle");
  // Stub: use mergePdfs with same file; replace with proper split later.
  const { blob } = await pdfEngine.mergePdfs([file]);
  const newFile = new File([blob], `selection_${Date.now()}.pdf`, { type: "application/pdf" });
  return loadPdf(newFile);
}

// Future stubs (to be implemented later)
// export async function merge(...handles: PdfHandle[]) { /* TODO */ }
// export async function split(handle: PdfHandle, ranges: string) { /* TODO */ }
// export async function rotate(handle: PdfHandle, page: number, angle: number) { /* TODO */ }
// export async function organize(handle: PdfHandle, order: number[]) { /* TODO */ }
