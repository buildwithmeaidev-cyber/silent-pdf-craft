import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronDown, FileText, Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Tools",
    links: [
      { to: "/tools", label: "All PDF tools" },
      { to: "/pdf-editor", label: "PDF editor" },
      { to: "/merge-pdf-online", label: "Merge PDF online" },
    ],
  },
  {
    label: "Workflows",
    links: [
      { to: "/workflows", label: "Ready-made workflows" },
      { to: "/workflows/custom", label: "Build your own" },
    ],
  },
  {
    label: "Resources",
    links: [
      { to: "/templates", label: "Free templates" },
      { to: "/guides", label: "Guides" },
      { to: "/blog", label: "Blog" },
      { to: "/security", label: "Security & privacy" },
    ],
  },
];

const THEME_KEY = "silentpdf.theme";

function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return false;
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored) return stored === "dark";
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    try {
      const root = document.documentElement;
      root.classList.toggle("dark", isDark);
      localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    } catch {
      // ignore storage errors
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((v) => !v) };
}

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const { isDark, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/75 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container-px mx-auto flex h-16 max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-semibold">silentPDF</span>
            <span className="text-[11px] text-muted-foreground">Private PDF tools</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex lg:gap-2" aria-label="Primary navigation">
          {navGroups.map((group) => (
            <div key={group.label} className="relative">
              <Button
                type="button"
                variant="ghost"
                className="gap-1.5 px-3 text-sm text-muted-foreground hover:text-foreground"
                aria-expanded={openGroup === group.label}
                onClick={() => setOpenGroup((current) => current === group.label ? null : group.label)}
              >
                {group.label}<ChevronDown className={cn("size-3.5 transition-transform", openGroup === group.label && "rotate-180")} />
              </Button>
              {openGroup === group.label && (
                <div className="absolute left-0 top-full z-50 mt-2 w-56 border border-border bg-popover p-2 shadow-lift">
                  {group.links.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpenGroup(null)}
                      className={({ isActive }) => cn(
                        "block px-3 py-2.5 text-sm transition-colors",
                        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
          <NavLink to="/" end className={({ isActive }) => cn("px-3 py-2 text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
            Home
          </NavLink>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild className="group">
            <Link to="/tools">Open a tool<ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-2xl md:hidden">
          <div className="container-px mx-auto flex flex-col gap-2 py-5">
            <NavLink to="/" end onClick={() => setMobileOpen(false)} className={({ isActive }) => cn("px-4 py-3 text-sm font-medium", isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>Home</NavLink>
            {navGroups.map((group) => (
              <div key={group.label} className="border-t border-border pt-3">
                <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{group.label}</p>
                {group.links.map((link) => (
                  <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={({ isActive }) => cn("block px-4 py-2.5 text-sm", isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>{link.label}</NavLink>
                ))}
              </div>
            ))}
            <Button asChild className="mt-3"><Link to="/tools" onClick={() => setMobileOpen(false)}>Open a tool<ArrowUpRight /></Link></Button>
          </div>
        </div>
      )}
    </header>
  );
};
