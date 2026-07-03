## Goal

Remove the "Popular workflows" section from Home and move it into a dedicated Workflows experience: a preset list, a runnable chain for each preset, and a custom workflow builder that pipes one tool's output into the next through a single upload.

## Changes

### 1. Home cleanup
- `src/pages/Home.tsx`: delete the "POPULAR WORKFLOWS" section (lines ~168–215) and the `WORKFLOWS` constant (lines 57–88). Leave a small nav link/CTA in the Home flow pointing to `/workflows`.

### 2. Shared workflow data
- New `src/lib/workflows.ts` exporting:
  - `Workflow` type: `{ id, name, audience, description, steps: WorkflowStep[], accent }`
  - `WorkflowStep`: `{ kind: ToolKind, label, config? }` where `config` holds tool-specific params (compression level, watermark text, rotation, page range, password, etc.)
  - `PRESET_WORKFLOWS`: the existing 3 (Resume, Business contract, Student assignment) plus a few more:
    - "Scan to searchable archive" — Photo to PDF → Compress → Protect
    - "Legal delivery pack" — Merge → Watermark → Protect
    - "Web publishing" — Compress → Watermark → Export (rename)
  - `CHAINABLE_KINDS`: subset of `ToolKind` safe for chaining (input is a single PDF, output is a single PDF). Excludes multi-file-only tools like `merge` and `photo-to-pdf` from being placed mid-chain; those are allowed only as the first step.

### 3. Routes
- `src/App.tsx`: add these BEFORE the `/:slug` catch-all so they resolve correctly:
  - `/workflows` → `Workflows` (index/list)
  - `/workflows/custom` → `CustomWorkflowBuilder`
  - `/workflows/run/:id` → `WorkflowRunner` (preset)
  - `/workflows/run/custom` → `WorkflowRunner` (reads steps from `location.state`)

### 4. Workflows index page
- `src/pages/workflows/Workflows.tsx`
  - Hero: same eyebrow/title/subtitle as the removed Home section.
  - Grid of preset cards from `PRESET_WORKFLOWS` (same visual as today).
  - Each card shows the step chips and a primary "Run workflow" button that navigates to `/workflows/run/:id`. Secondary "Open first tool" link keeps the current behavior for users who only want one step.
  - Prominent "Build a custom workflow" card at the top of the grid → `/workflows/custom`.

### 5. Custom workflow builder
- `src/pages/workflows/CustomWorkflowBuilder.tsx`
  - Step A — pick tools: browse tool catalog (from `src/lib/tools.ts`), click to append to an ordered list. Reorder (up/down) and remove chips.
  - Rule: the first step defines the input contract (PDF, image, or Word). Subsequent steps must be `CHAINABLE_KINDS`; UI disables non-chainable options after step 1.
  - Step B — per-step config: inline expand for steps that need params (compress level + quality, rotate degrees, remove/split range, protect password, watermark text, sign text, add-pages count, export filename).
  - "Run workflow" navigates to `/workflows/run/custom` with `{ name: "Custom workflow", steps }` in router state.

### 6. Workflow runner (shared)
- `src/pages/workflows/WorkflowRunner.tsx`
  - Resolves the workflow: preset by `id`, or custom from `location.state`.
  - Header shows the ordered step chips with a live status per step (queued / running / done / error).
  - Single unified upload zone using `PdfDropzone`, accept-type derived from the FIRST step (PDF for most, images for photo-to-pdf, Word for word-to-pdf). Multi-file only when step 1 is `merge` or `photo-to-pdf`.
  - "Run" button executes steps sequentially:
    - Step 1 receives the uploaded `File[]`.
    - Each subsequent step receives the previous step's result blob wrapped as a `File` (PDF).
    - Each step calls the matching function from `src/lib/pdf.ts` (`mergePdfs`, `compressPdf`, `protectPdf`, `watermarkPdf`, `signPdf`, `removeWatermarkPdf`, `rotatePdf`, `removePages`, `reorderPdf`, `addBlankPages`, `exportPdf`, `imageToPdf`, `pdfToWord`, `wordToPdf`, `editPdfPassthrough`) with the step's stored config.
  - Progress bar across all steps (progress = completed / total, with per-step spinner).
  - Result panel identical to the current tool success card: filename, size, Download, Restart. If the final output is not a PDF (e.g. ends with `pdf-to-word`), download offers `.docx`.
  - Errors: stop the chain, mark the failing step red, keep the last good intermediate downloadable.

### 7. Home CTA
- In `src/pages/Home.tsx`, replace the removed section with a slim single-row CTA: "Workflows: chain tools end-to-end →" linking to `/workflows`. Keeps the page rhythm without duplicating the grid.

### 8. Nav
- `src/components/layout/Navbar.tsx`: add a "Workflows" link between Tools and Guides (verify existing nav structure and match its styling).

## Technical notes
- No new dependencies. All chaining uses the existing browser-only functions in `src/lib/pdf.ts`.
- Reuses `UploadContext`, `PdfDropzone`, `usePdfJob` patterns; runner uses its own local sequential runner (since `usePdfJob` handles a single job — a thin `useWorkflowRunner` hook in the runner file wraps it per step).
- Enforces the existing 50MB per-file cap already added in ToolPage — factored into a small helper `src/lib/uploadLimits.ts` so both places share it.
- Route order matters: register `/workflows*` before `/:slug` catch-all.

## Out of scope
- Saving custom workflows across sessions (would need Lovable Cloud). Custom workflows live in router state for now; can be added later.
- OCR, cloud queues, or server-side chaining. Everything stays in-browser.
