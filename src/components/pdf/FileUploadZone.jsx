import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/utils/pdfUtils';

export default function FileUploadZone({ file, onFile, onClear, accept = '.pdf', label = 'Drop PDF here' }) {
  const isImageAccept = accept.includes('image');
  
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: isImageAccept 
      ? { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] } 
      : { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDrop: (accepted) => {
      if (accepted && accepted.length > 0 && onFile) {
        onFile(accepted[0]);
      }
    }
  });

  if (file) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border bg-white p-4 relative group shadow-sm transition-all duration-200 hover:border-slate-300">
        <div className="grid place-items-center w-12 h-12 rounded-xl bg-slate-100 text-slate-600 shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-800 text-sm truncate">{file.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(file.size)}</p>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
            title="Clear file"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-50/50 transition-all duration-200",
        isDragActive && "border-indigo-500 bg-indigo-50/50",
        isDragReject && "border-red-500 bg-red-50/50"
      )}
    >
      <input {...getInputProps()} />
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-105">
        <UploadCloud className="w-7 h-7" />
      </div>
      <p className="font-semibold text-slate-700 text-sm">{label}</p>
      <p className="text-xs text-slate-400 mt-1.5">Processed entirely in your browser</p>
    </div>
  );
}
