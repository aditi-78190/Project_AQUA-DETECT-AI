import type { DemoScenario } from './types';

/*
 * Demo scenarios — pre-generated, clearly simulated detection outputs.
 * These do NOT come from a trained model. They are hand-authored realistic
 * results for the SIH prototype demonstration.
 * Bounding boxes are in image-pixel coordinates (1024x1024 reference canvas).
 */

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    key: 'multi-debris',
    title: 'Scenario 1 — Multiple Marine Debris Objects',
    description:
      'A cluttered seabed with several anthropogenic objects: fishing net, plastic, and a man-made container. High debris density.',
    surveyArea: 'Bay of Bengal — Survey Sector A7',
    imageName: 'sonar_multi_debris_demo.png',
    geo: { lat: 13.0827, lng: 80.2707 },
    detections: [
      {
        objectClass: 'Fishing Net',
        confidence: 0.94,
        riskScore: 86,
        bbox: { x: 120, y: 140, w: 200, h: 150 },
        estimatedSizeM: 3.2,
        verificationStatus: 'ai_detected',
        priority: 'high',
        explanation:
          'High visual similarity to trained fishing-net texture patterns. Strong local contrast and net-like mesh structure detected against flat seabed.',
      },
      {
        objectClass: 'Plastic Debris',
        confidence: 0.88,
        riskScore: 64,
        bbox: { x: 380, y: 200, w: 110, h: 90 },
        estimatedSizeM: 1.1,
        verificationStatus: 'ai_detected',
        priority: 'medium',
        explanation:
          'Irregular bright reflector with defined boundaries, consistent with plastic sheeting morphology.',
      },
      {
        objectClass: 'Container/Man-made Object',
        confidence: 0.91,
        riskScore: 88,
        bbox: { x: 560, y: 120, w: 170, h: 160 },
        estimatedSizeM: 2.8,
        verificationStatus: 'ai_detected',
        priority: 'high',
        explanation:
          'Sharp rectangular boundary with strong acoustic shadow. Geometric regularity indicates man-made origin.',
      },
      {
        objectClass: 'Metal Debris',
        confidence: 0.76,
        riskScore: 71,
        bbox: { x: 760, y: 300, w: 130, h: 100 },
        estimatedSizeM: 1.6,
        verificationStatus: 'ai_detected',
        priority: 'high',
        explanation:
          'High-intensity acoustic return with adjacent shadow region, characteristic of metallic objects on the seafloor.',
      },
      {
        objectClass: 'Other Marine Debris',
        confidence: 0.58,
        riskScore: 42,
        bbox: { x: 300, y: 520, w: 90, h: 70 },
        estimatedSizeM: 0.7,
        verificationStatus: 'ai_detected',
        priority: 'medium',
        explanation:
          'Low-contrast object with ambiguous texture. Classified as general debris due to weak match to known classes.',
      },
    ],
  },
  {
    key: 'net-metal',
    title: 'Scenario 2 — Fishing Net + Metal Debris',
    description:
      'A long fishing net draped across the seabed with an adjacent metallic object. Represents a ghost-fishing hazard.',
    surveyArea: 'Arabian Sea — Survey Sector C3',
    imageName: 'sonar_net_metal_demo.png',
    geo: { lat: 19.076, lng: 72.8777 },
    detections: [
      {
        objectClass: 'Fishing Net',
        confidence: 0.96,
        riskScore: 91,
        bbox: { x: 80, y: 300, w: 480, h: 90 },
        estimatedSizeM: 8.5,
        verificationStatus: 'ai_detected',
        priority: 'high',
        explanation:
          'Extended linear texture with repeating mesh pattern spanning a large area — classic ghost-net signature. High environmental impact.',
      },
      {
        objectClass: 'Metal Debris',
        confidence: 0.82,
        riskScore: 74,
        bbox: { x: 620, y: 260, w: 150, h: 120 },
        estimatedSizeM: 2.1,
        verificationStatus: 'ai_detected',
        priority: 'high',
        explanation:
          'Bright acoustic return with hard shadow edge. Metallic reflectivity signature detected.',
      },
      {
        objectClass: 'Rope/Cable',
        confidence: 0.71,
        riskScore: 52,
        bbox: { x: 200, y: 560, w: 260, h: 30 },
        estimatedSizeM: 4.0,
        verificationStatus: 'ai_detected',
        priority: 'medium',
        explanation:
          'Thin elongated reflector adjacent to net region. Texture consistent with rope or cable segment.',
      },
    ],
  },
  {
    key: 'anomaly',
    title: 'Scenario 3 — Unknown Anomaly',
    description:
      'An unusual object with no confident match to known debris classes. Requires expert verification.',
    surveyArea: 'Indian Ocean — Survey Sector D9',
    imageName: 'sonar_anomaly_demo.png',
    geo: { lat: 8.0, lng: 77.0 },
    detections: [
      {
        objectClass: 'Unknown Anomaly',
        confidence: 0.43,
        riskScore: 78,
        bbox: { x: 340, y: 280, w: 220, h: 200 },
        anomalyScore: 82,
        estimatedSizeM: 3.5,
        verificationStatus: 'ai_detected',
        priority: 'high',
        explanation:
          'Low similarity to all known debris classes. Unusual shape and texture inconsistent with surrounding seabed pattern. Strong local contrast anomaly. Expert verification required.',
      },
      {
        objectClass: 'Other Marine Debris',
        confidence: 0.51,
        riskScore: 38,
        bbox: { x: 700, y: 600, w: 100, h: 80 },
        estimatedSizeM: 0.9,
        verificationStatus: 'ai_detected',
        priority: 'low',
        explanation:
          'Small ambiguous reflector, low confidence. Classified as general debris pending review.',
      },
    ],
  },
  {
    key: 'noisy',
    title: 'Scenario 4 — Low-Confidence / Noisy Sonar',
    description:
      'A low-quality sonar image with high speckle noise. Only weak, low-confidence detections are possible.',
    surveyArea: 'Bay of Bengal — Survey Sector B2',
    imageName: 'sonar_noisy_demo.png',
    geo: { lat: 11.5, lng: 79.0 },
    detections: [
      {
        objectClass: 'Other Marine Debris',
        confidence: 0.41,
        riskScore: 35,
        bbox: { x: 260, y: 380, w: 120, h: 100 },
        estimatedSizeM: 1.0,
        verificationStatus: 'ai_detected',
        priority: 'low',
        explanation:
          'Weak reflector detected amid high speckle noise. Low confidence — recommend secondary survey with adjusted gain.',
      },
      {
        objectClass: 'Rope/Cable',
        confidence: 0.38,
        riskScore: 30,
        bbox: { x: 600, y: 300, w: 180, h: 40 },
        estimatedSizeM: 2.2,
        verificationStatus: 'ai_detected',
        priority: 'low',
        explanation:
          'Elongated feature below confidence threshold. Likely noise artifact or partially buried cable. Requires confirmation.',
      },
    ],
  },
  {
    key: 'clean',
    title: 'Scenario 5 — Clean Seabed',
    description:
      'A clear seabed with no significant debris. Baseline scan for comparison.',
    surveyArea: 'Arabian Sea — Survey Sector E1',
    imageName: 'sonar_clean_demo.png',
    geo: { lat: 21.0, lng: 70.0 },
    detections: [],
  },
];
