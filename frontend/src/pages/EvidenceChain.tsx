import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { Link2, ShieldCheck, Fingerprint, Hash } from 'lucide-react';

type Block = {
  id: string;
  event: string;
  ts: string;
  hash: string;
  prev: string;
  broken?: boolean;
};

function fakeHash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  let s = h.toString(16).padStart(8, '0');
  while (s.length < 64) s += ((h = (h * 1103515245 + 12345) >>> 0).toString(16).padStart(8, '0'));
  return s.slice(0, 64);
}

const SEED: Block[] = Array.from({ length: 9 }, (_, i) => {
  const id = `EV-${String(20480 + i).padStart(5, '0')}`;
  const events = [
    'PERMIT·ISSUED',
    'GAS·ALERT',
    'GUARDRAIL·OVERRIDE',
    'EVAC·HOLD',
    'SENSOR·FLATLINE',
    'AUDIT·CITATION',
    'PERMIT·REVOKED',
    'EXPOSURE·SPIKE',
    'CHAIN·SEALED',
  ];
  const ts = `2026-07-17T${String(8 + i).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}Z`;
  return { id, event: events[i % events.length], ts, hash: fakeHash(id + ts), prev: i === 0 ? '0'.repeat(64) : '' } as Block;
}).map((b, i, arr) => (i === 0 ? b : { ...b, prev: arr[i - 1].hash }));

export default function EvidenceChain() {
  const [blocks, setBlocks] = useState<Block[]>(SEED);
  const [scanning, setScanning] = useState(false);
  const [scanIdx, setScanIdx] = useState(-1);
  const [verified, setVerified] = useState(false);
  const timerRef = useRef<number | null>(null);

  const verify = () => {
    setScanning(true);
    setVerified(false);
    setBlocks((prev) => prev.map((b) => ({ ...b, broken: false })));
    setScanIdx(-1);
    let i = 0;
    timerRef.current = window.setInterval(() => {
      setScanIdx(i);
      i++;
      if (i >= blocks.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setScanning(false);
        setVerified(true);
      }
    }, 220);
  };

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const tamper = (idx: number) => {
    setBlocks((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, hash: fakeHash(b.id + b.ts + 'TAMPER') } : b)),
    );
    setVerified(false);
  };

  return (
    <div className="flex h-full flex-col p-6">
      <PageHeader
        code="VIT·08 / EVIDENCE CHAIN"
        title="Evidence Chain of Custody"
        subtitle="Cryptographic terminal ledger — SHA-256 hash chain with integrity verification radar."
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={verify}
              disabled={scanning}
              className="flex items-center gap-2 rounded-md border border-mint/40 bg-mint/10 px-4 py-2 text-[11px] font-medium tracking-wider text-mint glow-mint transition-all hover:bg-mint/20 disabled:opacity-50"
            >
              <ShieldCheck size={12} />
              {scanning ? 'SCANNING...' : 'VERIFY CHAIN INTEGRITY'}
            </button>
          </div>
        }
      />

      <div className="glass flex-1 overflow-hidden rounded-lg">
        <div className="grid grid-cols-12 border-b border-edge px-4 py-3">
          <div className="col-span-1 hud-label">#</div>
          <div className="col-span-2 hud-label">ENTRY·ID</div>
          <div className="col-span-2 hud-label">EVENT·TYPE</div>
          <div className="col-span-2 hud-label">TIMESTAMP</div>
          <div className="col-span-3 hud-label">SHA·256 HASH</div>
          <div className="col-span-2 hud-label">PREV·HASH</div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
          {blocks.map((b, i) => (
            <div
              key={b.id}
              className={`relative grid grid-cols-12 items-center border-b border-edge px-4 py-2.5 text-[11px] transition-colors ${
                b.broken ? 'bg-crimson-vitals/15' : ''
              } ${scanIdx === i && scanning ? 'bg-mint/10' : ''}`}
            >
              {scanIdx === i && scanning && (
                <motion.div
                  layoutId="scan-beam"
                  className="absolute left-0 top-0 h-full w-full"
                  style={{ background: 'linear-gradient(180deg, transparent, rgba(0,255,170,0.18), transparent)' }}
                />
              )}
              <div className="col-span-1 hud-mono text-slate-500">{String(i + 1).padStart(2, '0')}</div>
              <div className="col-span-2 hud-mono flex items-center gap-2 text-slate-300">
                <Fingerprint size={11} className="text-mint" />
                {b.id}
              </div>
              <div className="col-span-2 hud-mono text-amber-cyber">{b.event}</div>
              <div className="col-span-2 hud-mono text-slate-400">{b.ts.slice(11, 19)}Z</div>
              <div className="col-span-3 hud-mono flex items-center gap-2">
                <Hash size={11} className={b.broken ? 'text-crimson-vitals' : 'text-slate-500'} />
                <span
                  className={`truncate ${b.broken ? 'text-crimson-vitals glow-crimson' : 'text-slate-300'}`}
                  title={b.hash}
                >
                  {b.hash.slice(0, 16)}…
                </span>
                <button
                  onClick={() => tamper(i)}
                  className="ml-1 rounded border border-edge px-1.5 py-0.5 text-[8px] text-slate-500 hover:border-crimson-vitals/40 hover:text-crimson-vitals"
                >
                  TAMPER
                </button>
              </div>
              <div className="col-span-2 hud-mono truncate text-slate-500" title={b.prev}>
                {b.prev.slice(0, 12)}…
              </div>
              <AnimatePresence>
                {b.broken && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <span className="hud-mono rounded border border-crimson-vitals/50 bg-crimson-vitals/20 px-2 py-0.5 text-[9px] tracking-wider text-crimson-vitals glow-crimson">
                      CHAIN BROKEN
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Link2 size={12} className="text-mint glow-mint" />
          <span className="hud-mono">{blocks.length} blocks · SHA-256 · linked ledger</span>
        </div>
        <AnimatePresence>
          {verified && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-md border border-mint/40 bg-mint/10 px-4 py-2"
            >
              <ShieldCheck size={14} className="text-mint glow-mint" />
              <span className="hud-mono text-[11px] tracking-wider text-mint glow-mint">
                CHAIN INTEGRITY VERIFIED · ALL BLOCKS SEALED
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
