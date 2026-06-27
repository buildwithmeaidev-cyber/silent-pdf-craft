// Blog posts as typed TS modules — easy to extend, fully type-checked.
// Each post is written in a human voice with concrete scenarios and interlinks.

export interface BlogPost {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  cluster: "compress" | "merge" | "convert" | "security";
  publishedAt: string; // ISO date
  readMinutes: number;
  excerpt: string;
  // Body as ordered blocks for clean rendering + JSON-LD friendliness.
  body: BlogBlock[];
  faq?: { q: string; a: string }[];
  // Interlinks: tool slugs, programmatic slugs, sibling post slugs.
  relatedToolSlugs?: string[];
  relatedProgrammaticSlugs?: string[];
  relatedPostSlugs?: string[];
}

import { type ToolKind } from "@/lib/tools";
import { COMPRESSION_POSTS } from "./posts_compression";
import { OTHER_POSTS } from "./posts_other";

export type BlogBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

export const POSTS: BlogPost[] = [
  // ---------- COMPRESS ----------
  {
    slug: "how-to-compress-pdf-under-1mb",
    title: "How to compress a PDF under 1MB (without making it look terrible)",
    seoTitle: "How to Compress a PDF Under 1MB — Step-by-Step Guide",
    metaDescription:
      "Visa portals, SSC forms, and university uploads cap PDFs at 1MB. Here's a practical guide to actually hit that limit.",
    cluster: "compress",
    publishedAt: "2026-04-12",
    readMinutes: 5,
    excerpt:
      "Government portals and visa applications love the 1MB cap. Here's what actually works — and what to do when one pass isn't enough.",
    body: [
      {
        type: "p",
        text: "If you've ever tried to upload a scanned PDF to a visa portal, you know the drill. 1MB max. Your file is 6MB. The form refuses to submit. The internet is full of compressors that don't get you there in one click.",
      },
      {
        type: "p",
        text: "This post walks through the steps that actually work — first to shrink it, then to handle the case where Maximum compression still isn't enough.",
      },
      { type: "h2", text: "Step 1: try Maximum compression first" },
      {
        type: "p",
        text: "Most online compressors hide the actual compression level behind vague labels like 'Recommended' or 'Best'. What you want is the smallest preset — usually called Maximum or High Compression.",
      },
      {
        type: "p",
        text: "For scanned PDFs (the most common 1MB-cap offender), Maximum typically cuts size by 80–90%. A 6MB scan usually lands somewhere between 500KB and 1.2MB on the first pass.",
      },
      { type: "h2", text: "Step 2: if it's still over 1MB, compress the result" },
      {
        type: "p",
        text: "PDFs that came in at 10MB+ sometimes need two passes. Take the output from step 1, drop it back into the compressor, and run Maximum again. The second pass usually clears the cap.",
      },
      {
        type: "quote",
        text: "There's a point of diminishing returns. After two passes, you're better off removing pages than compressing harder.",
      },
      { type: "h2", text: "Step 3: remove pages you don't actually need" },
      {
        type: "p",
        text: "Most portals only need a few specific pages. The signed page of a 12-page contract. The page with your photo. Use Remove Pages or Split PDF to keep just what's required, then compress.",
      },
      { type: "h2", text: "Step 4: check the readability" },
      {
        type: "p",
        text: "After heavy compression, zoom in on small text and make sure it's still legible. If your scanner ran at 600 DPI, you'll be fine. If it ran at 150 DPI to begin with, Maximum can push it past the readability line.",
      },
      { type: "h2", text: "What about PDFs that won't shrink at all?" },
      {
        type: "p",
        text: "Some PDFs are already optimized — usually anything exported from Word, Google Docs, or InDesign. Compression saves almost nothing because there's no fat to trim. In those cases, the only path under 1MB is removing pages or, for very text-heavy documents, converting to a leaner output format.",
      },
    ],
    faq: [
      {
        q: "Can every PDF be compressed under 1MB?",
        a: "No. Some PDFs are already at their minimum — fonts and vector graphics can't shrink without breaking. For those, removing pages is the only way to get smaller.",
      },
      {
        q: "Will compressing damage the text?",
        a: "Text stays sharp through all compression levels. Only images soften. Maximum is the most aggressive, but text remains selectable and readable.",
      },
    ],
    relatedToolSlugs: ["compress-pdf", "split-pdf", "remove-pages"],
    relatedProgrammaticSlugs: ["compress-pdf-to-1mb", "compress-pdf-for-email"],
    relatedPostSlugs: ["compress-pdf-for-gmail-attachments", "merge-then-compress-workflow"],
  },
  {
    slug: "compress-pdf-for-gmail-attachments",
    title: "Compressing PDFs for Gmail: what the 25MB cap really means",
    seoTitle: "Compress PDF for Gmail — Fit Attachments Under 25MB",
    metaDescription:
      "Gmail says 25MB but bounces things smaller than that. Here's why, and how to compress PDFs so they actually send.",
    cluster: "compress",
    publishedAt: "2026-04-19",
    readMinutes: 4,
    excerpt:
      "Gmail's 25MB cap isn't what it looks like. After encoding, your real ceiling is closer to 22MB — and your recipient's server might be lower.",
    body: [
      {
        type: "p",
        text: "Gmail will tell you the limit is 25MB. What it doesn't tell you is that the 25MB applies after the file is encoded for email transport — base64 encoding adds about 33% overhead, which means your raw file actually needs to come in around 22MB.",
      },
      { type: "h2", text: "The real ceilings" },
      {
        type: "ul",
        items: [
          "Gmail: 25MB encoded → ~22MB raw.",
          "Outlook.com: 20MB encoded → ~17MB raw.",
          "Most business Exchange servers: 10MB → ~8MB raw.",
          "Some corporate firewalls: 5MB or less.",
        ],
      },
      { type: "h2", text: "Why your 'small' PDF still bounces" },
      {
        type: "p",
        text: "If you're sending to a corporate address, the receiver's server is often the bottleneck. A file that left your outbox at 18MB might bounce because their IT set the inbound cap at 10MB.",
      },
      { type: "h2", text: "The pragmatic rule" },
      {
        type: "p",
        text: "Aim for under 10MB. It's small enough to clear almost every server, and most PDF attachments compress under 10MB without quality issues. Use the Compress PDF tool with Balanced for resumes and reports, Maximum for image-heavy scans.",
      },
    ],
    faq: [
      {
        q: "Why does Gmail reject a 22MB file?",
        a: "Email transport encodes files in base64, which inflates them by roughly a third. A 22MB raw PDF becomes ~30MB after encoding, exceeding Gmail's 25MB cap.",
      },
      {
        q: "Should I use Google Drive links instead?",
        a: "For files over 10MB, yes. Gmail offers to auto-attach via Drive when you cross 25MB, and it bypasses the recipient's server limits.",
      },
    ],
    relatedToolSlugs: ["compress-pdf", "merge-pdf"],
    relatedProgrammaticSlugs: ["compress-pdf-for-email", "compress-pdf-for-resume"],
    relatedPostSlugs: ["how-to-compress-pdf-under-1mb"],
  },

  // ---------- MERGE ----------
  {
    slug: "merge-then-compress-workflow",
    title: "The merge-then-compress workflow for monthly reports",
    seoTitle: "Merge Then Compress: PDF Workflow for Monthly Reports",
    metaDescription:
      "Combining a month of PDFs and shrinking the result is the most common PDF task in any office. Here's the clean workflow.",
    cluster: "merge",
    publishedAt: "2026-04-22",
    readMinutes: 4,
    excerpt:
      "Bundling a folder of PDFs and compressing the result is the single most common PDF task in any office. Here's the right order to do it in.",
    body: [
      {
        type: "p",
        text: "Most people compress first, then merge. That's backwards. Compress last — you save more bytes when the compressor sees the full document.",
      },
      { type: "h2", text: "The order that works" },
      {
        type: "ul",
        items: [
          "1. Collect all the source PDFs in a folder.",
          "2. Drop them into Merge PDF in the order you want.",
          "3. Reorder the list — top of the list becomes the first page.",
          "4. Merge and download the combined file.",
          "5. Drop the combined file into Compress PDF.",
          "6. Pick Balanced (or Maximum if you need email-ready).",
        ],
      },
      { type: "h2", text: "Why this order matters" },
      {
        type: "p",
        text: "Compressors deduplicate embedded fonts and images across the whole document. If three of your monthly invoices use the same letterhead, a compressor working on the merged file only stores the letterhead once. Compress-then-merge gives you three copies in the final PDF.",
      },
      { type: "h2", text: "Common pitfalls" },
      {
        type: "p",
        text: "Mixed page sizes. If some PDFs are A4 and some are Letter, the merged file has both. That's fine for sending, but if it'll be printed double-sided, normalize to one size first.",
      },
    ],
    relatedToolSlugs: ["merge-pdf", "compress-pdf", "reorder-pdf"],
    relatedProgrammaticSlugs: ["merge-multiple-pdfs", "compress-pdf-for-email"],
    relatedPostSlugs: ["how-to-compress-pdf-under-1mb", "convert-pdf-to-word-without-breaking-formatting"],
  },

  // ---------- CONVERT ----------
  {
    slug: "convert-pdf-to-word-without-breaking-formatting",
    title: "Converting PDF to Word without breaking the formatting",
    seoTitle: "PDF to Word Without Breaking Formatting — Practical Guide",
    metaDescription:
      "Most PDF to Word converters mangle layouts. Here's what actually preserves headings, tables, and lists.",
    cluster: "convert",
    publishedAt: "2026-04-26",
    readMinutes: 6,
    excerpt:
      "Most PDF-to-Word conversions mangle the layout. Here's what actually works for single-column docs, tables, and multi-column reports.",
    body: [
      {
        type: "p",
        text: "Word can open PDFs directly. It does a terrible job. Text becomes one giant block, tables turn into tab-separated lines, and headings lose their styling. Here's what to do instead — and how to know when the layout will survive.",
      },
      { type: "h2", text: "Single-column documents convert cleanly" },
      {
        type: "p",
        text: "Resumes, letters, contracts, and most reports are single-column. These convert almost perfectly — headings stay as headings, lists stay as lists, paragraphs flow naturally. Use the PDF to Word tool and you'll usually have nothing to clean up.",
      },
      { type: "h2", text: "Multi-column layouts need light cleanup" },
      {
        type: "p",
        text: "Two-column resumes and magazine-style reports convert, but the columns sometimes merge into one. Fix with Word's column tool: select the body, Layout → Columns → Two.",
      },
      { type: "h2", text: "Tables: simple yes, complex maybe" },
      {
        type: "ul",
        items: [
          "Plain grid tables: convert as editable Word tables.",
          "Tables with merged cells: convert, but the merges may flatten.",
          "Nested tables (table inside a cell): often need manual rebuild.",
          "Spreadsheet exports turned into PDFs: convert better via Excel, not Word.",
        ],
      },
      { type: "h2", text: "Scanned PDFs need OCR" },
      {
        type: "p",
        text: "If your PDF is just images of text (typical for anything you scanned with a phone), the converter needs to OCR it first. Most modern converters do this automatically, but the output is text-only — original visual layout doesn't survive scanning, so don't expect it to survive OCR either.",
      },
      { type: "h2", text: "After conversion, re-export to PDF" },
      {
        type: "p",
        text: "Edit in Word, then save as PDF. The re-exported PDF will look slightly different from the original (different font rendering, different spacing) but will look polished and consistent.",
      },
    ],
    faq: [
      {
        q: "Will my Canva resume survive the conversion?",
        a: "Mostly. Single-column Canva resumes survive cleanly. Two-column Canva designs need minor cleanup — usually re-aligning the sidebar.",
      },
      {
        q: "What if my PDF has form fields?",
        a: "Interactive form fields don't convert to Word forms. They become plain text. Fill the PDF first, then convert.",
      },
    ],
    relatedToolSlugs: ["pdf-to-word", "word-to-pdf"],
    relatedProgrammaticSlugs: ["pdf-to-word-online", "pdf-to-word-for-resume", "pdf-to-word-with-formatting"],
    relatedPostSlugs: ["merge-then-compress-workflow"],
  },

  // ---------- SECURITY ----------
  {
    slug: "password-protect-pdf-the-right-way",
    title: "Password-protecting a PDF the right way (and when it's not enough)",
    seoTitle: "Password Protect PDF — When It Works, When It Doesn't",
    metaDescription:
      "PDF passwords are useful, but they're not magic. Here's what they actually protect, and when you need something stronger.",
    cluster: "security",
    publishedAt: "2026-04-30",
    readMinutes: 5,
    excerpt:
      "PDF passwords sound stronger than they are. Here's what they actually protect, what they don't, and what to use when the file is genuinely sensitive.",
    body: [
      {
        type: "p",
        text: "PDF passwords are convenient — set one in your browser, send the file, share the password by text. For most everyday cases (HR documents, contracts in flight, tax returns over email) they're enough. They're not unbreakable, though.",
      },
      { type: "h2", text: "Two kinds of PDF passwords" },
      {
        type: "ul",
        items: [
          "User password (open password): blocks anyone from opening the PDF without typing the password.",
          "Owner password (permissions password): allows opening but restricts printing, copying, or editing.",
        ],
      },
      {
        type: "p",
        text: "The user password is what protects the content. The owner password is enforced by polite PDF readers — many will simply ignore it.",
      },
      { type: "h2", text: "How strong is a PDF user password?" },
      {
        type: "p",
        text: "Modern PDFs use AES-256 encryption. With a strong password (15+ characters, mixed types), it's effectively unbreakable. With a weak password (8 characters, common word) a desktop machine can crack it in hours.",
      },
      { type: "h2", text: "Practical rules" },
      {
        type: "ul",
        items: [
          "Use a long passphrase — four random words is stronger than 'P@ssw0rd!'.",
          "Send the password through a different channel than the file (text the password, email the PDF).",
          "Don't reuse the same password across multiple sensitive documents.",
          "For truly sensitive files (legal discovery, financial records), use end-to-end encrypted channels instead.",
        ],
      },
      { type: "h2", text: "When PDF passwords aren't enough" },
      {
        type: "p",
        text: "If the recipient must not be able to copy or print, the PDF format can't enforce that — those restrictions rely on the viewer cooperating. For true control, use a document-access platform with audit logs. For one-off sensitive transfers, encrypted file transfer is more reliable than relying on PDF passwords alone.",
      },
    ],
    faq: [
      {
        q: "Can I remove a forgotten password from my own PDF?",
        a: "If you own the file and remember the password, yes — reopen, save without password. If you've forgotten it, there's no built-in recovery; you'll need the original source file.",
      },
      {
        q: "Does silentPDF see my password?",
        a: "No. Password protection runs in your browser. The password is applied locally and never sent to a server.",
      },
    ],
    relatedToolSlugs: ["protect-pdf", "esign-pdf"],
    relatedProgrammaticSlugs: ["sign-contract-pdf"],
    relatedPostSlugs: ["convert-pdf-to-word-without-breaking-formatting"],
  },
  ...COMPRESSION_POSTS,
  ...OTHER_POSTS
] as BlogPost[];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
