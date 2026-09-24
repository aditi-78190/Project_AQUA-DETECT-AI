import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { SonarImage } from '@/components/ui/SonarImage';

interface Props {
  seed: string;
  variant: 'multi-debris' | 'net-metal' | 'anomaly' | 'noisy' | 'clean' | 'upload';
  width: number;
  height: number;
}

const STEPS = [
  { key: 'original', label: 'Original' },
  { key: 'enhanced', label: 'Enhanced' },
  { key: 'ai-input', label: 'AI Input' },
];

export function PreprocessingView({ seed, variant, width, height }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button onClick={() => setShow(!show)} className="btn-ghost mb-3">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
        {show ? 'Hide' : 'Show'} Preprocessing Pipeline
      </button>

      {show && (
        <div className="space-y-4">
          {/* Pipeline steps */}
          <div className="glass p-4 rounded-xl">
            <h4 className="text-sm font-medium text-white mb-3">Preprocessing Pipeline (Simulated)</h4>
            <div className="flex flex-wrap gap-2">
              {[
                'Grayscale Conversion',
                'Noise Reduction',
                'Contrast Enhancement',
                'Normalization',
                'Speckle Filtering',
                'Image Resizing',
                'ROI Extraction',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="chip bg-white/5 text-slate-300 border border-white/10 font-mono text-[10px]">
                    {i + 1}. {step}
                  </span>
                  {i < 6 && <span className="text-slate-600 text-xs">→</span>}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              These steps are simulated in the prototype. In production, they would run
              on the backend before the AI detection model.
            </p>
          </div>

          {/* Comparison views */}
          <div className="grid md:grid-cols-3 gap-4">
            {STEPS.map((step) => (
              <div key={step.key} className="glass p-3 rounded-xl">
                <div className="label-muted mb-2">{step.label}</div>
                <div className="relative rounded-lg overflow-hidden bg-abyss-900">
                  <SonarImage
                    seed={seed + step.key}
                    variant={variant}
                    width={300}
                    height={300}
                    className="w-full aspect-square object-cover"
                  />
                  {step.key === 'enhanced' && (
                    <div className="absolute bottom-2 right-2 chip bg-bio-500/15 text-bio-400 text-[10px] border border-bio-500/30">
                      Contrast +40%
                    </div>
                  )}
                  {step.key === 'ai-input' && (
                    <div className="absolute bottom-2 right-2 chip bg-sonar-500/15 text-sonar-300 text-[10px] border border-sonar-500/30">
                      640×640
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
