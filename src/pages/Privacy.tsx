import { ShieldCheck, ServerOff, Lock, Trash2 } from "lucide-react";

const Privacy = () => (
  <div className="container-px mx-auto max-w-3xl py-16 md:py-24">
    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Privacy</span>
    <h1 className="mt-3 font-serif text-5xl md:text-6xl leading-tight text-balance">Your files, your business.</h1>
    <p className="mt-4 text-lg text-muted-foreground">
      silentPDF was built to do one job — handle PDFs without becoming part of your data trail.
    </p>

    <div className="mt-12 grid sm:grid-cols-2 gap-4">
      {[
        { i: ShieldCheck, t: "Browser-based by default", d: "Merge, split, rotate, compress, and trim PDFs all run locally in your browser. We never see your file." },
        { i: ServerOff, t: "Nothing kept", d: "We don't store, log, index, or sell your documents. Period." },
        { i: Lock, t: "Encrypted in transit", d: "When server-side processing is required, files travel over TLS and are sealed in ephemeral memory." },
        { i: Trash2, t: "Auto-deletion", d: "Anything we touch is destroyed within minutes — automatically, with no manual cleanup needed." },
      ].map((p) => (
        <div key={p.t} className="rounded-2xl border bg-card p-6">
          <div className="grid place-items-center size-10 rounded-xl bg-primary-soft text-primary">
            <p.i className="size-5" strokeWidth={1.8} />
          </div>
          <h2 className="mt-5 font-medium">{p.t}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{p.d}</p>
        </div>
      ))}
    </div>

    <div className="mt-14 prose prose-slate max-w-none">
      <h2 className="font-serif">What we collect</h2>
      <p>Anonymous, aggregated usage events (e.g. "merge tool opened") to understand which tools matter. No file contents, no filenames, no identifiers tied to your documents.</p>
      <h2 className="font-serif">Third parties</h2>
      <p>silentPDF does not share document contents with any third party. Server-assisted conversions are processed by our own infrastructure under the same retention rules.</p>
      <h2 className="font-serif">Contact</h2>
      <p>Questions or concerns? Reach us at <a href="mailto:hello@silentpdf.app" className="text-primary">hello@silentpdf.app</a>.</p>
    </div>
  </div>
);

export default Privacy;
