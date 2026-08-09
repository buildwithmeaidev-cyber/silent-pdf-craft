import { Link } from "react-router-dom";
import { GraduationCap, Briefcase, Users, BookOpen, Building2, ArrowRight, Scale, DollarSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PRESET_WORKFLOWS, KIND_META } from "@/lib/workflows";

interface Case {
  id: string;
  persona: string;
  icon: LucideIcon;
  problem: string;
  workflowId: string;
  outcome: string;
  extraToolSlugs?: string[];
  accent: "primary" | "accent";
}

const CASES: Case[] = [
  {
    id: "students", persona: "Students", icon: GraduationCap, accent: "primary",
    problem: "You've got handwritten notes, PDFs from lectures, and a portal that only accepts one file under 5 MB.",
    workflowId: "student-assignment",
    outcome: "One portal-ready assignment PDF, under the size cap, in the right order.",
    extraToolSlugs: ["merge-pdf", "compress-pdf"],
  },
  {
    id: "freelancers", persona: "Freelancers", icon: Briefcase, accent: "accent",
    problem: "You need to send a signed proposal or invoice fast, and half the online tools want a login.",
    workflowId: "resume-submission",
    outcome: "Signed, compressed, client-ready PDF without opening an account anywhere.",
    extraToolSlugs: ["word-to-pdf", "esign-pdf"],
  },
  {
    id: "hr", persona: "HR teams", icon: Users, accent: "primary",
    problem: "Onboarding packets carry sensitive data. Uploading them to a random converter isn't an option.",
    workflowId: "business-contract",
    outcome: "Everything runs in the browser — offer letter, NDA, and tax forms stay on the machine.",
    extraToolSlugs: ["merge-pdf", "protect-pdf"],
  },
  {
    id: "teachers", persona: "Teachers", icon: BookOpen, accent: "accent",
    problem: "You want to hand out clean readings without the pages you don't teach and without leaking rehearsal notes.",
    workflowId: "presentation-cleanup",
    outcome: "One clean handout, watermarked with the class name, easy to email or print.",
    extraToolSlugs: ["remove-pages", "reorder-pdf"],
  },
  {
    id: "smb", persona: "Small businesses", icon: Building2, accent: "primary",
    problem: "Contracts get signed on paper, scanned crookedly, and need to be merged with the master MSA.",
    workflowId: "contract-prep",
    outcome: "A straight, ordered contract ready for the final signature.",
    extraToolSlugs: ["rotate-pdf", "esign-pdf"],
  },
  {
    id: "legal", persona: "Legal", icon: Scale, accent: "accent",
    problem: "Exhibit packs go to opposing counsel — they need to be stamped, locked, and shipped without a leak.",
    workflowId: "legal-delivery",
    outcome: "A CONFIDENTIAL-stamped, password-locked exhibit pack in one flow.",
    extraToolSlugs: ["merge-pdf", "watermark-pdf", "protect-pdf"],
  },
  {
    id: "finance", persona: "Finance", icon: DollarSign, accent: "primary",
    problem: "A month of PDFs need to land in the accountant's inbox, small enough to send and locked in transit.",
    workflowId: "invoice-batch",
    outcome: "One password-protected invoice pack, small enough for every corporate mail cap.",
    extraToolSlugs: ["merge-pdf", "compress-pdf", "protect-pdf"],
  },
];

const UseCases = () => (
  <div className="container-px mx-auto max-w-6xl py-16 md:py-24">
    <div className="max-w-2xl">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Use cases</span>
      <h1 className="mt-3 font-serif text-5xl md:text-6xl leading-tight text-balance">
        Built for the people who do the work.
      </h1>
      <p className="mt-5 text-lg text-muted-foreground">
        Every use case here maps to a real workflow you can run in one click. No demos, no fake data — just the sequence of tools that solves the problem.
      </p>
    </div>

    <div className="mt-14 grid md:grid-cols-2 gap-6">
      {CASES.map((c) => {
        const Icon = c.icon;
        const wf = PRESET_WORKFLOWS.find((w) => w.id === c.workflowId);
        const accent = c.accent === "primary" ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent";
        return (
          <article key={c.id} className="rounded-3xl border bg-card p-7 md:p-8 shadow-soft hover:shadow-lift transition-all">
            <div className="flex items-start gap-4">
              <div className={`grid place-items-center size-12 rounded-xl ${accent} shrink-0`}>
                <Icon className="size-6" strokeWidth={1.7} />
              </div>
              <div>
                <h2 className="font-serif text-3xl">{c.persona}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{c.problem}</p>
              </div>
            </div>

            {wf && (
              <div className="mt-6 rounded-2xl border bg-background p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Recommended workflow</p>
                <p className="mt-1.5 font-medium">{wf.name}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {wf.steps.map((s, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-card border px-2.5 py-1 text-xs font-medium">
                        {KIND_META[s.kind].label}
                      </span>
                      {i < wf.steps.length - 1 && <ArrowRight className="size-3 text-muted-foreground" />}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{c.outcome}</p>
                <Link
                  to={`/workflows/run/${wf.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  Run this workflow <ArrowRight className="size-4" />
                </Link>
              </div>
            )}

            {c.extraToolSlugs && c.extraToolSlugs.length > 0 && (
              <div className="mt-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Tools this uses</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.extraToolSlugs.map((slug) => (
                    <Link
                      key={slug}
                      to={`/${slug}`}
                      className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                    >
                      {slug.replace(/-/g, " ")}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>

    <div className="mt-16 rounded-3xl border bg-ink text-ink-foreground p-10 md:p-14 relative overflow-hidden">
      <div className="absolute -right-16 -top-16 size-72 rounded-full bg-primary/30 blur-3xl" />
      <div className="relative max-w-2xl">
        <h2 className="font-serif text-3xl md:text-4xl text-balance">Your use case not here?</h2>
        <p className="mt-3 text-white/70">
          Build a custom workflow — chain any tools in any order and we'll pipe each result into the next.
        </p>
        <Link
          to="/workflows/custom"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-ink px-5 py-3 text-sm font-medium hover:bg-white/90 transition-colors"
        >
          Build a custom workflow <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  </div>
);

export default UseCases;
