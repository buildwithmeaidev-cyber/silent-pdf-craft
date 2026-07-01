// src/pages/tools/ToolPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";

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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { usePdfJob } from "@/hooks/usePdfJob";
import { useMergeProcessor } from "@/hooks/useMergeProcessor";
import { ErrorModal } from "@/components/ErrorModal";
import { mergePdfs, splitPdf, rotatePdf, removePages, compressPdf, protectPdf, downloadBlob, formatBytes } from "@/lib/pdf";

const ToolPage = () => {
  const { slug = "" } = useParams();
  const tool = getTool(slug);
  const { files, addFiles, removeFile, clearFiles, moveFile, error: contextError, setError: setContextError, clearError } = useUpload();
  const [range, setRange] = useState("");
  const [password, setPassword] = useState("");
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [compressionLevel, setCompressionLevel] = useState<"light" | "medium" | "strong" | "custom">(
    "medium"
  );

  const [customQuality, setCustomQuality] = useState(80);

  // Initialize hooks for PDF jobs and merge processing
  const { progress: pdfProgress, state: pdfState, result: pdfResult, error: pdfJobError, run: runJob, reset: resetJob, setError: setPdfJobError } = usePdfJob();
  const { progress: mergeProgress, state: mergeState, result: mergeResult, error: mergeError, runMerge, reset: resetMerge } = useMergeProcessor();

  // Determine which hook to use based on selected tool
  const isMergeTool = tool?.kind === "merge";
  const progress = isMergeTool ? mergeProgress : pdfProgress;
  const state = isMergeTool ? mergeState : pdfState;
  const result = isMergeTool ? mergeResult : pdfResult;
  const error = isMergeTool ? mergeError : pdfJobError;

  const canRun = useMemo(() => {
    if (!tool || files.length === 0) return false;
    if (isMergeTool && files.length < 2) return false;
    if (tool.needsRange && !range.trim()) return false;
    if (tool.needsPassword && password.length < 4) return false;
    return true;
  }, [tool, files, range, password, isMergeTool]);

  // moveFile is provided by context

  // removeFile is provided by context

  const reset = () => {
    clearFiles();
    resetJob();
    setCompressionLevel("medium");
    setCustomQuality(80);
  };

  const runTool = async () => {
    if (tool?.kind === "merge") {
      await runMerge(files);
    } else {
      await runJob(async () => {
        switch (tool?.kind) {
          case "split":
            return await splitPdf(files[0], range);
          case "rotate":
            return await rotatePdf(files[0], rotation);
          case "remove":
            return await removePages(files[0], range);
          case "compress":
            return await compressPdf(files[0], {
              level: compressionLevel,
              quality: compressionLevel === "custom" ? customQuality : undefined,
            });
          case "protect":
            return await protectPdf(files[0], password);
          default:
            throw new Error("Unsupported tool");
        }
      });
    }
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
    <div className="container-px mx-auto max-w-3xl py-12 md:py-16">
      <Link
        to="/tools"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-4" /> All tools
      </Link>

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
          <h1 className="font-serif text-4xl md:text-5xl leading-tight text-balance">{tool.title}</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">{tool.description}</p>
        </div>
      </div>

      <div className="mt-10 rounded-3xl border bg-card p-6 sm:p-8 shadow-soft">
        <AnimatePresence mode="wait">
          {(state === "idle" || state === "error") && (
            <motion.div key="idle" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <PdfDropzone files={files.map(f => f.file)} onChange={(newFiles) => addFiles(newFiles)} accept={tool.accept} multiple={tool.multiple} />

              {tool.kind === "merge" && files.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-medium text-lg">Arrange PDF Order</h2>
                    <p className="text-sm text-muted-foreground">Files merge from top to bottom</p>
                  </div>
                  <UnifiedFileList />
                </div>
              )}

              {/* Step 3 — Required inputs (P2 workflow) */}
              {files.length > 0 && (tool.needsRange || tool.needsPassword || tool.needsRotation || tool.kind === "compress") && (
                <div className="mt-6 rounded-2xl border bg-background p-5 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-medium">Settings</h3>
                    <span className="text-xs text-muted-foreground">Step 3 of 4</span>
                  </div>

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
                      <p className="mt-1.5 text-xs text-muted-foreground">Recipients will need this password to open the PDF.</p>
                    </div>
                  )}

                  {tool.needsRange && (
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Page range</label>
                      <input
                        type="text"
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        placeholder="e.g. 1-3, 5, 7-9"
                        className="w-full rounded-lg border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                      />
                      <p className="mt-1.5 text-xs text-muted-foreground">Use commas to separate, dashes for ranges.</p>
                    </div>
                  )}

                  {tool.needsRotation && (
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Rotation</label>
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
                    </div>
                  )}

                  {tool.kind === "compress" && (
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Compression level</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["light", "medium", "strong"] as const).map((lvl) => (
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
                      <p className="mt-1.5 text-xs text-muted-foreground">Stronger = smaller file, lower image quality.</p>
                    </div>
                  )}
                </div>
              )}



              {state === "error" && pdfJobError && (
                <div className="mt-5 flex gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4">
                  <AlertCircle className="size-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-accent">Couldn't process this file</p>
                    <p className="text-sm text-foreground/80 mt-0.5">{pdfJobError}</p>
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

          {(state === "uploading" || state === "processing") && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center"
            >
              <Loader2 className="mx-auto size-10 text-primary animate-spin" />
              <p className="mt-4 font-medium">{state === "uploading" ? "Preparing your file…" : "Processing in your browser…"}</p>
              <p className="text-sm text-muted-foreground mt-1">No uploads to our servers for this step.</p>
              <Progress value={progress} className="mt-6 max-w-sm mx-auto" />
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
