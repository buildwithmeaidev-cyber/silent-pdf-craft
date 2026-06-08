import { GUIDES } from "./Home";
import { FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Guides = () => (
  <div className="container-px mx-auto max-w-7xl py-16 md:py-20">
    <div className="max-w-2xl">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Guides</span>
      <h1 className="mt-3 font-serif text-5xl md:text-6xl leading-tight text-balance">Field notes on PDF craft.</h1>
      <p className="mt-4 text-muted-foreground">Practical guides written by the silentPDF team.</p>
    </div>
    <div className="mt-12 grid md:grid-cols-3 gap-5">
      {GUIDES.concat(GUIDES).map((g, i) => (
        <article key={i} className="group rounded-2xl border bg-card overflow-hidden hover:shadow-lift transition-all">
          <div className={cn("aspect-[16/10] grid place-items-center", g.bg)}>
            <FileText className="size-12 text-white/80" strokeWidth={1.4} />
          </div>
          <div className="p-6">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{g.category}</span>
            <h2 className="mt-2 font-serif text-2xl leading-tight">{g.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{g.excerpt}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Read <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </article>
      ))}
    </div>
  </div>
);

export default Guides;
