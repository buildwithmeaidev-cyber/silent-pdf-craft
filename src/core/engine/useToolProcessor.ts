// src/core/engine/useToolProcessor.ts
import { useState, useCallback, useMemo } from "react";
import { PDFDocument } from "pdf-lib";
// (file-saver removed; using anchor download instead)

/**
 * Shared hook for managing the lifecycle state of any PDF tool operation.
 * It is deliberately framework‑agnostic – it only relies on React's built‑in state
 * handling and can be consumed by UI components, custom hooks or other logic that
 * needs to report loading, progress, errors, success and a downloadable URL.
 */
import { useCallback, useRef, useState } from 'react';

/**
 * Shape of the state exposed by the hook.
 */
export interface ToolState {
  /** True while the tool is executing */
  loading: boolean;
  /** Progress as a percentage (0‑100). Undefined when not applicable. */
  progress?: number;
  /** Error message – populated when the tool fails. */
  error?: string;
  /** Success flag – true when the operation finished without errors. */
  success: boolean;
  /** URL to the generated Blob (e.g. merged PDF). */
  downloadUrl?: string;
}

/**
 * Helper return type – the hook returns the current state plus a set of
 * mutators that can be used by the consuming code.
 */
export interface UseToolProcessorReturn {
  state: ToolState;
  /** Reset all fields to the initial state. */
  reset: () => void;
  /** Mark the operation as loading. */
  start: () => void;
  /** Update progress – value should be between 0 and 100. */
  setProgress: (pct: number) => void;
  /** Store an error message. */
  setError: (msg: string) => void;
  /** Mark the operation as successful. */
  setSuccess: () => void;
  /** Set the downloadable URL (usually created with URL.createObjectURL). */
  setDownloadUrl: (url: string) => void;
}

/**
 * useToolProcessor – a reusable hook for PDF‑related tool calls.
 *
 * Example usage in a component:
 *   const { state, start, setProgress, setError, setSuccess, setDownloadUrl, reset } =
 *     useToolProcessor();
 *   // trigger async work
 *   start();
 *   pdfEngine.mergePdfs(files)
 *     .then(r => { setDownloadUrl(r.url); setSuccess(); })
 *     .catch(e => setError(e.message));
 */
export function useToolProcessor(): UseToolProcessorReturn {
  const [state, setState] = useState<ToolState>({
    loading: false,
    progress: undefined,
    error: undefined,
    success: false,
    downloadUrl: undefined,
  });

  // Keep a stable reference to the latest state setter for callbacks.
  const stateRef = useRef(state);
  stateRef.current = state;

  const reset = useCallback(() => {
    setState({
      loading: false,
      progress: undefined,
      error: undefined,
      success: false,
      downloadUrl: undefined,
    });
  }, []);

  const start = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: undefined, success: false }));
  }, []);

  const setProgress = useCallback((pct: number) => {
    setState((prev) => ({ ...prev, progress: Math.min(100, Math.max(0, pct)) }));
  }, []);

  const setError = useCallback((msg: string) => {
    setState((prev) => ({ ...prev, loading: false, error: msg, success: false }));
  }, []);

  const setSuccess = useCallback(() => {
    setState((prev) => ({ ...prev, loading: false, success: true, error: undefined }));
  }, []);

  const setDownloadUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, downloadUrl: url }));
  }, []);

  return { state, reset, start, setProgress, setError, setSuccess, setDownloadUrl };
}
