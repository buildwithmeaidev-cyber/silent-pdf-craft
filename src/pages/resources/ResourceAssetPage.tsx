import { useParams, Navigate, Link } from "react-router-dom";
import { getResource } from "@/content/resources";
import { TOOLS } from "@/lib/tools";
import Breadcrumbs from "@/core/Breadcrumbs";
import { ArrowRight, CheckCircle2, LayoutTemplate } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Helmet } from "react-helmet-async";
import { metaTags, jsonLdForAsset } from "@/lib/seo";

export default function ResourceAssetPage() {
  const { category, slug } = useParams();
  
  if (!slug) return typeof window !== "undefined" ? <Navigate to="/resources" replace /> : null;
  
  const asset = getResource(slug);
  const seo = metaTags(asset);
  const jsonLd = jsonLdForAsset(asset);
  if (!asset || asset.category !== category) {
    return typeof window !== "undefined" ? <Navigate to="/resources" replace /> : null;
  }

  const parentTool = TOOLS.find(t => t.slug === asset.parentToolSlug);
  
  return (
    <>
      <Helmet>
          <title>{seo.title}</title>
          <meta name="description" content={seo.description} />
          <link rel="canonical" href={seo.canonical} />
          <meta property="og:title" content={seo.openGraph.title} />
          <meta property="og:description" content={seo.openGraph.description} />
          <meta property="og:url" content={seo.openGraph.url} />
          <meta property="og:type" content={seo.openGraph.type} />
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>
        <article className="bg-[#f5f7fb] min-h-screen pb-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-12 md:py-16">
        <Breadcrumbs current={asset.title} />

        {/* Hero */}
        <header className="mt-6 space-y-6">
          <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            {asset.contentType.replace("-", " ")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {asset.title}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {asset.metaDescription}
          </p>
          
          {/* Quick Answer (AI Optimization) */}
          {asset.quickAnswer && (
            <div className="mt-8 rounded-2xl bg-primary/10 border border-blue-100 p-6 md:p-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-800 mb-3">Quick Answer</h2>
              <p className="text-lg text-foreground font-medium">{asset.quickAnswer}</p>
            </div>
          )}
        </header>

        {/* Definition */}
        {asset.definition && (
          <section className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">What is {asset.title.toLowerCase().replace("how to ", "").replace("guide to ", "")}?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{asset.definition}</p>
          </section>
        )}

        {/* Dynamic Body */}
        <div className="mt-12 prose prose-slate prose-lg max-w-none">
          {asset.body.map((block, i) => {
            if (block.type === "h2") return <h2 key={i} className="text-2xl font-bold text-foreground mt-12 mb-4">{block.text}</h2>;
            if (block.type === "h3") return <h3 key={i} className="text-xl font-bold text-foreground mt-8 mb-3">{block.text}</h3>;
            if (block.type === "p") return <p key={i} className="text-muted-foreground leading-relaxed mb-6">{block.text}</p>;
            if (block.type === "ul") return (
              <ul key={i} className="space-y-3 mb-6">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3 text-muted-foreground">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
            if (block.type === "quote") return <blockquote key={i} className="border-l-4 border-blue-600 pl-6 italic text-muted-foreground text-xl my-8">{block.text}</blockquote>;
            return null;
          })}
        </div>

        {/* Step by Step */}
        {asset.stepByStep && asset.stepByStep.length > 0 && (
          <section className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Step-by-Step Instructions</h2>
            <div className="space-y-6">
              {asset.stepByStep.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-ink-foreground font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{step.name}</h3>
                    <p className="text-muted-foreground mt-1">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Use Cases */}
        {asset.useCases && asset.useCases.length > 0 && (
          <section className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Common Use Cases</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {asset.useCases.map((uc, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <LayoutTemplate className="text-primary size-5 shrink-0" />
                  <span className="font-medium text-foreground">{uc}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comparisons */}
        {asset.comparisons && asset.comparisons.length > 0 && (
          <section className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Feature Comparison</h2>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="p-4">Feature</th>
                    <th className="p-4 bg-primary/10/50">silentPDF</th>
                    <th className="p-4">Standard Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {asset.comparisons.map((c, i) => (
                    <tr key={i}>
                      <td className="p-4 font-medium text-foreground">{c.feature}</td>
                      <td className="p-4 bg-primary/10/20 text-blue-700 font-medium">{c.us}</td>
                      <td className="p-4 text-muted-foreground">{c.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Summary */}
        {asset.summary && (
          <section className="mt-12 rounded-2xl bg-ink p-8 text-ink-foreground">
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <p className="text-slate-300 leading-relaxed">{asset.summary}</p>
            {parentTool && (
              <Link
                to={`/${parentTool.slug}`}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-card px-6 py-3 text-foreground font-semibold transition hover:bg-muted"
              >
                Open {parentTool.title} <ArrowRight className="size-4" />
              </Link>
            )}
          </section>
        )}

        {/* FAQ */}
        {asset.faq && asset.faq.length > 0 && (
          <section className="mt-16 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {asset.faq.map((f, i) => (
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
        )}
      </div>
    </article></>
  );
}
