import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { RESOURCES } from "@/content/resources";
import { TOOLS } from "@/lib/tools";

// Real guides only — everything below is a page that actually exists.
const GUIDE_ASSETS = RESOURCES.filter((r) => r.category === "guides");

const toolTitle = (slug: string) => TOOLS.find((t) => t.slug === slug)?.title ?? slug.replace(/-/g, " ");

const Guides = () => (
  <div className="container-px mx-auto max-w-7xl py-16 md:py-20">
    <div className="max-w-2xl">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Guides</span>
      <h1 className="mt-3 font-serif text-5xl md:text-6xl leading-tight text-balance">
        Field notes on PDF craft.
      </h1>
      <p className="mt-4 text-muted-foreground">
        Short, specific walkthroughs — the exact steps, the settings that matter, and the tool that does the job.
        Every guide links straight to the tool it describes, and every tool runs on your device.
      </p>
    </div>

    <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {GUIDE_ASSETS.map((g) => (
        <article
          key={g.slug}
          className="group flex flex-col rounded-2xl border bg-card overflow-hidden hover:shadow-lift transition-all"
        >
          <div className="aspect-[16/9] grid place-items-center bg-gradient-to-br from-primary/15 to-accent/10">
            <BookOpen className="size-10 text-primary/70" strokeWidth={1.4} />
          </div>
          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="uppercase tracking-wider">{g.cluster.replace(/-/g, " ")}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" /> {g.readMinutes} min
              </span>
            </div>
            <h2 className="mt-2 font-serif text-2xl leading-tight">
              <Link to={`/resources/${g.category}/${g.slug}`} className="hover:text-primary transition-colors">
                {g.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{g.quickAnswer ?? g.summary ?? g.metaDescription}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {[g.parentToolSlug, ...(g.relatedToolSlugs ?? [])]
                .filter((s, i, a) => s && a.indexOf(s) === i)
                .slice(0, 3)
                .map((slug) => (
                  <Link
                    key={slug}
                    to={`/${slug}`}
                    className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    {toolTitle(slug)}
                  </Link>
                ))}
            </div>

            <Link
              to={`/resources/${g.category}/${g.slug}`}
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              Read the guide <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </article>
      ))}
    </div>

    <section className="mt-16 rounded-3xl border bg-card p-8 md:p-10">
      <h2 className="font-serif text-3xl">Straight to a tool</h2>
      <p className="mt-2 text-muted-foreground">Skip the reading — every tool below opens ready to use.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {TOOLS.map((t) => (
          <Link
            key={t.slug}
            to={`/${t.slug}`}
            className="rounded-full border px-4 py-2 text-sm hover:border-primary/40 hover:text-primary transition-colors"
          >
            {t.title}
          </Link>
        ))}
      </div>
    </section>
  </div>
);

export default Guides;
