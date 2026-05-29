import { runAdvancedValuation } from "./advancedValuation";
import type {
  HeatingType,
  LocationTier,
  PropertyCondition,
  ValuationInput as AdvancedValuationInput,
  ValuationResult,
} from "./advancedValuation";

export type { HeatingType, LocationTier, PropertyCondition, ValuationResult };
export type ValuationInput = Partial<
  Pick<AdvancedValuationInput, "roomCount" | "floor" | "totalFloors" | "heatingType" | "locationTier">
> &
  Omit<AdvancedValuationInput, "roomCount" | "floor" | "totalFloors" | "heatingType" | "locationTier">;

export function estimatePropertyValue(input: ValuationInput): ValuationResult {
  return runAdvancedValuation({
    ...input,
    roomCount: input.roomCount ?? 3,
    floor: input.floor ?? 4,
    totalFloors: input.totalFloors ?? 10,
    heatingType: input.heatingType ?? "combi",
    locationTier: input.locationTier ?? "balanced",
  });
}

export function formatTry(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}
