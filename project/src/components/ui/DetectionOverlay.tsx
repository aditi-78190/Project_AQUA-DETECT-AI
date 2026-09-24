import { useMemo, useState, useRef, useEffect } from 'react';
import { DEBRIS_META, confidenceLabel, type Detection } from '@/lib/types';

interface Props {
  detections: Detection[];
  width: number;
  height: number;
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function DetectionOverlay({ detections, width, height, selectedId, onSelect, className = '' }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
      {/* Detection boxes positioned absolutely as percentage */}
      {detections.map((d) => {
        const meta = DEBRIS_META[d.objectClass];
        const isSelected = selectedId === d.id;
        const isHovered = hoverId === d.id;
        const isActive = isSelected || isHovered;
        const isAnomaly = d.objectClass === 'Unknown Anomaly';

        const left = (d.bbox.x / width) * 100;
        const top = (d.bbox.y / height) * 100;
        const w = (d.bbox.w / width) * 100;
        const h = (d.bbox.h / height) * 100;

        return (
          <div
            key={d.id}
            className="absolute cursor-pointer transition-all duration-200"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${w}%`,
              height: `${h}%`,
              zIndex: isSelected ? 20 : 10,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(d.id);
            }}
            onMouseEnter={() => setHoverId(d.id)}
            onMouseLeave={() => setHoverId(null)}
          >
            {/* Box border */}
            <div
              className="absolute inset-0 rounded-sm transition-all"
              style={{
                border: `${isSelected ? 3 : 2}px solid ${meta.color}`,
                boxShadow: isActive ? `0 0 20px ${meta.color}80, inset 0 0 12px ${meta.color}30` : 'none',
                background: isActive ? `${meta.color}10` : 'transparent',
              }}
            />
            {/* Corner markers */}
            {isActive && (
              <>
                {[
                  [0, 0], [1, 0], [0, 1], [1, 1],
                ].map(([px, py], i) => (
                  <div
                    key={i}
                    className="absolute w-2.5 h-2.5 border-sonar-300"
                    style={{
                      left: px === 0 ? -4 : 'auto',
                      right: px === 1 ? -4 : 'auto',
                      top: py === 0 ? -4 : 'auto',
                      bottom: py === 1 ? -4 : 'auto',
                      borderColor: meta.color,
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderRightWidth: px === 1 ? '2px' : '0',
                      borderLeftWidth: px === 0 ? '2px' : '0',
                      borderTopWidth: py === 0 ? '2px' : '0',
                      borderBottomWidth: py === 1 ? '2px' : '0',
                    }}
                  />
                ))}
              </>
            )}

            {/* Label */}
            <div
              className={`absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium whitespace-nowrap transition-all ${isActive ? 'opacity-100' : 'opacity-80'}`}
              style={{
                background: meta.color,
                color: isAnomaly ? '#fff' : '#04070d',
              }}
            >
              {d.objectClass} · {Math.round(d.confidence * 100)}%
            </div>

            {/* Anomaly pulse */}
            {isAnomaly && (
              <div
                className="absolute inset-0 rounded-sm animate-ping2"
                style={{ border: `2px solid ${meta.color}`, animationDuration: '2s' }}
              />
            )}
          </div>
        );
      })}

      {/* Grid overlay */}
      <div className="absolute inset-0 sonar-grid opacity-30 pointer-events-none" />

      {/* Hover tooltip */}
      {hoverId && (() => {
        const d = detections.find((x) => x.id === hoverId);
        if (!d) return null;
        const meta = DEBRIS_META[d.objectClass];
        return (
          <div
            className="absolute pointer-events-none z-30 glass-strong px-3 py-2 text-xs max-w-48"
            style={{
              left: `${Math.min((d.bbox.x / width) * 100 + (d.bbox.w / width) * 100, 70)}%`,
              top: `${Math.min((d.bbox.y / height) * 100 + (d.bbox.h / height) * 100 + 4, 80)}%`,
            }}
          >
            <div className="font-mono font-medium mb-1" style={{ color: meta.color }}>{d.objectClass}</div>
            <div className="text-slate-400">Confidence: {confidenceLabel(d.confidence)} ({Math.round(d.confidence * 100)}%)</div>
            <div className="text-slate-400">Risk: {d.riskScore}/100</div>
            {d.anomalyScore && <div className="text-anomaly-400">Anomaly: {d.anomalyScore}/100</div>}
          </div>
        );
      })()}
    </div>
  );
}

export function DetectionLegend() {
  const items: { cls: string; color: string }[] = [
    { cls: 'Fishing Net', color: DEBRIS_META['Fishing Net'].color },
    { cls: 'Plastic', color: DEBRIS_META['Plastic Debris'].color },
    { cls: 'Metal', color: DEBRIS_META['Metal Debris'].color },
    { cls: 'Container', color: DEBRIS_META['Container/Man-made Object'].color },
    { cls: 'Anomaly', color: DEBRIS_META['Unknown Anomaly'].color },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((i) => (
        <div key={i.cls} className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-2" style={{ borderColor: i.color }} />
          <span className="text-xs text-slate-400">{i.cls}</span>
        </div>
      ))}
    </div>
  );
}
