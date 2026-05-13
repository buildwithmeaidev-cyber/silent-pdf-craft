import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Download, Loader2, RotateCcw, AlertCircle, ChevronRight, Zap, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTool } from "@/lib/tools";
import { PdfDropzone } from "@/components/PdfDropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  mergePdfs, splitPdf, rotatePdf, removePages, compressPdf, protectPdf,
  downloadBlob, formatBytes, ToolResult, CompressionLevel, getOptimalCompressionLevel,
  getCompressionDescription,
} from "@/lib/pdf";
import { cn } from "@/lib/utils";

type State = "idle" | "uploading" | "processing" | "success" | "error";

const ToolPage = () => {
  const { slug = "" } = useParams();
  const tool = getTool(slug);
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ToolResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("");
  const [password, setPassword] = useState("");
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  
  // Compression-specific states
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("medium");
  const [customQuality, setCustomQuality] = useState(80);
  const [showCompressionInfo, setShowCompressionInfo] = useState(false);

  const optimalLevel = useMemo(() => {
    if (files.length === 0) return null;
    return getOptimalCompressionLevel(files[0].size);
  }, [files]);

  const canRun = useMemo(() => {
    if (!tool || files.length === 0) return false;
    if (tool.kind === "merge" && files.length < 2) return false;
    if (tool.needsRange && !range.trim()) return false;
    if (tool.needsPassword && password.length < 4) return false;
    return true;
  }, [tool, files, range, password]);

  if (!tool) {
    return (
      <div className="container-px mx-auto max-w-2xl py-24 text-center">
        <h1 className="font-serif text-4xl">Tool not found</h1>
        <Link to="/tools" className="mt-6 inline-block text-primary">Browse all tools →</Link>
      </div>
    );
  }

  const reset = () => {
    setFiles([]); 
    setResult(null); 
    setError(null); 
    setState("idle"); 
    setProgress(0);
    setCompressionLevel("medium");
    setCustomQuality(80);
    setShowCompressionInfo(false);
  };

  const run = async () => {
    setError(null); 
    setResult(null); 
    setState("uploading"); 
    setProgress(15);
    try {
      // simulate quick upload step for UX feedback
      await new Promise((r) => setTimeout(r, 350));
      setState("processing"); 
      setProgress(55);

      let res: ToolResult;
      if (tool.serverOnly) {
        await new Promise((r) => setTimeout(r, 800));
        throw new Error("This tool runs on our hosted conversion engine. Connect Lovable Cloud to enable it.");
      }
      switch (tool.kind) {
        case "merge": res = await mergePdfs(files); break;
        case "split": res = await splitPdf(files[0], range); break;
        case "rotate": res = await rotatePdf(files[0], rotation); break;
        case "remove": res = await removePages(files[0], range); break;
        case "compress": 
          res = await compressPdf(files[0], {
            level: compressionLevel,
            quality: compressionLevel === "custom" ? customQuality : undefined,
          }); 
          break;
        case "protect": res = await protectPdf(files[0], password); break;
        default: throw new Error("Unsupported tool");
      }
      setProgress(100);
      setResult(res);
      setState("success");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong while processing.");
      setState("error");
    }
  };

  const Icon = tool.icon;
  const compressionLevels: CompressionLevel[] = ["light", "medium", "strong", "custom"];

  return (
    <div className="container-px mx-auto max-w-3xl py-12 md:py-16">
      <Link to="/tools" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="size-4" /> All tools
      </Link>

      <div className="flex items-start gap-4">
        <div className={cn(
          "grid place-items-center size-12 rounded-xl shrink-0",
          tool.accent === "blue" ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent"
        )}>
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
              <PdfDropzone
                files={files}
                onChange={setFiles}
                accept={tool.accept}
                multiple={tool.multiple}
              />

              {/* Compression Level Selector */}
              {tool.kind === "compress" && files.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Compression Level</label>
                    {optimalLevel && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                        <Zap className="size-3" /> Suggested: {optimalLevel.charAt(0).toUpperCase() + optimalLevel.slice(1)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {compressionLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() => setCompressionLevel(level)}
                        className={cn(
                          "p-3 rounded-lg border-2 text-center transition-all text-sm font-medium",
                          compressionLevel === level
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 text-foreground"
                        )}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Compression Info Card */}
                  {files.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20"
                    >
                      {(() => {
                        const desc = getCompressionDescription(compressionLevel);
                        return (
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-sm text-foreground">{desc.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{desc.description}</p>
                              </div>
                              <button
                                onClick={() => setShowCompressionInfo(!showCompressionInfo)}
                                className="text-primary hover:text-primary/80"
                              >
                                <ChevronRight
                                  className={cn(
                                    "size-4 transition-transform",
                                    showCompressionInfo && "rotate-90"
                                  )}
                                />
                              </button>
                            </div>

                            {showCompressionInfo && (
                              <div className="space-y-2 border-t border-primary/20 pt-3">
                                {desc.details.map((detail, idx) => (
                                  <p key={idx} className="text-xs text-muted-foreground">
                                    {detail}
                                  </p>
                                ))}
                              </div>
                            )}

                            {/* Custom Quality Slider */}
                            {compressionLevel === "custom" && (
                              <div className="border-t border-primary/20 pt-3">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-xs font-medium text-foreground flex items-center gap-2">
                                    <Settings className="size-3" /> Quality
                                  </label>
                                  <span className="text-xs font-semibold text-primary">{customQuality}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="30"
                                  max="100"
                                  value={customQuality}
                                  onChange={(e) => setCustomQuality(Number(e.target.value))}
                                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                  <span>Lower (Smaller)</span>
                                  <span>Higher (Better)</span>
                                </div>
                              </div>
                            )}

                            {/* File Info */}
                            <div className="border-t border-primary/20 pt-3">
                              <p className="text-xs text-muted-foreground">
                                📄 File size: <span className="font-semibold text-foreground">{formatBytes(files[0].size)}</span>
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Other Tool Options */}
              {(tool.needsRange || tool.needsPassword || tool.needsRotation) && files.length > 0 && tool.kind !== "compress" && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {tool.needsRange && (
                    <label className="block sm:col-span-2">
                      <span className="text-sm font-medium">Pages</span>
                      <input
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        placeholder="e.g. 1-3, 5, 8-10"
                        className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                  )}
                  {tool.needsPassword && (
                    <label className="block sm:col-span-2">
                      <span className="text-sm font-medium">Privacy passphrase</span>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 4 characters"
                        className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                  )}
                  {tool.needsRotation && (
                    <div className="sm:col-span-2">
                      <span className="text-sm font-medium">Rotation</span>
                      <div className="mt-1.5 flex gap-2">
                        {[90, 180, 270].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setRotation(d as 90 | 180 | 270)}
                            className={cn(
                              "flex-1 rounded-lg border px-3 py-2 text-sm transition-colors",
                              rotation === d ? "border-primary bg-primary-soft text-primary" : "hover:bg-secondary"
                            )}
                          >
                            {d}°
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
                <Button onClick={run} disabled={!canRun} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {tool.title} now
                  <ChevronRight className="size-4 ml-1" />
                </Button>
                {files.length > 0 && (
                  <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground">Clear</button>
                )}
              </div>
            </motion.div>
          )}

          {(state === "uploading" || state === "processing") && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-10 text-center">
              <Loader2 className="mx-auto size-10 text-primary animate-spin" />
              <p className="mt-4 font-medium">{state === "uploading" ? "Preparing your file…" : "Processing in your browser…"}</p>
              <p className="text-sm text-muted-foreground mt-1">No uploads to our servers for this step.</p>
              <Progress value={progress} className="mt-6 max-w-sm mx-auto" />
            </motion.div>
          )}

          {state === "success" && result && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
              <div className="mx-auto grid place-items-center size-14 rounded-full bg-primary-soft text-primary">
                <CheckCircle2 className="size-7" />
              </div>
              <h3 className="mt-4 font-serif text-2xl">Your file is ready</h3>
              <p className="text-sm text-muted-foreground mt-1">{result.filename} · {formatBytes(result.blob.size)}</p>
              
              {/* Show compression stats if available */}
              {tool.kind === "compress" && (result as any).compressionRatio && (
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20 inline-block">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Compression Stats</p>
                    <p className="text-sm font-semibold text-primary">
                      {(result as any).compressionRatio.toFixed(1)}% reduction
                    </p>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>📦 Original: {formatBytes((result as any).originalSize)}</p>
                      <p>📤 Compressed: {formatBytes((result as any).compressedSize)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" onClick={() => downloadBlob(result.blob, result.filename)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Download className="size-4 mr-1.5" /> Download
                </Button>
                <Button size="lg" variant="outline" onClick={reset}>
                  <RotateCcw className="size-4 mr-1.5" /> Process another
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section className="mt-14">
        <h2 className="font-serif text-2xl mb-4">Frequently asked</h2>
        <div className="space-y-3">
          {tool.faq.map((f) => (
            <details key={f.q} className="group rounded-xl border bg-card p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-2 text-sm font-medium">
                {f.q}
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ToolPage;
