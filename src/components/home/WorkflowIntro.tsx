// src/components/home/WorkflowIntro.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * Visual summary of the silentPDF workflow shown on the Home page.
 * Uses a glass‑morphism card that adapts to dark mode via CSS variables.
 */
export default function WorkflowIntro() {
  return (
    <section className="container-px mx-auto max-w-7xl py-16">
      <motion.div
        className="glass-panel rounded-2xl p-8 shadow-soft"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-serif text-4xl md:text-5xl text-balance mb-6">
          How the workflow works
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
          Choose a tool, drop your PDF(s), adjust any options, and let silentPDF process
          everything locally in your browser. When the job finishes you can download the
          result instantly – no upload, no server, complete privacy.
        </p>
        <ul className="grid md:grid-cols-3 gap-6 mb-8">
          <li className="flex items-start gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              1
            </span>
            <span>Select a tool</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              2
            </span>
            <span>Upload / configure</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              3
            </span>
            <span>Download result</span>
          </li>
        </ul>
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try now
          <ArrowRight className="size-5" />
        </Link>
      </motion.div>
    </section>
  );
}
