// src/components/home/WorkflowIntro.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MousePointerClick, Upload, Wand2, Download } from "lucide-react";

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Pick a workflow",
    body: "Choose a preset for your job — resume submission, legal delivery, invoice batch — or build a custom chain.",
  },
  {
    icon: Upload,
    title: "Drop your files once",
    body: "Upload happens a single time. Every step in the chain consumes the previous step's output automatically.",
  },
  {
    icon: Wand2,
    title: "Let it run in your browser",
    body: "Merge, compress, watermark, protect — every tool executes locally. Files never touch a server.",
  },
  {
    icon: Download,
    title: "Download the final file",
    body: "You get one clean result at the end, plus an inline preview and the option to feed it into another workflow.",
  },
];

export default function WorkflowIntro() {
  return (
    <section id="how-workflows-work" className="container-px mx-auto max-w-7xl py-24">
      <div className="max-w-2xl mx-auto text-center">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workflows</span>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl text-balance">
          How the workflow works
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Four steps from a raw file to the final PDF — with every step running privately in your browser.
        </p>
      </div>

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              className="relative rounded-2xl border bg-card p-6 shadow-soft"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between">
                <div className="grid place-items-center size-11 rounded-xl bg-primary-soft text-primary">
                  <Icon className="size-5" strokeWidth={1.8} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
              </div>
              <h3 className="mt-5 font-medium">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/workflows"
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 shadow-blue transition-colors"
        >
          Explore workflows
          <ArrowRight className="size-4" />
        </Link>
        <Link
          to="/workflows/custom"
          className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium hover:bg-secondary transition-colors"
        >
          Build a custom chain
        </Link>
      </div>
    </section>
  );
}
