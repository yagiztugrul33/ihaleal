const fs = require("fs");
function w(p, c) { fs.writeFileSync(p, c, "utf8"); console.log("wrote", p); }

w("src/lib/intelligenceHub.ts", `export { ROUTES, INTELLIGENCE_ROUTES, type AppRoute } from "@/constants/routes";

export const INTELLIGENCE_HUB_PATH = ROUTES.INTELLIGENCE_HUB;
export const GES_ANALYSIS_PATH = ROUTES.GES_ANALYSIS;
export const PARCEL_INTELLIGENCE_PATH = ROUTES.PARCEL_INTELLIGENCE;
export const LAND_INVESTMENT_PATH = ROUTES.LAND_INVESTMENT;
export const WAR_ROOM_PATH = ROUTES.WAR_ROOM;
export const GIS_INTELLIGENCE_PATH = ROUTES.GIS_INTELLIGENCE;
`);

w("src/lib/engineering/index.ts", `export * from "./core/types";
export * from "./core/methodology";
export * from "./core/pipeline";
export { runGesAnalysis, type GesAnalysisInput, type GesAnalysisResult } from "./ges/gesEngine";
export {
  GesValidationError,
  calculateGesFeasibility,
  type GesFeasibilityInput,
  type GesFeasibilityResult,
} from "./gesEngine";
export {
  ParcelValidationError,
  calculateParcelFeasibility,
  type ParcelFeasibilityInput,
  type ParcelFeasibilityResult,
} from "./parcelFeasibility";
export { buildGesPrefeasibilityReport, buildParcelPrefeasibilityReport } from "./reportBuilder";
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
`);