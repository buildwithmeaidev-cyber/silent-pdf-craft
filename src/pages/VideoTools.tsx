import { Link } from "react-router-dom";
import { ArrowRight, Video, Sparkles } from "lucide-react";
import Breadcrumbs from "@/core/Breadcrumbs";

const VIDEO_TOOLS = [
  {
    slug: "/remove-video-watermark",
    name: "Remove Video Watermark",
    description:
      "Draw a box over a logo or watermark and export a clean MP4. Everything runs in your browser — the video never leaves your device.",
    available: true,
  },
  {
    slug: "#",
    name: "Trim & Cut Video",
    description: "Cut a clip to the exact seconds you need without re-encoding the whole file.",
    available: false,
  },
  {
    slug: "#",
    name: "Compress Video",
    description: "Shrink large recordings below upload limits while keeping the picture watchable.",
    available: false,
  },
  {
    slug: "#",
    name: "Video to GIF",
    description: "Turn a short clip into a shareable looping GIF, sized for chat and docs.",
    available: false,
  },
];

export default function VideoTools() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
        <Breadcrumbs current="Video Tools" />

        <header className="mt-6 mb-12 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Browser-only video processing
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Private video tools that run on your device
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            The same rule as our PDF tools: nothing is uploaded. Video is decoded and re-encoded locally
            with WebAssembly, so confidential recordings stay on your machine.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {VIDEO_TOOLS.map((tool) =>
            tool.available ? (
              <Link
                key={tool.name}
                to={tool.slug}
                className="group rounded-2xl border border-border bg-card p-6 transition hover:shadow-md hover:ring-2 hover:ring-primary/20"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {tool.name}
                </h2>
                <p className="mt-2 text-muted-foreground">{tool.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Open tool <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ) : (
              <div
                key={tool.name}
                className="rounded-2xl border border-dashed border-border bg-card/50 p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted">
                  <Video className="h-5 w-5 text-muted-foreground" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-muted-foreground">{tool.name}</h2>
                <p className="mt-2 text-muted-foreground">{tool.description}</p>
                <span className="mt-5 inline-block rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  In progress
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
