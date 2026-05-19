/** Depo / warehouse variant details. */

export interface DepoDetay {
  warehouseSqm?: number;
  officeSqm?: number;
  clearHeightM?: number;
  dockCount?: number;
  coldStorage?: boolean;
  temperatureControlled?: boolean;
  rackingSystem?: boolean;
  truckAccess?: boolean;
  osbZone?: string;
  annualRentTry?: number;
}
