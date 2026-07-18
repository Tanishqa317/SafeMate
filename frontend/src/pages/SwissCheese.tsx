import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { Layers3, AlertTriangle, Radar, ShieldX } from 'lucide-react';

type Layer = {
  id: string;
  name: string;
  desc: string;
  failed: boolean;
};

const initial: Layer[] = [
  { id: 'L1', name: 'Sensors', desc: 'IoT telemetry · 2,048 nodes', failed: false },
  { id: 'L2', name: 'Digital Permits', desc: 'Lockout/Tagout · e-permit chain', failed: false },
  { id: 'L3', name: 'Neuro-Symbolic Guardrails', desc: 'Adversarial permit-gaming detector', failed: false },
  { id: 'L4', name: 'Operations Staffing', desc: 'Shift coverage · 12 operators', failed: false },
];

export default function SwissCheese() {
  const [layers, setLayers] = useState<Layer[]>(initial);
  const [alarm, setAlarm] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const failedCount = layers.filter((l) => l.failed).length;

  useEffect(() => {
    setAlarm(failedCount >= 3);
  }, [failedCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let t = 0;
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

      // Wireframe plant blueprint
      ctx.strokeStyle = 'rgba(0,255,170,0.18)';
      ctx.lineWidth = 1;
      // Outer wall
      ctx.strokeRect(40, 40, w - 80, h - 80);
      // Inner rooms
      const cols = 4, rows = 3;
      const cw = (w - 80) / cols;
      const ch = (h - 80) / rows;
      for (let i = 1; i < cols; i++) {
        ctx.beginPath();
        ctx.moveTo(40 + cw * i, 40);
        ctx.lineTo(40 + cw * i, h - 40);
        ctx.stroke();
      }
      for (let i = 1; i < rows; i++) {
        ctx.beginPath();
        ctx.moveTo(40, 40 + ch * i);
        ctx.lineTo(w - 40, 40 + ch * i);
        ctx.stroke();
      }
      // Diagonal pipes
      ctx.strokeStyle = 'rgba(0,255,170,0.08)';
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(40, 40 + (h - 80) * (i / 6));
        ctx.lineTo(w - 40, 40 + (h - 80) * ((i + 1) / 6));
        ctx.stroke();
      }

      // Volumetric risk fog in failed zones
      const dangerZones = [
        { x: 0.25, y: 0.35 },
        { x: 0.7, y: 0.6 },
        { x: 0.55, y: 0.25 },
      ];
      dangerZones.forEach((z, i) => {
        const cx = w * z.x;
        const cy = h * z.y;
        const r = 60 + Math.sin(t * 0.5 + i) * 10 + failedCount * 8;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const intensity = failedCount > 0 ? 0.18 + failedCount * 0.06 : 0.06;
        grad.addColorStop(0, `rgba(255,30,86,${intensity})`);
        grad.addColorStop(0.5, `rgba(255,170,0,${intensity * 0.5})`);
        grad.addColorStop(1, 'rgba(255,30,86,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Scan line
      const scanY = (Math.sin(t * 0.3) * 0.5 + 0.5) * h;
      const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      scanGrad.addColorStop(0, 'rgba(0,255,170,0)');
      scanGrad.addColorStop(0.5, 'rgba(0,255,170,0.08)');
      scanGrad.addColorStop(1, 'rgba(0,255,170,0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 30, w, 60);

      t += 0.05;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [failedCount]);

  return (
    <div className="flex h-full flex-col p-6">
      <PageHeader
        code="VIT·03 / SWISS CHEESE"
        title="Swiss Cheese Layered Scan"
        subtitle="3D risk fog volumetric over plant blueprint — toggle defense barriers to expose co-alignment vectors."
        right={
          <div className="flex items-center gap-3">
            <div className="glass rounded-md px-4 py-2">
              <div className="hud-label">LAYERS FAILED</div>
              <div
                className={`hud-mono text-[18px] font-semibold ${
                  failedCount >= 3 ? 'text-crimson-vitals glow-crimson' : failedCount > 0 ? 'text-amber-cyber glow-amber' : 'text-mint glow-mint'
                }`}
              >
                {failedCount}/4
              </div>
            </div>
          </div>
        }
      />

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-10">
        <div className="glass relative overflow-hidden rounded-lg lg:col-span-7">
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
            <Radar size={14} className="text-mint glow-mint" />
            <span className="hud-label">3D PLANT BLUEPRINT · RISK FOG</span>
          </div>
          <div className="absolute right-4 top-4 z-10 hud-mono text-[10px] text-slate-500">
            VIEWPORT · ISO·CAM·01
          </div>
          <canvas ref={canvasRef} className="h-full w-full" />
          <div className="absolute bottom-4 left-4 z-10 hud-mono text-[10px] text-slate-500">
            GRID·48m × 36m · SCALE·1:120
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto lg:col-span-3">
          {layers.map((l, idx) => (
            <LayerCard
              key={l.id}
              layer={l}
              index={idx}
              onToggle={() =>
                setLayers((prev) =>
                  prev.map((p) => (p.id === l.id ? { ...p, failed: !p.failed } : p)),
                )
              }
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {alarm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 0.4, repeat: Infinity }}
              className="absolute inset-0 bg-crimson-vitals/10"
            />
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.4, repeat: Infinity }}
              className="glass relative flex items-center gap-4 rounded-lg border border-crimson-vitals/50 px-8 py-6"
              style={{ boxShadow: '0 0 40px rgba(255,30,86,0.4)' }}
            >
              <AlertTriangle size={32} className="text-crimson-vitals glow-crimson" />
              <div>
                <div className="hud-mono text-[11px] tracking-[0.3em] text-crimson-vitals glow-crimson">
                  DEFENSIVE LAYER CO-ALIGNMENT
                </div>
                <div className="font-display text-[22px] font-semibold text-white">
                  CRITICAL VECTOR DETECTED
                </div>
                <div className="hud-mono mt-1 text-[10px] text-slate-400">
                  {failedCount} BARRIERS BREACHED · IMMEDIATE INTERVENTION REQUIRED
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LayerCard({
  layer,
  index,
  onToggle,
}: {
  layer: Layer;
  index: number;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ stiffness: 100, damping: 15, delay: index * 0.08 }}
      className={`glass glass-hover relative overflow-hidden rounded-lg p-4 ${
        layer.failed ? 'border-crimson-vitals/30' : ''
      }`}
    >
      <AnimatePresence>
        {layer.failed && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ stiffness: 100, damping: 15 }}
            className="pointer-events-none absolute left-0 top-1/2 z-0 h-[2px] w-full -translate-y-1/2 bg-crimson-vitals"
            style={{ boxShadow: '0 0 12px rgba(255,30,86,0.8), 0 0 24px rgba(255,30,86,0.4)' }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded border ${
              layer.failed
                ? 'border-crimson-vitals/40 bg-crimson-vitals/10'
                : 'border-mint/20 bg-mint/5'
            }`}
          >
            {layer.failed ? (
              <ShieldX size={14} className="text-crimson-vitals glow-crimson" />
            ) : (
              <Layers3 size={14} className="text-mint glow-mint" />
            )}
          </div>
          <div>
            <div className="font-display text-[13px] font-medium text-white">{layer.name}</div>
            <div className="hud-mono text-[9px] tracking-wider text-slate-500">{layer.desc}</div>
          </div>
        </div>

        <button
          onClick={onToggle}
          className={`relative h-6 w-12 rounded-full transition-colors ${
            layer.failed ? 'bg-crimson-vitals/30' : 'bg-mint/20'
          }`}
        >
          <motion.span
            layout
            transition={{ stiffness: 100, damping: 15 }}
            className="absolute top-1 h-4 w-4 rounded-full"
            style={{
              left: layer.failed ? 'calc(100% - 20px)' : '4px',
              background: layer.failed ? '#ff1e56' : '#00ffaa',
              boxShadow: layer.failed
                ? '0 0 10px rgba(255,30,86,0.8)'
                : '0 0 10px rgba(0,255,170,0.8)',
            }}
          />
        </button>
      </div>
      <div className="relative z-10 mt-2 hud-mono text-[9px] tracking-wider">
        <span className={layer.failed ? 'text-crimson-vitals glow-crimson' : 'text-mint glow-mint'}>
          {layer.failed ? '● FAILED · VECTOR OPEN' : '● ACTIVE · SEALED'}
        </span>
      </div>
    </motion.div>
  );
}
