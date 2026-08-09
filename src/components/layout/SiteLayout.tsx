import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Seo } from "@/components/Seo";
import ToolSeoSections from "@/components/seo/ToolSeoSections";
import { TOOLS } from "@/lib/tools";
import { useUpload } from "@/context/UploadContext";

export const SiteLayout = () => {
  const { pathname } = useLocation();
  const { clearFiles, setError } = useUpload();
  const rawSlug = pathname.slice(1).replace(/\/$/, "");
  const isValidTool = TOOLS.some((t) => t.slug === rawSlug);
  const toolSlug = isValidTool ? rawSlug : null;

  // Never carry an uploaded file across routes — each tool starts empty.
  useEffect(() => {
    clearFiles();
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);



  return (
    <div className="min-h-screen w-full max-w-full flex flex-col bg-background text-foreground">
      <Seo />
      <Navbar />
      <main className="flex-1 w-full max-w-full">
        <Outlet />
        {toolSlug && <ToolSeoSections slug={toolSlug} />}
      </main>
      <Footer />
    </div>
  );
};
