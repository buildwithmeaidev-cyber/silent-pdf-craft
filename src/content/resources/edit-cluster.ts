import { ContentAsset } from "../ContentAsset";

export const EDIT_CLUSTER: ContentAsset[] = [
  {
    slug: "how-to-write-on-a-pdf",
    title: "How To Write On A PDF",
    seoTitle: "How to Type and Write on a PDF Document Free",
    metaDescription: "Need to fill out a form that isn't fillable? Learn how to easily type text over any PDF document directly in your browser.",
    contentType: "problem-solving",
    category: "guides",
    cluster: "edit",
    publishedAt: "2026-06-20",
    readMinutes: 5,
    definition: "Writing on a PDF refers to superimposing new text annotations over the existing document layout, effectively 'flattening' the new text onto the page.",
    quickAnswer: "Upload your document to the Edit PDF tool, click the 'Text' button to drop a text box anywhere on the page, type your information, and download the flattened file.",
    summary: "Many PDFs are meant to be forms but lack interactive form fields. Writing on them using an annotation tool is the fastest workaround.",
    useCases: [
      "Filling out school permission slips",
      "Adding notes to a design mockup"
    ],
    stepByStep: [
      { name: "Step 1", text: "Upload your PDF to the Edit tool." },
      { name: "Step 2", text: "Select the Text tool and click where you want to type." },
      { name: "Step 3", text: "Adjust the font size and color, type your text, and download." }
    ],
    body: [
      { type: "p", text: "We've all received a PDF 'form' that is actually just a scanned piece of paper. You can't click to type anywhere. Instead of printing it out, you can overlay text digitally." }
    ],
    faq: [
      {
        q: "Can I edit the existing text in the PDF?",
        a: "No. Annotation tools allow you to add new text on top of the document. To change the underlying text, you need to convert the PDF to Word first."
      }
    ],
    parentToolSlug: "edit-pdf",
    relatedToolSlugs: ["esign-pdf", "pdf-to-word", "watermark-pdf"],
    relatedAssetSlugs: ["annotating-pdfs-for-review", "annotating-pdfs-for-review"],
    relatedProgrammaticSlug: "edit-pdf"
  },
  {
    slug: "annotating-pdfs-for-review",
    title: "Annotating PDFs For Review",
    seoTitle: "How to Annotate and Mark Up PDFs for Team Review",
    metaDescription: "Learn how to effectively use highlights, drawing tools, and text boxes to review and mark up PDF documents.",
    contentType: "use-case",
    category: "use-cases",
    cluster: "edit",
    publishedAt: "2026-06-22",
    readMinutes: 6,
    definition: "PDF Annotation is the process of adding metadata—such as highlights, comments, or drawings—to a document to facilitate review and collaboration.",
    quickAnswer: "Use the drawing and text tools in the Edit PDF app to circle errors, highlight important sections, and leave text notes for the original author before sending it back.",
    summary: "Digital markups save time and paper. Learning how to cleanly annotate a PDF makes the feedback loop much more efficient.",
    useCases: [
      "Grading student papers",
      "Providing feedback on graphic design proofs"
    ],
    body: [
      { type: "p", text: "A picture is worth a thousand words. Circling a typo on a PDF is much faster than writing an email explaining where the typo is located." }
    ],
    faq: [],
    parentToolSlug: "edit-pdf",
    relatedToolSlugs: ["merge-pdf", "protect-pdf", "compress-pdf"],
    relatedAssetSlugs: ["how-to-write-on-a-pdf", "how-to-write-on-a-pdf"],
    relatedProgrammaticSlug: "edit-pdf"
  }
];
