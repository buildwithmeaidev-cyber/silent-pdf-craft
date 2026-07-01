import { ToolKind } from '@/types/ToolConfig';

export const workerMap: Record<ToolKind, string> = {
  merge: '../workers/mergeWorker.ts',
  split: '../workers/splitWorker.ts',
  rotate: '../workers/rotateWorker.ts',
  remove: '../workers/removeWorker.ts',
  compress: '../workers/compressWorker.ts',
  protect: '../workers/protectWorker.ts',
  pdfToWord: '../workers/pdfToWordWorker.ts',
  wordToPdf: '../workers/wordToPdfWorker.ts',
  ocr: '../workers/ocrWorker.ts',
  imageConvert: '../workers/imageConvertWorker.ts',
  watermark: '../workers/watermarkWorker.ts',
  encrypt: '../workers/encryptWorker.ts',
};
