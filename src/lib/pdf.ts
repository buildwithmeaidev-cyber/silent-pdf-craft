import { PDFDocument, degrees } from "pdf-lib";

export type ToolResult = { blob: Blob; filename: string };

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

export async function compressPdf(file: File): Promise<ToolResult> {
  // Lightweight optimization via pdf-lib re-save with object streams.
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true, updateMetadata: false });
  const bytes = await src.save({ useObjectStreams: true, addDefaultPage: false });
  return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), filename: "silentpdf-compressed.pdf" };
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
