import {
  Combine, Scissors, Minimize2, FileText, FileType2, RotateCw, Trash2, Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ToolKind =
  | "merge" | "split" | "compress" | "pdf-to-word" | "word-to-pdf"
  | "rotate" | "remove" | "protect";

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
    short: "Combine multiple PDFs into a single, ordered document.",
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
    description: "Choose the pages you want to keep — single pages, ranges, or both — and we'll build a new PDF with just those pages.",
    icon: Scissors, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false, needsRange: true,
    faq: [
      { q: "What range format do you accept?", a: "Use commas and dashes, e.g. 1-3, 5, 8-10." },
    ],
  },
  {
    slug: "compress-pdf", kind: "compress", title: "Compress PDF",
    short: "Reduce file size while keeping pages readable.",
    description: "We optimize the PDF object structure to shrink file size — perfect for email attachments and fast sharing.",
    icon: Minimize2, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false,
    faq: [{ q: "Will quality drop?", a: "We use lossless restructuring, so visual quality stays the same." }],
  },
  {
    slug: "pdf-to-word", kind: "pdf-to-word", title: "PDF to Word",
    short: "Convert PDFs into editable .docx documents.",
    description: "Heavy-lifting conversion handled by our secure conversion engine. For best fidelity, use PDFs with selectable text.",
    icon: FileText, accent: "red",
    accept: { "application/pdf": [".pdf"] }, multiple: false, serverOnly: true,
    faq: [{ q: "Why is this server-side?", a: "Robust PDF→DOCX requires layout analysis that browsers can't do reliably." }],
  },
  {
    slug: "word-to-pdf", kind: "word-to-pdf", title: "Word to PDF",
    short: "Turn .docx files into polished PDFs.",
    description: "Upload a Word document and we'll render it as a professional, print-ready PDF.",
    icon: FileType2, accent: "red",
    accept: { "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
    multiple: false, serverOnly: true,
    faq: [{ q: "Are images preserved?", a: "Yes — embedded images and styles are carried over." }],
  },
  {
    slug: "rotate-pdf", kind: "rotate", title: "Rotate PDF",
    short: "Rotate every page 90°, 180°, or 270°.",
    description: "Fix sideways scans or landscape pages with a single click. Rotation is applied to all pages.",
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
    short: "Mark a PDF as private with metadata sealing.",
    description: "Add a privacy seal to your PDF metadata. Full password encryption is available in our Pro tier — request access below.",
    icon: Lock, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false, needsPassword: true,
    faq: [{ q: "Is this true encryption?", a: "This client-side mode marks the document for your secured workflow. AES password encryption is handled by our backend tier." }],
  },
];

export function getTool(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}
