import { DEBRIS_META, priorityFromScore, type DebrisClass, type Detection } from './types';

/*
 * Mock AI Detection Engine — SIMULATED.
 * Generates plausible detection results for uploaded sonar images.
 * The architecture is structured so this can be replaced by a real
 * YOLO/object-detection backend later without changing the calling code.
 */

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

const EXPLANATIONS: Record<DebrisClass, string[]> = {
  'Fishing Net': [
    'Mesh-like texture pattern with regular periodicity detected. Strong local contrast against seabed. High similarity to trained fishing-net patterns.',
    'Elongated region with repeating linear texture. Acoustic return consistent with entangled net material.',
  ],
  'Plastic Debris': [
    'Irregular bright reflector with defined edges. Morphology consistent with plastic sheeting or fragments.',
    'Bright patch with smooth boundary and moderate shadow. Visual features match plastic debris class.',
  ],
  'Metal Debris': [
    'High-intensity acoustic return with sharp shadow edge. Metallic reflectivity signature detected.',
    'Strong specular return adjacent to hard shadow. Pattern characteristic of metallic objects on seafloor.',
  ],
  'Tire/Rubber': [
    'Ring-shaped acoustic return with dark center. Size and geometry consistent with tire morphology.',
    'Circular reflector with rubber-like acoustic attenuation. Partial burial likely.',
  ],
  'Rope/Cable': [
    'Thin elongated linear reflector. Length-to-width ratio indicates rope or cable segment.',
    'Curvilinear feature with low but consistent acoustic return. Texture matches trained rope patterns.',
  ],
  'Container/Man-made Object': [
    'Sharp rectangular boundary with strong acoustic shadow. Geometric regularity indicates man-made origin.',
    'Box-like reflector with right-angle corners. High confidence in anthropogenic classification.',
  ],
  'Other Marine Debris': [
    'Low-contrast object with ambiguous texture. Weak match to known classes, classified as general debris.',
    'Diffuse reflector with no strong class signal. General debris category pending review.',
  ],
  'Unknown Anomaly': [
    'Low similarity to all known debris classes. Unusual shape/texture inconsistent with surrounding seabed. Strong local contrast anomaly. Expert verification required.',
    'Region shows atypical intensity distribution and texture discontinuity. No confident class match. Flagged for human review.',
  ],
};

function makeBbox(width: number, height: number) {
  const w = randInt(80, Math.min(260, Math.floor(width * 0.3)));
  const h = randInt(60, Math.min(220, Math.floor(height * 0.3)));
  const x = randInt(20, Math.max(30, width - w - 20));
  const y = randInt(20, Math.max(30, height - h - 20));
  return { x, y, w, h };
}

export interface DetectionConfig {
  numDetections: number;
  includeAnomaly: boolean;
  highNoise: boolean;
}

export function runMockDetection(
  imageName: string,
  width: number,
  height: number,
  config: DetectionConfig,
): Omit<Detection, 'id' | 'scanId' | 'createdAt'>[] {
  const classes: DebrisClass[] = [
    'Fishing Net',
    'Plastic Debris',
    'Metal Debris',
    'Tire/Rubber',
    'Rope/Cable',
    'Container/Man-made Object',
    'Other Marine Debris',
  ];

  const results: Omit<Detection, 'id' | 'scanId' | 'createdAt'>[] = [];
  const count = Math.max(0, config.numDetections);

  for (let i = 0; i < count; i++) {
    const cls = pick(classes);
    const meta = DEBRIS_META[cls];
    const confFloor = config.highNoise ? 0.38 : 0.62;
    const confidence = Math.min(0.98, rand(confFloor, confFloor + 0.4));
    const riskScore = Math.min(
      100,
      Math.max(20, Math.round(meta.baseRisk * confidence + rand(-8, 12))),
    );
    const bbox = makeBbox(width, height);
    const sizeM = +(rand(0.5, 4.5)).toFixed(1);

    results.push({
      objectClass: cls,
      confidence: +confidence.toFixed(2),
      riskScore,
      bbox,
      estimatedSizeM: sizeM,
      verificationStatus: 'ai_detected',
      priority: priorityFromScore(riskScore),
      explanation: pick(EXPLANATIONS[cls]),
    });
  }

  if (config.includeAnomaly) {
    const anomalyScore = randInt(72, 94);
    const conf = rand(0.38, 0.55);
    const riskScore = Math.min(100, Math.round(anomalyScore * 0.85 + 12));
    const bbox = makeBbox(width, height);
    results.push({
      objectClass: 'Unknown Anomaly',
      confidence: +conf.toFixed(2),
      riskScore,
      bbox,
      anomalyScore,
      estimatedSizeM: +(rand(1.5, 5.0)).toFixed(1),
      verificationStatus: 'ai_detected',
      priority: 'high',
      explanation: pick(EXPLANATIONS['Unknown Anomaly']),
    });
  }

  return results;
}

export function analyzeImageName(imageName: string): DetectionConfig {
  const lower = imageName.toLowerCase();
  const isNoisy = lower.includes('noisy') || lower.includes('noise') || lower.includes('low');
  const isClean = lower.includes('clean') || lower.includes('empty') || lower.includes('clear');
  const hasAnomaly = lower.includes('anomaly') || lower.includes('unknown') || lower.includes('weird');
  const hasMulti = lower.includes('multi') || lower.includes('debris') || lower.includes('clutter');

  if (isClean) {
    return { numDetections: 0, includeAnomaly: false, highNoise: false };
  }
  return {
    numDetections: isNoisy ? randInt(1, 2) : hasMulti ? randInt(4, 7) : randInt(2, 4),
    includeAnomaly: hasAnomaly || Math.random() < 0.35,
    highNoise: isNoisy,
  };
}
