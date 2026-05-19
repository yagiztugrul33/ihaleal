/** Konut (apartment / general residential) variant details. */

export interface KonutDetay {
  roomCount?: string;
  livingRoomCount?: number;
  bathroomCount?: number;
  netSqm?: number;
  grossSqm?: number;
  floor?: string;
  totalFloors?: number;
  buildingAge?: string | number;
  heatingType?: string;
  facade?: string;
  balcony?: boolean;
  elevator?: boolean;
  parking?: boolean;
  furnished?: boolean;
  siteName?: string;
  siteFeeTry?: number;
  duesTry?: number;
  eligibleForCredit?: boolean;
}
