import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { POSTS } from "@/content/blog/posts";
import Breadcrumbs from "@/core/Breadcrumbs";

const CLUSTER_LABEL: Record<string, string> = {
  compress: "Compress",
  merge: "Merge",
  convert: "Convert",
  security: "Security",
};

export default function Blog() {
  const sorted = [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className="bg-[#f5f7fb] min-h-screen">
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-12 md:py-16">
        <Breadcrumbs current="Blog" />

        <header className="mt-6 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            PDF guides & how-tos
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Practical posts about compressing, merging, converting, and protecting PDFs — written for real situations, not search engines.
          </p>
        </header>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {sorted.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 md:p-7 transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                  {CLUSTER_LABEL[post.cluster]}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="h-3.5 w-3.5" /> {post.readMinutes} min read
                </span>
              </div>

              <h2 className="mt-4 text-xl md:text-2xl font-bold text-slate-900 group-hover:text-blue-700 leading-snug">
                {post.title}
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed flex-1">
                {post.excerpt}
              </p>

              <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                Read post <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
