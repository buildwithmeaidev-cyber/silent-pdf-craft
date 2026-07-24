export function metaTags(asset) {
  return {
    title: asset.seoTitle,
    description: asset.metaDescription,
    canonical: `https://silentpdf.com/resources/${asset.slug}`,
    openGraph: {
      title: asset.seoTitle,
      description: asset.metaDescription,
      url: `https://silentpdf.com/resources/${asset.slug}`,
      type: 'article',
      images: []
    },
    twitter: {
      card: 'summary_large_image',
      title: asset.seoTitle,
      description: asset.metaDescription
    }
  };
}

export function jsonLdForAsset(asset) {
  const base = {
    '@context': 'https://schema.org',
    '@type': asset.contentType === 'problem-solving' ? 'HowTo' : 'Article',
    name: asset.title,
    description: asset.metaDescription,
    url: `https://silentpdf.com/resources/${asset.slug}`,
    headline: asset.seoTitle,
    datePublished: asset.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'SilentPDF'
    }
  };
  if (asset.stepByStep && asset.stepByStep.length) {
    base.step = asset.stepByStep.map((s, i) => ({
      '@type': 'HowToStep',
      url: `https://silentpdf.com/resources/${asset.slug}#step-${i+1}`,
      name: s.name,
      text: s.text
    }));
  }
  if (asset.faq && asset.faq.length) {
    base.mainEntity = asset.faq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
    }));
  }
  return base;
}
