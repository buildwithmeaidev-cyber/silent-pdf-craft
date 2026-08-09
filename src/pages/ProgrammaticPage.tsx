import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getProgrammatic, PROGRAMMATIC } from "@/lib/programmatic";
import { TOOLS } from "@/lib/tools";
import Breadcrumbs from "@/core/Breadcrumbs";
import ToolPage from "./tools/ToolPage";

export default function ProgrammaticPage() {
  const { slug = "" } = useParams();
  const variant = getProgrammatic(slug);

  if (!variant) return typeof window !== "undefined" ? <Navigate to="/tools" replace /> : null;

  const parent = TOOLS.find((t) => t.slug === variant.parentSlug);
  const siblings = (variant.relatedVariants ?? [])
    .map((s) => PROGRAMMATIC.find((p) => p.slug === s))
    .filter(Boolean) as typeof PROGRAMMATIC;

  return (
    <div className="bg-[#f5f7fb] min-h-screen">
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-12 md:py-16">
        <Breadcrumbs current={variant.title} />

        {/* Embedded Tool directly on page */}
        {parent && (
          <div className="mt-6 mb-12">
            <ToolPage 
              toolSlug={parent.slug} 
              hideHeader={true} 
              overrideTitle={variant.title} 
              overrideDescription={variant.intent} 
            />
          </div>
        )}

        {/* Scenario */}
        <section className="mt-12 rounded-3xl border border-border bg-card p-6 md:p-8">
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {variant.scenario}
          </p>
        </section>

        {/* Bullets */}
        <section className="mt-10 space-y-5">
          <h2 className="text-2xl font-bold text-foreground">What this page is for</h2>
          <ul className="space-y-3">
            {variant.bullets.map((b, i) => (
              <li key={i} className="flex gap-3 text-muted-foreground">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-foreground">How it works</h2>
          <ol className="space-y-5">
            {variant.howItWorks.map((s, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {i + 1}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{s.name}</p>
                  <p className="text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>



        {/* FAQ */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Questions people ask</h2>
          <Accordion type="single" collapsible className="w-full">
            {variant.faq.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Related variants */}
        {siblings.length > 0 && (
          <section className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Related pages</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  to={`/${s.slug}`}
                  className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground group-hover:text-primary">
                      {s.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{s.intent}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
