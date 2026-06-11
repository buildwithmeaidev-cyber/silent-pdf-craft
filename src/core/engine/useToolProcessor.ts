// src/core/engine/useToolProcessor.ts
import { useState, useCallback, useMemo } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver"; // for download helper

// Types for processed PDF
interface ProcessedPdf {
  doc: PDFDocument;
  thumbnails: string[]; // Blob URLs for each page preview
  size: number; // original size in bytes
}

// Simple in‑memory cache keyed by a unique file fingerprint
const pdfCache = new Map<string, ProcessedPdf>();

// Utility to generate a fingerprint (name+size+lastModified)
function fingerprint(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

/**
 * useToolProcessor – shared hook for all PDF operations.
 * All heavy work runs in a Web Worker (pdfWorker.js) to keep the UI responsive.
 * The worker script is generated on‑the‑fly when the hook is first used.
 */
export function useToolProcessor() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Lazily create a worker; reuse across calls.
  const workerRef = useMemo(() => {
    // Inline worker code as a Blob URL
    const workerCode = `self.onmessage = async (e) => {
      const { id, action, payload } = e.data;
      try {
        if (action === "loadPdf") {
          const { file } = payload;
          const array = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(array);
          const pageCount = pdfDoc.getPageCount();
          // generate simple thumbnail (first page) as base64 JPEG via canvas in main thread later
          self.postMessage({ id, result: { pageCount } });
        } else if (action === "mergePdfs") {
          const { files } = payload; // File[]
          const merged = await PDFDocument.create();
          for (const f of files) {
            const arr = await f.arrayBuffer();
            const doc = await PDFDocument.load(arr);
            const copied = await merged.copyPages(doc, doc.getPageIndices());
            copied.forEach((p) => merged.addPage(p));
          }
          const bytes = await merged.save();
          const blob = new Blob([bytes], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          self.postMessage({ id, result: { url } });
        }
        // Additional actions (extractText, generateThumbnail) can be added here.
      } catch (err) {
        self.postMessage({ id, error: (err as any).message || "Unknown error" });
      }
    };`;
    const blob = new Blob([workerCode], { type: "application/javascript" });
    return new Worker(URL.createObjectURL(blob));
  }, []);

  // Helper to send a request to the worker and await response
  const postWorker = useCallback(
    (action: string, payload: any) =>
      new Promise<any>((resolve, reject) => {
        const id = crypto.randomUUID();
        const handle = (e: MessageEvent) => {
          if (e.data.id !== id) return;
          workerRef.removeEventListener("message", handle);
          if (e.data.error) reject(new Error(e.data.error));
          else resolve(e.data.result);
        };
        workerRef.addEventListener("message", handle);
        workerRef.postMessage({ id, action, payload });
      }),
    [workerRef]
  );

  /** Load a PDF, cache it, and return its fingerprint. */
  const loadPdf = useCallback(
    async (file: File) => {
      setLoading(true);
      setMessage("Loading PDF…");
      const key = fingerprint(file);
      if (pdfCache.has(key)) {
        setMessage("PDF loaded from cache.");
        setLoading(false);
        return pdfCache.get(key)!;
      }
      try {
        // Use worker for heavy parsing
        const result = await postWorker("loadPdf", { file });
        const array = await file.arrayBuffer();
        const doc = await PDFDocument.load(array);
        const processed: ProcessedPdf = { doc, thumbnails: [], size: file.size };
        pdfCache.set(key, processed);
        setMessage(`PDF (${result.pageCount} pages) loaded.`);
        setLoading(false);
        return processed;
      } catch (e) {
        setError((e as Error).message);
        setLoading(false);
        throw e;
      }
    },
    [postWorker]
  );

  /** Merge multiple PDFs into a single document. Returns a download URL. */
  const mergePdfs = useCallback(
    async (files: File[]) => {
      setLoading(true);
      setMessage("Merging PDFs…");
      try {
        const { url } = await postWorker("mergePdfs", { files });
        // Revoke previous URL if any
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(url);
        setMessage(`Merged ${files.length} PDFs – ready to download.`);
        setLoading(false);
        return url;
      } catch (e) {
        setError((e as Error).message);
        setLoading(false);
        throw e;
      }
    },
    [postWorker, downloadUrl]
  );

  /** Simple validation – ensures PDF type and size limits (e.g., 200 MB). */
  const validateFile = useCallback((file: File): string | null => {
    if (file.type !== "application/pdf") return "File is not a PDF.";
    if (file.size > 200 * 1024 * 1024) return "File exceeds 200 MB size limit.";
    return null;
  }, []);

  /** Clean all cached PDFs and revoke any Blob URLs. */
  const clearCache = useCallback(() => {
    pdfCache.forEach((value) => {
      value.thumbnails.forEach((url) => URL.revokeObjectURL(url));
    });
    pdfCache.clear();
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    setMessage("");
    setError("");
  }, [downloadUrl]);

  /** Utility to trigger a download from a Blob URL. */
  const triggerDownload = useCallback((url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    // Revoke after short delay to ensure download starts
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, []);

  return {
    loading,
    message,
    error,
    downloadUrl,
    loadPdf,
    mergePdfs,
    validateFile,
    clearCache,
    triggerDownload,
    setError,
    setMessage,
  };
}
