import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Breadcrumbs from "@/core/Breadcrumbs";
import { TemplateGrid } from "@/components/templates/TemplateGrid";
import { PDF_TEMPLATES, type PdfTemplate } from "@/lib/templatePdfs";

const CATEGORY_LABELS: Record<PdfTemplate["category"], string> = {
  Career: "Career PDF templates",
  Business: "Business PDF templates",
  Legal: "Legal PDF templates",
};

export default function TemplatesCategory() {
  const { category = "" } = useParams();
  const normalized = category.toLowerCase();
  const match = (Object.keys(CATEGORY_LABELS) as PdfTemplate["category"][]).find(
    (item) => item.toLowerCase() === normalized,
  );
  const templates = match ? PDF_TEMPLATES.filter((template) => template.category === match) : [];

  if (!match) {
    return (
      <div className="container-px mx-auto max-w-2xl py-24 text-center">
        <h1 className="font-serif text-4xl">Template category not found</h1>
        <Link to="/templates" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="size-4" /> Browse all templates
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-px mx-auto max-w-7xl py-12 md:py-16">
        <Breadcrumbs current={CATEGORY_LABELS[match]} />
        <header className="mt-8 mb-10 max-w-3xl">
          <Link to="/templates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> All templates
          </Link>
          <h1 className="mt-6 font-serif text-5xl leading-tight text-balance">{CATEGORY_LABELS[match]}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Download a ready-to-fill {match.toLowerCase()} template. Every PDF is generated locally when you click download.
          </p>
        </header>
        <TemplateGrid templates={templates} />
      </div>
    </div>
  );
}