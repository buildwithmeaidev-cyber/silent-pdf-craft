import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { TOOLS } from "@/lib/tools";
import { getProgrammatic } from "@/lib/programmatic";
import { getPost, POSTS } from "@/content/blog/posts";

const SITE_URL = "https://silentpdfai.pages.dev";
const SITE_NAME = "silentPDF AI";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

type RouteMeta = {
  title: string;
  description: string;
  jsonLd?: Record<string, unknown>[];
};

const STATIC_META: Record<string, RouteMeta> = {
  "/": {
    title: "silentPDF AI — Private PDF tools that actually work",
    description:
      "Merge, split, compress, convert, sign, and protect PDFs right in your browser. No uploads, no watermarks, no signup.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo-512.png`,
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/tools?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  },
  "/tools": {
    title: "All PDF Tools — silentPDF AI",
    description:
      "Every silentPDF tool in one place: merge, split, compress, convert, rotate, sign, watermark, and more. All private, all in your browser.",
  },
  "/guides": {
    title: "PDF Guides & Tutorials — silentPDF AI",
    description:
      "Plain-language guides for the PDF tasks people actually run into: shrinking files for email, signing contracts, merging scans.",
  },
  "/use-cases": {
    title: "PDF Use Cases for Students, Teams & Freelancers — silentPDF AI",
    description:
      "How students, HR teams, teachers, freelancers, and small businesses use silentPDF every day.",
  },
  "/privacy": {
    title: "Privacy Policy — silentPDF AI",
    description:
      "How silentPDF handles your files: browser-based processing, no storage, no logging, TLS in transit, auto-deletion.",
  },
};

function toolSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/tools\/([^/]+)\/?$/);
  return match ? match[1] : null;
}

function buildToolMeta(slug: string): RouteMeta {
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) {
    return {
      title: `PDF Tool — ${SITE_NAME}`,
      description: "A focused PDF tool from silentPDF.",
    };
  }
  const title = tool.seoTitle ?? `${tool.title} — Free Online PDF Tool | silentPDF`;
  const rawDesc = tool.metaDescription ?? tool.short;
  const description = rawDesc.length > 160 ? rawDesc.slice(0, 157) + "…" : rawDesc;
  const toolUrl = `${SITE_URL}/tools/${tool.slug}`;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.title,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: tool.description,
      url: toolUrl,
      aggregateRating: undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "PDF Tools", item: `${SITE_URL}/tools` },
        { "@type": "ListItem", position: 3, name: tool.title, item: toolUrl },
      ],
    },
  ];

  if (tool.howItWorks?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to ${tool.title.toLowerCase()} online`,
      description: tool.whatItDoes ?? tool.description,
      totalTime: "PT1M",
      step: tool.howItWorks.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    });
  }

  if (tool.faq?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: tool.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return { title, description, jsonLd };
}

function buildProgrammaticMeta(slug: string): RouteMeta | null {
  const v = getProgrammatic(slug);
  if (!v) return null;
  const url = `${SITE_URL}/${v.slug}`;
  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: v.title,
      url,
      description: v.metaDescription,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: v.title, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: v.title,
      description: v.intent,
      step: v.howItWorks.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: v.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
  return { title: v.seoTitle, description: v.metaDescription, jsonLd };
}

function buildBlogIndexMeta(): RouteMeta {
  return {
    title: "PDF Guides & How-Tos — silentPDF Blog",
    description:
      "Practical posts about compressing, merging, converting, and protecting PDFs — for real situations, not search engines.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "silentPDF Blog",
        url: `${SITE_URL}/blog`,
        hasPart: POSTS.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: `${SITE_URL}/blog/${p.slug}`,
          datePublished: p.publishedAt,
        })),
      },
    ],
  };
}

function buildBlogPostMeta(slug: string): RouteMeta | null {
  const post = getPost(slug);
  if (!post) return null;
  const url = `${SITE_URL}/blog/${post.slug}`;
  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt,
      url,
      author: { "@type": "Organization", name: SITE_NAME },
      publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-512.png` } },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];
  if (post.faq?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return { title: post.seoTitle, description: post.metaDescription, jsonLd };
}

export const Seo = () => {
  const { pathname } = useLocation();
  const toolSlug = toolSlugFromPath(pathname);
  const blogPostMatch = pathname.match(/^\/blog\/([^/]+)\/?$/);
  const rootSlugMatch = pathname.match(/^\/([^/]+)\/?$/);
  const isBlogIndex = pathname === "/blog";

  let meta: RouteMeta | null = STATIC_META[pathname] ?? null;
  if (!meta && toolSlug) meta = buildToolMeta(toolSlug);
  if (!meta && isBlogIndex) meta = buildBlogIndexMeta();
  if (!meta && blogPostMatch) meta = buildBlogPostMeta(blogPostMatch[1]);
  if (!meta && rootSlugMatch) meta = buildProgrammaticMeta(rootSlugMatch[1]);
  if (!meta) {
    meta = {
      title: `${SITE_NAME} — Private PDF tools`,
      description: "Fast, private PDF tools that run in your browser.",
    };
  }

  const canonical = `${SITE_URL}${pathname === "/" ? "/" : pathname.replace(/\/$/, "")}`;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={pathname === "/" ? "website" : "article"} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      {meta.jsonLd?.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
