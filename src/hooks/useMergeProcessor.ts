// src/hooks/useMergeProcessor.ts
import { useCallback, useState } from "react";
import type { PdfJobResult } from "@/hooks/usePdfJob";
import { mergePdfs } from "@/lib/pdf";

export interface UseMergeProcessorReturn {
  progress: number;
  state: "idle" | "processing" | "success" | "error";
  result: PdfJobResult | null;
  error: string | null;
  runMerge: (files: File[]) => Promise<void>;
  reset: () => void;
}

export function useMergeProcessor(): UseMergeProcessorReturn {
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [result, setResult] = useState<PdfJobResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setProgress(0);
    setState("idle");
    setResult(null);
    setError(null);
  }, []);

  const runMerge = useCallback(async (files: File[]) => {
    reset();
    setState("processing");
    setProgress(20);
    try {
      const { blob, filename } = await mergePdfs(files);
      setResult({ filename, blob });

      setProgress(100);
      setState("success");
    } catch (e: any) {
      setError(e?.message ?? "Merge failed");
      setState("error");
      setProgress(0);
    }
  }, [reset]);

  return { progress, state, result, error, runMerge, reset };
}

