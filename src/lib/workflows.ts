import type { ToolKind } from "@/lib/tools";
import { TOOLS } from "@/lib/tools";

// Per-tool input/output contract so we can validate chains.
export type IoKind = "pdf" | "pdf-multi" | "images" | "word" | "docx";

interface KindMeta {
  input: IoKind;
  output: IoKind;
  label: string;
  slug: string;
}

// Static registry — matches the functions in src/lib/pdf.ts.
export const KIND_META: Record<ToolKind, KindMeta> = {
  merge:           { input: "pdf-multi", output: "pdf",  label: "Merge",          slug: "merge-pdf" },
  split:           { input: "pdf",       output: "pdf",  label: "Split",          slug: "split-pdf" },
  compress:        { input: "pdf",       output: "pdf",  label: "Compress",       slug: "compress-pdf" },
  "pdf-to-word":   { input: "pdf",       output: "docx", label: "PDF to Word",    slug: "pdf-to-word" },
  "word-to-pdf":   { input: "word",      output: "pdf",  label: "Word to PDF",    slug: "word-to-pdf" },
  rotate:          { input: "pdf",       output: "pdf",  label: "Rotate",         slug: "rotate-pdf" },
  remove:          { input: "pdf",       output: "pdf",  label: "Remove Pages",   slug: "remove-pages" },
  protect:         { input: "pdf",       output: "pdf",  label: "Protect",        slug: "protect-pdf" },
  edit:            { input: "pdf",       output: "pdf",  label: "Edit",           slug: "edit-pdf" },
  sign:            { input: "pdf",       output: "pdf",  label: "Sign",           slug: "esign-pdf" },
  "e-sign":        { input: "pdf",       output: "pdf",  label: "E-Sign",         slug: "esign-pdf" },
  watermark:       { input: "pdf",       output: "pdf",  label: "Watermark",      slug: "watermark-pdf" },
  "photo-to-pdf":  { input: "images",    output: "pdf",  label: "Photo to PDF",   slug: "photo-to-pdf" },
  reorder:         { input: "pdf",       output: "pdf",  label: "Reorder Pages",  slug: "reorder-pdf" },
  export:          { input: "pdf",       output: "pdf",  label: "Export & Rename",slug: "export-pdf" },
  addpages:        { input: "pdf",       output: "pdf",  label: "Add Pages",      slug: "addpages-pdf" },
  removewatermark: { input: "pdf",       output: "pdf",  label: "Remove Watermark", slug: "removewatermark-pdf" },
};

export interface StepConfig {
  range?: string;
  password?: string;
  rotation?: 90 | 180 | 270;
  compressionLevel?: "light" | "medium" | "strong" | "custom";
  quality?: number;
  watermarkText?: string;
  signatureText?: string;
  addCount?: number;
  exportName?: string;
}

export interface WorkflowStep {
  kind: ToolKind;
  config?: StepConfig;
}

export interface Workflow {
  id: string;
  name: string;
  audience: string;
  description: string;
  outcome?: string;
  steps: WorkflowStep[];
  accent: string; // tailwind gradient tail
}

export const PRESET_WORKFLOWS: Workflow[] = [
  {
    id: "resume-submission",
    name: "Resume submission",
    audience: "Job seekers",
    description: "Turn your resume Word doc into a signed, right-sized PDF ready for any portal.",
    outcome: "One signed PDF under 1 MB.",
    steps: [
      { kind: "word-to-pdf" },
      { kind: "compress", config: { compressionLevel: "medium" } },
      { kind: "sign" },
    ],
    accent: "from-primary/15 to-primary/0",
  },
  {
    id: "business-contract",
    name: "Business contract",
    audience: "Founders & ops",
    description: "Combine contract pages, lock them with a password, and route for e-signature.",
    outcome: "Password-protected, e-signed PDF.",
    steps: [
      { kind: "merge" },
      { kind: "protect" },
      { kind: "e-sign" },
    ],
    accent: "from-accent/15 to-accent/0",
  },
  {
    id: "student-assignment",
    name: "Student assignment",
    audience: "Students",
    description: "Snap photos of handwritten pages, compress them, and merge into one submission.",
    outcome: "Portal-ready assignment PDF.",
    steps: [
      { kind: "photo-to-pdf" },
      { kind: "compress", config: { compressionLevel: "medium" } },
    ],
    accent: "from-ink/10 to-ink/0",
  },
  {
    id: "scan-to-archive",
    name: "Scan to archive",
    audience: "Admins & records",
    description: "Convert scanned photos into a compressed, password-protected archive PDF.",
    outcome: "Locked archive-ready PDF.",
    steps: [
      { kind: "photo-to-pdf" },
      { kind: "compress", config: { compressionLevel: "strong" } },
      { kind: "protect" },
    ],
    accent: "from-primary/15 to-primary/0",
  },
  {
    id: "legal-delivery",
    name: "Legal delivery pack",
    audience: "Legal teams",
    description: "Merge exhibits, stamp them CONFIDENTIAL, and lock the file before sending.",
    outcome: "Confidential, locked exhibit pack.",
    steps: [
      { kind: "merge" },
      { kind: "watermark", config: { watermarkText: "CONFIDENTIAL" } },
      { kind: "protect" },
    ],
    accent: "from-accent/15 to-accent/0",
  },
  {
    id: "web-publishing",
    name: "Web publishing",
    audience: "Marketing",
    description: "Shrink a report, add a draft watermark, and rename it for your CMS.",
    outcome: "CMS-ready draft PDF.",
    steps: [
      { kind: "compress", config: { compressionLevel: "medium" } },
      { kind: "watermark", config: { watermarkText: "DRAFT" } },
      { kind: "export", config: { exportName: "report" } },
    ],
    accent: "from-ink/10 to-ink/0",
  },
  {
    id: "redact-and-send",
    name: "Redact & send",
    audience: "Legal & HR",
    description: "Strip existing DRAFT/CONFIDENTIAL watermarks from a clean template, then re-stamp for the current release.",
    outcome: "Fresh, correctly-stamped copy.",
    steps: [
      { kind: "removewatermark" },
      { kind: "watermark", config: { watermarkText: "FINAL" } },
      { kind: "export" },
    ],
    accent: "from-accent/15 to-accent/0",
  },
  {
    id: "invoice-batch",
    name: "Monthly invoice batch",
    audience: "Finance",
    description: "Combine a month of invoices, compress the pack, then password-lock it for the accountant.",
    outcome: "Locked monthly invoice pack.",
    steps: [
      { kind: "merge" },
      { kind: "compress", config: { compressionLevel: "medium" } },
      { kind: "protect" },
    ],
    accent: "from-primary/15 to-primary/0",
  },
  {
    id: "photo-album",
    name: "Photo album PDF",
    audience: "Anyone",
    description: "Turn a shoot into a compact, orderable photo album PDF ready to share.",
    outcome: "Slim shareable album.",
    steps: [
      { kind: "photo-to-pdf" },
      { kind: "reorder" },
      { kind: "compress", config: { compressionLevel: "light" } },
    ],
    accent: "from-primary/15 to-primary/0",
  },
  {
    id: "presentation-cleanup",
    name: "Presentation cleanup",
    audience: "Consultants",
    description: "Drop rehearsal notes and speaker prompts before shipping the deck to a client.",
    outcome: "Client-safe deck PDF.",
    steps: [
      { kind: "remove" },
      { kind: "watermark", config: { watermarkText: "CLIENT COPY" } },
      { kind: "export" },
    ],
    accent: "from-ink/10 to-ink/0",
  },
  {
    id: "contract-prep",
    name: "Contract prep",
    audience: "Sales",
    description: "Fix scan rotation, drop signature pages, then merge with the current MSA.",
    outcome: "Signature-ready contract.",
    steps: [
      { kind: "rotate" },
      { kind: "merge" },
      { kind: "sign" },
    ],
    accent: "from-primary/15 to-primary/0",
  },
  {
    id: "report-publisher",
    name: "Report publisher",
    audience: "Comms",
    description: "Reorder pages, add a cover, compress, and export with a clean file name.",
    outcome: "Publishable report PDF.",
    steps: [
      { kind: "reorder" },
      { kind: "addpages" },
      { kind: "compress", config: { compressionLevel: "medium" } },
      { kind: "export" },
    ],
    accent: "from-accent/15 to-accent/0",
  },
];

export function getPreset(id: string): Workflow | undefined {
  return PRESET_WORKFLOWS.find((w) => w.id === id);
}

// A chain is valid when the first step accepts the upload,
// every middle step consumes pdf and outputs pdf, and no step
// after a "docx" output exists.
export function validateChain(steps: WorkflowStep[]): string | null {
  if (steps.length === 0) return "Add at least one step.";
  for (let i = 0; i < steps.length; i++) {
    const meta = KIND_META[steps[i].kind];
    if (i === 0) continue;
    const prev = KIND_META[steps[i - 1].kind];
    if (prev.output === "docx") return `${prev.label} outputs a Word file — it must be the last step.`;
    if (meta.input !== "pdf") return `${meta.label} needs its own input type and can only be step 1.`;
  }
  return null;
}

export function canBeFirstStep(_kind: ToolKind): boolean {
  return true;
}

export function canBeMidStep(kind: ToolKind): boolean {
  const meta = KIND_META[kind];
  return meta.input === "pdf" && meta.output === "pdf";
}

export function canBeLastStep(kind: ToolKind): boolean {
  const meta = KIND_META[kind];
  return meta.input === "pdf"; // may output pdf or docx
}

export function getToolDef(kind: ToolKind) {
  const meta = KIND_META[kind];
  return TOOLS.find((t) => t.slug === meta.slug);
}
