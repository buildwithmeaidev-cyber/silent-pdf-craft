import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { TOOLS } from "@/lib/tools";
import { cn } from "@/lib/utils";

const Tools = () => (
  <div className="container-px mx-auto max-w-7xl py-16 md:py-20">
    <div className="max-w-2xl">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tools</span>
      <h1 className="mt-3 font-serif text-5xl md:text-6xl leading-tight text-balance">A focused set of PDF tools.</h1>
      <p className="mt-4 text-muted-foreground">Pick a tool to start. Most run entirely in your browser.</p>
    </div>

    <div className="mt-12 device-grid-layout device-spacing">
      {TOOLS.map((t) => {
        const Icon = t.icon;
        return (
          <Link
            key={t.slug}
            to={`/tools/${t.slug}`}
            className="group rounded-2xl border bg-card p-6 hover:shadow-lift hover:-translate-y-0.5 hover:border-primary/40 transition-all"
          >
            <div className={cn(
              "grid place-items-center size-11 rounded-xl mb-5 transition-colors",
              t.accent === "blue" ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent"
            )}>
              <Icon className="size-5" strokeWidth={1.8} />
            </div>
            <h3 className="font-medium">{t.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{t.short}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
              Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        );
      })}
    </div>
  </div>
);

export default Tools;
