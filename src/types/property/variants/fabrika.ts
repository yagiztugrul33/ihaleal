/** Fabrika / industrial production variant details. */

export interface FabrikaDetay {
  productionSqm?: number;
  officeSqm?: number;
  ceilingHeightM?: number;
  powerKva?: number;
  craneCapacityTon?: number;
  loadingDockCount?: number;
  osbZone?: string;
  environmentalPermit?: boolean;
  fireApproval?: boolean;
  tenantName?: string;
  annualRentTry?: number;
}
