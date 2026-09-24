import { useState, useMemo } from 'react';
import { FileText, Download, Printer, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { PageHeader } from '@/components/layout/Shell';
import { RiskBadge, StatusBadge, DemoBadge } from '@/components/ui/Badge';
import { DEBRIS_META, type Scan, type RiskLevel } from '@/lib/types';

interface Props {
  scans: Scan[];
  selectedScanId?: string;
  onSelectScan: (id: string) => void;
}

const recommendations: Record<RiskLevel, string> = {
  high: 'Prioritize this zone for human inspection and potential cleanup. Deploy ROV/AUV for detailed assessment.',
  medium: 'Schedule secondary sonar or ROV inspection. Monitor during future survey missions.',
  low: 'Monitor during future survey missions. No immediate action required.',
};

export function Reports({ scans, selectedScanId, onSelectScan }: Props) {
  const [reportGenerated, setReportGenerated] = useState(false);

  const selectedScan = useMemo(
    () => scans.find((s) => s.scanId === selectedScanId) ?? scans[0] ?? null,
    [scans, selectedScanId],
  );

  const handleGenerate = () => {
    setReportGenerated(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (!selectedScan) {
    return (
      <div>
        <PageHeader title="Inspection Reports" subtitle="Generate downloadable inspection reports from scan results" icon={FileText} />
        <div className="glass p-12 rounded-xl text-center">
          <FileText size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No scans available to generate a report.</p>
          <p className="text-sm text-slate-600 mt-1">Run a demo scenario or upload a sonar image first.</p>
        </div>
      </div>
    );
  }

  const avgConfidence = selectedScan.detections.length > 0
    ? Math.round((selectedScan.detections.reduce((s, d) => s + d.confidence, 0) / selectedScan.detections.length) * 100)
    : 0;
  const anomalies = selectedScan.detections.filter((d) => d.objectClass === 'Unknown Anomaly').length;
  const debris = selectedScan.detections.filter((d) => d.objectClass !== 'Unknown Anomaly').length;

  return (
    <div>
      <PageHeader title="Inspection Reports" subtitle="Generate downloadable inspection reports from scan results" icon={FileText}>
        <button onClick={handleGenerate} className="btn-primary">
          <Download size={16} /> Generate & Download Report
        </button>
      </PageHeader>

      {/* Scan selector */}
      <div className="glass p-4 rounded-xl mb-6">
        <label className="label-muted mb-2 block">Select Scan for Report</label>
        <div className="flex flex-wrap gap-2">
          {scans.slice(0, 8).map((s) => (
            <button
              key={s.id}
              onClick={() => { onSelectScan(s.scanId); setReportGenerated(false); }}
              className={`chip border transition ${
                (selectedScanId ?? scans[0]?.scanId) === s.scanId
                  ? 'bg-sonar-500/15 text-sonar-300 border-sonar-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
              }`}
            >
              <span className="font-mono">{s.scanId}</span>
              <RiskBadge level={s.riskLevel} />
            </button>
          ))}
        </div>
      </div>

      {/* Report preview */}
      <div className="glass-strong rounded-xl overflow-hidden" id="report-content">
        {/* Report header */}
        <div className="bg-abyss-900/80 px-8 py-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">SONARIS</h2>
              <p className="text-sm text-slate-400">Underwater Sonar Inspection Report</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-mono">{new Date().toISOString().split('T')[0]}</div>
              {selectedScan.source === 'demo' && <DemoBadge />}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Scan Information */}
          <section>
            <h3 className="text-sm font-semibold text-sonar-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Info size={14} /> Scan Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <ReportField label="Scan ID" value={selectedScan.scanId} mono />
              <ReportField label="Date" value={new Date(selectedScan.createdAt).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })} />
              <ReportField label="Survey Area" value={selectedScan.surveyArea} />
              <ReportField label="Image" value={selectedScan.imageName} />
              <ReportField label="Image Dimensions" value={`${selectedScan.imageWidth} × ${selectedScan.imageHeight} px`} />
              <ReportField label="File Size" value={`${selectedScan.fileSizeKb} KB`} />
              <ReportField label="Source" value={selectedScan.source === 'demo' ? 'Demo Scenario' : 'User Upload'} />
              <ReportField label="Processing Status" value={selectedScan.processingStatus} />
            </div>
          </section>

          {/* AI Summary */}
          <section>
            <h3 className="text-sm font-semibold text-sonar-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle2 size={14} /> AI Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard label="Objects Detected" value={selectedScan.detections.length} />
              <SummaryCard label="Anomalies Detected" value={anomalies} accent={anomalies > 0 ? 'anomaly' : undefined} />
              <SummaryCard label="Debris Classified" value={debris} />
              <SummaryCard label="Avg. Confidence" value={`${avgConfidence}%`} />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="label-muted">Risk Score:</span>
              <RiskBadge level={selectedScan.riskLevel} score={selectedScan.riskScore} />
            </div>
          </section>

          {/* Detection Table */}
          {selectedScan.detections.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-sonar-300 uppercase tracking-wider mb-3">Detection Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-white/5 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-white/[0.03] border-b border-white/5 text-left">
                      <th className="px-3 py-2 label-muted">#</th>
                      <th className="px-3 py-2 label-muted">Object</th>
                      <th className="px-3 py-2 label-muted">Confidence</th>
                      <th className="px-3 py-2 label-muted">Risk</th>
                      <th className="px-3 py-2 label-muted">Size (est.)</th>
                      <th className="px-3 py-2 label-muted">Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedScan.detections.map((d, i) => {
                      const meta = DEBRIS_META[d.objectClass];
                      return (
                        <tr key={d.id} className="border-b border-white/5">
                          <td className="px-3 py-2 font-mono text-slate-500 text-xs">{i + 1}</td>
                          <td className="px-3 py-2">
                            <span className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: meta.color }} />
                              <span className="text-slate-200">{d.objectClass}</span>
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-slate-300">{Math.round(d.confidence * 100)}%</td>
                          <td className="px-3 py-2">
                            <RiskBadge level={d.riskScore >= 70 ? 'high' : d.riskScore >= 40 ? 'medium' : 'low'} score={d.riskScore} />
                          </td>
                          <td className="px-3 py-2 text-slate-400">{d.estimatedSizeM ? `${d.estimatedSizeM} m` : '—'}</td>
                          <td className="px-3 py-2"><StatusBadge status={d.verificationStatus} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Recommendations */}
          <section>
            <h3 className="text-sm font-semibold text-sonar-300 uppercase tracking-wider mb-3">Recommendations</h3>
            <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
              <p className="text-sm text-slate-300 leading-relaxed">{recommendations[selectedScan.riskLevel]}</p>
              {anomalies > 0 && (
                <p className="text-sm text-anomaly-300 mt-2 leading-relaxed">
                  {anomalies} unknown anomaly/anomalies detected — require expert verification before classification.
                </p>
              )}
            </div>
          </section>

          {/* Limitations */}
          <section>
            <h3 className="text-sm font-semibold text-sonar-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertCircle size={14} /> Limitations
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-400">
              <li className="flex gap-2"><span className="text-slate-600">•</span> This report is generated from a prototype demo system using simulated AI detection.</li>
              <li className="flex gap-2"><span className="text-slate-600">•</span> Detection results are pre-configured for demo scenarios, not from a trained model.</li>
              <li className="flex gap-2"><span className="text-slate-600">•</span> Risk scores are a decision-support estimate, not an officially validated environmental risk index.</li>
              <li className="flex gap-2"><span className="text-slate-600">•</span> Geographic coordinates (if shown) are demo data and do not represent real survey locations.</li>
              <li className="flex gap-2"><span className="text-slate-600">•</span> AI predictions should support, not replace, expert marine interpretation.</li>
            </ul>
          </section>

          {/* Footer */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-600">
            <span>SONARIS — Prototype Demo / Simulated Output</span>
            <span>SIH 2026 · PS 26057 · Ministry of Earth Sciences</span>
          </div>
        </div>
      </div>

      {reportGenerated && (
        <div className="mt-4 glass p-3 rounded-lg flex items-center gap-2 border border-bio-500/30 bg-bio-500/5">
          <CheckCircle2 size={16} className="text-bio-400" />
          <span className="text-sm text-bio-300">Report generated. Use your browser's print dialog to save as PDF.</span>
        </div>
      )}
    </div>
  );
}

function ReportField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="label-muted mb-1">{label}</div>
      <div className={`text-slate-200 ${mono ? 'font-mono text-xs' : ''}`}>{value}</div>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string | number; accent?: 'anomaly' }) {
  const color = accent === 'anomaly' ? 'text-anomaly-400' : 'text-white';
  return (
    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
      <div className="label-muted mb-1">{label}</div>
      <div className={`font-mono text-xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
