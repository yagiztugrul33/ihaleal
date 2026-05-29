/** Mustakil konut variant details. */

export interface MustakilDetay {
  landSqm?: number;
  netSqm?: number;
  grossSqm?: number;
  floorCount?: number;
  gardenSqm?: number;
  roomCount?: string;
  heatingType?: string;
  detached?: boolean;
  cornerParcel?: boolean;
}
