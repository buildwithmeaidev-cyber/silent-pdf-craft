import { ArrowRight, Check, FilePenLine, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import ToolPage from "@/pages/tools/ToolPage";

export default function PdfEditor() {
  return (
    <div className="bg-background">
      <section className="container-px mx-auto max-w-7xl py-14 md:py-20">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <FilePenLine className="size-4" /> PDF editor
          </span>
          <h1 className="mt-4 font-serif text-5xl leading-[0.98] text-balance md:text-7xl">
            Edit a PDF online without installing Acrobat.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Add text, draw notes, mark up a form, or sign a page directly in your browser. The file stays on your device while you work.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#editor" className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Start editing <ArrowRight className="size-4" />
            </a>
            <Link to="/pdf-to-word" className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-card px-5 text-sm font-semibold hover:bg-muted">
              Need to rewrite text?
            </Link>
          </div>
        </div>

        <div id="editor" className="mt-12 max-w-4xl scroll-mt-24">
          <ToolPage toolSlug="edit-pdf" hideHeader />
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="container-px mx-auto grid max-w-7xl gap-8 py-14 md:grid-cols-3">
          {[
            [ShieldCheck, "Private by default", "The PDF is read and exported in your browser. It is not uploaded for editing."],
            [Check, "Useful markups", "Add text and annotations for forms, contracts, feedback, and quick corrections."],
            [FilePenLine, "Clean export", "Download a new PDF with your edits flattened into the page."],
          ].map(([Icon, title, body]) => (
            <div key={title as string} className="border-l-2 border-primary/30 pl-5">
              <Icon className="size-5 text-primary" />
              <h2 className="mt-3 font-semibold">{title as string}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body as string}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}