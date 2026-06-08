import * as pdfjsLib from 'pdfjs-dist';

// Set up pdf.js worker using Vite's asset URL resolver
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export { pdfjsLib };

/**
 * Converts a File object to an ArrayBuffer
 */
export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

/**
 * Downloads a binary buffer as a file in the browser
 */
export function downloadFile(bytes: Uint8Array | ArrayBuffer, filename: string, mimeType: string = 'application/pdf') {
  const blob = new Blob([bytes as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Helper to format file size in a readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Renders all pages of a PDF to data URLs for visualization
 */
export async function loadPdfPages(buf: ArrayBuffer, scale: number = 0.8) {
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const numPages = pdf.numPages;
  const pages = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      await page.render({ canvasContext: ctx, viewport }).promise;
    }
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    pages.push({
      dataUrl,
      pageNum: i,
      originalIndex: i - 1,
    });
  }

  return { pages };
}

/**
 * Renders page thumbnails for drag-and-drop/reorder components
 */
export async function loadPdfThumbnails(buf: ArrayBuffer, scale: number = 0.4) {
  const { pages } = await loadPdfPages(buf, scale);
  return { thumbs: pages };
}
