/** Devren (business transfer) variant details. */

export interface DevrenDetay {
  businessName?: string;
  sector?: string;
  transferPriceTry?: number;
  monthlyRentTry?: number;
  monthlyRevenueTry?: number;
  monthlyProfitTry?: number;
  employeeCount?: number;
  equipmentSummary?: string;
  leaseRemainingMonths?: number;
  contractType?: string;
  equipmentIncluded?: boolean;
  brandRights?: boolean;
  franchiseFeeTry?: number;
  transferReason?: string;
}
