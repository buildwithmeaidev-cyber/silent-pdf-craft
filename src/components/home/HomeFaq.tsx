import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Kept in a shared export so Seo.tsx can mirror it into FAQPage JSON-LD.
// Answers are deliberately 40-80 words, plain, citation-friendly for AI Overviews.
export const HOME_FAQ: { q: string; a: string }[] = [
  {
    q: "Is silentPDF AI really free to use?",
    a: "Yes. Every tool on the site is free, with no daily limit, no signup, and no watermark on the output. The catch most other PDF sites have — 'free up to 2 files a day, $9/mo after that' — doesn't exist here. We don't charge because the tools run in your browser, so there's no per-file server cost to pass on.",
  },
  {
    q: "Do I need to create an account?",
    a: "No account. No email. No 'verify to download' step. You drop the file, the tool runs, you download the result. The same workflow whether it's your first visit or your fiftieth.",
  },
  {
    q: "Where are my PDFs processed?",
    a: "Directly in your browser. The PDF is read into your computer's memory, the tool runs locally, and the result is written back to a file you download. The file never travels to a server we control, which is why contracts and ID scans are safe to use here.",
  },
  {
    q: "Are my files stored or kept anywhere?",
    a: "No. We don't have a database of uploaded PDFs because we don't receive your PDFs in the first place. Nothing is logged, indexed, cached, or shared. When you close the tab, everything is gone from our side.",
  },
  {
    q: "How do I compress a PDF on silentPDF?",
    a: "Open the Compress PDF tool, drop your file in, pick a compression level (Balanced for general use, Maximum to squeeze for upload limits), and download the smaller PDF. The whole pass usually takes a few seconds on a typical document.",
  },
  {
    q: "How do I merge PDFs into one file?",
    a: "Open Merge PDF, drop in all the files you want combined, drag them into the order you want, and click merge. The output is a single PDF with every page from every file, in the order you set, with no watermark.",
  },
  {
    q: "How do I convert a PDF to Word?",
    a: "Open PDF to Word, upload the PDF, and download the .docx that comes back. Headings, lists, and simple tables are preserved. If the PDF is a scan, OCR runs automatically so you get real editable text in the Word file, not an image.",
  },
  {
    q: "Can I sign a PDF for free?",
    a: "Yes. Open eSign PDF, upload your document, type or draw your signature, drop it where it needs to go, and download the signed PDF. The signature is flattened into the page, so the recipient sees a normal signed PDF that opens in any reader.",
  },
  {
    q: "Will the tools work on my phone?",
    a: "Yes. Every tool is built mobile-first and works in Safari and Chrome on phones and tablets. Drawing a signature with your finger, compressing a scan you just took, merging two PDFs from your email — all of it runs the same way as on a laptop.",
  },
  {
    q: "Do you put a watermark on the output?",
    a: "No. The PDFs you download from silentPDF have no logos, no 'made with silentPDF' stamps, no diagonal banners across page one. The output is exactly the document you'd expect — same content, just merged, compressed, signed, or converted.",
  },
  {
    q: "How big a PDF can I work with?",
    a: "Roughly capped by your device's memory rather than by us. Most laptops handle 200–500MB PDFs comfortably. Phones do well up to about 50MB. If a huge file slows down, try splitting it first, working on the pieces, and merging the result.",
  },
  {
    q: "Is it safe to upload confidential documents?",
    a: "Yes, because confidential documents don't actually leave your browser. Contracts, payslips, IDs, bank statements — they're all processed in local memory and never sent to a server. That's the main reason we built the site this way.",
  },
  {
    q: "Why use silentPDF instead of Adobe or Smallpdf?",
    a: "Three reasons people mention most: no daily limit (you can use it as much as you need), no watermark on free output, and no upload to a server (so the file stays private). The tradeoff is that we don't try to be a full editor — we're focused on the common tasks, done quickly.",
  },
  {
    q: "Does silentPDF support OCR for scanned PDFs?",
    a: "Yes. When you convert a scanned PDF to Word, OCR runs automatically — there's no separate button. The accuracy is high on clean printed text in English, and reasonable on other Latin-script languages. Handwriting and heavily skewed pages will need a proof-read.",
  },
  {
    q: "Can I password-protect a PDF here?",
    a: "Yes. The Protect PDF tool adds an open-password to your document so anyone who tries to open it needs the password to view the content. Like every other tool, it runs in your browser — the password and the file both stay on your device.",
  },
  {
    q: "Why does my file still feel large after compression?",
    a: "Some PDFs are already near their minimum size — anything exported cleanly from Word or InDesign has little fat to trim. The biggest wins are on scans and image-heavy PDFs. Removing pages you don't need before compressing often helps more than another compression pass.",
  },
  {
    q: "What's the difference between Merge PDF and Reorder Pages?",
    a: "Merge PDF combines multiple files into one. Reorder Pages works inside a single PDF — it lets you drag individual pages into a different sequence, or delete the ones you don't want. Merge first if you have many files; reorder after if the page order needs cleanup.",
  },
];

export default function HomeFaq() {
  return (
    <section className="py-24 bg-surface" id="faq">
      <div className="container-px mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Questions
          </span>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl text-balance">
            The things people actually ask.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Honest answers about privacy, pricing, file limits, and the tools.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {HOME_FAQ.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
