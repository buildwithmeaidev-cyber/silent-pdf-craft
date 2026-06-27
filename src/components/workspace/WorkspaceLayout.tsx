// src/components/workspace/WorkspaceLayout.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ToolPicker from "@/components/workspace/ToolPicker";
import UploadStep from "@/components/workspace/UploadStep";
import ReviewPanel from "@/components/workspace/ReviewPanel";
import ProgressStep from "@/components/workspace/ProgressStep";
import ResultPreview from "@/components/workspace/ResultPreview";

/**
 * WorkspaceLayout orchestrates the modern 8‑step PDF workflow.
 * Includes a "Custom workflow" toggle allowing users to manually
 * select a tool and configure inputs before processing.
 */
export default function WorkspaceLayout() {
  const [step, setStep] = useState(1);
  const [selectedTool, setSelectedTool] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<{ url: string; filename: string; blob?: Blob } | null>(null);
  const [customMode, setCustomMode] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, 8));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleNextAction = (nextToolSlug?: string) => {
    if (nextToolSlug) {
      setSelectedTool(nextToolSlug);
      if (result && result.blob) {
        const resultFile = new File([result.blob], result.filename, { type: "application/pdf" });
        setFiles([resultFile]);
        setStep(3);
      } else {
        setFiles([]);
        setStep(2);
      }
    } else {
      // reset everything
      setSelectedTool("");
      setFiles([]);
      setOptions({});
      setResult(null);
      setStep(1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 min-h-[60vh] flex flex-col justify-center">
      {/* Header back link */}
      <div className="mb-4">
        <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to home
        </Link>
      </div>

      {/* Custom workflow toggle */}
      <div className="flex items-center mb-6">
        <input
          id="custom-workflow"
          type="checkbox"
          checked={customMode}
          onChange={(e) => setCustomMode(e.target.checked)}
          className="mr-2 size-4 rounded"
        />
        <label htmlFor="custom-workflow" className="text-sm font-medium">
          Enable custom workflow (select tool & inputs manually)
        </label>
      </div>

      {/* Workflow steps */}
      {step === 1 && (
        <ToolPicker
          selected={selectedTool}
          onSelect={(tool) => {
            setSelectedTool(tool);
            next();
          }}
        />
      )}
      {step === 2 && (
        <UploadStep files={files} setFiles={setFiles} onNext={next} onBack={back} />
      )}
      {step === 3 && (
        <UploadStep
          files={files}
          setFiles={setFiles}
          options={options}
          setOptions={setOptions}
          tool={selectedTool}
          onNext={next}
          onBack={back}
        />
      )}
      {step === 4 && (
        <ReviewPanel tool={selectedTool} files={files} options={options} onConfirm={next} onBack={back} />
      )}
      {step === 5 && (
        <ProgressStep tool={selectedTool} files={files} options={options} setResult={setResult} onDone={next} />
      )}
      {step === 6 && (
        <ProgressStep tool={selectedTool} files={files} options={options} setResult={setResult} onDone={next} />
      )}
      {step === 7 && result && (
        <ResultPreview result={result} onNext={next} onEdit={() => setStep(3)} />
      )}
      {step === 8 && result && (
        <ResultPreview result={result} finalStep onEdit={() => setStep(3)} />
      )}
    </div>
  );
}
