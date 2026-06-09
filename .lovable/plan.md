## Goal

Turn SilentPDF AI into a search-first PDF platform that ranks on Google and surfaces inside AI search (ChatGPT, Gemini, Claude, Perplexity). Phased execution so each step is verifiable.

Canonical domain: `https://silentpdfai.pages.dev`.

## Voice & content quality (applies to every phase)

All copy — tool descriptions, FAQs, how-tos, blog posts — must read like a human who actually uses PDFs wrote it, not a templated AI page.

- **Concrete over abstract.** Real situations: "the recruiter portal that caps uploads at 1 MB", "a 47-page scanned contract from your landlord", "merging two bank statements before tax season". No "in today's fast-paced digital world."
- **Plain voice.** Short sentences. Contractions. Skip "leverage", "seamless", "robust", "empower", "harness", "unleash", "in conclusion".
- **One angle per page.** Each programmatic page (e.g. "compress for email" vs "compress to 1MB") is written for a different person with a different problem — not the same paragraph reshuffled.
- **Specific numbers and examples.** File-size targets, page counts, email limits (Gmail 25MB, Outlook 20MB), real form names where useful.
- **FAQs answer the actual question** in 40–80 words, not a sales pitch. If the honest answer is "no" or "it depends", say that.
- **Blog posts** open with the problem, not "PDFs are an essential file format." Use a tiny anecdote or scenario in the first 2 sentences.
- **Self-check before shipping each batch:** read 3 random pages aloud. If they sound interchangeable, rewrite.

I'll draft copy in this voice from the start, not polish at the end.

---

## Phase 1 — SEO data layer + per-tool metadata

- Extend `src/lib/tools.ts` per tool with: `seoTitle`, `metaDescription`, `h1`, `keywords[]`, `whatItDoes`, `whenToUse`, `howItWorks` (steps), `benefits[]`, `useCases[]`, `faq[]`, `relatedSlugs[]`, `programmaticVariants[]`.
- Upgrade `src/components/Seo.tsx`: SoftwareApplication + HowTo + FAQPage + BreadcrumbList JSON-LD per tool; WebSite + SearchAction + Organization on home.
- Copy written in the voice above — every tool gets its own real scenario, not a template fill.

## Phase 2 — Tool page content blocks (visual + crawlable)

New components in `src/components/seo/`: `ToolSeoSections`, `WhatWhenHow`, `HowToSteps`, `Benefits`, `UseCases`, `FaqAccordion` (uses existing `ui/accordion`), `RelatedTools`, `Breadcrumbs`. Injected under the existing tool UI so working tools stay untouched. Sticky mobile CTA. Premium look — clean type, generous spacing, no SEO-page aesthetic.

## Phase 3 — Programmatic landing pages

Approach: **separate routes, shared tool component** (each URL self-canonical).

Registry `src/lib/programmatic.ts`:
- Compress: `/compress-pdf-to-1mb`, `/compress-pdf-to-500kb`, `/compress-pdf-to-200kb`, `/compress-pdf-for-email`, `/compress-pdf-for-resume`
- Merge: `/merge-2-pdfs`, `/merge-3-pdfs`, `/merge-multiple-pdfs`, `/merge-pdfs-online`
- PDF↔Word: `/pdf-to-word-online`, `/pdf-to-word-free`, `/pdf-to-word-for-resume`, `/pdf-to-word-with-formatting`
- Sign: `/sign-pdf-online`, `/sign-contract-pdf`, `/e-sign-pdf-free`
- Watermark: `/watermark-pdf-online`, `/add-logo-watermark-to-pdf`

Generic `ProgrammaticPage.tsx` reuses the real tool component (with preset where relevant — e.g. compress quality auto-tuned for the 1MB / 500KB target). Each page has its own H1, intro, HowTo, FAQ, CTA, canonical, and a back-link to the parent tool. Copy is angle-specific: the "for-email" page talks about Gmail attachment limits and shared inboxes; "for-resume" talks about ATS uploads and recruiter portals.

## Phase 4 — Blog system + content clusters

- Routes `/blog`, `/blog/:slug`. Posts as typed TS modules in `src/content/blog/` (no MDX dep).
- Components: `BlogLayout` (TOC sidebar, breadcrumbs, sticky CTA, related strip), `BlogCard`, `Toc`, `ClusterFilter`.
- Schemas: Article + BreadcrumbList per post; CollectionPage on index; FAQPage if the post has an FAQ.
- Starter posts (each opens with a real scenario, not a generic intro):
  - **Compress**: Compress PDF Without Losing Quality · Compress PDF to 1MB · Compress PDF for Email · Why PDFs Get So Large
  - **Merge**: Merge PDF Files Online · Merge PDFs Without Adobe Acrobat · Merge PDFs on Mobile
  - **PDF→Word**: Convert PDF to Word Without Losing Formatting · Best PDF to Word Converter · Convert Resume PDF to Word
  - **Security**: Protect PDF Files · Add Password to PDF · Secure PDF Documents Online
- Interlinking rule per post: parent tool + 2 cluster siblings + 1 cross-cluster post + home. Tool pages get a "Related guides" strip (two-way linking).

## Phase 5 — Sitemap automation + technical SEO

- `scripts/generate-sitemap.ts` (wired via `predev`/`prebuild`) covers home, /tools, /guides, /use-cases, /privacy, 16 tools, all programmatic routes, /blog and posts.
- Remove duplicate canonical from `index.html` (Helmet owns it). Keep sitewide og:* fallback.
- `React.lazy` + `Suspense` for routes; `<link rel="prefetch">` for top tool pages on home.
- `loading="lazy"`, width/height on images.
- Update `public/llms.txt` to list new URLs with a one-line intent each.

## Phase 6 — Internal linking layer

- `src/lib/internalLinks.ts` resolves related tools, related programmatic variants, related posts from cluster/tag metadata.
- Footer: "Popular PDF tasks" column linking to high-intent programmatic URLs.
- Tool → related tools + related guides + variant URLs. Post → tool + siblings + 1 cross-cluster.

## Out of scope

- SSR (Vite SPA; Helmet covers JS-executing crawlers; sitewide og fallback handles social previews).
- Backend / Lovable Cloud.
- Changing existing tool UIs or processing logic.
- Per-page og:image generation.

## Technical details

```
src/
  lib/{tools.ts, programmatic.ts, internalLinks.ts}
  content/blog/                  # typed post modules
  components/
    Seo.tsx                      # + HowTo + Breadcrumb JSON-LD
    seo/{ToolSeoSections, WhatWhenHow, HowToSteps, Benefits, UseCases,
         FaqAccordion, RelatedTools, RelatedGuides, Breadcrumbs}.tsx
    blog/{BlogLayout, BlogCard, Toc, ClusterFilter}.tsx
  pages/
    programmatic/ProgrammaticPage.tsx
    blog/{Blog, BlogPost}.tsx
scripts/generate-sitemap.ts
```

JSON-LD coverage:

```text
Page type          | Schemas
-------------------|------------------------------------------------
Home               | Organization, WebSite + SearchAction
Tool page          | SoftwareApplication, HowTo, FAQPage, Breadcrumb
Programmatic page  | SoftwareApplication, HowTo, FAQPage, Breadcrumb
Blog index         | CollectionPage, Breadcrumb
Blog post          | Article, FAQPage (if present), Breadcrumb
```

## Execution order

Sequential phases. After each phase I pause so you can spot-check the copy voice before the next batch lands. Phase 1 unlocks Phase 2; Phase 3 unlocks programmatic traffic; Phase 4 builds topical authority; 5–6 lock in technical foundation. Approve to start Phase 1.