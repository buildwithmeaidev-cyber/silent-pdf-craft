// src/workers/WorkerManager.ts

/**
 * Utility to manage web workers for heavy PDF/Word operations.
 * Provides a unified Promise‑based API that handles progress, cancellation,
 * error propagation and automatic termination.
 */
export class WorkerManager {
  private worker: Worker | null = null;
  private abortController: AbortController | null = null;

  /**
   * Run a worker script with given payload.
   * @param scriptPath Relative path to the worker file (e.g. "../workers/mergeWorker.ts").
   * @param payload Data sent to the worker.
   * @param callbacks Optional callbacks for progress and cancellation.
   */
  run<T>(
    scriptPath: string,
    payload: any,
    callbacks?: {
      onProgress?: (percent: number, message?: string) => void;
      signal?: AbortSignal;
    }
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Create a fresh abort controller if not supplied
      const signal = callbacks?.signal || new AbortController().signal;
      this.abortController = new AbortController();

      // Resolve worker URL relative to this file
      const workerUrl = new URL(scriptPath, import.meta.url);
      this.worker = new Worker(workerUrl, { type: "module" });

      const cleanup = () => {
        this.worker?.terminate();
        this.worker = null;
        this.abortController = null;
      };

      // Listen for messages from the worker
      this.worker.onmessage = (e: MessageEvent) => {
        const data = e.data;
        if (data.type === "progress" && callbacks?.onProgress) {
          callbacks.onProgress(data.percent, data.message);
          return;
        }
        if (data.type === "result") {
          cleanup();
          resolve(data.payload as T);
        }
        if (data.type === "error") {
          cleanup();
          reject(new Error(data.message));
        }
      };

      this.worker.onerror = (e: ErrorEvent) => {
        cleanup();
        reject(e.error || new Error(e.message));
      };

      // Support cancellation via AbortSignal
      signal.addEventListener("abort", () => {
        if (this.worker) {
          this.worker.postMessage({ type: "cancel" });
        }
        cleanup();
        reject(new Error("Operation cancelled"));
      });

      // Start worker
      this.worker.postMessage({ type: "init", payload });
    });
  }
}
