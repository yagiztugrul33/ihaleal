import * as locationBridge from "../../../../shared/locationIntelligence";

export type DepremRiskRow = {
  id: string;
  region: string;
  riskScore: number;
  level: "Düşük" | "Orta" | "Yüksek";
  lastEvent: string;
};

const BASE_ROWS: DepremRiskRow[] = [
  { id: "d1", region: "İstanbul / Avcılar", riskScore: 74, level: "Yüksek", lastEvent: "M4.1 · 12 gün önce" },
  { id: "d2", region: "İzmir / Bornova", riskScore: 49, level: "Orta", lastEvent: "M3.8 · 21 gün önce" },
  { id: "d3", region: "Ankara / Çankaya", riskScore: 22, level: "Düşük", lastEvent: "M2.5 · 57 gün önce" },
];

export function getBridgeSignal() {
  const exportCount = Object.keys(locationBridge as Record<string, unknown>).length;
  return {
    exportCount,
    bridgeActive: exportCount > 0,
  };
}

export function getDepremMockRows(): DepremRiskRow[] {
  const { exportCount } = getBridgeSignal();
  const modifier = exportCount % 3;
  return BASE_ROWS.map((row) => ({ ...row, riskScore: Math.min(99, row.riskScore + modifier) }));
}
