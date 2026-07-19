import { useEffect, useState } from 'react';

const API_BASE = 'http://127.0.0.1:8000/api';

const REAL_UNITS = [
  { id: 'unit-1', name: 'Hydrocracker Complex', zone: 'UNIT·4A' },
  { id: 'unit-2', name: 'Distillation Tower 3', zone: 'UNIT·1B' },
  { id: 'unit-3', name: 'Catalytic Reformer', zone: 'UNIT·2C' },
  { id: 'unit-4', name: 'Boiler House B', zone: 'UTIL·1' },
  { id: 'unit-5', name: 'Storage Terminal 5', zone: 'TANK·FARM' },
];

export interface LiveAsset {
  id: string;
  name: string;
  zone: string;
  risk_score: number;
  risk_level: string;
  primary_concern: string;
  reasoning: string;
  estimated_cost_usd: number | null;
  loading: boolean;
  error: string | null;
}

async function fetchUnit(unitId: string): Promise<Partial<LiveAsset>> {
  const [riskRes, costRes] = await Promise.all([
    fetch(`${API_BASE}/risk-assessment/${unitId}`),
    fetch(`${API_BASE}/cost-of-risk/${unitId}`),
  ]);

  if (!riskRes.ok) throw new Error(`risk-assessment failed: ${riskRes.status}`);
  const risk = await riskRes.json();

  if (risk.error) throw new Error(risk.error);

  let cost: any = {};
  if (costRes.ok) {
    cost = await costRes.json();
  }

  return {
    risk_score: risk.risk_score,
    risk_level: risk.risk_level,
    primary_concern: risk.primary_concern,
    reasoning: risk.reasoning,
    estimated_cost_usd: cost.estimated_cost_usd ?? null,
  };
}

// refreshKey: bump this number (e.g. via a button) to trigger a fresh fetch.
// No automatic polling — this is intentional, to protect the Gemini free-tier
// daily quota (20 requests/day), which auto-polling exhausted previously.
export function useAssetTelemetry(refreshKey: number) {
  const [assets, setAssets] = useState<LiveAsset[]>(
    REAL_UNITS.map((u) => ({
      ...u,
      risk_score: 0,
      risk_level: 'unknown',
      primary_concern: '',
      reasoning: '',
      estimated_cost_usd: null,
      loading: true,
      error: null,
    })),
  );

  useEffect(() => {
    let cancelled = false;

    const pull = async () => {
      setAssets((prev) => prev.map((a) => ({ ...a, loading: true, error: null })));

      const updated = await Promise.all(
        REAL_UNITS.map(async (u) => {
          try {
            const data = await fetchUnit(u.id);
            return { ...u, ...data, loading: false, error: null } as LiveAsset;
          } catch (e: any) {
            return {
              ...u,
              risk_score: 0,
              risk_level: 'unknown',
              primary_concern: '',
              reasoning: '',
              estimated_cost_usd: null,
              loading: false,
              error: e.message ?? 'fetch failed',
            } as LiveAsset;
          }
        }),
      );
      if (!cancelled) setAssets(updated);
    };

    pull();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]); // fires once on mount, and again whenever refreshKey changes

  return assets;
}