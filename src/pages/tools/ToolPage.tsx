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
  ArrowUp,
  ArrowDown,
  FileText,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTool } from "@/lib/tools";
import { PdfDropzone } from "@/components/PdfDropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { usePdfJob } from "@/hooks/usePdfJob";
import { mergePdfs, splitPdf, rotatePdf, removePages, compressPdf, protectPdf, downloadBlob, formatBytes } from "@/lib/pdf";

const ToolPage = () => {
  const { slug = "" } = useParams();
  const tool = getTool(slug);
  const [files, setFiles] = useState<File[]>([]);
  const [range, setRange] = useState("");
  const [password, setPassword] = useState("");
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [compressionLevel, setCompressionLevel] = useState<"light" | "medium" | "strong" | "custom">(
    "medium"
  );
  const [customQuality, setCustomQuality] = useState(80);

  const { progress, state, result, error, run, reset: resetJob, setState, setError, setProgress, setResult } = usePdfJob();

  const canRun = useMemo(() => {
    if (!tool || files.length === 0) return false;
    if (tool.kind === "merge" && files.length < 2) return false;
    if (tool.needsRange && !range.trim()) return false;
    if (tool.needsPassword && password.length < 4) return false;
    return true;
  }, [tool, files, range, password]);

  const moveFile = (index: number, direction: "up" | "down") => {
    const updated = [...files];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= updated.length) return;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setFiles(updated);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const reset = () => {
    setFiles([]);
    resetJob();
    setCompressionLevel("medium");
    setCustomQuality(80);
  };

  const runTool = async () => {
    await run(async () => {
      switch (tool?.kind) {
        case "merge":
          return await mergePdfs(files);
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
              <PdfDropzone files={files} onChange={setFiles} accept={tool.accept} multiple={tool.multiple} />

              {tool.kind === "merge" && files.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-medium text-lg">Arrange PDF Order</h2>
                    <p className="text-sm text-muted-foreground">Files merge from top to bottom</p>
                  </div>
                  <div className="space-y-3">
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-4 rounded-2xl border bg-background p-4"
                      >
                        <div className="flex h-16 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                          <FileText className="size-7" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveFile(index, "up")}
                            disabled={index === 0}
                            aria-label={`Move ${file.name} up`}
                            className="rounded-lg border p-2 hover:bg-secondary disabled:opacity-40"
                          >
                            <ArrowUp className="size-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => moveFile(index, "down")}
                            disabled={index === files.length - 1}
                            aria-label={`Move ${file.name} down`}
                            className="rounded-lg border p-2 hover:bg-secondary disabled:opacity-40"
                          >
                            <ArrowDown className="size-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            aria-label={`Remove ${file.name}`}
                            className="rounded-lg border p-2 hover:bg-accent/10 text-accent"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {state === "error" && error && (
                <div className="mt-5 flex gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4">
                  <AlertCircle className="size-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-accent">Couldn't process this file</p>
                    <p className="text-sm text-foreground/80 mt-0.5">{error}</p>
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
                          to={`/tools/${slug}`}
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
