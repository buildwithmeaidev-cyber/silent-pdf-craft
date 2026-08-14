# Fix critical security findings + per-page SEO

## 1. Protect PDF — restrictions can be stripped (critical)

`protectPdf()` in `src/lib/pdf.ts` sets `ownerPassword` equal to the user's password, so anyone who can open the file can also remove printing/copying/editing limits.

- Generate a strong random owner password (crypto random, 32 chars) inside `protectPdf()` and use it for the permissions layer. The user's password stays the open password only.
- Password strength UX on the Protect PDF tool:
  - Live strength meter (weak / fair / strong) based on length, mixed case, digits, symbols, and common-password check.
  - When weak: show an inline suggestion with a concrete example (e.g. `Blue-Otter-42!Rain`) and a "use a suggested password" button that fills a generated strong password.
  - Weak passwords are still allowed after the warning — the user decides; encryption applies with whatever they typed.
  - Minimum stays 4 characters; recommend 12+.

## 2. Video watermark remover — code loaded from public CDN (warning)

`src/lib/video.ts` fetches `ffmpeg-core.js` and `ffmpeg-core.wasm` from `unpkg.com` at runtime.

- Add `@ffmpeg/core` as a project dependency and resolve the core JS/WASM through Vite (`new URL(..., import.meta.url)`) so both ship from our own origin.
- Remove the `unpkg.com` base URL entirely — no runtime third-party code fetch.
- Keep the existing blob-URL loading path and the friendly "engine failed to load" error.

## 3. Root cause of every SEO finding: prerender placeholders don't match

`prerender.js` replaces `<!--app-head-->` and `<!--app-html-->`, but `index.html` contains `<!-- app-head -->` and `<!-- app-html -->` (with spaces). Nothing is ever injected, so every prerendered page ships the homepage `<title>`, description, `og:*`, and no JSON-LD — exactly what the scanner reports.

- Align the placeholders so per-route head tags and markup are actually injected.
- Remove the stray nested `<head>` block wrapping the Clarity script in `index.html` (lines 128–136) — it corrupts head parsing for crawlers.
- Keep the static homepage tags in `index.html` as fallback, but drop the hardcoded `og:url` there so the per-route one wins after injection; leave a self-referencing homepage canonical.

## 4. Per-route metadata, canonical, og:url, structured data

In `src/components/Seo.tsx`:

- Emit a self-referencing `<link rel="canonical">` and `og:url` for the current route on every page (tools, programmatic pages, blog, resources, static pages) instead of the homepage URL.
- Emit per-route `og:title` / `og:description` / `twitter:*` matching the route's own title and description.
- Confirm tool pages emit `SoftwareApplication` + `HowTo` + `FAQPage` + `BreadcrumbList`, and the homepage emits `Organization` + `WebSite`. That logic exists but never reached the HTML — verify each type appears in built output after the placeholder fix.

## 5. Sitemap / robots domain

Staying on **silentpdfai.pages.dev** as you chose. Robots and sitemap keep that domain; the Lovable scanner's "wrong domain" note stays and can be ignored — it does not affect your live site. No change needed beyond keeping `prerender.js` and `public/sitemap.xml` on the same host.

## Verification

- Run the production build and grep several built pages (`dist/merge-pdf.html`, `dist/blog/*.html`, a programmatic page) to confirm each has a unique title, description, canonical, og:url, and its JSON-LD blocks.
- Confirm the ffmpeg core files resolve from a local path, not unpkg.
- Test Protect PDF: weak-password warning shows, output opens with the user's password, and permissions cannot be removed with that password.
- Mark the two security findings fixed once the code changes are in.
