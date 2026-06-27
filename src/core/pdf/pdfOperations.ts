// src/core/pdf/pdfOperations.ts
// Universal PDF Engine – shared API

import { pdfEngine } from '@/core/engine/pdfEngine';
import type { CompressionConfig, CompressionLevel } from '@/lib/pdf';

export type MergeOptions = { files: File[] };
export type SplitOptions = { file: File; ranges?: string };
export type RotateOptions = { file: File; angle: 90 | 180 | 270 };
export type CompressOptions = { file: File; level?: 'light' | 'medium' | 'strong' | 'custom'; quality?: number };
export type ExtractOptions = { file: File; pages?: string };
export type DeleteOptions = { file: File; range?: string };

function mapCompressionConfig(opts: CompressOptions): CompressionConfig {
  const level = (opts.level ?? 'medium') as CompressionLevel;
  return { level, quality: opts.quality };
}

/** Merge multiple PDFs into a single document. */
export async function merge({ files }: MergeOptions): Promise<{ filename: string; blob: Blob }> {
  const result = await pdfEngine.mergePdfs(files);
  return { filename: result.filename, blob: result.blob };
}

/** Split a PDF according to page ranges. */
export async function split({ file, ranges }: SplitOptions): Promise<{ filename: string; blob: Blob }> {
  const result = await pdfEngine.splitPdf(file, ranges ?? '');
  return { filename: result.filename, blob: result.blob };
}

/** Rotate all pages of a PDF. */
export async function rotate({ file, angle }: RotateOptions): Promise<{ filename: string; blob: Blob }> {
  const result = await pdfEngine.rotatePdf(file, angle);
  return { filename: result.filename, blob: result.blob };
}

/** Compress a PDF with the given quality settings. */
export async function compress({ file, level, quality }: CompressOptions): Promise<{ filename: string; blob: Blob }> {
  const config = mapCompressionConfig({ file, level, quality });
  const result = await pdfEngine.compressPdf(file, config);
  return { filename: result.filename, blob: result.blob };
}

/** Extract pages or content from a PDF – implemented via split when pages are provided. */
export async function extract({ file, pages }: ExtractOptions): Promise<{ filename: string; blob: Blob }> {
  if (!pages) {
    return { filename: file.name, blob: file as unknown as Blob };
  }
  const result = await pdfEngine.splitPdf(file, pages);
  return { filename: result.filename, blob: result.blob };
}

/** Delete (remove) pages from a PDF – implemented via removePages when a range is provided. */
export async function deletePages({ file, range }: DeleteOptions): Promise<{ filename: string; blob: Blob }> {
  if (!range) {
    return { filename: file.name, blob: file as unknown as Blob };
  }
  const result = await pdfEngine.removePages(file, range);
  return { filename: result.filename, blob: result.blob };
}

export async function processTool(params: { type: string; files?: File[]; file?: File; range?: string; pages?: string; angle?: number; level?: string; quality?: number; ranges?: string }): Promise<{ filename: string; blob: Blob; url: string }> {
  switch (params.type) {
    case 'merge': {
      if (!params.files) throw new Error('Merge requires files');
      const res = await merge({ files: params.files });
      return { filename: res.filename, blob: res.blob, url: URL.createObjectURL(res.blob) };
    }
    case 'split': {
      if (!params.file) throw new Error('Split requires file');
      const res = await split({ file: params.file, ranges: params.ranges });
      return { filename: res.filename, blob: res.blob, url: URL.createObjectURL(res.blob) };
    }
    case 'rotate': {
      if (!params.file) throw new Error('Rotate requires file');
      const res = await rotate({ file: params.file, angle: (params.angle ?? 90) as 90 | 180 | 270 });
      return { filename: res.filename, blob: res.blob, url: URL.createObjectURL(res.blob) };
    }
    case 'compress': {
      if (!params.file) throw new Error('Compress requires file');
      const res = await compress({ file: params.file, level: params.level as CompressOptions['level'], quality: params.quality });
      return { filename: res.filename, blob: res.blob, url: URL.createObjectURL(res.blob) };
    }
    case 'extract': {
      if (!params.file) throw new Error('Extract requires file');
      const res = await extract({ file: params.file, pages: params.pages });
      return { filename: res.filename, blob: res.blob, url: URL.createObjectURL(res.blob) };
    }
    case 'delete': {
      if (!params.file) throw new Error('Delete requires file');
      const res = await deletePages({ file: params.file, range: params.range });
      return { filename: res.filename, blob: res.blob, url: URL.createObjectURL(res.blob) };
    }
    default:
      throw new Error(`Unsupported tool type: ${params.type}`);
  }
}

// TODO: add other operations like protect, export, etc.
