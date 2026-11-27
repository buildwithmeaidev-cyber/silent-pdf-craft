// src/hooks/usePdfJob.ts
// Generic cooperative-cancellation PDF job hook used by ToolPage.
import { useCallback, useEffect, useRef, useState } from "react";
import { isJobCancelledError } from "@/lib/pdfGuards";

export interface PdfJobResult {
  filename: string;
  blob: Blob;
}

export type PdfJobState =
  | "idle"
  | "uploading"
  | "processing"
  | "cancelling"
  | "cancelled"
  | "success"
  | "error";

export interface PdfJobRunContext {
  signal: AbortSignal;
  setProgress: (p: number) => void;
}

export interface UsePdfJobReturn {
  progress: number;
  state: PdfJobState;
  result: PdfJobResult | null;
  error: string | null;
  run: (fn: (ctx: PdfJobRunContext) => Promise<PdfJobResult>) => Promise<void>;
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

  const abortRef = useRef<AbortController | null>(null);
  const runIdRef = useRef(0);
  const lastBlobUrl = useRef<string | null>(null);

  const revokeLastUrl = useCallback(() => {
    if (lastBlobUrl.current) {
      URL.revokeObjectURL(lastBlobUrl.current);
      lastBlobUrl.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokeLastUrl();
    };
  }, [revokeLastUrl]);

  const reset = useCallback(() => {
    runIdRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    revokeLastUrl();
    setProgress(0);
    setState("idle");
    setResult(null);
    setError(null);
  }, [revokeLastUrl]);

  const cancel = useCallback(() => {
    const controller = abortRef.current;
    if (!controller || controller.signal.aborted) {
      return;
    }
    controller.abort();
    // Honestly communicate that the active synchronous step finishes before stopping.
    setState("cancelling");
  }, []);

  const run = useCallback(
    async (fn: (ctx: PdfJobRunContext) => Promise<PdfJobResult>) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const runId = ++runIdRef.current;

      setError(null);
      setResult(null);
      setState("uploading");
      setProgress(10);

      const safeSetProgress = (p: number) => {
        if (runIdRef.current === runId && !controller.signal.aborted) {
          setProgress(Math.max(0, Math.min(100, p)));
        }
      };

      try {
        if (controller.signal.aborted) {
          setState("cancelled");
          setProgress(0);
          return;
        }
        setState("processing");
        safeSetProgress(35);

        const res = await fn({ signal: controller.signal, setProgress: safeSetProgress });

        if (runIdRef.current !== runId || controller.signal.aborted) {
          if (runIdRef.current === runId) {
            setState("cancelled");
            setProgress(0);
          }
          return;
        }

        revokeLastUrl();
        setResult(res);
        setProgress(100);
        setState("success");
      } catch (e) {
        if (runIdRef.current !== runId) return;
        if (controller.signal.aborted || isJobCancelledError(e)) {
          setError(null);
          setState("cancelled");
          setProgress(0);
          return;
        }
        const msg = e instanceof Error ? e.message : "Unexpected error while processing PDF.";
        setError(msg);
        setState("error");
        setProgress(0);
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [revokeLastUrl],
  );

  return {
    progress,
    state,
    result,
    error,
    run,
    cancel,
    reset,
    setState,
    setError,
    setProgress,
    setResult,
  };
}
