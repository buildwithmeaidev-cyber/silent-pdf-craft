// Feature flags for staged rollout of larger surfaces.
// Toggle these to enable or hide new tool/editor/OCR/worker surfaces
// without shipping half-built UI to prod.
export const featureFlags = {
  pdfEditorV2: false,   // fabric.js overlay editor
  ocr: false,           // tesseract.js OCR pipeline
  workerOffload: false, // Comlink worker for heavy pdf jobs
  smoothScroll: false,  // Lenis global smooth scroll
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
