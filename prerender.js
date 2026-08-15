import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Polyfill DOMMatrix for pdfjs-dist in Node environment
globalThis.DOMMatrix = globalThis.DOMMatrix || class DOMMatrix {
  constructor() {}
};
import { JSDOM } from 'jsdom';

// Polyfill DOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost'
});
global.window = dom.window;
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
global.window.matchMedia = global.window.matchMedia || function() {
  return { matches: false, addListener: function() {}, removeListener: function() {} };
};
global.DOMMatrix = class DOMMatrix {
  constructor() {
    this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
  }
};
global.HTMLElement = dom.window.HTMLElement;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, p);

const template = fs.readFileSync(toAbsolute('dist/index.html'), 'utf-8');


// Determine routes to pre-render – static pages & tool pages
const routesToPrerender = [
  '/',
  '/tools',
  '/merge-pdf',
  '/split-pdf',
  '/remove-pages',
  '/edit-pdf',
  '/compress-pdf',
  '/protect-pdf',
  '/reorder-pdf',
  '/esign-pdf',
  '/watermark-pdf',
  '/photo-to-pdf',
  '/export-pdf',
  '/pdf-to-word',
  '/word-to-pdf',
  '/addpages-pdf',
  '/removewatermark-pdf',
  '/rotatepages-pdf',
  '/privacy-policy',
  '/about',
  '/blog',
  '/guides',
  '/use-cases',
  '/terms',
  '/security',
  '/contact',
  '/cookies',
];

const { render, RESOURCES, PROGRAMMATIC, POSTS } = await import('./dist/server/entry-server.js');

// Add all 50 programmatic SEO landing pages dynamically
PROGRAMMATIC.forEach(p => routesToPrerender.push('/' + p.slug));

// Add all blog post pages dynamically
POSTS.forEach(p => routesToPrerender.push('/blog/' + p.slug));

// Add the dynamic resource routes
routesToPrerender.push('/resources');

// Get unique categories
const categories = Array.from(new Set(RESOURCES.map(r => r.category)));
categories.forEach(cat => routesToPrerender.push(`/resources/${cat}`));

// Add individual assets
RESOURCES.forEach(r => routesToPrerender.push(`/resources/${r.category}/${r.slug}`));

let failures = 0;

(async () => {
  for (const url of routesToPrerender) {
    try {
      const helmetContext = {};
      const { html } = render(url, helmetContext);

      const helmet = helmetContext.helmet;
      if (!helmet) {
        console.error(`FATAL: no helmet server state for ${url}`);
        failures++;
        continue;
      }
      const headTags = [
        helmet.title.toString(),
        helmet.priority.toString(),
        helmet.meta.toString(),
        helmet.link.toString(),
        helmet.script.toString(),
      ].join('\n    ');

      if (!/<title[^>]*>[^<]+<\/title>/.test(headTags)) {
        console.error(`FATAL: empty <title> for ${url}`);
        failures++;
        continue;
      }

      const htmlWithApp = template
        .replace('<!--app-head-->', headTags)
        .replace('<!--app-html-->', html);

      const filePath = `dist${url === '/' ? '/index' : url}.html`;
      const dir = path.dirname(toAbsolute(filePath));
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(toAbsolute(filePath), htmlWithApp);
      console.log('pre-rendered:', filePath);
    } catch (err) {
      console.error(`Error pre-rendering ${url}:`, err.message);
      failures++;
    }
  }

  // Cleanup
  fs.rmSync(toAbsolute('dist/server'), { recursive: true, force: true });
  
  // Generate sitemap.xml with intelligent priority
  const siteUrl = process.env.VITE_SITE_URL || 'https://silentpdfai.pages.dev';
  // No <lastmod>: the content model has no page-specific modification timestamps,
  // and stamping every URL with the build date is an invalid non-page-specific value.

  function getPriority(route) {
    if (route === '/') return '1.0';
    if (route === '/tools') return '0.9';
    if (['/merge-pdf','/split-pdf','/compress-pdf','/edit-pdf','/pdf-to-word','/word-to-pdf','/protect-pdf','/esign-pdf'].includes(route)) return '0.9';
    if (route.startsWith('/blog')) return '0.7';
    if (route.startsWith('/resources')) return '0.6';
    return '0.8';
  }

  function getChangefreq(route) {
    if (route === '/' || route === '/tools') return 'daily';
    if (route.startsWith('/blog')) return 'weekly';
    return 'weekly';
  }

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routesToPrerender.map(route => `  <url>
    <loc>${siteUrl}${route === '/' ? '' : route}</loc>
    <changefreq>${getChangefreq(route)}</changefreq>
    <priority>${getPriority(route)}</priority>
  </url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(toAbsolute('dist/sitemap.xml'), sitemapContent);
  console.log('pre-rendered: dist/sitemap.xml');
  console.log(`Total pages pre-rendered: ${routesToPrerender.length}`);

  console.log('Prerender complete.');
})();

