// src/hooks/usePdfJob.ts
// Unified PDF job hook that wraps pdfEngine calls, provides progress, cancellation, and automatic Blob URL revocation.
import { useState, useCallback, useRef } from "react";
import { pdfEngine } from "@/core/engine/pdfEngine"; // singleton worker
import { withWorkerError } from "@/core/engine/withWorkerError";

/**
 * Types of jobs supported by the engine.
 */
type PdfJobKind =
  | "merge"
  | "split"
  | "rotate"
  | "remove"
  | "compress"
  | "protect"
  | "export"
  | "addPages"
  | "watermark"
  | "photoToPdf"
  | "pdfToWord"
  | "wordToPdf";

/**
 * Parameters passed to the job hook.
 */
export interface PdfJobOptions {
  kind: PdfJobKind;
  files: File[]; // input files
  // optional extra parameters per kind
  range?: string;
  password?: string;
  rotation?: 90 | 180 | 270;
  compressionLevel?: "low" | "medium" | "high" | "custom";
  customQuality?: number; // 0‑100
}

/**
 * Result returned by the engine.
 */
export interface PdfJobResult {
  filename: string;
  blob: Blob;
}

/**
 * Hook return value.
 */
export interface UsePdfJobReturn {
  /** Current progress 0‑100 */
  progress: number;
  /** Current state */
  state: "idle" | "running" | "success" | "error";
  /** Result on success */
  result: PdfJobResult | null;
  /** Error message */
  error: string | null;
  /** Start the job */
  run: (options: PdfJobOptions) => Promise<void>;
  /** Cancel the job (terminates worker task) */
  cancel: () => void;
}

/**
 * usePdfJob – a reusable hook for any PDF processing task.
 */
export function usePdfJob(): UsePdfJobReturn {
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<"idle" | "running" | "success" | "error">(
    "idle"
  );
  const [result, setResult] = useState<PdfJobResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState("idle");
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  const run = useCallback(async (options: PdfJobOptions) => {
    cancel(); // reset any previous job
    setState("running");
    setProgress(10);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      // map options.kind to the corresponding pdfEngine method
      const methodMap: Record<PdfJobKind, any> = {
        merge: pdfEngine.mergePdfs,
        split: pdfEngine.splitPdf,
        rotate: pdfEngine.rotatePdf,
        remove: pdfEngine.removePages,
        compress: pdfEngine.compressPdf,
        protect: pdfEngine.protectPdf,
        export: pdfEngine.exportPdf,
        addPages: pdfEngine.addPages,
        watermark: pdfEngine.addWatermark,
        photoToPdf: pdfEngine.photoToPdf,
        pdfToWord: pdfEngine.pdfToWord,
        wordToPdf: pdfEngine.wordToPdf,
      } as const;

      const fn = methodMap[options.kind];
      if (!fn) {
        throw new Error(`Unsupported PDF job kind: ${options.kind}`);
      }

      // Forward the call to the worker; each engine method must accept the same abort signal.
      const res = await withWorkerError(
        fn(
          options.files,
          {
            range: options.range,
            password: options.password,
            rotation: options.rotation,
            compressionLevel: options.compressionLevel,
            customQuality: options.customQuality,
          },
          controller.signal
        )
      );

      // revoking any previous blob URL to avoid memory leaks
      if (result?.blob) {
        URL.revokeObjectURL(result.blob as any);
      }

      setResult({ filename: res.filename, blob: res.blob });
      setProgress(100);
      setState("success");
    } catch (e: any) {
      if (e.name === "AbortError") {
        setError("Operation cancelled by user.");
      } else {
        setError(e?.message ?? "Unexpected error while processing PDF.");
      }
      setState("error");
    } finally {
      setProgress(0);
    }
  }, [cancel, result]);

  return { progress, state, result, error, run, cancel };
}
