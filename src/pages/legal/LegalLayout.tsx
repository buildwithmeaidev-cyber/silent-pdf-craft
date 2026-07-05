import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Mail } from "lucide-react";

const LEGAL_LINKS = [
  { to: "/privacy", label: "Privacy" },
  { to: "/security", label: "Security" },
  { to: "/terms", label: "Terms" },
  { to: "/dpa", label: "DPA" },
  { to: "/cookies", label: "Cookies" },
  { to: "/contact", label: "Contact" },
];

export default function LegalLayout({
  title,
  intro,
  updated,
  children,
  seoTitle,
  metaDescription,
}: {
  title: string;
  intro: string;
  updated: string;
  children: ReactNode;
  seoTitle?: string;
  metaDescription?: string;
}) {
  return (
    <div className="bg-background text-foreground">
      <Helmet>
        <title>{seoTitle ?? `${title} — silentPDF`}</title>
        <meta name="description" content={metaDescription ?? intro} />
      </Helmet>
      <div className="container-px mx-auto max-w-5xl py-14 md:py-20 grid lg:grid-cols-[220px_1fr] gap-12">
        <aside className="lg:sticky lg:top-24 self-start">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Legal & Trust</p>
          <nav className="mt-4 flex lg:flex-col gap-1 flex-wrap">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <a
            href="mailto:hello@silentpdf.app"
            className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Mail className="size-4" /> hello@silentpdf.app
          </a>
        </aside>

        <article>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Legal</p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl leading-tight text-balance">{title}</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{intro}</p>
          <p className="mt-2 text-xs text-muted-foreground">Last updated: {updated}</p>

          <div className="mt-10 prose prose-slate dark:prose-invert max-w-none prose-h2:font-serif prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-3 prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
            {children}
          </div>

          <div className="mt-14 rounded-2xl border bg-card p-6 flex items-start gap-4">
            <div className="grid place-items-center size-10 rounded-xl bg-primary/10 text-primary shrink-0">
              <Mail className="size-5" />
            </div>
            <div>
              <p className="font-medium">Questions about this document?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Email <a className="text-primary hover:underline" href="mailto:hello@silentpdf.app">hello@silentpdf.app</a> and we'll respond within two business days.
              </p>
              <Link to="/contact" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open contact page <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
