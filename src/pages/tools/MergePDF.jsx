import { useState } from 'react';
import { Combine, Download, Loader2, FileText, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { downloadFile, formatFileSize } from '@/utils/pdfUtils';
import ToolPageLayout from '@/components/pdf/ToolPageLayout';
import { motion, AnimatePresence } from 'framer-motion';

export default function MergePdf() {

  const [files, setFiles] = useState([]);
  const [merging, setMerging] = useState(false);
  const [result, setResult] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    onDrop: (accepted) => {
      setFiles(prev => [...prev, ...accepted]);
      setResult(null);
    }
  });

  const moveFile = (index, direction) => {
    const nextFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    
    // Swap
    [nextFiles[index], nextFiles[targetIndex]] = [nextFiles[targetIndex], nextFiles[index]];
    setFiles(nextFiles);
    setResult(null);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const merge = async () => {
    if (files.length < 2) return;
    setMerging(true);
    try {
      const mergedDoc = await PDFDocument.create();
      
      for (const file of files) {
        const fileBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedDoc.addPage(page));
      }
      
      const mergedBytes = await mergedDoc.save();
      setResult({
        bytes: mergedBytes,
        name: `merged_${files[0].name.replace('.pdf', '')}_etc.pdf`,
        size: mergedBytes.byteLength
      });
      
      downloadFile(mergedBytes, `merged_${files[0].name.replace('.pdf', '')}_etc.pdf`);
    } catch (err) {
      console.error('Error merging PDFs:', err);
    } finally {
      setMerging(false);
    }
  };

  return (
    <ToolPageLayout icon={Combine} title="Merge PDF" description="Combine multiple PDF files into one in your browser" color="blue">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        
        {/* Main Content Area */}
        <div className="space-y-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-500 hover:bg-slate-50/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-7 h-7" />
            </div>
            <p className="font-semibold text-slate-700">Add PDF Files</p>
            <p className="text-xs text-slate-400 mt-1.5">Drag & drop files here, or click to browse</p>
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Merge Order</h3>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                <AnimatePresence initial={false}>
                  {files.map((file, idx) => (
                    <motion.div
                      key={`${file.name}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-4 bg-white border border-slate-100 rounded-xl p-3 shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 text-sm truncate">{file.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(file.size)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveFile(idx, 'up')}
                          disabled={idx === 0}
                          className="w-8 h-8 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-center disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4 text-slate-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFile(idx, 'down')}
                          disabled={idx === files.length - 1}
                          className="w-8 h-8 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-center disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4 text-slate-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-slate-400 transition-colors"
                          title="Remove File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info & Action */}
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm">Merge Summary</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Total Files</span>
                <span className="font-bold text-slate-800">{files.length}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Combined Size</span>
                <span className="font-bold text-slate-800">
                  {formatFileSize(files.reduce((acc, curr) => acc + curr.size, 0))}
                </span>
              </div>
            </div>

            {result && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 space-y-1.5 text-center">
                <p className="text-xs font-semibold text-emerald-800">Merged PDF is ready!</p>
                <p className="text-[10px] text-emerald-600 truncate">{result.name}</p>
                <p className="text-[10px] text-emerald-600">Size: {formatFileSize(result.size)}</p>
              </div>
            )}

            <Button
              onClick={merge}
              disabled={files.length < 2 || merging}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 shadow-md shadow-blue-500/10"
            >
              {merging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Merging...
                </>
              ) : (
                <>
                  <Combine className="w-4 h-4" /> Merge PDFs
                </>
              )}
            </Button>

            {files.length > 0 && (
              <button 
                onClick={() => { setFiles([]); setResult(null); }}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 py-1 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700 leading-relaxed">
            <p className="font-semibold mb-1">Stitch files together instantly</p>
            <p>Upload at least two PDF documents. You can adjust the ordering before merging. Processing happens locally in your browser.</p>
          </div>
        </div>

      </div>
    </ToolPageLayout>
  );
}
