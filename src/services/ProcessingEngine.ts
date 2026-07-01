// src/services/ProcessingEngine.ts
import { ToolConfig, ProcessResult, ToolKind } from "../types/ToolConfig";

import { WorkerManager } from "../workers/WorkerManager";
import { useUpload } from "../context/UploadContext";
import { useError } from "../context/ErrorContext";
import { useProgress, ProgressStage } from "../context/ProgressContext";
import { workerMap } from "../engine/workerMap";
import { FeatureDisabledError } from "../errors/FeatureDisabledError";
/**
 * Central processing engine that orchestrates the standardized pipeline.
 * It is used by UI components via the `runTool` function.
 */
export async function runTool(config: ToolConfig): Promise<ProcessResult> {
  const { showError } = useError();
  const { setStage } = useProgress();

  try {
    // Stage: Uploading (files already selected, just update UI)
    setStage(ProgressStage.Uploading, undefined, "Files ready");

    // Stage: Validating
    setStage(ProgressStage.Validating, undefined, "Validating files");
    // Basic validation – can be extended later
    if (!config.files || config.files.length === 0) {
      throw new Error("No files provided");
    }

    // Stage: Preparing – decide which worker script to use
    setStage(ProgressStage.Preparing, undefined, "Preparing processing");


    
    // Retrieve feature flags (fallback to default)
    const featureFlags = (typeof window !== 'undefined' && (window as any).__FEATURE_FLAGS__) || { enableAdvancedProcessing: false };
    const advancedTools: ToolKind[] = ['ocr', 'imageConvert', 'watermark', 'encrypt', 'pdfToWord', 'wordToPdf'];
    if (!featureFlags.enableAdvancedProcessing && advancedTools.includes(config.kind)) {
      throw new FeatureDisabledError(config.kind);
    }
    const scriptPath = workerMap[config.kind];
    if (!scriptPath) {
      throw new Error(`No worker defined for tool ${config.kind}`);
    }


    // Stage: Processing – run worker via WorkerManager
    setStage(ProgressStage.Processing, 0, "Processing started");
    const manager = new WorkerManager();
    const result = await manager.run<ProcessResult>(scriptPath, {
      files: config.files,
      options: config.options,
    }, {
      onProgress: (percent, message) => {
        setStage(ProgressStage.Processing, percent, message);
      },
    });

    // Stage: Generating Output (worker already gave blob)
    setStage(ProgressStage.GeneratingOutput, 100, "Generating output");
    return result;
  } catch (err: any) {
    // Centralized error handling
    showError({
      title: "Processing failed",
      message: err.message ?? "An unknown error occurred",
      kind: "WorkerFailure",
    });
    throw err; // re‑throw for UI if needed
  } finally {
    // Ensure final stage is set correctly
    setStage(ProgressStage.Finalizing);
  }
}
