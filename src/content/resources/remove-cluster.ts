import { ContentAsset } from "../ContentAsset";

export const REMOVE_CLUSTER: ContentAsset[] = [
  {
    slug: "how-to-remove-pages-from-pdf",
    title: "Remove Pages from PDF",
    seoTitle: "Remove Pages from PDF Online — Delete Unwanted Pages Free | SilentPDF",
    metaDescription: "Learn how to delete specific pages from a PDF without re‑uploading or watermarking. Fast, client‑side.",
    contentType: "problem-solving",
    category: "guides",
    cluster: "remove",
    publishedAt: "2026-06-25",
    readMinutes: 4,
    definition: "Removing pages creates a new PDF that excludes the selected pages while keeping the rest untouched.",
    quickAnswer: "Upload the PDF, specify page ranges to delete, and download the trimmed file.",
    summary: "Delete unwanted pages quickly and keep the original file safe.",
    useCases: [],
    stepByStep: [
      { name: "Step 1", text: "Upload the PDF you want to edit." },
      { name: "Step 2", text: "Enter the pages or ranges to remove (e.g., 2-4, 7)." },
      { name: "Step 3", text: "Download the new PDF without those pages." }
    ],
    body: [],
    faq: [],
    parentToolSlug: "remove-pages",
    relatedToolSlugs: ["merge-pdf", "split-pdf", "compress-pdf"],
    relatedAssetSlugs: [],
    relatedProgrammaticSlug: "remove-pages"
  }
];
