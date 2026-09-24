import { ShieldAlert, Lightbulb, Info } from 'lucide-react';
import type { Scan } from '@/lib/types';
import { RiskBadge } from '@/components/ui/Badge';

interface Props {
  scan: Scan;
}

const recommendations: Record<string, { text: string; color: string }> = {
  high: {
    text: 'Prioritize this zone for human inspection and potential cleanup. Deploy ROV/AUV for detailed assessment.',
    color: 'text-danger-400 bg-danger-500/10 border-danger-500/20',
  },
  medium: {
    text: 'Schedule secondary sonar or ROV inspection. Monitor during future survey missions.',
    color: 'text-warn-400 bg-warn-500/10 border-warn-500/20',
  },
  low: {
    text: 'Monitor during future survey missions. No immediate action required.',
    color: 'text-bio-400 bg-bio-500/10 border-bio-500/20',
  },
};

export function RiskPanel({ scan }: Props) {
  const rec = recommendations[scan.riskLevel];
  const hasAnomaly = scan.detections.some((d) => d.objectClass === 'Unknown Anomaly');

  const scoreColor = scan.riskScore >= 70 ? '#ef4444' : scan.riskScore >= 40 ? '#f59e0b' : '#10b981';
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (scan.riskScore / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Risk Score Gauge */}
      <div className="glass-strong p-5 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={18} className="text-sonar-400" />
          <h3 className="font-medium text-white">Marine Debris Risk Score</h3>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 shrink-0">
            <svg width="128" height="128" className="-rotate-90">
              <circle cx="64" cy="64" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle
                cx="64" cy="64" r="52"
                fill="none"
                stroke={scoreColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-bold text-white">{scan.riskScore}</span>
              <span className="text-[10px] text-slate-500">/ 100</span>
            </div>
          </div>
          <div className="flex-1">
            <RiskBadge level={scan.riskLevel} />
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {scan.riskLevel === 'high' && 'High-risk zone due to multiple detected anthropogenic objects and high debris concentration.'}
              {scan.riskLevel === 'medium' && 'Moderate risk — some debris detected with medium confidence. Monitoring recommended.'}
              {scan.riskLevel === 'low' && 'Low risk — minimal or no significant debris detected in this scan.'}
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/5 flex gap-2">
          <Info size={14} className="text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500">
            Prototype decision-support score — not an officially validated environmental risk index.
            Combines object category, confidence, estimated size, debris density, and anomaly signals.
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className={`glass-strong p-5 rounded-xl border ${rec.color}`}>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={18} />
          <h3 className="font-medium text-white">Recommended Action</h3>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{rec.text}</p>
        {hasAnomaly && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-anomaly-400 animate-pulse" />
              <span className="text-sm font-medium text-anomaly-300">Unknown anomaly detected</span>
            </div>
            <p className="text-xs text-slate-400">
              Require expert verification before classification. Do not auto-classify without human review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
