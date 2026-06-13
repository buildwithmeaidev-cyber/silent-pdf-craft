import { ShieldCheck, ServerOff, Lock, Trash2, Eye, Cookie, FileCheck2, UserCheck, Mail } from "lucide-react";
import Seo from "@/components/Seo";

const pillars = [
  { i: ShieldCheck, t: "Browser-based by default", d: "Merge, split, rotate, compress, watermark and trim PDFs all run locally in your browser. The bytes never leave your machine." },
  { i: ServerOff, t: "Nothing kept", d: "We don't store, log, index, sell, or back up your documents. There is no 'recently uploaded' list, anywhere." },
  { i: Lock, t: "Encrypted in transit", d: "The few server-assisted conversions (OCR, image-heavy Office conversions) travel over TLS 1.3 and live only in ephemeral memory." },
  { i: Trash2, t: "Auto-deletion in minutes", d: "Any temporary buffer is destroyed within 10 minutes — automatically, with no manual cleanup needed." },
];

const sections = [
  {
    icon: Eye,
    title: "What we collect",
    body: "Anonymous, aggregated usage events — e.g. 'merge tool opened', 'compress completed'. Nothing about your files: no contents, no filenames, no page counts, no hashes. We also log standard web request metadata (IP, user agent) for 24 hours for abuse prevention, then it's gone.",
  },
  {
    icon: ServerOff,
    title: "What we never collect",
    body: "Document contents. Document filenames. Email addresses (we have no accounts). Payment data (the core tools are free). We do not fingerprint your device, and we do not sync anything to a profile.",
  },
  {
    icon: FileCheck2,
    title: "How uploads are handled",
    body: "For browser-based tools, your file is read into memory by your own browser using the File API and processed with WebAssembly. It is never POSTed to us. For the small number of conversions that require server compute (OCR, complex Office formats), the file is streamed over TLS, processed in an isolated worker, and the buffer is wiped immediately after the response is sent.",
  },
  {
    icon: Trash2,
    title: "Retention policy",
    body: "Browser-side files: never touched by us, so retention is zero. Server-assisted conversions: 10 minutes maximum on disk-backed temp storage, after which an automated job destroys the buffer. Output files are streamed back to you and are not retained.",
  },
  {
    icon: Lock,
    title: "Security measures",
    body: "TLS 1.3 in transit. Isolated per-job workers with no shared filesystem. No third-party analytics SDKs in the document processing path. We run automated dependency scans and patch critical vulnerabilities within 72 hours.",
  },
  {
    icon: Cookie,
    title: "Cookies & analytics",
    body: "We use a single first-party cookie to remember your theme preference. No advertising trackers, no Facebook pixel, no LinkedIn Insight. Aggregate usage is measured with a privacy-respecting analytics setup that does not set cross-site cookies and does not collect IP addresses.",
  },
  {
    icon: UserCheck,
    title: "Your rights",
    body: "Because we have no account system and store nothing tied to you, there is generally nothing to request, export, or delete. If you believe we hold data about you, email us and we'll investigate within 7 days under GDPR and CCPA timelines.",
  },
  {
    icon: Mail,
    title: "Contact & transparency",
    body: "Questions, security reports, or data requests: hello@silentpdf.app. We publish meaningful changes to this page with a dated changelog entry. Last updated: June 2026.",
  },
];

const Privacy = () => (
  <>
    <Seo
      title="Privacy & Trust Center — silentPDF AI"
      description="How silentPDF AI handles your files: browser-first processing, zero document storage, TLS in transit, and automatic deletion within minutes for any server-assisted job."
      canonical="/privacy"
    />
    <div className="container-px mx-auto max-w-3xl py-16 md:py-24">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Trust Center</span>
      <h1 className="mt-3 font-serif text-5xl md:text-6xl leading-tight text-balance">Your files, your business.</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        silentPDF was built to do one job — handle PDFs without becoming part of your data trail. Here's exactly how, in plain English.
      </p>

      <div className="mt-12 grid sm:grid-cols-2 gap-4">
        {pillars.map((p) => (
          <div key={p.t} className="rounded-2xl border bg-card p-6">
            <div className="grid place-items-center size-10 rounded-xl bg-primary-soft text-primary">
              <p.i className="size-5" strokeWidth={1.8} />
            </div>
            <h2 className="mt-5 font-medium">{p.t}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{p.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 space-y-10">
        {sections.map((s) => (
          <div key={s.title} className="border-t pt-8">
            <div className="flex items-start gap-4">
              <div className="grid place-items-center size-10 rounded-xl bg-primary-soft text-primary shrink-0">
                <s.icon className="size-5" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="font-serif text-2xl">{s.title}</h2>
                <p className="mt-2 text-base text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
        <p className="font-medium">Our standing commitment</p>
        <p className="mt-2 text-sm leading-relaxed">
          If we ever change how files are handled — for any tool, for any reason — we will say so on this page before the change ships, not after.
        </p>
      </div>
    </div>
  </>
);

export default Privacy;
