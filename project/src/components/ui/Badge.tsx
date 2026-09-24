import type { ReactNode } from 'react';
import type { RiskLevel, VerificationStatus } from '@/lib/types';

const riskConfig: Record<RiskLevel, { label: string; className: string; dot: string }> = {
  high: { label: 'HIGH', className: 'bg-danger-500/15 text-danger-400 border border-danger-500/30', dot: 'bg-danger-500' },
  medium: { label: 'MEDIUM', className: 'bg-warn-500/15 text-warn-400 border border-warn-500/30', dot: 'bg-warn-500' },
  low: { label: 'LOW', className: 'bg-bio-500/15 text-bio-400 border border-bio-500/30', dot: 'bg-bio-500' },
};

export function RiskBadge({ level, score }: { level: RiskLevel; score?: number }) {
  const c = riskConfig[level];
  return (
    <span className={`chip ${c.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}{score !== undefined ? ` · ${score}/100` : ''}
    </span>
  );
}

const statusConfig: Record<VerificationStatus, { label: string; className: string; dot: string }> = {
  ai_detected: { label: 'AI Detected', className: 'bg-sonar-500/10 text-sonar-300 border border-sonar-500/30', dot: 'bg-sonar-400' },
  under_review: { label: 'Under Review', className: 'bg-warn-500/10 text-warn-400 border border-warn-500/30', dot: 'bg-warn-500' },
  verified: { label: 'Verified', className: 'bg-bio-500/10 text-bio-400 border border-bio-500/30', dot: 'bg-bio-500' },
  rejected: { label: 'Rejected', className: 'bg-danger-500/10 text-danger-400 border border-danger-500/30', dot: 'bg-danger-500' },
};

export function StatusBadge({ status }: { status: VerificationStatus }) {
  const c = statusConfig[status];
  return (
    <span className={`chip ${c.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function DemoBadge() {
  return (
    <span className="chip bg-anomaly-500/15 text-anomaly-400 border border-anomaly-500/30 font-mono text-[10px] uppercase tracking-wider">
      Demo / Simulated
    </span>
  );
}

export function Tag({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="chip border border-white/10 bg-white/5 text-slate-300"
      style={color ? { borderColor: `${color}40`, color } : undefined}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color ?? '#94a3b8' }} />
      {children}
    </span>
  );
}
