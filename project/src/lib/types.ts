export type RiskLevel = 'low' | 'medium' | 'high';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type VerificationStatus = 'ai_detected' | 'under_review' | 'verified' | 'rejected';
export type ScanSource = 'demo' | 'upload';
export type Priority = 'low' | 'medium' | 'high';

export type DebrisClass =
  | 'Fishing Net'
  | 'Plastic Debris'
  | 'Metal Debris'
  | 'Tire/Rubber'
  | 'Rope/Cable'
  | 'Container/Man-made Object'
  | 'Other Marine Debris'
  | 'Unknown Anomaly';

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Detection {
  id: string;
  scanId: string;
  objectClass: DebrisClass;
  confidence: number;
  riskScore: number;
  bbox: BoundingBox;
  anomalyScore?: number;
  estimatedSizeM?: number;
  verificationStatus: VerificationStatus;
  reviewerNotes?: string;
  priority: Priority;
  explanation: string;
  createdAt: string;
}

export interface Scan {
  id: string;
  scanId: string;
  createdAt: string;
  surveyArea: string;
  imageName: string;
  imageWidth: number;
  imageHeight: number;
  fileSizeKb: number;
  processingStatus: ProcessingStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  source: ScanSource;
  scenarioKey?: string;
  detections: Detection[];
  geo?: { lat: number; lng: number };
}

export interface DemoScenario {
  key: string;
  title: string;
  description: string;
  surveyArea: string;
  imageName: string;
  geo: { lat: number; lng: number };
  detections: Omit<Detection, 'id' | 'scanId' | 'createdAt'>[];
}

export const DEBRIS_CLASSES: DebrisClass[] = [
  'Fishing Net',
  'Plastic Debris',
  'Metal Debris',
  'Tire/Rubber',
  'Rope/Cable',
  'Container/Man-made Object',
  'Other Marine Debris',
  'Unknown Anomaly',
];

export const DEBRIS_META: Record<DebrisClass, { color: string; baseRisk: number; weight: number }> = {
  'Fishing Net': { color: '#f59e0b', baseRisk: 78, weight: 1.2 },
  'Plastic Debris': { color: '#10b981', baseRisk: 62, weight: 1.0 },
  'Metal Debris': { color: '#1ad9ff', baseRisk: 70, weight: 1.1 },
  'Tire/Rubber': { color: '#f87171', baseRisk: 68, weight: 1.1 },
  'Rope/Cable': { color: '#a855f7', baseRisk: 55, weight: 0.9 },
  'Container/Man-made Object': { color: '#fb923c', baseRisk: 84, weight: 1.4 },
  'Other Marine Debris': { color: '#94a3b8', baseRisk: 45, weight: 0.8 },
  'Unknown Anomaly': { color: '#c084fc', baseRisk: 75, weight: 1.3 },
};

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function priorityFromScore(score: number): Priority {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function confidenceLabel(conf: number): string {
  const pct = Math.round(conf * 100);
  if (pct >= 80) return 'High';
  if (pct >= 60) return 'Moderate';
  if (pct >= 40) return 'Low';
  return 'Very Low';
}
