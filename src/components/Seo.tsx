import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { TOOLS } from "@/lib/tools";
import { getProgrammatic } from "@/lib/programmatic";
import { RESOURCES, getResource } from "@/content/resources";
import { getPost } from "@/content/blog/posts";
import { HOME_FAQ } from "@/components/home/HomeFaq";
import { SITE_URL, SITE_NAME, OG_IMAGE } from "@/lib/site";
import { getPreset, KIND_META } from "@/lib/workflows";

type RouteMeta = {
  title: string;
  description: string;
  jsonLd?: Record<string, unknown>[];
};

const STATIC_META: Record<string, RouteMeta> = {
  "/": {
    title: "Free PDF Tools — Merge, Split, Compress, Sign | SilentPDF",
    description:
      "Merge, split, compress, convert, edit and sign PDFs right in your browser. Private, fast, free — no uploads and no signup.",
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
        name: "Free PDF Tools — Merge, Split, Compress, Sign | SilentPDF",
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
        name: "SilentPDF Suite",
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
    title: "All PDF Tools — SilentPDF",
    description:
      "Every SilentPDF tool in one place: merge, split, compress, convert, rotate, sign, watermark, and more. All private, all in your browser.",
  },
  "/blog": {
    title: "PDF Guides & How-Tos — SilentPDF Blog",
    description:
      "Practical posts and guides about merging, splitting, compressing, converting, editing, and protecting PDFs privately in your browser.",
  },
  "/guides": {
    title: "PDF Workflow Guides & Tutorials — SilentPDF",
    description:
      "Master your PDF document pipeline with practical tutorials, how-tos, and step-by-step guides from the SilentPDF team.",
  },
  "/use-cases": {
    title: "PDF Use Cases for Students, Business & Legal — SilentPDF",
    description:
      "See how students, freelancers, HR teams, small businesses, and legal professionals use browser-based PDF tools safely.",
  },
  "/resources": {
    title: "PDF Knowledge Base & Resource Center — SilentPDF",
    description: "The most comprehensive PDF knowledge base on the internet. Master your documents with guides, comparisons, and industry resources.",
  },
  "/templates": {
    title: "Free PDF Templates — Resume, Invoice, NDA | SilentPDF",
    description: "Download free resume, cover letter, invoice, NDA, proposal and meeting-notes PDF templates. Generated in your browser, no signup.",
  },
  "/video-tools": {
    title: "Private Browser Video Tools — SilentPDF",
    description: "Remove watermarks and edit video entirely in your browser. Nothing is uploaded — every file stays on your device.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Video Tools",
        url: `${SITE_URL}/video-tools`,
        description: "Browser-based video tools that process files locally with WebAssembly.",
      },
    ],
  },

  "/workflows": {
    title: "Automated Multi-Step PDF Workflows — SilentPDF",
    description: "Chain multiple PDF tasks together in one pass: compress, rotate, sign, and convert without multiple file uploads.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "SilentPDF workflows",
        url: `${SITE_URL}/workflows`,
        description: "Ready-made browser-based PDF workflows for common document jobs.",
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Ready-made PDF workflows",
        itemListElement: [],
      },
    ],
  },
  "/privacy": {
    title: "Privacy Policy — SilentPDF",
    description:
      "How SilentPDF handles your files: browser-based processing, no storage, no logging, TLS in transit, auto-deletion.",
  },
  "/terms": {
    title: "Terms of Service — SilentPDF",
    description: "Terms and conditions for using SilentPDF's browser-based document tools.",
  },
  "/about": {
    title: "About SilentPDF — Private, Browser-Based PDF Tools",
    description: "Who builds SilentPDF and why every tool runs on your device instead of a server. No accounts, no uploads, no tracking.",
  },
  "/contact": {
    title: "Contact SilentPDF — Support & Feedback",
    description: "Report a bug, request a tool, or ask a privacy question. We answer support and data requests directly.",
  },
  "/dpa": {
    title: "Data Processing Agreement — SilentPDF",
    description: "SilentPDF's DPA for teams: what we process (nothing), sub-processors, and how browser-only processing changes your obligations.",
  },
  "/cookies": {
    title: "Cookie Policy — SilentPDF",
    description: "The short list of cookies and local storage keys SilentPDF uses, what each one does, and how to clear them.",
  },
  "/workflows/custom": {
    title: "Build a Custom PDF Workflow — SilentPDF",
    description: "Chain any PDF tools in any order and run them on one file, in your browser. Compress, sign, watermark and protect in one pass.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Build a Custom PDF Workflow",
        url: `${SITE_URL}/workflows/custom`,
        description: "Build a personal PDF workflow by chaining browser-based tools in the order you need.",
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Workflows", item: `${SITE_URL}/workflows` },
          { "@type": "ListItem", position: 3, name: "Custom workflow", item: `${SITE_URL}/workflows/custom` },
        ],
      },
    ],
  },
  "/remove-video-watermark": {
    title: "Remove Watermark from Video Online Free — SilentPDF",
    description:
      "Remove watermarks from videos directly in your browser. Draw a box over the watermark and export a clean MP4 — private, free, no upload required.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Remove Video Watermark",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web Browser",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description:
          "Remove watermarks from videos entirely in your browser using WebAssembly-based FFmpeg processing.",
        url: `${SITE_URL}/remove-video-watermark`,
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools` },
          { "@type": "ListItem", position: 3, name: "Remove Video Watermark", item: `${SITE_URL}/remove-video-watermark` },
        ],
      },
    ],
  },
  "/security": {
    title: "Security Architecture & Privacy Policy — SilentPDF",
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
      description: "A focused PDF tool from SilentPDF.",
    };
  }
  const title = tool.seoTitle ?? `${tool.title} — Free Online PDF Tool | SilentPDF`;
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

function buildWorkflowMeta(id: string): RouteMeta {
  const workflow = getPreset(id);
  if (!workflow) {
    const url = `${SITE_URL}/workflows/run/${id}`;
    return {
      title: "Run a Custom PDF Workflow — SilentPDF",
      description: "Run your custom chain of browser-based PDF tools on one file without uploading it.",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Run a custom PDF workflow",
          description: "Process a document through a custom chain of PDF tools in your browser.",
          step: [
            { "@type": "HowToStep", position: 1, name: "Upload a file", text: "Choose the file your workflow should process." },
            { "@type": "HowToStep", position: 2, name: "Run the workflow", text: "Let each selected tool pass its result to the next step." },
            { "@type": "HowToStep", position: 3, name: "Download the result", text: "Download the finished file when processing completes." },
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Workflows", item: `${SITE_URL}/workflows` },
            { "@type": "ListItem", position: 3, name: "Custom workflow", item: url },
          ],
        },
      ],
    };
  }

  const url = `${SITE_URL}/workflows/run/${workflow.id}`;
  const stepLabels = workflow.steps.map((step) => KIND_META[step.kind].label);
  return {
    title: `${workflow.name} Workflow — SilentPDF`,
    description: `${workflow.description} Run the complete process privately in your browser.`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `${workflow.name} workflow`,
        description: workflow.description,
        totalTime: "PT2M",
        step: workflow.steps.map((step, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: stepLabels[i],
          text: `Run the ${stepLabels[i].toLowerCase()} step on the file produced by the previous step.`,
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Workflows", item: `${SITE_URL}/workflows` },
          { "@type": "ListItem", position: 3, name: workflow.name, item: url },
        ],
      },
    ],
  };
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
    title: `PDF ${title} — SilentPDF Resource Center`,
    description: `Explore our collection of PDF ${title.toLowerCase()} to master document management.`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `SilentPDF ${title}`,
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
  const workflowRunMatch = pathname.match(/^\/workflows\/run\/([^/]+)\/?$/);
  const rootSlugMatch = pathname.match(/^\/([^/]+)\/?$/);

  let meta: RouteMeta | null = STATIC_META[pathname] ?? null;
  
  if (!meta && blogPostMatch) meta = buildBlogMeta(blogPostMatch[1]);
  if (!meta && resourceAssetMatch) meta = buildResourceAssetMeta(resourceAssetMatch[1], resourceAssetMatch[2]);
  if (!meta && resourceCatMatch) meta = buildResourceCategoryMeta(resourceCatMatch[1]);
  if (!meta && workflowRunMatch) meta = buildWorkflowMeta(workflowRunMatch[1]);
  
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

  const isArticle = Boolean(blogPostMatch || resourceAssetMatch);
  const jsonLd = meta.jsonLd?.length
    ? meta.jsonLd
    : [{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: meta.title,
        description: meta.description,
        url: `${SITE_URL}${pathname === "/" ? "/" : pathname.replace(/\/$/, "")}`,
      }];

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
      <meta property="og:type" content={isArticle ? "article" : "website"} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:alt" content="SilentPDF - Free Online PDF Tools" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta name="twitter:image:alt" content="SilentPDF PDF Tools" />
      {jsonLd.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
