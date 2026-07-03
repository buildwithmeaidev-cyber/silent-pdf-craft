import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Loader2, AlertCircle, Download, RotateCcw, Circle,
} from "lucide-react";
import { motion } from "framer-motion";
import { PdfDropzone } from "@/components/PdfDropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  KIND_META, getPreset, type Workflow, type WorkflowStep,
} from "@/lib/workflows";
import {
  mergePdfs, splitPdf, rotatePdf, removePages, compressPdf, protectPdf,
  imageToPdf, watermarkPdf, removeWatermarkPdf, reorderPdf, addBlankPages,
  exportPdf, signPdf, pdfToWord, wordToPdf, editPdfPassthrough,
  downloadBlob, formatBytes,
} from "@/lib/pdf";
import { MAX_UPLOAD_MB, checkUploadSize } from "@/lib/uploadLimits";

type StepStatus = "queued" | "running" | "done" | "error";

const WorkflowRunner = () => {
  const { id = "" } = useParams();
  const location = useLocation();
  const state = location.state as { name?: string; steps?: WorkflowStep[] } | null;

  const workflow: Workflow | null = useMemo(() => {
    if (id === "custom") {
      if (!state?.steps || state.steps.length === 0) return null;
      return {
        id: "custom",
        name: state.name || "Custom workflow",
        audience: "You",
        description: "Your custom chain.",
        steps: state.steps,
        accent: "from-primary/15 to-primary/0",
      };
    }
    return getPreset(id) ?? null;
  }, [id, state]);

  const [files, setFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<StepStatus[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [runState, setRunState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  useEffect(() => {
    if (workflow) setStatuses(workflow.steps.map(() => "queued"));
  }, [workflow]);

  if (!workflow) {
    return (
      <div className="container-px mx-auto max-w-2xl py-24 text-center">
        <h1 className="font-serif text-3xl">Workflow not found</h1>
        <Link to="/workflows" className="mt-6 inline-block text-primary">
          Back to workflows →
        </Link>
      </div>
    );
  }

  const firstMeta = KIND_META[workflow.steps[0].kind];
  const accept = acceptForInput(firstMeta.input);
  const multiple = firstMeta.input === "pdf-multi" || firstMeta.input === "images";

  const canRun = files.length > 0 && (!multiple || files.length >= (firstMeta.input === "pdf-multi" ? 2 : 1));

  const handleFiles = (incoming: File[]) => {
    const { accepted, oversized } = checkUploadSize(incoming);
    if (oversized.length > 0) {
      setUploadError(`${oversized[0].name} is over ${MAX_UPLOAD_MB}MB. Split or compress it first.`);
    } else {
      setUploadError(null);
    }
    if (multiple) {
      // Dedupe against existing
      const existing = new Set(files.map((f) => `${f.name}:${f.size}:${f.lastModified}`));
      setFiles([...files, ...accepted.filter((f) => !existing.has(`${f.name}:${f.size}:${f.lastModified}`))]);
    } else {
      setFiles(accepted.slice(0, 1));
    }
  };

  const runAll = async () => {
    setRunState("running");
    setError(null);
    setResult(null);
    const nextStatuses: StepStatus[] = workflow.steps.map(() => "queued");
    setStatuses(nextStatuses);

    let current: { blob: Blob; filename: string } | null = null;
    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        setCurrentStep(i);
        nextStatuses[i] = "running";
        setStatuses([...nextStatuses]);

        const step = workflow.steps[i];
        const inputFiles: File[] = i === 0
          ? files
          : [new File([current!.blob], current!.filename, { type: current!.blob.type })];

        current = await runStep(step, inputFiles);
        nextStatuses[i] = "done";
        setStatuses([...nextStatuses]);
      }
      setResult(current);
      setRunState("done");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      if (currentStep >= 0) {
        nextStatuses[currentStep] = "error";
        setStatuses([...nextStatuses]);
      }
      setRunState("error");
    }
  };

  const restart = () => {
    setFiles([]);
    setStatuses(workflow.steps.map(() => "queued"));
    setCurrentStep(-1);
    setRunState("idle");
    setError(null);
    setResult(null);
  };

  const progressPct = runState === "done" ? 100
    : runState === "running" ? Math.round(((currentStep + 0.5) / workflow.steps.length) * 100)
    : 0;

  return (
    <div className="container-px mx-auto max-w-3xl py-12 md:py-16">
      <Link
        to="/workflows"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-4" /> All workflows
      </Link>

      <div>
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{workflow.audience}</span>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl leading-tight text-balance">{workflow.name}</h1>
        <p className="mt-2 text-muted-foreground max-w-xl">{workflow.description}</p>
      </div>

      {/* Step chips */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {workflow.steps.map((s, i) => {
          const meta = KIND_META[s.kind];
          const status = statuses[i] ?? "queued";
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  status === "running" && "border-primary bg-primary-soft text-primary",
                  status === "done" && "border-emerald-400/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                  status === "error" && "border-accent bg-accent-soft text-accent",
                  status === "queued" && "bg-card"
                )}
              >
                {status === "running" && <Loader2 className="size-3.5 animate-spin" />}
                {status === "done" && <CheckCircle2 className="size-3.5" />}
                {status === "error" && <AlertCircle className="size-3.5" />}
                {status === "queued" && <Circle className="size-3.5" />}
                {meta.label}
              </span>
              {i < workflow.steps.length - 1 && <ArrowRight className="size-3.5 text-muted-foreground" />}
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-3xl border bg-card p-6 sm:p-8 shadow-soft">
        {runState === "idle" || runState === "error" ? (
          <>
            <PdfDropzone
              files={files}
              onChange={handleFiles}
              accept={accept}
              multiple={multiple}
              showFileList
            />
            {uploadError && (
              <div className="mt-4 flex gap-3 rounded-xl border border-accent/30 bg-accent-soft p-3">
                <AlertCircle className="size-4 text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-accent">{uploadError}</p>
              </div>
            )}
            {runState === "error" && error && (
              <div className="mt-4 flex gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4">
                <AlertCircle className="size-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-accent">Workflow failed</p>
                  <p className="text-sm text-foreground/80 mt-0.5">{error}</p>
                </div>
              </div>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                onClick={runAll}
                disabled={!canRun}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Run workflow <ArrowRight className="size-4 ml-1" />
              </Button>
              {files.length > 0 && (
                <button onClick={() => setFiles([])} className="text-sm text-muted-foreground hover:text-foreground">
                  Clear
                </button>
              )}
            </div>
          </>
        ) : runState === "running" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center">
            <Loader2 className="mx-auto size-10 text-primary animate-spin" />
            <p className="mt-4 font-medium">
              Step {currentStep + 1} of {workflow.steps.length}: {KIND_META[workflow.steps[currentStep]?.kind]?.label}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Processing in your browser…</p>
            <Progress value={progressPct} className="mt-6 max-w-sm mx-auto" />
          </motion.div>
        ) : (
          result && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
              <div className="mx-auto grid place-items-center size-14 rounded-full bg-primary-soft text-primary">
                <CheckCircle2 className="size-7" />
              </div>
              <h2 className="mt-4 font-serif text-2xl">Your file is ready</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {result.filename} · {formatBytes(result.blob.size)}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" onClick={() => downloadBlob(result.blob, result.filename)}>
                  <Download className="size-4" /> Download
                </Button>
                <Button size="lg" variant="outline" onClick={restart}>
                  <RotateCcw className="size-4" /> Run again
                </Button>
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
};

function acceptForInput(input: string): Record<string, string[]> {
  switch (input) {
    case "images":
      return { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] };
    case "word":
      return { "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] };
    default:
      return { "application/pdf": [".pdf"] };
  }
}

async function runStep(step: WorkflowStep, files: File[]): Promise<{ blob: Blob; filename: string }> {
  const f = files[0];
  const c = step.config ?? {};
  switch (step.kind) {
    case "merge": return await mergePdfs(files);
    case "split": return await splitPdf(f, c.range);
    case "rotate": return await rotatePdf(f, c.rotation ?? 90);
    case "remove": return await removePages(f, c.range ?? "");
    case "compress":
      return await compressPdf(f, {
        level: c.compressionLevel ?? "medium",
        quality: c.compressionLevel === "custom" ? c.quality : undefined,
      });
    case "protect":
      if (!c.password || c.password.length < 4) throw new Error("Protect step needs a password of at least 4 characters.");
      return await protectPdf(f, c.password);
    case "watermark":
      if (!c.watermarkText?.trim()) throw new Error("Watermark step needs text.");
      return await watermarkPdf(f, c.watermarkText);
    case "removewatermark": return await removeWatermarkPdf(f);
    case "reorder":
      if (!c.range?.trim()) throw new Error("Reorder step needs a page order.");
      return await reorderPdf(f, c.range);
    case "addpages": return await addBlankPages(f, c.addCount ?? 1);
    case "export": return await exportPdf(f, c.exportName ?? f.name.replace(/\.pdf$/i, ""));
    case "sign":
    case "e-sign":
      if (!c.signatureText?.trim()) throw new Error("Signature step needs a signature.");
      return await signPdf(f, c.signatureText);
    case "pdf-to-word": return await pdfToWord(f);
    case "word-to-pdf": return await wordToPdf(f);
    case "photo-to-pdf": return await imageToPdf(files);
    case "edit": return await editPdfPassthrough(f);
    default: throw new Error(`Unsupported step: ${step.kind}`);
  }
}

export default WorkflowRunner;
