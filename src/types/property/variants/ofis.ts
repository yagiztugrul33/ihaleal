/** Ofis variant details. */

export interface OfisDetay {
  netSqm?: number;
  grossSqm?: number;
  floor?: string;
  totalFloors?: number;
  classRating?: "A" | "B" | "C";
  divisible?: boolean;
  fitOut?: "shell" | "fitted" | "turnkey";
  annualRentTry?: number;
  occupancyRate?: number;
  parkingRatio?: number;
}
