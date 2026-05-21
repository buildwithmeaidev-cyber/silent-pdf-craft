import { Eye } from 'lucide-react';

export default function PdfPreviewPanel({ pages = [], title = 'PDF Preview' }) {
  if (!pages || pages.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] text-slate-400">
        <Eye className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">Upload a file to see preview</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600">
          {pages.length} Page{pages.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 max-h-[520px] overflow-y-auto p-2 bg-white rounded-xl border border-slate-100">
        {pages.map((pg, i) => (
          <div key={pg.pageNum || i} className="relative group border border-slate-100 rounded-xl overflow-hidden bg-slate-50 shadow-sm flex flex-col items-center hover:border-indigo-300 transition-all duration-200">
            <div className="w-full aspect-[3/4] flex items-center justify-center overflow-hidden bg-white p-2">
              <img src={pg.dataUrl} alt={`Page ${pg.pageNum}`} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="w-full bg-slate-50 border-t border-slate-100 py-1 text-center">
              <span className="text-[10px] font-semibold text-slate-500">Page {pg.pageNum || i + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
