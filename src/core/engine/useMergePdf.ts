// src/core/engine/useMergePdf.ts

/**
 * Hook for performing a PDF merge operation using the shared PDF engine.
 * It leverages the generic `useToolProcessor` hook to expose loading,
 * progress, error, success and a download URL to consuming UI components.
 *
 * Example usage in a React component:
 *   const { state, start, setError, setSuccess, setDownloadUrl, reset } =
 *     useMergePdf();
 *   const handleMerge = async (files: File[]) => {
 *     reset();
 *     start();
 *     try {
 *       const result = await mergePdf(files);
 *       setDownloadUrl(result.url);
 *       setSuccess();
 *     } catch (e) {
 *       setError(e instanceof Error ? e.message : String(e));
 *     }
 *   };
 */
import { useToolProcessor } from './useToolProcessor';
import { pdfEngine } from './pdfEngine';

/**
 * Executes the merge operation using the underlying pdfEngine.
 * Returns the same shape as `pdfEngine.mergePdfs`.
 */
export async function mergePdf(files: File[]): Promise<{ filename: string; blob: Blob; url: string }> {
  // Directly delegate to the engine – any future enhancements (e.g., progress) can be added here.
  return pdfEngine.mergePdfs(files);
}

/**
 * React hook that wraps the merge operation and wires it to a `ToolState`.
 */
export function useMergePdf() {
  const {
    state,
    reset,
    start,
    setProgress,
    setError,
    setSuccess,
    setDownloadUrl,
  } = useToolProcessor();

  const execute = async (files: File[]) => {
    reset();
    start();
    try {
      // At the moment pdfEngine does not emit progress callbacks.
      // setProgress can be used in future implementations.
      const result = await mergePdf(files);
      setDownloadUrl(result.url);
      setSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return { state, execute, reset };
}
