import { pdfEngine } from "../core/engine/pdfEngine";

/**
 * Service layer for PDF processing operations.
 * Provides a stable API for higher-level components.
 */
export const pdfProcessor = {
  mergePdfs: pdfEngine.mergePdfs,
  // Future methods will delegate to the corresponding pdfEngine methods
  // Example: splitPdf: pdfEngine.splitPdf,
};
