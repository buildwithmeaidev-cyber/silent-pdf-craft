import LegalLayout from "./LegalLayout";
import { ShieldCheck, Cpu, ServerOff, Lock, Bug, Clock } from "lucide-react";

const pillars = [
  { i: ShieldCheck, t: "Browser sandbox", d: "Core tools run inside your browser's WASM sandbox. There's no network step for the file itself." },
  { i: ServerOff, t: "No persistent storage", d: "Server-assisted conversions live in RAM only and are wiped within 10 minutes." },
  { i: Lock, t: "TLS 1.3 everywhere", d: "All non-file traffic (page loads, analytics events) is encrypted with modern cipher suites." },
  { i: Cpu, t: "Isolated workers", d: "Each server-side conversion runs in its own container with no shared filesystem." },
  { i: Bug, t: "Continuous scanning", d: "Weekly SCA and dependency scanning; critical CVEs patched within 72 hours." },
  { i: Clock, t: "24h abuse metadata", d: "Only IP + user agent, kept 24 hours strictly for abuse prevention, then deleted." },
];

export default function Security() {
  return (
    <LegalLayout
      title="Security"
      intro="How silentPDF is designed so your documents stay yours — and what to do if you find a vulnerability."
      updated="July 2026"
      seoTitle="Security at silentPDF — How Your PDFs Stay Private"
      metaDescription="silentPDF security overview: browser sandbox, no persistent storage, TLS 1.3, isolated workers, and a working vulnerability disclosure program."
    >
      <div className="not-prose grid sm:grid-cols-2 gap-4 my-8">
        {pillars.map((p) => (
          <div key={p.t} className="rounded-2xl border bg-card p-5">
            <div className="grid place-items-center size-10 rounded-xl bg-primary/10 text-primary">
              <p.i className="size-5" />
            </div>
            <h3 className="mt-4 font-medium">{p.t}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{p.d}</p>
          </div>
        ))}
      </div>

      <h2>Threat model</h2>
      <p>We design silentPDF for the common case: a user with a sensitive PDF (a contract, an ID scan, a medical record) who doesn't want to upload it to a random website. The browser-first architecture removes the biggest class of risk — the file simply never leaves your device for core tools.</p>

      <h2>Server-assisted tools</h2>
      <p>A small number of tools (currently PDF ↔ Word) need heavier compute than a browser can offer. For those, the file is streamed over TLS 1.3 to an isolated worker, held in RAM, processed, and the buffer is destroyed. Nothing is written to disk or logged.</p>

      <h2>Vulnerability disclosure</h2>
      <p>Found a security issue? Please email <a href="mailto:security@silentpdf.app">security@silentpdf.app</a> with a description and steps to reproduce. We'll acknowledge within 48 hours and keep you posted through remediation. We don't currently pay bounties, but every valid report gets a public credit (with your permission) in our changelog.</p>

      <h2>Content Security Policy</h2>
      <p>silentPDF ships a strict CSP: no third-party scripts in the document-processing path, no inline eval, and hashed inline styles only. Analytics is first-party and does not set cross-site cookies.</p>

      <h2>Not a certification</h2>
      <p>This page describes controls that are actually in place today. It is not a SOC 2, ISO 27001, or HIPAA attestation. If your compliance team needs formal evidence, email <a href="mailto:hello@silentpdf.app">hello@silentpdf.app</a> and we'll share what we can.</p>
    </LegalLayout>
  );
}
