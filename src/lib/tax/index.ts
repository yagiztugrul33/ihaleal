// İhaleAL — Tax & Finance Core Exports
export { TaxSimulatorService, taxSimulatorService } from "./TaxSimulatorService";
export type {
  TaxSimulatorInput,
  YiUfeRecord,
  TaxBracket,
  TaxConfig,
  TapuDutyConfig,
  CostBreakdown,
  TaxSimulatorDeps,
} from "./TaxSimulatorService";
export {
  r2,
  parseYearMonth,
  getPreviousYearMonth,
  monthsBetween,
  isFiveYearExempt,
  getYiUfeValue,
  indexCost,
  calculateGV,
  calculateDeedDuty,
} from "./TaxSimulatorService";
export { mergeYiUfeRecords } from "./mergeYiUfeRecords";
export { fetchYiUfeFromTcmbEdge, type TcmbYiUfeFetchResult } from "./tcmbYiUfeClient";
