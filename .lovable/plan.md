## Fixes and upgrades across all PDF tools

### 1. Cross-tool bugs (shared)

**Stale upload between tools** — UploadProvider persists file state across route changes, so opening a second tool shows the prior file. Fix: clear the upload store on tool route change in `ToolPage.tsx` (`useEffect` on `slug` calls `clearFiles()` + `resetJob()` + `setUploadError(null)`).

**pdf.js worker resolution error** ("Failed to resolve module specifier `pdfjs-dist/build/pdf.worker.min.mjs?url`") — the `/* @vite-ignore */` dynamic import bypasses Vite's URL handling in prod. Fix in `src/lib/pdf.ts`: import the worker statically:
```ts
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
```
This resolves the Compress + PDF→Word failures.

**Upload size limit** — bump `MAX_UPLOAD_MB` per-tool: 100MB for `compress`, `split`, `pdf-to-word`, `word-to-pdf`; keep 50MB elsewhere. Move the cap into `uploadLimits.ts` as a `capFor(kind)` helper and read it in both `ToolPage.tsx` and `WorkflowRunner.tsx`.

### 2. Reorder / Merge list UX

- Replace `UnifiedFileList` arrow buttons with true drag-and-drop using `@dnd-kit/sortable` (already installed). Drag handle icon on the left, keyboard-accessible, no clickable-arrow area.
- Remove the "clickable area" hint text from Merge.
- Use the same sortable list on **Photo→PDF** so users can reorder images before conversion (currently missing).

### 3. Individual tool fixes

**Compress** — after the worker fix, keep current pipeline but stream page-by-page with `requestIdleCallback` yields so the UI stays responsive; add a running "page X of N" progress via the existing `setProgress`.

**Word → PDF** ("WinAnsi cannot encode '⇒'") — Helvetica standard font is WinAnsi-only. Fix: bundle Noto Sans (or use `pdf-lib`'s `fontkit` + a bundled TTF) so Unicode glyphs like `⇒`, curly quotes, em-dash, emoji-adjacent symbols encode. Fall back: strip/replace unencodable chars with ASCII equivalents (`⇒`→`=>`, `→`→`->`, smart quotes→straight) before drawing. Ship the sanitizer as the primary fix (no new asset bytes) and keep font-embed as a follow-up if the user wants full glyph coverage.

**PDF → Word** — fixed by worker resolution fix above.

**Protect PDF** — pdf-lib genuinely can't encrypt; current implementation is a no-op. Fix: swap to `qpdf-wasm` (browser WASM build) OR `pdf-lib` fork with encryption. Recommended: use **`@cantoo/pdf-lib`** (drop-in fork with AES-128 encryption) — real password protection, browser-side. Update `protectPdf` to call `.save({ encrypt: { userPassword, ownerPassword: userPassword, permissions: {...} } })`.

**Edit PDF** — currently a passthrough. Replace with a minimal in-browser editor page: page thumbnail list (pdf.js render), click a page to open an overlay canvas where the user can add text boxes and free-draw ink annotations, then save via pdf-lib `drawText` / `drawSvgPath`. Scope: text + draw only (no image insert this pass).

**E-sign** — currently only types text. Rebuild:
- Signature source tabs: **Type**, **Draw** (canvas), **Upload** (PNG/JPG with transparent bg).
- Page thumbnail strip — click a page to open.
- Drag signature onto the page, resize with a corner handle, drag to reposition.
- Confirm → pdf-lib embeds PNG at the chosen page/x/y/w/h. Multi-signature per doc supported.

**Watermark PDF** — rebuild as visual placer:
- Type: text or image (upload sticker/PNG).
- Controls: font size, color picker, opacity slider (0–100%), rotation, tile mode (single vs. repeated across page).
- Drag onto page preview to position; "Apply to all pages" toggle; multiple watermarks per page.
- pdf-lib `drawText` / `drawImage` with `opacity` and `rotate` per placement.

**Remove Watermark** — the current implementation only strips annotations (which is why it "does nothing" for image/text stamps embedded in the page content stream). Realistic scope in-browser:
1. Parse each page's content stream with `pdf-lib`; detect and drop operators for high-transparency text (`Tj`/`TJ` after `gs` with low `CA`) and images with common watermark heuristics (repeated identical XObject on every page, low opacity, diagonal rotation).
2. Also strip form XObject overlays that appear on every page (typical for stamped watermarks).
3. UI: after upload, show detected candidates with per-item checkboxes (thumbnail + "Text: CONFIDENTIAL — 12 pages" / "Image stamp — 12 pages"), user confirms which to remove.
4. If nothing detected, show a clear message rather than silently returning the same file. Update the tool blurb to reflect the broader capability.

**Photo → PDF** — add sortable image list with thumbnails (dnd-kit) before conversion; page size + orientation + margin options.

### 4. Performance / "slow download"

- Move heavy work off the main thread using a **Web Worker** (`pdf.worker.ts` in `src/workers/`) for Compress, PDF→Word, Word→PDF. Use `Comlink` (add dep) for ergonomic RPC. Progress reported via `postMessage`.
- Stream the final blob straight to a download via `URL.createObjectURL` immediately on completion (already done) — but drop the extra `await out.save()` allocation by using `saveAsBase64: false` and `useObjectStreams: true` on every save.

### 5. Files touched

```text
src/lib/pdf.ts                        (worker import, unicode-safe fonts, encryption via @cantoo/pdf-lib, watermark detector)
src/lib/uploadLimits.ts               (per-kind cap helper)
src/pages/tools/ToolPage.tsx          (clear on route change, per-kind cap, wire editor/sign/watermark UIs)
src/components/UnifiedFileList.tsx    (dnd-kit sortable, drag handle)
src/components/PdfDropzone.tsx        (respect per-kind cap)
src/components/tools/PageThumbStrip.tsx        NEW
src/components/tools/SignaturePad.tsx          NEW  (type/draw/upload tabs)
src/components/tools/OverlayPlacer.tsx         NEW  (drag/resize/rotate on page)
src/components/tools/WatermarkStudio.tsx       NEW
src/components/tools/PdfEditor.tsx             NEW
src/workers/pdfWorker.ts                       NEW  (Comlink-exposed compress/convert)
src/pages/workflows/WorkflowRunner.tsx (per-kind cap)
package.json                          (+@cantoo/pdf-lib, +comlink; keep pdf-lib for readers)
```

### 6. Dependencies to add

- `@cantoo/pdf-lib` — AES-encryption drop-in for Protect PDF.
- `comlink` — worker RPC for compress/convert.
- (Already installed: `@dnd-kit/*`, `pdfjs-dist`, `pdf-lib`, `mammoth`, `docx`.)

### 7. Order of execution

1. **Blockers first** (shipped as one pass): worker import fix, Word→PDF sanitizer, clear-on-route-change, upload cap bump. This alone unblocks Compress, PDF→Word, Word→PDF, and the "stale file" complaint.
2. **Sortable list** (Merge + Photo→PDF) with dnd-kit.
3. **Protect** via `@cantoo/pdf-lib`.
4. **Watermark studio** + **Remove Watermark** heuristic detector.
5. **E-sign** (type/draw/upload + drag placer).
6. **Edit** (text + ink annotations).
7. **Worker offload** for perf.

Steps 1–3 are low-risk and land the fixes for the reported errors. Steps 4–7 are larger UI builds and each is a self-contained follow-up.
