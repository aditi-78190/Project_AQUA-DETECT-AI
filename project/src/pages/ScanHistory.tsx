import { useState, useMemo } from 'react';
import { History, Filter, Search, ScanLine, ChevronRight, AlertTriangle, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/Shell';
import { RiskBadge, StatusBadge, DemoBadge } from '@/components/ui/Badge';
import { DEBRIS_CLASSES, type Scan, type RiskLevel, type VerificationStatus } from '@/lib/types';

interface Props {
  scans: Scan[];
  onOpenScan: (scanId: string) => void;
}

type RiskFilter = 'all' | RiskLevel;
type StatusFilter = 'all' | VerificationStatus;
type ClassFilter = 'all' | string;

export function ScanHistory({ scans, onOpenScan }: Props) {
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [classFilter, setClassFilter] = useState<ClassFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return scans.filter((s) => {
      if (riskFilter !== 'all' && s.riskLevel !== riskFilter) return false;
      if (search && !s.surveyArea.toLowerCase().includes(search.toLowerCase()) && !s.scanId.toLowerCase().includes(search.toLowerCase())) return false;
      if (classFilter !== 'all' && !s.detections.some((d) => d.objectClass === classFilter)) return false;
      if (statusFilter !== 'all' && !s.detections.some((d) => d.verificationStatus === statusFilter)) return false;
      return true;
    });
  }, [scans, riskFilter, statusFilter, classFilter, search]);

  return (
    <div>
      <PageHeader title="Scan History" subtitle="Browse and filter all recorded sonar scans" icon={History} />

      {/* Filters */}
      <div className="glass p-4 rounded-xl mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter size={16} />
            <span className="text-sm">Filters:</span>
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by scan ID or survey area..."
              className="input pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input w-auto" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as RiskFilter)}>
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
          <select className="input w-auto" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <option value="all">All Object Types</option>
            {DEBRIS_CLASSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
            <option value="all">All Verification</option>
            <option value="ai_detected">AI Detected</option>
            <option value="under_review">Under Review</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Scan table */}
      {filtered.length > 0 ? (
        <div className="glass rounded-xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-4 py-3 label-muted">Scan ID</th>
                  <th className="px-4 py-3 label-muted">Date / Time</th>
                  <th className="px-4 py-3 label-muted">Survey Area</th>
                  <th className="px-4 py-3 label-muted">Detections</th>
                  <th className="px-4 py-3 label-muted">Anomalies</th>
                  <th className="px-4 py-3 label-muted">Risk</th>
                  <th className="px-4 py-3 label-muted">Status</th>
                  <th className="px-4 py-3 label-muted">Source</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const anomalies = s.detections.filter((d) => d.objectClass === 'Unknown Anomaly').length;
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition cursor-pointer"
                      onClick={() => onOpenScan(s.scanId)}
                    >
                      <td className="px-4 py-3 font-mono text-sonar-300 text-xs">{s.scanId}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{new Date(s.createdAt).toLocaleString('en', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-3 text-slate-200">{s.surveyArea}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Trash2 size={12} className="text-slate-500" /> {s.detections.length}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {anomalies > 0 ? (
                          <span className="flex items-center gap-1.5 text-anomaly-400">
                            <AlertTriangle size={12} /> {anomalies}
                          </span>
                        ) : (
                          <span className="text-slate-600">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3"><RiskBadge level={s.riskLevel} score={s.riskScore} /></td>
                      <td className="px-4 py-3">
                        <span className="chip bg-bio-500/10 text-bio-400 border border-bio-500/20 text-[10px]">
                          {s.processingStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {s.source === 'demo' ? <DemoBadge /> : <span className="chip bg-white/5 text-slate-400 border border-white/10 text-[10px]">Upload</span>}
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={16} className="text-slate-500" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-white/5">
            {filtered.map((s) => {
              const anomalies = s.detections.filter((d) => d.objectClass === 'Unknown Anomaly').length;
              return (
                <button
                  key={s.id}
                  onClick={() => onOpenScan(s.scanId)}
                  className="w-full text-left p-4 hover:bg-white/[0.03] transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-sonar-300">{s.scanId}</span>
                    <RiskBadge level={s.riskLevel} score={s.riskScore} />
                  </div>
                  <div className="text-sm text-white mb-1">{s.surveyArea}</div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{new Date(s.createdAt).toLocaleDateString('en', { day: '2-digit', month: 'short' })}</span>
                    <span>{s.detections.length} detections</span>
                    {anomalies > 0 && <span className="text-anomaly-400">{anomalies} anomalies</span>}
                    {s.source === 'demo' && <span className="text-slate-600">DEMO</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass p-12 rounded-xl text-center">
          <ScanLine size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No scans match the current filters.</p>
          <p className="text-sm text-slate-600 mt-1">Try adjusting your filters or run a new analysis.</p>
        </div>
      )}

      <div className="mt-4 text-xs text-slate-500">
        Showing {filtered.length} of {scans.length} scans
      </div>
    </div>
  );
}
