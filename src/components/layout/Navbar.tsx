import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowUpRight, FileText, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "Tools" },
  { to: "/blog", label: "Blog" },
  { to: "/guides", label: "Guides" },
  { to: "/use-cases", label: "Use Cases" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container-px mx-auto flex h-16 max-w-7xl items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-base font-semibold">SilentPDF</span>
            <span className="text-[11px] text-muted-foreground">
              Professional PDF Tools
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex lg:gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/tools"
            className="group inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
          >
            Start Editing PDFs
            <ArrowUpRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background/80 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-2xl md:hidden">
          <div className="container-px mx-auto flex flex-col gap-2 py-5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            <Link
              to="/tools"
              onClick={() => setMobileOpen(false)}
              className="mt-3 inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
            >
              Start Editing PDFs
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
