# SONARIS — AI-Powered Underwater Marine Debris & Anomaly Detection System

**· Ministry of Earth Sciences**

> Turning Sonar Imagery into Actionable Marine Intelligence.

SONARIS is an AI-powered decision-support platform that converts side-scan sonar imagery into actionable marine intelligence by detecting marine debris, identifying unknown underwater anomalies, estimating risk, enabling expert verification, and prioritizing areas for inspection and cleanup.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [SIH Problem Statement](#sih-problem-statement)
3. [Problem Analysis](#problem-analysis)
4. [Proposed Solution](#proposed-solution)
5. [Key Features](#key-features)
6. [Architecture](#architecture)
7. [AI Pipeline](#ai-pipeline)
8. [Technology Stack](#technology-stack)
9. [Dataset Information](#dataset-information)
10. [Installation](#installation)
11. [Running Instructions](#running-instructions)
12. [API Documentation](#api-documentation)
13. [Demo Mode](#demo-mode)
14. [Model Training Instructions](#model-training-instructions)
15. [Evaluation Methodology](#evaluation-methodology)
16. [Limitations](#limitations)
17. [Future Scope](#future-scope)
18. [Team Contribution](#team-contribution)

---

## Project Overview

SONARIS is a prototype web application built for the Smart India Hackathon 2026 (Problem Statement PS 26057). It demonstrates a complete end-to-end workflow for analyzing side-scan sonar (SSS) imagery to detect, classify, and assess underwater marine debris and unknown anomalies.

The prototype is designed to look and behave like a serious marine technology + AI decision-support product — not a simple image-classification demo. It includes a full human-in-the-loop verification workflow, risk scoring, geo-spatial visualization, and report generation.

**Important:** This prototype uses **simulated/demo detection outputs**. No real trained AI model is included. All simulated components are clearly labeled as "Prototype Demo / Simulated Output."

---

## SIH Problem Statement

**PS 26057 — Ministry of Earth Sciences**

> AI-Powered Automated Underwater Marine Debris and Anomaly Detection System using Side-Scan Sonar Imagery.

The system must:
1. Detect underwater marine debris
2. Classify detected debris into meaningful categories
3. Detect unknown/unusual underwater anomalies
4. Draw bounding boxes around detected objects
5. Provide confidence scores
6. Calculate an interpretable Marine Debris Risk Score
7. Prioritize areas requiring human inspection or cleanup
8. Provide visual analytics and statistics
9. Generate a downloadable inspection/report summary
10. Maintain a clear human-in-the-loop workflow

---

## Problem Analysis

Millions of tons of marine debris accumulate on the ocean floor annually. Side-scan sonar surveys produce massive volumes of imagery that must be manually reviewed — a slow, subjective, and unscalable process. Critical anomalies are often missed, and cleanup prioritization lacks data-driven support.

Key challenges:
- **Volume:** Sonar surveys generate thousands of images per mission
- **Manual review:** Human annotation is slow and inconsistent
- **Anomaly detection:** Unusual objects fall outside trained classification boundaries
- **Prioritization:** No standardized risk framework for cleanup decisions
- **Scalability:** Manual review cannot keep pace with survey data growth

---

## Proposed Solution

SONARIS applies AI-based object detection to sonar imagery, automatically:
- Classifying debris into 7 categories (fishing net, plastic, metal, tire, rope, container, other)
- Flagging unknown anomalies that don't match any known class
- Computing an interpretable 0–100 Marine Debris Risk Score
- Routing uncertain detections to expert reviewers
- Generating downloadable inspection reports

The complete workflow:
**Sonar Image → AI Analysis → Debris Detection → Unknown Anomaly → Confidence → Risk Score → Human Verification → Action Recommendation → Report**

---

## Key Features

- **Sonar Image Upload:** Drag-and-drop support for JPG, PNG, TIFF, WebP (up to 20 MB)
- **Demo Mode:** 5 pre-configured sonar scenarios with realistic detection results
- **AI Detection Visualization:** Bounding boxes, confidence scores, color-coded by debris class
- **Unknown Anomaly Detection:** Flag regions that don't match known classes — a major differentiator
- **Marine Debris Risk Score:** Interpretable 0–100 score with plain-language explanation
- **Action Recommendations:** Risk-level-based cleanup/inspection guidance
- **Human-in-the-loop Verification:** Confirm, reject, reclassify, annotate, and prioritize detections
- **AI Explainability:** "Why was this detected?" explanation for each detection
- **Preprocessing Pipeline View:** Original → Enhanced → AI Input comparison (simulated)
- **Operations Dashboard:** KPIs, charts, verification status, anomaly statistics
- **Scan History:** Filterable scan records with risk, object type, and verification filters
- **Geo-spatial Survey Map:** Interactive map with risk zones and anomaly markers (demo coordinates)
- **Inspection Reports:** Downloadable report with scan info, detection table, recommendations, and limitations
- **Model Performance Page:** Architecture diagrams, API design, technology stack, and metric placeholders

---

## Architecture

### Current Architecture (Prototype)

```
Side-Scan Sonar
    ↓
Data Ingestion (file upload / demo selection)
    ↓
Preprocessing (grayscale, denoise, contrast, normalize — simulated)
    ↓
AI Detection Engine (mock detector — replaceable with YOLO)
    ↓
Debris Classification + Anomaly Detection (7 classes + unknown)
    ↓
Confidence + Risk Scoring (interpretable 0–100 score)
    ↓
Human Verification (confirm / reject / reclassify / annotate)
    ↓
Analytics Dashboard (KPIs, charts, scan history)
    ↓
Report / Action Recommendation (downloadable inspection report)
```

### Future Architecture (Production)

```
AUV/ROV + Sonar Sensor
    → Edge AI (onboard real-time inference)
    → Real-Time Detection (streaming sonar analysis)
    → Cloud / Ground Station (aggregation, storage, model updates)
    → GIS Dashboard (geospatial debris mapping & temporal analysis)
```

### Database Schema

The prototype uses Supabase (PostgreSQL) with three tables:

| Table | Purpose |
|-------|---------|
| `scans` | Stores scan metadata, risk scores, processing status |
| `detections` | Individual object detections linked to scans |
| `reviews` | Human verification decisions linked to detections |

All tables have Row Level Security enabled with open policies (single-tenant demo, no auth).

---

## AI Pipeline

The detection pipeline is structured so the mock detector can be replaced with a real trained model:

1. **Image Validation** — File type, size, and dimension checks
2. **Preprocessing** (simulated) — Grayscale conversion, noise reduction, contrast enhancement, normalization, speckle filtering, resizing, ROI extraction
3. **Object Detection** — Currently a mock engine that generates plausible bounding boxes and classifications. Designed to be replaced by a YOLO-family model served via FastAPI.
4. **Classification** — 7 debris classes + 1 unknown anomaly class
5. **Confidence Estimation** — Per-detection confidence score (0–1)
6. **Anomaly Detection** — Regions with low similarity to all known classes are flagged as "Unknown Anomaly" with an anomaly score
7. **Risk Scoring** — Weighted combination of object category, confidence, estimated size, debris density, and anomaly signals → 0–100 score
8. **Human Verification** — Expert review before final classification

The mock detection engine (`src/lib/detectionEngine.ts`) generates results based on image filename heuristics and random plausible parameters. The demo scenarios (`src/lib/demoScenarios.ts`) contain hand-authored realistic detection outputs.

---

## Technology Stack

### Frontend (Implemented)
- React 18 + TypeScript
- Vite 5 (build tool)
- Tailwind CSS 3 (styling)
- Lucide React (icons)
- Custom SVG charts (no charting library dependency)
- Supabase JS client (data persistence)

### Backend (Planned)
- Python + FastAPI
- PostgreSQL / Supabase (implemented for prototype data)

### AI (Planned)
- PyTorch
- OpenCV
- YOLO-family object detector

### Storage
- Supabase (PostgreSQL) — scan, detection, and review persistence

---

## Dataset Information

**No real dataset is used in this prototype.**

The demo scenarios contain hand-authored detection results that simulate what a trained model might output. These are clearly labeled as "Prototype Demo / Simulated Output."

For production, the system is designed to work with:
- Side-scan sonar imagery datasets with annotated marine debris
- Bounding box annotations for object detection training
- Anomaly labels for unknown object detection

No dataset sources, accuracy claims, or field trial results are fabricated.

---

## Installation

### Prerequisites
- Node.js 18+ and npm
- A Supabase project (already provisioned in this environment)

### Steps

```bash
# Install dependencies
npm install

# The .env file is pre-populated with Supabase credentials:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

---

## Running Instructions

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview

# Run type checking
npm run typecheck
```

The application will be available at `http://localhost:5173` (default Vite port).

On first launch, the app automatically seeds 5 demo scenarios into the database.

---

## API Documentation

The frontend uses a mock service layer backed by Supabase. The following endpoints define the conceptual API contract for a future FastAPI backend:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scans` | Upload a new sonar scan image |
| POST | `/api/detect` | Run AI detection on a scan |
| GET | `/api/scans` | Get scan history |
| GET | `/api/scans/{id}` | Get scan details with detections |
| GET | `/api/detections/{id}` | Get detection details |
| POST | `/api/detections/{id}/verify` | Submit human verification |
| GET | `/api/dashboard` | Get dashboard statistics |
| POST | `/api/report` | Generate inspection report |

The current implementation maps these to Supabase queries in `src/lib/store.ts`.

---

## Demo Mode

The prototype includes 5 demo scenarios accessible from the Sonar Analysis page:

| Scenario | Description |
|----------|-------------|
| Scenario 1 | Multiple marine debris objects (fishing net, plastic, container, metal, other) |
| Scenario 2 | Fishing net + metal debris (ghost-fishing hazard) |
| Scenario 3 | Unknown anomaly (requires expert verification) |
| Scenario 4 | Low-confidence / noisy sonar image |
| Scenario 5 | Clean seabed (no significant debris) |

All demo results are clearly labeled as "DEMO / SIMULATED OUTPUT."

The demo works without any external AI backend — all detection results are pre-generated.

---

## Model Training Instructions

**No model is trained in this prototype.**

For production deployment, the intended training workflow is:

1. Collect and annotate side-scan sonar imagery with bounding boxes for debris classes
2. Train a YOLO-family object detector (YOLOv8 or similar) using PyTorch
3. Include an "unknown" class or use anomaly detection (e.g., confidence thresholding, autoencoder-based anomaly scoring)
4. Export the trained model and serve via FastAPI
5. Replace the mock detector in `src/lib/detectionEngine.ts` with API calls to the FastAPI backend
6. Validate on a held-out labelled test set before reporting metrics

---

## Evaluation Methodology

**Prototype Demo Mode — Model metrics shown only when validated on an actual labelled test set.**

When a real model is trained and validated, the following metrics should be reported:
- Precision (per class and overall)
- Recall (per class and overall)
- F1 Score
- mAP (mean Average Precision)
- Inference time (ms per image)
- Training set size
- Number of classes

Never invent accuracy. The Model Performance page displays placeholder values ("—") until real validation is performed.

---

## Limitations

- **Simulated AI:** All detection results are pre-generated or mock-generated — not from a trained model
- **Simulated preprocessing:** Image preprocessing steps are visualized but not scientifically validated
- **Demo coordinates:** Geographic coordinates on the survey map are demo data, not real survey locations
- **Risk score:** The Marine Debris Risk Score is a decision-support estimate, not an officially validated environmental risk index
- **No real-time streaming:** The prototype processes static images only
- **No authentication:** The prototype has no login system (single-tenant demo)
- **No AUV/ROV integration:** Shown as future architecture only
- **Explainability:** Detection explanations are template-based, not from Grad-CAM or similar techniques

---

## Future Scope

- Real-time sonar stream processing
- AUV/ROV integration with edge AI inference
- Multi-sensor fusion (sonar + optical + bathymetric)
- GIS integration with historical marine debris maps
- Temporal change detection (tracking debris accumulation over time)
- Large-scale marine monitoring
- Automated cleanup prioritization
- Government environmental monitoring system integration
- Grad-CAM / attention heatmap visualization
- Real trained YOLO model with validated metrics
- Authentication and multi-user support
- Cloud deployment with Docker

---

## Team Contribution

| Member | Role |
|--------|------|
| Team Member 1 | Frontend development, UI/UX design |
| Team Member 2 | AI pipeline design, detection engine |
| Team Member 3 | Database schema, API design |
| Team Member 4 | Demo data, testing, documentation |
| Team Member 5 | Architecture, deployment planning |
| Team Member 6 | Presentation, requirements analysis |

---

## License

This prototype is built for the Smart India Hackathon 2026.

---

**SONARIS — Prototype Demo / Simulated Output**
**SIH 2026 · PS 26057 · Ministry of Earth Sciences**
