import { Link } from "react-router-dom";
import { FileText, Github, Twitter, Linkedin, ShieldCheck } from "lucide-react";

const cols = [
  {
    title: "Product",
    links: [
      ["All Tools", "/tools"],
      ["Workflows", "/workflows"],
      ["Custom Workflow", "/workflows/custom"],
      ["Compress PDF", "/compress-pdf"],
      ["Merge PDF", "/merge-pdf"],
      ["PDF to Word", "/pdf-to-word"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Guides", "/guides"],
      ["Blog", "/blog"],
      ["Use Cases", "/use-cases"],
      ["Resource Center", "/resources"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Security", "/security"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["DPA", "/dpa"],
      ["Cookies", "/cookies"],
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="container-px mx-auto max-w-7xl py-16">
        <div className="grid gap-12 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid place-items-center size-9 rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <FileText className="size-4" />
              </span>
              <span className="font-semibold text-lg">silentPDF</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Fast, private PDF tools that actually work — built for people who care about their files.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              Files processed in your browser
            </div>
            <div className="mt-6 flex items-center gap-3">
              {[
                { Icon: Twitter, label: "silentPDF on Twitter", href: "#" },
                { Icon: Github, label: "silentPDF on GitHub", href: "#" },
                { Icon: Linkedin, label: "silentPDF on LinkedIn", href: "#" },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid place-items-center size-9 rounded-full border border-border bg-background/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([l, h]) => (
                  <li key={l}>
                    <Link to={h} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} silentPDF. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Built with care · Files never leave your browser for core tools.</p>
        </div>
      </div>
    </footer>
  );
};
