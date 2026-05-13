import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

type SiteLayoutProps = {
  children: ReactNode;
};

export const SiteLayout = ({ children }: SiteLayoutProps) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);
