import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Wand2, Workflow as WorkflowIcon } from "lucide-react";
import { PRESET_WORKFLOWS, KIND_META } from "@/lib/workflows";
import { cn } from "@/lib/utils";

const Workflows = () => {
  return (
    <div className="container-px mx-auto max-w-7xl py-16 md:py-24">
      <div className="max-w-2xl">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Workflows</span>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl leading-tight text-balance">
          Real jobs, end to end.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Chain a few quiet tools together to finish the work you actually came for — or build a
          custom workflow that pipes one tool's output straight into the next.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-5">
        {/* Custom builder card — always first */}
        <Link
          to="/workflows/custom"
          className="group relative rounded-3xl border-2 border-dashed border-primary/40 bg-primary-soft/30 p-7 shadow-soft hover:border-primary hover:shadow-lift transition-all overflow-hidden"
        >
          <div className="grid place-items-center size-12 rounded-xl bg-primary text-primary-foreground">
            <Wand2 className="size-6" strokeWidth={1.8} />
          </div>
          <h3 className="mt-4 font-serif text-2xl">Build a custom workflow</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick any tools in any order. Upload once, and we'll pipe each result into the next step
            automatically.
          </p>
          <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Start building <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {PRESET_WORKFLOWS.map((w) => (
          <div
            key={w.id}
            className="relative rounded-3xl border bg-card p-7 shadow-soft hover:shadow-lift transition-all overflow-hidden"
          >
            <div className={cn("absolute inset-0 -z-0 bg-gradient-to-br", w.accent)} />
            <div className="relative">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{w.audience}</span>
              <h3 className="mt-2 font-serif text-2xl text-balance">{w.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{w.description}</p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {w.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-background border px-3 py-1.5 text-sm font-medium">
                      {KIND_META[s.kind].label}
                    </span>
                    {i < w.steps.length - 1 && <ArrowRight className="size-3.5 text-muted-foreground" />}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-4">
                <Link
                  to={`/workflows/run/${w.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Sparkles className="size-4" /> Run workflow
                </Link>
                <Link
                  to={`/${KIND_META[w.steps[0].kind].slug}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Open first tool
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border bg-secondary/40 p-6 flex items-start gap-4">
        <div className="grid place-items-center size-10 rounded-xl bg-background border shrink-0">
          <WorkflowIcon className="size-5" strokeWidth={1.8} />
        </div>
        <div>
          <p className="font-medium">Everything runs in your browser.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Each step processes the previous step's output locally — no files leave your device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Workflows;
