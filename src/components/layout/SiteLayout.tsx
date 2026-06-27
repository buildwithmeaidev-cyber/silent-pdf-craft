import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Seo } from "@/components/Seo";
import ToolSeoSections from "@/components/seo/ToolSeoSections";
import { TOOLS } from "@/lib/tools";

export const SiteLayout = () => {
  const { pathname } = useLocation();
  const rawSlug = pathname.slice(1).replace(/\/$/, ""); // Remove leading and trailing slash
  const isValidTool = TOOLS.some((t) => t.slug === rawSlug);
  const toolSlug = isValidTool ? rawSlug : null;

  return (
    <div className="min-h-screen w-full max-w-full flex flex-col">
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
