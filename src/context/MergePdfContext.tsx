import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { formatFileSize } from '@/utils/pdfUtils';
import { validatePdfFiles, validatePdfIntegrity } from '@/lib/pdfValidation';

export type PdfFile = {
  id: string;
  file: File;
  previewUrl?: string;
  status: 'idle' | 'uploading' | 'ready' | 'error';
  error?: string;
};

type MergePdfContextType = {
  files: PdfFile[];
  addFiles: (incoming: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  moveFile: (id: string, direction: 'up' | 'down') => void;
  setError: (msg: string) => void;
  clearError: () => void;
  error: string | null;
};

const MergePdfContext = createContext<MergePdfContextType | undefined>(undefined);

export const MergePdfProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [error, setErrorState] = useState<string | null>(null);

  const addFiles = useCallback(async (incoming: File[]) => {
    const { validFiles, errors } = validatePdfFiles(incoming, files.map(f => f.file));
    if (errors.length) {
      setErrorState(errors.join('\n'));
      return;
    }
    const integrityPromises = validFiles.map(validatePdfIntegrity);
    const integrityResults = await Promise.all(integrityPromises);
    const cleanFiles: File[] = [];
    const integrityErrors: string[] = [];
    integrityResults.forEach((err, idx) => {
      if (err) integrityErrors.push(err);
      else cleanFiles.push(validFiles[idx]);
    });
    if (integrityErrors.length) setErrorState(integrityErrors.join('\n'));
    const newPdfFiles: PdfFile[] = cleanFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'ready',
    }));
    setFiles(prev => [...prev, ...newPdfFiles]);
  }, [files]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    files.forEach(f => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
    setErrorState(null);
  }, [files]);

  const moveFile = useCallback((id: string, direction: 'up' | 'down') => {
    setFiles(prev => {
      const idx = prev.findIndex(f => f.id === id);
      if (idx === -1) return prev;
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const newArr = [...prev];
      [newArr[idx], newArr[target]] = [newArr[target], newArr[idx]];
      return newArr;
    });
  }, []);

  const clearError = useCallback(() => setErrorState(null), []);

  return (
    <MergePdfContext.Provider value={{ files, addFiles, removeFile, clearFiles, moveFile, setError: setErrorState, clearError, error }}>
      {children}
    </MergePdfContext.Provider>
  );
};

export const useMergePdf = (): MergePdfContextType => {
  const ctx = useContext(MergePdfContext);
  if (!ctx) throw new Error('useMergePdf must be used within MergePdfProvider');
  return ctx;
};
