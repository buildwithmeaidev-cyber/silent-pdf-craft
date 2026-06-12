// src/hooks/usePdfJob.ts
// Generic PDF job hook used by ToolPage. Accepts a callback that performs the
// actual work and returns a { filename, blob } result.
import { useCallback, useRef, useState } from "react";

export interface PdfJobResult {
  filename: string;
  blob: Blob;
}

export type PdfJobState = "idle" | "uploading" | "processing" | "success" | "error";

export interface UsePdfJobReturn {
  progress: number;
  state: PdfJobState;
  result: PdfJobResult | null;
  error: string | null;
  run: (fn: () => Promise<PdfJobResult>) => Promise<void>;
  cancel: () => void;
  reset: () => void;
  setState: (s: PdfJobState) => void;
  setError: (e: string | null) => void;
  setProgress: (p: number) => void;
  setResult: (r: PdfJobResult | null) => void;
}

export function usePdfJob(): UsePdfJobReturn {
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<PdfJobState>("idle");
  const [result, setResult] = useState<PdfJobResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastBlobUrl = useRef<string | null>(null);

  const reset = useCallback(() => {
    setProgress(0);
    setState("idle");
    setResult(null);
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    reset();
  }, [reset]);

  const run = useCallback(async (fn: () => Promise<PdfJobResult>) => {
    setError(null);
    setResult(null);
    setState("uploading");
    setProgress(10);
    try {
      setState("processing");
      setProgress(50);
      const res = await fn();
      if (lastBlobUrl.current) {
        URL.revokeObjectURL(lastBlobUrl.current);
        lastBlobUrl.current = null;
      }
      setResult(res);
      setProgress(100);
      setState("success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error while processing PDF.";
      setError(msg);
      setState("error");
      setProgress(0);
    }
  }, []);

  return { progress, state, result, error, run, cancel, reset, setState, setError, setProgress, setResult };
}
