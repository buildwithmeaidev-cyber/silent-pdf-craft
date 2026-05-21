import {
  Combine, Scissors, Minimize2, FileText, FileType2, RotateCw, Trash2, Lock,
  Pencil, PenLine, Stamp, Image, ArrowUpDown, Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ToolKind =
  | "merge" | "split" | "compress" | "pdf-to-word" | "word-to-pdf"
  | "rotate" | "remove" | "protect" | "edit" | "sign" | "watermark"
  | "photo-to-pdf" | "reorder" | "export";

export interface ToolDef {
  slug: string;
  kind: ToolKind;
  title: string;
  short: string;
  description: string;
  icon: LucideIcon;
  accent: "blue" | "red";
  accept: Record<string, string[]>;
  multiple: boolean;
  serverOnly?: boolean;
  needsRange?: boolean;
  needsPassword?: boolean;
  needsRotation?: boolean;
  faq: { q: string; a: string }[];
}

export const TOOLS: ToolDef[] = [
  {
    slug: "merge-pdf", kind: "merge", title: "Merge PDF",
    short: "Combine multiple PDFs into a single, ordered document with better page ordering UX.",
    description: "Drop two or more PDF files in the order you want them combined. We stitch them together in the browser and hand back one clean file.",
    icon: Combine, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: true,
    faq: [
      { q: "How many files can I merge?", a: "There's no hard limit, but very large batches may slow down older devices since processing happens locally." },
      { q: "Will my formatting change?", a: "No. Pages are copied verbatim — fonts, images, and layout are preserved." },
    ],
  },
  {
    slug: "split-pdf", kind: "split", title: "Split PDF",
    short: "Extract specific pages or ranges into a new PDF.",
    description: "Choose pages with preview-ready splitting and safer export validation.",
    icon: Scissors, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false, needsRange: true,
    faq: [
      { q: "What range format do you accept?", a: "Use commas and dashes, e.g. 1-3, 5, 8-10." },
    ],
  },
  {
    slug: "compress-pdf", kind: "compress", title: "Compress PDF",
    short: "Reduce file size with Low, Medium, and High quality modes.",
    description: "We optimize the PDF object structure to shrink file size — perfect for email attachments and fast sharing.",
    icon: Minimize2, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false,
    faq: [{ q: "Will quality drop?", a: "We use lossless restructuring, so visual quality stays the same." }],
  },
  {
    slug: "pdf-to-word", kind: "pdf-to-word", title: "PDF to Word",
    short: "Convert PDFs into editable .docx documents with improved formatting retention.",
    description: "Heavy-lifting conversion handled by our secure conversion engine. For best fidelity, use PDFs with selectable text.",
    icon: FileText, accent: "red",
    accept: { "application/pdf": [".pdf"] }, multiple: false, serverOnly: true,
    faq: [{ q: "Why is this server-side?", a: "Robust PDF→DOCX requires layout analysis that browsers can't do reliably." }],
  },
  {
    slug: "word-to-pdf", kind: "word-to-pdf", title: "Word to PDF",
    short: "Turn .docx files into polished PDFs while preserving layout and fonts.",
    description: "Upload a Word document and we'll render it as a professional, print-ready PDF.",
    icon: FileType2, accent: "red",
    accept: { "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
    multiple: false, serverOnly: true,
    faq: [{ q: "Are images preserved?", a: "Yes — embedded images and styles are carried over." }],
  },
  {
    slug: "rotate-pdf", kind: "rotate", title: "Rotate PDF",
    short: "Rotate every page 90°, 180°, or 270°.",
    description: "Fix sideways scans with live rotation preview and page selection support.",
    icon: RotateCw, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false, needsRotation: true,
    faq: [{ q: "Can I rotate just one page?", a: "Use Split first to isolate the page, rotate it, then merge it back in." }],
  },
  {
    slug: "remove-pages", kind: "remove", title: "Remove Pages",
    short: "Delete pages you don't need from a PDF.",
    description: "Specify which pages to drop and download a slimmed-down copy. Original is never touched.",
    icon: Trash2, accent: "red",
    accept: { "application/pdf": [".pdf"] }, multiple: false, needsRange: true,
    faq: [{ q: "What if I delete the wrong pages?", a: "Just retry — your original file stays on your device." }],
  },
  {
    slug: "protect-pdf", kind: "protect", title: "Protect PDF",
    short: "Protect PDFs with stronger privacy and encryption-ready workflow.",
    description: "Add a privacy seal to your PDF metadata. Full password encryption is available in our Pro tier — request access below.",
    icon: Lock, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false, needsPassword: true,
    faq: [{ q: "Is this true encryption?", a: "This client-side mode marks the document for your secured workflow. AES password encryption is handled by our backend tier." }],
  },
  {
    slug: "edit-pdf", kind: "edit", title: "Edit PDF",
    short: "Draw, write text, and annotate pages directly on the PDF.",
    description: "Use our browser-based editor to draw freehand, add text annotations, and customize colors on any PDF page.",
    icon: Pencil, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false,
    faq: [{ q: "Is this secure?", a: "Yes. All annotations are rendered onto the document locally in your browser." }],
  },
  {
    slug: "sign-pdf", kind: "sign", title: "Sign PDF",
    short: "E-sign documents with your drawn, typed, or uploaded signature.",
    description: "Quickly sign PDFs using a hand-drawn signature, styled typed name, or an uploaded image, and place it anywhere.",
    icon: PenLine, accent: "red",
    accept: { "application/pdf": [".pdf"] }, multiple: false,
    faq: [{ q: "Are these signatures legally binding?", a: "In many jurisdictions, simple electronic signatures are valid for general business use, but check local laws for official deeds." }],
  },
  {
    slug: "watermark-pdf", kind: "watermark", title: "Watermark PDF",
    short: "Add custom text watermarks with control over opacity, size, and rotation.",
    description: "Stamp custom text like 'CONFIDENTIAL' or 'DRAFT' on all pages of your PDF with adjustable position, color, and size.",
    icon: Stamp, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false,
    faq: [{ q: "Can the watermark be removed?", a: "We flatten the watermark text directly into the page content stream, making it highly secure." }],
  },
  {
    slug: "photo-to-pdf", kind: "photo-to-pdf", title: "Photo to PDF",
    short: "Convert images (JPG, PNG, WebP) into a clean PDF document.",
    description: "Select or drop images to arrange them, choose page size (A4, Letter, etc.), and fit style to compile them into a PDF.",
    icon: Image, accent: "red",
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] }, multiple: true,
    faq: [{ q: "Can I adjust the order of images?", a: "Yes, you can drag and drop to rearrange images before generating the PDF." }],
  },
  {
    slug: "reorder-pdf", kind: "reorder", title: "Reorder Pages",
    short: "Rearrange, sort, or delete pages in your PDF visually.",
    description: "Load a PDF to view thumbnails of all pages. Drag to reorder, delete unneeded pages, and export the new PDF.",
    icon: ArrowUpDown, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false,
    faq: [{ q: "Does this upload my pages?", a: "No, thumbnails are rendered and rearranged entirely locally inside your browser." }],
  },
  {
    slug: "export-pdf", kind: "export", title: "Export & Rename",
    short: "Export your PDF with a new customized filename.",
    description: "View page previews of your PDF, configure a new export filename, and download the renamed file securely.",
    icon: Download, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false,
    faq: [{ q: "Why use this tool?", a: "It's a quick way to inspect a PDF's contents and save it under a clean name without loading a heavy PDF reader." }],
  },
];

export function getTool(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}

