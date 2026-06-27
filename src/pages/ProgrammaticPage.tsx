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

export default function ProgrammaticPage() {
  const { slug = "" } = useParams();
  const variant = getProgrammatic(slug);

  if (!variant) return <Navigate to="/tools" replace />;

  const parent = TOOLS.find((t) => t.slug === variant.parentSlug);
  const siblings = (variant.relatedVariants ?? [])
    .map((s) => PROGRAMMATIC.find((p) => p.slug === s))
    .filter(Boolean) as typeof PROGRAMMATIC;

  return (
    <div className="bg-[#f5f7fb] min-h-screen">
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-12 md:py-16">
        <Breadcrumbs current={variant.title} />

        {/* Hero */}
        <header className="mt-6 space-y-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            {parent?.title ?? "PDF Tool"}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            {variant.title}
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            {variant.intent}
          </p>
          {parent && (
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to={`/${parent.slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold transition hover:bg-blue-700"
              >
                Open {parent.title} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </header>

        {/* Scenario */}
        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
          <p className="text-base md:text-lg text-slate-700 leading-relaxed">
            {variant.scenario}
          </p>
        </section>

        {/* Bullets */}
        <section className="mt-10 space-y-5">
          <h2 className="text-2xl font-bold text-slate-900">What this page is for</h2>
          <ul className="space-y-3">
            {variant.bullets.map((b, i) => (
              <li key={i} className="flex gap-3 text-slate-700">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <ol className="space-y-5">
            {variant.howItWorks.map((s, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
                  {i + 1}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{s.name}</p>
                  <p className="text-slate-600 leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        {parent && (
          <section className="mt-12 rounded-3xl bg-slate-900 p-8 md:p-10 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold">Ready to {variant.title.toLowerCase()}?</h2>
            <p className="mt-3 text-slate-300">
              Free, no signup, no watermark. Runs in your browser.
            </p>
            <Link
              to={`/${parent.slug}`}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-slate-900 font-semibold transition hover:bg-slate-100"
            >
              Open {parent.title} <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        )}

        {/* FAQ */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Questions people ask</h2>
          <Accordion type="single" collapsible className="w-full">
            {variant.faq.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold text-slate-900">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed text-base">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Related variants */}
        {siblings.length > 0 && (
          <section className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Related pages</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  to={`/${s.slug}`}
                  className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 group-hover:text-blue-700">
                      {s.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{s.intent}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
