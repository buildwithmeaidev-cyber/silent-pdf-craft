import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDF_TEMPLATES, downloadTemplatePdf, type PdfTemplate } from "@/lib/templatePdfs";

type Props = {
  templates?: PdfTemplate[];
};

export function TemplateGrid({ templates = PDF_TEMPLATES }: Props) {
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
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <article
          key={template.slug}
          className="flex min-h-[270px] flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
        >
          <div>
            <div className="flex items-center justify-between gap-4">
              <div className="grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary-soft text-primary">
                <FileText className="size-5" />
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                {template.category}
              </span>
            </div>
            <h2 className="mt-5 text-xl font-semibold text-foreground">{template.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{template.description}</p>
          </div>

          <Button
            type="button"
            onClick={() => handleDownload(template)}
            disabled={busy === template.slug}
            className="mt-6 w-full"
          >
            {busy === template.slug ? <Loader2 className="animate-spin" /> : <Download />}
            {busy === template.slug ? "Preparing PDF…" : "Download PDF"}
          </Button>
        </article>
      ))}
    </div>
  );
}