/*
# SONARIS — Marine Debris Detection Schema

## Summary
Creates the core persistence layer for the SONARIS prototype: scans, detections,
and human reviews. This is a single-tenant prototype with no sign-in screen, so
all policies are open to anon + authenticated (intentionally shared demo data).

## Tables

### scans
- `id` (uuid, primary key)
- `scan_id` (text, human-readable scan identifier, unique)
- `created_at` (timestamptz)
- `survey_area` (text)
- `image_name` (text)
- `image_width` (int)
- `image_height` (int)
- `file_size_kb` (int)
- `processing_status` (text) — pending | processing | completed | failed
- `risk_score` (int) — 0–100
- `risk_level` (text) — low | medium | high
- `source` (text) — demo | upload
- `scenario_key` (text, nullable) — for demo scenarios

### detections
- `id` (uuid, primary key)
- `scan_id` (uuid, references scans, cascade delete)
- `object_class` (text)
- `confidence` (numeric) — 0–1
- `risk_score` (int)
- `bbox_x`, `bbox_y`, `bbox_w`, `bbox_h` (int) — bounding box in image px
- `anomaly_score` (int, nullable)
- `estimated_size_m` (numeric, nullable)
- `verification_status` (text) — ai_detected | under_review | verified | rejected
- `reviewer_notes` (text, nullable)
- `priority` (text, nullable) — low | medium | high
- `explanation` (text, nullable)
- `created_at` (timestamptz)

### reviews
- `id` (uuid, primary key)
- `detection_id` (uuid, references detections, cascade delete)
- `decision` (text) — confirmed | rejected | reclassified | unknown
- `new_class` (text, nullable)
- `notes` (text, nullable)
- `created_at` (timestamptz)

## Security
- RLS enabled on all tables.
- All tables open to anon + authenticated (single-tenant demo, no sign-in).
*/

CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  survey_area text NOT NULL DEFAULT 'Unknown Survey Area',
  image_name text NOT NULL,
  image_width int NOT NULL DEFAULT 0,
  image_height int NOT NULL DEFAULT 0,
  file_size_kb int NOT NULL DEFAULT 0,
  processing_status text NOT NULL DEFAULT 'completed',
  risk_score int NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'low',
  source text NOT NULL DEFAULT 'upload',
  scenario_key text
);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_scans" ON scans;
CREATE POLICY "anon_read_scans" ON scans FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scans" ON scans;
CREATE POLICY "anon_insert_scans" ON scans FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_scans" ON scans;
CREATE POLICY "anon_update_scans" ON scans FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scans" ON scans;
CREATE POLICY "anon_delete_scans" ON scans FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  object_class text NOT NULL,
  confidence numeric NOT NULL DEFAULT 0,
  risk_score int NOT NULL DEFAULT 0,
  bbox_x int NOT NULL DEFAULT 0,
  bbox_y int NOT NULL DEFAULT 0,
  bbox_w int NOT NULL DEFAULT 0,
  bbox_h int NOT NULL DEFAULT 0,
  anomaly_score int,
  estimated_size_m numeric,
  verification_status text NOT NULL DEFAULT 'ai_detected',
  reviewer_notes text,
  priority text,
  explanation text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE detections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_detections" ON detections;
CREATE POLICY "anon_read_detections" ON detections FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_detections" ON detections;
CREATE POLICY "anon_insert_detections" ON detections FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_detections" ON detections;
CREATE POLICY "anon_update_detections" ON detections FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_detections" ON detections;
CREATE POLICY "anon_delete_detections" ON detections FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_id uuid NOT NULL REFERENCES detections(id) ON DELETE CASCADE,
  decision text NOT NULL,
  new_class text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_reviews" ON reviews;
CREATE POLICY "anon_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reviews" ON reviews;
CREATE POLICY "anon_update_reviews" ON reviews FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;
CREATE POLICY "anon_delete_reviews" ON reviews FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_detections_scan_id ON detections(scan_id);
CREATE INDEX IF NOT EXISTS idx_detections_class ON detections(object_class);
CREATE INDEX IF NOT EXISTS idx_reviews_detection_id ON reviews(detection_id);
CREATE INDEX IF NOT EXISTS idx_scans_created ON scans(created_at DESC);
