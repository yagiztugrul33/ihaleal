/** RES (wind power) variant details. */

export interface ResDetay {
  installedCapacityMw?: number;
  turbineCount?: number;
  annualProductionMwh?: number;
  windSpeedMs?: number;
  gridConnection?: boolean;
  landLeaseYears?: number;
  environmentalPermit?: boolean;
}
