import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getPost, POSTS, type BlogBlock } from "@/content/blog/posts";
import { TOOLS } from "@/lib/tools";
import { PROGRAMMATIC } from "@/lib/programmatic";
import Breadcrumbs from "@/core/Breadcrumbs";

function renderBlock(block: BlogBlock, i: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={i} className="mt-10 text-2xl md:text-3xl font-bold text-foreground">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={i} className="mt-6 text-xl font-bold text-foreground">
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p key={i} className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul key={i} className="mt-4 space-y-2 list-disc pl-6 text-muted-foreground">
          {block.items.map((item, j) => (
            <li key={j} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote
          key={i}
          className="mt-6 border-l-4 border-blue-500 bg-primary/10 px-5 py-4 text-foreground italic rounded-r-xl"
        >
          {block.text}
        </blockquote>
      );
  }
}

export default function BlogPost() {
  const { slug = "" } = useParams();
  const post = getPost(slug);
  if (!post) return typeof window !== "undefined" ? <Navigate to="/blog" replace /> : null;

  const relatedTools = (post.relatedToolSlugs ?? [])
    .map((s) => TOOLS.find((t) => t.slug === s))
    .filter(Boolean) as typeof TOOLS;
  const relatedVariants = (post.relatedProgrammaticSlugs ?? [])
    .map((s) => PROGRAMMATIC.find((p) => p.slug === s))
    .filter(Boolean) as typeof PROGRAMMATIC;
  const relatedPosts = (post.relatedPostSlugs ?? [])
    .map((s) => POSTS.find((p) => p.slug === s))
    .filter(Boolean) as typeof POSTS;

  // Table of contents from h2 blocks.
  const toc = post.body
    .map((b, i) => (b.type === "h2" ? { text: b.text, anchor: `s-${i}` } : null))
    .filter(Boolean) as { text: string; anchor: string }[];

  return (
    <div className="bg-card min-h-screen">
      <div className="mx-auto max-w-3xl px-4 md:px-6 py-12 md:py-16">
        <Breadcrumbs current={post.title} />

        <header className="mt-6 space-y-5">
          <div className="flex items-center gap-3 text-xs">
            <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
              {post.cluster.toUpperCase()}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {post.readMinutes} min read
            </span>
            <time className="text-muted-foreground">
              {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </time>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
        </header>

        {/* Table of contents */}
        {toc.length > 1 && (
          <nav className="mt-10 rounded-2xl border border-border bg-muted p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              On this page
            </p>
            <ul className="mt-3 space-y-1.5">
              {toc.map((item) => (
                <li key={item.anchor}>
                  <a href={`#${item.anchor}`} className="text-sm text-muted-foreground hover:text-blue-700">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Body */}
        <article className="mt-8">
          {post.body.map((b, i) => {
            const rendered = renderBlock(b, i);
            if (b.type === "h2") {
              return <div key={i} id={`s-${i}`}>{rendered}</div>;
            }
            return rendered;
          })}
        </article>

        {/* FAQ */}
        {post.faq?.length ? (
          <section className="mt-12 space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">FAQ</h2>
            <Accordion type="single" collapsible className="w-full">
              {post.faq.map((f, i) => (
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
        ) : null}

        {/* Related tools CTA */}
        {relatedTools.length > 0 && (
          <section className="mt-12 rounded-3xl bg-ink p-8 md:p-10 text-ink-foreground">
            <h2 className="text-2xl font-bold">Tools mentioned in this post</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {relatedTools.map((t) => (
                <Link
                  key={t.slug}
                  to={`/${t.slug}`}
                  className="flex items-center justify-between rounded-2xl bg-ink-foreground/5 px-5 py-4 transition hover:bg-ink-foreground/10"
                >
                  <span className="font-semibold">{t.title}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Programmatic variants */}
        {relatedVariants.length > 0 && (
          <section className="mt-12 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Related pages</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {relatedVariants.map((v) => (
                <Link
                  key={v.slug}
                  to={`/${v.slug}`}
                  className="rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
                >
                  <p className="font-semibold text-foreground">{v.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{v.intent}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Keep reading</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {relatedPosts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40"
                >
                  <p className="font-semibold text-foreground">{p.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
