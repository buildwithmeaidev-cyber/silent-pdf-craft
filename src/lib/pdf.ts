import { PDFDocument, degrees, StandardFonts, rgb } from "pdf-lib";
// Encrypted save via drop-in fork
import { PDFDocument as PDFDocumentEnc } from "@cantoo/pdf-lib";
// Static worker URL — resolved by Vite in both dev and prod builds.
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export type ToolResult = { blob: Blob; filename: string };
export type CompressionLevel = "light" | "medium" | "strong" | "custom";

export interface CompressionConfig {
  level: CompressionLevel;
  quality?: number;
  removeMetadata?: boolean;
  objectsPerTick?: number;
}

// ------- Watermark / sign / edit richer configs -------

export interface WatermarkPlacement {
  text?: string;
  imageDataUrl?: string; // PNG/JPG data URL for image watermark
  color?: { r: number; g: number; b: number }; // 0..1
  opacity?: number; // 0..1
  fontSize?: number;
  rotation?: number; // deg
  tile?: boolean; // repeat across page
  x?: number; // 0..1 relative to page width, center
  y?: number; // 0..1 relative to page height, center
  scale?: number; // for image, 0..1 of page width
}

export interface SignaturePlacement {
  imageDataUrl?: string; // signature PNG (draw or upload)
  text?: string; // typed
  x?: number; // 0..1
  y?: number; // 0..1
  scale?: number; // 0..1 of page width
  page?: number; // 1-indexed; default last
}

export interface EditAnnotation {
  page: number; // 1-indexed
  kind: "text";
  text: string;
  x: number; // 0..1
  y: number; // 0..1
  size?: number;
  color?: { r: number; g: number; b: number };
}

// ---------------- pdf.js loader ----------------
let _pdfjs: typeof import("pdfjs-dist") | null = null;
async function getPdfJs() {
  if (_pdfjs) return _pdfjs;
  const pdfjs = await import("pdfjs-dist");
  (pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
  _pdfjs = pdfjs;
  return pdfjs;
}

// ---------------- merge / split / rotate / remove ----------------
export async function mergePdfs(files: File[]): Promise<ToolResult> {
  const out = await PDFDocument.create();
  for (const f of files) {
    const src = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-merged.pdf" };
}

export async function splitPdf(file: File, ranges?: string): Promise<ToolResult> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const total = src.getPageCount();
  const indices = parseRanges(ranges, total) ?? src.getPageIndices();
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach((p) => out.addPage(p));
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-split.pdf" };
}

export async function rotatePdf(file: File, deg: 90 | 180 | 270 = 90): Promise<ToolResult> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  src.getPages().forEach((p) => {
    const current = p.getRotation().angle || 0;
    p.setRotation(degrees((current + deg) % 360));
  });
  const bytes = await src.save({ useObjectStreams: true });
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
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-trimmed.pdf" };
}

// ---------------- compression ----------------
export function getOptimalCompressionLevel(fileSize: number): CompressionLevel {
  const MB = fileSize / (1024 * 1024);
  if (MB < 2) return "light";
  if (MB < 10) return "medium";
  return "strong";
}

export function getCompressionDescription(level: CompressionLevel) {
  const map = {
    light:  { title: "Light",  description: "Minimal compression, near-original quality",  details: ["≈ 95% quality", "5–15% smaller"] },
    medium: { title: "Medium", description: "Balanced for email attachments",              details: ["≈ 85% quality", "20–40% smaller"] },
    strong: { title: "Strong", description: "Smallest file, softer images",                 details: ["≈ 70% quality", "40–70% smaller"] },
    custom: { title: "Custom", description: "Pick your own quality",                        details: ["Adjustable"] },
  } as const;
  return map[level];
}

export async function compressPdf(
  file: File,
  config?: CompressionConfig,
  onProgress?: (pct: number) => void,
): Promise<ToolResult> {
  const level: CompressionLevel = config?.level ?? getOptimalCompressionLevel(file.size);
  const preset = (() => {
    switch (level) {
      case "light":  return { scale: 1.25, quality: 0.9 };
      case "medium": return { scale: 1.0,  quality: 0.72 };
      case "strong": return { scale: 0.85, quality: 0.5 };
      case "custom": {
        const q = Math.min(100, Math.max(20, config?.quality ?? 75)) / 100;
        return { scale: 0.7 + q * 0.75, quality: q };
      }
    }
  })();

  const pdfjs = await getPdfJs();
  const srcBuf = await file.arrayBuffer();
  const srcPdf = await pdfjs.getDocument({ data: srcBuf }).promise;
  const out = await PDFDocument.create();
  out.setProducer("silentPDF");

  for (let i = 1; i <= srcPdf.numPages; i++) {
    const page = await srcPdf.getPage(i);
    const viewport = page.getViewport({ scale: preset.scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise;

    const jpegBlob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encode failed"))), "image/jpeg", preset.quality)
    );
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const embedded = await out.embedJpg(jpegBytes);

    const origViewport = page.getViewport({ scale: 1 });
    const pdfPage = out.addPage([origViewport.width, origViewport.height]);
    pdfPage.drawImage(embedded, { x: 0, y: 0, width: origViewport.width, height: origViewport.height });
    onProgress?.(Math.round((i / srcPdf.numPages) * 100));
    // yield so the UI thread can paint
    await new Promise((r) => setTimeout(r, 0));
  }

  const bytes = await out.save({ useObjectStreams: true, addDefaultPage: false });
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-compressed.pdf" };
}

// ---------------- protect (real AES via @cantoo/pdf-lib) ----------------
export async function protectPdf(file: File, password: string): Promise<ToolResult> {
  if (!password || password.length < 4) throw new Error("Password must be at least 4 characters.");
  const src = await PDFDocumentEnc.load(await file.arrayBuffer(), { ignoreEncryption: true });
  // @cantoo/pdf-lib supports save({ encrypt: {...} })
  const bytes = await (src as unknown as {
    save: (opts: { encrypt: { userPassword: string; ownerPassword: string; permissions?: Record<string, boolean> } }) => Promise<Uint8Array>;
  }).save({
    encrypt: {
      userPassword: password,
      ownerPassword: password,
      permissions: { printing: true, modifying: false, copying: false, annotating: false },
    },
  });

  // Verify the output is genuinely encrypted: loading without ignoreEncryption
  // must fail. If it succeeds, encryption silently didn't apply.
  try {
    await PDFDocument.load(bytes);
    throw new Error("Encryption isn't supported for this file in your browser. Try a different PDF.");
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Encryption isn't supported")) throw err;
    // Any other error means the load failed as expected (i.e. it's encrypted). Good.
  }

  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-protected.pdf" };
}

// ---------------- image → PDF ----------------
export async function imageToPdf(files: File[]): Promise<ToolResult> {
  const out = await PDFDocument.create();
  for (const f of files) {
    const name = f.name.toLowerCase();
    const isPng = f.type.includes("png") || name.endsWith(".png");
    const isJpg = f.type.includes("jpeg") || f.type.includes("jpg") || name.endsWith(".jpg") || name.endsWith(".jpeg");
    let img: Awaited<ReturnType<typeof out.embedJpg>>;
    if (isJpg) {
      img = await out.embedJpg(await f.arrayBuffer());
    } else if (isPng) {
      img = await out.embedPng(await f.arrayBuffer());
    } else {
      const url = URL.createObjectURL(f);
      const bitmap = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error(`Couldn't read image: ${f.name}`));
        el.src = url;
      });
      const canvas = document.createElement("canvas");
      const MAX_SIDE = 2000;
      const srcW = bitmap.naturalWidth || 1;
      const srcH = bitmap.naturalHeight || 1;
      const ratio = Math.min(1, MAX_SIDE / Math.max(srcW, srcH));
      canvas.width = Math.max(1, Math.round(srcW * ratio));
      canvas.height = Math.max(1, Math.round(srcH * ratio));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not available");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encode failed"))), "image/jpeg", 0.85)
      );
      img = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
    }
    const page = out.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-from-images.pdf" };
}

// ---------------- watermark (rich placement) ----------------
export async function watermarkPdf(
  file: File,
  placement: WatermarkPlacement | string,
): Promise<ToolResult> {
  const p: WatermarkPlacement = typeof placement === "string" ? { text: placement } : placement;
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const font = await src.embedFont(StandardFonts.HelveticaBold);
  const color = p.color ?? { r: 0.7, g: 0.1, b: 0.1 };
  const opacity = p.opacity ?? 0.25;
  const rotation = p.rotation ?? 45;
  const label = (p.text || "").trim();

  let embeddedImg: Awaited<ReturnType<typeof src.embedPng>> | null = null;
  if (p.imageDataUrl) {
    const bin = dataUrlToUint8(p.imageDataUrl);
    embeddedImg = p.imageDataUrl.startsWith("data:image/jpeg")
      ? await src.embedJpg(bin)
      : await src.embedPng(bin);
  }

  for (const page of src.getPages()) {
    const { width, height } = page.getSize();
    const drawOne = (cx: number, cy: number) => {
      if (embeddedImg) {
        const w = (p.scale ?? 0.4) * width;
        const h = (embeddedImg.height / embeddedImg.width) * w;
        page.drawImage(embeddedImg, {
          x: cx - w / 2, y: cy - h / 2, width: w, height: h,
          opacity, rotate: degrees(rotation),
        });
      } else if (label) {
        const size = p.fontSize ?? Math.max(36, Math.min(width, height) / 8);
        const tw = font.widthOfTextAtSize(label, size);
        page.drawText(label, {
          x: cx - tw / 2, y: cy - size / 2, size, font,
          color: rgb(color.r, color.g, color.b), opacity, rotate: degrees(rotation),
        });
      }
    };
    if (p.tile) {
      const cols = 3, rows = 4;
      for (let cc = 0; cc < cols; cc++) for (let rr = 0; rr < rows; rr++) {
        drawOne(((cc + 0.5) / cols) * width, ((rr + 0.5) / rows) * height);
      }
    } else {
      const cx = (p.x ?? 0.5) * width;
      const cy = (1 - (p.y ?? 0.5)) * height;
      drawOne(cx, cy);
    }
  }
  const bytes = await src.save({ useObjectStreams: true });
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-watermarked.pdf" };
}

// ---------------- remove watermark (real browser cleanup) ----------------
//
// Strategy — combined attack that works for the vast majority of overlay
// watermarks that browsers can touch without a full content-stream rewriter:
//
//   1. Strip annotation-layer stamps (many "CONFIDENTIAL" watermarks live here).
//   2. Drop Form XObjects whose name looks watermark-y (Adobe/Word/Bluebeam
//      all label them with W*, Watermark, Header/Footer, Stamp).
//   3. Use pdf.js to locate every text run whose content matches one of the
//      caller-supplied watermark phrases (case-insensitive substring match),
//      then draw a solid white rectangle over each hit with pdf-lib.
//   4. Also strip common defaults ("CONFIDENTIAL", "DRAFT", "COPY", "SAMPLE",
//      "SPECIMEN", "WATERMARK") when the caller doesn't override the list.
//
// This is best-effort and browser-native. Files that render watermarks as
// rasterized images can't be surgically cleaned without OCR — the cover-with-
// rect fallback still helps because most template watermarks are actual text.
export async function removeWatermarkPdf(
  file: File,
  phrases: string[] = ["CONFIDENTIAL", "DRAFT", "COPY", "SAMPLE", "SPECIMEN", "WATERMARK"],
): Promise<ToolResult> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });

  // Phase 1 + 2: strip annotation + XObject watermarks via pdf-lib low-level API.
  for (const page of src.getPages()) {
    const node = (page as unknown as { node: {
      delete?: (k: unknown) => void;
      context: { obj: (s: string) => unknown };
      Resources?: () => { lookup?: (k: unknown) => unknown } | undefined;
    } }).node;

    // Drop annotation-layer stamps
    try { node.delete?.(node.context.obj("Annots")); } catch { /* ignore */ }

    // Strip Form XObjects that look watermark-y
    try {
      const resources = node.Resources?.();
      const xObjectDict = (resources as { lookup?: (k: unknown) => unknown } | undefined)
        ?.lookup?.(node.context.obj("XObject")) as
        { entries?: () => Array<[{ encodedName?: string }, unknown]>; delete?: (k: unknown) => void } | undefined;
      if (xObjectDict?.entries) {
        for (const [k] of xObjectDict.entries()) {
          const n = k?.encodedName ?? "";
          if (/watermark|stamp|header|footer|\bwm\b|logo/i.test(n)) {
            xObjectDict.delete?.(k);
          }
        }
      }
    } catch { /* ignore */ }
  }

  // Phase 3: use pdf.js to find text hits and cover with white rectangles.
  try {
    const cleaned = (phrases || [])
      .map((p) => (p ?? "").trim())
      .filter(Boolean)
      .map((p) => p.toLowerCase());

    if (cleaned.length > 0) {
      const pdfjs = await getPdfJs();
      // Re-read from the freshly saved bytes so we're aligned with what will be output.
      const preview = await src.save({ useObjectStreams: false });
      const doc = await pdfjs.getDocument({ data: preview.slice(0) as unknown as Uint8Array }).promise;

      const pages = src.getPages();
      for (let i = 1; i <= doc.numPages && i <= pages.length; i++) {
        const jsPage = await doc.getPage(i);
        const viewport = jsPage.getViewport({ scale: 1 });
        const content = await jsPage.getTextContent();
        const pdfPage = pages[i - 1];
        const { height: pageH } = pdfPage.getSize();
        // Coordinate delta between pdf.js viewport height and pdf-lib page height (rotation cases).
        const yScale = pageH / viewport.height;
        const xScale = pdfPage.getSize().width / viewport.width;

        for (const item of content.items as Array<{
          str: string; transform: number[]; width: number; height: number;
        }>) {
          const text = (item.str || "").toLowerCase();
          if (!text.trim()) continue;
          if (!cleaned.some((p) => text.includes(p))) continue;
          // pdf.js transform: [a, b, c, d, e, f]. e,f = origin in top-down coords.
          const tx = item.transform[4] * xScale;
          const tyTop = item.transform[5] * yScale;
          const w = (item.width || Math.abs(item.transform[0]) * item.str.length * 0.5) * xScale;
          const h = (item.height || Math.abs(item.transform[3]) * 1.4) * yScale;
          // pdf-lib origin = bottom-left; pdf.js origin returned = bottom-left too for text items,
          // so we can draw directly with a small padding.
          const pad = Math.max(1, h * 0.15);
          pdfPage.drawRectangle({
            x: Math.max(0, tx - pad),
            y: Math.max(0, tyTop - pad),
            width: w + pad * 2,
            height: h + pad * 2,
            color: rgb(1, 1, 1),
            opacity: 1,
            borderWidth: 0,
          });
        }
      }
    }
  } catch (err) {
    // pdf.js coverage is best-effort; annotation/XObject strip already ran.
    console.warn("[removeWatermark] text-coverage phase failed:", err);
  }

  src.setSubject("");
  src.setKeywords([]);
  src.setProducer("silentPDF");

  const bytes = await src.save({ useObjectStreams: true });
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-cleaned.pdf" };
}

// ---------------- reorder / addpages / export ----------------
export async function reorderPdf(file: File, order: string): Promise<ToolResult> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const total = src.getPageCount();
  const indices = parseRanges(order, total);
  if (!indices || indices.length === 0) throw new Error("Enter a new page order, e.g. 3,1,2");
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach((p) => out.addPage(p));
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-reordered.pdf" };
}

export async function addBlankPages(file: File, count: number): Promise<ToolResult> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const [first] = src.getPages();
  const size: [number, number] = first ? [first.getWidth(), first.getHeight()] : [595.28, 841.89];
  for (let i = 0; i < Math.max(1, count); i++) src.addPage(size);
  const bytes = await src.save({ useObjectStreams: true });
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-with-pages.pdf" };
}

export async function exportPdf(file: File, newName: string): Promise<ToolResult> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const bytes = await src.save({ useObjectStreams: true });
  const clean = (newName || "silentpdf-export").replace(/[^\w\-. ]+/g, "").trim() || "silentpdf-export";
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: clean.endsWith(".pdf") ? clean : `${clean}.pdf` };
}

// ---------------- sign (image or typed, positioned) ----------------
export async function signPdf(
  file: File,
  input: SignaturePlacement | string,
): Promise<ToolResult> {
  const s: SignaturePlacement = typeof input === "string" ? { text: input } : input;
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const pages = src.getPages();
  const pageIdx = Math.min(Math.max(1, s.page ?? pages.length), pages.length) - 1;
  const page = pages[pageIdx];
  const { width, height } = page.getSize();

  if (s.imageDataUrl) {
    const bin = dataUrlToUint8(s.imageDataUrl);
    const img = s.imageDataUrl.startsWith("data:image/jpeg")
      ? await src.embedJpg(bin)
      : await src.embedPng(bin);
    const w = (s.scale ?? 0.25) * width;
    const h = (img.height / img.width) * w;
    const cx = (s.x ?? 0.75) * width;
    const cy = (1 - (s.y ?? 0.9)) * height;
    page.drawImage(img, { x: cx - w / 2, y: cy - h / 2, width: w, height: h });
  } else {
    const font = await src.embedFont(StandardFonts.HelveticaOblique);
    const label = sanitizeForWinAnsi(s.text || "Signed");
    const size = 24;
    const w = font.widthOfTextAtSize(label, size);
    const cx = (s.x ?? 0.75) * width;
    const cy = (1 - (s.y ?? 0.92)) * height;
    page.drawText(label, {
      x: cx - w / 2, y: cy, size, font, color: rgb(0.05, 0.1, 0.35),
    });
  }
  const bytes = await src.save({ useObjectStreams: true });
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-signed.pdf" };
}

// ---------------- edit (add text annotations) ----------------
export async function editPdfWithAnnotations(
  file: File,
  annotations: EditAnnotation[],
): Promise<ToolResult> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const font = await src.embedFont(StandardFonts.Helvetica);
  const pages = src.getPages();
  for (const a of annotations) {
    const idx = Math.min(Math.max(1, a.page), pages.length) - 1;
    const page = pages[idx];
    const { width, height } = page.getSize();
    const c = a.color ?? { r: 0.1, g: 0.1, b: 0.15 };
    page.drawText(sanitizeForWinAnsi(a.text), {
      x: a.x * width,
      y: (1 - a.y) * height,
      size: a.size ?? 14,
      font,
      color: rgb(c.r, c.g, c.b),
    });
  }
  const bytes = await src.save({ useObjectStreams: true });
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-edited.pdf" };
}

export async function editPdfPassthrough(file: File): Promise<ToolResult> {
  // Kept for backward compat where no annotations were provided.
  return editPdfWithAnnotations(file, []);
}

// ---------------- pdf → word ----------------
export async function pdfToWord(file: File): Promise<ToolResult> {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");
  const pdfjs = await getPdfJs();
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

// ---------------- word → pdf (with unicode sanitizer) ----------------
export async function wordToPdf(file: File): Promise<ToolResult> {
  const mammoth = await import("mammoth");
  const { value: rawText } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  const text = sanitizeForWinAnsi(rawText);

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
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: file.name.replace(/\.docx$/i, "") + ".pdf" };
}

// ---------------- helpers ----------------

/**
 * Replace glyphs that WinAnsi can't encode with ASCII equivalents.
 * pdf-lib's standard fonts (Helvetica/Times/Courier) are WinAnsi-only, which
 * is why `⇒`, curly quotes, em-dashes etc. crash the encoder.
 */
export function sanitizeForWinAnsi(input: string): string {
  const map: Record<string, string> = {
    "\u2018": "'", "\u2019": "'", "\u201A": "'", "\u201B": "'",
    "\u201C": '"', "\u201D": '"', "\u201E": '"', "\u201F": '"',
    "\u2013": "-", "\u2014": "-", "\u2212": "-",
    "\u2026": "...",
    "\u00A0": " ",
    "\u2022": "*",
    "\u00B7": "-",
    "\u2192": "->", "\u2190": "<-", "\u2194": "<->",
    "\u21D2": "=>", "\u21D0": "<=", "\u21D4": "<=>",
    "\u00D7": "x", "\u00F7": "/",
    "\u2264": "<=", "\u2265": ">=", "\u2260": "!=",
    "\u00B0": " deg",
    "\u2122": "(TM)", "\u00AE": "(R)", "\u00A9": "(C)",
    "\u20AC": "EUR", "\u00A3": "GBP", "\u00A5": "JPY",
    "\uFB00": "ff", "\uFB01": "fi", "\uFB02": "fl", "\uFB03": "ffi", "\uFB04": "ffl",
    "\u2009": " ", "\u200A": " ", "\u200B": "", "\u202F": " ",
  };
  let s = input.replace(/[\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u2013\u2014\u2212\u2026\u00A0\u2022\u00B7\u2192\u2190\u2194\u21D2\u21D0\u21D4\u00D7\u00F7\u2264\u2265\u2260\u00B0\u2122\u00AE\u00A9\u20AC\u00A3\u00A5\uFB00\uFB01\uFB02\uFB03\uFB04\u2009\u200A\u200B\u202F]/g, (m) => map[m] ?? m);
  // Strip anything outside WinAnsi (U+00FF and below is roughly safe; drop the rest).
  s = s.replace(/[^\u0020-\u00FF]/g, "?");
  return s;
}

function dataUrlToUint8(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(",");
  const b64 = dataUrl.slice(comma + 1);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
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
