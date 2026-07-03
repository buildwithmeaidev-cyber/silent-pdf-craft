// Shared upload constraints for all upload surfaces (tool pages + workflow runner).
export const MAX_UPLOAD_MB = 50;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export function checkUploadSize(files: File[]): { accepted: File[]; oversized: File[] } {
  const oversized: File[] = [];
  const accepted: File[] = [];
  for (const f of files) {
    if (f.size > MAX_UPLOAD_BYTES) oversized.push(f);
    else accepted.push(f);
  }
  return { accepted, oversized };
}
