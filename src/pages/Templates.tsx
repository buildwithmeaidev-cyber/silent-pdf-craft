import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, FileText, Loader2 } from "lucide-react";
import Breadcrumbs from "@/core/Breadcrumbs";
import { PDF_TEMPLATES, downloadTemplatePdf, type PdfTemplate } from "@/lib/templatePdfs";

export default function TemplatesPage() {
  const [busy, setBusy] = useState<string | null>(null);

  const handleDownload = async (template: PdfTemplate) => {
    setBusy(template.slug);
    try {
      await downloadTemplatePdf(template);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
        <Breadcrumbs current="Templates" />

        <header className="mt-6 mb-12 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Free PDF templates you can download right now
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Each template is generated on your device the moment you click download — no email, no account,
            no server ever sees it. Open the file in any PDF editor, or run it through our{" "}
            <Link to="/edit-pdf" className="font-semibold text-primary underline-offset-4 hover:underline">
              PDF editor
            </Link>
            .
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PDF_TEMPLATES.map((template) => (
            <div
              key={template.slug}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {template.category}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-bold text-foreground">{template.name}</h2>
                <p className="mt-2 text-muted-foreground">{template.description}</p>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(template)}
                disabled={busy === template.slug}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {busy === template.slug ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
