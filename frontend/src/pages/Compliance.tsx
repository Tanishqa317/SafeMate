import { useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { ClipboardCheck, BookOpen, AlertCircle, CheckCircle2, FileWarning } from 'lucide-react';

type Status = 'Compliant' | 'Minor Deviation' | 'Major Deviation';
type Anomaly = {
  id: string;
  regulation: string;
  anomaly: string;
  severity: 'minor' | 'major';
  recommendation: string;
  citation: string;
  status: Status;
};

const ANOMALIES: Anomaly[] = [
  {
    id: 'AN-001',
    regulation: '29 CFR 1910.119(c)(1)',
    anomaly: 'Missing employee participation documentation for Q3 review cycle',
    severity: 'minor',
    recommendation: 'Schedule participatory review session within 14 days; document attendance and minutes.',
    citation: 'PSM Element (c) — Employee Participation',
    status: 'Minor Deviation',
  },
  {
    id: 'AN-002',
    regulation: '29 CFR 1910.119(d)(3)(i)',
    anomaly: 'Process safety information for piping on RX-09 not updated after retrofit',
    severity: 'major',
    recommendation: 'Halt operations on affected piping until P&ID verification and MOC closure.',
    citation: 'PSM Element (d) — Process Safety Information',
    status: 'Major Deviation',
  },
  {
    id: 'AN-003',
    regulation: '29 CFR 1910.119(e)(3)(ii)',
    anomaly: 'PHA revalidation overdue by 47 days on Distillation Tower 3',
    severity: 'minor',
    recommendation: 'Initiate PHA revalidation; interim hazard assessment required within 7 days.',
    citation: 'PSM Element (e) — Process Hazard Analysis',
    status: 'Minor Deviation',
  },
  {
    id: 'AN-004',
    regulation: '29 CFR 1910.119(i)(2)(ii)',
    anomaly: 'Mechanical integrity inspection gap on Hydrocracker pressure vessels',
    severity: 'major',
    recommendation: 'Issue immediate stand-down for affected vessels; complete inspections before restart.',
    citation: 'PSM Element (i) — Mechanical Integrity',
    status: 'Major Deviation',
  },
  {
    id: 'AN-005',
    regulation: '29 CFR 1910.119(f)(4)',
    anomaly: 'Operating procedures for emergency shutdown not reviewed annually',
    severity: 'minor',
    recommendation: 'Conduct annual review and certify; retrain operators on updated procedures.',
    citation: 'PSM Element (f) — Operating Procedures',
    status: 'Minor Deviation',
  },
  {
    id: 'AN-006',
    regulation: '29 CFR 1910.119(g)(1)',
    anomaly: 'Training records incomplete for 3 new operators on Boiler House B',
    severity: 'minor',
    recommendation: 'Complete missing training documentation; verify competency through practical assessment.',
    citation: 'PSM Element (g) — Training',
    status: 'Minor Deviation',
  },
];

export default function Compliance() {
  const [selected, setSelected] = useState<Anomaly>(ANOMALIES[1]);
  const [filter, setFilter] = useState<'all' | 'minor' | 'major'>('all');

  const filtered = ANOMALIES.filter((a) => filter === 'all' || a.severity === filter);
  const majorCount = ANOMALIES.filter((a) => a.severity === 'major').length;
  const minorCount = ANOMALIES.filter((a) => a.severity === 'minor').length;
  const overall: Status = majorCount > 0 ? 'Major Deviation' : minorCount > 0 ? 'Minor Deviation' : 'Compliant';

  return (
    <div className="flex h-full flex-col p-6">
      <PageHeader
        code="VIT·09 / COMPLIANCE AUDIT"
        title="Compliance Audit Agent"
        subtitle="RAG-corpus agent — live regulatory anomaly detection with corrective actions and direct citations."
      />

      {/* Status banner */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          className={`glass rounded-lg p-4 ${
            overall === 'Major Deviation'
              ? 'border-crimson-vitals/30'
              : overall === 'Minor Deviation'
                ? 'border-amber-cyber/30'
                : 'border-mint/30'
          }`}
        >
          <div className="hud-label">OVERALL STATUS</div>
          <div className="mt-2 flex items-center gap-2">
            {overall === 'Major Deviation' ? (
              <FileWarning size={20} className="text-crimson-vitals glow-crimson" />
            ) : overall === 'Minor Deviation' ? (
              <AlertCircle size={20} className="text-amber-cyber glow-amber" />
            ) : (
              <CheckCircle2 size={20} className="text-mint glow-mint" />
            )}
            <span
              className={`font-display text-[18px] font-semibold ${
                overall === 'Major Deviation'
                  ? 'text-crimson-vitals glow-crimson'
                  : overall === 'Minor Deviation'
                    ? 'text-amber-cyber glow-amber'
                    : 'text-mint glow-mint'
              }`}
            >
              {overall}
            </span>
          </div>
        </div>
        <div className="glass rounded-lg p-4">
          <div className="hud-label">MAJOR DEVIATIONS</div>
          <div className="hud-mono mt-2 text-[28px] font-semibold text-crimson-vitals glow-crimson">
            {majorCount}
          </div>
        </div>
        <div className="glass rounded-lg p-4">
          <div className="hud-label">MINOR DEVIATIONS</div>
          <div className="hud-mono mt-2 text-[28px] font-semibold text-amber-cyber glow-amber">
            {minorCount}
          </div>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-5">
        {/* Matrix table */}
        <div className="glass flex flex-col overflow-hidden rounded-lg lg:col-span-3">
          <div className="flex items-center justify-between border-b border-edge px-4 py-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck size={14} className="text-mint glow-mint" />
              <span className="hud-label">REGULATORY ANOMALY MATRIX</span>
            </div>
            <div className="flex items-center gap-1">
              {(['all', 'minor', 'major'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`hud-mono rounded border px-2 py-1 text-[9px] tracking-wider transition-all ${
                    filter === f
                      ? 'border-mint/40 bg-mint/10 text-mint'
                      : 'border-edge text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-y-auto">
            {filtered.map((a, i) => (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ stiffness: 100, damping: 15, delay: i * 0.04 }}
                onClick={() => setSelected(a)}
                className={`grid w-full grid-cols-12 items-center gap-2 border-b border-edge px-4 py-3 text-left transition-colors ${
                  selected.id === a.id ? 'bg-mint/5' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="col-span-2 hud-mono text-[10px] text-slate-400">{a.id}</div>
                <div className="col-span-4 hud-mono text-[10px] text-amber-cyber">{a.regulation}</div>
                <div className="col-span-5 text-[11px] text-slate-300">{a.anomaly}</div>
                <div className="col-span-1 flex justify-end">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      a.severity === 'major' ? 'bg-crimson-vitals glow-crimson' : 'bg-amber-cyber glow-amber'
                    }`}
                  />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="glass glass-hover flex flex-col overflow-y-auto rounded-lg p-5 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen size={14} className="text-mint glow-mint" />
            <span className="hud-label">CORPUS·CITATION · DETAIL</span>
          </div>
          <div className="hud-mono text-[11px] text-amber-cyber">{selected.regulation}</div>
          <div className="mt-1 font-display text-[16px] font-medium text-white">
            {selected.anomaly}
          </div>
          <div className="mt-3">
            <span
              className={`hud-mono rounded border px-2 py-1 text-[9px] tracking-wider ${
                selected.severity === 'major'
                  ? 'border-crimson-vitals/40 bg-crimson-vitals/10 text-crimson-vitals glow-crimson'
                  : 'border-amber-cyber/40 bg-amber-cyber/10 text-amber-cyber glow-amber'
              }`}
            >
              {selected.severity.toUpperCase()} · {selected.status.toUpperCase()}
            </span>
          </div>

          <div className="mt-5">
            <div className="hud-label mb-2">RECOMMENDED CORRECTIVE ACTION</div>
            <p className="text-[12px] font-light leading-relaxed text-slate-200">
              {selected.recommendation}
            </p>
          </div>

          <div className="mt-5 rounded-md border border-edge bg-black/30 p-3">
            <div className="hud-label mb-2">DIRECT CITATION</div>
            <p className="hud-mono text-[11px] leading-relaxed text-slate-400">
              {selected.citation}
            </p>
          </div>

          <div className="mt-auto pt-5">
            <div className="hud-mono text-[10px] text-slate-500">
              RAG corpus · 2,847 docs · last sync 00:04:12 ago
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
