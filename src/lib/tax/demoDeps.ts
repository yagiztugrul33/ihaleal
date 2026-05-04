/**
 * Demo YI-UFE / GV brackets for TaxSimulator (informational only).
 */
import type { TaxBracket, TaxConfig, TapuDutyConfig, TaxSimulatorDeps, YiUfeRecord } from "./TaxSimulatorService";

const DEMO_YI_UFE: YiUfeRecord[] = [
  { yearMonth: "2021-01", indexValue: 100.0, source: "manual_entry", stale: false },
  { yearMonth: "2021-06", indexValue: 120.0, source: "manual_entry", stale: false },
  { yearMonth: "2022-06", indexValue: 150.0, source: "manual_entry", stale: false },
  { yearMonth: "2023-06", indexValue: 200.0, source: "manual_entry", stale: false },
  { yearMonth: "2024-06", indexValue: 280.0, source: "manual_entry", stale: false },
  { yearMonth: "2025-06", indexValue: 350.0, source: "manual_entry", stale: false },
  { yearMonth: "2026-04", indexValue: 400.0, source: "manual_entry", stale: false },
  { yearMonth: "2026-05", indexValue: 410.0, source: "manual_entry", stale: false },
];

const DEMO_BRACKETS: TaxBracket[] = [
  { year: 2026, limit: 158000, rate: 0.15 },
  { year: 2026, limit: 330000, rate: 0.2 },
  { year: 2026, limit: 800000, rate: 0.27 },
  { year: 2026, limit: 4300000, rate: 0.35 },
  { year: 2026, limit: Number.POSITIVE_INFINITY, rate: 0.4 },
];

const DEMO_CONFIG: TaxConfig = {
  annualGvExemption: 87000,
  fiveYearRuleMode: "calendar_day",
  yiUfeStaleThresholdDays: 30,
};

const DEMO_TAPU: TapuDutyConfig = {
  totalRate: 0.04,
  buyerShare: 0.5,
  sellerShare: 0.5,
  version: "2026.01-demo",
};

export function getDefaultTaxSimulatorDeps(overrides?: Partial<TaxSimulatorDeps>): TaxSimulatorDeps {
  return {
    yiUfeRecords: DEMO_YI_UFE,
    taxBrackets: DEMO_BRACKETS,
    config: DEMO_CONFIG,
    tapuDutyConfig: DEMO_TAPU,
    platformFeeRate: 0.04,
    platformVatRate: 0.2,
    otherFeesEstimate: 5000,
    currentDate: "2026-05",
    ...overrides,
  };
}
