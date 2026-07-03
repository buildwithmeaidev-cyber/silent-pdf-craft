import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Plus, X, ArrowUp, ArrowDown, AlertCircle, Wand2 } from "lucide-react";
import { TOOLS, type ToolKind } from "@/lib/tools";
import {
  KIND_META,
  canBeFirstStep,
  canBeMidStep,
  canBeLastStep,
  validateChain,
  type WorkflowStep,
  type StepConfig,
} from "@/lib/workflows";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CustomWorkflowBuilder = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  const availableKinds = useMemo(() => {
    const all = TOOLS.map((t) => t.kind);
    // Dedupe (some slugs share kinds — they don't here, but be safe)
    return Array.from(new Set(all));
  }, []);

  const validationError = validateChain(steps);
  const canAdd = (kind: ToolKind): boolean => {
    if (steps.length === 0) return canBeFirstStep(kind);
    // A new appended step is currently the LAST. If we later append more,
    // it becomes a mid step. So only allow kinds that can be BOTH last AND mid,
    // OR "last only" (which then locks the chain).
    const prev = KIND_META[steps[steps.length - 1].kind];
    if (prev.output !== "pdf") return false; // chain already terminal
    return canBeLastStep(kind);
  };

  const addStep = (kind: ToolKind) => {
    setSteps((prev) => [...prev, { kind, config: defaultConfig(kind) }]);
  };

  const removeStep = (i: number) => setSteps((prev) => prev.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    setSteps((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const updateConfig = (i: number, patch: Partial<StepConfig>) => {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, config: { ...s.config, ...patch } } : s)));
  };

  const runWorkflow = () => {
    if (validationError) return;
    navigate("/workflows/run/custom", {
      state: { name: "Custom workflow", steps },
    });
  };

  return (
    <div className="container-px mx-auto max-w-5xl py-12 md:py-16">
      <Link
        to="/workflows"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-4" /> All workflows
      </Link>

      <div className="flex items-start gap-4">
        <div className="grid place-items-center size-12 rounded-xl bg-primary text-primary-foreground shrink-0">
          <Wand2 className="size-6" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight text-balance">Build a custom workflow</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Pick tools in the order you want. Your file flows through each step automatically — the
            output of one becomes the input of the next.
          </p>
        </div>
      </div>

      {/* Ordered step list */}
      <div className="mt-10 rounded-3xl border bg-card p-6 sm:p-8 shadow-soft">
        <h2 className="font-medium">Your workflow</h2>
        {steps.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No steps yet. Pick a tool below to start your chain.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {steps.map((s, i) => {
              const meta = KIND_META[s.kind];
              return (
                <li key={i} className="rounded-2xl border bg-background p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center size-8 rounded-lg bg-primary-soft text-primary text-sm font-medium">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{meta.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {i === 0 ? `Takes: ${friendlyIo(meta.input)}` : "Takes: PDF from previous step"}
                        {" · "}Outputs: {friendlyIo(meta.output)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="rounded-lg border p-2 hover:bg-secondary disabled:opacity-40"
                        aria-label="Move up"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === steps.length - 1}
                        className="rounded-lg border p-2 hover:bg-secondary disabled:opacity-40"
                        aria-label="Move down"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                      <button
                        onClick={() => removeStep(i)}
                        className="rounded-lg border p-2 hover:bg-accent/10 text-accent"
                        aria-label="Remove"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                  <StepConfigEditor step={s} onChange={(patch) => updateConfig(i, patch)} />
                </li>
              );
            })}
          </ol>
        )}

        {validationError && steps.length > 0 && (
          <div className="mt-4 flex gap-3 rounded-xl border border-accent/30 bg-accent-soft p-3">
            <AlertCircle className="size-4 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-accent">{validationError}</p>
          </div>
        )}

        <div className="mt-6">
          <Button
            onClick={runWorkflow}
            disabled={steps.length === 0 || !!validationError}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Continue to upload <ArrowRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Tool picker */}
      <div className="mt-10">
        <h2 className="font-medium">Add a tool</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Grayed-out tools can't be added here — either the chain is already terminal, or the tool
          needs a different input than the previous step's output.
        </p>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableKinds.map((kind) => {
            const meta = KIND_META[kind];
            const allowed = canAdd(kind);
            const tool = TOOLS.find((t) => t.slug === meta.slug);
            const Icon = tool?.icon;
            return (
              <button
                key={kind}
                type="button"
                disabled={!allowed}
                onClick={() => addStep(kind)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border bg-card p-4 text-left transition",
                  allowed ? "hover:border-primary hover:shadow-soft" : "opacity-40 cursor-not-allowed"
                )}
              >
                <div className="grid place-items-center size-10 rounded-xl bg-secondary shrink-0">
                  {Icon && <Icon className="size-5" strokeWidth={1.8} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{meta.label}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {friendlyIo(meta.input)} → {friendlyIo(meta.output)}
                  </p>
                </div>
                <Plus className="size-4 text-muted-foreground shrink-0 mt-1" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function friendlyIo(io: string): string {
  switch (io) {
    case "pdf": return "PDF";
    case "pdf-multi": return "Multiple PDFs";
    case "images": return "Images";
    case "word": return "Word (.docx)";
    case "docx": return "Word (.docx)";
    default: return io;
  }
}

function defaultConfig(kind: ToolKind): StepConfig {
  switch (kind) {
    case "compress": return { compressionLevel: "medium", quality: 80 };
    case "rotate": return { rotation: 90 };
    case "watermark": return { watermarkText: "CONFIDENTIAL" };
    case "sign":
    case "e-sign": return { signatureText: "" };
    case "addpages": return { addCount: 1 };
    case "export": return { exportName: "" };
    default: return {};
  }
}

const StepConfigEditor = ({ step, onChange }: { step: WorkflowStep; onChange: (p: Partial<StepConfig>) => void }) => {
  const c = step.config ?? {};
  const inputCls = "w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:border-primary";
  switch (step.kind) {
    case "split":
    case "remove":
      return (
        <div className="mt-4">
          <label className="text-xs font-medium block mb-1.5">Page range</label>
          <input
            className={inputCls}
            placeholder="e.g. 1-3, 5, 7-9"
            value={c.range ?? ""}
            onChange={(e) => onChange({ range: e.target.value })}
          />
        </div>
      );
    case "reorder":
      return (
        <div className="mt-4">
          <label className="text-xs font-medium block mb-1.5">New page order</label>
          <input
            className={inputCls}
            placeholder="e.g. 3,1,2,4"
            value={c.range ?? ""}
            onChange={(e) => onChange({ range: e.target.value })}
          />
        </div>
      );
    case "rotate":
      return (
        <div className="mt-4 flex gap-2">
          {[90, 180, 270].map((deg) => (
            <button
              key={deg}
              type="button"
              onClick={() => onChange({ rotation: deg as 90 | 180 | 270 })}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium",
                c.rotation === deg ? "border-primary bg-primary-soft text-primary" : "hover:bg-secondary"
              )}
            >
              {deg}°
            </button>
          ))}
        </div>
      );
    case "compress":
      return (
        <div className="mt-4">
          <div className="grid grid-cols-4 gap-2">
            {(["light", "medium", "strong", "custom"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => onChange({ compressionLevel: lvl })}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium capitalize",
                  c.compressionLevel === lvl ? "border-primary bg-primary-soft text-primary" : "hover:bg-secondary"
                )}
              >
                {lvl}
              </button>
            ))}
          </div>
          {c.compressionLevel === "custom" && (
            <div className="mt-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Quality</span>
                <span className="font-medium">{c.quality ?? 80}%</span>
              </div>
              <input
                type="range" min={20} max={100} step={5}
                value={c.quality ?? 80}
                onChange={(e) => onChange({ quality: parseInt(e.target.value, 10) })}
                className="w-full mt-1 accent-primary"
              />
            </div>
          )}
        </div>
      );
    case "protect":
      return (
        <div className="mt-4">
          <label className="text-xs font-medium block mb-1.5">Password (min 4 chars)</label>
          <input
            type="password"
            className={inputCls}
            value={c.password ?? ""}
            onChange={(e) => onChange({ password: e.target.value })}
          />
        </div>
      );
    case "watermark":
      return (
        <div className="mt-4">
          <label className="text-xs font-medium block mb-1.5">Watermark text</label>
          <input
            className={inputCls}
            value={c.watermarkText ?? ""}
            onChange={(e) => onChange({ watermarkText: e.target.value })}
          />
        </div>
      );
    case "sign":
    case "e-sign":
      return (
        <div className="mt-4">
          <label className="text-xs font-medium block mb-1.5">Signature text</label>
          <input
            className={cn(inputCls, "font-serif italic")}
            placeholder="Type your name"
            value={c.signatureText ?? ""}
            onChange={(e) => onChange({ signatureText: e.target.value })}
          />
        </div>
      );
    case "addpages":
      return (
        <div className="mt-4">
          <label className="text-xs font-medium block mb-1.5">Blank pages to add</label>
          <input
            type="number" min={1} max={50}
            className={inputCls}
            value={c.addCount ?? 1}
            onChange={(e) => onChange({ addCount: parseInt(e.target.value || "1", 10) })}
          />
        </div>
      );
    case "export":
      return (
        <div className="mt-4">
          <label className="text-xs font-medium block mb-1.5">New filename</label>
          <input
            className={inputCls}
            placeholder="my-final-document"
            value={c.exportName ?? ""}
            onChange={(e) => onChange({ exportName: e.target.value })}
          />
        </div>
      );
    default:
      return null;
  }
};

export default CustomWorkflowBuilder;
