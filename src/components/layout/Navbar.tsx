import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowUpRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "Tools" },
  { to: "/guides", label: "Guides" },
  { to: "/use-cases", label: "Use Cases" },
  { to: "/privacy", label: "Privacy" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "glass border-b border-border" : "bg-transparent"
      )}
    >
      <div className="container-px mx-auto max-w-7xl flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center size-8 rounded-lg bg-ink text-ink-foreground shadow-soft">
            <FileText className="size-4" strokeWidth={2.4} />
          </span>
          <span className="font-semibold tracking-tight text-foreground">
            silent<span className="text-primary">PDF</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground transition-colors",
                  isActive && "text-foreground"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/tools/merge-pdf"
          className="group inline-flex items-center gap-1.5 rounded-full bg-ink text-ink-foreground px-4 py-2 text-sm font-medium shadow-soft hover:shadow-lift transition-all"
        >
          Upload PDF
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </header>
  );
};
