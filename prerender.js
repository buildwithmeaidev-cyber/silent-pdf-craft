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
const { render } = await import('./dist/server/entry-server.js');

// Determine routes to pre-render
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
  '/guides',
  '/use-cases',
  '/privacy',
  '/privacy-policy',
  '/about',
  '/blog',
  '/compress-pdf-for-email',
  '/compress-pdf-to-1mb',
  '/compress-pdf-to-500kb',
  '/compress-pdf-for-resume',
  '/merge-2-pdfs',
  '/merge-3-pdfs',
  '/merge-multiple-pdfs',
  '/pdf-to-word-online',
  '/pdf-to-word-for-resume',
  '/pdf-to-word-with-formatting',
  '/convert-scanned-pdf-to-word',
  '/sign-pdf-online',
  '/sign-contract-pdf',
  '/watermark-pdf-online',
  '/add-logo-watermark-pdf'
];

(async () => {
  for (const url of routesToPrerender) {
    const helmetContext = {};
    const { html } = render(url, helmetContext);
    
    const helmet = helmetContext.helmet;
    let headTags = '';
    if (helmet) {
      headTags = `
        ${helmet.title.toString()}
        ${helmet.priority.toString()}
        ${helmet.meta.toString()}
        ${helmet.link.toString()}
        ${helmet.script.toString()}
      `;
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
  }

  // Cleanup
  fs.rmSync(toAbsolute('dist/server'), { recursive: true, force: true });
  
  // Generate sitemap.xml
  const siteUrl = 'https://silentpdfai.pages.dev';
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routesToPrerender.map(route => `  <url>
    <loc>${siteUrl}${route === '/' ? '' : route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(toAbsolute('dist/sitemap.xml'), sitemapContent);
  console.log('pre-rendered: dist/sitemap.xml');

  // Generate robots.txt
  const robotsTxtContent = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
  fs.writeFileSync(toAbsolute('dist/robots.txt'), robotsTxtContent);
  console.log('pre-rendered: dist/robots.txt');

  console.log('Prerender complete.');
})();
