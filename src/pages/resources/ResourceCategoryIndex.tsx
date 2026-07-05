import { useParams, Navigate, Link } from "react-router-dom";
import { RESOURCES } from "@/content/resources";
import { ResourceCategory } from "@/content/ContentAsset";
import Breadcrumbs from "@/core/Breadcrumbs";
import { ArrowRight } from "lucide-react";

export default function ResourceCategoryIndex() {
  const { category } = useParams();
  
  const validCategories = ["blog", "guides", "comparisons", "checklists", "templates", "glossary", "use-cases"];
  
  if (!category || !validCategories.includes(category)) {
    return typeof window !== "undefined" ? <Navigate to="/resources" replace /> : null;
  }
  
  const categoryAssets = RESOURCES.filter(r => r.category === category as ResourceCategory);
  const title = category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ");

  return (
    <div className="bg-[#f5f7fb] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
        <Breadcrumbs current={title} />
        
        <header className="mt-6 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl">
            Explore our collection of PDF {title.toLowerCase()} to master document management.
          </p>
        </header>

        {categoryAssets.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <h2 className="text-xl font-semibold text-slate-900">Coming soon</h2>
            <p className="mt-2 text-slate-600">We're actively publishing new {title.toLowerCase()}. Check back shortly.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryAssets.map(asset => (
              <Link
                key={asset.slug}
                to={`/resources/${category}/${asset.slug}`}
                className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-blue-600/20"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {asset.title}
                  </h3>
                  <p className="mt-3 text-slate-600 line-clamp-3">
                    {asset.metaDescription}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-600">
                  Read more <ArrowRight className="size-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
