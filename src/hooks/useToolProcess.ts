
import { useState } from "react";

export type ToolProcessState =
  | "idle"
  | "uploading"
  | "processing"
  | "success"
  | "error";

export function useToolProcess() {
  const [state, setState] = useState<ToolProcessState>("idle");
  const [message, setMessage] = useState("");

  const startUploading = () => {
    setState("uploading");
    setMessage("Uploading files...");
  };

  const startProcessing = (msg = "Processing PDF...") => {
    setState("processing");
    setMessage(msg);
  };

  const success = (msg = "Your PDF is ready") => {
    setState("success");
    setMessage(msg);
  };

  const error = (msg = "Something went wrong. Try again.") => {
    setState("error");
    setMessage(msg);
  };

  const reset = () => {
    setState("idle");
    setMessage("");
  };

  return {
    state,
    message,
    startUploading,
    startProcessing,
    success,
    error,
    reset,
  };
}
