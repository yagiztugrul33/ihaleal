/** GES (solar PV) variant details. */

export interface GesDetay {
  installedCapacityMw?: number;
  panelCount?: number;
  annualProductionMwh?: number;
  gridConnection?: boolean;
  feedInTariff?: string;
  landLeaseYears?: number;
  ppaSigned?: boolean;
  inverterBrand?: string;
  commissioningDate?: string;
}
