import React, { useEffect, useRef, useState, useCallback } from "react";
import SignaturePad from "signature_pad";
import { cn } from "@/lib/utils";

interface Props {
  onChange: (dataUrl: string | null) => void;
}

type Tab = "draw" | "type" | "upload";

export const SignatureEditor: React.FC<Props> = ({ onChange }) => {
  const [tab, setTab] = useState<Tab>("draw");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [typed, setTyped] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const initPad = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const width = Math.max(300, Math.floor(rect.width));
    const height = 160;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio);
    }

    if (padRef.current) {
      padRef.current.clear();
      padRef.current.on();
    } else {
      const pad = new SignaturePad(canvas, {
        backgroundColor: "rgba(0,0,0,0)",
        penColor: "#0f172a",
        minWidth: 1.5,
        maxWidth: 3.5,
      });
      padRef.current = pad;
      pad.addEventListener("endStroke", () => {
        if (!pad.isEmpty()) {
          onChange(pad.toDataURL("image/png"));
        }
      });
    }
  }, [onChange]);

  useEffect(() => {
    if (tab !== "draw") return;
    // Slight delay to ensure DOM layout is settled
    const timer = setTimeout(initPad, 50);
    const observer = new ResizeObserver(() => {
      initPad();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      if (padRef.current) {
        padRef.current.off();
      }
    };
  }, [tab, initPad]);

  const clearDraw = () => {
    padRef.current?.clear();
    onChange(null);
  };

  const applyTyped = (val: string) => {
    setTyped(val);
    if (!val.trim()) {
      onChange(null);
      return;
    }
    const c = document.createElement("canvas");
    c.width = 600;
    c.height = 180;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#0f172a";
    ctx.font = "italic 72px 'Segoe Script', 'Brush Script MT', cursive, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(val, 24, c.height / 2);
    onChange(c.toDataURL("image/png"));
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(f);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["draw", "type", "upload"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              if (t !== "draw") onChange(null);
              else if (padRef.current && !padRef.current.isEmpty()) {
                onChange(padRef.current.toDataURL("image/png"));
              } else {
                onChange(null);
              }
            }}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition",
              tab === t ? "border-primary bg-primary-soft text-primary" : "hover:bg-secondary"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "draw" && (
        <div ref={containerRef} className="w-full">
          <div className="relative rounded-lg border bg-white overflow-hidden shadow-sm">
            <canvas ref={canvasRef} className="w-full h-40 block touch-none cursor-crosshair" />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Draw your signature with mouse or touch.</span>
            <button
              type="button"
              onClick={clearDraw}
              className="text-primary hover:underline font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {tab === "type" && (
        <div>
          <input
            type="text"
            value={typed}
            onChange={(e) => applyTyped(e.target.value)}
            placeholder="Type your name"
            className="w-full rounded-lg border bg-card px-3 py-2.5 text-xl italic font-serif outline-none focus:border-primary"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">Rendered automatically in a script font.</p>
        </div>
      )}

      {tab === "upload" && (
        <div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onUpload}
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-secondary/80 cursor-pointer"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">Upload a transparent PNG or photo of your signature.</p>
        </div>
      )}
    </div>
  );
};
