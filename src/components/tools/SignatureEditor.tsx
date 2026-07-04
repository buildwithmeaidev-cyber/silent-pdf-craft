import React, { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    if (tab !== "draw" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d")?.scale(ratio, ratio);
    const pad = new SignaturePad(canvas, { backgroundColor: "rgba(0,0,0,0)", penColor: "#111827" });
    padRef.current = pad;
    pad.addEventListener("endStroke", () => onChange(pad.toDataURL("image/png")));
    return () => { pad.off(); padRef.current = null; };
  }, [tab, onChange]);

  const clearDraw = () => { padRef.current?.clear(); onChange(null); };

  const applyTyped = (val: string) => {
    setTyped(val);
    if (!val.trim()) { onChange(null); return; }
    // Render typed signature onto a canvas as PNG.
    const c = document.createElement("canvas");
    c.width = 600; c.height = 180;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#0b1a3a";
    ctx.font = "italic 72px 'Segoe Script', 'Brush Script MT', cursive";
    ctx.textBaseline = "middle";
    ctx.fillText(val, 20, c.height / 2);
    onChange(c.toDataURL("image/png"));
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const buf = await f.arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    onChange(`data:${f.type};base64,${b64}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["draw", "type", "upload"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); onChange(null); }}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize",
              tab === t ? "border-primary bg-primary-soft text-primary" : "hover:bg-secondary"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "draw" && (
        <div>
          <canvas
            ref={canvasRef}
            className="w-full h-40 rounded-lg border bg-white touch-none"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Draw with mouse or finger.</span>
            <button type="button" onClick={clearDraw} className="text-primary hover:underline">Clear</button>
          </div>
        </div>
      )}

      {tab === "type" && (
        <input
          type="text"
          value={typed}
          onChange={(e) => applyTyped(e.target.value)}
          placeholder="Type your name"
          className="w-full rounded-lg border bg-card px-3 py-2.5 text-lg italic font-serif outline-none focus:border-primary"
        />
      )}

      {tab === "upload" && (
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={onUpload}
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium"
        />
      )}
    </div>
  );
};
