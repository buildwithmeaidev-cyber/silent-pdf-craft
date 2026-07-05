
# Full rollout plan — 5 phases, no-regression guardrails

I'll ship all 17 items in 5 phases. Each phase is independently deployable and preview-verified before starting the next, so we never break the live app.

Waiting on you: **paste the PDF Blender key files/repo link** — I'll fold its smooth-scroll setup, OCR pipeline, and editor internals into Phase 3 & 4. If it doesn't arrive by Phase 3, I'll rebuild inspired by it (Lenis + tesseract.js + pdf.js/pdf-lib) and note the differences.

---

## Phase 1 — Polish, fixes, dark mode, cleanup (low risk)

**Items:** 1, 2, 7, 14, 15, partial 4

- **Dark mode overhaul** — audit `src/index.css` tokens; introduce a proper deep palette (bg `hsl(222 25% 6%)`, surfaces `hsl(222 20% 9%)`, borders at 8% alpha, elevated `--card` w/ subtle inner glow); fix hardcoded `text-white`/`bg-black` occurrences via grep sweep; add `DarkModeToggle` into `Navbar`; persist choice to `localStorage` + honor `prefers-color-scheme`.
- **Navbar** — add active-underline indicator, dark-mode toggle, resource dropdown (Guides/Blog/Use Cases/Workflows), mobile drawer polish, sticky glass with tuned blur & border for both themes.
- **Footer** — replace current thin footer with 4-column: Product (Tools, Workflows, PDF Editor, OCR), Resources (Guides, Blog, Use Cases, Changelog), Company (About, Contact, Security), Legal (Privacy, Terms, DPA, Cookie Policy). Newsletter capture, socials, build hash line.
- **Kill fake timers** — remove all "~15s / ~10s" strings from `tools.ts`, `ToolPage.tsx`, tool cards, and workflow steps. Replace with real progress % from `usePdfJob`.
- **Fix `/blog` 404** — register `Blog` and `BlogPost` routes in `App.tsx` (currently unrouted); wire to `content/blog/posts.ts`.
- **Stub legal routes** so Phase 2 has homes: `/terms`, `/dpa`, `/security`, `/contact`, `/cookies` with basic scaffolds.

## Phase 2 — Legal & trust pages, homepage refactor, workflow UX (items 3, 4, 5, 6, 8)

- **Remove from homepage**: "Popular workflows / Chain tools end to end" block.
- **Add homepage "How workflows work"** 4-step visual explainer with animated diagram; CTA "Explore Workflows" → `/workflows`.
- **Homepage Product section** now lists Tools, Workflows (linked), PDF Editor, OCR.
- **Use Cases page** — rewrite each case (Legal, HR, Sales, Education, Finance, Freelance) with problem → recommended workflow (linked) → tools used → sample outcome. Each use case links to a matching pre-built workflow.
- **Workflows page** — add 8 more curated workflows (Redact & Send, Contract Prep, Invoice Batch, Scan → OCR → Word, Presentation Cleanup, Photo Album PDF, Legal Discovery, Report Publisher). Improved cards w/ step preview, tool chips, est. output. Better spacing/grid.
- **Legal pages** with real, app-specific content:
  - `/privacy` — expanded: what's collected (nothing server-side for tools), how browser-only processing works, third-party services (Cloudflare CDN only), cookie usage, DSR rights, retention. Diagram: "Your file → Your browser (WASM) → Your download". Follows trust-page-generation skill.
  - `/security` — threat model, browser sandbox, no upload guarantee, CSP, dependency scanning, incident contact.
  - `/terms`, `/dpa`, `/cookies`, `/contact` (form → mailto, no backend).

## Phase 3 — Deferred tech: drag-to-place editors + Comlink worker + previews (items 11, 17, partial 10)

- **`src/workers/pdfWorker.ts`** — Comlink-exposed `compress`, `wordToPdf`, `pdfToWord`, `ocrPage`, `removeWatermark`. `ToolPage` awaits worker RPC; UI stays 60fps; real progress via `postMessage`.
- **PageThumbStrip component** — renders pdf.js thumbnails w/ virtualization for large PDFs.
- **OverlayPlacer** — drag/resize/rotate handles on top of page thumbnail (react-moveable OR custom pointer events).
- Wire OverlayPlacer into **E-Sign, Watermark, Edit PDF, Remove Watermark** (region-select mode).
- **Result Preview** — after every job, render output pdf.js thumbnails inline before download; download button + "Send to another tool" quick action.
- **Smooth scroll** — add Lenis (from PDF Blender inspiration) globally with `prefers-reduced-motion` guard.

## Phase 4 — New tools + missing category tools (items 12, 13, rest of 10)

New tools registered in `tools.ts` and routed:
- **OCR PDF** — tesseract.js in-browser (fully private, WASM), language picker, searchable-PDF output via pdf-lib text layer.
- **PDF Editor** (full) — pdf.js render + fabric.js overlay for text/shape/image/highlight, page reorder, save via pdf-lib.
- **Redact PDF** — draw black boxes, flatten.
- **Crop PDF**, **Rotate PDF** (per-page), **Extract Pages**, **Delete Pages**, **Reorder Pages**, **N-up (2/4 per sheet)**, **PDF to JPG**, **PDF to PNG**, **Excel↔PDF**, **PPT↔PDF (import only via docx-like path)**, **HTML→PDF**, **Number Pages**, **Add Header/Footer**, **Compare PDFs (diff)**, **Repair PDF**, **Grayscale PDF**, **Unlock PDF**.
- Category buckets on `/tools` re-balanced: Conversion, Editing, Organization, Security, Signing, OCR.

## Phase 5 — Content: guides, blogs, programmatic pages (items 9, 16)

- **Guides** — replace dummy `GUIDES` in `Home.tsx` with 12 real guides in `src/content/guides/`, each with hero image (generated), step screenshots, linked tool CTA, JSON-LD HowTo.
- **Blog posts** — pipeline:
  - 5 hand-crafted flagship posts for top 6 tools (Compress, Merge, PDF↔Word, Sign, Watermark, OCR) = 30 posts, ~1200 words each.
  - Templated but real content for remaining ~19 tools × 5 = ~95 posts (~700 words each), generated from a per-tool JSON spec so every post has unique intro/steps/FAQ/comparison.
  - 8 workflow deep-dive posts.
  - All posts link to parent tool + 3 related tools + 1 programmatic page (per existing `ContentAsset` shape).
- **Programmatic pages** — extend `programmatic.ts` with per-tool intent pages (e.g., `/ocr-scanned-pdf`, `/edit-pdf-online`, `/redact-pdf-free`); each links back to its parent tool + workflow.
- **Sitemap.xml + llms.txt** regenerated.

---

## Technical section

**No-regression guardrails**
- Each phase gated by: `bun run build` clean, `tsgo` clean, manual Playwright pass on `/`, `/tools`, `/workflows`, one tool run, `/blog`.
- Feature flags in `src/lib/featureFlags.ts` for the big new surfaces (`pdfEditorV2`, `ocr`, `workerOffload`) so half-shipped work never breaks prod.
- Every new tool registered in `tools.ts` but hidden until its handler + preview both pass smoke test.

**New deps** (installed once, Phase 3): `comlink`, `tesseract.js`, `fabric`, `lenis`, `react-moveable`.

**New files**
```text
src/workers/pdfWorker.ts
src/lib/featureFlags.ts
src/lib/ocr.ts
src/lib/pdfEditor.ts
src/components/tools/PageThumbStrip.tsx
src/components/tools/OverlayPlacer.tsx
src/components/tools/ResultPreview.tsx
src/components/tools/PdfEditorCanvas.tsx
src/components/layout/Footer.tsx           (rewrite)
src/components/ui/ThemeProvider.tsx
src/pages/Terms.tsx
src/pages/Dpa.tsx
src/pages/Security.tsx
src/pages/Contact.tsx
src/pages/Cookies.tsx
src/pages/tools/OcrPdf.tsx
src/pages/tools/PdfEditor.tsx
src/content/guides/*.ts                    (12 real guides)
src/content/blog/*.ts                      (~130 posts across files)
```

**Files rewritten**
- `src/App.tsx` (routes)
- `src/index.css` + `tailwind.config.ts` (dark tokens)
- `src/components/layout/Navbar.tsx`
- `src/pages/Home.tsx` (remove Popular Workflows, add How-it-works, product/use-case links)
- `src/pages/UseCases.tsx`
- `src/pages/workflows/Workflows.tsx`
- `src/lib/tools.ts` (new tools, no time strings)
- `src/pages/tools/ToolPage.tsx` (worker RPC, preview, editor mounts)

**Estimated LOC:** ~8–10k added, ~1k removed. Content files dominate.

---

## Sequence

1. Approve this plan → I ship Phase 1 (safest, immediate visible upgrade) and pause.
2. You paste PDF Blender files after Phase 1.
3. Phases 2–5 ship sequentially with a preview check between each.

Say "go" to start Phase 1.
