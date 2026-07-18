// Shared telemetry API models — mirrors the shape a real backend would emit.

export type RiskState = 'safe' | 'warn' | 'critical';

export type AssetId = string;

export interface AssetTelemetry {
  id: AssetId;
  name: string;
  zone: string;
  icon: React.ElementType;
  risk_score: number;
  flatline: boolean;
  active_permits: number;
  gas_level_ppm: number;
  financial_risk_exposure_per_hour: number;
}

export type LogTone = 'mint' | 'amber' | 'crimson';

export interface TacticalLogEntry {
  id: string;
  timestamp: string;
  tag: string;
  message: string;
  tone: LogTone;
  asset_id?: AssetId;
}

export interface VibrationTelemetry {
  deviation_score: number;
  anomaly_mode: 'spike' | 'harmonic' | 'chaos';
}

export interface WorkerNode {
  id: string;
  x: number; // normalized 0..1
  y: number; // normalized 0..1
  label: string;
}

export interface ExitNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

// Cost-of-Risk Translator: exposure scales linearly from a floor at risk=0
// to a ceiling at risk=100, with a flatline penalty.
export function computeExposurePerHour(risk: number, flatline: boolean): number {
  const base = 200 + risk * 120; // $200/hr floor → $12,200/hr ceiling
  return flatline ? Math.round(base * 1.4) : Math.round(base);
}

export function riskStateOf(a: { flatline: boolean; risk_score: number }): RiskState {
  if (a.flatline) return 'critical';
  if (a.risk_score >= 70) return 'critical';
  if (a.risk_score >= 45) return 'warn';
  return 'safe';
}
