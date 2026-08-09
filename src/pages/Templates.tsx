import { RESOURCES } from "@/content/resources";
import { ResourceCategory } from "@/content/ContentAsset";
import Breadcrumbs from "@/core/Breadcrumbs";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function TemplatesPage() {
  const category: ResourceCategory = "templates";
  const categoryAssets = RESOURCES.filter(r => r.category === category);
  const title = "Templates";

  return (
    <div className="bg-[#f5f7fb] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
        <Breadcrumbs current={title} />
        <header className="mt-6 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl">
            Explore premium PDF templates you can download and use instantly.
          </p>
        </header>
        {categoryAssets.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <h2 className="text-xl font-semibold text-foreground">Coming soon</h2>
            <p className="mt-2 text-muted-foreground">We're actively publishing new templates. Check back shortly.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryAssets.map(asset => (
              <Link
                key={asset.slug}
                to={`/resources/templates/${asset.slug}`}
                className="group flex flex-col justify-between rounded-2xl bg-card p-6 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-primary/20"
              >
                <div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {asset.title}
                  </h3>
                  <p className="mt-3 text-muted-foreground line-clamp-3">
                    {asset.metaDescription}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary">
                  View Template <ArrowRight className="size-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
