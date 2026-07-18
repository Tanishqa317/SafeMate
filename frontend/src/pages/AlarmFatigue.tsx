import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { BellOff, Bell, Layers } from 'lucide-react';

type Alert = { id: string; severity: 'low' | 'med' | 'high'; msg: string; t: string };

const SEED_ALERTS: Alert[] = Array.from({ length: 24 }, (_, i) => {
  const severities: Alert['severity'][] = ['low', 'low', 'low', 'med', 'high'];
  const msgs = [
    'Pump vibration above 2.4mm/s',
    'Temperature drift +0.3°C',
    'Pressure variance 0.2bar',
    'H2S 4ppm detected',
    'Bearing noise anomaly',
    'Valve position mismatch',
    'Sensor calibration drift',
    'Permit window closing',
  ];
  return {
    id: `AL-${String(2048 + i).padStart(4, '0')}`,
    severity: severities[i % severities.length],
    msg: msgs[i % msgs.length],
    t: `T-${String(60 - Math.floor(i * 2.5)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
  };
});

export default function AlarmFatigue() {
  const [compensated, setCompensated] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>(SEED_ALERTS);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setAlerts((prev) => {
        const next = [...prev];
        next.pop();
        next.unshift({
          id: `AL-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
          severity: (['low', 'med', 'high'] as const)[Math.floor(Math.random() * 3)],
          msg: ['Drift detected', 'Threshold approached', 'Sensor noise'][Math.floor(Math.random() * 3)],
          t: `T-00:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

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

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Frequency bars (past hour)
      const bars = 60;
      const bw = w / bars;
      for (let i = 0; i < bars; i++) {
        const seed = i * 0.3;
        const v = (Math.sin(seed) + Math.sin(seed * 2.3) + 2) / 4;
        const bh = v * h * 0.8;
        const x = i * bw;
        const y = h - bh;
        const grad = ctx.createLinearGradient(0, y, 0, h);
        if (i > 45) {
          grad.addColorStop(0, 'rgba(255,30,86,0.6)');
          grad.addColorStop(1, 'rgba(255,30,86,0.05)');
        } else if (i > 30) {
          grad.addColorStop(0, 'rgba(255,170,0,0.5)');
          grad.addColorStop(1, 'rgba(255,170,0,0.05)');
        } else {
          grad.addColorStop(0, 'rgba(0,255,170,0.4)');
          grad.addColorStop(1, 'rgba(0,255,170,0.05)');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(x + 1, y, bw - 2, bh);
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const lowCount = alerts.filter((a) => a.severity === 'low').length;
  const primary = alerts.find((a) => a.severity === 'high') ?? alerts[0];

  return (
    <div className="flex h-full flex-col p-6">
      <PageHeader
        code="VIT·07 / ALARM FATIGUE"
        title="Alarm Fatigue Compensator"
        subtitle="Analytical alert-frequency visualization with smart folding of low-priority noise into a single summary."
        right={
          <button
            onClick={() => setCompensated((c) => !c)}
            className={`flex items-center gap-2 rounded-md border px-4 py-2 text-[11px] font-medium tracking-wider transition-all ${
              compensated
                ? 'border-mint/40 bg-mint/10 text-mint glow-mint'
                : 'border-edge text-slate-300 hover:text-white'
            }`}
          >
            {compensated ? <BellOff size={12} /> : <Bell size={12} />}
            {compensated ? 'COMPENSATION ACTIVE' : 'ACTIVATE FATIGUE COMPENSATION'}
          </button>
        }
      />

      <div className="glass relative mb-4 overflow-hidden rounded-lg p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="hud-label">ALERT FREQUENCY · PAST 60 MINUTES</span>
          <span className="hud-mono text-[10px] text-slate-500">60 buckets · 1 min each</span>
        </div>
        <div className="h-32">
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-2">
        <div className="glass flex flex-col overflow-hidden rounded-lg">
          <div className="flex items-center justify-between border-b border-edge px-4 py-3">
            <span className="hud-label">RAW ALERT FLOOD</span>
            <span className="hud-mono text-[10px] text-crimson-vitals glow-crimson">
              {alerts.length} alerts · 1m window
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {alerts.map((a, i) => (
              <motion.div
                key={a.id + i}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-1 flex items-center gap-3 rounded px-2 py-1.5 hover:bg-white/[0.02]"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    a.severity === 'high'
                      ? 'bg-crimson-vitals glow-crimson'
                      : a.severity === 'med'
                        ? 'bg-amber-cyber glow-amber'
                        : 'bg-slate-500'
                  }`}
                />
                <span className="hud-mono text-[9px] text-slate-500">{a.t}</span>
                <span className="hud-mono text-[9px] text-slate-400">{a.id}</span>
                <span className="flex-1 text-[11px] text-slate-300">{a.msg}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {compensated ? (
              <motion.div
                key="compensated"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ stiffness: 100, damping: 15 }}
                className="glass flex flex-1 flex-col rounded-lg border border-crimson-vitals/30 p-6"
                style={{ boxShadow: '0 0 30px rgba(255,30,86,0.15)' }}
              >
                <div className="hud-mono mb-3 flex items-center gap-2 text-[10px] tracking-[0.3em] text-crimson-vitals glow-crimson">
                  <Bell size={14} />
                  PRIMARY ALERT · ELEVATED
                </div>
                <div className="hud-mono text-[14px] text-white">{primary.id}</div>
                <div className="mt-2 font-display text-[22px] font-semibold text-crimson-vitals glow-crimson">
                  {primary.msg}
                </div>
                <div className="hud-mono mt-2 text-[10px] text-slate-400">
                  Detected {primary.t} · severity HIGH · zone RX-09
                </div>

                <div className="mt-auto flex items-center gap-3 rounded-md border border-mint/30 bg-mint/5 px-4 py-3">
                  <Layers size={14} className="text-mint glow-mint" />
                  <div>
                    <div className="hud-mono text-[12px] text-mint glow-mint">
                      {lowCount} LOW-PRIORITY ALERTS SUPPRESSED / SUMMARIZED
                    </div>
                    <div className="hud-mono mt-1 text-[10px] text-slate-500">
                      Auto-bundled · awaiting operator review
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="uncompensated"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass flex flex-1 flex-col items-center justify-center rounded-lg p-6 text-center"
              >
                <Bell size={32} className="text-slate-600" />
                <div className="mt-3 font-display text-[14px] text-slate-400">
                  Compensation mode inactive
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Activate to fold low-priority flood into a single primary warning card.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
