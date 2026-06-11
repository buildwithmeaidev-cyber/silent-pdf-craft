import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight, ShieldCheck, ServerOff, Lock, Trash2, Sparkles,
  GraduationCap, Briefcase, Users, BookOpen, Building2, ArrowRight, FileText,
  Combine, Minimize2, Lock as LockIcon,
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

const Home = () => {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 grid-bg [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div className="container-px responsive-container mx-auto max-w-7xl pt-16 md:pt-24 pb-20 md:pb-32 grid lg:grid-cols-12 responsive-grid items-center">
          <div className="lg:col-span-7">
            <motion.div {...fadeUp} className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Privacy-first PDF tools, made for daily work
            </motion.div>

            <motion.h1 {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="mt-6 font-serif text-5xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-tight text-balance">
              Fast, private PDF tools <span className="italic text-primary">that actually work.</span>
            </motion.h1>

            <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="mt-6 text-lg text-muted-foreground max-w-xl">
              Merge, compress, split, convert, and protect PDFs directly in your browser.
              High-quality results, no email required, no permanent storage.
            </motion.p>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }} className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/tools/merge-pdf" className="group responsive-button inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 text-sm font-medium shadow-blue hover:shadow-lift transition-all">
                Upload PDF
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link to="/tools" className="responsive-button inline-flex items-center gap-2 rounded-full border bg-card px-5 text-sm font-medium hover:bg-secondary transition-all">
                Explore Tools
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }} className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-primary" /> Browser-based</span>
              <span className="inline-flex items-center gap-1.5"><Trash2 className="size-4 text-accent" /> Auto-deleted</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="size-4 text-primary" /> No watermarks</span>
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

      {/* TOOLS GRID */}
      <section id="tools" className="responsive-section">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Silent tools"
            title="Every PDF task, one quiet workspace."
            subtitle="Every tool is focused with pricvacy in head, each tuned to do one thing exceptionally well."
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 responsive-grid">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <motion.div key={t.slug} {...fadeUp}>
                  <Link
                    to={`/tools/${t.slug}`}
                    className="group block h-full rounded-2xl border bg-card responsive-card shadow-soft hover:shadow-lift hover:-translate-y-1 hover:border-primary/40 transition-all"
                  >
                    <div className={cn(
                      "grid place-items-center size-11 rounded-xl mb-5 transition-colors",
                      t.accent === "blue" ? "bg-primary-soft text-primary group-hover:bg-primary group-hover:text-primary-foreground" : "bg-accent-soft text-accent group-hover:bg-accent group-hover:text-accent-foreground"
                    )}>
                      <Icon className="size-5" strokeWidth={1.8} />
                    </div>
                    <h3 className="font-medium text-base">{t.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{t.short}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Open tool <ArrowRight className="size-3.5" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="py-20 bg-surface">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Workflow"
            title="From cluttered files to a single, secure PDF."
            subtitle="A typical silentPDF flow takes under 30 seconds."
          />
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {[
              { i: Combine, t: "Merge", d: "Drop several PDFs in your preferred order." },
              { i: Minimize2, t: "Compress", d: "Shrink the result for email or storage." },
              { i: LockIcon, t: "Protect", d: "Seal the final file with privacy metadata." },
            ].map((s, idx) => (
              <motion.div key={s.t} {...fadeUp} className="relative rounded-2xl bg-card border p-6 shadow-soft">
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
          <motion.div {...fadeUp} className="mt-10 text-center">
            <Link
              to="/tools/merge-pdf"
              className="group inline-flex items-center gap-2 rounded-full bg-ink text-ink-foreground px-6 py-3 text-sm font-medium shadow-lift hover:opacity-90 transition-all"
            >
              Start now
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-24 bg-ink text-ink-foreground">
        <div className="container-px mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Privacy</span>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl text-balance">Privacy first, by design.</h2>
            <p className="mt-4 text-white/70">
              Your files belong to you. silentPDF is engineered so that, in most cases, your documents never leave your device.
            </p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { i: ShieldCheck, t: "Browser-based processing", d: "Core tools run entirely in your browser using local memory." },
              { i: ServerOff, t: "No permanent storage", d: "Nothing is saved, indexed, or shared with third parties." },
              { i: Lock, t: "Secure encryption", d: "Server-assisted tools use TLS and ephemeral, sealed processing." },
              { i: Trash2, t: "Auto file deletion", d: "Anything we touch is shredded within minutes, automatically." },
            ].map((c) => (
              <motion.div key={c.t} {...fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="grid place-items-center size-10 rounded-xl bg-white/10">
                  <c.i className="size-5" strokeWidth={1.8} />
                </div>
                <h3 className="mt-5 font-medium">{c.t}</h3>
                <p className="mt-1.5 text-sm text-white/60">{c.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="py-24">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeading eyebrow="Use cases" title="Built for real work." subtitle="Hand-tuned for the people who deal with documents every day." />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

      {/* STATS */}
      <section className="py-20 border-y bg-surface">
        <div className="container-px mx-auto max-w-7xl grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            ["2.4M+", "PDFs processed"],
            ["180k", "Active users"],
            ["100%", "Browser-based core"],
            ["16", "Focused tools"],
          ].map(([k, v]) => (
            <div key={v} className="text-center sm:text-left">
              <div className="font-serif text-5xl">{k}</div>
              <div className="mt-1 text-sm text-muted-foreground">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GUIDES */}
      <section className="py-24">
        <div className="container-px mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading eyebrow="Guides" title="Sharpen your PDF workflow." subtitle="Editorial how-tos written by the team." className="!text-left" />
            <Link to="/guides" className="hidden sm:inline-flex items-center gap-1 text-sm text-primary">All guides <ArrowRight className="size-4" /></Link>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
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
    {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
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
