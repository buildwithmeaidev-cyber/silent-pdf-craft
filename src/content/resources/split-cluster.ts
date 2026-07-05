import { ContentAsset } from "../ContentAsset";

export const SPLIT_CLUSTER: ContentAsset[] = [
  {
    slug: "how-to-split-large-pdf-files",
    title: "How To Split Large PDF Files",
    seoTitle: "How to Split Large PDF Files into Smaller Documents",
    metaDescription: "Learn how to split a massive PDF into individual chapters, single pages, or manageable chunks without paying for software.",
    contentType: "problem-solving",
    category: "guides",
    cluster: "split",
    publishedAt: "2026-06-10",
    readMinutes: 5,
    definition: "Splitting a PDF involves parsing the document's page tree and extracting specific pages to form a completely new, independent PDF file without altering the original.",
    quickAnswer: "The easiest way to split a large PDF is to use a free browser tool like SilentPDF. Just upload your file, enter the page ranges you want to keep (e.g., 1-5, 10), and click Split.",
    summary: "Large PDFs can be unwieldy. Splitting them into smaller, focused documents makes them easier to email and read.",
    useCases: [
      "Extracting one chapter from an eBook",
      "Pulling a specific invoice out of a monthly bundle"
    ],
    stepByStep: [
      { name: "Step 1", text: "Upload the large PDF file to the Split tool." },
      { name: "Step 2", text: "Type the specific page numbers or ranges (like 1-10) you want to extract." },
      { name: "Step 3", text: "Download the new, smaller PDF containing only those pages." }
    ],
    body: [
      { type: "p", text: "Sending a 500-page report to a client who only needs to read page 42 is bad practice. It wastes bandwidth and causes confusion." }
    ],
    faq: [
      {
        q: "Does splitting a PDF reduce quality?",
        a: "No. The extracted pages are copied identically from the original file, so there is zero loss in quality."
      }
    ],
    parentToolSlug: "split-pdf",
    relatedToolSlugs: ["remove-pages", "merge-pdf", "compress-pdf"],
    relatedAssetSlugs: ["extracting-specific-pages-from-pdf", "extracting-specific-pages-from-pdf"],
    relatedProgrammaticSlug: "split-pdf"
  },
  {
    slug: "extracting-specific-pages-from-pdf",
    title: "Extracting Specific Pages From A PDF",
    seoTitle: "How to Extract Specific Pages from a PDF",
    metaDescription: "Need just one page from a 100-page document? Here's the fastest way to extract pages from a PDF.",
    contentType: "use-case",
    category: "use-cases",
    cluster: "split",
    publishedAt: "2026-06-12",
    readMinutes: 4,
    definition: "Page extraction is a sub-function of splitting where the goal is to isolate a small number of pages (often just one) from a larger document.",
    quickAnswer: "Use the Split PDF tool, type the exact page number you want to extract (e.g., '7'), and export. You will get a 1-page PDF containing only that page.",
    summary: "Extracting a single page is the most common PDF splitting task, usually done to isolate a signature page or a specific chart.",
    useCases: [
      "Isolating a signed contract page",
      "Extracting a single chart for a presentation"
    ],
    body: [
      { type: "p", text: "Sometimes you don't want to split a document in half; you just want page 7. Extraction is simple when you use the right tool." }
    ],
    faq: [],
    parentToolSlug: "split-pdf",
    relatedToolSlugs: ["merge-pdf", "rotate-pdf", "remove-pages"],
    relatedAssetSlugs: ["how-to-split-large-pdf-files", "how-to-split-large-pdf-files"],
    relatedProgrammaticSlug: "split-pdf"
  }
];
