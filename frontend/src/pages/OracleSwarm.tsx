import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { Brain, Flame, Shield, Swords, RefreshCw } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';
const UNIT_ID = 'unit-1'; // TODO: wire to global unit selector if/when one exists

type Agent = {
  id: string;
  name: string;
  lines: string[];
  confidence: number;
  verdict: string;
};

type OracleData = {
  unit_id: string;
  countdown_seconds: number;
  consensus: {
    final_verdict: string;
    consensus: boolean;
    agent_results: unknown[];
  };
  agents: Agent[];
};

const ICONS: Record<string, React.ElementType> = {
  'Aggressive Oracle': Flame,
  'Conservative Oracle': Shield,
  'Adversarial Oracle': Swords,
};

const COLORS: Record<string, string> = {
  'Aggressive Oracle': '#ff1e56',
  'Conservative Oracle': '#00ffaa',
  'Adversarial Oracle': '#ffaa00',
};

export default function OracleSwarm() {
  const [data, setData] = useState<OracleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);

  const fetchSwarm = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${API_BASE}/oracle-swarm/${UNIT_ID}`);
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const json: OracleData = await res.json();
      setData(json);
      setRemaining(json.countdown_seconds);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to reach backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSwarm(); // one-time load — no auto-polling (protects Gemini quota)
  }, [fetchSwarm]);

  // Countdown ticks down client-side from the server-provided seconds —
  // presentation only, doesn't refetch or fabricate new data.
  useEffect(() => {
    if (!data) return;
    const id = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [data]);

  const hh = String(Math.floor(remaining / 3600)).padStart(2, '0');
  const mm = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const consensus = data?.consensus;
  const consensusColor = consensus?.consensus ? '#ff1e56' : '#00ffaa';

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <PageHeader
        code="VIT·05 / ORACLE SWARM"
        title="Oracle Swarm & Precognition Suite"
        subtitle="Precognition countdown + multi-agent AI consultation grid with confidence radial mapping."
        right={
          <button
            onClick={fetchSwarm}
            disabled={loading}
            className="glass glass-hover flex items-center gap-2 rounded-md px-3 py-2 text-[11px] text-slate-200 disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            {loading ? 'LOADING' : 'REFRESH'}
          </button>
        }
      />

      {fetchError && (
        <div className="mb-3 glass rounded-md border border-amber-cyber/30 px-4 py-2 hud-mono text-[10px] text-amber-cyber">
          BACKEND UNREACHABLE · {fetchError}
        </div>
      )}

      {/* Precognition countdown */}
      <div className="glass relative mb-4 overflow-hidden rounded-lg p-6">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,30,86,0.18), transparent 70%)' }}
        />
        <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <div className="hud-mono mb-2 flex items-center gap-2 text-[11px] tracking-[0.3em] text-crimson-vitals glow-crimson">
              <Brain size={14} />
              PRECOGNITION ENGINE
            </div>
            <div className="font-display text-[15px] font-medium text-white">
              TIME REMAINING TO UNCONTROLLED STRUCTURAL EXCURSION
            </div>
            {consensus && (
              <div className="hud-mono mt-2 text-[11px]" style={{ color: consensusColor }}>
                CONSENSUS: {consensus.final_verdict.toUpperCase()} RISK ·{' '}
                {consensus.consensus ? '2+ AGENTS AGREE HIGH RISK' : 'NO HIGH-RISK CONSENSUS'}
              </div>
            )}
          </div>
          <motion.div
            animate={{
              textShadow: [
                '0 0 20px rgba(255,30,86,0.4)',
                '0 0 40px rgba(255,30,86,0.7)',
                '0 0 20px rgba(255,30,86,0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="hud-mono text-[64px] font-semibold leading-none text-crimson-vitals glow-crimson"
          >
            {hh}:{mm}:{ss}
          </motion.div>
        </div>
      </div>

      {/* Agent grid */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-3">
        {(data?.agents ?? []).map((agent) => (
          <AgentPanel key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

function AgentPanel({ agent }: { agent: Agent }) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const Icon = ICONS[agent.name] ?? Brain;
  const color = COLORS[agent.name] ?? '#00ffaa';

 useEffect(() => {
    let cancelled = false;
    let i = 0;
    setVisibleLines([]);
    const id = setInterval(() => {
      if (cancelled) return;
      if (i < agent.lines.length) {
        const nextLine = agent.lines[i];
        setVisibleLines((prev) => (prev[prev.length - 1] === nextLine ? prev : [...prev, nextLine]));
        i++;
      } else {
        clearInterval(id);
      }
    }, 700);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [agent]);

  const r = 36;
  const c = 2 * Math.PI * r;
  const off = c - agent.confidence * c;

  return (
    <div className="glass glass-hover flex flex-col overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-edge px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color }} />
          <div>
            <div className="hud-mono text-[10px] tracking-wider text-slate-500">
              {agent.name.toUpperCase()}
            </div>
            <div className="font-display text-[12px] font-medium text-white">{agent.verdict}</div>
          </div>
        </div>
        <div className="relative h-20 w-20">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="2" fill="none" />
            <motion.circle
              cx="40"
              cy="40"
              r={r}
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeDasharray={c}
              strokeDashoffset={off}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="hud-mono text-[14px] font-semibold" style={{ color }}>
              {Math.round(agent.confidence * 100)}%
            </span>
            <span className="hud-mono text-[8px] text-slate-500">CONF</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {visibleLines.map((line, i) => (
          <motion.div
            key={`${line}-${i}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="hud-mono mb-1 text-[11px] leading-relaxed"
            style={{ color: line.includes('>') ? color : '#cbd2dd' }}
          >
            {line}
          </motion.div>
        ))}
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="hud-mono inline-block h-3 w-2"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}