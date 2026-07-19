import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { Waves, Cpu, RefreshCw } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';

const UNITS = [
  { id: 'unit-1', name: 'Hydrocracker Complex' },
  { id: 'unit-2', name: 'Distillation Tower 3' },
  { id: 'unit-3', name: 'Catalytic Reformer' },
  { id: 'unit-4', name: 'Boiler House B' },
  { id: 'unit-5', name: 'Storage Terminal 5' },
];

interface VibrationData {
  unit_id: string;
  baseline_signature: number[];
  current_signature: number[];
  deviation_score: number;
  status: string;
  time_to_failure_weeks: number | null;
  explanation: string;
  trend_last_30_days: number[];
}

function useVibrationData(unitId: string, refreshKey: number) {
  const [data, setData] = useState<VibrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/vibration-dna/${unitId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`vibration-dna failed: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message ?? 'fetch failed');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [unitId, refreshKey]);

  return { data, loading, error };
}

function verdictFromStatus(status: string, weeks: number | null, explanation: string) {
  if (status === 'critical') {
    return { tone: 'CRITICAL', color: 'text-crimson-vitals glow-crimson', text: explanation };
  }
  if (status === 'degrading') {
    return { tone: 'DEGRADING', color: 'text-amber-cyber glow-amber', text: explanation };
  }
  if (status === 'early_warning') {
    return { tone: 'EARLY WARNING', color: 'text-amber-cyber glow-amber', text: explanation };
  }
  return { tone: 'NOMINAL', color: 'text-mint glow-mint', text: explanation };
}

export default function VibrationDNA() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [unitId, setUnitId] = useState('unit-1');
  const [refreshKey, setRefreshKey] = useState(0);
  const scrollRef = useRef(0);

  const { data, loading, error } = useVibrationData(unitId, refreshKey);

  const verdict = useMemo(() => {
    if (!data) return { tone: 'SYNCING', color: 'text-slate-500', text: 'Loading live sensor data…' };
    return verdictFromStatus(data.status, data.time_to_failure_weeks, data.explanation);
  }, [data]);

  const violent = (data?.deviation_score ?? 0) > 60;

  // Canvas render — plots REAL baseline_signature vs current_signature arrays
  // from the backend, with a slow horizontal scroll for a "live" feel.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
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

    const baseline = data.baseline_signature;
    const current = data.current_signature;
    const n = Math.min(baseline.length, current.length);

    const plot = (arr: number[], w: number, h: number, mid: number, amp: number) => {
      ctx.beginPath();
      for (let x = 0; x <= w; x++) {
        const idxF = (x / w) * (n - 1) + scrollRef.current;
        const idx = Math.floor(idxF) % n;
        const nextIdx = (idx + 1) % n;
        const frac = idxF - Math.floor(idxF);
        const val = arr[idx] * (1 - frac) + arr[nextIdx] * frac;
        const y = mid - val * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

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

      // Trace A: real healthy baseline signature
      ctx.strokeStyle = '#00ffaa';
      ctx.lineWidth = 1.4;
      ctx.shadowColor = 'rgba(0,255,170,0.6)';
      ctx.shadowBlur = 8;
      plot(baseline, w, h, mid, amp);
      ctx.shadowBlur = 0;

      // Trace B: real current/live sensor signature
      const tone = violent ? '#ff1e56' : data.deviation_score > 35 ? '#ffaa00' : '#ffaa00';
      ctx.strokeStyle = tone;
      ctx.lineWidth = violent ? 1.8 : 1.6;
      ctx.shadowColor = violent ? 'rgba(255,30,86,0.7)' : 'rgba(255,170,0,0.5)';
      ctx.shadowBlur = violent ? 14 : 10;
      plot(current, w, h, mid, amp);
      ctx.shadowBlur = 0;

      scrollRef.current += 0.06; // slow pan, purely visual — data itself is real
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [data, violent]);

  return (
    <div className="flex h-full flex-col p-6">
      <PageHeader
        code="VIT·02 / VIBRATION DNA"
        title="Vibration DNA Fingerprinting"
        subtitle="Predictive failure fingerprinting — live sensor rhythm overlaid against healthy baseline."
        right={
          <div className="flex items-center gap-2">
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="hud-mono rounded border border-edge bg-transparent px-3 py-1.5 text-[10px] tracking-wider text-slate-300"
            >
              {UNITS.map((u) => (
                <option key={u.id} value={u.id} className="bg-[#0a0f0d]">
                  {u.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={loading}
              className="hud-mono flex items-center gap-2 rounded border border-edge px-3 py-1.5 text-[10px] tracking-wider text-mint transition hover:bg-white/5 disabled:opacity-40"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              {loading ? 'SYNCING' : 'REFRESH'}
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded border border-crimson-vitals/40 bg-crimson-vitals/10 px-4 py-2 text-[12px] text-crimson-vitals">
          Failed to load vibration data: {error}. Confirm the backend is running at http://127.0.0.1:8000.
        </div>
      )}

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-4">
        <div className="glass relative overflow-hidden rounded-lg lg:col-span-3">
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
            <Waves size={14} className="text-mint glow-mint" />
            <span className="hud-label">OSCILLOSCOPE · BEARING ARRAY</span>
          </div>
          <div className="absolute right-4 top-4 z-10 hud-mono text-[10px] text-slate-500">
            {unitId.toUpperCase()} · LIVE SENSOR FEED
          </div>
          <canvas ref={canvasRef} className="h-full w-full" />
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4">
            <Legend color="#00ffaa" label="TRACE A · BASELINE" />
            <Legend color={violent ? '#ff1e56' : '#ffaa00'} label="TRACE B · LIVE" />
          </div>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto">
          <div className="glass glass-hover rounded-lg p-5">
            <div className="hud-label mb-2">DEVIATION SCORE</div>
            <motion.div
              key={data ? Math.round(data.deviation_score) : 'loading'}
              initial={{ scale: 0.97, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ stiffness: 100, damping: 15 }}
              className={`hud-mono text-[56px] font-semibold leading-none ${verdict.color}`}
            >
              {data ? `${data.deviation_score.toFixed(1)}%` : '--'}
            </motion.div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: violent ? '#ff1e56' : (data?.deviation_score ?? 0) > 35 ? '#ffaa00' : '#00ffaa',
                }}
                animate={{ width: `${data?.deviation_score ?? 0}%` }}
                transition={{ stiffness: 100, damping: 15 }}
              />
            </div>
            {data?.time_to_failure_weeks != null && (
              <div className="mt-3 hud-mono text-[10px] tracking-wider text-slate-400">
                EST. TIME TO FAILURE: <span className={verdict.color}>{data.time_to_failure_weeks} WEEKS</span>
              </div>
            )}
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
            <div className="hud-label mb-3">DEVIATION TREND · 30 DAYS</div>
            {data?.trend_last_30_days ? (
              <TrendSparkline values={data.trend_last_30_days} />
            ) : (
              <div className="text-[11px] text-slate-500">Loading trend…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendSparkline({ values }: { values: number[] }) {
  const w = 240;
  const h = 60;
  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * h}`)
    .join(' ');
  const last = values[values.length - 1];
  const color = last > 60 ? '#ff1e56' : last > 35 ? '#ffaa00' : '#00ffaa';

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
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