import { ArrowRight, Check, Combine, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import ToolPage from "@/pages/tools/ToolPage";

export default function MergePdfOnline() {
  return (
    <div className="bg-background">
      <section className="container-px mx-auto max-w-7xl py-14 md:py-20">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Combine className="size-4" /> Merge PDF online
          </span>
          <h1 className="mt-4 font-serif text-5xl leading-[0.98] text-balance md:text-7xl">
            Merge PDF files online, in the order you choose.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Combine resumes, receipts, signed pages, or reports into one clean PDF. Drag the files into order, merge them, and download the result without an account.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#merge" className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Merge PDFs now <ArrowRight className="size-4" />
            </a>
            <Link to="/compress-pdf" className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-card px-5 text-sm font-semibold hover:bg-muted">
              Compress the result
            </Link>
          </div>
        </div>

        <div id="merge" className="mt-12 max-w-4xl scroll-mt-24">
          <ToolPage toolSlug="merge-pdf" hideHeader />
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="container-px mx-auto grid max-w-7xl gap-8 py-14 md:grid-cols-3">
          {[
            [ShieldCheck, "Files stay local", "The merge happens on your device, not on a file-upload server."],
            [Check, "Real file order", "Arrange the files before merging so the final document reads correctly."],
            [Combine, "Clean output", "Get one PDF with no signup screen and no watermark added."],
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