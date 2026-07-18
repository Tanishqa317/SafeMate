import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { History, GitBranch, Play, Pause, FastForward } from 'lucide-react';

const EVENTS = [
  { t: 0.04, label: 'Permit #CW-4471 issued', tone: 'mint' },
  { t: 0.12, label: 'Gas concentration +18ppm', tone: 'amber' },
  { t: 0.23, label: 'Permit #CW-4480 — gaming detected', tone: 'crimson' },
  { t: 0.34, label: 'Guardrail override blocked', tone: 'mint' },
  { t: 0.46, label: 'Vibration anomaly on RX-09', tone: 'amber' },
  { t: 0.58, label: 'Counterfactual divergence peak', tone: 'crimson' },
  { t: 0.71, label: 'Sensor SA-119 flatline', tone: 'crimson' },
  { t: 0.83, label: 'Evacuation route recalculated', tone: 'mint' },
  { t: 0.92, label: 'Incident contained', tone: 'mint' },
];

export default function Replay() {
  const [scrub, setScrub] = useState(0.23);
  const [playing, setPlaying] = useState(true);
  const histCanvas = useRef<HTMLCanvasElement>(null);
  const cfCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setScrub((s) => (s >= 1 ? 0 : s + 0.004));
    }, 60);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    const draw = (
      canvas: HTMLCanvasElement | null,
      mode: 'history' | 'counterfactual',
    ) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      const mid = h * 0.55;
      const color = mode === 'history' ? '#00ffaa' : '#ff1e56';
      const glow = mode === 'history' ? 'rgba(0,255,170,0.5)' : 'rgba(255,30,86,0.5)';

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 1) {
        const phase = (x / w) * Math.PI * 4;
        let y = mid;
        if (mode === 'history') {
          y -= Math.sin(phase) * 18 + Math.sin(phase * 2.3) * 8;
          if (x / w > 0.7) y -= Math.sin(phase * 6) * 14;
        } else {
          y -= Math.sin(phase) * 18 + Math.sin(phase * 2.3) * 8;
          // Volatile divergence
          const div = Math.max(0, (x / w - 0.2)) * 80;
          y -= Math.sin(phase * 3.7) * div + (Math.random() - 0.5) * div * 0.3;
        }
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Scrub head
      const sx = scrub * w;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(sx, mid, 3, 0, Math.PI * 2);
      ctx.fill();
    };
    draw(histCanvas.current, 'history');
    draw(cfCanvas.current, 'counterfactual');
  }, [scrub]);

  const currentEvents = useMemo(() => EVENTS.filter((e) => e.t <= scrub), [scrub]);
  const timeLabel = `T+${String(Math.floor(scrub * 24)).padStart(2, '0')}:${String(
    Math.floor((scrub * 24 * 60) % 60),
  ).padStart(2, '0')}:${String(Math.floor((scrub * 24 * 3600) % 60)).padStart(2, '0')}`;

  return (
    <div className="flex h-full flex-col p-6">
      <PageHeader
        code="VIT·04 / COUNTERFACTUAL REPLAY"
        title="Counterfactual Replay Engine"
        subtitle="Digital Twin stress-test — historical reality vs. adversarial permit-gaming counterfactual."
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="glass glass-hover flex items-center gap-2 rounded-md px-3 py-2 text-[11px] text-slate-200"
            >
              {playing ? <Pause size={12} /> : <Play size={12} />}
              {playing ? 'PAUSE' : 'PLAY'}
            </button>
            <button
              onClick={() => setScrub((s) => Math.min(1, s + 0.05))}
              className="glass glass-hover rounded-md px-3 py-2 text-slate-200"
            >
              <FastForward size={12} />
            </button>
          </div>
        }
      />

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-2">
        <Viewport
          title="HISTORICAL REALITY PATH"
          subtitle="Recorded telemetry · 24h crisis window"
          icon={History}
          tone="mint"
          canvasRef={histCanvas}
          timeLabel={timeLabel}
        />
        <Viewport
          title="COUNTERFACTUAL PROJECTION"
          subtitle="Without Adversarial Permit-Gaming Detector"
          icon={GitBranch}
          tone="crimson"
          canvasRef={cfCanvas}
          timeLabel={timeLabel}
        />
      </div>

      {/* Timeline scrubber */}
      <div className="glass mt-4 rounded-lg p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="hud-label">TIMELINE · 24H CRISIS WINDOW</span>
          <span className="hud-mono text-[11px] text-mint glow-mint">{timeLabel}</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={scrub}
            onChange={(e) => {
              setPlaying(false);
              setScrub(parseFloat(e.target.value));
            }}
            className="hud-range w-full"
          />
          <div className="relative mt-3 h-6">
            {EVENTS.map((e) => (
              <div
                key={e.label}
                className="absolute flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${e.t * 100}%` }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: e.tone === 'mint' ? '#00ffaa' : e.tone === 'amber' ? '#ffaa00' : '#ff1e56',
                    boxShadow: `0 0 6px ${e.tone === 'mint' ? 'rgba(0,255,170,0.6)' : e.tone === 'amber' ? 'rgba(255,170,0,0.6)' : 'rgba(255,30,86,0.6)'}`,
                  }}
                />
                <span className="hud-mono mt-1 hidden whitespace-nowrap text-[8px] text-slate-500 lg:block">
                  {e.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 max-h-24 overflow-y-auto">
          {currentEvents.slice(-6).map((e, i) => (
            <motion.div
              key={`${e.label}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 py-0.5"
            >
              <span
                className="hud-mono text-[9px] tracking-wider"
                style={{
                  color: e.tone === 'mint' ? '#00ffaa' : e.tone === 'amber' ? '#ffaa00' : '#ff1e56',
                }}
              >
                T+{String(Math.floor(e.t * 24)).padStart(2, '0')}:{String(
                  Math.floor((e.t * 24 * 60) % 60),
                ).padStart(2, '0')}
              </span>
              <span className="text-[11px] text-slate-300">{e.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Viewport({
  title,
  subtitle,
  icon: Icon,
  tone,
  canvasRef,
  timeLabel,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  tone: 'mint' | 'crimson';
  canvasRef: React.RefObject<HTMLCanvasElement>;
  timeLabel: string;
}) {
  const c = tone === 'mint' ? 'text-mint glow-mint' : 'text-crimson-vitals glow-crimson';
  return (
    <div className="glass relative flex flex-col overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-edge px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon size={14} className={c} />
          <div>
            <div className={`hud-mono text-[11px] tracking-wider ${c}`}>{title}</div>
            <div className="hud-mono text-[9px] text-slate-500">{subtitle}</div>
          </div>
        </div>
        <span className="hud-mono text-[10px] text-slate-400">{timeLabel}</span>
      </div>
      <div className="relative flex-1">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </div>
  );
}
