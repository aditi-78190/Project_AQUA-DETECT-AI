import { useMemo } from 'react';

/*
 * Generates a synthetic side-scan-sonar-style image using Canvas.
 * This is a simulated sonar backdrop — NOT real sonar data.
 * Each demo scenario gets a deterministic texture so the same
 * scenario always renders the same "sonar image".
 */

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SonarImageProps {
  seed: string;
  variant: 'multi-debris' | 'net-metal' | 'anomaly' | 'noisy' | 'clean' | 'upload';
  width?: number;
  height?: number;
  className?: string;
}

export function SonarImage({ seed, variant, width = 1024, height = 1024, className = '' }: SonarImageProps) {
  const dataUrl = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    const rng = mulberry32(hash(seed));

    // Base: dark seabed gradient with sonar waterfall effect
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0a1525');
    grad.addColorStop(0.5, '#0d1b30');
    grad.addColorStop(1, '#070d18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Sonar water-column region (nadir line)
    const nadirGrad = ctx.createLinearGradient(0, 0, width, 0);
    nadirGrad.addColorStop(0, 'rgba(0,194,230,0.15)');
    nadirGrad.addColorStop(0.04, 'rgba(0,194,230,0.02)');
    nadirGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
    nadirGrad.addColorStop(0.96, 'rgba(0,194,230,0.02)');
    nadirGrad.addColorStop(1, 'rgba(0,194,230,0.15)');
    ctx.fillStyle = nadirGrad;
    ctx.fillRect(0, 0, width, height);

    // Seabed texture: random speckle
    const speckleCount = variant === 'clean' ? 3000 : 8000;
    for (let i = 0; i < speckleCount; i++) {
      const x = rng() * width;
      const y = rng() * height;
      const brightness = rng();
      const size = rng() * 2 + 0.5;
      const distFromCenter = Math.abs(x - width / 2) / (width / 2);
      const intensity = brightness * (1 - distFromCenter * 0.3);
      ctx.fillStyle = `rgba(${100 + intensity * 80}, ${130 + intensity * 90}, ${150 + intensity * 60}, ${intensity * 0.3})`;
      ctx.fillRect(x, y, size, size);
    }

    // Ripple patterns (seabed waves)
    if (variant !== 'noisy') {
      ctx.strokeStyle = 'rgba(60, 90, 120, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 20; i++) {
        const y = (height / 20) * i + rng() * 20;
        ctx.beginPath();
        for (let x = 0; x < width; x += 8) {
          const wave = Math.sin(x * 0.01 + i) * 15 + Math.sin(x * 0.03) * 5;
          if (x === 0) ctx.moveTo(x, y + wave);
          else ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }
    }

    // Debris / objects based on variant
    const drawBlob = (cx: number, cy: number, rw: number, rh: number, intensity: number, shape: 'blob' | 'rect' | 'line' | 'ring') => {
      ctx.save();
      ctx.translate(cx, cy);
      if (shape === 'rect') {
        ctx.fillStyle = `rgba(180, 200, 220, ${intensity})`;
        ctx.fillRect(-rw / 2, -rh / 2, rw, rh);
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = `rgba(40, 50, 60, ${intensity * 0.5})`;
        ctx.fillRect(-rw / 2, rh / 2, rw, rh * 0.6);
      } else if (shape === 'line') {
        ctx.strokeStyle = `rgba(160, 180, 200, ${intensity})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = -rw / 2; x < rw / 2; x += 4) {
          const y = Math.sin(x * 0.1) * 4;
          if (x === -rw / 2) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (shape === 'ring') {
        ctx.strokeStyle = `rgba(180, 200, 220, ${intensity})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, rw / 2, rh / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(170, 190, 210, ${intensity})`;
        ctx.beginPath();
        const points = 8;
        for (let i = 0; i <= points; i++) {
          const a = (i / points) * Math.PI * 2;
          const r = rw / 2 * (0.7 + rng() * 0.3);
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * (rh / rw) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = `rgba(30, 40, 50, ${intensity * 0.4})`;
        ctx.fillRect(-rw / 2, rh / 2 - 5, rw, rh * 0.5);
      }
      ctx.restore();
    };

    if (variant === 'multi-debris') {
      drawBlob(220, 220, 200, 160, 0.7, 'blob');
      drawBlob(440, 250, 110, 90, 0.6, 'blob');
      drawBlob(650, 200, 170, 160, 0.75, 'rect');
      drawBlob(830, 350, 130, 100, 0.65, 'blob');
      drawBlob(350, 560, 90, 70, 0.5, 'blob');
    } else if (variant === 'net-metal') {
      // Long net
      ctx.save();
      ctx.strokeStyle = 'rgba(150, 170, 190, 0.4)';
      ctx.lineWidth = 1.5;
      for (let y = 280; y < 400; y += 12) {
        ctx.beginPath();
        for (let x = 80; x < 580; x += 4) {
          const wy = y + Math.sin(x * 0.05) * 3;
          if (x === 80) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.stroke();
      }
      for (let x = 80; x < 580; x += 12) {
        ctx.beginPath();
        for (let y = 280; y < 400; y += 4) {
          const wx = x + Math.sin(y * 0.05) * 3;
          if (y === 280) ctx.moveTo(wx, y);
          else ctx.lineTo(wx, y);
        }
        ctx.stroke();
      }
      ctx.restore();
      drawBlob(690, 320, 150, 120, 0.7, 'rect');
      drawBlob(330, 580, 260, 30, 0.5, 'line');
    } else if (variant === 'anomaly') {
      // Unusual shape
      ctx.save();
      ctx.translate(450, 380);
      ctx.fillStyle = 'rgba(140, 100, 180, 0.3)';
      ctx.beginPath();
      ctx.moveTo(-110, -40);
      ctx.lineTo(-60, -100);
      ctx.lineTo(40, -90);
      ctx.lineTo(110, -20);
      ctx.lineTo(80, 80);
      ctx.lineTo(-20, 100);
      ctx.lineTo(-90, 50);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(180, 130, 220, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(20, 20, 30, 0.5)';
      ctx.fillRect(-110, 40, 220, 60);
      ctx.restore();
      drawBlob(750, 640, 100, 80, 0.45, 'blob');
    } else if (variant === 'noisy') {
      // Heavy noise
      for (let i = 0; i < 20000; i++) {
        const x = rng() * width;
        const y = rng() * height;
        const b = rng();
        ctx.fillStyle = `rgba(${b * 120}, ${b * 140}, ${b * 100}, ${b * 0.25})`;
        ctx.fillRect(x, y, 1.5, 1.5);
      }
      drawBlob(320, 430, 120, 100, 0.35, 'blob');
      drawBlob(690, 320, 180, 40, 0.3, 'line');
    }
    // clean: no objects

    return canvas.toDataURL('image/png');
  }, [seed, variant, width, height]);

  return (
    <img
      src={dataUrl}
      alt={`Simulated sonar imagery — ${variant}`}
      className={className}
      style={{ imageRendering: 'auto' }}
    />
  );
}
