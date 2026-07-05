import LegalLayout from "./LegalLayout";
import { Mail, MessageCircle, Bug, ShieldAlert } from "lucide-react";

const channels = [
  { i: Mail, label: "General & feedback", email: "hello@silentpdf.app", desc: "Product questions, feedback, press." },
  { i: MessageCircle, label: "Support", email: "support@silentpdf.app", desc: "A tool didn't work? Send us the file details (not the file itself) and browser." },
  { i: Bug, label: "Bug reports", email: "bugs@silentpdf.app", desc: "Something broken? Include steps to reproduce." },
  { i: ShieldAlert, label: "Security", email: "security@silentpdf.app", desc: "Responsible disclosure — 48-hour acknowledgement." },
];

export default function Contact() {
  return (
    <LegalLayout
      title="Contact silentPDF"
      intro="No ticketing system, no chatbot. Just a small team and a working inbox."
      updated="July 2026"
      seoTitle="Contact silentPDF — Support, Security, and Feedback"
      metaDescription="Reach the silentPDF team. Support, bug reports, security disclosure, and general feedback channels."
    >
      <div className="not-prose grid sm:grid-cols-2 gap-4 my-8">
        {channels.map((c) => (
          <a
            key={c.email}
            href={`mailto:${c.email}`}
            className="rounded-2xl border bg-card p-5 hover:border-primary/40 hover:shadow-lift transition-all"
          >
            <div className="grid place-items-center size-10 rounded-xl bg-primary/10 text-primary">
              <c.i className="size-5" />
            </div>
            <h3 className="mt-4 font-medium">{c.label}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{c.desc}</p>
            <p className="mt-3 text-sm font-medium text-primary">{c.email}</p>
          </a>
        ))}
      </div>

      <h2>Response times</h2>
      <p>We reply to most emails within two business days. Security disclosures get a 48-hour acknowledgement. If you don't hear back after five business days, please resend — sometimes messages get eaten by spam filters.</p>

      <h2>What we can't help with</h2>
      <ul>
        <li>Recovering a specific file — because we don't store any, we can't retrieve one for you.</li>
        <li>Password recovery on protected PDFs — that's cryptographic, not something we can bypass.</li>
        <li>Custom conversion consulting — try the tools first and email us if a specific one falls short.</li>
      </ul>
    </LegalLayout>
  );
}
