// src/types/ToolConfig.ts

/**
 * Enumerates the kinds of tools available in SilentPDF AI.
 */
export type ToolKind =
  | "merge"
  | "split"
  | "rotate"
  | "remove"
  | "compress"
  | "protect"
  | "pdfToWord"
  | "wordToPdf"
  | "ocr"
  | "imageConvert"
  | "watermark"
  | "encrypt";

/**
 * Common options shared by many tools.
 */
export interface BaseOptions {
  /** Optional password for protected PDFs. */
  password?: string;
  /** Optional compression level for the compress tool. */
  compressionLevel?: "light" | "medium" | "strong" | "custom";
  /** Quality (0‑100) used when compressionLevel === "custom". */
  customQuality?: number;
  /** Page range string (e.g., "1-3,5") used by split, rotate, remove. */
  range?: string;
  /** Rotation angle in degrees for rotate tool. */
  rotation?: number;
  /** Watermark text for watermark tool. */
  watermarkText?: string;
}

/**
 * Full configuration passed to the processing engine.
 */
export interface ToolConfig {
  /** Which tool is being executed. */
  kind: ToolKind;
  /** Array of File objects supplied by the user. */
  files: File[];
  /** Tool‑specific options. */
  options?: BaseOptions;
}

/**
 * Result returned by the processing engine.
 */
export interface ProcessResult {
  /** Resulting Blob (PDF, Word, image, etc.). */
  blob: Blob;
  /** Suggested filename for the download. */
  filename: string;
}
