// src/core/page-engine/pageEngine.ts
/**
 * Backwards‑compatible forwarding module.
 * All page‑engine functionality now lives in `sharedPageEngine.ts`.
 * This file re‑exports the same symbols so existing imports continue to work.
 */
const handleMap = new Map<PdfHandle, File>();

export { loadPdf, getPageCount, renderThumbnail, getPagePreview, pageSelection, merge, split, rotate, organize } from "./sharedPageEngine";
