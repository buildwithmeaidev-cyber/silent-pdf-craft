import { useState } from 'react';
import { Lock, Download, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFDocument } from 'pdf-lib';
import { fileToArrayBuffer, downloadFile, loadPdfPages, formatFileSize } from '@/utils/pdfUtils';
import FileUploadZone from '@/components/pdf/FileUploadZone';
import ToolPageLayout from '@/components/pdf/ToolPageLayout';
import PdfPreviewPanel from '@/components/pdf/PdfPreviewPanel';

export default function ProtectPdf() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Permissions
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowEditing, setAllowEditing] = useState(false);

  const handleFile = async (f) => {
    setFile(f);
    setDone(false);
    setError('');
    setLoading(true);
    const buf = await fileToArrayBuffer(f);
    const { pages: p } = await loadPdfPages(buf, 0.8);
    setPages(p);
    setLoading(false);
  };

  const protect = async () => {
    setError('');
    if (!password.trim()) { setError('Please enter a password.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 4) { setError('Password must be at least 4 characters.'); return; }

    setSaving(true);
    const buf = await fileToArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(buf);

    // Generate a cryptographically random owner password independent of the user password.
    // This prevents recipients from deriving the owner password and stripping permissions.
    const ownerPassword = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // pdf-lib supports encryption via save options
    const bytes = await pdfDoc.save({
      userPassword: password,
      ownerPassword,
      permissions: {
        printing: allowPrinting ? 'highResolution' : 'none',
        modifying: allowEditing,
        copying: allowCopying,
        annotating: allowEditing,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: false,
      },
    });

    downloadFile(bytes, `protected_${file.name}`);
    setSaving(false);
    setDone(true);
    setTimeout(() => setDone(false), 4000);
  };

  const PermToggle = ({ label, desc, value, onChange }) => (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className={`relative mt-0.5 w-10 h-5 rounded-full transition-all flex-shrink-0 ${value ? 'bg-cyan-500' : 'bg-slate-200'}`}
        onClick={() => onChange(!value)}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-5' : 'left-0.5'}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
    </label>
  );

  return (
    <ToolPageLayout icon={Lock} title="Protect PDF" description="Add password protection and set permissions for your PDF" color="cyan">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left Panel */}
        <div className="space-y-4">
          <FileUploadZone
            onFile={handleFile} accept=".pdf" label="Drop PDF to protect"
            file={file} onClear={() => { setFile(null); setPages([]); setDone(false); }}
          />

          {file && (
            <>
              {/* Password */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Set Password</p>

                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="rounded-xl pr-10"
                  />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="rounded-xl"
                />

                {/* Strength indicator */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${password.length >= i * 3 ? (password.length >= 10 ? 'bg-emerald-500' : password.length >= 6 ? 'bg-amber-500' : 'bg-red-500') : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      {password.length < 6 ? 'Weak — use more characters' : password.length < 10 ? 'Fair — consider adding symbols' : 'Strong password'}
                    </p>
                  </div>
                )}
              </div>

              {/* Permissions */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Permissions</p>
                <PermToggle
                  label="Allow Printing"
                  desc="Recipients can print this document"
                  value={allowPrinting}
                  onChange={setAllowPrinting}
                />
                <PermToggle
                  label="Allow Copying Text"
                  desc="Recipients can copy text content"
                  value={allowCopying}
                  onChange={setAllowCopying}
                />
                <PermToggle
                  label="Allow Editing"
                  desc="Recipients can modify the document"
                  value={allowEditing}
                  onChange={setAllowEditing}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>
              )}

              {done && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> PDF protected and downloaded!
                </div>
              )}

              <Button
                onClick={protect}
                disabled={saving}
                className="w-full h-12 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold gap-2 shadow-lg shadow-cyan-500/20"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Protecting...</> : <><Lock className="w-4 h-4" /> Protect & Download</>}
              </Button>
            </>
          )}
        </div>

        {/* Preview */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
            </div>
          ) : (
            <PdfPreviewPanel pages={pages} title="PDF Preview" />
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}