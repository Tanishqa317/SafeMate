import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { Waves, Cpu } from 'lucide-react';
import type { VibrationTelemetry } from '../types/telemetry';

export default function VibrationDNA() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [deviation, setDeviation] = useState(38.4);
  const [anomalyMode, setAnomalyMode] = useState<VibrationTelemetry['anomaly_mode']>('spike');
  const tRef = useRef(0);

  // Deviation drifts toward a mode target, with noise. Tied to anomaly mode.
  useEffect(() => {
    const id = setInterval(() => {
      setDeviation((d) => {
        const target = anomalyMode === 'chaos' ? 78 : anomalyMode === 'harmonic' ? 52 : 38;
        const next = d + (target - d) * 0.1 + (Math.random() - 0.5) * 3;
        return Math.max(0, Math.min(100, Math.round(next * 10) / 10));
      });
    }, 800);
    return () => clearInterval(id);
  }, [anomalyMode]);

  // Oscilloscope render — live trace distortion magnitude tied to deviation_score.
  // Above 60% the live path violently deforms away from the steady baseline.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // Matrix grid background
      ctx.strokeStyle = 'rgba(0,255,170,0.05)';
      ctx.lineWidth = 1;
      const grid = 32;
      for (let x = 0; x <= w; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(0,255,170,0.12)';
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      const mid = h / 2;
      const amp = h * 0.32;
      const t = tRef.current;
      // deviation_score drives distortion magnitude (0..1)
      const dev = deviation / 100;
      const violent = deviation > 60;

      // Trace A: Healthy baseline — calm neon-green
      ctx.strokeStyle = '#00ffaa';
      ctx.lineWidth = 1.4;
      ctx.shadowColor = 'rgba(0,255,170,0.6)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 1) {
        const p = t + x * 0.025;
        const y = mid + Math.sin(p) * amp * 0.4 + Math.sin(p * 2) * amp * 0.1;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Trace B: Live sensor rhythm — distortion magnitude tied to deviation_score
      const tone = violent ? '#ff1e56' : '#ffaa00';
      ctx.strokeStyle = tone;
      ctx.lineWidth = violent ? 1.8 : 1.6;
      ctx.shadowColor = violent ? 'rgba(255,30,86,0.7)' : 'rgba(255,170,0,0.5)';
      ctx.shadowBlur = violent ? 14 : 10;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 1) {
        const p = t + x * 0.025;
        // Start from baseline shape
        let y = mid + Math.sin(p) * amp * 0.4 + Math.sin(p * 2) * amp * 0.1;

        if (anomalyMode === 'spike') {
          // Infrequent sharp spikes, magnitude scaled by deviation
          if (Math.sin(p * 0.4) > 0.94 - dev * 0.2) {
            y += (Math.random() - 0.5) * amp * 1.8 * dev;
          }
          y += Math.sin(p * 9) * amp * 0.5 * dev;
        } else if (anomalyMode === 'harmonic') {
          y += Math.sin(p * 4.7) * amp * 0.6 * dev + Math.sin(p * 7.3) * amp * 0.3 * dev;
        } else {
          y += (Math.sin(p * 3.1) + Math.sin(p * 6.7) + Math.sin(p * 11.3)) * amp * 0.5 * dev;
          y += (Math.random() - 0.5) * amp * 0.4 * dev;
        }

        // Violent regime: add high-frequency chaotic fluctuation away from baseline
        if (violent) {
          const burst = (deviation - 60) / 40; // 0..1 within violent band
          y += Math.sin(p * 23 + Math.random() * 6) * amp * 0.8 * burst;
          y += (Math.random() - 0.5) * amp * 0.6 * burst;
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      tRef.current += 0.02;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [deviation, anomalyMode]);

  const verdict = useMemo(() => {
    if (deviation > 60)
      return {
        tone: 'CRITICAL',
        color: 'text-crimson-vitals glow-crimson',
        text: 'Severe structural deformation detected. Bearing array fingerprint diverges from baseline by catastrophic margin. Recommend immediate controlled shutdown of unit.',
      };
    if (deviation > 45)
      return {
        tone: 'WARNING',
        color: 'text-amber-cyber glow-amber',
        text: 'Harmonic distortion forming in mid-band spectrum. Failure fingerprint consistent with pre-failure vibration signature. Schedule diagnostic within 4 hours.',
      };
    return {
      tone: 'NOMINAL',
      color: 'text-mint glow-mint',
      text: 'Live rhythm tracking within healthy envelope. Baseline correlation strong. Continue monitoring under standard cadence.',
    };
  }, [deviation]);

  return (
    <div className="flex h-full flex-col p-6">
      <PageHeader
        code="VIT·02 / VIBRATION DNA"
        title="Vibration DNA Fingerprinting"
        subtitle="Complex failure fingerprinting — live sensor rhythm overlaid against healthy baseline."
        right={
          <div className="flex items-center gap-2">
            {(['spike', 'harmonic', 'chaos'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setAnomalyMode(m)}
                className={`hud-mono rounded border px-3 py-1.5 text-[10px] tracking-wider transition-all ${
                  anomalyMode === m
                    ? 'border-mint/40 bg-mint/10 text-mint glow-mint'
                    : 'border-edge text-slate-500 hover:text-slate-300'
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-4">
        <div className="glass relative overflow-hidden rounded-lg lg:col-span-3">
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
            <Waves size={14} className="text-mint glow-mint" />
            <span className="hud-label">OSCILLOSCOPE · BEARING ARRAY</span>
          </div>
          <div className="absolute right-4 top-4 z-10 hud-mono text-[10px] text-slate-500">
            2.4kHz · 4096smp · CH-A/B
          </div>
          <canvas ref={canvasRef} className="h-full w-full" />
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4">
            <Legend color="#00ffaa" label="TRACE A · BASELINE" />
            <Legend color={deviation > 60 ? '#ff1e56' : '#ffaa00'} label="TRACE B · LIVE" />
          </div>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto">
          <div className="glass glass-hover rounded-lg p-5">
            <div className="hud-label mb-2">DEVIATION SCORE</div>
            <motion.div
              key={Math.round(deviation)}
              initial={{ scale: 0.97, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ stiffness: 100, damping: 15 }}
              className={`hud-mono text-[56px] font-semibold leading-none ${verdict.color}`}
            >
              {deviation.toFixed(1)}%
            </motion.div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{ background: deviation > 60 ? '#ff1e56' : deviation > 45 ? '#ffaa00' : '#00ffaa' }}
                animate={{ width: `${deviation}%` }}
                transition={{ stiffness: 100, damping: 15 }}
              />
            </div>
          </div>

          <div className="glass rounded-lg p-5">
            <div className="mb-2 flex items-center gap-2">
              <Cpu size={12} className="text-mint glow-mint" />
              <span className="hud-label">NEURO-ANALYSIS</span>
            </div>
            <div className={`hud-mono mb-3 text-[11px] tracking-wider ${verdict.color}`}>
              {verdict.tone}
            </div>
            <p className="text-[12px] font-light leading-relaxed text-slate-300">{verdict.text}</p>
          </div>

          <div className="glass rounded-lg p-5">
            <div className="hud-label mb-3">SPECTRAL BANDS</div>
            <div className="space-y-2">
              {[
                ['LOW · 0–500Hz', 12, 'mint'],
                ['MID · 500–1.2kHz', 41, 'amber'],
                ['HIGH · 1.2–2.4kHz', 78, 'crimson'],
              ].map(([band, val, tone]) => (
                <div key={band as string}>
                  <div className="mb-1 flex justify-between">
                    <span className="hud-mono text-[10px] text-slate-400">{band}</span>
                    <span
                      className={`hud-mono text-[10px] ${
                        tone === 'mint' ? 'text-mint' : tone === 'amber' ? 'text-amber-cyber' : 'text-crimson-vitals'
                      }`}
                    >
                      {val}%
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${val}%`,
                        background: tone === 'mint' ? '#00ffaa' : tone === 'amber' ? '#ffaa00' : '#ff1e56',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-[2px] w-6" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      <span className="hud-mono text-[10px] tracking-wider text-slate-400">{label}</span>
    </div>
  );
}
