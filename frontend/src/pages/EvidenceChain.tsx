import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { Link2, ShieldCheck, Fingerprint, Hash, RefreshCw, PlusCircle } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';
const UNIT_ID = 'unit-1'; // TODO: wire to global unit selector if/when one exists

type ChainEntry = {
  entry_id: number;
  event_type: string;
  unit_id: string;
  payload: Record<string, unknown>;
  timestamp: string;
  previous_hash: string;
  entry_hash: string;
};

type VerifyResult = {
  is_valid: boolean;
  total_entries: number;
  broken_at_entry?: number | null;
  message: string;
};

export default function EvidenceChain() {
  const [entries, setEntries] = useState<ChainEntry[]>([]);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanIdx, setScanIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [confirmTamperIdx, setConfirmTamperIdx] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const fetchChain = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${API_BASE}/evidence/chain`);
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data: ChainEntry[] = await res.json();
      setEntries(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to reach backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChain(); // one-time load — no auto-polling
  }, [fetchChain]);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  const generateDemoEvidence = async () => {
    setGenerating(true);
    setFetchError(null);
    try {
      const res = await fetch(`${API_BASE}/evidence/demo/${UNIT_ID}`);
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      await fetchChain();
      setVerifyResult(null);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to reach backend');
    } finally {
      setGenerating(false);
    }
  };

  const verify = async () => {
    setScanning(true);
    setVerifyResult(null);
    setScanIdx(-1);
    let i = 0;
    timerRef.current = window.setInterval(() => {
      setScanIdx(i);
      i++;
      if (i >= entries.length) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 220);

    try {
      const res = await fetch(`${API_BASE}/evidence/verify`);
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const result: VerifyResult = await res.json();
      // let the scan animation finish before revealing the result
      window.setTimeout(
        () => {
          setVerifyResult(result);
          setScanning(false);
        },
        entries.length * 220 + 100,
      );
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to reach backend');
      setScanning(false);
    }
  };

  const requestTamper = (idx: number) => setConfirmTamperIdx(idx);

  const confirmTamper = async (idx: number) => {
    const entry = entries[idx];
    setConfirmTamperIdx(null);
    try {
      const res = await fetch(
        `${API_BASE}/evidence/tamper-test?entry_id=${entry.entry_id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tampered: true, note: 'Manually tampered from UI demo' }),
        },
      );
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      await fetchChain();
      setVerifyResult(null);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to reach backend');
    }
  };

  const brokenAt = verifyResult?.broken_at_entry ?? null;

  return (
    <div className="flex h-full flex-col p-6">
      <PageHeader
        code="VIT·08 / EVIDENCE CHAIN"
        title="Evidence Chain of Custody"
        subtitle="Cryptographic terminal ledger — SHA-256 hash chain with integrity verification radar."
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchChain}
              disabled={loading}
              className="flex items-center gap-2 rounded-md border border-edge px-3 py-2 text-[11px] text-slate-300 transition-all hover:border-mint/40 disabled:opacity-50"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              {loading ? 'LOADING' : 'REFRESH'}
            </button>
            <button
              onClick={generateDemoEvidence}
              disabled={generating}
              className="flex items-center gap-2 rounded-md border border-amber-cyber/40 bg-amber-cyber/10 px-3 py-2 text-[11px] font-medium tracking-wider text-amber-cyber transition-all hover:bg-amber-cyber/20 disabled:opacity-50"
            >
              <PlusCircle size={12} />
              {generating ? 'GENERATING...' : 'GENERATE DEMO EVIDENCE'}
            </button>
            <button
              onClick={verify}
              disabled={scanning || entries.length === 0}
              className="flex items-center gap-2 rounded-md border border-mint/40 bg-mint/10 px-4 py-2 text-[11px] font-medium tracking-wider text-mint glow-mint transition-all hover:bg-mint/20 disabled:opacity-50"
            >
              <ShieldCheck size={12} />
              {scanning ? 'SCANNING...' : 'VERIFY CHAIN INTEGRITY'}
            </button>
          </div>
        }
      />

      {fetchError && (
        <div className="mb-3 glass rounded-md border border-crimson-vitals/30 px-4 py-2 hud-mono text-[10px] text-crimson-vitals">
          BACKEND UNREACHABLE · {fetchError}
        </div>
      )}

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
          {entries.length === 0 && !loading && (
            <div className="p-6 hud-mono text-[11px] text-slate-500">
              No evidence entries yet. Click "GENERATE DEMO EVIDENCE" to seed the chain.
            </div>
          )}
          {entries.map((e, i) => {
            const broken = brokenAt === e.entry_id;
            return (
              <div
                key={e.entry_id}
                className={`relative grid grid-cols-12 items-center border-b border-edge px-4 py-2.5 text-[11px] transition-colors ${
                  broken ? 'bg-crimson-vitals/15' : ''
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
                  EV-{String(e.entry_id).padStart(5, '0')}
                </div>
                <div className="col-span-2 hud-mono text-amber-cyber">{e.event_type}</div>
                <div className="col-span-2 hud-mono text-slate-400">
                  {e.timestamp.slice(11, 19)}
                </div>
                <div className="col-span-3 hud-mono flex items-center gap-2">
                  <Hash size={11} className={broken ? 'text-crimson-vitals' : 'text-slate-500'} />
                  <span
                    className={`truncate ${broken ? 'text-crimson-vitals glow-crimson' : 'text-slate-300'}`}
                    title={e.entry_hash}
                  >
                    {e.entry_hash.slice(0, 16)}…
                  </span>
                  <button
                    onClick={() => requestTamper(i)}
                    className="ml-1 rounded border border-edge px-1.5 py-0.5 text-[8px] text-slate-500 hover:border-crimson-vitals/40 hover:text-crimson-vitals"
                    title="Permanently corrupts this real entry — for demo only"
                  >
                    TAMPER
                  </button>
                </div>
                <div className="col-span-2 hud-mono truncate text-slate-500" title={e.previous_hash}>
                  {e.previous_hash.slice(0, 12)}…
                </div>
                <AnimatePresence>
                  {broken && (
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
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Link2 size={12} className="text-mint glow-mint" />
          <span className="hud-mono">{entries.length} entries · SHA-256 · linked ledger</span>
        </div>
        <AnimatePresence>
          {verifyResult && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-2 rounded-md border px-4 py-2 ${
                verifyResult.is_valid
                  ? 'border-mint/40 bg-mint/10'
                  : 'border-crimson-vitals/40 bg-crimson-vitals/10'
              }`}
            >
              <ShieldCheck
                size={14}
                className={verifyResult.is_valid ? 'text-mint glow-mint' : 'text-crimson-vitals glow-crimson'}
              />
              <span
                className={`hud-mono text-[11px] tracking-wider ${
                  verifyResult.is_valid ? 'text-mint glow-mint' : 'text-crimson-vitals glow-crimson'
                }`}
              >
                {verifyResult.is_valid
                  ? 'CHAIN INTEGRITY VERIFIED · ALL BLOCKS SEALED'
                  : `CHAIN BROKEN AT ENTRY ${verifyResult.broken_at_entry} · ${verifyResult.message}`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {confirmTamperIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <div className="glass max-w-md rounded-lg border border-crimson-vitals/40 p-6">
              <div className="mb-2 hud-mono text-[11px] tracking-wider text-crimson-vitals glow-crimson">
                CONFIRM TAMPER ACTION
              </div>
              <p className="mb-4 text-[13px] text-slate-300">
                This permanently corrupts entry EV-
                {String(entries[confirmTamperIdx]?.entry_id).padStart(5, '0')} in the real,
                persisted evidence chain file. It will not undo automatically — you'll need to
                delete <code>evidence_chain.json</code> on the backend to reset it. Continue?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmTamperIdx(null)}
                  className="rounded-md border border-edge px-3 py-2 text-[11px] text-slate-300"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => confirmTamper(confirmTamperIdx)}
                  className="rounded-md border border-crimson-vitals/40 bg-crimson-vitals/10 px-3 py-2 text-[11px] text-crimson-vitals"
                >
                  TAMPER ANYWAY
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}