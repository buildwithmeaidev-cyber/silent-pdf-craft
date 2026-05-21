import { useState } from 'react';
import { Trash2, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFDocument } from 'pdf-lib';
import { fileToArrayBuffer, downloadFile, loadPdfPages } from '@/utils/pdfUtils';
import FileUploadZone from '@/components/pdf/FileUploadZone';
import ToolPageLayout from '@/components/pdf/ToolPageLayout';
import PdfPreviewPanel from '@/components/pdf/PdfPreviewPanel';

export default function RemovePagesPDF() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [range, setRange] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFile = async (f) => {
    setFile(f);
    setSuccess(false);
    setError('');
    setLoading(true);
    try {
      const buf = await fileToArrayBuffer(f);
      const { pages: p } = await loadPdfPages(buf, 0.8);
      setPages(p);
    } catch (err) {
      console.error(err);
      setError('Failed to load PDF preview.');
    } finally {
      setLoading(false);
    }
  };

  const parseRanges = (input, total) => {
    if (!input || !input.trim()) return null;
    const out = [];
    for (const part of input.split(',').map(s => s.trim()).filter(Boolean)) {
      const m = part.match(/^(\d+)(?:-(\d+))?$/);
      if (!m) throw new Error(`Invalid range format: "${part}"`);
      const a = Math.max(1, Math.min(total, parseInt(m[1], 10)));
      const b = m[2] ? Math.max(1, Math.min(total, parseInt(m[2], 10))) : a;
      const [lo, hi] = a <= b ? [a, b] : [b, a];
      for (let i = lo; i <= hi; i++) {
        out.push(i - 1); // 0-based index
      }
    }
    return out;
  };

  const executeRemove = async () => {
    setError('');
    setSuccess(false);
    if (!file) return;
    if (!range.trim()) {
      setError('Please specify page numbers to remove.');
      return;
    }

    setSaving(true);
    try {
      const buf = await fileToArrayBuffer(file);
      const srcDoc = await PDFDocument.load(buf);
      const total = srcDoc.getPageCount();

      let removeIndices;
      try {
        removeIndices = new Set(parseRanges(range, total) ?? []);
      } catch (rangeErr) {
        setError(rangeErr.message || 'Invalid page range format.');
        setSaving(false);
        return;
      }

      const keepIndices = [];
      for (let i = 0; i < total; i++) {
        if (!removeIndices.has(i)) {
          keepIndices.push(i);
        }
      }

      if (keepIndices.length === 0) {
        setError('Cannot remove all pages from the document.');
        setSaving(false);
        return;
      }

      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(srcDoc, keepIndices);
      copiedPages.forEach(page => newDoc.addPage(page));

      const bytes = await newDoc.save();
      downloadFile(bytes, `trimmed_${file.name}`);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('An error occurred during page removal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ToolPageLayout icon={Trash2} title="Remove Pages" description="Delete specific pages from your PDF file" color="red">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        
        {/* Settings Panel */}
        <div className="space-y-4">
          <FileUploadZone
            onFile={handleFile} accept=".pdf" label="Drop PDF to trim"
            file={file} onClear={() => { setFile(null); setPages([]); setSuccess(false); setError(''); }}
          />

          {file && (
            <>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Trim Settings</p>
                
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Pages to remove</label>
                  <Input 
                    type="text"
                    value={range}
                    onChange={e => setRange(e.target.value)}
                    placeholder="e.g. 2, 4-6"
                    className="rounded-xl"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Use commas for separate pages and dashes for ranges. Total pages: {pages.length}.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700">
                  PDF successfully saved and downloaded!
                </div>
              )}

              <Button
                onClick={executeRemove}
                disabled={saving || !range.trim()}
                className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold gap-2 shadow-lg shadow-red-500/10"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Remove Pages & Download
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Preview Panel */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
            </div>
          ) : (
            <PdfPreviewPanel pages={pages} title="PDF Preview" />
          )}
        </div>

      </div>
    </ToolPageLayout>
  );
}
