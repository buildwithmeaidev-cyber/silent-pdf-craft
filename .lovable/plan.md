
# Ship Phases 2–5 in one pass

PDF Blender confirmed (`src/lib/{file-utils,merged-store,blog-posts,use-cases}.ts` + route-based UI). I'll port its clean file-flow ergonomics, smooth motion, and blog/use-case content shape into silentPDF as inspiration — no verbatim copy.

Guardrails across every phase: `bun run build` + `tsgo` clean, feature flags in `src/lib/featureFlags.ts` (`pdfEditorV2`, `ocr`, `workerOffload`) so half-shipped surfaces never break prod, each new tool hidden in `tools.ts` until its handler + preview pass a smoke test.

---

## Phase 2 — Workflows, homepage refactor, legal & use-case content

- Rewrite `src/pages/Home.tsx`: remove any residual "Popular workflows" strip, add a 4-step "How workflows work" explainer (animated), Product section with Tools / Workflows / PDF Editor / OCR links, real Guides preview pulling from new `src/content/guides/`.
- Rewrite `src/pages/workflows/Workflows.tsx` and `src/lib/workflows.ts`: add 8 curated workflows (Redact & Send, Contract Prep, Invoice Batch, Scan→OCR→Word, Presentation Cleanup, Photo Album PDF, Legal Discovery, Report Publisher) with step preview, tool chips, expected output; better spacing/grid; deep-link to each tool.
- Rewrite `src/pages/UseCases.tsx`: 6 personas (Legal, HR, Sales, Education, Finance, Freelance) each = problem → linked workflow → tools → sample outcome; inspired by PDF Blender's `use-cases.ts` shape.
- Flesh out legal pages under `src/pages/legal/` (Privacy, Security, Terms, DPA, Cookies, Contact) with real, app-specific browser-processing / Cloudflare-only / DSR / retention copy per trust-page skill. Keep already-shipped `LegalLayout.tsx`.
- Add contact form (mailto, no backend), FAQ block on Security page.

## Phase 3 — Deferred tech: worker offload, drag-to-place editors, live previews

- `src/workers/pdfWorker.ts` (Comlink) exposing `compress`, `wordToPdf`, `pdfToWord`, `ocrPage`, `removeWatermark`, `mergePdfs`, `splitPdf`. `ToolPage` and `usePdfJob` await worker RPC; real % via `postMessage`, UI stays 60fps.
- `src/components/tools/PageThumbStrip.tsx`: virtualized pdf.js thumbnails for large PDFs.
- `src/components/tools/OverlayPlacer.tsx`: drag / resize / rotate on thumbnails via `react-moveable`.
- Wire into E-Sign, Watermark, Edit PDF, Remove Watermark (region-select mode → surgical text/image strip).
- `src/components/tools/ResultPreview.tsx`: post-job inline pdf.js preview + Download + "Send to another tool" chip → workflow chaining.
- Global smooth scroll via Lenis with `prefers-reduced-motion` guard (inspired by PDF Blender feel).
- Fix Merge reorder: replace clickable up/down with true drag-and-drop (dnd-kit sortable), unified across every reorder surface (Merge, Split, PDF-to-Image, Image-to-PDF, Reorder Pages).
- Add image reorder in Image-to-PDF (missing today).

## Phase 4 — New tools + fixes

- **OCR PDF** (`src/pages/tools/OcrPdf.tsx`, `src/lib/ocr.ts`): tesseract.js in-browser WASM, language picker, outputs searchable PDF via pdf-lib text layer. Fully private.
- **PDF Editor** (`src/pages/tools/PdfEditor.tsx`, `src/lib/pdfEditor.ts`, `PdfEditorCanvas.tsx`): pdf.js render + fabric.js overlay (text, shape, image, highlight, freehand), page reorder, save via pdf-lib.
- **Remove Watermark v2**: real strip — parse content stream, remove text ops matching user-picked strings (case-insensitive, regex option) AND user-drawn image regions; fall back to overlay-white for raster. Currently returns input untouched — this is the fix.
- New tools registered in `src/lib/tools.ts` + routed: Redact, Crop, Rotate (per-page), Extract Pages, Delete Pages, Reorder Pages, N-up, PDF→JPG, PDF→PNG, Excel↔PDF, PPT→PDF, HTML→PDF, Number Pages, Header/Footer, Compare PDFs, Repair PDF, Grayscale, Unlock PDF.
- `/tools` category buckets rebalanced: Conversion, Editing, Organization, Security, Signing, OCR.

## Phase 5 — Content: guides, blog, programmatic pages

- 12 real guides in `src/content/guides/*.ts` with generated hero images, step screenshots, JSON-LD `HowTo`, linked tool CTA.
- Blog:
  - 5 flagship posts × 6 top tools (Compress, Merge, PDF↔Word, Sign, Watermark, OCR) ≈ 30 hand-crafted posts (~1200 words).
  - 10 flagship long-form posts spanning workflows + privacy explainers.
  - Fix `/blog` routing edge cases and add per-post JSON-LD `Article`.
- Extend `src/lib/programmatic.ts` with `/ocr-scanned-pdf`, `/edit-pdf-online`, `/redact-pdf-free`, `/rotate-pdf-online`, `/split-pdf-in-half`, `/pdf-to-jpg-high-quality` — each linked to parent tool + workflow.
- Regenerate `public/sitemap.xml` and `public/llms.txt`.

---

## Technical notes

- New deps (single install): `comlink`, `tesseract.js`, `fabric`, `lenis`, `react-moveable`, `@dnd-kit/core`, `@dnd-kit/sortable`.
- Bundle guard: dynamic-import the worker, tesseract, fabric on route entry only — keep initial JS < current baseline.
- `usePdfJob` gains `progress: number` sourced from worker; all `~15s / ~10s / Instant` strings already removed in Phase 1 stay gone.
- `UnifiedFileList` (existing) becomes the single source of truth for reorder — every tool re-uses it with dnd-kit, killing the divergent "clickable arrows" UX in Merge.
- Feature flags let me merge tool files even if a handler needs a follow-up; hidden tools never appear in `/tools` or sitemap.
- No backend added; still 100% browser processing.

### File plan (delta)

```text
new
  src/workers/pdfWorker.ts
  src/lib/{featureFlags,ocr,pdfEditor,smoothScroll}.ts
  src/components/tools/{PageThumbStrip,OverlayPlacer,ResultPreview,PdfEditorCanvas,DndSortable}.tsx
  src/pages/tools/{OcrPdf,PdfEditor,Redact,Crop,Rotate,ExtractPages,DeletePages,ReorderPages,Nup,PdfToJpg,PdfToPng,ExcelToPdf,PdfToExcel,PptToPdf,HtmlToPdf,NumberPages,HeaderFooter,ComparePdf,RepairPdf,Grayscale,UnlockPdf}.tsx
  src/content/guides/*.ts            (12)
  src/content/blog/flagship/*.ts     (~40)

rewrite
  src/pages/Home.tsx
  src/pages/UseCases.tsx
  src/pages/workflows/Workflows.tsx
  src/lib/workflows.ts
  src/lib/tools.ts
  src/pages/tools/ToolPage.tsx
  src/hooks/usePdfJob.ts
  src/components/UnifiedFileList.tsx
  src/pages/legal/{Privacy,Security,Terms,Dpa,Cookies,Contact}.tsx
  src/lib/programmatic.ts
  src/App.tsx (new routes)
  public/{sitemap.xml,llms.txt}
```

Estimated LOC: ~9k added, ~1k removed (content-dominant).

### Sequence inside the single build pass

1. Install deps + scaffold `featureFlags.ts` + `pdfWorker.ts` skeleton.
2. Phase 3 core (worker, dnd-kit reorder, ResultPreview, OverlayPlacer) — unblocks tool rewrites.
3. Phase 4 tools + Remove Watermark real fix.
4. Phase 2 homepage/workflows/use-cases/legal.
5. Phase 5 guides/blog/programmatic + sitemap.
6. Build + tsgo + Playwright smoke on `/`, `/tools`, `/workflows`, `/blog`, one tool run, `/dpa`.

On approval I execute all five in one continuous build pass and report back with the smoke-check results.
