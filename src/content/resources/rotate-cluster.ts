import { ContentAsset } from "../ContentAsset";

export const ROTATE_CLUSTER: ContentAsset[] = [
  {
    slug: "how-to-rotate-pdf-pages",
    title: "How To Rotate PDF Pages",
    seoTitle: "Rotate PDF Pages Online — Fix Sideways PDFs | silentPDF",
    metaDescription: "Learn how to rotate PDF pages correctly using SilentPDF's online tool.",
    contentType: "problem-solving",
    category: "guides",
    cluster: "rotate",
    publishedAt: "2026-06-15",
    readMinutes: 4,
    definition: "Rotating a PDF changes the page orientation metadata so the pages display correctly in viewers.",
    quickAnswer: "Upload your PDF, select the rotation angle (90°, 180°, 270°) and download the rotated file.",
    summary: "Fix sideways or upside‑down PDFs quickly.",
    useCases: ["Scans from phone", "Incorrectly oriented reports"],
    stepByStep: [
      { name: "Step 1", text: "Upload the PDF you need to rotate." },
      { name: "Step 2", text: "Choose the rotation angle and preview the result." },
      { name: "Step 3", text: "Download the corrected PDF." }
    ],
    body: [{ type: "p", text: "Rotating a PDF in the browser preserves original quality because no re‑rendering occurs." }],
    faq: [{ q: "Can I rotate a single page?", a: "Current tool rotates all pages; split‑rotate‑merge is a workaround." }],
    parentToolSlug: "rotate-pdf",
    relatedToolSlugs: ["split-pdf", "merge-pdf"],
    relatedAssetSlugs: [],
    relatedProgrammaticSlug: "rotate-pdf"
  }
];
