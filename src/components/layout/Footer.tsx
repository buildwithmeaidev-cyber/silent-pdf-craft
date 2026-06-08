import { Link } from "react-router-dom";
import { FileText, Github, Twitter, Linkedin } from "lucide-react";
import { TOOLS } from "@/lib/tools";

export const Footer = () => {
  return (
    <footer className="bg-ink text-ink-foreground mt-24">
      <div className="container-px mx-auto max-w-7xl py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid place-items-center size-8 rounded-lg bg-white/10">
                <FileText className="size-4" />
              </span>
              <span className="font-semibold">silentPDF</span>
            </Link>
            <p className="mt-4 text-sm text-white/60 max-w-xs">
              Fast, private PDF tools that actually work — built for people who care about their files.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[
                { Icon: Twitter, label: "silentPDF on Twitter" },
                { Icon: Github, label: "silentPDF on GitHub" },
                { Icon: Linkedin, label: "silentPDF on LinkedIn" },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={label} className="grid place-items-center size-9 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white/90">Tools</h3>
            <ul className="mt-4 space-y-2.5">
              {TOOLS.slice(0, 6).map((t) => (
                <li key={t.slug}>
                  <Link to={`/tools/${t.slug}`} className="text-sm text-white/60 hover:text-white transition-colors">
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white/90">Product</h3>
            <ul className="mt-4 space-y-2.5">
              {[
                ["All Tools", "/tools"],
                ["Use Cases", "/use-cases"],
                ["Guides", "/guides"],
                ["Changelog", "#"],
                ["Status", "#"],
              ].map(([l, h]) => (
                <li key={l}><Link to={h} className="text-sm text-white/60 hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white/90">Trust</h3>
            <ul className="mt-4 space-y-2.5">
              {[
                ["Privacy", "/privacy"],
                ["Security", "/privacy"],
                ["Terms", "#"],
                ["DPA", "#"],
                ["Contact", "#"],
              ].map(([l, h]) => (
                <li key={l}><Link to={h} className="text-sm text-white/60 hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">© {new Date().getFullYear()} silentPDF. All rights reserved.</p>
          <p className="text-xs text-white/50">Built with care. Files processed locally whenever possible.</p>
        </div>
      </div>
    </footer>
  );
};
