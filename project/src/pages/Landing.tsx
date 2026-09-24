import {
  Waves,
  ScanLine,
  Brain,
  AlertTriangle,
  ShieldCheck,
  FileText,
  ArrowRight,
  Activity,
  Target,
  Eye,
  Globe2,
  Leaf,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { SonarImage } from '@/components/ui/SonarImage';
import { DemoBadge } from '@/components/ui/Badge';

interface Props {
  onLaunch: () => void;
  onDemo: () => void;
}

export function Landing({ onLaunch, onDemo }: Props) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 sonar-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-sonar-500/5 blur-3xl pointer-events-none" />

      {/* Nav bar */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-sm bg-abyss-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <button onClick={onDemo} className="btn-ghost">
              <ScanLine size={16} /> View Demo
            </button>
            <button onClick={onLaunch} className="btn-primary">
              Launch Sonar Analysis <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="chip bg-sonar-500/10 text-sonar-300 border border-sonar-500/20">
                <Activity size={12} /> SIH 2026 · PS 26057
              </span>
              <DemoBadge />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] text-balance">
              Turning Sonar Imagery into{' '}
              <span className="text-sonar-400">Actionable Marine Intelligence</span>
            </h1>
            <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-xl">
              An AI-powered decision-support platform that analyzes side-scan sonar
              imagery to detect marine debris, identify unknown underwater anomalies,
              estimate risk, and prioritize areas for inspection and cleanup.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={onLaunch} className="btn-primary text-base px-6 py-3">
                Launch Sonar Analysis <ArrowRight size={18} />
              </button>
              <button onClick={onDemo} className="btn-outline text-base px-6 py-3">
                <ScanLine size={18} /> View Demo Scenarios
              </button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-bio-400" /> Human-in-the-loop</div>
              <div className="flex items-center gap-2"><Brain size={14} className="text-sonar-400" /> AI Detection</div>
              <div className="flex items-center gap-2"><AlertTriangle size={14} className="text-anomaly-400" /> Anomaly Detection</div>
            </div>
          </div>

          {/* Sonar visual */}
          <div className="relative">
            <div className="relative glass-strong p-4 rounded-2xl overflow-hidden">
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <span className="chip bg-danger-500/15 text-danger-400 border border-danger-500/30 text-[10px] font-mono">REC</span>
                <span className="chip bg-sonar-500/10 text-sonar-300 border border-sonar-500/30 text-[10px] font-mono">SSS-01</span>
              </div>
              <SonarImage seed="hero-sonar" variant="multi-debris" width={600} height={600} className="w-full rounded-lg" />
              {/* Sonar sweep overlay */}
              <div className="absolute inset-4 pointer-events-none flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full border border-sonar-400/20" />
                  <div className="absolute inset-0 rounded-full border border-sonar-400/10 animate-sweep" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 0, 50% 0)' }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sonar-400 shadow-glow" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 glass px-4 py-3 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-danger-500/15 flex items-center justify-center">
                <AlertTriangle size={20} className="text-danger-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Unknown Anomaly</div>
                <div className="font-mono text-sm text-white">Score: 82/100</div>
              </div>
            </div>
            <div className="absolute -top-3 -left-3 glass px-4 py-3 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sonar-500/15 flex items-center justify-center">
                <Target size={20} className="text-sonar-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Detections</div>
                <div className="font-mono text-sm text-white">5 objects</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-xl">
            <div className="w-11 h-11 rounded-lg bg-danger-500/10 border border-danger-500/20 flex items-center justify-center mb-4">
              <AlertTriangle size={22} className="text-danger-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">The Problem</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Millions of tons of marine debris accumulate on the ocean floor annually.
              Side-scan sonar surveys produce massive volumes of imagery that must be
              manually reviewed — a slow, subjective, and unscalable process. Critical
              anomalies are often missed, and cleanup prioritization lacks data-driven
              support.
            </p>
          </div>
          <div className="glass p-6 rounded-xl">
            <div className="w-11 h-11 rounded-lg bg-bio-500/10 border border-bio-500/20 flex items-center justify-center mb-4">
              <Brain size={22} className="text-bio-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">The Solution</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              SONARIS applies AI-based object detection to sonar imagery, automatically
              classifying debris, flagging unknown anomalies, computing an interpretable
              risk score, and routing uncertain detections to expert reviewers — creating
              a complete decision-support workflow from raw sonar scan to actionable
              inspection report.
            </p>
          </div>
        </div>
      </section>

      {/* Key Capabilities */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Key Capabilities</h2>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
            A complete pipeline from sonar ingestion to expert-verified, report-ready output.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: ScanLine, title: 'Sonar Image Analysis', desc: 'Upload or select demo side-scan sonar imagery with drag-and-drop support and automatic preprocessing.', color: 'sonar' },
            { icon: Brain, title: 'AI Debris Detection', desc: 'Object detection classifies fishing nets, plastics, metal, tires, ropes, containers, and other marine debris.', color: 'bio' },
            { icon: AlertTriangle, title: 'Unknown Anomaly Detection', desc: 'Flag regions that do not match any known class — a major differentiator for marine safety.', color: 'anomaly' },
            { icon: Target, title: 'Confidence Scoring', desc: 'Every detection includes an AI confidence score so reviewers can prioritize low-certainty cases.', color: 'warn' },
            { icon: Activity, title: 'Marine Risk Score', desc: 'An interpretable 0–100 risk score combining debris type, confidence, density, and anomaly signals.', color: 'danger' },
            { icon: ShieldCheck, title: 'Human-in-the-loop', desc: 'Experts confirm, reject, reclassify, annotate, and prioritize every AI detection before action.', color: 'sonar' },
            { icon: Globe2, title: 'Geo-spatial Mapping', desc: 'Survey map visualizes scan locations and risk zones across maritime sectors with demo coordinates.', color: 'bio' },
            { icon: FileText, title: 'Inspection Reports', desc: 'Generate downloadable inspection reports with detections, risk, recommendations, and limitations.', color: 'warn' },
            { icon: Eye, title: 'AI Explainability', desc: 'Each detection includes a plain-language explanation of why it was flagged, supporting transparency.', color: 'anomaly' },
          ].map((cap, i) => {
            const Icon = cap.icon;
            const colorMap: Record<string, string> = {
              sonar: 'text-sonar-400 bg-sonar-500/10 border-sonar-500/20',
              bio: 'text-bio-400 bg-bio-500/10 border-bio-500/20',
              warn: 'text-warn-400 bg-warn-500/10 border-warn-500/20',
              danger: 'text-danger-400 bg-danger-500/10 border-danger-500/20',
              anomaly: 'text-anomaly-400 bg-anomaly-500/10 border-anomaly-500/20',
            };
            return (
              <div key={i} className="glass p-5 rounded-xl hover:border-white/10 transition-colors group">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 border ${colorMap[cap.color]} group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-medium text-white mb-1.5">{cap.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workflow */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-center mb-10">End-to-End Workflow</h2>
        <div className="flex flex-col lg:flex-row items-stretch gap-3">
          {[
            'Side-Scan Sonar',
            'Image Ingestion',
            'Preprocessing',
            'AI Detection',
            'Classification + Anomaly',
            'Confidence + Risk',
            'Human Verification',
            'Analytics + Report',
          ].map((step, i, arr) => (
            <div key={i} className="flex items-center gap-3 lg:flex-1">
              <div className="flex-1 glass px-4 py-3 rounded-lg text-center">
                <div className="text-[10px] font-mono text-sonar-400 mb-1">STEP {i + 1}</div>
                <div className="text-sm text-slate-200">{step}</div>
              </div>
              {i < arr.length - 1 && <ArrowRight size={16} className="text-sonar-500/50 hidden lg:block shrink-0" />}
            </div>
          ))}
        </div>
      </section>

      {/* Environmental Impact */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="glass p-8 rounded-xl text-center">
          <div className="w-14 h-14 rounded-xl bg-bio-500/10 border border-bio-500/20 flex items-center justify-center mx-auto mb-4">
            <Leaf size={28} className="text-bio-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Environmental Impact</h2>
          <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
            SONARIS aims to accelerate the identification and cleanup of underwater
            marine debris — protecting marine ecosystems, reducing ghost-fishing
            mortality, and enabling data-driven environmental monitoring for India's
            coastal and deep-water territories.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass-strong p-10 rounded-2xl text-center relative overflow-hidden">
          <div className="absolute inset-0 sonar-grid opacity-20" />
          <div className="relative z-10">
            <Waves size={40} className="text-sonar-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-3">Ready to analyze sonar imagery?</h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Launch the analysis workspace or jump directly into a demo scenario to
              see the full detection-to-report workflow in action.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={onLaunch} className="btn-primary text-base px-6 py-3">
                Launch Sonar Analysis <ArrowRight size={18} />
              </button>
              <button onClick={onDemo} className="btn-outline text-base px-6 py-3">
                View Demo Scenarios
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <div className="text-xs text-slate-500 text-center sm:text-right">
            <p>SONARIS — Prototype Demo / Simulated Output</p>
            <p>SIH 2026 · PS 26057 · Ministry of Earth Sciences</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
