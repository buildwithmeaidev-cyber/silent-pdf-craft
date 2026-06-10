import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Seo } from "@/components/Seo";
import ToolSeoSections from "@/components/seo/ToolSeoSections";

export const SiteLayout = () => {
  const { pathname } = useLocation();
  const toolMatch = pathname.match(/^\/tools\/([^/]+)\/?$/);
  const toolSlug = toolMatch ? toolMatch[1] : null;

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
