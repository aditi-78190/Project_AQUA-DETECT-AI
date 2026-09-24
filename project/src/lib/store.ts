import { supabase } from './supabaseClient';
import { DEMO_SCENARIOS } from './demoScenarios';
import {
  riskLevelFromScore,
  priorityFromScore,
  DEBRIS_META,
  type Scan,
  type Detection,
  type DebrisClass,
  type VerificationStatus,
  type RiskLevel,
} from './types';

function computeRiskScore(detections: Detection[]): number {
  if (detections.length === 0) return 0;
  let total = 0;
  let weightSum = 0;
  for (const d of detections) {
    const meta = DEBRIS_META[d.objectClass];
    const confWeight = d.confidence;
    const weight = meta.weight * (0.4 + 0.6 * confWeight);
    const score = meta.baseRisk * confWeight + (d.anomalyScore ?? 0) * 0.3;
    total += score * weight;
    weightSum += weight;
  }
  const densityBoost = detections.length > 4 ? 12 : detections.length > 2 ? 6 : 0;
  const raw = weightSum > 0 ? total / weightSum + densityBoost : 0;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

interface DbScan {
  id: string;
  scan_id: string;
  created_at: string;
  survey_area: string;
  image_name: string;
  image_width: number;
  image_height: number;
  file_size_kb: number;
  processing_status: string;
  risk_score: number;
  risk_level: string;
  source: string;
  scenario_key: string | null;
}

interface DbDetection {
  id: string;
  scan_id: string;
  object_class: string;
  confidence: number;
  risk_score: number;
  bbox_x: number;
  bbox_y: number;
  bbox_w: number;
  bbox_h: number;
  anomaly_score: number | null;
  estimated_size_m: number | null;
  verification_status: string;
  reviewer_notes: string | null;
  priority: string | null;
  explanation: string | null;
  created_at: string;
}

function dbRowToDetection(r: DbDetection): Detection {
  return {
    id: r.id,
    scanId: r.scan_id,
    objectClass: r.object_class as DebrisClass,
    confidence: Number(r.confidence),
    riskScore: r.risk_score,
    bbox: { x: r.bbox_x, y: r.bbox_y, w: r.bbox_w, h: r.bbox_h },
    anomalyScore: r.anomaly_score ?? undefined,
    estimatedSizeM: r.estimated_size_m ? Number(r.estimated_size_m) : undefined,
    verificationStatus: r.verification_status as VerificationStatus,
    reviewerNotes: r.reviewer_notes ?? undefined,
    priority: (r.priority as Detection['priority']) ?? 'low',
    explanation: r.explanation ?? '',
    createdAt: r.created_at,
  };
}

function dbRowToScan(row: DbScan, detections: Detection[]): Scan {
  return {
    id: row.id,
    scanId: row.scan_id,
    createdAt: row.created_at,
    surveyArea: row.survey_area,
    imageName: row.image_name,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    fileSizeKb: row.file_size_kb,
    processingStatus: row.processing_status as Scan['processingStatus'],
    riskScore: row.risk_score,
    riskLevel: row.risk_level as RiskLevel,
    source: row.source as Scan['source'],
    scenarioKey: row.scenario_key ?? undefined,
    detections,
    geo: undefined,
  };
}

export async function fetchScans(): Promise<Scan[]> {
  const { data: scans, error } = await supabase
    .from('scans')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  if (!scans || scans.length === 0) return [];

  const { data: dets, error: dErr } = await supabase
    .from('detections')
    .select('*')
    .in('scan_id', scans.map((s) => s.id))
    .order('created_at', { ascending: true });
  if (dErr) throw new Error(dErr.message);

  const byScan = new Map<string, Detection[]>();
  for (const d of (dets ?? []) as DbDetection[]) {
    const arr = byScan.get(d.scan_id) ?? [];
    arr.push(dbRowToDetection(d));
    byScan.set(d.scan_id, arr);
  }
  return (scans as DbScan[]).map((s) => dbRowToScan(s, byScan.get(s.id) ?? []));
}

export async function seedDemoScenarios(): Promise<void> {
  const { data: existing } = await supabase
    .from('scans')
    .select('id')
    .eq('source', 'demo')
    .limit(1);
  if (existing && existing.length > 0) return;

  for (const sc of DEMO_SCENARIOS) {
    const scanId = newId('SCN');
    const detections: Detection[] = sc.detections.map((d) => ({
      ...d,
      id: newId('DET'),
      scanId: '',
      createdAt: new Date().toISOString(),
    }));
    const risk = computeRiskScore(detections);
    const level = riskLevelFromScore(risk);
    const { data: scanRow, error } = await supabase
      .from('scans')
      .insert({
        scan_id: scanId,
        survey_area: sc.surveyArea,
        image_name: sc.imageName,
        image_width: 1024,
        image_height: 1024,
        file_size_kb: 2048,
        processing_status: 'completed',
        risk_score: risk,
        risk_level: level,
        source: 'demo',
        scenario_key: sc.key,
      })
      .select('id')
      .single();
    if (error || !scanRow) continue;

    const rows = detections.map((d) => ({
      scan_id: scanRow.id,
      object_class: d.objectClass,
      confidence: d.confidence,
      risk_score: d.riskScore,
      bbox_x: d.bbox.x,
      bbox_y: d.bbox.y,
      bbox_w: d.bbox.w,
      bbox_h: d.bbox.h,
      anomaly_score: d.anomalyScore ?? null,
      estimated_size_m: d.estimatedSizeM ?? null,
      verification_status: d.verificationStatus,
      reviewer_notes: d.reviewerNotes ?? null,
      priority: d.priority,
      explanation: d.explanation,
    }));
    if (rows.length > 0) {
      await supabase.from('detections').insert(rows);
    }
  }
}

export interface UploadedScanInput {
  surveyArea: string;
  imageName: string;
  imageWidth: number;
  imageHeight: number;
  fileSizeKb: number;
}

export async function createUploadScan(
  input: UploadedScanInput,
  detections: Omit<Detection, 'id' | 'scanId' | 'createdAt'>[],
): Promise<Scan> {
  const scanId = newId('SCN');
  const fullDets: Detection[] = detections.map((d) => ({
    ...d,
    id: newId('DET'),
    scanId: '',
    createdAt: new Date().toISOString(),
  }));
  const risk = computeRiskScore(fullDets);
  const level = riskLevelFromScore(risk);
  const { data: scanRow, error } = await supabase
    .from('scans')
    .insert({
      scan_id: scanId,
      survey_area: input.surveyArea,
      image_name: input.imageName,
      image_width: input.imageWidth,
      image_height: input.imageHeight,
      file_size_kb: input.fileSizeKb,
      processing_status: 'completed',
      risk_score: risk,
      risk_level: level,
      source: 'upload',
    })
    .select('id')
    .single();
  if (error || !scanRow) throw new Error(error?.message ?? 'Failed to create scan');

  const rows = fullDets.map((d) => ({
    scan_id: scanRow.id,
    object_class: d.objectClass,
    confidence: d.confidence,
    risk_score: d.riskScore,
    bbox_x: d.bbox.x,
    bbox_y: d.bbox.y,
    bbox_w: d.bbox.w,
    bbox_h: d.bbox.h,
    anomaly_score: d.anomalyScore ?? null,
    estimated_size_m: d.estimatedSizeM ?? null,
    verification_status: d.verificationStatus,
    reviewer_notes: d.reviewerNotes ?? null,
    priority: d.priority,
    explanation: d.explanation,
  }));
  if (rows.length > 0) {
    await supabase.from('detections').insert(rows);
  }

  return {
    id: scanRow.id,
    scanId,
    createdAt: new Date().toISOString(),
    surveyArea: input.surveyArea,
    imageName: input.imageName,
    imageWidth: input.imageWidth,
    imageHeight: input.imageHeight,
    fileSizeKb: input.fileSizeKb,
    processingStatus: 'completed',
    riskScore: risk,
    riskLevel: level,
    source: 'upload',
    detections: fullDets.map((d) => ({ ...d, scanId: scanRow.id })),
  };
}

export async function updateDetectionVerification(
  detectionId: string,
  status: VerificationStatus,
  notes?: string,
  newClass?: DebrisClass,
): Promise<void> {
  const update: Record<string, unknown> = {
    verification_status: status,
    reviewer_notes: notes ?? null,
  };
  if (newClass) update.object_class = newClass;
  if (newClass) update.risk_score = DEBRIS_META[newClass].baseRisk;
  if (newClass) update.priority = priorityFromScore(DEBRIS_META[newClass].baseRisk);
  const { error } = await supabase.from('detections').update(update).eq('id', detectionId);
  if (error) throw new Error(error.message);
}

export async function addReview(
  detectionId: string,
  decision: string,
  notes?: string,
  newClass?: string,
): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    detection_id: detectionId,
    decision,
    new_class: newClass ?? null,
    notes: notes ?? null,
  });
  if (error) throw new Error(error.message);
}

export function computeRiskForDetections(detections: Omit<Detection, 'id' | 'scanId' | 'createdAt'>[]): number {
  return computeRiskScore(detections as Detection[]);
}
