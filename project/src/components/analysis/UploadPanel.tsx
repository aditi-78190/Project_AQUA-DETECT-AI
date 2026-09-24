import { useState, useRef, useCallback } from 'react';
import { Upload, FileImage, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { DEMO_SCENARIOS } from '@/lib/demoScenarios';
import { DemoBadge } from '@/components/ui/Badge';

interface Props {
  onFileSelected: (file: File) => void;
  onDemoSelected: (scenarioKey: string) => void;
  selectedDemo?: string;
  fileError?: string;
  selectedFile?: { name: string; size: number; width: number; height: number } | null;
  onClearFile: () => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/tiff', 'image/webp'];

export function UploadPanel({
  onFileSelected, onDemoSelected, selectedDemo, fileError, selectedFile, onClearFile,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  }, [onFileSelected]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div className="space-y-5">
      {/* Drag & drop */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragging ? 'border-sonar-500 bg-sonar-500/5 scale-[1.01]' : 'border-white/10 hover:border-sonar-500/40 hover:bg-white/[0.02]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="w-14 h-14 rounded-full bg-sonar-500/10 border border-sonar-500/20 flex items-center justify-center mx-auto mb-4">
          <Upload size={26} className="text-sonar-400" />
        </div>
        <h3 className="font-medium text-white mb-1">Drag & drop sonar image</h3>
        <p className="text-sm text-slate-500 mb-4">Supports JPG, PNG, TIFF, WebP — up to 20 MB</p>
        <button onClick={() => inputRef.current?.click()} className="btn-outline">
          <FileImage size={16} /> Browse Files
        </button>
      </div>

      {/* Selected file info */}
      {selectedFile && (
        <div className="glass p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-bio-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} className="text-bio-400" />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-white truncate">{selectedFile.name}</div>
              <div className="text-xs text-slate-500">
                {(selectedFile.size / 1024).toFixed(0)} KB · {selectedFile.width}×{selectedFile.height}px
              </div>
            </div>
          </div>
          <button onClick={onClearFile} className="p-1.5 text-slate-500 hover:text-danger-400 transition">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Error */}
      {fileError && (
        <div className="glass p-3 rounded-lg flex items-center gap-2 border border-danger-500/30 bg-danger-500/5">
          <AlertCircle size={18} className="text-danger-400 shrink-0" />
          <span className="text-sm text-danger-300">{fileError}</span>
        </div>
      )}

      {/* Demo scenarios */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Demo Sonar Scenarios</h3>
          <DemoBadge />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEMO_SCENARIOS.map((sc) => (
            <button
              key={sc.key}
              onClick={() => onDemoSelected(sc.key)}
              className={`text-left p-3 rounded-lg border transition-all ${
                selectedDemo === sc.key
                  ? 'border-sonar-500/50 bg-sonar-500/10 shadow-glow'
                  : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
              }`}
            >
              <div className="text-xs font-mono text-sonar-400 mb-1">DEMO</div>
              <div className="text-sm text-white mb-1">{sc.title}</div>
              <div className="text-xs text-slate-500 line-clamp-2">{sc.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
