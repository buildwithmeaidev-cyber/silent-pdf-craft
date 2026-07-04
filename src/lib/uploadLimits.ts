// Per-tool upload caps.
import type { ToolKind } from "@/lib/tools";

const LARGE_KINDS: ToolKind[] = ["compress", "split", "pdf-to-word", "word-to-pdf", "merge"];

export function capMbFor(kind?: ToolKind): number {
  if (!kind) return 50;
  return LARGE_KINDS.includes(kind) ? 100 : 50;
}

export function capBytesFor(kind?: ToolKind): number {
  return capMbFor(kind) * 1024 * 1024;
}

// Back-compat exports (still used by WorkflowRunner)
export const MAX_UPLOAD_MB = 100;
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

export function checkUploadSize(files: File[], cap = MAX_UPLOAD_BYTES) {
  const oversized: File[] = [];
  const accepted: File[] = [];
  for (const f of files) {
    if (f.size > cap) oversized.push(f);
    else accepted.push(f);
  }
  return { accepted, oversized };
}
