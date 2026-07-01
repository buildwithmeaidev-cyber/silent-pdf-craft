import {
  Combine, Scissors, Minimize2, FileText, FileType2, RotateCw, Trash2, Lock,
  Pencil, PenLine, Stamp, Image, ArrowUpDown, Download, FilePlus, Eraser,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ToolKind =
  | "merge" | "split" | "compress" | "pdf-to-word" | "word-to-pdf"
  | "rotate" | "remove" | "protect" | "edit" | "sign" | "e-sign" | "watermark"
  | "photo-to-pdf" | "reorder" | "export" | "addpages" | "removewatermark";

export interface HowToStep {
  name: string;
  text: string;
}

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

  // SEO + content fields
  seoTitle: string;
  metaDescription: string;
  h1: string;
  keywords: string[];
  intent: string;          // one-line who-it's-for, written like a human
  whatItDoes: string;      // 2-3 sentences, no fluff
  whenToUse: string[];     // short bullet scenarios
  howItWorks: HowToStep[]; // matches HowTo schema
  benefits: { title: string; body: string }[];
  useCases: { title: string; body: string }[];
  faq: { q: string; a: string }[];
  relatedSlugs: string[];
  bestPractices?: string[];
  commonMistakes?: string[];
}

export const TOOLS: ToolDef[] = [
  {
    slug: "merge-pdf", kind: "merge", title: "Merge PDF",
    short: "Combine PDFs into one clean file in the order you choose.",
    description: "Drop two or more PDFs in the order you want them combined. We stitch them together in your browser and hand back one file.",
    icon: Combine, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: true,

    seoTitle: "Merge PDF Online Free — Combine Multiple PDF Files | silentPDF",
    metaDescription: "Merge PDFs in your browser. Combine 2, 3, or dozens of files into one, reorder pages, no signup, no watermark.",
    h1: "Merge PDF Online",
    keywords: ["merge pdf", "combine pdf", "join pdf files", "merge pdf online", "merge 2 pdfs", "merge multiple pdfs", "pdf joiner"],
    intent: "For anyone trying to send one tidy PDF instead of an email full of attachments.",
    whatItDoes:
      "Merge PDF takes any number of PDF files and joins them into a single document. Pages, fonts, images, and form fields are copied as-is — nothing is re-rendered or flattened. Order is whatever you set in the file list.",
    whenToUse: [
      "You scanned a contract on your phone in chunks and want one file to send.",
      "An online portal asks for a single PDF with cover letter + resume + transcript.",
      "You're stapling together monthly statements before tax season.",
      "A client sent you three signed pages out of order and you need to deliver one.",
    ],
    howItWorks: [
      { name: "Drop your PDFs", text: "Drag two or more PDF files into the upload area, or click to pick them from your device." },
      { name: "Reorder the list", text: "Use the up and down arrows to set the page order you want in the final file." },
      { name: "Click Merge", text: "We combine the files locally in your browser and start the download automatically." },
    ],
    benefits: [
      { title: "Nothing leaves your device", body: "Merging happens in your browser. We never see the file." },
      { title: "Real page order, not file order", body: "Drag files in the exact sequence you need — including duplicates." },
      { title: "No watermark, no signup", body: "The output is a clean PDF. No banner across page one." },
    ],
    useCases: [
      { title: "Job applications", body: "Combine resume, cover letter, and references into one upload." },
      { title: "Invoices and receipts", body: "Bundle a month of receipts into a single file for accounting." },
      { title: "Legal and HR packs", body: "Put NDA, offer letter, and tax forms into one signed PDF." },
    ],
    faq: [
      { q: "How many PDFs can I merge at once?", a: "There's no fixed cap. Everything runs on your device, so big batches depend on your computer's memory. 20–30 average files is comfortable on most laptops. If your browser slows down, merge in two passes." },
      { q: "Will the formatting or fonts change?", a: "No. Pages are copied verbatim. Embedded fonts, images, and layouts stay exactly as they were in the original files." },
      { q: "Are forms and signatures preserved?", a: "Existing signatures and form fields are kept, but interactive form data can behave oddly when files come from different PDF generators. Flatten forms before merging if you need a guaranteed look." },
      { q: "Can I reorder pages, not just files?", a: "This tool merges full files in the order you set. To rearrange individual pages, use Reorder Pages after merging." },
      { q: "Is the merged PDF watermarked?", a: "No. The output is a clean PDF with no silentPDF branding added." },
    ],
    relatedSlugs: ["split-pdf", "reorder-pdf", "compress-pdf"],
    bestPractices: [
      "Rename files with a number prefix (01-cover.pdf, 02-resume.pdf) so the default upload order matches your merge order.",
      "Flatten signed or form-filled PDFs before merging if the originals came from different software — it prevents weird form-field collisions.",
      "Keep individual files under ~50MB each on average laptops; split a giant scan first, then merge.",
      "Run Compress after merging large reports — combined files often have duplicated fonts that compression cleans up.",
    ],
    commonMistakes: [
      "Uploading files in the wrong order and not reordering before hitting merge.",
      "Merging password-protected PDFs without unlocking them first — the resulting file may refuse to open.",
      "Combining 30+ scanned PDFs at once and freezing the browser tab. Merge in batches instead.",
    ],
  },
  {
    slug: "split-pdf", kind: "split", title: "Split PDF",
    short: "Pull out specific pages or ranges into a new file.",
    description: "Pick the pages you want with live previews, and we'll export them as a clean separate PDF.",
    icon: Scissors, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false, needsRange: true,

    seoTitle: "Split PDF Online — Extract Pages from a PDF Free | silentPDF",
    metaDescription: "Split a PDF into separate files or pull out specific pages. Works in your browser, no upload, no watermark.",
    h1: "Split PDF Online",
    keywords: ["split pdf", "extract pdf pages", "split pdf online", "separate pdf pages", "pdf splitter", "extract pages from pdf"],
    intent: "For when you only need pages 4–7 of a 60-page document and don't want to send the whole thing.",
    whatItDoes:
      "Split PDF lets you pick exact pages or ranges from a PDF and save them as a new file. The pages you keep look identical to the original — same fonts, images, and dimensions.",
    whenToUse: [
      "You only need the signed page of a long contract, not all 40.",
      "A reviewer asked for chapter 3 of your thesis as a separate PDF.",
      "You want to share one invoice from a monthly statement bundle.",
      "An ATS upload requires only the resume page, not the cover letter.",
    ],
    howItWorks: [
      { name: "Upload your PDF", text: "Drop the PDF you want to split — it loads instantly in your browser." },
      { name: "Type the page range", text: "Use commas and dashes like 1-3, 5, 8-10 to pick exactly what you need." },
      { name: "Download the new file", text: "We build a fresh PDF with only those pages and start the download." },
    ],
    benefits: [
      { title: "Pick ranges, not whole halves", body: "Mix individual pages and spans in one go: 1, 4-6, 10." },
      { title: "Original file is untouched", body: "We work on a copy. Your source PDF is never modified." },
      { title: "No size limit on the upload", body: "Browser-side processing means big PDFs don't hit a server cap." },
    ],
    useCases: [
      { title: "Pulling out a signed page", body: "Extract just the page with your signature to send back." },
      { title: "Sharing one chapter", body: "Send a teacher or reviewer the specific section they asked for." },
      { title: "Cleaning up scans", body: "Drop accidental duplicate scans without rebuilding the PDF." },
    ],
    faq: [
      { q: "What range format does the tool accept?", a: "Use commas and dashes. For example, 1-3, 5, 8-10 keeps pages 1, 2, 3, 5, 8, 9, and 10 in that order. Whitespace is ignored, and you can list pages in any order you want them to appear." },
      { q: "Can I split a PDF into many separate files at once?", a: "This tool exports one new file per run. To make several small PDFs, run it once per range. We'll likely add a bulk-split mode soon." },
      { q: "Will text stay searchable?", a: "Yes. Selectable text in the original PDF stays selectable in the split file. We don't rasterize anything." },
      { q: "Does the page numbering reset?", a: "Visible page numbers stay whatever the original document shows. Only the PDF's internal page count changes." },
    ],
    relatedSlugs: ["merge-pdf", "remove-pages", "reorder-pdf"],
  },
  {
    slug: "compress-pdf", kind: "compress", title: "Compress PDF",
    short: "Shrink PDF file size without making it look bad.",
    description: "Pick a quality level and we'll compress the PDF in your browser. Great for email attachments and upload size limits.",
    icon: Minimize2, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false,

    seoTitle: "Compress PDF Online Free — Reduce PDF Size Without Quality Loss | silentPDF",
    metaDescription: "Compress PDF files online to fit email attachments and upload limits. Three quality levels, no signup, no watermark.",
    h1: "Compress PDF Online",
    keywords: ["compress pdf", "reduce pdf size", "shrink pdf", "pdf compressor", "compress pdf for email", "compress pdf to 1mb", "compress pdf to 500kb", "optimize pdf"],
    intent: "For when Gmail rejects your 32MB attachment or a job portal caps uploads at 1MB.",
    whatItDoes:
      "Compress PDF rebuilds your PDF with smaller embedded images and a tighter object structure. You get a much smaller file that still looks fine on screen and in print. Three quality presets let you trade size for sharpness.",
    whenToUse: [
      "Gmail says your attachment is too large to send.",
      "A government form caps PDF uploads at 1MB or 500KB.",
      "A client portal rejects scanned PDFs over 5MB.",
      "You're moving a folder of PDFs to a USB drive or older laptop.",
    ],
    howItWorks: [
      { name: "Upload the PDF", text: "Drop the file you want to shrink — preview loads in seconds." },
      { name: "Pick a quality level", text: "Maximum (smallest), Balanced (best for most cases), or High Quality (lightest compression)." },
      { name: "Compress and download", text: "We rebuild the PDF in your browser and download the smaller version." },
    ],
    benefits: [
      { title: "Real size cuts, not metadata trims", body: "We recompress embedded images, the biggest reason PDFs are huge." },
      { title: "Three presets, no guesswork", body: "Pick by goal: email-ready, balanced, or near-original quality." },
      { title: "Local processing", body: "Sensitive contracts and scans never leave your browser." },
    ],
    useCases: [
      { title: "Email-ready attachments", body: "Trim a 25MB scan down to a couple of MB so it actually sends." },
      { title: "Forms and applications", body: "Hit a 1MB or 2MB upload cap without breaking the form." },
      { title: "Sharing on slow networks", body: "Cut size before sending PDFs over weak Wi-Fi or mobile data." },
    ],
    faq: [
      { q: "How much smaller will my PDF get?", a: "Scanned and image-heavy PDFs often shrink by 60–90% with the Balanced preset. Text-only PDFs that came out of Word are usually already optimized — expect 10–30% savings there. The compressed result and the percent saved are shown right after processing." },
      { q: "Will my PDF still look good?", a: "Balanced keeps things sharp for on-screen reading and most printing. Maximum Compression is best when you absolutely need the smallest file — text stays clear but images soften. High Quality is closest to the original." },
      { q: "Can you compress my PDF to exactly 1MB?", a: "We can't promise an exact target byte, but Maximum Compression typically gets large scanned PDFs under 1MB. If you need to hit a strict cap, try Maximum first and run it again on the result if needed." },
      { q: "Is it safe to upload my PDF here?", a: "Nothing is uploaded. Compression runs in your browser, so the file never reaches our servers — useful for contracts, ID scans, and medical records." },
      { q: "Why is my PDF still large after compressing?", a: "Some PDFs are already optimized, or contain vector graphics and embedded fonts that can't be shrunk much without breaking them. In that case, Split out the pages you actually need before compressing." },
    ],
    relatedSlugs: ["merge-pdf", "split-pdf", "pdf-to-word"],
    bestPractices: [
      "Pick Medium first — it solves 90% of email-attachment problems without visible quality loss.",
      "For resume or portfolio PDFs going through ATS portals, target 1MB and check that text is still selectable afterwards.",
      "If the file is mostly scanned images, Strong compression gives much bigger savings than on text-only PDFs.",
      "Compress once. Re-compressing an already-compressed PDF gives diminishing returns and visible artifacts.",
    ],
    commonMistakes: [
      "Using Strong on a contract or invoice and ending up with blurry signatures or stamps.",
      "Expecting compression to fix a 100MB file that's huge because it has 400 photo pages — split first, then compress each chunk.",
      "Compressing before merging multiple files. Merge first, then compress the final once — fonts dedupe better that way.",
    ],
  },
  {
    slug: "pdf-to-word", kind: "pdf-to-word", title: "PDF to Word",
    short: "Convert a PDF into an editable .docx file.",
    description: "Upload a PDF and we'll convert it to a Word document you can actually edit — text, layout, and most formatting carry over.",
    icon: FileText, accent: "red",
    accept: { "application/pdf": [".pdf"] }, multiple: false,

    seoTitle: "PDF to Word Converter — Free, Keeps Formatting | silentPDF",
    metaDescription: "Convert PDF to editable Word (.docx). Keeps text formatting, tables, and layout intact. Free, no signup.",
    h1: "Convert PDF to Word",
    keywords: ["pdf to word", "pdf to docx", "convert pdf to word", "pdf to word free", "pdf to word with formatting", "pdf to word converter", "pdf to word for resume"],
    intent: "For when someone sent you a PDF and you need to actually change a sentence.",
    whatItDoes:
      "PDF to Word turns your PDF into a .docx file you can open in Microsoft Word, Google Docs, or LibreOffice. Headings, paragraphs, tables, and most images come through. Hand-drawn scans become images inside the doc.",
    whenToUse: [
      "A client emailed a PDF contract and you need to edit one clause.",
      "Your resume is locked in PDF and you want to refresh it for a new role.",
      "A teacher shared notes as a PDF and you want to add to them.",
      "You're copying a long table out of a report into a working draft.",
    ],
    howItWorks: [
      { name: "Upload the PDF", text: "Drop your PDF file — works best with PDFs that have real text, not just scans." },
      { name: "Convert", text: "Our engine analyzes the layout and rebuilds it as a Word document." },
      { name: "Download the .docx", text: "Open it in Word, Google Docs, or any editor that handles .docx files." },
    ],
    benefits: [
      { title: "Real formatting, not plain text", body: "Headings, lists, columns, and tables come through, not just raw paragraphs." },
      { title: "Editable, not pasted screenshots", body: "Text is selectable and editable — change a word, not a whole image." },
      { title: "Works with most resumes and contracts", body: "Designed for the kinds of PDFs people actually need to edit." },
    ],
    useCases: [
      { title: "Updating a resume PDF", body: "Get back to an editable copy when you've lost the original .docx." },
      { title: "Editing a contract", body: "Change a clause or fill in details before re-exporting." },
      { title: "Re-using report content", body: "Pull text and tables out of a long PDF without retyping." },
    ],
    faq: [
      { q: "Will the formatting come through exactly?", a: "Close, not perfect. PDFs were designed for fixed layout and Word is reflowable, so very complex multi-column designs or unusual fonts can shift. Plain reports, resumes, and contracts convert very cleanly." },
      { q: "Does it work on scanned PDFs?", a: "Partially. If your PDF is just an image of paper (no selectable text), the converter will place it as an image inside the .docx. For editable text from a scan, you need OCR first — we'll add a built-in option soon." },
      { q: "Why does this tool need a server?", a: "Reliable PDF-to-Word conversion needs heavy layout analysis that browsers can't do well yet. We process the file securely on our side and delete it right after." },
      { q: "Is my file private?", a: "Yes. Files are processed on our conversion server and removed immediately after the download is ready. They are never stored or used for training." },
      { q: "What file size can I convert?", a: "Up to about 50MB works smoothly. For very large reports, split the PDF first and convert the parts." },
    ],
    relatedSlugs: ["word-to-pdf", "compress-pdf", "merge-pdf"],
    bestPractices: [
      "Use PDFs that were exported from Word, Pages or Google Docs — they convert nearly perfectly because the text layer is intact.",
      "For scanned PDFs, run OCR first; converting an image-only PDF produces a Word file full of pictures, not editable text.",
      "Open the result in Word and run 'Clear All Formatting' on stubborn sections rather than wrestling with inherited styles.",
      "Convert one chapter at a time for books or thesis files. Smaller chunks = fewer layout surprises.",
    ],
    commonMistakes: [
      "Expecting pixel-perfect layout. Complex multi-column magazines and InDesign exports will reflow.",
      "Editing the converted .docx and then re-exporting to PDF expecting the original look — fonts often aren't embedded the same way.",
      "Converting a 300-page scanned contract without OCR and getting a Word file with zero editable text.",
    ],
  },
  {
    slug: "word-to-pdf", kind: "word-to-pdf", title: "Word to PDF",
    short: "Turn .docx files into clean, sharable PDFs.",
    description: "Upload a Word document and we'll render it as a polished PDF with fonts and layout intact.",
    icon: FileType2, accent: "red",
    accept: { "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
    multiple: false, serverOnly: true,

    seoTitle: "Word to PDF Converter — Free .docx to PDF | silentPDF",
    metaDescription: "Convert Word documents to PDF online. Keeps fonts, layout, headers, and images. Free, no signup, no watermark.",
    h1: "Convert Word to PDF",
    keywords: ["word to pdf", "docx to pdf", "convert word to pdf", "word to pdf free", "save word as pdf online"],
    intent: "For when the place you're sending the file insists on PDF and nothing else.",
    whatItDoes:
      "Word to PDF takes your .docx file and exports it as a PDF that looks the same on every device. Fonts, headers, footers, page breaks, and images carry over.",
    whenToUse: [
      "A job portal only accepts PDFs.",
      "You're sending a quote and want a fixed, non-editable layout.",
      "A printer asked for a print-ready PDF, not a Word file.",
      "You want to make sure recipients see exactly the formatting you set.",
    ],
    howItWorks: [
      { name: "Upload your .docx", text: "Drop the Word document you want to convert." },
      { name: "Convert to PDF", text: "We render the document on our side using its embedded fonts and layout." },
      { name: "Download", text: "Get a print-ready PDF that looks the same anywhere you open it." },
    ],
    benefits: [
      { title: "Layout stays put", body: "Page breaks, headers, and footers come through exactly as in Word." },
      { title: "Images and styles preserved", body: "Embedded images, tables, and text styles are kept." },
      { title: "Universal viewing", body: "Anyone can open the PDF — no Word license required." },
    ],
    useCases: [
      { title: "Sending resumes", body: "Make sure recruiters see the layout you designed, not a reflowed mess." },
      { title: "Quotes and proposals", body: "Lock down a number-and-terms layout before sending." },
      { title: "Printing", body: "Hand a printer a file that won't shift when they open it." },
    ],
    faq: [
      { q: "Will my fonts look the same in the PDF?", a: "If your document uses standard or embedded fonts, yes. For unusual fonts, embed them in Word before exporting so the converter can include them. Otherwise readers may see a fallback font." },
      { q: "Are images and tables preserved?", a: "Yes — embedded images, charts, and tables come through. Linked images (pointing to a file on your computer) won't, so embed images directly in Word first." },
      { q: "Does the PDF stay editable?", a: "No. The output is a fixed-layout PDF. That's usually the point — recipients can't accidentally change it. To edit later, keep the original .docx." },
      { q: "Is my Word document stored?", a: "No. Files are converted on our server and deleted right after you download." },
    ],
    relatedSlugs: ["pdf-to-word", "compress-pdf", "protect-pdf"],
  },
  {
    slug: "rotate-pdf", kind: "rotate", title: "Rotate PDF",
    short: "Turn sideways or upside-down pages the right way up.",
    description: "Fix scans that came out sideways. Rotate every page or just the ones that need it, then download.",
    icon: RotateCw, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false, needsRotation: true,

    seoTitle: "Rotate PDF Online — Fix Sideways or Upside-Down Pages | silentPDF",
    metaDescription: "Rotate PDF pages 90°, 180°, or 270° in your browser. Permanent rotation, no watermark, no signup.",
    h1: "Rotate PDF Pages",
    keywords: ["rotate pdf", "rotate pdf pages", "rotate pdf online", "fix sideways pdf", "turn pdf page"],
    intent: "For scans from your phone or a multifunction printer that came out the wrong way around.",
    whatItDoes:
      "Rotate PDF turns the page orientation 90°, 180°, or 270° and saves it permanently. Unlike using a PDF viewer's rotate button, this actually changes the file — the next person who opens it sees the right side up.",
    whenToUse: [
      "You scanned a contract on your phone and every page is sideways.",
      "A friend emailed a receipt that opens upside down.",
      "You exported slides and they came out in landscape when you wanted portrait.",
    ],
    howItWorks: [
      { name: "Upload the PDF", text: "Drop the file with the wrong orientation." },
      { name: "Pick a rotation", text: "Choose 90°, 180°, or 270° — preview updates live." },
      { name: "Save", text: "Download the rotated PDF. Open it anywhere and it stays the right way up." },
    ],
    benefits: [
      { title: "Permanent, not a viewer trick", body: "The change is saved to the file, not just to your screen." },
      { title: "Live preview", body: "See the rotation before you commit." },
      { title: "Browser-side", body: "Your file isn't uploaded anywhere." },
    ],
    useCases: [
      { title: "Phone scans", body: "Fix all those receipts and contracts that came in sideways from your phone." },
      { title: "Multi-page scans", body: "Rotate batches from a flatbed scanner that defaulted to landscape." },
    ],
    faq: [
      { q: "Can I rotate just one page?", a: "Right now the tool rotates all pages by the same angle. To handle just one bad page, use Split to pull it out, rotate it, then Merge it back into the document at the right spot. We're working on per-page rotation as a built-in step." },
      { q: "Does rotation lose quality?", a: "No. Pages are not re-rendered or re-compressed. We just change the rotation flag stored in the PDF, so visual quality is identical to the original." },
      { q: "Will the rotated PDF print correctly?", a: "Yes. Printers read the saved rotation, so pages come out the right way up automatically." },
    ],
    relatedSlugs: ["reorder-pdf", "split-pdf", "merge-pdf"],
  },
  {
    slug: "remove-pages", kind: "remove", title: "Remove Pages",
    short: "Delete pages you don't need without rebuilding the PDF.",
    description: "Pick the pages to drop and download a slimmed-down copy. The original file on your device stays untouched.",
    icon: Trash2, accent: "red",
    accept: { "application/pdf": [".pdf"] }, multiple: false, needsRange: true,

    seoTitle: "Remove Pages from PDF — Delete PDF Pages Online | silentPDF",
    metaDescription: "Delete specific pages from a PDF. Works in your browser, no signup, no watermark, original file stays safe.",
    h1: "Remove Pages from a PDF",
    keywords: ["remove pages from pdf", "delete pdf pages", "remove pdf pages online", "delete pages from pdf", "pdf page remover"],
    intent: "For when there's a blank page, a duplicate scan, or something you don't want to send.",
    whatItDoes:
      "Remove Pages deletes specific pages from a PDF and saves a new file with the rest in order. The pages you keep look exactly the same — no re-rendering, no quality loss.",
    whenToUse: [
      "A scan picked up a blank back page you don't want to send.",
      "You're sharing a report but the cover sheet is internal-only.",
      "Two duplicate pages snuck into a merged file.",
      "You need to strip out a personal page before sharing publicly.",
    ],
    howItWorks: [
      { name: "Upload the PDF", text: "Drop the file you want to clean up." },
      { name: "Type the pages to remove", text: "Use commas and dashes, e.g. 1, 4-6, 9." },
      { name: "Download the result", text: "We build a new PDF without those pages and start the download." },
    ],
    benefits: [
      { title: "Original stays safe", body: "We work on a copy. The file on your computer isn't changed." },
      { title: "Same look, fewer pages", body: "Pages aren't re-rendered, so the kept ones look identical." },
      { title: "Range syntax", body: "Mix single pages and ranges in one go." },
    ],
    useCases: [
      { title: "Hiding internal cover pages", body: "Drop the 'internal use only' sheet before sending externally." },
      { title: "Cleaning up scans", body: "Get rid of blank pages from a flatbed scanner." },
      { title: "Trimming long reports", body: "Cut chapters that aren't relevant to a specific reader." },
    ],
    faq: [
      { q: "What if I delete the wrong page?", a: "Just retry. Your original file on disk is never touched — we always export a new copy. So mistakes only cost the time to run the tool again with the right range." },
      { q: "Can I remove only a section, like pages 12 to 30?", a: "Yes. Type 12-30 in the page range field. You can also mix individual pages and ranges, like 5, 12-30, 45." },
      { q: "Will page numbers update?", a: "Internal PDF page numbering updates automatically. Visible page numbers printed inside the document (like '12 of 60') don't — those are part of the page content itself." },
    ],
    relatedSlugs: ["split-pdf", "reorder-pdf", "merge-pdf"],
  },
  {
    slug: "protect-pdf", kind: "protect", title: "Protect PDF",
    short: "Lock down a PDF before sharing it.",
    description: "Add a privacy seal and prepare your PDF for password-protected delivery. Full AES encryption is part of our Pro tier.",
    icon: Lock, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false, needsPassword: true,

    seoTitle: "Protect PDF with Password — Secure PDF Files Online | silentPDF",
    metaDescription: "Protect a PDF before sharing. Add a privacy marker locally or request AES password encryption from our Pro tier.",
    h1: "Protect a PDF",
    keywords: ["protect pdf", "password protect pdf", "lock pdf", "secure pdf", "encrypt pdf", "pdf password"],
    intent: "For sending contracts, payslips, and ID scans to someone you don't want to accidentally CC the world.",
    whatItDoes:
      "Protect PDF stamps your file as restricted and prepares it for password-protected delivery. The free in-browser mode marks the document for your secured workflow. AES password encryption is available through our backend tier on request.",
    whenToUse: [
      "Sharing a payslip or tax form by email.",
      "Sending NDA or HR documents to a candidate.",
      "Forwarding bank statements to an accountant.",
      "Storing sensitive PDFs in shared cloud folders.",
    ],
    howItWorks: [
      { name: "Upload the PDF", text: "Drop the file you want to protect." },
      { name: "Set a password", text: "Type the password you want recipients to use." },
      { name: "Download the protected file", text: "Share the file plus the password — separately, ideally." },
    ],
    benefits: [
      { title: "Local-first", body: "The free mode runs in your browser. The PDF itself never leaves your device." },
      { title: "Clear privacy marker", body: "Recipients see the document is restricted, not a casual share." },
      { title: "Upgrade path", body: "Need full AES encryption? Request our backend tier — same tool, same flow." },
    ],
    useCases: [
      { title: "Payslips and tax forms", body: "Wrap sensitive HR PDFs before emailing them." },
      { title: "Client deliverables", body: "Send drafts that shouldn't be forwarded around." },
      { title: "Internal handoffs", body: "Mark confidential PDFs in shared drives." },
    ],
    faq: [
      { q: "Is this true password encryption?", a: "The free in-browser mode marks the document as restricted, which is enough for many workflows. True AES password encryption requires server-side processing and is part of our Pro tier — request access from the tool page." },
      { q: "What happens if I lose the password?", a: "Passwords on encrypted PDFs are unrecoverable by design. We don't store passwords, so make sure you keep yours somewhere safe — a password manager is the best option." },
      { q: "Can recipients still copy text from the PDF?", a: "By default, yes. Restricting copy, print, and edit permissions is part of the AES encryption tier. Free protection is focused on access control, not granular permissions." },
    ],
    relatedSlugs: ["watermark-pdf", "esign-pdf", "compress-pdf"],
    bestPractices: [
      "Use a password of 12+ characters mixing letters, numbers and symbols. Short passwords are cracked offline in minutes.",
      "Send the password through a different channel than the file — text the password if you emailed the PDF.",
      "Protect the final, merged version. If you protect each file then merge, only the first file's protection survives.",
      "Keep a clean, unprotected master copy somewhere safe. Lost-password recovery isn't a thing with strong PDF encryption.",
    ],
    commonMistakes: [
      "Using the recipient's name or '1234' as the password.",
      "Putting the password in the same email as the file (defeats the entire point).",
      "Assuming protection prevents printing or copying — that needs owner-level permission controls, not just an open password.",
    ],
  },
  {
    slug: "edit-pdf", kind: "edit", title: "Edit PDF",
    short: "Draw, write, and annotate directly on a PDF.",
    description: "Use the browser editor to draw freehand, add text annotations, and pick colors — then download the marked-up file.",
    icon: Pencil, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false,

    seoTitle: "Edit PDF Online — Draw, Write, Annotate PDFs Free | silentPDF",
    metaDescription: "Edit a PDF in your browser. Draw, add text, highlight, and annotate without installing Acrobat. No signup.",
    h1: "Edit a PDF Online",
    keywords: ["edit pdf", "edit pdf online", "annotate pdf", "draw on pdf", "pdf editor free", "online pdf editor"],
    intent: "For marking up contracts, scribbling on a brief, or filling in forms that didn't come with text fields.",
    whatItDoes:
      "Edit PDF gives you a lightweight editor that runs in your browser. You can draw freehand, add text on top of any page, choose colors, and export the result as a new PDF.",
    whenToUse: [
      "Filling in a printed PDF form that wasn't built with fillable fields.",
      "Marking up a contract with notes before sending it back.",
      "Adding a quick correction on a page without redoing the whole document.",
      "Drawing a signature or initial on a single page.",
    ],
    howItWorks: [
      { name: "Open the PDF", text: "Drop the file you want to mark up — pages appear in the editor." },
      { name: "Draw or type", text: "Use the pen for freehand notes or click to add text boxes anywhere." },
      { name: "Save your edits", text: "Export the annotated PDF — your marks are flattened into the page." },
    ],
    benefits: [
      { title: "No Acrobat install", body: "Everything runs in the browser. No accounts, no plugins." },
      { title: "Flatten on export", body: "Annotations become part of the page, so recipients can't toggle them off." },
      { title: "Private", body: "The PDF stays on your device the whole time." },
    ],
    useCases: [
      { title: "Filling printed forms", body: "Type into a PDF form that wasn't designed to be editable." },
      { title: "Annotating a brief", body: "Mark up a doc and send it back with notes attached." },
      { title: "Quick corrections", body: "Fix a typo on one page without re-exporting from the source app." },
    ],
    faq: [
      { q: "Can I edit existing text in the PDF?", a: "Not directly. This editor adds new annotations and text on top — it doesn't change the underlying text. To rewrite original text, convert the PDF to Word first, edit there, then re-export as PDF." },
      { q: "Are my edits permanent?", a: "When you save, annotations are flattened into the page. Recipients can't toggle them off in their PDF viewer. Keep the original if you want a clean copy." },
      { q: "Is the file uploaded anywhere?", a: "No. Editing happens in your browser, so the PDF and your annotations never leave your device." },
    ],
    relatedSlugs: ["esign-pdf", "watermark-pdf", "merge-pdf"],
  },
  {
    slug: "esign-pdf", kind: "e-sign", title: "E-Sign PDF",
    short: "Sign PDFs with a drawn, typed, or uploaded signature.",
    description: "Sign a PDF with a hand-drawn signature, styled typed name, or an uploaded image, and place it anywhere on the page.",
    icon: PenLine, accent: "red",
    accept: { "application/pdf": [".pdf"] }, multiple: false,

    seoTitle: "E-Sign PDF Online Free — Sign PDF Documents | silentPDF",
    metaDescription: "Sign PDFs online for free. Draw, type, or upload a signature, place it anywhere, download. No signup, no watermark.",
    h1: "E-Sign a PDF Online",
    keywords: ["sign pdf", "e-sign pdf", "esign pdf", "sign pdf online", "electronic signature pdf", "sign contract pdf", "free pdf signature"],
    intent: "For signing a contract, a lease, or a freelance agreement without printing and re-scanning it.",
    whatItDoes:
      "E-Sign PDF lets you add a signature to any PDF page. Draw with your mouse or finger, type a name in a signature-style font, or upload a photo of your existing signature. Position it where the document asks for it and export.",
    whenToUse: [
      "Returning a signed contract to a client.",
      "Signing a lease before the deadline without finding a printer.",
      "Approving a freelancer invoice from your phone.",
      "Initialing every page of a long agreement quickly.",
    ],
    howItWorks: [
      { name: "Upload the PDF", text: "Drop the agreement or contract you need to sign." },
      { name: "Add your signature", text: "Draw with mouse or finger, type your name, or upload a signature image." },
      { name: "Place and download", text: "Drag the signature to the right spot on the page and export the signed PDF." },
    ],
    benefits: [
      { title: "Three signature styles", body: "Draw, type, or upload — whichever feels most like you." },
      { title: "Phone-friendly", body: "Drawing works on touch screens, so signing from a phone is fine." },
      { title: "No printer, no scanner", body: "Skip the print-sign-scan cycle entirely." },
    ],
    useCases: [
      { title: "Freelance contracts", body: "Return signed agreements the same day a client sends them." },
      { title: "Leases and rental forms", body: "Sign and send back before a deadline without a printer." },
      { title: "Internal approvals", body: "Add a quick signature to invoices, POs, or expense forms." },
    ],
    faq: [
      { q: "Are these signatures legally binding?", a: "In most jurisdictions, simple electronic signatures are valid for general business contracts, leases, and consent forms. Some documents — wills, certain real-estate deeds, or anything legally requiring a notary — need a different process. Check your local rules if in doubt." },
      { q: "Can I save my signature for next time?", a: "Signatures are not stored on our side. To reuse one across documents, upload a saved signature image each time, or keep a transparent PNG handy in your files." },
      { q: "Does this work on mobile?", a: "Yes. The drawing canvas supports touch input, so you can sign with your finger or a stylus on a phone or tablet." },
      { q: "Can I sign multiple places?", a: "Yes. Add the signature once and place it as many times as the document needs — every signature line or initial spot." },
    ],
    relatedSlugs: ["edit-pdf", "protect-pdf", "watermark-pdf"],
    bestPractices: [
      "Sign on the actual signature line — drag the signature box so it sits where the printed name appears, not floating above it.",
      "Add a typed date and your printed name next to the signature. Many recipients reject signatures without one or both.",
      "Flatten after signing if you're sending to government, legal or banking portals — they often reject 'live' signature fields.",
      "Use a black or dark navy signature, not blue. Scanners reproduce dark signatures more reliably.",
    ],
    commonMistakes: [
      "Signing every page when only the last page or specific initial boxes are required.",
      "Using a giant signature that overlaps the next paragraph of text.",
      "E-signing a contract draft, then sending the unsigned version by accident — always re-download and double-check the file you attach.",
    ],
  },
  {
    slug: "watermark-pdf", kind: "watermark", title: "Watermark PDF",
    short: "Stamp text like CONFIDENTIAL or DRAFT across every page.",
    description: "Add a custom text watermark with control over opacity, size, color, and rotation — applied to all pages.",
    icon: Stamp, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false,

    seoTitle: "Watermark PDF Online — Add Text Watermark to PDF Free | silentPDF",
    metaDescription: "Add a text watermark to every page of a PDF. Control opacity, size, color, and rotation. Free, no signup.",
    h1: "Add a Watermark to a PDF",
    keywords: ["watermark pdf", "add watermark to pdf", "pdf watermark online", "confidential watermark pdf", "draft watermark pdf"],
    intent: "For marking drafts as DRAFT, contracts as CONFIDENTIAL, or shared work as your own.",
    whatItDoes:
      "Watermark PDF stamps custom text onto every page of your PDF. You control the text, color, opacity, size, and rotation, and the watermark is flattened into the page on export so it can't be toggled off.",
    whenToUse: [
      "Sending a contract draft you don't want misread as final.",
      "Sharing portfolio PDFs you want stamped with your name.",
      "Marking internal documents as CONFIDENTIAL before circulating.",
      "Labelling proofs sent to a client for review.",
    ],
    howItWorks: [
      { name: "Upload the PDF", text: "Drop the file you want to watermark." },
      { name: "Type your watermark text", text: "Pick the wording, color, opacity, rotation, and position." },
      { name: "Apply and download", text: "The watermark is flattened into every page and the file downloads." },
    ],
    benefits: [
      { title: "Cross-page consistency", body: "Same watermark on every page in one pass." },
      { title: "Flattened on export", body: "Recipients can't switch off the watermark layer in a viewer." },
      { title: "Full styling control", body: "Color, opacity, rotation, and size — not just a fixed stamp." },
    ],
    useCases: [
      { title: "Marking drafts", body: "Stamp DRAFT on contracts so nobody acts on the wrong version." },
      { title: "Protecting portfolios", body: "Add your name across photo or design PDFs before sharing." },
      { title: "Confidential labelling", body: "Make 'CONFIDENTIAL' clear on every page of a sensitive report." },
    ],
    faq: [
      { q: "Can the watermark be removed?", a: "We flatten the watermark text directly into the page content, so it can't be toggled off in a normal PDF viewer. Determined editing in Acrobat could still remove it, but that's true of any visual watermark on any file." },
      { q: "Can I add an image watermark, like a logo?", a: "This tool focuses on text watermarks today. For an image, use Edit PDF to place a transparent PNG on each page, or wait for the dedicated logo-watermark mode we're adding next." },
      { q: "Will the watermark print?", a: "Yes. It's part of the page content, so it prints exactly as you see it on screen." },
    ],
    relatedSlugs: ["edit-pdf", "esign-pdf", "protect-pdf"],
  },
  {
    slug: "photo-to-pdf", kind: "photo-to-pdf", title: "Photo to PDF",
    short: "Turn JPGs, PNGs, and WebPs into a single PDF.",
    description: "Drop your photos, arrange the order, pick a page size, and we'll compile them into a clean PDF.",
    icon: Image, accent: "red",
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] }, multiple: true,

    seoTitle: "Photo to PDF Converter — Convert JPG, PNG to PDF Free | silentPDF",
    metaDescription: "Convert photos to PDF online. Drop JPGs or PNGs, reorder, pick a page size, download. Free, no signup.",
    h1: "Convert Photos to PDF",
    keywords: ["photo to pdf", "jpg to pdf", "png to pdf", "image to pdf", "photo to pdf converter", "convert images to pdf"],
    intent: "For turning a stack of phone-camera receipts or photos of paper into one sendable PDF.",
    whatItDoes:
      "Photo to PDF takes one or more images and assembles them into a single PDF. You can drag to reorder, pick A4 or Letter or a custom size, and choose how images fit on each page.",
    whenToUse: [
      "Submitting phone-photo receipts as a single expense report.",
      "Turning a set of design mockups into one shareable PDF.",
      "Compiling scanned-via-camera paperwork for an application.",
      "Sending your portfolio as one PDF instead of 12 image attachments.",
    ],
    howItWorks: [
      { name: "Add your images", text: "Drop JPG, PNG, WebP, or GIF files — multi-select is supported." },
      { name: "Arrange and configure", text: "Drag to reorder, pick page size (A4, Letter, etc.), and choose fit." },
      { name: "Build the PDF", text: "We compile and download a single PDF with one image per page." },
    ],
    benefits: [
      { title: "All major image formats", body: "JPG, PNG, WebP, and GIF all work in the same batch." },
      { title: "Drag to reorder", body: "Order matters for receipts and portfolios — set it before exporting." },
      { title: "Page size control", body: "A4, Letter, or fit-to-image for portfolios and design boards." },
    ],
    useCases: [
      { title: "Expense receipts", body: "Bundle phone photos of receipts into one PDF for accounting." },
      { title: "Portfolios", body: "Send a design or photo portfolio as one PDF, not a folder." },
      { title: "Paper handoffs", body: "Photograph paper documents and turn them into a single PDF to share." },
    ],
    faq: [
      { q: "Can I rearrange the images before generating the PDF?", a: "Yes. Each image becomes a draggable card in the editor. Drag them into whatever order you want — that's the order they'll appear in the PDF." },
      { q: "Will image quality drop?", a: "Images are embedded at their original resolution by default. If you want a smaller file, run the result through Compress PDF afterwards." },
      { q: "Can I put more than one image on a page?", a: "Today the tool places one image per page for clarity. Multi-image layouts (like contact sheets) are on the roadmap." },
    ],
    relatedSlugs: ["compress-pdf", "merge-pdf", "edit-pdf"],
  },
  {
    slug: "reorder-pdf", kind: "reorder", title: "Reorder Pages",
    short: "Drag pages into a new order or delete the ones you don't want.",
    description: "Load a PDF, see thumbnails of every page, drag to rearrange, delete pages, and export a new PDF.",
    icon: ArrowUpDown, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false,

    seoTitle: "Reorder PDF Pages Online — Rearrange PDF Free | silentPDF",
    metaDescription: "Reorder pages in a PDF visually. Drag thumbnails to rearrange, delete pages, export. No signup, no watermark.",
    h1: "Reorder PDF Pages",
    keywords: ["reorder pdf pages", "rearrange pdf", "reorder pdf", "rearrange pdf pages", "pdf page reorder"],
    intent: "For fixing the chapter order in a thesis, or rearranging scans that came in backwards.",
    whatItDoes:
      "Reorder Pages opens your PDF and shows a thumbnail of every page. Drag them into the order you want, delete the ones you don't, and export the rearranged file.",
    whenToUse: [
      "Pages came out of the scanner in the wrong order.",
      "You want chapter 4 before chapter 3 in a draft.",
      "A merged PDF has files in alphabetical, not logical, order.",
      "You're cleaning up before sending a final report.",
    ],
    howItWorks: [
      { name: "Open the PDF", text: "Drop your file — thumbnails of every page load instantly." },
      { name: "Drag pages into order", text: "Move pages around with drag and drop. Delete any you don't need." },
      { name: "Export", text: "Download the rearranged PDF — page numbering updates automatically." },
    ],
    benefits: [
      { title: "Visual thumbnails", body: "See what's on each page before moving it." },
      { title: "Drag, drop, delete", body: "All page edits in one screen." },
      { title: "Local processing", body: "Nothing is uploaded — everything is rendered in your browser." },
    ],
    useCases: [
      { title: "Fixing scan order", body: "Repair PDFs from auto-feeders that picked pages up in the wrong sequence." },
      { title: "Drafts and reports", body: "Move sections around without going back to the source file." },
      { title: "Cleaning merged PDFs", body: "Reorder the result of a Merge so it reads correctly." },
    ],
    faq: [
      { q: "Does this upload my PDF?", a: "No. Thumbnails are rendered in your browser and the page rearrangement happens locally. The PDF never reaches our servers." },
      { q: "What's the difference between this and Split?", a: "Split exports a subset of pages as a new file. Reorder Pages keeps all (or most) of the pages but changes their order, with optional delete. Use Reorder when sequence is the problem; use Split when you only need a few pages." },
      { q: "Will the rearranged PDF look identical?", a: "Yes. Pages are copied, not re-rendered. Text stays selectable, images stay sharp, and fonts are unchanged." },
    ],
    relatedSlugs: ["merge-pdf", "split-pdf", "remove-pages"],
  },
  {
    slug: "export-pdf", kind: "export", title: "Export & Rename",
    short: "Preview a PDF and export it under a clean new filename.",
    description: "Open a PDF, check the page previews, and download it under a renamed copy. Handy for quick inspection and saving.",
    icon: Download, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false,

    seoTitle: "Rename PDF Online — Preview and Export PDF | silentPDF",
    metaDescription: "Open, preview, and rename a PDF before downloading. Quick way to inspect and save PDFs with clean filenames.",
    h1: "Export and Rename a PDF",
    keywords: ["rename pdf", "preview pdf", "export pdf", "save pdf with new name"],
    intent: "For replacing those 'document_final_v3 (2).pdf' filenames before you send them out.",
    whatItDoes:
      "Export & Rename opens your PDF, shows page previews so you can confirm what's inside, and lets you save it under a new filename. Fast inspection and clean naming without a heavy PDF viewer.",
    whenToUse: [
      "Renaming a downloaded PDF before forwarding it.",
      "Checking the contents of a PDF without opening a full reader.",
      "Tidying up filenames before uploading to a portal that displays them.",
    ],
    howItWorks: [
      { name: "Open the PDF", text: "Drop the file — page previews appear so you can verify the contents." },
      { name: "Type a clean filename", text: "Give the file a name that makes sense for the recipient." },
      { name: "Download", text: "Save the PDF under its new name." },
    ],
    benefits: [
      { title: "Preview first", body: "Confirm it's the right file before sending." },
      { title: "Clean filenames", body: "Stop sending files called 'scan_0001.pdf'." },
      { title: "Lightweight", body: "Faster than opening a full PDF reader for a quick check." },
    ],
    useCases: [
      { title: "Tidying downloads", body: "Rename bank statements, invoices, and forms in seconds." },
      { title: "Portal uploads", body: "Match the filename a portal expects before submitting." },
    ],
    faq: [
      { q: "Why use this instead of renaming in Finder or Explorer?", a: "Mostly for the preview. Renaming a file blindly is risky if you have several similar PDFs. This tool shows you what's inside before you commit to a name, so you don't end up sending the wrong file with a confident filename." },
      { q: "Does this re-encode the PDF?", a: "No. The file's bytes are unchanged — only the filename you download as is different. Use Compress PDF if you actually want to shrink it." },
    ],
    relatedSlugs: ["compress-pdf", "merge-pdf", "reorder-pdf"],
  },
  {
    slug: "addpages-pdf", kind: "addpages", title: "Add Pages",
    short: "Insert blank pages or add pages from another PDF.",
    description: "Add blank pages where you need them, or insert pages from another PDF, then reorder the result.",
    icon: FilePlus, accent: "blue",
    accept: { "application/pdf": [".pdf"] }, multiple: false,

    seoTitle: "Add Pages to PDF — Insert Blank or PDF Pages Free | silentPDF",
    metaDescription: "Insert pages into a PDF. Add blank pages or pages from another PDF, reorder, download. No signup.",
    h1: "Add Pages to a PDF",
    keywords: ["add pages to pdf", "insert pdf pages", "add blank page to pdf", "insert pages into pdf"],
    intent: "For when you need to add a cover page, a signature page, or a missing section.",
    whatItDoes:
      "Add Pages inserts new pages — blank or from another PDF — into your existing document at the position you choose. After inserting, you can drag pages around to fine-tune the order.",
    whenToUse: [
      "Adding a cover page before sending a report.",
      "Inserting a signature page into a contract.",
      "Adding a missing chapter from a separate PDF.",
      "Slotting an appendix into the back of a document.",
    ],
    howItWorks: [
      { name: "Open the base PDF", text: "Drop the document you want to add pages to." },
      { name: "Insert pages", text: "Add blank pages or pull pages in from another PDF." },
      { name: "Reorder and export", text: "Drag pages into final order and download the new PDF." },
    ],
    benefits: [
      { title: "Blank or imported pages", body: "Insert empty pages for signing, or real pages from another file." },
      { title: "Inline reordering", body: "Adjust the order before exporting — no extra tool needed." },
      { title: "Browser-side", body: "Your files stay on your device." },
    ],
    useCases: [
      { title: "Cover and title pages", body: "Add a polished cover to a report or proposal." },
      { title: "Signature pages", body: "Slot in a blank page for hand-signing later." },
      { title: "Appendices", body: "Attach reference material to the end of a document." },
    ],
    faq: [
      { q: "Can I add pages from a different PDF?", a: "Yes. Pick the second PDF in the import step, choose which pages to bring over, and they'll be inserted at the position you set in the base document." },
      { q: "Will the inserted pages match the size of the base PDF?", a: "Blank pages match the base document's page size. Imported pages keep their original dimensions — if you need them to match, use Word to PDF or a viewer to resize first." },
    ],
    relatedSlugs: ["merge-pdf", "reorder-pdf", "remove-pages"],
  },
  {
    slug: "Removewatermark-pdf", kind: "removewatermark", title: "Remove Watermark",
    short: "Remove text watermarks from a PDF.",
    description: "Strip text watermarks like 'CONFIDENTIAL' or 'DRAFT' from PDFs you have the right to clean up.",
    icon: Eraser, accent: "red",
    accept: { "application/pdf": [".pdf"] }, multiple: false,

    seoTitle: "Remove Watermark from PDF Online Free | silentPDF",
    metaDescription: "Remove text watermarks from a PDF. Strip DRAFT, CONFIDENTIAL, and similar overlays from documents you control.",
    h1: "Remove a Watermark from a PDF",
    keywords: ["remove watermark from pdf", "remove pdf watermark", "delete watermark pdf", "remove draft watermark pdf"],
    intent: "For cleaning up DRAFT or internal-only watermarks once a document is finalized.",
    whatItDoes:
      "Remove Watermark scans your PDF for text-based watermark overlays and removes them. Works best on plain text watermarks added by tools like silentPDF, Word, or Acrobat.",
    whenToUse: [
      "A draft is now final and the DRAFT watermark needs to go.",
      "An internal template stamped pages with a watermark you no longer need.",
      "You're re-using your own watermarked PDFs after approval.",
    ],
    howItWorks: [
      { name: "Upload the PDF", text: "Drop the watermarked file." },
      { name: "Detect the watermark", text: "We scan for text overlays repeated on multiple pages." },
      { name: "Remove and download", text: "We rebuild the PDF without the watermark layer and download it." },
    ],
    benefits: [
      { title: "Targets repeating overlays", body: "Catches the kind of watermark that appears the same on every page." },
      { title: "Keeps real content intact", body: "We focus on the watermark layer, not the document's body text." },
      { title: "Local processing", body: "Files don't leave your browser." },
    ],
    useCases: [
      { title: "Finalizing drafts", body: "Strip DRAFT once a document is signed off." },
      { title: "Re-using templates", body: "Clean up watermarked templates after they're approved internally." },
    ],
    faq: [
      { q: "Only remove watermarks from documents you have the right to modify.", a: "This tool exists for legitimate cleanup — drafts you've now finalized, internal templates, or your own watermarked exports. Removing watermarks from someone else's copyrighted material is not a use we support, and may be illegal where you are." },
      { q: "Will it catch image-based watermarks?", a: "Detection works best on text watermarks. Image or logo watermarks merged into the page content may not be fully removed — those usually need a manual edit in a PDF editor." },
      { q: "Will body text get removed by accident?", a: "We focus on overlays that repeat across pages with a fixed style — typical watermark behavior. Body text doesn't match that pattern, so it's not affected." },
    ],
    relatedSlugs: ["watermark-pdf", "edit-pdf", "compress-pdf"],
  },
];

export function getTool(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}
