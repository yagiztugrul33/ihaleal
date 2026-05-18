export * from "./core/types";
export * from "./core/methodology";
export * from "./core/pipeline";
export { runGesAnalysis, type GesAnalysisInput, type GesAnalysisResult } from "./ges/gesEngine";
export {
  GES_ENGINE_DEFAULTS,
  gesEngineInputsFromLandEvaluation,
  resolveGesEngineInputs,
  type GesEngineInputs,
  type GesEngineSlopeAspect,
} from "./ges/gesEngineInputs";
export {
  GesEngineValidationError,
  calculateGesEngineFeasibility,
  calculateGesFeasibilityFromEngine,
  type GesEngineResult,
} from "./ges/gesEngineFeasibility";
export type { PvgisMonthlyData, PvgisResponse } from "@/lib/data/pvgisTypes";
export {
  GesValidationError,
  calculateGesFeasibility,
  type GesFeasibilityInput,
  type GesFeasibilityResult,
} from "./gesEngine";
export {
  ParcelValidationError,
  calculateParcelFeasibilityLegacy,
  type ParcelFeasibilityInput,
  type ParcelFeasibilityReport,
  type ParcelFeasibilityResult,
} from "./parcelFeasibility";
export {
  calculateParcelFeasibility,
  calculateParcelEngineFeasibility,
  type ParcelInputs,
  type ParcelFeasibilityResult as ParcelEngineFeasibilityResult,
} from "./parcel/parcelEngineFeasibility";
export { buildGesPrefeasibilityReport, buildParcelPrefeasibilityReport } from "./reportBuilder";
export {
  buildGesMarkdownReport,
  buildParcelMarkdownReport,
  reportId,
} from "./reports/markdownReports";
export { computeIrradiance } from "./ges/irradiance";
export { npv, irrBisection, lcoe, computeGesFinancials } from "./ges/financial";
export { computeZoningProbability } from "./land/zoningProbability";
export {
  runParcelIntelligence,
  type ParcelIntelligenceInput,
  type ParcelIntelligenceResult,
} from "./land/parcelIntelligence";
export { analyzeSoil, type SoilAnalysisInput } from "./geotech/soilAnalysis";
export { analyzeSeismic, type SeismicInput } from "./seismic/seismicEngine";
export { analyzeDisasterRisk, type DisasterInput } from "./disaster/disasterRisk";
export { analyzeFireSafety, type FireSafetyInput } from "./structural/fireSafety";
export { runSiteIntelligence, type SiteIntelligenceInput, type SiteIntelligenceResult } from "./urban/siteIntelligence";
export { saveAnalysisRun, listAnalysisRuns } from "./persistence/analysisRuns";
export { buildInstitutionalSiteReport } from "./reports/institutionalReport";
export {
  PRE_FEASIBILITY_LABEL,
  PRE_FEASIBILITY_DISCLAIMER_TR,
  safeCalculateGesEngineFeasibility,
  safeCalculateGesFeasibility,
  safeCalculateParcelFeasibility,
  safeAutomatedOfferAmount,
  sanitizeFinite,
} from "./safeCalc";
