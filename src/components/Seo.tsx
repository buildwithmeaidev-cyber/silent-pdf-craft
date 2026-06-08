import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { TOOLS } from "@/lib/tools";

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
      "Merge, split, compress, rotate, convert, and protect PDFs in your browser. Privacy-first, no uploads, no watermarks.",
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
      },
    ],
  },
  "/tools": {
    title: "All PDF Tools — silentPDF AI",
    description:
      "Browse every silentPDF tool: merge, split, compress, convert, rotate, sign, watermark, and more. All private, all in your browser.",
  },
  "/guides": {
    title: "PDF Guides & Tutorials — silentPDF AI",
    description:
      "Field notes on PDF craft: how-tos, workflow tips, and editorial guides from the silentPDF team.",
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
  const title = `${tool.title} — Free Online PDF Tool | silentPDF`;
  const description = tool.short.length > 160 ? tool.short.slice(0, 157) + "…" : tool.short;
  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.title,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: tool.description,
      url: `${SITE_URL}/tools/${tool.slug}`,
    },
  ];
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

export const Seo = () => {
  const { pathname } = useLocation();
  const toolSlug = toolSlugFromPath(pathname);
  const meta: RouteMeta =
    STATIC_META[pathname] ?? (toolSlug ? buildToolMeta(toolSlug) : {
      title: `${SITE_NAME} — Private PDF tools`,
      description: "Fast, private PDF tools that run in your browser.",
    });

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
