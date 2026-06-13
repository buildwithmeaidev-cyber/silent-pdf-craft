import { Link } from "react-router-dom";
import { Check, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TOOLS, type ToolDef } from "@/lib/tools";

interface Props {
  slug: string;
}

export default function ToolSeoSections({ slug }: Props) {
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) return null;

  const related = (tool.relatedSlugs ?? [])
    .map((s) => TOOLS.find((t) => t.slug === s))
    .filter(Boolean) as ToolDef[];

  const quickAnswer = tool.faq?.[0];

  return (
    <section className="bg-white border-t border-slate-200">
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-16 md:py-20 space-y-16">
        {/* AI-extractable Quick Answer (P5) */}
        {quickAnswer && (
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-700 font-semibold">
              Quick answer
            </p>
            <p className="mt-3 text-lg md:text-xl font-semibold text-slate-900 leading-snug">
              {quickAnswer.q}
            </p>
            <p className="mt-3 text-base text-slate-700 leading-relaxed">
              {quickAnswer.a}
            </p>
          </div>
        )}

        {/* Intent + What/When */}
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
            About this tool
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            {tool.h1}
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">{tool.intent}</p>
          <p className="text-base text-slate-700 leading-relaxed">
            {tool.whatItDoes}
          </p>
        </div>


        {/* When to use */}
        {tool.whenToUse?.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900">When you'd reach for this</h3>
            <ul className="space-y-3">
              {tool.whenToUse.map((u, i) => (
                <li key={i} className="flex gap-3 text-slate-700">
                  <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* How it works */}
        {tool.howItWorks?.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">How it works</h3>
            <ol className="space-y-5">
              {tool.howItWorks.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
                    {i + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{step.name}</p>
                    <p className="text-slate-600 leading-relaxed">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Benefits */}
        {tool.benefits?.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Why people use it</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {tool.benefits.map((b, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <p className="font-semibold text-slate-900">{b.title}</p>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {b.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Use cases */}
        {tool.useCases?.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Real situations it fits</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {tool.useCases.map((c, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 p-5 bg-white"
                >
                  <p className="font-semibold text-slate-900">{c.title}</p>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {c.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best practices (P4) */}
        {tool.bestPractices && tool.bestPractices.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900">Best practices</h3>
            <ul className="space-y-3">
              {tool.bestPractices.map((b, i) => (
                <li key={i} className="flex gap-3 text-slate-700">
                  <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Common mistakes (P4) */}
        {tool.commonMistakes && tool.commonMistakes.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900">Common mistakes to avoid</h3>
            <ul className="space-y-3">
              {tool.commonMistakes.map((m, i) => (
                <li key={i} className="flex gap-3 text-slate-700">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">!</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        )}



        {/* Keywords / topics (subtle) */}
        {tool.keywords?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Also known as
            </h3>
            <div className="flex flex-wrap gap-2">
              {tool.keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        {tool.faq?.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">
              Questions people ask
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {tool.faq.map((f, i) => (
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
          </div>
        )}

        {/* Related tools */}
        {related.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Related tools</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {related.map((r) => {
                const Icon = r.icon;
                return (
                  <Link
                    key={r.slug}
                    to={`/tools/${r.slug}`}
                    className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 group-hover:text-blue-700">
                        {r.title}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-500 line-clamp-2">
                        {r.short}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-1" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
