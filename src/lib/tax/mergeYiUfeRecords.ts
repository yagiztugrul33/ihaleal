import type { YiUfeRecord } from "./TaxSimulatorService";

/** Merge demo sparse points with TCMB monthly series; official wins on same YYYY-MM. */
export function mergeYiUfeRecords(demo: YiUfeRecord[], official: YiUfeRecord[]): YiUfeRecord[] {
  const map = new Map<string, YiUfeRecord>();
  for (const r of demo) {
    map.set(r.yearMonth, { ...r });
  }
  for (const r of official) {
    map.set(r.yearMonth, {
      yearMonth: r.yearMonth,
      indexValue: r.indexValue,
      source: "tcmb_evds",
      stale: false,
    });
  }
  return Array.from(map.values()).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
}