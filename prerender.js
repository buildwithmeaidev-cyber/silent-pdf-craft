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

// Routes come from src/lib/routes.ts — the single source of truth shared with
// the sitemap, so tools/posts/landing pages can never be prerendered without
// also being listed in sitemap.xml (and vice versa).
const { render, ROUTES, TOOLS } = await import('./dist/server/entry-server.js');

const siteUrl = (process.env.VITE_SITE_URL || 'https://silent-pdf-craft.lovable.app').replace(/\/$/, '');

let failures = 0;

(async () => {
  for (const { path: url } of ROUTES) {
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

  // Sitemap. No <lastmod>: the content model has no page-specific modification
  // timestamps, and stamping every URL with the build date is invalid.
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map((r) => `  <url>
    <loc>${siteUrl}${r.path === '/' ? '/' : r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(toAbsolute('dist/sitemap.xml'), sitemapContent);
  // Keep the checked-in copy in sync so the dev preview serves the same file.
  fs.writeFileSync(toAbsolute('public/sitemap.xml'), sitemapContent);

  // Manifest consumed by scripts/verify-seo.mjs
  fs.writeFileSync(
    toAbsolute('dist/seo-manifest.json'),
    JSON.stringify({ toolSlugs: TOOLS.map((t) => t.slug), routes: ROUTES.map((r) => r.path) }, null, 2)
  );
  console.log('pre-rendered: dist/sitemap.xml');
  console.log(`Total pages pre-rendered: ${ROUTES.length}`);

  if (failures > 0) {
    console.error(`Prerender failed for ${failures} route(s).`);
    process.exit(1);
  }

  console.log('Prerender complete.');
})();
