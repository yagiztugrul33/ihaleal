export const PROPERTY_TAX_CONSTANTS = {
  deedDutyTotalRate: 0.04, // %4 toplam tapu harcı
  deedDutyBuyerRate: 0.02, // %2 alıcı
  deedDutySellerRate: 0.02, // %2 satıcı
  capitalGainTaxRateUnder5Years: 0.15, // basitleştirilmiş alt dilim
  fiveYearExemptionYears: 5,
} as const;

export type PropertyTaxInput = {
  purchasePriceTry: number;
  salePriceTry: number;
  holdingYears: number;
};

export type PropertyTaxResult = {
  deedDutyTotalTry: number;
  deedDutyBuyerTry: number;
  deedDutySellerTry: number;
  capitalGainTry: number;
  capitalGainTaxTry: number;
  fiveYearExemptApplied: boolean;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculatePropertyTax(input: PropertyTaxInput): PropertyTaxResult {
  const purchasePrice = Math.max(0, input.purchasePriceTry);
  const salePrice = Math.max(0, input.salePriceTry);
  const holdingYears = Math.max(0, input.holdingYears);

  const deedDutyTotal = salePrice * PROPERTY_TAX_CONSTANTS.deedDutyTotalRate;
  const deedDutyBuyer = salePrice * PROPERTY_TAX_CONSTANTS.deedDutyBuyerRate;
  const deedDutySeller = salePrice * PROPERTY_TAX_CONSTANTS.deedDutySellerRate;
  const capitalGain = Math.max(0, salePrice - purchasePrice);
  const exempt = holdingYears >= PROPERTY_TAX_CONSTANTS.fiveYearExemptionYears;
  const capitalGainTax = exempt ? 0 : capitalGain * PROPERTY_TAX_CONSTANTS.capitalGainTaxRateUnder5Years;

  return {
    deedDutyTotalTry: round2(deedDutyTotal),
    deedDutyBuyerTry: round2(deedDutyBuyer),
    deedDutySellerTry: round2(deedDutySeller),
    capitalGainTry: round2(capitalGain),
    capitalGainTaxTry: round2(capitalGainTax),
    fiveYearExemptApplied: exempt,
  };
}
