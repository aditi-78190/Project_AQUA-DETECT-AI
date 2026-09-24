import { useMemo } from 'react';
import {
  ScanLine,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Gauge,
  Eye,
  Activity,
  Clock,
  Server,
  Database,
  Cpu,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { PageHeader } from '@/components/layout/Shell';
import { RiskBadge, DemoBadge } from '@/components/ui/Badge';
import {
  DonutChart,
  BarChart,
  LineChart,
  Histogram,
  detectionsToCategoryData,
  detectionsToRiskData,
  detectionsToConfidenceData,
  scansToTrendData,
} from '@/components/ui/Charts';
import type { Scan } from '@/lib/types';

interface Props {
  scans: Scan[];
  onAnalyze: () => void;
}

export function Dashboard({ scans, onAnalyze }: Props) {
  const stats = useMemo(() => {
    const allDetections = scans.flatMap((s) => s.detections);
    const totalScans = scans.length;
    const totalDebris = allDetections.filter((d) => d.objectClass !== 'Unknown Anomaly').length;
    const totalAnomalies = allDetections.filter((d) => d.objectClass === 'Unknown Anomaly').length;
    const highRiskZones = scans.filter((s) => s.riskLevel === 'high').length;
    const avgConfidence = allDetections.length > 0
      ? Math.round((allDetections.reduce((s, d) => s + d.confidence, 0) / allDetections.length) * 100)
      : 0;
    const needsInspection = allDetections.filter(
      (d) => d.verificationStatus === 'ai_detected' || d.verificationStatus === 'under_review'
    ).length;
    const verified = allDetections.filter((d) => d.verificationStatus === 'verified').length;
    const rejected = allDetections.filter((d) => d.verificationStatus === 'rejected').length;
    return {
      totalScans, totalDebris, totalAnomalies, highRiskZones, avgConfidence,
      needsInspection, verified, rejected, allDetections,
    };
  }, [scans]);

  const categoryData = useMemo(() => detectionsToCategoryData(stats.allDetections), [stats.allDetections]);
  const riskData = useMemo(() => detectionsToRiskData(stats.allDetections), [stats.allDetections]);
  const confData = useMemo(() => detectionsToConfidenceData(stats.allDetections), [stats.allDetections]);
  const trendData = useMemo(() => scansToTrendData(scans), [scans]);

  const lastScan = scans[0];
  const lastScanTime = lastScan ? new Date(lastScan.createdAt).toLocaleString('en', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  }) : 'No scans yet';

  return (
    <div>
      <PageHeader title="Operations Dashboard" subtitle="Marine debris detection overview and analytics" icon={ScanLine}>
        <div className="flex items-center gap-2">
          <DemoBadge />
          <button onClick={onAnalyze} className="btn-primary">
            <ScanLine size={16} /> New Analysis
          </button>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard label="Total Scans" value={stats.totalScans} icon={ScanLine} accent="sonar" sub="All-time" />
        <StatCard label="Debris Detected" value={stats.totalDebris} icon={Trash2} accent="warn" sub="Classified objects" />
        <StatCard label="Unknown Anomalies" value={stats.totalAnomalies} icon={AlertTriangle} accent="anomaly" sub="Need verification" />
        <StatCard label="High-Risk Zones" value={stats.highRiskZones} icon={ShieldAlert} accent="danger" sub="Score ≥ 70" />
        <StatCard label="Avg. Confidence" value={`${stats.avgConfidence}%`} icon={Gauge} accent="bio" sub="Across detections" />
        <StatCard label="Need Inspection" value={stats.needsInspection} icon={Eye} accent="sonar" sub="Pending review" />
      </div>

      {/* Status bar */}
      <div className="glass p-4 rounded-xl mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-bio-500/10 flex items-center justify-center">
            <Server size={16} className="text-bio-400" />
          </div>
          <div>
            <div className="label-muted">System</div>
            <div className="text-sm text-slate-200">Operational</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-warn-500/10 flex items-center justify-center">
            <Cpu size={16} className="text-warn-400" />
          </div>
          <div>
            <div className="label-muted">AI Model</div>
            <div className="text-sm text-slate-200">Demo / Simulated</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sonar-500/10 flex items-center justify-center">
            <Database size={16} className="text-sonar-400" />
          </div>
          <div>
            <div className="label-muted">Model Version</div>
            <div className="text-sm text-slate-200 font-mono">v0.3-demo</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-anomaly-500/10 flex items-center justify-center">
            <Clock size={16} className="text-anomaly-400" />
          </div>
          <div>
            <div className="label-muted">Last Scan</div>
            <div className="text-sm text-slate-200">{lastScanTime}</div>
          </div>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Debris category distribution */}
        <div className="glass p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white">Debris Category Distribution</h3>
            <Activity size={16} className="text-slate-500" />
          </div>
          {categoryData.length > 0 ? (
            <DonutChart data={categoryData} size={130} thickness={14} />
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No detections yet. Run an analysis to see data.</p>
          )}
        </div>

        {/* Risk distribution */}
        <div className="glass p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white">Risk Distribution</h3>
            <ShieldAlert size={16} className="text-slate-500" />
          </div>
          {stats.allDetections.length > 0 ? (
            <BarChart data={riskData} height={160} />
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No risk data available.</p>
          )}
        </div>

        {/* Confidence distribution */}
        <div className="glass p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white">Confidence Distribution</h3>
            <Gauge size={16} className="text-slate-500" />
          </div>
          {stats.allDetections.length > 0 ? (
            <Histogram data={confData} color="#1ad9ff" />
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No confidence data available.</p>
          )}
        </div>

        {/* Detection trend */}
        <div className="glass p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white">Detection Trend</h3>
            <Activity size={16} className="text-slate-500" />
          </div>
          {trendData.length > 1 ? (
            <LineChart data={trendData} height={140} />
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">Need at least 2 scans to show a trend.</p>
          )}
        </div>
      </div>

      {/* Recent scans + Anomaly stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass p-5 rounded-xl lg:col-span-2">
          <h3 className="font-medium text-white mb-4">Recent Scans</h3>
          {scans.length > 0 ? (
            <div className="space-y-2">
              {scans.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-sonar-300">{s.scanId}</span>
                      {s.source === 'demo' && <span className="text-[10px] text-slate-600 font-mono">DEMO</span>}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{s.surveyArea} · {s.detections.length} detections</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-500 hidden sm:block">{new Date(s.createdAt).toLocaleDateString('en', { day: '2-digit', month: 'short' })}</span>
                    <RiskBadge level={s.riskLevel} score={s.riskScore} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No scans yet. Run a demo scenario or upload a sonar image to get started.</p>
          )}
        </div>

        <div className="glass p-5 rounded-xl">
          <h3 className="font-medium text-white mb-4">Verification Status</h3>
          <div className="space-y-3">
            {[
              { label: 'AI Detected', value: stats.allDetections.filter(d => d.verificationStatus === 'ai_detected').length, color: '#1ad9ff' },
              { label: 'Under Review', value: stats.allDetections.filter(d => d.verificationStatus === 'under_review').length, color: '#f59e0b' },
              { label: 'Verified', value: stats.verified, color: '#10b981' },
              { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-sm text-slate-300">{s.label}</span>
                </div>
                <span className="font-mono text-sm text-slate-400">{s.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Anomaly Statistics</span>
              <span className="font-mono text-anomaly-400">{stats.totalAnomalies} flagged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
