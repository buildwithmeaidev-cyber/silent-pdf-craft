import { Link } from "react-router-dom";
import Breadcrumbs from "@/core/Breadcrumbs";
import { TemplateGrid } from "@/components/templates/TemplateGrid";
import { PDF_TEMPLATES } from "@/lib/templatePdfs";

export default function TemplatesPage() {
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
          <div className="mt-6 flex flex-wrap gap-2">
            {["Career", "Business", "Legal"].map((category) => (
              <Link key={category} to={`/templates/${category.toLowerCase()}`} className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground">
                {category}
              </Link>
            ))}
          </div>
        </header>

        <TemplateGrid templates={PDF_TEMPLATES} />
      </div>
    </div>
  );
}
