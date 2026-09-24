import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'sonar',
  trend,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon: LucideIcon;
  accent?: 'sonar' | 'bio' | 'warn' | 'danger' | 'anomaly';
  trend?: { value: string; positive: boolean };
}) {
  const accentMap = {
    sonar: 'text-sonar-400 bg-sonar-500/10',
    bio: 'text-bio-400 bg-bio-500/10',
    warn: 'text-warn-400 bg-warn-500/10',
    danger: 'text-danger-400 bg-danger-500/10',
    anomaly: 'text-anomaly-400 bg-anomaly-500/10',
  };
  return (
    <div className="glass p-5 relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 blur-2xl bg-current" />
      <div className="flex items-start justify-between mb-3">
        <span className="label-muted">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentMap[accent]}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="flex items-center justify-between mt-2">
        {sub && <span className="text-xs text-slate-500">{sub}</span>}
        {trend && (
          <span className={`text-xs font-mono ${trend.positive ? 'text-bio-400' : 'text-danger-400'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
