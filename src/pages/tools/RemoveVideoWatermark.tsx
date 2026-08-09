import { useCallback, useMemo, useRef, useState } from "react";
import { Upload, X, Download, Loader2, AlertCircle, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Seo } from "@/components/Seo";
import { removeVideoWatermark, type Region } from "@/lib/video";

type Box = Region & { id: string };

const ACCEPTED_TYPES = [".mp4", ".webm", ".mov"];

export default function RemoveVideoWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [drawing, setDrawing] = useState<{ x: number; y: number } | null>(null);
  const [draft, setDraft] = useState<Region | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState<string>("");

  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetOutput = () => {
    setResultUrl(null);
    setResultName("");
    setError(null);
    setProgress(0);
  };

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    setFile(f);
    setBoxes([]);
    resetOutput();
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const getRelativePos = (e: React.MouseEvent) => {
    const rect = overlayRef.current!.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    return { x, y };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!overlayRef.current) return;
    const pos = getRelativePos(e);
    setDrawing(pos);
    setDraft({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const pos = getRelativePos(e);
    setDraft({
      x: Math.min(drawing.x, pos.x),
      y: Math.min(drawing.y, pos.y),
      w: Math.abs(pos.x - drawing.x),
      h: Math.abs(pos.y - drawing.y),
    });
  };

  const onMouseUp = () => {
    if (draft && draft.w > 0.01 && draft.h > 0.01) {
      setBoxes((prev) => [...prev, { ...draft, id: crypto.randomUUID() }]);
    }
    setDrawing(null);
    setDraft(null);
  };

  const removeBox = (id: string) => setBoxes((prev) => prev.filter((b) => b.id !== id));

  const handleProcess = async () => {
    if (!file) return;
    resetOutput();
    setProcessing(true);
    try {
      const { blob, filename } = await removeVideoWatermark(
        file,
        boxes.map(({ x, y, w, h }) => ({ x, y, w, h })),
        { onProgress: setProgress }
      );
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultName(filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while processing this video.");
    } finally {
      setProcessing(false);
    }
  };

  const canProcess = useMemo(() => !!file && boxes.length > 0 && !processing, [file, boxes, processing]);

  return (
    <div className="container-px mx-auto max-w-4xl py-16 md:py-20">
      <Seo />
      <div className="max-w-2xl">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Video Tools</span>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl leading-tight text-balance">
          Remove watermark from video
        </h1>
        <p className="mt-4 text-muted-foreground">
          Draw a box over the watermark and we'll blur it out — entirely on your device. Your video
          never leaves your browser.
        </p>
      </div>

      <div className="mt-10 space-y-6">
        {!file && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center hover:border-primary/50 transition-colors"
          >
            <Upload className="mx-auto size-8 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-4 font-medium">Drop a video here, or click to browse</p>
            <p className="mt-1 text-sm text-muted-foreground">MP4, WebM, or MOV — up to 200 MB</p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>
        )}

        {file && videoUrl && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <Film className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm font-medium">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setVideoUrl(null);
                  setBoxes([]);
                  resetOutput();
                }}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground mb-3">
                Drag on the video below to draw a box over the watermark. You can add multiple boxes.
              </p>
              <div
                ref={overlayRef}
                className="relative w-full select-none overflow-hidden rounded-lg bg-black cursor-crosshair"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={() => {
                  if (drawing) onMouseUp();
                }}
              >
                <video src={videoUrl} controls className="w-full max-h-[480px] pointer-events-none" />
                {boxes.map((b) => (
                  <div
                    key={b.id}
                    className="absolute border-2 border-primary bg-primary/20"
                    style={{
                      left: `${b.x * 100}%`,
                      top: `${b.y * 100}%`,
                      width: `${b.w * 100}%`,
                      height: `${b.h * 100}%`,
                    }}
                  />
                ))}
                {draft && (
                  <div
                    className="absolute border-2 border-dashed border-primary bg-primary/10"
                    style={{
                      left: `${draft.x * 100}%`,
                      top: `${draft.y * 100}%`,
                      width: `${draft.w * 100}%`,
                      height: `${draft.h * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>

            {boxes.length > 0 && (
              <div className="rounded-xl border bg-card p-4">
                <p className="text-sm font-medium mb-3">Watermark regions ({boxes.length})</p>
                <ul className="space-y-2">
                  {boxes.map((b, i) => (
                    <li key={b.id} className="flex items-center justify-between text-sm rounded-lg bg-muted/50 px-3 py-2">
                      <span className="text-muted-foreground">
                        Box {i + 1}: {(b.w * 100).toFixed(0)}% × {(b.h * 100).toFixed(0)}%
                      </span>
                      <button
                        onClick={() => removeBox(b.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove box"
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
              This runs 100% on your device using WebAssembly — nothing is uploaded. Processing can
              take a while, especially for longer or larger videos, and depends on your device's speed.
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button onClick={handleProcess} disabled={!canProcess} className="w-full">
              {processing ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" /> Processing…
                </>
              ) : (
                "Remove watermark"
              )}
            </Button>

            {processing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-center text-muted-foreground">{progress}%</p>
              </div>
            )}

            {resultUrl && (
              <div className="space-y-3 rounded-xl border bg-card p-4">
                <p className="text-sm font-medium">Done! Preview your cleaned video:</p>
                <video src={resultUrl} controls className="w-full max-h-[480px] rounded-lg bg-black" />
                <a href={resultUrl} download={resultName} className="block">
                  <Button className="w-full">
                    <Download className="size-4 mr-2" /> Download {resultName}
                  </Button>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
