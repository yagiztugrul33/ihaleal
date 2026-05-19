/** Yali (waterside mansion) variant details. */

export interface YaliDetay {
  netSqm?: number;
  landSqm?: number;
  waterfrontM?: number;
  privatePier?: boolean;
  boathouse?: boolean;
  historicRegistration?: string;
  restorationStatus?: string;
  roomCount?: string;
  viewType?: "bosphorus" | "sea" | "lake" | "river";
}
