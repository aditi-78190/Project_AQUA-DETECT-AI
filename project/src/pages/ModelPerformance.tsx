import { Cpu, AlertCircle, Info, Clock, Database, Target, Zap, Layers } from 'lucide-react';
import { PageHeader } from '@/components/layout/Shell';
import { DemoBadge } from '@/components/ui/Badge';

export function ModelPerformance() {
  return (
    <div>
      <PageHeader title="Model Performance" subtitle="AI detection engine metrics and architecture" icon={Cpu}>
        <DemoBadge />
      </PageHeader>

      {/* Demo mode notice */}
      <div className="glass-strong p-5 rounded-xl mb-6 border border-anomaly-500/20 bg-anomaly-500/5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-anomaly-500/15 flex items-center justify-center shrink-0">
            <AlertCircle size={20} className="text-anomaly-400" />
          </div>
          <div>
            <h3 className="font-medium text-white mb-1">Prototype Demo Mode</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Model metrics shown below are placeholders. Actual precision, recall, F1, and mAP
              will be displayed only when the model is validated on a real labelled sonar test set.
              Never invent accuracy. The current prototype uses simulated detection outputs.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics grid (placeholders) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Precision', value: '—', icon: Target, sub: 'Pending validation' },
          { label: 'Recall', value: '—', icon: Target, sub: 'Pending validation' },
          { label: 'F1 Score', value: '—', icon: Target, sub: 'Pending validation' },
          { label: 'mAP', value: '—', icon: Target, sub: 'Pending validation' },
          { label: 'Inference Time', value: '~120ms', icon: Zap, sub: 'Simulated (demo)' },
          { label: 'Training Images', value: '0', icon: Database, sub: 'No dataset yet' },
          { label: 'Classes', value: '8', icon: Layers, sub: '7 debris + 1 anomaly' },
          { label: 'Model Version', value: 'v0.3-demo', icon: Cpu, sub: 'Simulated engine' },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="glass p-5 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <span className="label-muted">{m.label}</span>
                <div className="w-8 h-8 rounded-lg bg-sonar-500/10 flex items-center justify-center">
                  <Icon size={16} className="text-sonar-400" />
                </div>
              </div>
              <div className="font-mono text-2xl font-semibold text-white">{m.value}</div>
              <div className="text-xs text-slate-500 mt-1">{m.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Architecture */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Current architecture */}
        <div className="glass p-5 rounded-xl">
          <h3 className="font-medium text-white mb-4 flex items-center gap-2">
            <Clock size={16} className="text-sonar-400" /> Current Architecture (Prototype)
          </h3>
          <div className="space-y-2">
            {[
              { step: 'Side-Scan Sonar', note: 'Image input (upload or demo)' },
              { step: 'Data Ingestion', note: 'File validation & metadata extraction' },
              { step: 'Preprocessing', note: 'Grayscale, denoise, contrast, normalize (simulated)' },
              { step: 'AI Detection Engine', note: 'Mock detector — replaceable with YOLO model' },
              { step: 'Classification + Anomaly', note: '7 debris classes + unknown anomaly detection' },
              { step: 'Confidence + Risk Scoring', note: 'Interpretable 0–100 risk score' },
              { step: 'Human Verification', note: 'Expert confirm / reject / reclassify' },
              { step: 'Analytics Dashboard', note: 'KPIs, charts, scan history' },
              { step: 'Report / Action Recommendation', note: 'Downloadable inspection report' },
            ].map((s, i, arr) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-sonar-500/10 border border-sonar-500/30 flex items-center justify-center text-xs font-mono text-sonar-300 shrink-0">
                    {i + 1}
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-4 bg-sonar-500/20" />}
                </div>
                <div>
                  <div className="text-sm text-white">{s.step}</div>
                  <div className="text-xs text-slate-500">{s.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Future architecture */}
        <div className="glass p-5 rounded-xl">
          <h3 className="font-medium text-white mb-4 flex items-center gap-2">
            <Zap size={16} className="text-bio-400" /> Future Architecture (Production)
          </h3>
          <div className="space-y-2">
            {[
              { step: 'AUV/ROV + Sonar Sensor', note: 'Autonomous underwater vehicle integration' },
              { step: 'Edge AI', note: 'Onboard real-time inference (Jetson-class)' },
              { step: 'Real-Time Detection', note: 'Streaming sonar frame analysis' },
              { step: 'Cloud / Ground Station', note: 'Aggregation, storage, model updates' },
              { step: 'GIS Dashboard', note: 'Geospatial debris mapping & temporal analysis' },
              { step: 'Multi-Sensor Fusion', note: 'Combine sonar + optical + bathymetric data' },
              { step: 'Automated Cleanup Prioritization', note: 'Risk-weighted intervention routing' },
              { step: 'Government Monitoring System', note: 'Nationwide marine debris tracking' },
            ].map((s, i, arr) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-bio-500/10 border border-bio-500/30 flex items-center justify-center text-xs font-mono text-bio-300 shrink-0">
                    {i + 1}
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-4 bg-bio-500/20" />}
                </div>
                <div>
                  <div className="text-sm text-white">{s.step}</div>
                  <div className="text-xs text-slate-500">{s.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology stack */}
      <div className="glass p-5 rounded-xl mb-6">
        <h3 className="font-medium text-white mb-4">Technology Stack</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { category: 'Frontend', items: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Custom SVG Charts'] },
            { category: 'Backend (Planned)', items: ['Python', 'FastAPI', 'PostgreSQL / Supabase'] },
            { category: 'AI (Planned)', items: ['PyTorch', 'OpenCV', 'YOLO-family detector'] },
            { category: 'Storage', items: ['Supabase (PostgreSQL)', 'Demo data in DB'] },
          ].map((s) => (
            <div key={s.category} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="label-muted mb-2">{s.category}</div>
              <ul className="space-y-1">
                {s.items.map((item) => (
                  <li key={item} className="text-sm text-slate-300 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-sonar-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* API design */}
      <div className="glass p-5 rounded-xl">
        <h3 className="font-medium text-white mb-4 flex items-center gap-2">
          <Info size={16} className="text-sonar-400" /> Conceptual API Design
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          The frontend uses a mock service layer (Supabase-backed). These endpoints define the
          contract for connecting a real FastAPI + YOLO backend later.
        </p>
        <div className="space-y-2">
          {[
            { method: 'POST', path: '/api/scans', desc: 'Upload a new sonar scan image' },
            { method: 'POST', path: '/api/detect', desc: 'Run AI detection on a scan' },
            { method: 'GET', path: '/api/scans', desc: 'Get scan history' },
            { method: 'GET', path: '/api/scans/{id}', desc: 'Get scan details with detections' },
            { method: 'GET', path: '/api/detections/{id}', desc: 'Get detection details' },
            { method: 'POST', path: '/api/detections/{id}/verify', desc: 'Submit human verification' },
            { method: 'GET', path: '/api/dashboard', desc: 'Get dashboard statistics' },
            { method: 'POST', path: '/api/report', desc: 'Generate inspection report' },
          ].map((e) => (
            <div key={e.path} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span className={`chip font-mono text-[10px] ${
                e.method === 'GET' ? 'bg-bio-500/10 text-bio-400 border border-bio-500/20'
                : e.method === 'POST' ? 'bg-sonar-500/10 text-sonar-300 border border-sonar-500/20'
                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
              }`}>
                {e.method}
              </span>
              <span className="font-mono text-sm text-slate-200">{e.path}</span>
              <span className="text-xs text-slate-500 ml-auto hidden sm:block">{e.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
