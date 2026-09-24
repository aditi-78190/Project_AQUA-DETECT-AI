import { useState } from 'react';
import {
  Check,
  X,
  Pencil,
  AlertCircle,
  StickyNote,
  Flag,
} from 'lucide-react';
import {
  DEBRIS_CLASSES,
  DEBRIS_META,
  type Detection,
  type DebrisClass,
  type VerificationStatus,
  type Priority,
} from '@/lib/types';
import { StatusBadge, RiskBadge } from '@/components/ui/Badge';

interface Props {
  detection: Detection;
  onVerify: (status: VerificationStatus, notes?: string, newClass?: DebrisClass) => void;
}

export function VerificationPanel({ detection, onVerify }: Props) {
  const [notes, setNotes] = useState(detection.reviewerNotes ?? '');
  const [newClass, setNewClass] = useState<DebrisClass | ''>('');
  const [showClassSelect, setShowClassSelect] = useState(false);

  const handleAction = (status: VerificationStatus) => {
    onVerify(status, notes || undefined, newClass || undefined);
  };

  return (
    <div className="glass-strong p-5 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-white">Human Verification</h3>
        <StatusBadge status={detection.verificationStatus} />
      </div>

      {/* Current class */}
      <div>
        <div className="label-muted mb-1.5">Object Class</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm" style={{ background: DEBRIS_META[detection.objectClass].color }} />
          <span className="text-sm text-white">{detection.objectClass}</span>
        </div>
      </div>

      {/* Risk */}
      <div className="flex items-center gap-2">
        <span className="label-muted">Risk:</span>
        <RiskBadge level={detection.riskScore >= 70 ? 'high' : detection.riskScore >= 40 ? 'medium' : 'low'} score={detection.riskScore} />
      </div>

      {/* Reclassify */}
      {showClassSelect && (
        <div>
          <div className="label-muted mb-1.5">Reclassify as</div>
          <select
            className="input"
            value={newClass}
            onChange={(e) => setNewClass(e.target.value as DebrisClass)}
          >
            <option value="">Select new class...</option>
            {DEBRIS_CLASSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Notes */}
      <div>
        <div className="label-muted mb-1.5 flex items-center gap-1.5">
          <StickyNote size={12} /> Reviewer Notes
        </div>
        <textarea
          className="input min-h-[70px] resize-none"
          placeholder="Add expert notes about this detection..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleAction('verified')}
          className="btn bg-bio-500/15 text-bio-400 hover:bg-bio-500/25 border border-bio-500/30"
        >
          <Check size={16} /> Confirm
        </button>
        <button
          onClick={() => handleAction('rejected')}
          className="btn bg-danger-500/15 text-danger-400 hover:bg-danger-500/25 border border-danger-500/30"
        >
          <X size={16} /> Reject
        </button>
        <button
          onClick={() => setShowClassSelect(!showClassSelect)}
          className="btn bg-warn-500/15 text-warn-400 hover:bg-warn-500/25 border border-warn-500/30"
        >
          <Pencil size={16} /> Reclassify
        </button>
        <button
          onClick={() => handleAction('under_review')}
          className="btn bg-anomaly-500/15 text-anomaly-400 hover:bg-anomaly-500/25 border border-anomaly-500/30"
        >
          <Flag size={16} /> Mark Review
        </button>
      </div>

      {detection.objectClass === 'Unknown Anomaly' && (
        <div className="p-3 rounded-lg bg-anomaly-500/10 border border-anomaly-500/20 flex gap-2">
          <AlertCircle size={16} className="text-anomaly-400 shrink-0 mt-0.5" />
          <p className="text-xs text-anomaly-300">
            This object requires expert verification before classification. Low confidence — do not auto-confirm without review.
          </p>
        </div>
      )}
    </div>
  );
}

export function DetectionDetailPanel({ detection, index }: { detection: Detection; index: number }) {
  const meta = DEBRIS_META[detection.objectClass];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-sm" style={{ background: meta.color }} />
        <span className="font-mono text-sm text-white">DETECT-{String(index + 1).padStart(3, '0')}</span>
        <StatusBadge status={detection.verificationStatus} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <DetailItem label="Object Class" value={detection.objectClass} />
        <DetailItem label="Confidence" value={`${Math.round(detection.confidence * 100)}%`} />
        <DetailItem label="Risk Score" value={`${detection.riskScore}/100`} />
        <DetailItem label="Priority" value={detection.priority.toUpperCase()} mono />
        {detection.anomalyScore !== undefined && (
          <DetailItem label="Anomaly Score" value={`${detection.anomalyScore}/100`} />
        )}
        {detection.estimatedSizeM !== undefined && (
          <DetailItem label="Est. Size" value={`${detection.estimatedSizeM} m`} />
        )}
        <DetailItem label="Bbox (x,y,w,h)" value={`${detection.bbox.x},${detection.bbox.y},${detection.bbox.w},${detection.bbox.h}`} mono />
        <DetailItem label="Timestamp" value={new Date(detection.createdAt).toLocaleString('en', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} />
      </div>

      <div>
        <div className="label-muted mb-1.5">Why was this detected?</div>
        <p className="text-xs text-slate-400 leading-relaxed">{detection.explanation}</p>
      </div>

      {detection.reviewerNotes && (
        <div>
          <div className="label-muted mb-1.5">Reviewer Notes</div>
          <p className="text-xs text-slate-400 leading-relaxed p-2 rounded bg-white/[0.03] border border-white/5">
            {detection.reviewerNotes}
          </p>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="label-muted">{label}</div>
      <div className={`text-slate-200 ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</div>
    </div>
  );
}

export function priorityFromPriority(p: Priority): Priority {
  return p;
}
