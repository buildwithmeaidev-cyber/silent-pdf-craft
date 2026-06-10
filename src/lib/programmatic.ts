// Programmatic SEO landing pages — angle-specific variants of core tools.
// Each variant reuses the parent tool's component with preset options, but ships
// its own URL, title, meta, H1, FAQ, and copy aimed at one specific intent.

export interface ProgrammaticVariant {
  slug: string;            // URL slug (root-level), e.g. "compress-pdf-for-email"
  parentSlug: string;      // links back to TOOLS entry
  title: string;           // H1 + nav label
  seoTitle: string;
  metaDescription: string;
  intent: string;          // one-line who/why
  scenario: string;        // 2-3 sentence relatable opener
  bullets: string[];       // 3-5 short angle-specific points
  howItWorks: { name: string; text: string }[];
  faq: { q: string; a: string }[];
  preset?: Record<string, unknown>; // optional preset for the tool (e.g. compression level)
  relatedVariants?: string[];       // sibling slugs
}

export const PROGRAMMATIC: ProgrammaticVariant[] = [
  // ---------- COMPRESS ----------
  {
    slug: "compress-pdf-for-email",
    parentSlug: "compress-pdf",
    title: "Compress PDF for Email",
    seoTitle: "Compress PDF for Email — Shrink Attachments Under 25MB | silentPDF",
    metaDescription:
      "Gmail and Outlook cap attachments around 25MB. Shrink your PDF in your browser to fit, no signup, no watermark.",
    intent: "For when your email bounces back with 'attachment too large'.",
    scenario:
      "Gmail caps attachments at 25MB. Outlook is closer to 20. A two-page scan from your phone can easily blow past both. This page is tuned for that one job — get the PDF small enough to actually send.",
    bullets: [
      "Hits the 25MB Gmail / 20MB Outlook ceiling in one pass.",
      "Keeps text crisp on screen — fine for reading on any client.",
      "Runs locally so contracts and ID scans never leave your browser.",
      "No signup, no watermark, no daily limit.",
    ],
    howItWorks: [
      { name: "Drop your PDF", text: "Add the attachment that bounced." },
      { name: "Pick Balanced or Maximum", text: "Maximum gets you under 25MB on most scans; Balanced keeps things sharper." },
      { name: "Download and reply", text: "We rebuild the file in your browser. Attach the smaller copy and resend." },
    ],
    faq: [
      { q: "Why did my email say 'attachment too large'?", a: "Gmail's hard cap is 25MB after encoding, which means your raw file usually needs to be under ~22MB. Outlook and many business mail servers cap lower — 10 to 20MB. Compressing to Maximum almost always clears those." },
      { q: "Will compressing make my scan unreadable?", a: "Balanced keeps small text legible on screen. Maximum softens images a little but text stays sharp. If you need print quality, try Balanced first." },
      { q: "Is it safe to compress confidential PDFs here?", a: "Yes. Compression happens in your browser. The PDF is never uploaded to a server." },
    ],
    preset: { level: "maximum" },
    relatedVariants: ["compress-pdf-to-1mb", "compress-pdf-for-resume"],
  },
  {
    slug: "compress-pdf-to-1mb",
    parentSlug: "compress-pdf",
    title: "Compress PDF to 1MB",
    seoTitle: "Compress PDF to 1MB Online — Shrink Files Under 1MB | silentPDF",
    metaDescription:
      "Government forms and visa portals often cap PDF uploads at 1MB. Compress your PDF under 1MB in your browser, free.",
    intent: "For visa portals, SSC forms, and any upload that won't accept files over 1MB.",
    scenario:
      "A lot of government forms — visa applications, SSC, UPSC, university portals — refuse anything over 1MB. This page targets that exact ceiling. You won't always hit it in one click (scanned color PDFs are stubborn), but Maximum gets most files under.",
    bullets: [
      "Designed to push large scans under the 1MB upload cap.",
      "If one pass isn't enough, run it twice — second pass usually clinches it.",
      "Text stays clear; image-heavy scans soften slightly.",
      "Works on a phone browser too.",
    ],
    howItWorks: [
      { name: "Upload the PDF", text: "Add the file your portal is rejecting." },
      { name: "Use Maximum compression", text: "This page defaults to Maximum, the smallest preset." },
      { name: "Check the size, re-run if needed", text: "If it's still over 1MB, drop the result back in and compress once more." },
    ],
    faq: [
      { q: "Can you guarantee my PDF will be exactly under 1MB?", a: "No tool can promise an exact byte target — PDFs vary too much. Maximum gets most scanned PDFs under 1MB. If yours doesn't, splitting out unused pages first usually does the trick." },
      { q: "Why is my PDF still huge after compressing?", a: "Already-optimized PDFs (anything exported clean from Word or InDesign) have little fat to trim. The bytes are usually fonts and vectors that can't shrink without breaking. Try removing pages you don't need first." },
      { q: "Will the portal accept the compressed PDF?", a: "Yes — the output is a standard PDF. Compression only changes file size, not the format or layout." },
    ],
    preset: { level: "maximum" },
    relatedVariants: ["compress-pdf-for-email", "compress-pdf-for-resume"],
  },
  {
    slug: "compress-pdf-for-resume",
    parentSlug: "compress-pdf",
    title: "Compress PDF for Resume",
    seoTitle: "Compress Resume PDF — Shrink CV File Size for Job Portals | silentPDF",
    metaDescription:
      "Job portals like LinkedIn, Naukri, and ATS systems often cap resume PDFs at 2MB. Shrink yours without losing crisp text.",
    intent: "For when LinkedIn or an ATS says your resume PDF is too big to upload.",
    scenario:
      "Most ATS upload limits sit between 1MB and 2MB. A resume designed in Canva or with a photo on it can easily land at 4–8MB. This page is tuned for that — small enough to upload, sharp enough that recruiters can still read your name.",
    bullets: [
      "Targets the 2MB ATS / 1MB Naukri-style cap.",
      "Keeps text crisp — recruiters skim for keywords first.",
      "Handles photo-on-resume designs without making the photo blocky.",
      "Output is a clean PDF, no watermark across page one.",
    ],
    howItWorks: [
      { name: "Upload your resume PDF", text: "Drop the version your portal rejected." },
      { name: "Use Balanced", text: "Balanced is the right tradeoff for resumes — keeps text sharp, trims the photo." },
      { name: "Re-upload to the portal", text: "Download the smaller PDF and resubmit." },
    ],
    faq: [
      { q: "Will ATS systems still parse my resume after compression?", a: "Yes. We don't rasterize text — selectable text stays selectable. ATS keyword parsing works exactly the same on the compressed file." },
      { q: "Should I use Maximum or Balanced for a resume?", a: "Balanced. Resumes are mostly text, so the savings from Maximum aren't worth the slight softening. Reach for Maximum only if Balanced still leaves you over the cap." },
      { q: "Why is my Canva resume so large?", a: "Canva embeds high-res images and full font files. Even a one-page resume can hit 6MB. Compression typically gets it under 2MB without touching the layout." },
    ],
    preset: { level: "balanced" },
    relatedVariants: ["compress-pdf-for-email", "compress-pdf-to-1mb"],
  },

  // ---------- MERGE ----------
  {
    slug: "merge-2-pdfs",
    parentSlug: "merge-pdf",
    title: "Merge 2 PDFs",
    seoTitle: "Merge 2 PDFs into One — Combine Two PDF Files Free | silentPDF",
    metaDescription:
      "Combine two PDF files into one in seconds. Reorder, preview, and download — all in your browser, no signup.",
    intent: "For the simplest case: you have file A and file B, and you want one PDF out.",
    scenario:
      "Sometimes it's just two files. A cover letter and a resume. A signed page and the rest of the contract. A scanned ID and a utility bill. This page is the no-fuss version of that.",
    bullets: [
      "Pick file A and file B, decide which comes first.",
      "Pages stay exactly as they are — no re-render, no font swap.",
      "Output is one clean PDF, no watermark.",
      "Runs in your browser; nothing uploaded.",
    ],
    howItWorks: [
      { name: "Add both PDFs", text: "Drop the two files into the upload area." },
      { name: "Set the order", text: "Use the arrows to put them in the order you want." },
      { name: "Merge and download", text: "We stitch them locally and download the combined PDF." },
    ],
    faq: [
      { q: "Which file becomes the first page?", a: "Whichever file is at the top of the list. Use the up/down arrows on each card to swap if it landed in the wrong order." },
      { q: "Do signatures and form fields carry over?", a: "Yes — existing signatures and fields are preserved. If the two PDFs come from very different tools, flatten them first to be safe." },
      { q: "Can I merge a PDF and a scan from my phone?", a: "Yes, as long as the scan is already a PDF. If it's a JPG/PNG, convert it first with Photo to PDF, then merge." },
    ],
    relatedVariants: ["merge-multiple-pdfs"],
  },
  {
    slug: "merge-multiple-pdfs",
    parentSlug: "merge-pdf",
    title: "Merge Multiple PDFs",
    seoTitle: "Merge Multiple PDFs Online — Combine Many PDF Files | silentPDF",
    metaDescription:
      "Combine 5, 10, or 20+ PDFs into one document. Reorder freely, no signup, no watermark, runs in your browser.",
    intent: "For when you have a folder full of PDFs that need to become one.",
    scenario:
      "A month of receipts. A semester of lecture notes. Twelve scanned pages a vendor sent one at a time. This page handles the messy case where you have many files and need to stitch them together in the right order.",
    bullets: [
      "No fixed cap on file count — limited only by your computer's memory.",
      "Drag-to-reorder so you can group by date, sender, or topic.",
      "Duplicates are fine — add the same file twice if you need it in two places.",
      "Output is one clean PDF, no watermark.",
    ],
    howItWorks: [
      { name: "Add all the PDFs", text: "Drop them in. You can keep adding files until the list looks right." },
      { name: "Sort the list", text: "Move each file up or down. Top of the list = first page." },
      { name: "Merge and download", text: "We combine everything in your browser and download the merged file." },
    ],
    faq: [
      { q: "How many PDFs can I merge at once?", a: "There's no fixed limit. 20–30 average-sized files is comfortable on most laptops. If your browser slows down with a huge batch, merge in two passes — combine half, then combine the halves." },
      { q: "Can I reorder pages, not just files?", a: "This tool merges full files in the order you set. To shuffle individual pages, use Reorder Pages after merging." },
      { q: "Will the merged PDF be searchable?", a: "Yes. Selectable text from each source PDF stays selectable in the merged file." },
    ],
    relatedVariants: ["merge-2-pdfs"],
  },

  // ---------- PDF TO WORD ----------
  {
    slug: "pdf-to-word-online",
    parentSlug: "pdf-to-word",
    title: "PDF to Word Online",
    seoTitle: "PDF to Word Online — Free PDF to DOCX Converter | silentPDF",
    metaDescription:
      "Convert PDF to editable Word (.docx) online. Keeps headings, lists, and tables where possible. No email, no signup.",
    intent: "For when you need to actually edit a PDF, not just read it.",
    scenario:
      "Someone sent you a PDF and asked for 'a few small edits'. Opening it directly in Word usually mangles the layout. This page does the conversion cleanly — text becomes text, lists stay lists, tables stay tables.",
    bullets: [
      "Real .docx output, opens in Word, Pages, and Google Docs.",
      "Headings, lists, and basic tables are preserved.",
      "No email gate, no 'create an account to download'.",
      "Works on scanned PDFs too (text recognition runs automatically).",
    ],
    howItWorks: [
      { name: "Upload your PDF", text: "Drop the file you need to edit." },
      { name: "We convert it to .docx", text: "Text, layout, and basic tables come over as editable Word content." },
      { name: "Download and edit", text: "Open the .docx in Word, Pages, or Google Docs and edit normally." },
    ],
    faq: [
      { q: "Will the formatting be identical to the PDF?", a: "Headings, paragraphs, lists, and simple tables come through cleanly. Multi-column magazine layouts and complex form designs may need light cleanup in Word. Single-column documents convert almost perfectly." },
      { q: "Does it work on scanned PDFs?", a: "Yes. If the PDF is image-only, OCR runs automatically so you get editable text in the .docx." },
      { q: "Is my PDF kept anywhere after conversion?", a: "No. Files are processed for the conversion and then dropped. We don't log file names or store the contents." },
    ],
    relatedVariants: ["pdf-to-word-for-resume", "pdf-to-word-with-formatting"],
  },
  {
    slug: "pdf-to-word-for-resume",
    parentSlug: "pdf-to-word",
    title: "PDF to Word for Resume",
    seoTitle: "Convert Resume PDF to Word (.docx) — Edit Your CV Free | silentPDF",
    metaDescription:
      "Convert your resume PDF back to an editable Word .docx. Keep your formatting, fix typos, then re-export.",
    intent: "For when you only have the PDF of your resume and need to update it.",
    scenario:
      "You finalized your resume two years ago, exported the PDF, and lost the original. Now you need to swap in a new job. This converts the PDF back into a Word file you can actually edit — fonts, headings, and bullet structure usually survive intact.",
    bullets: [
      "Single-column resumes convert almost perfectly.",
      "Bullets, headings, and section spacing are preserved.",
      "Re-export to PDF from Word when you're done; ATS will read it fine.",
      "No watermark, no signup.",
    ],
    howItWorks: [
      { name: "Upload your resume PDF", text: "Drop the PDF you want to edit." },
      { name: "Convert to .docx", text: "We rebuild the text, headings, and bullets as editable Word content." },
      { name: "Edit and re-export", text: "Open in Word or Google Docs, update the details, save as PDF when you're done." },
    ],
    faq: [
      { q: "Will my resume's design survive the conversion?", a: "Simple, single-column resumes survive almost perfectly. Two-column Canva-style designs sometimes need light cleanup — usually re-aligning the sidebar. The text content always comes over correctly." },
      { q: "Will the converted Word file be ATS-friendly?", a: "Yes — the text is real selectable text, not images. Re-export from Word back to PDF before submitting, since ATS prefers PDF." },
      { q: "Why does the original PDF look better than the Word version?", a: "PDFs lock layout exactly; Word reflows. Small spacing shifts are normal. Re-exporting the edited Word back to PDF usually restores the look." },
    ],
    relatedVariants: ["pdf-to-word-online", "pdf-to-word-with-formatting"],
  },
  {
    slug: "pdf-to-word-with-formatting",
    parentSlug: "pdf-to-word",
    title: "PDF to Word with Formatting",
    seoTitle: "PDF to Word with Formatting — Preserve Layout, Tables & Fonts | silentPDF",
    metaDescription:
      "Convert PDF to Word and keep formatting: headings, tables, fonts, and spacing. Free, browser-based, no signup.",
    intent: "For when 'just the text' isn't enough — you need the layout, too.",
    scenario:
      "Reports, contracts, and brochures depend on their layout to make sense. This page focuses on layout-preserving conversion: tables stay tables, headings stay headings, page breaks land in the right place.",
    bullets: [
      "Tables, headings, and lists come through as proper Word structures.",
      "Font choices are matched as closely as possible to local equivalents.",
      "Page breaks are honored.",
      "Works on both text-PDFs and scanned PDFs (OCR).",
    ],
    howItWorks: [
      { name: "Upload the PDF", text: "Drop the document you want to convert." },
      { name: "We preserve structure", text: "Tables, headings, lists, and page layout are mapped to Word equivalents." },
      { name: "Download the .docx", text: "Open in Word and edit — the structure is already there." },
    ],
    faq: [
      { q: "Are tables really preserved?", a: "Simple grid tables convert as editable Word tables. Heavily styled tables (merged cells, nested tables) may need light cleanup, but the content always comes over." },
      { q: "What about fonts I don't have installed?", a: "Word substitutes the closest match available on your system. The text reads identically; only the visual font changes." },
      { q: "Will images and charts survive?", a: "Yes. Images embed as pictures. Charts come over as images, not editable chart objects." },
    ],
    relatedVariants: ["pdf-to-word-online", "pdf-to-word-for-resume"],
  },

  // ---------- E-SIGN ----------
  {
    slug: "sign-pdf-online",
    parentSlug: "esign-pdf",
    title: "Sign PDF Online",
    seoTitle: "Sign PDF Online Free — Add Signature to PDF in Browser | silentPDF",
    metaDescription:
      "Sign a PDF online for free. Type, draw, or upload your signature. Runs in your browser — no DocuSign account, no email.",
    intent: "For one-off signatures: NDAs, offer letters, school forms.",
    scenario:
      "Not every signature needs DocuSign. Sometimes it's one form, one signature, and you just want it done. This page handles that case — open the PDF, drop your signature on the right spot, download.",
    bullets: [
      "Type, draw, or upload a signature image.",
      "Drag it onto any page, any position.",
      "Output is a flattened PDF that opens in any reader.",
      "No account, no email, nothing leaves your browser.",
    ],
    howItWorks: [
      { name: "Upload the PDF", text: "Drop the document you need to sign." },
      { name: "Add your signature", text: "Type your name, draw with mouse/touch, or upload a transparent PNG." },
      { name: "Place and download", text: "Drag the signature to the right spot, then download the signed PDF." },
    ],
    faq: [
      { q: "Is a typed signature legally valid?", a: "In most jurisdictions, yes — e-signatures (typed, drawn, or image) are recognized under laws like the ESIGN Act (US) and eIDAS (EU) for everyday contracts. Specific cases like real-estate deeds may require notarization." },
      { q: "Can I sign on my phone?", a: "Yes. Draw mode supports touchscreens — sign with your finger or a stylus." },
      { q: "Will the signature be locked in?", a: "Yes. The output is flattened, so the signature sits on the page as part of the PDF and can't be moved by the recipient." },
    ],
    relatedVariants: ["sign-contract-pdf"],
  },
  {
    slug: "sign-contract-pdf",
    parentSlug: "esign-pdf",
    title: "Sign a Contract PDF",
    seoTitle: "Sign Contract PDF Online — Add Legal E-Signature Free | silentPDF",
    metaDescription:
      "Sign contracts as a PDF in your browser. Add signature, initials, and date. ESIGN/eIDAS-compatible, no account needed.",
    intent: "For NDAs, freelance contracts, and offer letters that just need a clean signature.",
    scenario:
      "Most contracts circulating over email don't need a full e-signature platform. A signature, your initials on a couple of pages, and the date — that's usually enough. This page is for that.",
    bullets: [
      "Signature + initials + date stamp on the same pass.",
      "Place on multiple pages without re-uploading.",
      "Recipient sees a normal flattened PDF — opens in any reader.",
      "Runs locally; the contract never touches a server.",
    ],
    howItWorks: [
      { name: "Upload the contract", text: "Drop the PDF you need to sign and return." },
      { name: "Sign, initial, date", text: "Add a signature, optional initials on each page, and the date." },
      { name: "Download and reply", text: "Save the signed PDF and email it back." },
    ],
    faq: [
      { q: "Is this signature legally binding?", a: "For most everyday contracts — NDAs, freelance agreements, offer letters — yes, under ESIGN (US) and eIDAS (EU). For deeds, wills, or notarized documents, a qualified e-signature platform is required." },
      { q: "Should I flatten the signed PDF before sending?", a: "We flatten by default — the signature becomes part of the page, not an editable annotation. That's what most counterparties expect." },
      { q: "Can I sign on behalf of my company?", a: "Yes. Use your own signature; add your printed name and title as a text annotation alongside it." },
    ],
    relatedVariants: ["sign-pdf-online"],
  },

  // ---------- WATERMARK ----------
  {
    slug: "watermark-pdf-online",
    parentSlug: "watermark-pdf",
    title: "Watermark PDF Online",
    seoTitle: "Watermark PDF Online — Add Text or Logo Watermark Free | silentPDF",
    metaDescription:
      "Add a text or image watermark to every page of a PDF. Adjust opacity, angle, and position. Free, browser-based.",
    intent: "For when you need to mark a PDF as DRAFT, CONFIDENTIAL, or stamp it with a logo.",
    scenario:
      "Sending a draft to a client. Sharing financials with a 'CONFIDENTIAL' overlay. Branding a quote with your logo. This page adds a clean watermark to every page in one pass.",
    bullets: [
      "Text or image (PNG with transparency works best).",
      "Set opacity, angle, and position per page.",
      "Applies to all pages in one go.",
      "Output keeps text searchable underneath.",
    ],
    howItWorks: [
      { name: "Upload the PDF", text: "Drop the document you want to watermark." },
      { name: "Choose text or image", text: "Type your watermark text, or upload a logo PNG." },
      { name: "Adjust and download", text: "Tweak opacity and angle, then download the watermarked PDF." },
    ],
    faq: [
      { q: "Will the watermark show on print?", a: "Yes. The watermark is embedded in each page, so it appears on screen, in print, and on copies of the PDF." },
      { q: "Can I watermark only certain pages?", a: "This page applies the watermark to every page. To target a range, split the PDF first, watermark the section, and merge back." },
      { q: "Will the text under the watermark stay searchable?", a: "Yes. Watermarks are layered on top — the underlying text remains selectable and searchable." },
    ],
    relatedVariants: ["add-logo-watermark-pdf"],
  },
  {
    slug: "add-logo-watermark-pdf",
    parentSlug: "watermark-pdf",
    title: "Add Logo Watermark to PDF",
    seoTitle: "Add Logo Watermark to PDF — Brand PDF Files with Your Logo | silentPDF",
    metaDescription:
      "Stamp your logo on every page of a PDF. Upload a PNG logo, set opacity and position, download the branded PDF.",
    intent: "For consultants, agencies, and freelancers who send branded PDF quotes and reports.",
    scenario:
      "Your proposal goes out as a PDF. So does the monthly report. Putting your logo on every page makes them feel finished — and reminds the client whose work they're reading. This page is built for that one task.",
    bullets: [
      "Upload your logo as a PNG (transparent background works best).",
      "Place top-right, top-left, center, or footer.",
      "Set opacity so it sits behind the content without distracting.",
      "Applies to every page in one pass.",
    ],
    howItWorks: [
      { name: "Upload the PDF", text: "Drop the document you want to brand." },
      { name: "Upload your logo", text: "PNG with a transparent background gives the cleanest result." },
      { name: "Pick position and opacity", text: "Drop it in a corner at around 30–50% opacity for a subtle stamp." },
    ],
    faq: [
      { q: "What's the best logo format to upload?", a: "PNG with a transparent background. JPG works but adds a white box around the logo. SVG is not currently supported." },
      { q: "Will the logo fit different page sizes?", a: "Yes. Position is computed per page, so portrait and landscape pages both place the logo in the corner you picked." },
      { q: "Can I make the logo bigger?", a: "Use the size slider after uploading. Around 100–150px wide works for most A4 documents." },
    ],
    relatedVariants: ["watermark-pdf-online"],
  },
];

export function getProgrammatic(slug: string) {
  return PROGRAMMATIC.find((p) => p.slug === slug);
}
