import { useMemo } from 'react';
import { DEBRIS_META, type Detection, type Scan } from '@/lib/types';

/* Lightweight custom charts — no charting library dependency.
   Renders as SVG so they stay crisp and themeable. */

export function DonutChart({
  data,
  size = 140,
  thickness = 16,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const len = (d.value / total) * circ;
          const seg = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <div className="space-y-1.5 flex-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
              <span className="text-slate-300">{d.label}</span>
            </div>
            <span className="font-mono text-slate-400">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarChart({
  data,
  height = 160,
  unit = '',
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  unit?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <div className="relative w-full flex-1 flex items-end">
            <div
              className="w-full rounded-t transition-all duration-500 group-hover:brightness-125"
              style={{
                height: `${(d.value / max) * 100}%`,
                background: d.color ?? '#1ad9ff',
                minHeight: d.value > 0 ? '4px' : '0',
              }}
            />
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {d.value}{unit}
            </div>
          </div>
          <span className="text-[10px] text-slate-500 truncate max-w-full">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({
  data,
  height = 120,
  color = '#1ad9ff',
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  const w = 100;
  const h = 100;
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const step = data.length > 1 ? w / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = i * step;
    const y = h - ((d.value - min) / range) * h;
    return [x, y];
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const areaPath = `${path} L${w},${h} L0,${h} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ height, width: '100%' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="1.5" fill={color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-[9px] text-slate-600">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export function Histogram({
  data,
  color = '#1ad9ff',
}: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-1.5">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 w-12 text-right">{d.label}</span>
          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%`, background: color }}
            />
          </div>
          <span className="font-mono text-slate-400 w-6 text-right">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

export function detectionsToCategoryData(detections: Detection[]) {
  const counts = new Map<string, number>();
  for (const d of detections) {
    counts.set(d.objectClass, (counts.get(d.objectClass) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, value]) => ({
      label,
      value,
      color: DEBRIS_META[label as keyof typeof DEBRIS_META]?.color ?? '#94a3b8',
    }))
    .sort((a, b) => b.value - a.value);
}

export function detectionsToRiskData(detections: Detection[]) {
  const high = detections.filter((d) => d.riskScore >= 70).length;
  const med = detections.filter((d) => d.riskScore >= 40 && d.riskScore < 70).length;
  const low = detections.filter((d) => d.riskScore < 40).length;
  return [
    { label: 'High', value: high, color: '#ef4444' },
    { label: 'Medium', value: med, color: '#f59e0b' },
    { label: 'Low', value: low, color: '#10b981' },
  ];
}

export function detectionsToConfidenceData(detections: Detection[]) {
  const buckets = [0, 0, 0, 0, 0];
  for (const d of detections) {
    const c = d.confidence;
    if (c >= 0.8) buckets[4]++;
    else if (c >= 0.6) buckets[3]++;
    else if (c >= 0.5) buckets[2]++;
    else if (c >= 0.4) buckets[1]++;
    else buckets[0]++;
  }
  return [
    { label: '<40%', value: buckets[0] },
    { label: '40-50%', value: buckets[1] },
    { label: '50-60%', value: buckets[2] },
    { label: '60-80%', value: buckets[3] },
    { label: '>80%', value: buckets[4] },
  ];
}

export function scansToTrendData(scans: Scan[]) {
  const sorted = [...scans].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const last8 = sorted.slice(-8);
  return last8.map((s) => ({
    label: new Date(s.createdAt).toLocaleDateString('en', { day: '2-digit', month: 'short' }),
    value: s.detections.length,
  }));
}
