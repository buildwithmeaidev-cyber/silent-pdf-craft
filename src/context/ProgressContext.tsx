// src/context/ProgressContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

export enum ProgressStage {
  Uploading = "Uploading",
  Validating = "Validating",
  Preparing = "Preparing",
  Processing = "Processing",
  Optimizing = "Optimizing",
  Rendering = "Rendering",
  GeneratingOutput = "Generating Output",
  Finalizing = "Finalizing",
  DownloadReady = "Download Ready",
}

interface ProgressContextProps {
  stage: ProgressStage;
  percent?: number; // 0-100 optional
  message?: string;
  setStage: (stage: ProgressStage, percent?: number, message?: string) => void;
}

const ProgressContext = createContext<ProgressContextProps | undefined>(undefined);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [stage, setStageState] = useState<ProgressStage>(ProgressStage.Uploading);
  const [percent, setPercent] = useState<number | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const setStage = (newStage: ProgressStage, newPercent?: number, newMessage?: string) => {
    setStageState(newStage);
    setPercent(newPercent);
    setMessage(newMessage);
  };

  return (
    <ProgressContext.Provider value={{ stage, percent, message, setStage }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = (): ProgressContextProps => {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within ProgressProvider");
  }
  return ctx;
};
