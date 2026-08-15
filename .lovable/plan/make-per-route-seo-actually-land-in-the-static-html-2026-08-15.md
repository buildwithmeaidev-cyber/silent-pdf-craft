# Make per-route SEO actually land in the static HTML

The metadata logic already exists (`src/components/Seo.tsx` emits per-route title, description, canonical, og/twitter tags, Organization + WebSite + SoftwareApplication + FAQPage JSON-LD). It never reaches the prerendered files, so every page ships the same head. Fix the delivery path, then verify it automatically.

## 1. Root cause: Helmet thinks it is running in a browser

`prerender.js` installs a JSDOM `window` and `document` on `globalThis` before importing the app. react-helmet-async decides at import time whether it is on a server by checking for `window.document`; with the polyfill present it takes the client path, mutates the fake DOM, and never writes `context.helmet` — which is why `helmetContext.helmet` comes back empty while the body renders fine.

Fix in `src/entry-server.tsx`: force server mode by setting `HelmetProvider.canUseDOM = false` before rendering. The JSDOM polyfill stays (pdfjs-dist needs it).

## 2. Prerender injection

`prerender.js` keeps reading `helmetContext.helmet`, which will now be populated. Assemble title + priority + meta + link + script into the `<!--app-head-->` slot (placeholders in `index.html` already match). Add a hard failure: if `helmet` is missing or the title is empty for a route, log an error and exit non-zero so a silent regression can't ship again.

## 3. Sitemap lastmod

Both generators stamp every URL with the build date. Drop `<lastmod>` entirely from:
- `prerender.js` sitemap output
- `scripts/gen-sitemap.ts`
- the committed `public/sitemap.xml`

No page-specific timestamps exist in the content model, so omitting is correct; `changefreq` and `priority` stay.

## 4. Structured data coverage pass

With injection fixed, confirm in the built HTML that the homepage carries Organization + WebSite, every tool page carries SoftwareApplication + BreadcrumbList, and every page with an FAQ block carries FAQPage. Fill any route that turns out to be missing a schema in `Seo.tsx`.

## 5. Automated check

New `scripts/verify-seo.mjs`, run at the end of `npm run build` (after `prerender.js`):

For every generated `dist/**/*.html`:
- has a non-empty `<title>` and `<meta name="description">`
- title and description are unique across all tool pages
- `<link rel="canonical">` and `og:url` both self-reference that route's URL
- `og:title` / `og:description` / `twitter:card` present
- at least one valid JSON-LD block; tool pages must include `SoftwareApplication`, the homepage `Organization` and `WebSite`

Prints a per-route table and exits non-zero on any failure, so the build breaks instead of quietly shipping duplicate metadata.

## 6. Verify and close out

Run the full build, inspect several prerendered files (home, a tool, a programmatic page, a blog post) to confirm the head differs per page, then mark the two security findings (owner-password reuse, ffmpeg CDN load — already fixed in code) and the SEO metadata / social preview / structured data findings as fixed.

## Not in scope

The robots + sitemap domain findings expect `silent-pdf-craft.lovable.app`, while the project targets `silentpdfai.pages.dev`. Leaving those pointed at your production host unless you say otherwise.
