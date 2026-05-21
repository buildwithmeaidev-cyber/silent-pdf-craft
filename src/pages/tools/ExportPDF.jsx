import { useState } from 'react';
import { Download, FileText, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFDocument } from 'pdf-lib';
import { fileToArrayBuffer, downloadFile, loadPdfPages, formatFileSize } from '@/utils/pdfUtils';
import FileUploadZone from '@/components/pdf/FileUploadZone';
import ToolPageLayout from '@/components/pdf/ToolPageLayout';
import PdfPreviewPanel from '@/components/pdf/PdfPreviewPanel';
import { motion } from 'framer-motion';

export default function ExportPdf() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [filename, setFilename] = useState('');
  const [numPages, setNumPages] = useState(0);

  const handleFile = async (f) => {
    setFile(f);
    setDone(false);
    const name = f.name.replace(/\.pdf$/i, '');
    setFilename(name);
    setLoading(true);
    const buf = await fileToArrayBuffer(f);
    const { pages: p } = await loadPdfPages(buf, 0.9);
    setPages(p);
    setNumPages(p.length);
    setLoading(false);
  };

  const exportFile = async () => {
    if (!file || !filename.trim()) return;
    setSaving(true);
    const buf = await fileToArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(buf);
    const bytes = await pdfDoc.save();
    const finalName = filename.trim().endsWith('.pdf') ? filename.trim() : `${filename.trim()}.pdf`;
    downloadFile(bytes, finalName);
    setSaving(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <ToolPageLayout icon={Download} title="Export & Rename" description="Rename your PDF and download with a custom filename" color="sky">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Left Panel */}
        <div className="space-y-4">
          <FileUploadZone
            onFile={handleFile} accept=".pdf" label="Drop your PDF here"
            file={file} onClear={() => { setFile(null); setPages([]); setFilename(''); }}
          />

          {file && (
            <>
              {/* File Info */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">File Info</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-400 text-xs mb-1">Size</p>
                    <p className="font-semibold text-slate-700">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-400 text-xs mb-1">Pages</p>
                    <p className="font-semibold text-slate-700">{numPages}</p>
                  </div>
                </div>
              </div>

              {/* Rename */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Export Filename</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={filename}
                    onChange={e => setFilename(e.target.value)}
                    placeholder="Enter filename..."
                    className="rounded-xl flex-1"
                  />
                  <span className="text-sm text-slate-400 font-medium flex-shrink-0">.pdf</span>
                </div>
                <p className="text-xs text-slate-400">This will be the downloaded file name</p>
              </div>

              <Button
                onClick={exportFile}
                disabled={saving || !filename.trim()}
                className={`w-full h-12 rounded-xl font-semibold gap-2 shadow-lg transition-all ${done ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-sky-600 hover:bg-sky-700 shadow-sky-500/20'}`}
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</>
                ) : done ? (
                  <><CheckCircle className="w-4 h-4" /> Downloaded!</>
                ) : (
                  <><Download className="w-4 h-4" /> Download as "{filename || 'file'}.pdf"</>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Preview */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
            </div>
          ) : (
            <PdfPreviewPanel pages={pages} title="PDF Preview" />
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}