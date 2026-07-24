import { Link } from "react-router-dom";
import { FileText, CheckSquare, Layers, FileCode } from "lucide-react";
import Breadcrumbs from "@/core/Breadcrumbs";

const CATEGORIES = [
  { name: "Comparisons", slug: "comparisons", desc: "Detailed tool comparisons", icon: Layers },
  { name: "Checklists", slug: "checklists", desc: "PDF workflow standards", icon: CheckSquare },
  { name: "Templates", slug: "templates", desc: "Standard PDF layouts", icon: FileCode },
  { name: "Glossary", slug: "glossary", desc: "PDF terminology explained", icon: FileText },
  { name: "Blog", slug: "blog", desc: "Insights and updates", icon: FileText },
  { name: "Guides", slug: "guides", desc: "Step‑by‑step PDF tutorials", icon: FileText },
  { name: "Use Cases", slug: "use-cases", desc: "Real‑world applications", icon: FileText },
];

export default function ResourceIndex() {
  return (
    <div className="bg-[#f5f7fb] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
        <Breadcrumbs current="Resources" />
        <header className="mt-6 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Resource Center
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl">
            The most comprehensive PDF knowledge base on the internet. Master your documents with guides, comparisons, and industry resources.
          </p>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/resources/${c.slug}`}
              className="group relative flex flex-col items-start rounded-2xl bg-white p-8 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-blue-600/20"
            >
              <div className="rounded-xl bg-blue-50 p-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <c.icon className="size-6" />
              </div>
              <h2 className="mt-6 text-xl font-bold text-slate-900">{c.name}</h2>
              <p className="mt-2 text-slate-600">{c.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
