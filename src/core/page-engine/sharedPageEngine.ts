// src/core/page-engine/sharedPageEngine.ts
/**
 * Shared Page Engine – thin, reusable PDF utilities.
 * All functions work with a PdfHandle that maps to raw Uint8Array bytes.
 * Heavy‑weight operations are delegated to `processTool`.
 */

import { PDFDocument } from "pdf-lib";

import { pdfEngine } from "../engine/pdfEngine";
import { processTool } from "../pdf/pdfOperations";

export type PdfHandle = string;

// Internal map: handle → raw PDF bytes (Uint8Array)
// Internal map: handle → raw PDF bytes (Uint8Array)
const handleMap = new Map<PdfHandle, Uint8Array>();
// Map to store precomputed page counts for each handle
const pageCountMap = new Map<PdfHandle, number>();

function uuid(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

/** Load a File/Blob (or Uint8Array) and obtain a handle */
export async function loadPdf(source: File | Blob | Uint8Array): Promise<PdfHandle> {
  const id = uuid();
  let bytes: Uint8Array;
  if (source instanceof Uint8Array) {
    bytes = source;
  } else {
    // Use Response to extract array buffer for File/Blob
    const buf = await new Response(source).arrayBuffer();
    bytes = new Uint8Array(buf);
  }
  // Precompute page count
  const pdfDoc = await PDFDocument.load(bytes);
  const pageCount = pdfDoc.getPageCount();
  pageCountMap.set(id, pageCount);
  handleMap.set(id, bytes);
  return id;
}

export async function getPageCount(handle: PdfHandle): Promise<number> {
  const count = pageCountMap.get(handle);
  if (count !== undefined) return count;
  const data = handleMap.get(handle);
  if (!data) throw new Error('Invalid PDF handle');
  const pdfDoc = await PDFDocument.load(data);
  const pageCount = pdfDoc.getPageCount();
  pageCountMap.set(handle, pageCount);
  return pageCount;
}

export async function renderThumbnail(handle: PdfHandle, page: number): Promise<string> {
  // Placeholder for browser implementation; returns empty string in Node.
  return '';
}

export async function getPagePreview(handle: PdfHandle, page: number): Promise<string> {
  // Placeholder for browser implementation; returns empty string in Node.
  return '';
}

/** Keep only the selected pages – currently uses merge as a simple stub */
export async function pageSelection(handle: PdfHandle, pages: number[]): Promise<PdfHandle> {
  const data = handleMap.get(handle);
  if (!data) throw new Error('Invalid PDF handle');

  // Temporary: merge the original PDF as a placeholder.
  const { blob } = await pdfEngine.mergePdfs([data]);
  const newFile = new File([blob], `selection_${Date.now()}.pdf`, { type: 'application/pdf' });
  return loadPdf(newFile);
}

/* ---------- Future API Stubs (thin wrappers) ---------- */
export async function merge(files: File[]): Promise<{ filename: string; blob: Blob; url: string }> {
  // Delegates to universal dispatcher
  return await processTool({ type: 'merge', files });
}

export async function split(handle: PdfHandle, ranges: string): Promise<PdfHandle> {
  return await processTool({ type: 'split', handle, ranges });
}

export async function rotate(handle: PdfHandle, page: number, angle: number): Promise<PdfHandle> {
  return await processTool({ type: 'rotate', handle, page, angle });
}

export async function organize(handle: PdfHandle, order: number[]): Promise<PdfHandle> {
  return await processTool({ type: 'organize', handle, order });
}
