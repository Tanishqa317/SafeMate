import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { Brain, Bot, ShieldCheck, Scale } from 'lucide-react';

const AGENTS = [
  {
    id: 'A',
    name: 'Confined Space Sentinel',
    icon: Bot,
    color: '#00ffaa',
    lines: [
      '> initializing confined-space monitor...',
      '> O2: 20.9% · LEL: 0% · H2S: 4ppm',
      '> entry permit #CS-2291 verified',
      '> atmospheric stability: NOMINAL',
      '> cross-checking ventilation log',
      '> confidence rising: 87% → 92%',
      '> sentinel verdict: PROCEED WITH WATCH',
    ],
  },
  {
    id: 'B',
    name: 'Permit Authenticator',
    icon: ShieldCheck,
    color: '#ffaa00',
    lines: [
      '> scanning permit chain #CW-4471..4480',
      '> hash chain integrity: SEALED',
      '> timing pattern analysis...',
      '> anomaly: 3 permits within 4m12s window',
      '> flagging permit #CW-4480 as SUSPECT',
      '> recommending manual review',
      '> confidence: 78% · escalating',
    ],
  },
  {
    id: 'C',
    name: 'Regulatory Compliance Auditor',
    icon: Scale,
    color: '#ff1e56',
    lines: [
      '> querying RAG corpus · 29 CFR 1910.119',
      '> cross-ref PSM element (c)(7)(ii)',
      '> gap detected: mechanical integrity log',
      '> citation: 1910.119(i)(2)(ii)',
      '> corrective action: 14-day remediation',
      '> severity: MAJOR DEVIATION',
      '> auditor verdict: ESCALATE TO HSE',
    ],
  },
];

export default function OracleSwarm() {
  const [remaining, setRemaining] = useState(3 * 3600 + 44 * 60 + 12); // 03:44:12
  const [confidences, setConfidences] = useState<number[]>([0, 0, 0]);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
      setConfidences((prev) => prev.map((c, i) => Math.min(1, c + 0.005 + (i === 1 ? 0.002 : 0))));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(Math.floor(remaining / 3600)).padStart(2, '0');
  const mm = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <div className="flex h-full flex-col p-6">
      <PageHeader
        code="VIT·05 / ORACLE SWARM"
        title="Oracle Swarm & Precognition Suite"
        subtitle="Precognition countdown + multi-agent AI consultation grid with confidence radial mapping."
      />

      {/* Precognition countdown */}
      <div className="glass relative mb-4 overflow-hidden rounded-lg p-6">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at center, rgba(255,30,86,0.18), transparent 70%)' }} />
        <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <div className="hud-mono mb-2 flex items-center gap-2 text-[11px] tracking-[0.3em] text-crimson-vitals glow-crimson">
              <Brain size={14} />
              PRECOGNITION ENGINE
            </div>
            <div className="font-display text-[15px] font-medium text-white">
              TIME REMAINING TO UNCONTROLLED STRUCTURAL EXCURSION
            </div>
          </div>
          <motion.div
            animate={{ textShadow: ['0 0 20px rgba(255,30,86,0.4)', '0 0 40px rgba(255,30,86,0.7)', '0 0 20px rgba(255,30,86,0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="hud-mono text-[64px] font-semibold leading-none text-crimson-vitals glow-crimson"
          >
            {hh}:{mm}:{ss}
          </motion.div>
        </div>
      </div>

      {/* Agent grid */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-3">
        {AGENTS.map((agent, i) => (
          <AgentPanel key={agent.id} agent={agent} confidence={confidences[i]} />
        ))}
      </div>
    </div>
  );
}

function AgentPanel({
  agent,
  confidence,
}: {
  agent: (typeof AGENTS)[number];
  confidence: number;
}) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let i = 0;
    setVisibleLines([]);
    const id = setInterval(() => {
      if (i < agent.lines.length) {
        setVisibleLines((prev) => [...prev, agent.lines[i]]);
        i++;
      } else {
        clearInterval(id);
      }
    }, 700);
    return () => clearInterval(id);
  }, [agent]);

  const r = 36;
  const c = 2 * Math.PI * r;
  const off = c - confidence * c;

  return (
    <div className="glass glass-hover flex flex-col overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-edge px-4 py-3">
        <div className="flex items-center gap-2">
          <agent.icon size={14} style={{ color: agent.color }} />
          <div>
            <div className="hud-mono text-[10px] tracking-wider text-slate-500">
              AGENT {agent.id}
            </div>
            <div className="font-display text-[12px] font-medium text-white">{agent.name}</div>
          </div>
        </div>
        <div className="relative h-20 w-20">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="2" fill="none" />
            <motion.circle
              cx="40"
              cy="40"
              r={r}
              stroke={agent.color}
              strokeWidth="2"
              fill="none"
              strokeDasharray={c}
              strokeDashoffset={off}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              style={{ filter: `drop-shadow(0 0 6px ${agent.color})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="hud-mono text-[14px] font-semibold" style={{ color: agent.color }}>
              {Math.round(confidence * 100)}%
            </span>
            <span className="hud-mono text-[8px] text-slate-500">CONF</span>
          </div>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4">
        {visibleLines.map((line, i) => (
          <motion.div
            key={`${line}-${i}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="hud-mono mb-1 text-[11px] leading-relaxed"
            style={{ color: line.includes('>') ? agent.color : '#cbd2dd' }}
          >
            {line}
          </motion.div>
        ))}
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="hud-mono inline-block h-3 w-2"
          style={{ background: agent.color }}
        />
      </div>
    </div>
  );
}
