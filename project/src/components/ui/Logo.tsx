import { Waves } from 'lucide-react';

export function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-lg bg-sonar-500/10 border border-sonar-500/20" />
      <Waves className="text-sonar-400 relative z-10" style={{ width: size * 0.5, height: size * 0.5 }} />
      <div className="absolute inset-0 rounded-lg border border-sonar-400/40 animate-ping2" style={{ animationDuration: '3s' }} />
    </div>
  );
}

export function Logo({ textClass = 'text-white', sub = true }: { textClass?: string; sub?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={36} />
      <div className="leading-none">
        <div className={`font-mono font-semibold text-lg tracking-tight ${textClass}`}>SONARIS</div>
        {sub && <div className="text-[10px] text-slate-500 tracking-wider uppercase mt-0.5">Marine Intelligence</div>}
      </div>
    </div>
  );
}
