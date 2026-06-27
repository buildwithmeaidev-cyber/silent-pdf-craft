// src/toolsConfig.ts
// Configuration mapping for all SilentPDF tools used by the unified <ToolPage /> component.
// Each entry defines UI text, processing hook method name, and download filename.

interface ToolConfig {
  title: string; // Display title in the page header
  description: string; // Short description shown under the title
  uploadDescription: string; // Helper text for the upload dropzone
  actionLabel: string; // Label for the primary action button
  process: keyof ReturnType<typeof import('./hooks/useRealPdfProcess').useRealPdfProcess>; // Hook method name
  downloadName: string; // Default filename for the generated output
  minFiles?: number; // Minimum number of files required to enable action
}

const toolsConfig: Record<string, ToolConfig> = {
  merge: {
    title: 'Merge PDFs',
    description: 'Combine multiple PDF files into a single document.',
    uploadDescription: 'Drag & drop PDFs you want to merge, or click to select files.',
    actionLabel: 'Merge PDFs',
    process: 'mergePDFs',
    downloadName: 'merged.pdf',
    minFiles: 2,
  },
  compress: {
    title: 'Compress PDF',
    description: 'Reduce the file size of a PDF while preserving quality.',
    uploadDescription: 'Upload a PDF to compress.',
    actionLabel: 'Compress PDF',
    process: 'compressPDFs',
    downloadName: 'compressed.pdf',
    minFiles: 1,
  },
  split: {
    title: 'Split PDF',
    description: 'Split a PDF into separate pages or ranges.',
    uploadDescription: 'Upload a PDF to split.',
    actionLabel: 'Split PDF',
    process: 'splitPDFs',
    downloadName: 'split.pdf',
    minFiles: 1,
  },
  rotate: {
    title: 'Rotate PDF Pages',
    description: 'Rotate pages of a PDF document.',
    uploadDescription: 'Upload a PDF to rotate.',
    actionLabel: 'Rotate PDF',
    process: 'rotatePDFs',
    downloadName: 'rotated.pdf',
    minFiles: 1,
  },
  protect: {
    title: 'Protect PDF',
    description: 'Add password protection to a PDF.',
    uploadDescription: 'Upload a PDF to protect.',
    actionLabel: 'Protect PDF',
    process: 'protectPDFs',
    downloadName: 'protected.pdf',
    minFiles: 1,
  },
  unlock: {
    title: 'Unlock PDF',
    description: 'Remove password protection from a PDF.',
    uploadDescription: 'Upload a protected PDF to unlock.',
    actionLabel: 'Unlock PDF',
    process: 'unlockPDFs',
    downloadName: 'unlocked.pdf',
    minFiles: 1,
  },
  watermark: {
    title: 'Add Watermark',
    description: 'Apply a textual watermark to a PDF.',
    uploadDescription: 'Upload a PDF to watermark.',
    actionLabel: 'Add Watermark',
    process: 'watermarkPDFs',
    downloadName: 'watermarked.pdf',
    minFiles: 1,
  },
  removewatermark: {
    title: 'Remove Watermark',
    description: 'Strip watermark from a PDF.',
    uploadDescription: 'Upload a watermarked PDF to clean.',
    actionLabel: 'Remove Watermark',
    process: 'removeWatermarkPDFs',
    downloadName: 'clean.pdf',
    minFiles: 1,
  },
  // Alias entries for legacy hyphenated routes (fallback generic route)
  'merge-pdf': {
    ...toolsConfig['merge'],
  },
  'split-pdf': {
    ...toolsConfig['split'],
  },
  'compress-pdf': {
    ...toolsConfig['compress'],
  },
  'protect-pdf': {
    ...toolsConfig['protect'],
  },
  'watermark-pdf': {
    ...toolsConfig['watermark'],
  },
  'photo-to-pdf': {
    ...toolsConfig['photoToPdf'] || toolsConfig['photoToPdf'] /* placeholder */,
  },
  'export-pdf': {
    ...toolsConfig['export'] || toolsConfig['export'] /* placeholder */,
  },
  'pdf-to-word': {
    ...toolsConfig['pdfToWord'] || toolsConfig['pdfToWord'] /* placeholder */,
  },
  'word-to-pdf': {
    ...toolsConfig['wordToPdf'] || toolsConfig['wordToPdf'] /* placeholder */,
  },
  'addpages-pdf': {
    ...toolsConfig['addpages'] || toolsConfig['addpages'] /* placeholder */,
  },
  'removewatermark-pdf': {
    ...toolsConfig['removewatermark'],
  },
  'rotatepages-pdf': {
    ...toolsConfig['rotate'] || toolsConfig['rotatepages'] /* placeholder */,
  },
  // End of alias entries
  // Add more tool configurations here as needed.
};

export default toolsConfig;
