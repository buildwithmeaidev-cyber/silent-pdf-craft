import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  ArrowUpRight, ShieldCheck, ServerOff, Lock, Trash2, Sparkles,
  GraduationCap, Briefcase, Users, BookOpen, Building2, ArrowRight, FileText,
  Combine, Minimize2, Lock as LockIcon, Clock, Zap, CheckCircle2,
} from "lucide-react";
import { TOOLS } from "@/lib/tools";
import { cn } from "@/lib/utils";
import HomeFaq from "@/components/home/HomeFaq";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

// --- Category + tool meta (kept here so we don't have to refactor tools.ts) ---
type CategoryId = "all" | "conversion" | "editing" | "organization" | "security" | "signing";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "all", label: "All tools" },
  { id: "conversion", label: "Conversion" },
  { id: "editing", label: "Editing" },
  { id: "organization", label: "Organization" },
  { id: "security", label: "Security" },
  { id: "signing", label: "Signing" },
];

const TOOL_META: Record<string, { category: Exclude<CategoryId, "all">; useCase: string; time: string }> = {
  "merge-pdf":         { category: "organization", useCase: "Combine resume + cover letter",    time: "Seconds" },
  "split-pdf":         { category: "organization", useCase: "Pull a signed page from a contract", time: "Seconds" },
  "compress-pdf":      { category: "organization", useCase: "Email-ready attachments",          time: "Under 10s" },
  "reorder-pdf":       { category: "organization", useCase: "Fix scan order",                   time: "Seconds" },
  "rotate-pages":      { category: "organization", useCase: "Flip sideways scans",              time: "Instant" },
  "remove-pages":      { category: "organization", useCase: "Drop blank or duplicate pages",    time: "Instant" },
  "add-pages":         { category: "organization", useCase: "Insert a cover page",              time: "Seconds" },

  "pdf-to-word":       { category: "conversion",   useCase: "Edit a locked contract",           time: "~15s" },
  "word-to-pdf":       { category: "conversion",   useCase: "Send a resume in PDF",             time: "~10s" },
  "photo-to-pdf":      { category: "conversion",   useCase: "Submit phone scans as one PDF",    time: "Seconds" },
  "export-pdf":        { category: "conversion",   useCase: "Save pages as images",             time: "Seconds" },

  "edit-pdf":          { category: "editing",      useCase: "Tweak text, add notes",            time: "Live" },
  "watermark-pdf":     { category: "editing",      useCase: "Brand drafts with a logo",         time: "Seconds" },
  "remove-watermark":  { category: "editing",      useCase: "Clean approved templates",         time: "Seconds" },

  "protect-pdf":       { category: "security",     useCase: "Password-lock sensitive files",    time: "Instant" },

  "sign-pdf":          { category: "signing",      useCase: "Add a handwritten signature",      time: "1 minute" },
  "e-sign-pdf":        { category: "signing",      useCase: "Send contracts for e-signature",   time: "2 minutes" },
};

const WORKFLOWS = [
  {
    name: "Resume submission",
    audience: "Job seekers",
    steps: [
      { label: "Word to PDF", to: "/tools/word-to-pdf" },
      { label: "Compress",    to: "/tools/compress-pdf" },
      { label: "Sign",        to: "/tools/sign-pdf" },
    ],
    accent: "from-primary/15 to-primary/0",
  },
  {
    name: "Business contract",
    audience: "Founders & ops",
    steps: [
      { label: "Merge",   to: "/tools/merge-pdf" },
      { label: "Protect", to: "/tools/protect-pdf" },
      { label: "E-Sign",  to: "/tools/e-sign-pdf" },
    ],
    accent: "from-accent/15 to-accent/0",
  },
  {
    name: "Student assignment",
    audience: "Students",
    steps: [
      { label: "Photo to PDF", to: "/tools/photo-to-pdf" },
      { label: "Compress",     to: "/tools/compress-pdf" },
      { label: "Merge",        to: "/tools/merge-pdf" },
    ],
    accent: "from-ink/10 to-ink/0",
  },
];

const Home = () => {
  const [category, setCategory] = useState<CategoryId>("all");

  const filteredTools = useMemo(() => {
    if (category === "all") return TOOLS;
    return TOOLS.filter((t) => TOOL_META[t.slug]?.category === category);
  }, [category]);

  return (
    <>
      {/* HERO — bigger type, single primary CTA, calmer density */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 grid-bg [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div className="container-px mx-auto max-w-7xl pt-20 md:pt-32 pb-24 md:pb-40 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <motion.div {...fadeUp} className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Free · No signup · Files never leave your browser
            </motion.div>

            <motion.h1
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="mt-7 font-serif text-6xl sm:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight text-balance"
            >
              The quiet PDF workspace
              <span className="block italic text-primary mt-2">that respects your files.</span>
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="mt-7 text-xl text-muted-foreground max-w-xl leading-relaxed"
            >
              Merge, compress, sign and convert PDFs in seconds — directly in your browser.
              No uploads to our servers for core tools.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.15 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/tools/merge-pdf"
                className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-4 text-base font-medium shadow-blue hover:shadow-lift transition-all"
              >
                Start free — pick a PDF
                <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <a href="#tools" className="inline-flex items-center gap-2 text-base font-medium text-foreground/80 hover:text-foreground transition-colors px-2">
                Browse all 17 tools
                <ArrowRight className="size-4" />
              </a>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.2 }}
              className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
            >
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-primary" /> Browser-based</span>
              <span className="inline-flex items-center gap-1.5"><Trash2 className="size-4 text-accent" /> Auto-deleted</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="size-4 text-primary" /> No watermarks</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="size-4 text-primary" /> No signup</span>
            </motion.div>
          </div>

          {/* Hero visual */}
          <div className="lg:col-span-5 relative h-[420px] sm:h-[480px]">
            <FloatingPdf className="absolute top-4 left-4 sm:left-10 w-44 sm:w-52 animate-float" tag="Report.pdf" pages={12} accent="blue" />
            <FloatingPdf className="absolute top-24 right-2 sm:right-8 w-44 sm:w-52 animate-float-2" tag="Invoice.pdf" pages={3} accent="red" delay={1} />
            <FloatingPdf className="absolute bottom-6 left-1/2 -translate-x-1/2 w-52 sm:w-60" tag="Contract.pdf" pages={8} accent="ink" />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-8 w-3/4 rounded-full bg-primary/15 blur-2xl" />
          </div>
        </div>
      </section>

      {/* POPULAR WORKFLOWS — show the product, not just the parts */}
      <section className="py-24 border-t bg-surface/40">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Popular workflows"
            title="Real jobs, end to end."
            subtitle="Chain a few quiet tools together to finish the work you actually came for."
          />
          <div className="mt-14 grid md:grid-cols-3 gap-5">
            {WORKFLOWS.map((w) => (
              <motion.div
                key={w.name}
                {...fadeUp}
                className={cn(
                  "relative rounded-3xl border bg-card p-7 shadow-soft hover:shadow-lift transition-all overflow-hidden"
                )}
              >
                <div className={cn("absolute inset-0 -z-0 bg-gradient-to-br", w.accent)} />
                <div className="relative">
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{w.audience}</span>
                  <h3 className="mt-2 font-serif text-3xl text-balance">{w.name}</h3>

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    {w.steps.map((s, i) => (
                      <div key={s.to} className="flex items-center gap-2">
                        <Link
                          to={s.to}
                          className="inline-flex items-center gap-1.5 rounded-full bg-background border px-3 py-1.5 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
                        >
                          {s.label}
                        </Link>
                        {i < w.steps.length - 1 && <ArrowRight className="size-3.5 text-muted-foreground" />}
                      </div>
                    ))}
                  </div>

                  <Link
                    to={w.steps[0].to}
                    className="mt-7 inline-flex items-center gap-1 text-sm font-medium text-primary"
                  >
                    Start this workflow <ArrowRight className="size-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS GRID with category nav */}
      <section id="tools" className="py-24">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Every PDF task"
            title="One quiet workspace."
            subtitle="Each tool is focused, fast, and tuned to do one thing exceptionally well."
          />

          {/* Category nav */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                aria-pressed={category === c.id}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  category === c.id
                    ? "bg-ink text-ink-foreground border-ink"
                    : "bg-card hover:bg-secondary text-foreground/80"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Enhanced tool cards */}
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((t) => {
              const Icon = t.icon;
              const meta = TOOL_META[t.slug];
              return (
                <motion.div key={t.slug} {...fadeUp}>
                  <Link
                    to={`/tools/${t.slug}`}
                    className="group flex h-full flex-col rounded-2xl border bg-card p-6 shadow-soft hover:shadow-lift hover:-translate-y-0.5 hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        "grid place-items-center size-11 rounded-xl transition-colors",
                        t.accent === "blue"
                          ? "bg-primary-soft text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                          : "bg-accent-soft text-accent group-hover:bg-accent group-hover:text-accent-foreground"
                      )}>
                        <Icon className="size-5" strokeWidth={1.8} />
                      </div>
                      {meta?.time && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-secondary rounded-full px-2 py-1">
                          <Clock className="size-3" /> {meta.time}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-5 font-medium text-base">{t.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{t.short}</p>

                    {meta?.useCase && (
                      <p className="mt-4 text-xs text-foreground/70 border-t pt-3">
                        <span className="font-medium">Typical use:</span> {meta.useCase}
                      </p>
                    )}

                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-70 group-hover:opacity-100 transition-opacity">
                      Open tool <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRUST — dedicated, prominent */}
      <section className="py-28 bg-ink text-ink-foreground">
        <div className="container-px mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Trust</span>
              <h2 className="mt-4 font-serif text-5xl md:text-6xl text-balance leading-[1]">
                Your files never leave your device.
              </h2>
              <p className="mt-6 text-white/70 text-lg leading-relaxed">
                Core tools run entirely in your browser. We don't see, store, log, or train on your documents.
                The few server-assisted tools delete uploads automatically within minutes.
              </p>
              <Link
                to="/privacy"
                className="mt-7 inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium"
              >
                Read the full trust policy <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {[
                { i: ShieldCheck, t: "Browser-based core",  d: "Merge, split, compress, rotate and protect run locally using WASM." },
                { i: ServerOff,   t: "Zero permanent storage", d: "Nothing is saved, indexed, or shared with third parties — ever." },
                { i: Lock,        t: "TLS + ephemeral memory", d: "Server-assisted tools use TLS in transit and sealed RAM only." },
                { i: Trash2,      t: "Auto-delete in minutes",  d: "Anything we touch is shredded within minutes, automatically." },
              ].map((c) => (
                <motion.div key={c.t} {...fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="grid place-items-center size-10 rounded-xl bg-white/10">
                    <c.i className="size-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-5 font-medium">{c.t}</h3>
                  <p className="mt-1.5 text-sm text-white/60 leading-relaxed">{c.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW (kept, lightly tightened) */}
      <section className="py-24 bg-surface">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="How it feels"
            title="Three quiet steps. No friction."
            subtitle="A typical silentPDF flow takes under 30 seconds, end to end."
          />
          <div className="mt-14 grid md:grid-cols-3 gap-5">
            {[
              { i: Combine,  t: "Pick a tool", d: "Search or browse 17 focused PDF tools." },
              { i: Minimize2, t: "Drop your file", d: "Files stay in your browser — no upload." },
              { i: CheckCircle2, t: "Download", d: "Get a clean, watermark-free result." },
            ].map((s, idx) => (
              <motion.div key={s.t} {...fadeUp} className="relative rounded-2xl bg-card border p-7 shadow-soft">
                <span className="text-xs font-medium text-muted-foreground">Step {idx + 1}</span>
                <div className="mt-4 grid place-items-center size-11 rounded-xl bg-ink text-ink-foreground">
                  <s.i className="size-5" strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 font-serif text-2xl">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                {idx < 2 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-3 size-5 text-muted-foreground/50" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="py-24">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeading eyebrow="Use cases" title="Built for real work." subtitle="Hand-tuned for the people who deal with documents every day." />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { i: GraduationCap, t: "Students", d: "Combine lecture notes, trim readings, hand in clean PDFs." },
              { i: Briefcase, t: "Freelancers", d: "Send proposals and invoices that look the way you mean them to." },
              { i: Users, t: "HR Teams", d: "Process onboarding packets without leaking personal data." },
              { i: BookOpen, t: "Teachers", d: "Bundle class material into single, neat handouts." },
              { i: Building2, t: "Small businesses", d: "Compress, sign, and ship contracts in seconds." },
            ].map((u) => (
              <motion.div key={u.t} {...fadeUp} className="rounded-2xl border bg-card p-6 hover:shadow-lift transition-shadow">
                <div className="grid place-items-center size-10 rounded-xl bg-primary-soft text-primary">
                  <u.i className="size-5" strokeWidth={1.8} />
                </div>
                <h3 className="mt-5 font-medium">{u.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{u.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GUIDES */}
      <section className="py-24 bg-surface/40">
        <div className="container-px mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading eyebrow="Guides" title="Sharpen your PDF workflow." subtitle="Editorial how-tos written by the team." className="!text-left !mx-0" />
            <Link to="/guides" className="hidden sm:inline-flex items-center gap-1 text-sm text-primary">All guides <ArrowRight className="size-4" /></Link>
          </div>
          <div className="mt-14 grid md:grid-cols-3 gap-5">
            {GUIDES.map((g) => (
              <motion.article key={g.title} {...fadeUp} className="group rounded-2xl border bg-card overflow-hidden hover:shadow-lift transition-all">
                <div className={cn("aspect-[16/10] grid place-items-center", g.bg)}>
                  <FileText className="size-12 text-white/80" strokeWidth={1.4} />
                </div>
                <div className="p-6">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{g.category}</span>
                  <h3 className="mt-2 font-serif text-2xl leading-tight">{g.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{g.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read guide <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <HomeFaq />

      {/* CTA */}
      <section className="py-24">
        <div className="container-px mx-auto max-w-5xl">
          <div className="rounded-3xl bg-ink text-ink-foreground p-10 md:p-16 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 size-80 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -left-10 -bottom-20 size-80 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative">
              <h2 className="font-serif text-4xl md:text-5xl text-balance max-w-2xl">Quiet tools. Real results. No nonsense.</h2>
              <p className="mt-4 text-white/70 max-w-xl">Try silentPDF on your next document — it's free, private, and ready when you are.</p>
              <Link to="/tools" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white text-ink px-5 py-3 text-sm font-medium hover:bg-white/90 transition-colors">
                Start with any tool <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export const GUIDES = [
  { title: "How to merge PDFs without losing quality", excerpt: "The right way to combine documents and keep fonts, images, and layout intact.", category: "Tutorial", bg: "bg-gradient-to-br from-primary to-primary/70" },
  { title: "Compress PDFs for email attachments", excerpt: "Practical tactics to slim down PDFs before they bounce off a 25 MB inbox cap.", category: "Workflow", bg: "bg-gradient-to-br from-accent to-accent/70" },
  { title: "The best PDF workflow for students", excerpt: "Lecture notes to final submissions — one clean pipeline that won't fail you at 2am.", category: "Guide", bg: "bg-gradient-to-br from-ink to-slate-700" },
];

const SectionHeading = ({ eyebrow, title, subtitle, className }: { eyebrow: string; title: string; subtitle?: string; className?: string }) => (
  <div className={cn("max-w-2xl mx-auto text-center", className)}>
    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</span>
    <h2 className="mt-3 font-serif text-4xl md:text-5xl text-balance">{title}</h2>
    {subtitle && <p className="mt-4 text-muted-foreground text-lg">{subtitle}</p>}
  </div>
);

const FloatingPdf = ({ className, tag, pages, accent, delay = 0 }: { className?: string; tag: string; pages: number; accent: "blue" | "red" | "ink"; delay?: number }) => {
  const accentClasses = accent === "blue" ? "bg-primary" : accent === "red" ? "bg-accent" : "bg-ink";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={cn("rounded-2xl bg-card border shadow-lift p-4 aspect-[3/4]", className)}
    >
      <div className="flex items-center justify-between">
        <div className={cn("grid place-items-center size-7 rounded-md text-white", accentClasses)}>
          <FileText className="size-3.5" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">{pages} pages</span>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-1.5 w-3/4 rounded-full bg-secondary" />
        <div className="h-1.5 w-full rounded-full bg-secondary" />
        <div className="h-1.5 w-5/6 rounded-full bg-secondary" />
        <div className="h-1.5 w-2/3 rounded-full bg-secondary" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-sm bg-secondary/70" />
        ))}
      </div>
      <div className="mt-3 text-[11px] font-medium text-foreground truncate">{tag}</div>
    </motion.div>
  );
};

export default Home;
