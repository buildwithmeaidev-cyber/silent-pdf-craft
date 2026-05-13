import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const SiteLayout = () => (
  <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col">
    <Navbar />
    <main className="flex-1 w-full max-w-full overflow-x-hidden">
      <Outlet />
    </main>
    <Footer />
  </div>
);
