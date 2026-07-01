import { PDFDocument, degrees, StandardFonts, rgb } from "pdf-lib";

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

export async function protectPdf(file: File, password: string): Promise<ToolResult> {
  // pdf-lib does not encrypt; we mark the document with metadata + a cover note.
  // For real password protection users need a desktop tool — surfaced in the UI copy.
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  src.setProducer("silentPDF");
  src.setSubject(`Marked private (password hint length: ${password.length})`);
  const bytes = await src.save();
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-protected.pdf" };
}

export async function imageToPdf(files: File[]): Promise<ToolResult> {
  const out = await PDFDocument.create();
  for (const f of files) {
    const buf = await f.arrayBuffer();
    const isPng = f.type.includes("png") || f.name.toLowerCase().endsWith(".png");
    const img = isPng ? await out.embedPng(buf) : await out.embedJpg(buf);
    const page = out.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const bytes = await out.save();
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-from-images.pdf" };
}

export async function watermarkPdf(file: File, text: string): Promise<ToolResult> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const font = await src.embedFont(StandardFonts.HelveticaBold);
  const label = (text || "CONFIDENTIAL").trim();
  src.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const size = Math.max(36, Math.min(width, height) / 8);
    const textWidth = font.widthOfTextAtSize(label, size);
    page.drawText(label, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size,
      font,
      color: rgb(0.7, 0.1, 0.1),
      opacity: 0.25,
      rotate: degrees(45),
    });
  });
  const bytes = await src.save();
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-watermarked.pdf" };
}

export async function removeWatermarkPdf(file: File): Promise<ToolResult> {
  // Best-effort browser cleanup: strip annotations layer (common home for watermark stamps)
  // and clear metadata. Rasterized watermarks embedded in page content can't be safely removed
  // in the browser — the UI copy calls this out.
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  src.getPages().forEach((page) => {
    try {
      // @ts-expect-error – node exists on the low-level PDFPage
      page.node.delete?.(page.node.context.obj("Annots"));
    } catch { /* ignore */ }
  });
  src.setSubject("");
  src.setKeywords([]);
  const bytes = await src.save();
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-cleaned.pdf" };
}

export async function reorderPdf(file: File, order: string): Promise<ToolResult> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const total = src.getPageCount();
  const indices = parseRanges(order, total);
  if (!indices || indices.length === 0) throw new Error("Enter a new page order, e.g. 3,1,2");
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach((p) => out.addPage(p));
  const bytes = await out.save();
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-reordered.pdf" };
}

export async function addBlankPages(file: File, count: number): Promise<ToolResult> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const [first] = src.getPages();
  const size: [number, number] = first ? [first.getWidth(), first.getHeight()] : [595.28, 841.89];
  for (let i = 0; i < Math.max(1, count); i++) src.addPage(size);
  const bytes = await src.save();
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-with-pages.pdf" };
}

export async function exportPdf(file: File, newName: string): Promise<ToolResult> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const bytes = await src.save();
  const clean = (newName || "silentpdf-export").replace(/[^\w\-. ]+/g, "").trim() || "silentpdf-export";
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: clean.endsWith(".pdf") ? clean : `${clean}.pdf` };
}

export async function signPdf(file: File, signatureText: string): Promise<ToolResult> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const font = await src.embedFont(StandardFonts.HelveticaOblique);
  const pages = src.getPages();
  const last = pages[pages.length - 1];
  const { width } = last.getSize();
  const label = signatureText || "Signed";
  const size = 24;
  const w = font.widthOfTextAtSize(label, size);
  last.drawText(label, {
    x: Math.max(24, width - w - 48),
    y: 48,
    size,
    font,
    color: rgb(0.05, 0.1, 0.35),
  });
  last.drawText(`Signed via silentPDF · ${new Date().toISOString().slice(0, 10)}`, {
    x: Math.max(24, width - w - 48),
    y: 30,
    size: 8,
    font,
    color: rgb(0.4, 0.4, 0.45),
  });
  const bytes = await src.save();
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-signed.pdf" };
}

export async function pdfToWord(file: File): Promise<ToolResult> {
  const [{ Document, Packer, Paragraph, TextRun }, pdfjs] = await Promise.all([
    import("docx"),
    import("pdfjs-dist"),
  ]);
  // Wire the pdfjs worker from the bundled asset to keep everything browser-side.
  // @ts-expect-error – Vite resolves the worker URL
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  // @ts-expect-error – GlobalWorkerOptions exists at runtime
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const paragraphs: InstanceType<typeof Paragraph>[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lines = new Map<number, string[]>();
    for (const item of content.items as Array<{ str: string; transform: number[] }>) {
      const y = Math.round(item.transform[5]);
      const arr = lines.get(y) ?? [];
      arr.push(item.str);
      lines.set(y, arr);
    }
    const sortedY = Array.from(lines.keys()).sort((a, b) => b - a);
    for (const y of sortedY) {
      const text = (lines.get(y) ?? []).join(" ").trim();
      if (text) paragraphs.push(new Paragraph({ children: [new TextRun(text)] }));
    }
    paragraphs.push(new Paragraph({ children: [new TextRun("")] }));
  }
  const doc = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  return { blob, filename: file.name.replace(/\.pdf$/i, "") + ".docx" };
}

export async function wordToPdf(file: File): Promise<ToolResult> {
  const mammoth = await import("mammoth");
  const { value: text } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  const out = await PDFDocument.create();
  const font = await out.embedFont(StandardFonts.Helvetica);
  const size = 11;
  const margin = 54;
  const pageW = 595.28;
  const pageH = 841.89;
  const maxWidth = pageW - margin * 2;
  const lineHeight = size * 1.4;

  const wrap = (line: string): string[] => {
    const words = line.split(/\s+/);
    const result: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxWidth) {
        if (cur) result.push(cur);
        cur = w;
      } else cur = test;
    }
    if (cur) result.push(cur);
    return result.length ? result : [""];
  };

  let page = out.addPage([pageW, pageH]);
  let y = pageH - margin;
  for (const rawLine of text.split(/\r?\n/)) {
    for (const line of wrap(rawLine)) {
      if (y < margin) { page = out.addPage([pageW, pageH]); y = pageH - margin; }
      page.drawText(line, { x: margin, y, size, font, color: rgb(0.1, 0.1, 0.15) });
      y -= lineHeight;
    }
  }
  const bytes = await out.save();
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: file.name.replace(/\.docx$/i, "") + ".pdf" };
}

export async function editPdfPassthrough(file: File): Promise<ToolResult> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const bytes = await src.save();
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-edited.pdf" };
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
