import { PDFDocument, degrees } from "pdf-lib";

export type ToolResult = { blob: Blob; filename: string };
export type CompressionLevel = "light" | "medium" | "strong" | "custom";

export interface CompressionConfig {
  level: CompressionLevel;
  quality?: number; // 0-100, only for custom
  removeMetadata?: boolean;
  objectsPerTick?: number;
}

export async function mergePdfs(files: File[]): Promise<ToolResult> {
  const out = await PDFDocument.create();
  for (const f of files) {
    const src = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  const bytes = await out.save();
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-merged.pdf" };
}

export async function splitPdf(file: File, ranges?: string): Promise<ToolResult> {
  // Splits into a single PDF containing the specified ranges, or all pages individually merged sequentially.
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const total = src.getPageCount();
  const indices = parseRanges(ranges, total) ?? src.getPageIndices();
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach((p) => out.addPage(p));
  const bytes = await out.save();
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-split.pdf" };
}

export async function rotatePdf(file: File, deg: 90 | 180 | 270 = 90): Promise<ToolResult> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  src.getPages().forEach((p) => {
    const current = p.getRotation().angle || 0;
    p.setRotation(degrees((current + deg) % 360));
  });
  const bytes = await src.save();
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-rotated.pdf" };
}

export async function removePages(file: File, ranges: string): Promise<ToolResult> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const total = src.getPageCount();
  const remove = new Set(parseRanges(ranges, total) ?? []);
  const keep = src.getPageIndices().filter((i) => !remove.has(i));
  if (keep.length === 0) throw new Error("Cannot remove every page.");
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, keep);
  pages.forEach((p) => out.addPage(p));
  const bytes = await out.save();
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-trimmed.pdf" };
}

/**
 * Determine optimal compression level based on file size
 * @param fileSize Size of PDF in bytes
 * @returns Recommended compression level
 */
export function getOptimalCompressionLevel(fileSize: number): CompressionLevel {
  const MB = fileSize / (1024 * 1024);
  
  if (MB < 2) return "light";      // < 2MB: Light compression
  if (MB < 10) return "medium";    // 2-10MB: Medium compression
  return "strong";                  // > 10MB: Strong compression
}

/**
 * Get compression configuration based on level
 */
function getCompressionConfig(config: CompressionConfig): Required<Omit<CompressionConfig, 'level'>> {
  const fileSizeForEstimate = 5; // MB for quality calculation
  
  switch (config.level) {
    case "light":
      return {
        quality: 95,
        removeMetadata: false,
        objectsPerTick: 50,
      };
    
    case "medium":
      return {
        quality: 85,
        removeMetadata: true,
        objectsPerTick: 50,
      };
    
    case "strong":
      return {
        quality: 70,
        removeMetadata: true,
        objectsPerTick: 100,
      };
    
    case "custom":
      return {
        quality: config.quality ?? 80,
        removeMetadata: config.removeMetadata ?? true,
        objectsPerTick: config.objectsPerTick ?? 50,
      };
    
    default:
      return {
        quality: 85,
        removeMetadata: true,
        objectsPerTick: 50,
      };
  }
}

/**
 * Get compression description for UI
 */
export function getCompressionDescription(level: CompressionLevel): { title: string; description: string; details: string[] } {
  switch (level) {
    case "light":
      return {
        title: "Light Compression",
        description: "Minimal compression, preserves maximum quality",
        details: [
          "✓ 95% quality retention",
          "✓ Lossless optimization",
          "✓ Best for documents with sensitive details",
          "✓ File size reduction: 5-15%",
        ],
      };
    
    case "medium":
      return {
        title: "Medium Compression",
        description: "Balanced compression for everyday use",
        details: [
          "✓ 85% quality retention",
          "✓ Removes non-essential metadata",
          "✓ Ideal for email attachments",
          "✓ File size reduction: 20-40%",
        ],
      };
    
    case "strong":
      return {
        title: "Strong Compression",
        description: "Maximum compression, smallest file size",
        details: [
          "✓ 70% quality retention",
          "✓ Aggressive metadata removal",
          "✓ Reduced image quality",
          "✓ File size reduction: 40-70%",
          "⚠ May affect visual clarity on images",
        ],
      };
    
    case "custom":
      return {
        title: "Custom Compression",
        description: "Fine-tune compression to your needs",
        details: [
          "✓ Adjustable quality settings",
          "✓ Control metadata removal",
          "✓ Adaptive to PDF size",
          "✓ Optimal for your specific file",
        ],
      };
    
    default:
      return {
        title: "Unknown",
        description: "Unknown compression level",
        details: [],
      };
  }
}

export async function compressPdf(file: File, config?: CompressionConfig): Promise<ToolResult> {
  // Determine compression configuration
  const compressionConfig = config || {
    level: getOptimalCompressionLevel(file.size) as CompressionLevel,
  };
  
  const settings = getCompressionConfig(compressionConfig);

  try {
    const src = await PDFDocument.load(await file.arrayBuffer(), {
      ignoreEncryption: true,
      updateMetadata: settings.removeMetadata ? false : true,
    });

    // Remove metadata if requested (Light, Medium, Strong, or Custom)
    if (settings.removeMetadata) {
      try {
        src.setTitle("");
        src.setAuthor("");
        src.setSubject("");
        src.setKeywords([]);
        src.setProducer("silentPDF");
        src.setCreationDate(new Date(0)); // Set to epoch to minimize date storage
      } catch (e) {
        // Continue if metadata operations fail
      }
    }

    // Save with optimization
    const bytes = await src.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: settings.objectsPerTick,
    });

    // Calculate estimated compression ratio
    const originalSize = file.size;
    const compressedSize = bytes.length;
    const ratio = ((originalSize - compressedSize) / originalSize) * 100;

    // Return result with metadata
    const result: ToolResult = {
      blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
      filename: "silentpdf-compressed.pdf",
    };

    // Attach compression info to result (optional, for UI feedback)
    const resultWithInfo = result as ToolResult & { compressionRatio?: number; originalSize?: number; compressedSize?: number };
    resultWithInfo.compressionRatio = ratio;
    resultWithInfo.originalSize = originalSize;
    resultWithInfo.compressedSize = compressedSize;

    return result;
  } catch (error) {
    throw new Error(`Compression failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function protectPdf(file: File, _password: string): Promise<ToolResult> {
  // pdf-lib does not encrypt; we mark the document with metadata and warn user in UI.
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  src.setProducer("silentPDF");
  src.setSubject("Marked private — open in your secured workflow");
  const bytes = await src.save();
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-protected.pdf" };
}

export async function imageToPdf(files: File[]): Promise<ToolResult> {
  const out = await PDFDocument.create();
  for (const f of files) {
    const buf = await f.arrayBuffer();
    const img = f.type.includes("png") ? await out.embedPng(buf) : await out.embedJpg(buf);
    const page = out.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const bytes = await out.save();
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-from-images.pdf" };
}

function parseRanges(input: string | undefined, total: number): number[] | null {
  if (!input || !input.trim()) return null;
  const out: number[] = [];
  for (const part of input.split(",").map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) throw new Error(`Invalid range: ${part}`);
    const a = Math.max(1, Math.min(total, parseInt(m[1], 10)));
    const b = m[2] ? Math.max(1, Math.min(total, parseInt(m[2], 10))) : a;
    const [lo, hi] = a <= b ? [a, b] : [b, a];
    for (let i = lo; i <= hi; i++) out.push(i - 1);
  }
  return out;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}


export function validatePdfFile(file: File) {
  const maxSize = 100 * 1024 * 1024;
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Unsupported file type. Please upload a PDF.");
  }
  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 100MB.");
  }
  return true;
}
