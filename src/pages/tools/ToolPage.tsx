// src/pages/tools/ToolPage.tsx
import { useEffect, useMemo, useState } from "react";

import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  RotateCcw,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTool } from "@/lib/tools";
import { useUpload } from "@/context/UploadContext";
import { PdfDropzone } from "@/components/PdfDropzone";
import { UnifiedFileList } from "@/components/UnifiedFileList";
import { SignatureEditor } from "@/components/tools/SignatureEditor";
import { PagePicker } from "@/components/tools/PagePicker";
import { PdfVisualPlacer, type PlacementValue } from "@/components/tools/PdfVisualPlacer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { usePdfJob } from "@/hooks/usePdfJob";
import { capMbFor, capBytesFor } from "@/lib/uploadLimits";
import { PasswordStrength } from "@/components/tools/PasswordStrength";
import {
  mergePdfs,
  splitPdf, rotatePdf, removePages, compressPdf, protectPdf,
  imageToPdf, watermarkPdf, removeWatermarkPdf, reorderPdf,
  addPagesToPdf, exportPdf, signPdf, pdfToWord, wordToPdf, editPdfWithAnnotations,
  downloadBlob, formatBytes,
} from "@/lib/pdf";


const ToolPage = ({ toolSlug, hideHeader, overrideTitle, overrideDescription }: { toolSlug?: string, hideHeader?: boolean, overrideTitle?: string, overrideDescription?: string }) => {
  const { slug: routeSlug = "" } = useParams();
  const slug = toolSlug || routeSlug;
  const tool = getTool(slug);
  const { files, addFiles, clearFiles, setError: setUploadError, error: uploadError } = useUpload();
  const MAX_UPLOAD_MB = capMbFor(tool?.kind);
  const MAX_UPLOAD_BYTES = capBytesFor(tool?.kind);
  const [range, setRange] = useState("");
  const [password, setPassword] = useState("");
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [rotateMode, setRotateMode] = useState<"all" | "per-page">("all");
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [docPageCount, setDocPageCount] = useState<number | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<"light" | "medium" | "strong" | "custom">(
    "medium"
  );
  const [customQuality, setCustomQuality] = useState(80);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkColor, setWatermarkColor] = useState("#b21818");
  const [watermarkOpacity, setWatermarkOpacity] = useState(25);
  const [watermarkSize, setWatermarkSize] = useState(72);
  const [watermarkRotation, setWatermarkRotation] = useState(45);
  const [watermarkTile, setWatermarkTile] = useState(false);
  const [signatureImg, setSignatureImg] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [addMode, setAddMode] = useState<"blank" | "import">("blank");
  const [addCount, setAddCount] = useState(1);
  const [insertAfterPage, setInsertAfterPage] = useState<number | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPages, setImportPages] = useState<number[]>([]);
  const [exportName, setExportName] = useState("");
  const [removeWatermarkText, setRemoveWatermarkText] = useState("CONFIDENTIAL, DRAFT, COPY, SAMPLE, SPECIMEN, WATERMARK");
  const [pickerPages, setPickerPages] = useState<number[]>([]);
  const [showAdvancedRange, setShowAdvancedRange] = useState(false);
  const [placement, setPlacement] = useState<PlacementValue>({ page: 1, x: 0.5, y: 0.5 });

  const { progress, state, result, error: jobError, run: runJob, cancel: cancelJob, reset: resetJob, setProgress } = usePdfJob();

  // Clear stale uploads and settings when navigating to a new tool.
  useEffect(() => {
    clearFiles();
    resetJob();
    setUploadError(null);
    setRange("");
    setPickerPages([]);
    setDocPageCount(null);
    setRotateMode("all");
    setPageRotations({});
    setShowAdvancedRange(false);
    setPassword("");
    setSignatureImg(null);
    setEditText("");
    setAddMode("blank");
    setAddCount(1);
    setInsertAfterPage(null);
    setImportFile(null);
    setImportPages([]);
    setExportName("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const rawFiles = useMemo(() => files.map((f) => f.file), [files]);
  const primaryFileKey = rawFiles[0]
    ? `${rawFiles[0].name}:${rawFiles[0].size}:${rawFiles[0].lastModified}`
    : "";

  // Reset per-document UI state whenever the primary file changes or is cleared.
  useEffect(() => {
    setDocPageCount(null);
    setPageRotations({});
    setPickerPages([]);
    setRange("");
    setInsertAfterPage(null);
    setImportFile(null);
    setImportPages([]);
    setPlacement({ page: 1, x: 0.5, y: 0.5 });
    if (tool?.kind === "export") {
      const f = rawFiles[0];
      setExportName(f ? f.name.replace(/\.pdf$/i, "") : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryFileKey]);

  const needsWatermarkText = tool?.kind === "watermark";
  const needsSignature = tool?.kind === "sign" || tool?.kind === "e-sign";
  const needsAddCount = tool?.kind === "addpages";
  const needsExportName = tool?.kind === "export";
  const needsReorderInput = tool?.kind === "reorder";
  const usesPagePicker = tool?.kind === "split" || tool?.kind === "remove" || tool?.kind === "reorder";
  const needsEditText = tool?.kind === "edit";
  const isMergeTool = tool?.kind === "merge";
  const isPhotoTool = tool?.kind === "photo-to-pdf";
  const useSortableList = isMergeTool || isPhotoTool;

  const hasPerPageRotation = useMemo(
    () => Object.values(pageRotations).some((deg) => ((deg % 360) + 360) % 360 !== 0),
    [pageRotations]
  );

  const canRun = useMemo(() => {
    if (!tool || files.length === 0) return false;
    if (isMergeTool && files.length < 2) return false;
    if (usesPagePicker) {
      if (showAdvancedRange) {
        if (!range.trim()) return false;
      } else {
        if (pickerPages.length === 0) return false;
        if (tool.kind === "remove" && docPageCount !== null && pickerPages.length >= docPageCount) {
          return false;
        }
      }
    } else {
      if (tool.needsRange && !range.trim()) return false;
      if (needsReorderInput && !range.trim()) return false;
    }
    if (tool.needsRotation && rotateMode === "per-page" && !hasPerPageRotation) return false;
    if (tool.needsPassword && password.length < 4) return false;
    if (needsWatermarkText && !watermarkText.trim()) return false;
    if (needsSignature && !signatureImg) return false;
    if (needsAddCount) {
      if (addMode === "blank" && (!addCount || addCount < 1)) return false;
      if (addMode === "import" && (!importFile || importPages.length === 0)) return false;
    }
    if (needsEditText && !editText.trim()) return false;
    return true;
  }, [tool, files, range, password, isMergeTool, needsReorderInput, needsWatermarkText, watermarkText, needsSignature, signatureImg, needsAddCount, addMode, addCount, importFile, importPages, needsEditText, editText, usesPagePicker, showAdvancedRange, pickerPages, docPageCount, rotateMode, hasPerPageRotation]);

  const reset = () => {
    clearFiles();
    resetJob();
    setCompressionLevel("medium");
    setCustomQuality(80);
    setSignatureImg(null);
    setEditText("");
    setDocPageCount(null);
    setPageRotations({});
    setPickerPages([]);
    setInsertAfterPage(null);
    setImportFile(null);
    setImportPages([]);
    setExportName("");
  };

  const hexToRgb = (hex: string) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return { r: 0.7, g: 0.1, b: 0.1 };
    return { r: parseInt(m[1], 16) / 255, g: parseInt(m[2], 16) / 255, b: parseInt(m[3], 16) / 255 };
  };


  const pagesToRangeString = (pages: number[]) => {
    if (pages.length === 0) return "";
    if (tool?.kind === "reorder") return pages.join(",");
    const sorted = [...pages].sort((a, b) => a - b);
    const parts: string[] = [];
    let start = sorted[0];
    let prev = sorted[0];
    for (let i = 1; i <= sorted.length; i++) {
      const cur = sorted[i];
      if (cur === prev + 1) {
        prev = cur;
        continue;
      }
      parts.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = cur;
      prev = cur;
    }
    return parts.join(",");
  };

  const effectiveRange = useMemo(() => {
    if (usesPagePicker && !showAdvancedRange) {
      if (tool?.kind === "remove") {
        // pickerPages = pages to KEEP; derive removed pages from true document page count.
        const total = docPageCount ?? (pickerPages.length > 0 ? Math.max(...pickerPages) : 0);
        if (total <= 0) return "";
        const removed = Array.from({ length: total }, (_, i) => i + 1).filter((p) => !pickerPages.includes(p));
        return pagesToRangeString(removed);
      }
      return pagesToRangeString(pickerPages);
    }
    return range;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usesPagePicker, showAdvancedRange, pickerPages, docPageCount, range, tool?.kind]);

  const allRotationsMap = useMemo(() => {
    if (!docPageCount) return undefined;
    const map: Record<number, number> = {};
    for (let i = 1; i <= docPageCount; i++) map[i] = rotation;
    return map;
  }, [docPageCount, rotation]);

  const runTool = async () => {
    await runJob(async ({ signal }) => {
      const f = rawFiles[0];
      switch (tool?.kind) {
        case "merge": return await mergePdfs(rawFiles, { signal });
        case "split": return await splitPdf(f, effectiveRange, { signal });
        case "rotate":
          return await rotatePdf(f, rotateMode === "per-page" ? pageRotations : rotation, { signal });
        case "remove": return await removePages(f, effectiveRange, { signal });
        case "compress":
          return await compressPdf(f, {
            level: compressionLevel,
            quality: compressionLevel === "custom" ? customQuality : undefined,
          }, (pct) => setProgress(Math.max(50, Math.min(99, pct))));
        case "protect": return await protectPdf(f, password, { signal });
        case "watermark": return await watermarkPdf(f, {
          text: watermarkText,
          color: hexToRgb(watermarkColor),
          opacity: watermarkOpacity / 100,
          fontSize: watermarkSize,
          rotation: watermarkRotation,
          tile: watermarkTile,
          x: placement.x,
          y: placement.y,
        });
        case "removewatermark": {
          const phrases = removeWatermarkText.split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean);
          return await removeWatermarkPdf(f, phrases.length > 0 ? phrases : undefined);
        }
        case "reorder": return await reorderPdf(f, effectiveRange, { signal });
        case "addpages":
          return await addPagesToPdf(f, {
            mode: addMode,
            blankCount: addCount,
            insertAfterPage: insertAfterPage ?? undefined,
            importFile: importFile ?? undefined,
            importPages: importPages.length > 0 ? importPages : undefined,
            signal,
          });
        case "export": return await exportPdf(f, exportName, { signal });
        case "sign":
        case "e-sign": return await signPdf(f, {
          imageDataUrl: signatureImg ?? undefined,
          x: placement.x,
          y: placement.y,
          page: placement.page,
        });
        case "pdf-to-word": return await pdfToWord(f);
        case "word-to-pdf": return await wordToPdf(f);
        case "photo-to-pdf": return await imageToPdf(rawFiles);
        case "edit":
          return await editPdfWithAnnotations(f, [{
            page: placement.page, kind: "text", text: editText, x: placement.x, y: placement.y, size: 16,
          }]);
        default: throw new Error("Unsupported tool");
      }
    });
  };


  if (!tool) {
    return (
      <div className="container-px mx-auto max-w-2xl py-24 text-center">
        <h1 className="font-serif text-4xl">Tool not found</h1>
        <Link to="/tools" className="mt-6 inline-block text-primary">
          Browse all tools →
        </Link>
      </div>
    );
  }

  const Icon = tool.icon;

  return (
    <div className={cn("mx-auto max-w-3xl", !hideHeader && "container-px py-12 md:py-16")}>
      {!hideHeader && (
        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="size-4" /> All tools
        </Link>
      )}

      <div className="flex items-start gap-4">
        <div
          className={cn(
            "grid place-items-center size-12 rounded-xl shrink-0",
            tool.accent === "blue" ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent"
          )}
        >
          <Icon className="size-6" strokeWidth={1.8} />
        </div>

        <div>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight text-balance">{overrideTitle || tool.title}</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">{overrideDescription || tool.description}</p>
        </div>
      </div>

      <div className="mt-10 rounded-3xl border bg-card p-6 sm:p-8 shadow-soft">
        <AnimatePresence mode="wait">
          {(state === "idle" || state === "error" || state === "cancelled") && (
            <motion.div key="idle" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <PdfDropzone
                files={files.map(f => f.file)}
                onChange={(newFiles) => {
                  // Enforce 50MB per-file cap across all tools.
                  const oversized = newFiles.filter(f => f.size > MAX_UPLOAD_BYTES);
                  const accepted = newFiles.filter(f => f.size <= MAX_UPLOAD_BYTES);
                  if (oversized.length > 0) {
                    setUploadError(`${oversized[0].name} is over ${MAX_UPLOAD_MB}MB. Split or compress it first.`);
                  } else {
                    setUploadError(null);
                  }
                  if (accepted.length === 0) return;
                  if (!tool.multiple) {
                    clearFiles();
                    addFiles([accepted[0]]);
                  } else {
                    const existing = new Set(files.map(f => `${f.file.name}:${f.file.size}:${f.file.lastModified}`));
                    const toAdd = accepted.filter(f => !existing.has(`${f.name}:${f.size}:${f.lastModified}`));
                    if (toAdd.length > 0) addFiles(toAdd);
                  }
                }}
                accept={tool.accept}
                multiple={tool.multiple}
                showFileList={!isMergeTool}
              />

              {uploadError && (
                <div className="mt-4 flex gap-3 rounded-xl border border-accent/30 bg-accent-soft p-3">
                  <AlertCircle className="size-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-sm text-accent">{uploadError}</p>
                </div>
              )}

              {useSortableList && files.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-medium text-lg">
                      {isMergeTool ? "Arrange PDF Order" : "Arrange Image Order"}
                    </h2>
                    <p className="text-sm text-muted-foreground">Drag to reorder · top → bottom</p>
                  </div>
                  <UnifiedFileList />
                </div>
              )}

              {/* Step 3 — Required inputs (P2 workflow) */}
              {files.length > 0 && (
                tool.needsRange || tool.needsPassword || tool.needsRotation ||
                tool.kind === "compress" || needsWatermarkText || needsSignature ||
                needsAddCount || needsExportName || needsReorderInput || needsEditText ||
                tool.kind === "removewatermark"
              ) && (
                <div className="mt-6 rounded-2xl border bg-background p-5 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-medium">Settings</h3>
                    <span className="text-xs text-muted-foreground">Step 3 of 4</span>
                  </div>

                  {tool.kind === "removewatermark" && (
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Watermark phrases to strip</label>
                      <textarea
                        value={removeWatermarkText}
                        onChange={(e) => setRemoveWatermarkText(e.target.value)}
                        rows={2}
                        placeholder="CONFIDENTIAL, DRAFT, COPY"
                        className="w-full rounded-lg border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
                      />
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Comma-separated. Any text overlay containing one of these phrases (case-insensitive) is covered in white. Annotation and XObject watermarks are always stripped.
                      </p>
                    </div>
                  )}


                  {tool.needsPassword && (
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Password (min 4 chars)</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Choose a strong password"
                        className="w-full rounded-lg border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                      />
                      <PasswordStrength password={password} onUseSuggestion={setPassword} />
                    </div>
                  )}

                  {(tool.needsRange || needsReorderInput) && (
                    <div>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <label className="text-sm font-medium">
                          {needsReorderInput ? "Reorder pages" : tool.kind === "remove" ? "Choose pages to keep" : "Choose pages to include"}
                        </label>
                        {usesPagePicker && (
                          <button
                            type="button"
                            onClick={() => setShowAdvancedRange((v) => !v)}
                            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                          >
                            {showAdvancedRange ? "Use page picker" : "Advanced: type a range"}
                          </button>
                        )}
                      </div>

                      {usesPagePicker && !showAdvancedRange ? (
                        <>
                          <PagePicker
                            file={rawFiles[0]}
                            mode={needsReorderInput ? "reorder" : "select"}
                            value={pickerPages}
                            onChange={setPickerPages}
                            onMetaChange={({ numPages }) => setDocPageCount(numPages)}
                          />
                          {tool.kind === "remove" && docPageCount !== null && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              {pickerPages.length === docPageCount
                                ? "Click at least one page thumbnail above to mark it for removal."
                                : pickerPages.length === 0
                                ? "Keep at least one page in the document."
                                : `${docPageCount - pickerPages.length} ${docPageCount - pickerPages.length === 1 ? "page" : "pages"} marked for removal (${pickerPages.length} kept).`}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                            placeholder={needsReorderInput ? "e.g. 3,1,2,4" : "e.g. 1-3, 5, 7-9"}
                            className="w-full rounded-lg border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                          />
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            {needsReorderInput
                              ? "List page numbers in the order you want them."
                              : "Use commas to separate, dashes for ranges."}
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {tool.needsRotation && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-sm font-medium">Rotation</label>
                        <div className="inline-flex rounded-lg border p-0.5 text-xs">
                          <button
                            type="button"
                            onClick={() => setRotateMode("all")}
                            className={cn(
                              "rounded-md px-2.5 py-1 font-medium transition",
                              rotateMode === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            All pages
                          </button>
                          <button
                            type="button"
                            onClick={() => setRotateMode("per-page")}
                            className={cn(
                              "rounded-md px-2.5 py-1 font-medium transition",
                              rotateMode === "per-page" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            Per page
                          </button>
                        </div>
                      </div>

                      {rotateMode === "all" ? (
                        <div className="flex gap-2">
                          {[90, 180, 270].map((deg) => (
                            <button
                              key={deg}
                              type="button"
                              onClick={() => setRotation(deg as 90 | 180 | 270)}
                              className={cn(
                                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition",
                                rotation === deg ? "border-primary bg-primary-soft text-primary" : "hover:bg-secondary"
                              )}
                            >
                              {deg}°
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Click any page thumbnail to rotate it by +90°.</span>
                          {hasPerPageRotation && (
                            <button
                              type="button"
                              onClick={() => setPageRotations({})}
                              className="underline underline-offset-2 hover:text-foreground"
                            >
                              Reset all
                            </button>
                          )}
                        </div>
                      )}

                      <PagePicker
                        file={rawFiles[0]}
                        mode={rotateMode === "per-page" ? "rotate" : "preview"}
                        rotations={rotateMode === "per-page" ? pageRotations : allRotationsMap}
                        onRotate={
                          rotateMode === "per-page"
                            ? (page, deg) => setPageRotations((prev) => ({ ...prev, [page]: deg }))
                            : undefined
                        }
                        onMetaChange={({ numPages }) => setDocPageCount(numPages)}
                      />
                    </div>
                  )}

                  {tool.kind === "compress" && (
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Compression level</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(["light", "medium", "strong", "custom"] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setCompressionLevel(lvl)}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-sm font-medium capitalize transition",
                              compressionLevel === lvl ? "border-primary bg-primary-soft text-primary" : "hover:bg-secondary"
                            )}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                      {compressionLevel === "custom" ? (
                        <div className="mt-3">
                          <div className="flex items-baseline justify-between">
                            <label className="text-xs text-muted-foreground">Quality</label>
                            <span className="text-xs font-medium">{customQuality}%</span>
                          </div>
                          <input
                            type="range"
                            min={20}
                            max={100}
                            step={5}
                            value={customQuality}
                            onChange={(e) => setCustomQuality(parseInt(e.target.value, 10))}
                            className="w-full mt-1 accent-primary"
                          />
                          <p className="mt-1 text-xs text-muted-foreground">Lower quality = smaller file. 75% is a good middle ground.</p>
                        </div>
                      ) : (
                        <p className="mt-1.5 text-xs text-muted-foreground">Stronger = smaller file, lower image quality.</p>
                      )}
                    </div>
                  )}


                  {needsWatermarkText && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-1.5">Watermark text</label>
                        <input
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder="CONFIDENTIAL"
                          className="w-full rounded-lg border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Color</label>
                          <input type="color" value={watermarkColor} onChange={(e) => setWatermarkColor(e.target.value)}
                            className="h-10 w-full rounded-lg border cursor-pointer" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Rotation ({watermarkRotation}°)</label>
                          <input type="range" min={-90} max={90} step={5} value={watermarkRotation}
                            onChange={(e) => setWatermarkRotation(parseInt(e.target.value, 10))}
                            className="w-full accent-primary" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Opacity ({watermarkOpacity}%)</label>
                          <input type="range" min={5} max={100} step={5} value={watermarkOpacity}
                            onChange={(e) => setWatermarkOpacity(parseInt(e.target.value, 10))}
                            className="w-full accent-primary" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Size ({watermarkSize}pt)</label>
                          <input type="range" min={12} max={200} step={4} value={watermarkSize}
                            onChange={(e) => setWatermarkSize(parseInt(e.target.value, 10))}
                            className="w-full accent-primary" />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={watermarkTile}
                          onChange={(e) => setWatermarkTile(e.target.checked)} />
                        Tile across every page (repeat pattern)
                      </label>
                      {!watermarkTile && (
                        <div>
                          <label className="text-xs font-medium block mb-2">Visual placement preview</label>
                          <PdfVisualPlacer
                            file={rawFiles[0]}
                            mode="watermark"
                            value={{ ...placement, text: watermarkText }}
                            onChange={setPlacement}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {needsSignature && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">Your signature</label>
                        <SignatureEditor onChange={setSignatureImg} />
                      </div>
                      {signatureImg && (
                        <div>
                          <label className="text-xs font-medium block mb-2">Visual placement on page</label>
                          <PdfVisualPlacer
                            file={rawFiles[0]}
                            mode="esign"
                            value={{ ...placement, imageDataUrl: signatureImg }}
                            onChange={setPlacement}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {needsEditText && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-1.5">Text to add</label>
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          placeholder="Type text to overlay on PDF"
                          className="w-full rounded-lg border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium block mb-2">Visual placement on page</label>
                        <PdfVisualPlacer
                          file={rawFiles[0]}
                          mode="edit"
                          value={{ ...placement, text: editText }}
                          onChange={setPlacement}
                        />
                      </div>
                    </div>
                  )}

                  {needsAddCount && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-sm font-medium">Pages to insert</label>
                        <div className="inline-flex rounded-lg border p-0.5 text-xs">
                          <button
                            type="button"
                            onClick={() => setAddMode("blank")}
                            className={cn(
                              "rounded-md px-2.5 py-1 font-medium transition",
                              addMode === "blank" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            Blank pages
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddMode("import")}
                            className={cn(
                              "rounded-md px-2.5 py-1 font-medium transition",
                              addMode === "import" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            From another PDF
                          </button>
                        </div>
                      </div>

                      {addMode === "blank" ? (
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Number of blank pages</label>
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={addCount}
                            onChange={(e) => setAddCount(parseInt(e.target.value || "1", 10))}
                            className="w-full rounded-lg border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">Second PDF to copy pages from</label>
                            <input
                              type="file"
                              accept="application/pdf,.pdf"
                              onChange={(e) => {
                                const next = e.target.files?.[0] ?? null;
                                setImportFile(next);
                                setImportPages([]);
                              }}
                              className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-medium hover:file:bg-secondary/80"
                            />
                          </div>
                          {importFile && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Pick pages to import from {importFile.name}:</p>
                              <PagePicker
                                file={importFile}
                                mode="select"
                                value={importPages}
                                onChange={setImportPages}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Insert position</label>
                        <select
                          value={insertAfterPage ?? (docPageCount ?? "")}
                          onChange={(e) => setInsertAfterPage(e.target.value === "" ? null : parseInt(e.target.value, 10))}
                          className="w-full rounded-lg border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                        >
                          <option value={0}>Before page 1 (as cover page)</option>
                          {docPageCount !== null &&
                            Array.from({ length: Math.max(0, docPageCount - 1) }, (_, idx) => idx + 1).map((pg) => (
                              <option key={pg} value={pg}>
                                After page {pg}
                              </option>
                            ))}
                          <option value={docPageCount ?? ""}>
                            At the end{docPageCount ? ` (after page ${docPageCount})` : ""}
                          </option>
                        </select>
                      </div>

                      <PagePicker
                        file={rawFiles[0]}
                        mode="preview"
                        onMetaChange={({ numPages }) => setDocPageCount(numPages)}
                      />
                    </div>
                  )}

                  {needsExportName && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-1.5">New filename</label>
                        <input
                          type="text"
                          value={exportName}
                          onChange={(e) => setExportName(e.target.value)}
                          placeholder="my-final-document"
                          className="w-full rounded-lg border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                        />
                        <p className="mt-1.5 text-xs text-muted-foreground">We'll add .pdf if you don't.</p>
                      </div>
                      <PagePicker
                        file={rawFiles[0]}
                        mode="preview"
                        onMetaChange={({ numPages }) => setDocPageCount(numPages)}
                      />
                    </div>
                  )}
                </div>
              )}



              {state === "error" && jobError && (
                <div className="mt-5 flex gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4">
                  <AlertCircle className="size-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-accent">Couldn't process this file</p>
                    <p className="text-sm text-foreground/80 mt-0.5">{jobError}</p>
                  </div>
                </div>
              )}


              {state === "cancelled" && (
                <div className="mt-5 flex gap-3 rounded-xl border border-border bg-secondary/60 p-4">
                  <AlertCircle className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Processing cancelled</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Your original file is untouched. Adjust settings or run again whenever ready.</p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  onClick={runTool}
                  disabled={!canRun}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {tool.title} now <ChevronRight className="size-4 ml-1" />
                </Button>

                {files.length > 0 && (
                  <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground">
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {(state === "uploading" || state === "processing" || state === "cancelling") && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center"
            >
              <Loader2 className="mx-auto size-10 text-primary animate-spin" />
              <p className="mt-4 font-medium">
                {state === "cancelling"
                  ? "Cancelling after current step…"
                  : state === "uploading"
                  ? "Reading your file…"
                  : "Processing in your browser…"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">All processing stays on your device.</p>
              <Progress value={progress} className="mt-6 max-w-sm mx-auto" />
              <div className="mt-5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={cancelJob}
                  disabled={state === "cancelling"}
                >
                  {state === "cancelling" ? "Stopping…" : "Cancel"}
                </Button>
              </div>
            </motion.div>
          )}

          {state === "success" && result && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <div className="mx-auto grid place-items-center size-14 rounded-full bg-primary-soft text-primary">
                <CheckCircle2 className="size-7" />
              </div>

              <h2 className="mt-4 font-serif text-2xl">Your file is ready</h2>
              <p className="text-sm text-muted-foreground mt-1">{result.filename} · {formatBytes(result.blob.size)}</p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  size="lg"
                  onClick={() => downloadBlob(result.blob, result.filename)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Download className="size-4 mr-1.5" /> Download
                </Button>
                <Button size="lg" variant="outline" onClick={reset}>
                  <RotateCcw className="size-4 mr-1.5" /> Process another
                </Button>
              </div>

              {tool.relatedSlugs?.length > 0 && (
                <div className="mt-10 text-left border-t pt-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground text-center">
                    Suggested next
                  </p>
                  <div className="mt-4 grid sm:grid-cols-3 gap-3">
                    {tool.relatedSlugs.slice(0, 3).map((slug) => {
                      const related = getTool(slug);
                      if (!related) return null;
                      const RIcon = related.icon;
                      return (
                        <Link
                          key={slug}
                          to={`/${slug}`}
                          className="group flex items-start gap-3 rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-soft transition-all text-left"
                        >
                          <div className={cn(
                            "grid place-items-center size-9 rounded-lg shrink-0",
                            related.accent === "blue" ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent"
                          )}>
                            <RIcon className="size-4" strokeWidth={1.8} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{related.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{related.short}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ToolPage;
