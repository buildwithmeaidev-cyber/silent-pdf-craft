import { ContentAsset } from "../ContentAsset";

export const COMPRESS_CLUSTER: ContentAsset[] = [
  {
    slug: "how-to-compress-pdf-under-1mb",
    title: "How To Compress PDF Below 1 MB",
    seoTitle: "How to Compress a PDF Under 1MB — Step-by-Step Guide",
    metaDescription:
      "Visa portals, SSC forms, and university uploads cap PDFs at 1MB. Here's a practical guide to actually hit that limit.",
    contentType: "problem-solving",
    category: "guides",
    cluster: "compress",
    publishedAt: "2026-04-12",
    readMinutes: 5,
    definition: "PDF compression below 1MB involves reducing image quality, flattening fonts, and discarding metadata to force the file size under a 1024KB strict limit often required by government portals.",
    quickAnswer: "To compress a PDF under 1MB, use a web-based compressor on its Maximum/Extreme setting. If it's still over 1MB, run the compressed file through again, or remove unnecessary pages.",
    summary: "Government portals and visa applications love the 1MB cap. We covered using Maximum compression, double-compressing, and removing pages to reliably hit this limit.",
    useCases: [
      "Uploading to government visa portals",
      "Submitting job applications with size limits",
      "Sending files over strict corporate email servers"
    ],
    stepByStep: [
      { name: "Step 1", text: "Open the Compress PDF tool and upload your file." },
      { name: "Step 2", text: "Select 'Maximum' compression level." },
      { name: "Step 3", text: "Download the file. If it is still over 1MB, remove unnecessary pages and compress again." }
    ],
    body: [
      {
        type: "p",
        text: "If you've ever tried to upload a scanned PDF to a visa portal, you know the drill. 1MB max. Your file is 6MB. The form refuses to submit. The internet is full of compressors that don't get you there in one click.",
      },
      {
        type: "p",
        text: "This post walks through the steps that actually work — first to shrink it, then to handle the case where Maximum compression still isn't enough.",
      }
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
    examples: [
      { title: "Scanned Passport", description: "A 6MB 600 DPI scan of a passport drops to 800KB on Maximum compression." }
    ],
    comparisons: [
      { feature: "Text Clarity", us: "Maintained perfectly", them: "Sometimes blurred via aggressive rasterization" }
    ],
    parentToolSlug: "compress-pdf",
    relatedToolSlugs: ["split-pdf", "remove-pages", "merge-pdf"],
    relatedAssetSlugs: ["guide-to-pdf-compression", "why-pdf-files-become-large"],
    relatedProgrammaticSlug: "compress-pdf-to-1mb"
  },
  {
    slug: "guide-to-pdf-compression",
    title: "Complete Guide To PDF Compression",
    seoTitle: "The Complete Guide to PDF Compression (2026)",
    metaDescription:
      "Everything you need to know about how PDF compression works, from DPI and image downsampling to font subsetting.",
    contentType: "complete-guide",
    category: "guides",
    cluster: "compress",
    publishedAt: "2026-05-10",
    readMinutes: 12,
    definition: "PDF compression is the technical process of reducing a Portable Document Format file's byte size by discarding invisible data, downsampling embedded imagery, and removing structural redundancies.",
    quickAnswer: "PDF compression works best on scanned documents or image-heavy files. Text-only documents rarely shrink significantly.",
    summary: "We explored how PDF compression works under the hood, why scanned documents shrink the most, and how to pick the right compression level for your needs.",
    useCases: [
      "Optimizing web assets",
      "Archiving massive document libraries",
      "Preparing slide decks for email distribution"
    ],
    stepByStep: [
      { name: "Audit your file", text: "Determine if it's text-heavy or image-heavy." },
      { name: "Choose a level", text: "Select Balanced for reading, Maximum for archiving." }
    ],
    body: [
      { type: "p", text: "Understanding how compression works gives you an edge..." }
    ],
    faq: [
      { q: "Is PDF compression lossless?", a: "Most PDF compressors use lossy compression for images to achieve significant size reduction." }
    ],
    parentToolSlug: "compress-pdf",
    relatedToolSlugs: ["edit-pdf", "split-pdf", "export-pdf"],
    relatedAssetSlugs: ["how-to-compress-pdf-under-1mb", "pdf-compression-methods-compared"],
    relatedProgrammaticSlug: "compress-pdf-for-email"
  },
  {
    slug: "why-pdf-files-become-large",
    title: "Why PDF Files Become Large",
    seoTitle: "Why Are My PDF Files So Large? 5 Common Reasons",
    metaDescription: "Embedded fonts, high-DPI images, and hidden metadata are silently inflating your PDF files. Here's how to fix it.",
    contentType: "problem-solving",
    category: "blog",
    cluster: "compress",
    publishedAt: "2026-05-12",
    readMinutes: 4,
    definition: "PDF bloat refers to a PDF file carrying unnecessary megabytes of data due to uncompressed assets or hidden layers.",
    quickAnswer: "PDFs get large because of high-resolution images, fully embedded fonts (instead of subsets), and unflattened interactive elements.",
    summary: "By understanding that images and fonts cause 90% of PDF bloat, you can use standard compression tools to strip them out.",
    useCases: ["Debugging large exports from Adobe Illustrator or InDesign"],
    body: [{ type: "p", text: "Ever export a 2-page document and it's 50MB? Here is why." }],
    faq: [],
    parentToolSlug: "compress-pdf",
    relatedToolSlugs: ["edit-pdf", "remove-pages", "merge-pdf"],
    relatedAssetSlugs: ["how-to-compress-pdf-under-1mb", "guide-to-pdf-compression"],
    relatedProgrammaticSlug: "compress-pdf-to-500kb"
  },
  {
    slug: "pdf-compression-methods-compared",
    title: "PDF Compression Methods Compared",
    seoTitle: "SilentPDF vs Others: PDF Compression Methods Compared",
    metaDescription: "We compare lossless vs lossy compression, and how top tools handle font subsetting vs image rasterization.",
    contentType: "comparison",
    category: "comparisons",
    cluster: "compress",
    publishedAt: "2026-05-15",
    readMinutes: 6,
    definition: "Compression methods range from simple ZIP-style deflation (lossless) to aggressive JPEG re-encoding (lossy).",
    quickAnswer: "Lossy compression provides the best size reduction for PDFs. SilentPDF processes this locally in your browser, unlike competitors.",
    summary: "We compared the top 5 methods and showed why client-side processing wins on privacy while matching server-side compression rates.",
    useCases: ["Choosing enterprise PDF software", "Deciding between free online tools"],
    body: [{ type: "p", text: "Not all compressors are built the same." }],
    faq: [],
    comparisons: [
      { feature: "Privacy", us: "100% Local Browser", them: "Server Uploads" },
      { feature: "Speed", us: "Instant (no upload)", them: "Depends on connection" }
    ],
    parentToolSlug: "compress-pdf",
    relatedToolSlugs: ["protect-pdf", "export-pdf", "edit-pdf"],
    relatedAssetSlugs: ["guide-to-pdf-compression", "why-pdf-files-become-large"],
    relatedProgrammaticSlug: "compress-pdf-to-100kb"
  }
];
