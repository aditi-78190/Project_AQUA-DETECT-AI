import { useMemo, useState } from 'react';
import { Map as MapIcon, MapPin, AlertTriangle, Navigation, Layers, Crosshair } from 'lucide-react';
import { PageHeader } from '@/components/layout/Shell';
import { RiskBadge, DemoBadge } from '@/components/ui/Badge';
import { DEMO_SCENARIOS } from '@/lib/demoScenarios';
import type { Scan, RiskLevel } from '@/lib/types';

interface Props {
  scans: Scan[];
  onOpenScan: (scanId: string) => void;
}

// Demo survey coordinates — clearly labeled as demo data.
// These do NOT represent actual marine survey locations.
const DEMO_COORDS: { lat: number; lng: number; label: string }[] = [
  { lat: 13.0827, lng: 80.2707, label: 'Bay of Bengal — Sector A7' },
  { lat: 19.076, lng: 72.8777, label: 'Arabian Sea — Sector C3' },
  { lat: 8.0, lng: 77.0, label: 'Indian Ocean — Sector D9' },
  { lat: 11.5, lng: 79.0, label: 'Bay of Bengal — Sector B2' },
  { lat: 21.0, lng: 70.0, label: 'Arabian Sea — Sector E1' },
];

// Project lat/lng to a simple SVG coordinate system for the map
function project(lat: number, lng: number, bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }, w: number, h: number) {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * w;
  const y = h - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * h;
  return { x, y };
}

export function SurveyMap({ scans, onOpenScan }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const bounds = { minLat: 5, maxLat: 24, minLng: 68, maxLng: 82 };
  const mapW = 800;
  const mapH = 600;

  // Build scan markers from demo scenarios + uploaded scans
  const markers = useMemo(() => {
    const result: { id: string; scanId: string; lat: number; lng: number; label: string; riskLevel: RiskLevel; riskScore: number; detections: number; anomalies: number; source: string }[] = [];

    // Demo scans from DB
    scans.forEach((s) => {
      if (s.scenarioKey) {
        const sc = DEMO_SCENARIOS.find((d) => d.key === s.scenarioKey);
        if (sc) {
          const anomalies = s.detections.filter((d) => d.objectClass === 'Unknown Anomaly').length;
          result.push({
            id: s.id,
            scanId: s.scanId,
            lat: sc.geo.lat,
            lng: sc.geo.lng,
            label: s.surveyArea,
            riskLevel: s.riskLevel,
            riskScore: s.riskScore,
            detections: s.detections.length,
            anomalies,
            source: s.source,
          });
        }
      }
    });

    // If no demo scans in DB yet, show scenario locations
    if (result.length === 0) {
      DEMO_SCENARIOS.forEach((sc, i) => {
        const coord = DEMO_COORDS[i] ?? { lat: sc.geo.lat, lng: sc.geo.lng, label: sc.surveyArea };
        result.push({
          id: `demo-${sc.key}`,
          scanId: sc.key,
          lat: coord.lat,
          lng: coord.lng,
          label: sc.surveyArea,
          riskLevel: sc.detections.length > 3 ? 'high' : sc.detections.length > 0 ? 'medium' : 'low',
          riskScore: sc.detections.length > 3 ? 85 : sc.detections.length > 0 ? 55 : 0,
          detections: sc.detections.length,
          anomalies: sc.detections.filter((d) => d.objectClass === 'Unknown Anomaly').length,
          source: 'demo',
        });
      });
    }

    return result;
  }, [scans]);

  const riskColors: Record<RiskLevel, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
  };

  return (
    <div>
      <PageHeader title="Marine Survey Map" subtitle="Geo-spatial view of scan locations and risk zones" icon={MapIcon}>
        <DemoBadge />
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="glass p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-white flex items-center gap-2">
                <Layers size={16} className="text-sonar-400" /> Indian Ocean Survey Region
              </h3>
              <span className="text-xs text-slate-500 font-mono">Demo Coordinates</span>
            </div>

            <div className="relative rounded-lg overflow-hidden bg-abyss-900 border border-white/5">
              <svg viewBox={`0 0 ${mapW} ${mapH}`} className="w-full" style={{ aspectRatio: `${mapW}/${mapH}` }}>
                {/* Ocean background */}
                <defs>
                  <radialGradient id="ocean-grad" cx="50%" cy="40%" r="70%">
                    <stop offset="0%" stopColor="#0d1b30" />
                    <stop offset="100%" stopColor="#070d18" />
                  </radialGradient>
                  <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,194,230,0.04)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width={mapW} height={mapH} fill="url(#ocean-grad)" />
                <rect width={mapW} height={mapH} fill="url(#map-grid)" />

                {/* Coastline approximation (India west coast) */}
                <path
                  d="M 120 80 Q 200 120 220 200 Q 240 300 200 400 Q 180 480 160 540 L 300 560 Q 350 480 380 400 Q 400 300 420 200 Q 440 120 500 80 Z"
                  fill="rgba(26,45,77,0.3)"
                  stroke="rgba(0,194,230,0.15)"
                  strokeWidth="1.5"
                />
                <text x="300" y="100" fill="rgba(148,163,184,0.4)" fontSize="14" fontFamily="monospace">INDIA</text>

                {/* Survey route lines */}
                {markers.length > 1 && (
                  <path
                    d={markers.map((m, i) => {
                      const p = project(m.lat, m.lng, bounds, mapW, mapH);
                      return `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="rgba(0,194,230,0.2)"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                )}

                {/* Risk zones (circles) */}
                {markers.map((m) => {
                  const p = project(m.lat, m.lng, bounds, mapW, mapH);
                  const color = riskColors[m.riskLevel];
                  const radius = m.riskLevel === 'high' ? 50 : m.riskLevel === 'medium' ? 35 : 25;
                  return (
                    <circle
                      key={`zone-${m.id}`}
                      cx={p.x}
                      cy={p.y}
                      r={radius}
                      fill={color}
                      opacity={0.08}
                      stroke={color}
                      strokeWidth="1"
                      strokeOpacity="0.2"
                    />
                  );
                })}

                {/* Markers */}
                {markers.map((m) => {
                  const p = project(m.lat, m.lng, bounds, mapW, mapH);
                  const color = riskColors[m.riskLevel];
                  const isHovered = hovered === m.id;
                  return (
                    <g
                      key={m.id}
                      className="cursor-pointer"
                      onClick={() => onOpenScan(m.scanId)}
                      onMouseEnter={() => setHovered(m.id)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {/* Pulse for high risk */}
                      {m.riskLevel === 'high' && (
                        <circle cx={p.x} cy={p.y} r="12" fill={color} opacity="0.3">
                          <animate attributeName="r" values="8;20;8" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {m.anomalies > 0 && (
                        <circle cx={p.x} cy={p.y} r="10" fill="#c084fc" opacity="0.25">
                          <animate attributeName="r" values="6;16;6" dur="2.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <circle cx={p.x} cy={p.y} r={isHovered ? 8 : 6} fill={color} stroke="#04070d" strokeWidth="2" />
                      {isHovered && (
                        <circle cx={p.x} cy={p.y} r="14" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
                      )}
                      <text x={p.x} y={p.y - 14} fill={color} fontSize="10" fontFamily="monospace" textAnchor="middle" opacity={isHovered ? 1 : 0.6}>
                        {m.label.split(' — ')[1] ?? m.label}
                      </text>
                    </g>
                  );
                })}

                {/* Compass */}
                <g transform={`translate(${mapW - 60}, 50)`}>
                  <circle r="24" fill="rgba(7,13,24,0.8)" stroke="rgba(0,194,230,0.2)" strokeWidth="1" />
                  <text x="0" y="-8" fill="#1ad9ff" fontSize="10" textAnchor="middle" fontFamily="monospace">N</text>
                  <path d="M 0 -4 L -4 8 L 0 4 L 4 8 Z" fill="#1ad9ff" />
                </g>
              </svg>

              {/* Hover tooltip */}
              {hovered && (() => {
                const m = markers.find((x) => x.id === hovered);
                if (!m) return null;
                return (
                  <div className="absolute bottom-4 left-4 glass-strong p-3 rounded-lg max-w-[220px] pointer-events-none">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} style={{ color: riskColors[m.riskLevel] }} />
                      <span className="text-sm text-white">{m.label}</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex justify-between"><span>Scan ID:</span><span className="font-mono text-sonar-300">{m.scanId}</span></div>
                      <div className="flex justify-between"><span>Detections:</span><span className="text-slate-200">{m.detections}</span></div>
                      {m.anomalies > 0 && <div className="flex justify-between"><span>Anomalies:</span><span className="text-anomaly-400">{m.anomalies}</span></div>}
                      <div className="flex justify-between"><span>Risk Score:</span><span className="text-slate-200">{m.riskScore}/100</span></div>
                      <div className="flex justify-between"><span>Coords:</span><span className="font-mono text-slate-500">{m.lat.toFixed(2)}, {m.lng.toFixed(2)}</span></div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: riskColors.high }} />
                <span className="text-xs text-slate-400">High Risk Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: riskColors.medium }} />
                <span className="text-xs text-slate-400">Medium Risk Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: riskColors.low }} />
                <span className="text-xs text-slate-400">Low Risk Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-anomaly-500" />
                <span className="text-xs text-slate-400">Anomaly Marker</span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation size={12} className="text-sonar-500/50" />
                <span className="text-xs text-slate-400">Survey Route</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side panel — scan list */}
        <div className="space-y-4">
          <div className="glass p-4 rounded-xl">
            <h3 className="font-medium text-white flex items-center gap-2 mb-3">
              <Crosshair size={16} className="text-sonar-400" /> Survey Locations
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {markers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onOpenScan(m.scanId)}
                  onMouseEnter={() => setHovered(m.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    hovered === m.id ? 'border-sonar-500/40 bg-sonar-500/10' : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white truncate">{m.label}</span>
                    <RiskBadge level={m.riskLevel} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono">{m.lat.toFixed(2)}, {m.lng.toFixed(2)}</span>
                    <span>{m.detections} det.</span>
                    {m.anomalies > 0 && (
                      <span className="flex items-center gap-1 text-anomaly-400">
                        <AlertTriangle size={10} /> {m.anomalies}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-anomaly-400" />
              <span className="text-sm font-medium text-white">Demo Data Notice</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Coordinates shown are demo data for prototype visualization only.
              They do not represent actual marine survey locations or real
              sonar measurements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
