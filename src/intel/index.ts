export type {
  RegionIntelRaw,
  RegionIntelScored,
  RegionLayerKey,
  RegionSignal,
  RegionSignalLevel,
  RegionSummary,
  RegionTag,
} from "@/intel/types";
export { buildSignals, scoreRegion } from "@/intel/signals";
export { computeEnvironmentBreakdown, computeEnvironmentScore, getRegionTag } from "@/intel/scoring";
export {
  listRegionIntel,
  getRegionIntelBySlug,
  getRegionSummary,
  resolveRegionSlugByLocation,
  getRegionLabelBySlug,
  getRegionLayerValue,
} from "@/intel/regions";
