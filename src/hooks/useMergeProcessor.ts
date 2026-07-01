// src/hooks/useMergeProcessor.ts
import { useCallback, useRef, useState } from "react";
import type { PdfJobResult } from "@/hooks/usePdfJob";

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
  const workerRef = useRef<Worker | null>(null);

  const reset = useCallback(() => {
    setProgress(0);
    setState("idle");
    setResult(null);
    setError(null);
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  const runMerge = useCallback(async (files: File[]) => {
    reset();
    setState("processing");
    setProgress(10);
    // Create worker (module type)
    const worker = new Worker(new URL("../workers/mergeWorker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const data = e.data as { type: string; payload?: any };
      if (data.type === "progress") {
        setProgress(data.payload);
      } else if (data.type === "result") {
        const { filename, blob } = data.payload as PdfJobResult;
        setResult({ filename, blob });
        setProgress(100);
        setState("success");
        worker.terminate();
        workerRef.current = null;
      } else if (data.type === "error") {
        setError(data.payload);
        setState("error");
        setProgress(0);
        worker.terminate();
        workerRef.current = null;
      }
    };

    const fileData = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return { name: file.name, buffer: arrayBuffer };
      })
    );
    worker.postMessage({ files: fileData });
  }, [reset]);

  return { progress, state, result, error, runMerge, reset };
}
