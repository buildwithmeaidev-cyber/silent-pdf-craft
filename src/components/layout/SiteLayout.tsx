import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Seo } from "@/components/Seo";

export const SiteLayout = () => (
  <div className="min-h-screen w-full max-w-full flex flex-col">
    <Seo />
    <Navbar />
    <main className="flex-1 w-full max-w-full">
      <Outlet />
    </main>
    <Footer />
  </div>
);
