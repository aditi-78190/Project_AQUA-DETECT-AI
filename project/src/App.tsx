import { useState, useEffect, useCallback } from 'react';
import { Shell, type Route } from '@/components/layout/Shell';
import { Landing } from '@/pages/Landing';
import { Dashboard } from '@/pages/Dashboard';
import { Analysis } from '@/pages/Analysis';
import { ScanHistory } from '@/pages/ScanHistory';
import { SurveyMap } from '@/pages/SurveyMap';
import { Reports } from '@/pages/Reports';
import { ModelPerformance } from '@/pages/ModelPerformance';
import { fetchScans, seedDemoScenarios } from '@/lib/store';
import type { Scan } from '@/lib/types';

export default function App() {
  const [route, setRoute] = useState<Route>('landing');
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportScanId, setReportScanId] = useState<string>();

  const loadScans = useCallback(async () => {
    try {
      const data = await fetchScans();
      setScans(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load scans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await seedDemoScenarios();
        await loadScans();
      } catch {
        setLoading(false);
      }
    })();
  }, [loadScans]);

  const handleScanCreated = (scan: Scan) => {
    setScans((prev) => [scan, ...prev]);
  };

  const handleDetectionUpdated = () => {
    loadScans();
  };

  const handleOpenScan = (scanId: string) => {
    setReportScanId(scanId);
    setRoute('reports');
  };

  const handleReport = (scanId: string) => {
    setReportScanId(scanId);
    setRoute('reports');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-abyss-950">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-sonar-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-sonar-400 animate-sweep" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sonar-400 shadow-glow" />
          </div>
          <p className="text-sm text-sonar-300 font-mono">Initializing SONARIS...</p>
        </div>
      </div>
    );
  }

  if (route === 'landing') {
    return (
      <Landing
        onLaunch={() => setRoute('dashboard')}
        onDemo={() => setRoute('analysis')}
      />
    );
  }

  return (
    <Shell current={route} onNavigate={setRoute}>
      {error && (
        <div className="glass p-4 rounded-xl mb-6 border border-danger-500/30 bg-danger-500/5">
          <p className="text-sm text-danger-300">
            Connection issue: {error}. Demo data may not be available. Try refreshing the page.
          </p>
        </div>
      )}
      {route === 'dashboard' && <Dashboard scans={scans} onAnalyze={() => setRoute('analysis')} />}
      {route === 'analysis' && (
        <Analysis
          scans={scans}
          onScanCreated={handleScanCreated}
          onDetectionUpdated={handleDetectionUpdated}
          onReport={handleReport}
        />
      )}
      {route === 'history' && <ScanHistory scans={scans} onOpenScan={handleOpenScan} />}
      {route === 'map' && <SurveyMap scans={scans} onOpenScan={handleOpenScan} />}
      {route === 'reports' && (
        <Reports
          scans={scans}
          selectedScanId={reportScanId}
          onSelectScan={setReportScanId}
        />
      )}
      {route === 'model' && <ModelPerformance />}
    </Shell>
  );
}
