import { useState, useEffect, useMemo } from 'react';
import {
  ScanLine,
  Play,
  Loader2,
  AlertTriangle,
  Trash2,
  Eye,
  List,
  Download,
  Layers,
  ZoomIn,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/Shell';
import { UploadPanel } from '@/components/analysis/UploadPanel';
import { PreprocessingView } from '@/components/analysis/PreprocessingView';
import { DetectionOverlay, DetectionLegend } from '@/components/ui/DetectionOverlay';
import { VerificationPanel, DetectionDetailPanel } from '@/components/analysis/VerificationPanel';
import { RiskPanel } from '@/components/analysis/RiskPanel';
import { SonarImage } from '@/components/ui/SonarImage';
import { RiskBadge, StatusBadge, DemoBadge, Tag } from '@/components/ui/Badge';
import { DEBRIS_META, type Scan, type Detection, type VerificationStatus, type DebrisClass } from '@/lib/types';
import { DEMO_SCENARIOS } from '@/lib/demoScenarios';
import { createUploadScan, updateDetectionVerification, addReview, computeRiskForDetections } from '@/lib/store';
import { runMockDetection, analyzeImageName } from '@/lib/detectionEngine';

interface Props {
  scans: Scan[];
  onScanCreated: (scan: Scan) => void;
  onDetectionUpdated: () => void;
  onReport: (scanId: string) => void;
}

type Phase = 'idle' | 'processing' | 'results';

export function Analysis({ scans, onScanCreated, onDetectionUpdated, onReport }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [selectedDemo, setSelectedDemo] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; width: number; height: number } | null>(null);
  const [fileError, setFileError] = useState<string>();
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);
  const [selectedDetectionId, setSelectedDetectionId] = useState<string>();
  const [processingStep, setProcessingStep] = useState(0);
  const [viewMode, setViewMode] = useState<'original' | 'overlay'>('overlay');

  const processingSteps = [
    'Validating image...',
    'Converting to grayscale...',
    'Reducing noise...',
    'Enhancing contrast...',
    'Normalizing...',
    'Running AI detection...',
    'Classifying objects...',
    'Computing risk score...',
    'Finalizing results...',
  ];

  // Processing animation
  useEffect(() => {
    if (phase !== 'processing') return;
    setProcessingStep(0);
    const interval = setInterval(() => {
      setProcessingStep((s) => {
        if (s >= processingSteps.length - 1) {
          clearInterval(interval);
          return s;
        }
        return s + 1;
      });
    }, 280);
    return () => clearInterval(interval);
  }, [phase]);

  const selectedDetection = useMemo(
    () => currentScan?.detections.find((d) => d.id === selectedDetectionId) ?? null,
    [currentScan, selectedDetectionId],
  );

  const handleFileSelected = (file: File) => {
    setFileError(undefined);
    if (file.size > 20 * 1024 * 1024) {
      setFileError('File too large. Maximum size is 20 MB.');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'tif', 'tiff', 'webp'].includes(ext ?? '')) {
      setFileError('Unsupported format. Use JPG, PNG, TIFF, or WebP.');
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      setSelectedFile({
        name: file.name,
        size: file.size,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setSelectedDemo(undefined);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setFileError('Could not read this image. The file may be corrupted.');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleAnalyze = async () => {
    if (!selectedDemo && !selectedFile) return;
    setPhase('processing');

    // Simulate processing time
    await new Promise((r) => setTimeout(r, processingSteps.length * 280 + 500));

    let scan: Scan;
    if (selectedDemo) {
      const sc = DEMO_SCENARIOS.find((s) => s.key === selectedDemo)!;
      const detections: Detection[] = sc.detections.map((d) => ({
        ...d,
        id: `DET-${Math.random().toString(36).slice(2, 8)}`,
        scanId: '',
        createdAt: new Date().toISOString(),
      }));
      const risk = computeRiskForDetections(sc.detections);
      const level = risk >= 70 ? 'high' : risk >= 40 ? 'medium' : 'low';
      scan = {
        id: '',
        scanId: `SCN-${Date.now().toString(36).slice(-6).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        surveyArea: sc.surveyArea,
        imageName: sc.imageName,
        imageWidth: 1024,
        imageHeight: 1024,
        fileSizeKb: 2048,
        processingStatus: 'completed',
        riskScore: risk,
        riskLevel: level,
        source: 'demo',
        scenarioKey: sc.key,
        detections,
        geo: sc.geo,
      };
    } else {
      const config = analyzeImageName(selectedFile!.name);
      const mockDets = runMockDetection(selectedFile!.name, selectedFile!.width, selectedFile!.height, config);
      scan = await createUploadScan(
        {
          surveyArea: 'User Upload — Unspecified Area',
          imageName: selectedFile!.name,
          imageWidth: selectedFile!.width,
          imageHeight: selectedFile!.height,
          fileSizeKb: Math.round(selectedFile!.size / 1024),
        },
        mockDets,
      );
    }

    setCurrentScan(scan);
    onScanCreated(scan);
    setSelectedDetectionId(scan.detections[0]?.id);
    setPhase('results');
  };

  const handleVerify = async (status: VerificationStatus, notes?: string, newClass?: DebrisClass) => {
    if (!selectedDetection || !currentScan) return;
    await updateDetectionVerification(selectedDetection.id, status, notes, newClass);
    await addReview(
      selectedDetection.id,
      status === 'verified' ? 'confirmed' : status === 'rejected' ? 'rejected' : 'reclassified',
      notes,
      newClass,
    );

    // Update local state
    const updatedDetections = currentScan.detections.map((d) =>
      d.id === selectedDetection.id
        ? {
            ...d,
            verificationStatus: status,
            reviewerNotes: notes,
            objectClass: newClass ?? d.objectClass,
            riskScore: newClass ? DEBRIS_META[newClass].baseRisk : d.riskScore,
            priority: newClass ? (DEBRIS_META[newClass].baseRisk >= 70 ? 'high' as const : DEBRIS_META[newClass].baseRisk >= 40 ? 'medium' as const : 'low' as const) : d.priority,
          }
        : d,
    );
    const updatedScan = { ...currentScan, detections: updatedDetections };
    setCurrentScan(updatedScan);
    onDetectionUpdated();
  };

  const handleReset = () => {
    setPhase('idle');
    setCurrentScan(null);
    setSelectedDetectionId(undefined);
    setSelectedDemo(undefined);
    setSelectedFile(null);
    setFileError(undefined);
  };

  const scenarioVariant = currentScan?.scenarioKey
    ? (DEMO_SCENARIOS.find((s) => s.key === currentScan.scenarioKey)?.key as 'multi-debris' | 'net-metal' | 'anomaly' | 'noisy' | 'clean')
    : 'upload';

  return (
    <div>
      <PageHeader
        title="Sonar Image Analysis"
        subtitle="Upload or select demo sonar imagery for AI-powered debris and anomaly detection"
        icon={ScanLine}
      >
        {phase === 'results' && (
          <div className="flex items-center gap-2">
            {currentScan?.source === 'demo' && <DemoBadge />}
            <button onClick={handleReset} className="btn-ghost">
              <ScanLine size={16} /> New Scan
            </button>
            <button
              onClick={() => currentScan && onReport(currentScan.id)}
              className="btn-primary"
            >
              <Download size={16} /> Generate Report
            </button>
          </div>
        )}
      </PageHeader>

      {/* IDLE — upload / demo selection */}
      {phase === 'idle' && (
        <div className="max-w-3xl mx-auto">
          <div className="glass p-6 rounded-xl">
            <h2 className="text-lg font-medium text-white mb-1">Select Sonar Image</h2>
            <p className="text-sm text-slate-500 mb-5">
              Upload your own side-scan sonar image or choose a pre-loaded demo scenario.
            </p>
            <UploadPanel
              onFileSelected={handleFileSelected}
              onDemoSelected={setSelectedDemo}
              selectedDemo={selectedDemo}
              fileError={fileError}
              selectedFile={selectedFile}
              onClearFile={() => { setSelectedFile(null); setFileError(undefined); }}
            />
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleAnalyze}
                disabled={!selectedDemo && !selectedFile}
                className="btn-primary text-base px-6 py-2.5 flex-1 sm:flex-none"
              >
                <Play size={18} /> Analyze Sonar Image
              </button>
              {(selectedDemo || selectedFile) && (
                <span className="text-sm text-slate-500">
                  {selectedDemo ? 'Demo scenario ready' : `${selectedFile!.name} ready`}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROCESSING */}
      {phase === 'processing' && (
        <div className="max-w-2xl mx-auto">
          <div className="glass-strong p-10 rounded-xl text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-sonar-500/20" />
              <div className="absolute inset-0 rounded-full border-t-2 border-sonar-400 animate-sweep" />
              <Loader2 size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sonar-400 animate-spin" />
            </div>
            <h2 className="text-lg font-medium text-white mb-2">Analyzing Sonar Image</h2>
            <p className="text-sm text-sonar-300 mb-6 font-mono">{processingSteps[processingStep]}</p>
            <div className="w-full max-w-md mx-auto h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-sonar-400 transition-all duration-300"
                style={{ width: `${((processingStep + 1) / processingSteps.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 mt-4">
              {selectedDemo ? 'Demo mode — simulated detection' : 'Mock AI detection engine'}
            </p>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {phase === 'results' && currentScan && (
        <div className="space-y-6">
          {/* Scan info bar */}
          <div className="glass p-4 rounded-xl flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="label-muted">Scan ID:</span>
              <span className="font-mono text-sm text-sonar-300">{currentScan.scanId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="label-muted">Area:</span>
              <span className="text-sm text-slate-300">{currentScan.surveyArea}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="label-muted">Image:</span>
              <span className="text-sm text-slate-300">{currentScan.imageName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="label-muted">Detections:</span>
              <span className="font-mono text-sm text-white">{currentScan.detections.length}</span>
            </div>
            {currentScan.source === 'demo' && <DemoBadge />}
          </div>

          {currentScan.detections.length === 0 ? (
            <div className="glass p-12 rounded-xl text-center">
              <div className="w-14 h-14 rounded-full bg-bio-500/10 flex items-center justify-center mx-auto mb-4">
                <Eye size={28} className="text-bio-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Clean Seabed Detected</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                No significant marine debris or anomalies were detected in this scan.
                Risk score is low — no immediate action required.
              </p>
              <div className="mt-6">
                <RiskPanel scan={currentScan} />
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left: Sonar image + overlay + detection list */}
              <div className="lg:col-span-2 space-y-6">
                {/* Image viewer */}
                <div className="glass p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white flex items-center gap-2">
                      <Layers size={16} className="text-sonar-400" /> Detection Visualization
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex rounded-lg bg-abyss-900/60 border border-white/10 p-0.5">
                        <button
                          onClick={() => setViewMode('original')}
                          className={`px-3 py-1 rounded text-xs transition ${viewMode === 'original' ? 'bg-sonar-500/20 text-sonar-300' : 'text-slate-400'}`}
                        >
                          Original
                        </button>
                        <button
                          onClick={() => setViewMode('overlay')}
                          className={`px-3 py-1 rounded text-xs transition ${viewMode === 'overlay' ? 'bg-sonar-500/20 text-sonar-300' : 'text-slate-400'}`}
                        >
                          AI Overlay
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="relative rounded-lg overflow-hidden bg-abyss-900 border border-white/5">
                    <SonarImage
                      seed={currentScan.scenarioKey ?? currentScan.scanId}
                      variant={scenarioVariant}
                      width={1024}
                      height={1024}
                      className="w-full"
                    />
                    {viewMode === 'overlay' && (
                      <DetectionOverlay
                        detections={currentScan.detections}
                        width={1024}
                        height={1024}
                        selectedId={selectedDetectionId}
                        onSelect={setSelectedDetectionId}
                        className="absolute inset-0"
                      />
                    )}
                    {/* Crosshair when detection selected */}
                    {viewMode === 'overlay' && selectedDetection && (
                      <div className="absolute top-2 right-2 glass px-2 py-1 rounded text-[10px] font-mono text-sonar-300 pointer-events-none">
                        {currentScan.detections.findIndex(d => d.id === selectedDetection.id) + 1} / {currentScan.detections.length}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <DetectionLegend />
                    <span className="text-xs text-slate-600 font-mono">1024 × 1024 px</span>
                  </div>
                </div>

                {/* Preprocessing */}
                <PreprocessingView
                  seed={currentScan.scenarioKey ?? currentScan.scanId}
                  variant={scenarioVariant}
                  width={1024}
                  height={1024}
                />

                {/* Detection list */}
                <div className="glass p-4 rounded-xl">
                  <h3 className="font-medium text-white flex items-center gap-2 mb-4">
                    <List size={16} className="text-sonar-400" /> Detection List
                    <span className="text-xs text-slate-500 font-normal">({currentScan.detections.length} objects)</span>
                  </h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {currentScan.detections.map((d, i) => {
                      const meta = DEBRIS_META[d.objectClass];
                      const isSelected = selectedDetectionId === d.id;
                      return (
                        <button
                          key={d.id}
                          onClick={() => setSelectedDetectionId(d.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            isSelected
                              ? 'border-sonar-500/40 bg-sonar-500/10'
                              : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-[10px] text-slate-500 shrink-0">#{String(i + 1).padStart(2, '0')}</span>
                              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: meta.color }} />
                              <span className="text-sm text-white truncate">{d.objectClass}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-mono text-slate-400">{Math.round(d.confidence * 100)}%</span>
                              <RiskBadge level={d.riskScore >= 70 ? 'high' : d.riskScore >= 40 ? 'medium' : 'low'} />
                              <StatusBadge status={d.verificationStatus} />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Details + Verification + Risk */}
              <div className="space-y-6">
                {/* Detection details */}
                {selectedDetection && (
                  <div className="glass p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <ZoomIn size={16} className="text-sonar-400" />
                      <h3 className="font-medium text-white">Detection Details</h3>
                    </div>
                    <DetectionDetailPanel
                      detection={selectedDetection}
                      index={currentScan.detections.findIndex((d) => d.id === selectedDetection.id)}
                    />
                  </div>
                )}

                {/* Verification panel */}
                {selectedDetection && (
                  <VerificationPanel detection={selectedDetection} onVerify={handleVerify} />
                )}

                {/* Risk panel */}
                <RiskPanel scan={currentScan} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
