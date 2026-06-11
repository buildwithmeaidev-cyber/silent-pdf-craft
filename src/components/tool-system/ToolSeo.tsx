import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

/**
 * ToolSeo – sets SEO meta tags for each PDF tool page.
 * It receives the tool definition (slug, title, description) and builds
 * a complete set of meta tags: title, description, canonical URL, OpenGraph
 * and Twitter Card. Structured data (JSON‑LD) is also added for better
 * discoverability.
 */
export default function ToolSeo({ slug, title, description }: { slug: string; title: string; description: string }) {
  const location = useLocation();
  const baseUrl = 'https://silentpdf.ai'; // TODO: Make configurable via env variable
  const url = `${baseUrl}${location.pathname}`;
  const ogImage = `${baseUrl}/og-image/${slug}.png`; // Generated image per tool (static placeholder for now)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    image: ogImage,
  };

  return (
    <Helmet>
      <title>{title} – SilentPDF AI</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {/* OpenGraph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {/* Structured data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
