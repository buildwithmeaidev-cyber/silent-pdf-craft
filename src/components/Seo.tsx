import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { TOOLS } from "@/lib/tools";
import { getProgrammatic } from "@/lib/programmatic";
import { RESOURCES, getResource } from "@/content/resources";
import { getPost } from "@/content/blog/posts";
import { HOME_FAQ } from "@/components/home/HomeFaq";

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://silentpdfai.pages.dev";
const SITE_NAME = "silentPDF AI";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

type RouteMeta = {
  title: string;
  description: string;
  jsonLd?: Record<string, unknown>[];
};

const STATIC_META: Record<string, RouteMeta> = {
  "/": {
    title: "Free PDF Tools: Merge, Split, Compress, Convert, Edit & Sign PDFs | SilentPDF AI",
    description:
      "Free online PDF tools to merge, split, compress, convert, edit, sign, rotate and protect PDF files securely in your browser. 100% private, fast, browser-based PDF processing with no registration required.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo-512.png`,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        description: "Free online browser-based PDF tools with zero file uploads for maximum privacy.",
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/tools?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Free PDF Tools: Merge, Split, Compress, Convert, Edit & Sign PDFs | SilentPDF AI",
        url: `${SITE_URL}/`,
        description: "Free online PDF tools to merge, split, compress, convert, edit, sign, rotate and protect PDF files securely in your browser.",
        isPartOf: {
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "SilentPDF AI Suite",
        operatingSystem: "Web Browser",
        applicationCategory: "BusinessApplication",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description: "Comprehensive suite of privacy-first, browser-based PDF processing tools.",
        url: SITE_URL,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: HOME_FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  },
  "/tools": {
    title: "All PDF Tools — SilentPDF AI",
    description:
      "Every SilentPDF tool in one place: merge, split, compress, convert, rotate, sign, watermark, and more. All private, all in your browser.",
  },
  "/blog": {
    title: "PDF Guides & How-Tos — SilentPDF AI Blog",
    description:
      "Practical posts and guides about merging, splitting, compressing, converting, editing, and protecting PDFs privately in your browser.",
  },
  "/guides": {
    title: "PDF Workflow Guides & Tutorials — SilentPDF AI",
    description:
      "Master your PDF document pipeline with practical tutorials, how-tos, and step-by-step guides from the SilentPDF team.",
  },
  "/use-cases": {
    title: "PDF Use Cases for Students, Business & Legal — SilentPDF AI",
    description:
      "See how students, freelancers, HR teams, small businesses, and legal professionals use browser-based PDF tools safely.",
  },
  "/resources": {
    title: "PDF Knowledge Base & Resource Center — SilentPDF AI",
    description: "The most comprehensive PDF knowledge base on the internet. Master your documents with guides, comparisons, and industry resources.",
  },
  "/templates": {
    title: "Free Document & PDF Templates — SilentPDF AI",
    description: "Browse free document templates, contract layouts, and fillable PDF forms ready for browser editing.",
  },
  "/workflows": {
    title: "Automated Multi-Step PDF Workflows — SilentPDF AI",
    description: "Chain multiple PDF tasks together in one pass: compress, rotate, sign, and convert without multiple file uploads.",
  },
  "/privacy": {
    title: "Privacy Policy — SilentPDF AI",
    description:
      "How SilentPDF handles your files: browser-based processing, no storage, no logging, TLS in transit, auto-deletion.",
  },
  "/terms": {
    title: "Terms of Service — SilentPDF AI",
    description: "Terms and conditions for using SilentPDF AI's browser-based document tools.",
  },
  "/security": {
    title: "Security Architecture & Privacy Policy — SilentPDF AI",
    description: "Detailed overview of client-side WASM sandboxing, memory auto-purge, and serverless privacy controls.",
  },
};

function toolSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/([^/]+)\/?$/);
  if (!match) return null;
  const slug = match[1];
  return TOOLS.some((t) => t.slug === slug) ? slug : null;
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
  const toolUrl = `${SITE_URL}/${tool.slug}`;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.title,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: tool.description,
      url: toolUrl,
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

function buildResourceCategoryMeta(category: string): RouteMeta | null {
  const valid = ["blog", "guides", "comparisons", "checklists", "templates", "glossary", "use-cases"];
  if (!valid.includes(category)) return null;
  const title = category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ");
  
  return {
    title: `PDF ${title} — silentPDF AI Resource Center`,
    description: `Explore our collection of PDF ${title.toLowerCase()} to master document management.`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `silentPDF ${title}`,
        url: `${SITE_URL}/resources/${category}`,
        hasPart: RESOURCES.filter(r => r.category === category).map((r) => ({
          "@type": "Article",
          headline: r.title,
          url: `${SITE_URL}/resources/${r.category}/${r.slug}`,
          datePublished: r.publishedAt,
        })),
      },
    ],
  };
}

function buildResourceAssetMeta(category: string, slug: string): RouteMeta | null {
  const asset = getResource(slug);
  if (!asset || asset.category !== category) return null;
  const url = `${SITE_URL}/resources/${asset.category}/${asset.slug}`;
  
  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: asset.title,
      description: asset.metaDescription,
      datePublished: asset.publishedAt,
      url,
      author: { "@type": "Organization", name: SITE_NAME },
      publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-512.png` } },
      // AI Search Content Rules
      articleSection: asset.definition ? "Definition" : undefined,
      abstract: asset.quickAnswer,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Resources", item: `${SITE_URL}/resources` },
        { "@type": "ListItem", position: 3, name: asset.category, item: `${SITE_URL}/resources/${asset.category}` },
        { "@type": "ListItem", position: 4, name: asset.title, item: url },
      ],
    },
  ];

  if (asset.faq?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: asset.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  if (asset.stepByStep?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: asset.title,
      step: asset.stepByStep.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    });
  }
  return { title: asset.title, description: asset.metaDescription, jsonLd };
}

function buildBlogMeta(slug: string): RouteMeta | null {
  const post = getPost(slug);
  if (!post) return null;
  const url = `${SITE_URL}/blog/${post.slug}`;
  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.metaDescription,
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      url,
      author: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo-512.png`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
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
  const blogPostMatch = pathname.match(/^\/blog\/([^/]+)\/?$/);
  const resourceCatMatch = pathname.match(/^\/resources\/([^/]+)\/?$/);
  const resourceAssetMatch = pathname.match(/^\/resources\/([^/]+)\/([^/]+)\/?$/);
  const rootSlugMatch = pathname.match(/^\/([^/]+)\/?$/);

  let meta: RouteMeta | null = STATIC_META[pathname] ?? null;
  
  if (!meta && blogPostMatch) meta = buildBlogMeta(blogPostMatch[1]);
  if (!meta && resourceAssetMatch) meta = buildResourceAssetMeta(resourceAssetMatch[1], resourceAssetMatch[2]);
  if (!meta && resourceCatMatch) meta = buildResourceCategoryMeta(resourceCatMatch[1]);
  
  if (!meta && rootSlugMatch) {
    const slug = rootSlugMatch[1];
    meta = buildProgrammaticMeta(slug) || buildToolMeta(slug);
  }
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
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={pathname === "/" ? "website" : "article"} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:alt" content="SilentPDF AI - Free Online PDF Tools" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta name="twitter:image:alt" content="SilentPDF AI PDF Tools" />
      {meta.jsonLd?.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
