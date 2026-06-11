// src/core/engine/withWorkerError.ts
// Simple helper that catches worker rejections and throws a normalized Error.
export async function withWorkerError<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (e: any) {
    // If the worker sent an {error: string}, it will surface as a rejected promise.
    // Normalise to an Error instance with a clear message.
    if (e instanceof Error) {
      throw e;
    }
    throw new Error(e?.message ?? 'Unknown worker error');
  }
}
