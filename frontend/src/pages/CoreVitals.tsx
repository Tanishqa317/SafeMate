import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { useNow } from '../hooks/useNow';
import {
  computeExposurePerHour,
  riskStateOf,
  type AssetTelemetry,
  type TacticalLogEntry,
  type LogTone,
} from '../types/telemetry';
import {
  Flame,
  Gauge,
  Thermometer,
  Wind,
  Factory,
  ShieldAlert,
} from 'lucide-react';

const SEED_ASSETS: AssetTelemetry[] = [
  { id: 'HC-01', name: 'Hydrocracker Complex', zone: 'UNIT·4A', icon: Flame, risk_score: 62, flatline: false, active_permits: 4, gas_level_ppm: 18, financial_risk_exposure_per_hour: 7640 },
  { id: 'DT-03', name: 'Distillation Tower 3', zone: 'UNIT·1B', icon: Factory, risk_score: 34, flatline: false, active_permits: 2, gas_level_ppm: 9, financial_risk_exposure_per_hour: 4280 },
  { id: 'RX-09', name: 'Catalytic Reformer', zone: 'UNIT·2C', icon: Gauge, risk_score: 88, flatline: true, active_permits: 7, gas_level_ppm: 41, financial_risk_exposure_per_hour: 14784 },
  { id: 'BL-02', name: 'Boiler House B', zone: 'UTIL·1', icon: Thermometer, risk_score: 47, flatline: false, active_permits: 3, gas_level_ppm: 22, financial_risk_exposure_per_hour: 5840 },
  { id: 'ST-05', name: 'Storage Terminal 5', zone: 'TANK·FARM', icon: Wind, risk_score: 21, flatline: false, active_permits: 1, gas_level_ppm: 6, financial_risk_exposure_per_hour: 2720 },
];

const FLATLINE_TRIGGER_PROB = 0.012; // per tick — infrequent
const FLATLINE_RECOVER_PROB = 0.04;

type LogTemplate = { tag: string; message: (a: AssetTelemetry) => string; tone: (a: AssetTelemetry) => LogTone };
const LOG_TEMPLATES: LogTemplate[] = [
  { tag: 'PERM·ISSUED', message: (a) => `Cold-work permit #CW-${4400 + Math.floor(Math.random() * 99)} cleared on ${a.id}`, tone: () => 'mint' },
  { tag: 'GAS·RISE', message: (a) => `H2S concentration +${Math.floor(Math.random() * 18 + 4)}ppm on ${a.id} (${a.gas_level_ppm}ppm)`, tone: () => 'amber' },
  { tag: 'VIB·ANOM', message: (a) => `Deviation score ${(Math.random() * 40 + 20).toFixed(1)}% on ${a.id} bearing array`, tone: () => 'amber' },
  { tag: 'GUARDRAIL', message: (a) => `Neuro-symbolic override blocked permit #CW-${4480 + Math.floor(Math.random() * 20)} on ${a.id}`, tone: () => 'mint' },
  { tag: 'EXPOSURE', message: (a) => `Cost-of-risk $${a.financial_risk_exposure_per_hour.toLocaleString()}/hr on ${a.id} — escalation`, tone: (a) => a.risk_score > 70 ? 'crimson' : 'amber' },
  { tag: 'AUDIT', message: (a) => `Compliance auditor cited 29 CFR 1910.119 gap on ${a.id}`, tone: () => 'amber' },
  { tag: 'FLATLINE', message: (a) => `Sensor SA-${100 + Math.floor(Math.random() * 40)} stuck on ${a.id} — watchdog engaged`, tone: () => 'crimson' },
  { tag: 'RECOVER', message: (a) => `Sensor link restored on ${a.id} — watchdog cleared`, tone: () => 'mint' },
];

function stamp(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(
    d.getSeconds(),
  ).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`;
}

const stateColor = {
  safe: 'mint',
  warn: 'amber',
  critical: 'crimson',
} as const;

export default function CoreVitals() {
  const [assets, setAssets] = useState<AssetTelemetry[]>(SEED_ASSETS);
  const [events, setEvents] = useState<TacticalLogEntry[]>([]);
  const now = useNow(50);
  const seqRef = useRef(0);

  // 1) Core Vitals live loop — 1000ms risk updates + infrequent flatline events
  useEffect(() => {
    const id = setInterval(() => {
      setAssets((prev) =>
        prev.map((a) => {
          let flatline = a.flatline;
          if (flatline) {
            if (Math.random() < FLATLINE_RECOVER_PROB) flatline = false;
          } else if (Math.random() < FLATLINE_TRIGGER_PROB) {
            flatline = true;
          }

          const risk = flatline
            ? 99
            : Math.max(8, Math.min(96, Math.round(a.risk_score + (Math.random() - 0.5) * 8)));
          const gas = flatline
            ? a.gas_level_ppm
            : Math.max(2, Math.min(99, Math.round(a.gas_level_ppm + (Math.random() - 0.5) * 4)));
          const exposure = computeExposurePerHour(risk, flatline);

          return { ...a, risk_score: risk, flatline, gas_level_ppm: gas, financial_risk_exposure_per_hour: exposure };
        }),
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // 4) Real-time tactical log ingestion — 3–5s
  useEffect(() => {
    let timer: number;
    const push = () => {
      setAssets((currentAssets) => {
        const a = currentAssets[Math.floor(Math.random() * currentAssets.length)];
        const tpl = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
        // Skip RECOVER unless flatlined; skip FLATLINE unless just flatlined
        let tplUse = tpl;
        if (tpl.tag === 'RECOVER' && !a.flatline) tplUse = LOG_TEMPLATES[0];
        if (tpl.tag === 'FLATLINE' && !a.flatline) tplUse = LOG_TEMPLATES[1];

        const entry: TacticalLogEntry = {
          id: `LOG-${seqRef.current++}`,
          timestamp: stamp(new Date(now)),
          tag: tplUse.tag,
          message: tplUse.message(a),
          tone: tplUse.tone(a),
          asset_id: a.id,
        };
        setEvents((prev) => [entry, ...prev].slice(0, 60));
        return currentAssets;
      });
      const next = 3000 + Math.random() * 2000;
      timer = window.setTimeout(push, next);
    };
    timer = window.setTimeout(push, 1500);
    return () => clearTimeout(timer);
  }, [now]);

  const totalExposure = useMemo(
    () => assets.reduce((s, a) => s + a.financial_risk_exposure_per_hour, 0),
    [assets],
  );

  return (
    <div className="flex h-full flex-col p-6">
      <PageHeader
        code="VIT·01 / CORE TELEMETRY"
        title="Core Vitals Dashboard"
        subtitle="Flatline Watchdog + Cost-of-Risk Translator — live across five critical assets."
        right={
          <div className="flex items-center gap-3">
            <div className="glass rounded-md px-4 py-2">
              <div className="hud-label">TOTAL EXPOSURE</div>
              <div className="hud-mono text-[18px] font-semibold text-amber-cyber glow-amber">
                ${totalExposure.toLocaleString()}/hr
              </div>
            </div>
          </div>
        }
      />

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-3">
        <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
          {assets.map((a, idx) => (
            <AssetTile key={a.id} asset={a} index={idx} />
          ))}
        </div>

        {/* Tactical log */}
        <div className="glass flex flex-col overflow-hidden rounded-lg">
          <div className="flex items-center justify-between border-b border-edge px-4 py-3">
            <div className="hud-label">TACTICAL·LOG · BLACK BOX</div>
            <span className="hud-mono text-[10px] text-mint glow-mint">● LIVE</span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {events.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: -12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                transition={{ stiffness: 100, damping: 15 }}
                className="mb-1 flex items-start gap-3 rounded px-2 py-1.5 hover:bg-white/[0.02]"
              >
                <span className="hud-mono mt-0.5 text-[10px] text-slate-500">{e.timestamp}</span>
                <span
                  className={`hud-mono mt-0.5 text-[9px] tracking-wider ${
                    e.tone === 'mint'
                      ? 'text-mint glow-mint'
                      : e.tone === 'amber'
                        ? 'text-amber-cyber glow-amber'
                        : 'text-crimson-vitals glow-crimson'
                  }`}
                >
                  {e.tag}
                </span>
                <span className="flex-1 text-[11px] font-light text-slate-300">{e.message}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AssetTile({ asset, index }: { asset: AssetTelemetry; index: number }) {
  const state = riskStateOf(asset);
  const color = stateColor[state];
  const risk = asset.flatline ? 99 : asset.risk_score;
  const toneClass =
    color === 'mint'
      ? 'text-mint glow-mint'
      : color === 'amber'
        ? 'text-amber-cyber glow-amber'
        : 'text-crimson-vitals glow-crimson';
  const ringClass =
    color === 'mint'
      ? 'rgba(0,255,170,0.4)'
      : color === 'amber'
        ? 'rgba(255,170,0,0.4)'
        : 'rgba(255,30,86,0.5)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ stiffness: 100, damping: 15, delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      className="glass glass-hover relative flex flex-col gap-3 rounded-lg p-4"
      style={{ boxShadow: `inset 0 0 0 1px ${ringClass.replace('0.4', '0.08')}` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <asset.icon size={16} className={toneClass} />
          <div>
            <div className="font-display text-[13px] font-medium text-white">{asset.name}</div>
            <div className="hud-mono text-[9px] tracking-wider text-slate-500">
              {asset.id} · {asset.zone}
            </div>
          </div>
        </div>
        <span
          className={`hud-mono text-[9px] tracking-wider ${
            state === 'safe' ? 'text-mint' : state === 'warn' ? 'text-amber-cyber' : 'text-crimson-vitals'
          }`}
        >
          {state === 'safe' ? 'NOMINAL' : state === 'warn' ? 'ADVISORY' : 'CRITICAL'}
        </span>
      </div>

      {/* Risk factor + waveform */}
      <div className="relative flex items-end justify-between">
        <div className="flex flex-col">
          <span className="hud-label">RISK FACTOR</span>
          <motion.span
            key={risk}
            initial={{ opacity: 0.6, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ stiffness: 100, damping: 15 }}
            className={`hud-mono text-[44px] font-semibold leading-none ${toneClass}`}
            style={{ textShadow: state === 'critical' ? '0 0 18px rgba(255,30,86,0.5)' : undefined }}
          >
            {String(risk).padStart(2, '0')}
          </motion.span>
          {/* Inline ECG waveform — flatlines when sensor dead */}
          <HeartbeatWave flatline={asset.flatline} tone={color} />
        </div>
        <RiskRing value={risk} color={ringClass} />
      </div>

      {asset.flatline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="flex items-center gap-2 rounded border border-crimson-vitals/40 bg-crimson-vitals/10 px-2 py-1.5"
        >
          <ShieldAlert size={12} className="text-crimson-vitals glow-crimson" />
          <span className="hud-mono text-[10px] tracking-wider text-crimson-vitals glow-crimson">
            WATCHDOG: SENSOR FLATLINE
          </span>
        </motion.div>
      )}

      {/* Micro-ticker */}
      <div className="mt-1 grid grid-cols-3 gap-2 border-t border-edge pt-3">
        <Metric label="PERMITS" value={String(asset.active_permits).padStart(2, '0')} />
        <Metric label="GAS·ppm" value={String(asset.gas_level_ppm).padStart(2, '0')} tone={asset.gas_level_ppm > 30 ? 'amber' : undefined} />
        <Metric label="$/hr" value={`$${asset.financial_risk_exposure_per_hour.toLocaleString()}`} tone={asset.financial_risk_exposure_per_hour > 5000 ? 'crimson' : undefined} />
      </div>
    </motion.div>
  );
}

function HeartbeatWave({ flatline, tone }: { flatline: boolean; tone: 'mint' | 'amber' | 'crimson' }) {
  const stroke = tone === 'mint' ? '#00ffaa' : tone === 'amber' ? '#ffaa00' : '#ff1e56';
  if (flatline) {
    return (
      <svg width="120" height="20" viewBox="0 0 120 20" fill="none" className="mt-1">
        <line
          x1="0" y1="10" x2="120" y2="10"
          stroke={stroke}
          strokeWidth="1"
          opacity="0.7"
          style={{ filter: `drop-shadow(0 0 4px ${stroke})` }}
        />
      </svg>
    );
  }
  return (
    <svg width="120" height="20" viewBox="0 0 120 20" fill="none" className="mt-1">
      <motion.path
        d="M0 10 L18 10 L24 6 L30 14 L36 4 L42 16 L48 10 L70 10 L76 6 L82 14 L88 10 L120 10"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{ filter: `drop-shadow(0 0 4px ${stroke})` }}
        animate={{ pathLength: [0, 1] }}
        transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
      />
    </svg>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'amber' | 'crimson' }) {
  const c = tone === 'amber' ? 'text-amber-cyber glow-amber' : tone === 'crimson' ? 'text-crimson-vitals glow-crimson' : 'text-slate-200';
  return (
    <div>
      <div className="hud-label">{label}</div>
      <div className={`hud-mono text-[12px] font-medium ${c}`}>{value}</div>
    </div>
  );
}

function RiskRing({ value, color }: { value: number; color: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="2" fill="none" />
      <motion.circle
        cx="28"
        cy="28"
        r={r}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: off }}
        transition={{ stiffness: 100, damping: 15 }}
      />
    </svg>
  );
}
