import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import Breadcrumbs from "@/core/Breadcrumbs";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export default function ToolLayout({
  title,
  description,
  children,
  icon,
}: Props) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        {/* Breadcrumbs */}
        <Breadcrumbs current={title} />

        {/* Back Button */}
        <Link
          to="/tools"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All Tools
        </Link>

        {/* Header */}
        <div className="mb-10 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 shadow-sm">
              {icon || (
                <div className="text-2xl font-bold">
                  PDF
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
                {title}
              </h1>

              {description && (
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 pb-16">
          {children}
        </div>
      </div>
    </div>
  );
}