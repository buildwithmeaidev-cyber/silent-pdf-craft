import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
const MAX_FILE_BYTES = 200 * 1024 * 1024;

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

export type Region = { x: number; y: number; w: number; h: number };

export async function loadFfmpeg(onProgress?: (pct: number) => void): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg();
    if (onProgress) {
      ffmpeg.on("progress", ({ progress }) => {
        const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
        onProgress(pct);
      });
    }
    try {
      const [coreURL, wasmURL] = await Promise.all([
        toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
        toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
      ]);
      await ffmpeg.load({ coreURL, wasmURL });
    } catch (err) {
      loadPromise = null;
      throw new Error(
        "Could not load the video engine. Check your internet connection and try again."
      );
    }
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return loadPromise;
}

function getVideoDimensions(file: File): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      const dims = { width: video.videoWidth, height: video.videoHeight, duration: video.duration };
      URL.revokeObjectURL(video.src);
      resolve(dims);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("This video file could not be read. It may be corrupted or use an unsupported codec."));
    };
  });
}

const SUPPORTED_EXT = ["mp4", "webm", "mov", "m4v", "mkv"];

export async function removeVideoWatermark(
  file: File,
  regions: Region[],
  opts: { onProgress?: (pct: number) => void } = {}
): Promise<{ blob: Blob; filename: string }> {
  if (!regions || regions.length === 0) {
    throw new Error("Draw at least one box over the watermark before processing.");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error("This file is too large. Please use a video under 200 MB.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!SUPPORTED_EXT.includes(ext)) {
    throw new Error("Unsupported video format. Please use MP4, WebM, or MOV.");
  }

  let dims: { width: number; height: number; duration: number };
  try {
    dims = await getVideoDimensions(file);
  } catch (err) {
    throw err instanceof Error ? err : new Error("Could not read this video's dimensions.");
  }

  if (!dims.width || !dims.height) {
    throw new Error("Unsupported codec: your browser could not decode this video's dimensions.");
  }

  const ffmpeg = await loadFfmpeg(opts.onProgress);

  const inputName = `input.${ext === "mov" ? "mov" : ext}`;
  const outputName = "output.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const filters = regions
    .map((r) => {
      const x = Math.max(0, Math.round(r.x * dims.width));
      const y = Math.max(0, Math.round(r.y * dims.height));
      const w = Math.max(2, Math.round(r.w * dims.width));
      const h = Math.max(2, Math.round(r.h * dims.height));
      return `delogo=x=${x}:y=${y}:w=${w}:h=${h}:show=0`;
    })
    .join(",");

  try {
    await ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      filters,
      "-c:a",
      "copy",
      "-y",
      outputName,
    ]);
  } catch (err) {
    throw new Error(
      "Processing failed. This video's codec may not be supported by the in-browser engine."
    );
  }

  let data: Uint8Array;
  try {
    data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  } catch {
    throw new Error("Processing failed: no output was produced.");
  }

  await ffmpeg.deleteFile(inputName).catch(() => {});
  await ffmpeg.deleteFile(outputName).catch(() => {});

  if (!data || data.length === 0) {
    throw new Error("Processing failed: the output file was empty.");
  }

  const blob = new Blob([data as BlobPart], { type: "video/mp4" });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return { blob, filename: `${baseName}-no-watermark.mp4` };
}
