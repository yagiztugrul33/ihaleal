export const PROPERTY_TAX_CONSTANTS = {
  deedDutyTotalRate: 0.04, // %4 toplam tapu harcı
  deedDutyBuyerRate: 0.02, // %2 alıcı
  deedDutySellerRate: 0.02, // %2 satıcı
  defaultRevolvingFundBaseTry2026: 2_227, // 2026 döner sermaye baz kalem
  defaultRevolvingFundCoefficient: 1,
  capitalGainTaxRateUnder5Years: 0.15, // basitleştirilmiş alt dilim
  fiveYearExemptionYears: 5,
} as const;

export type PropertyTaxInput = {
  purchasePriceTry: number;
  salePriceTry: number;
  holdingYears: number;
  officialAssessmentTry2026?: number;
  revolvingFundCoefficient?: number;
  isUrbanTransformationExempt6306?: boolean;
};

export type PropertyTaxResult = {
  deedDutyAssessmentBaseTry: number;
  deedDutyTotalTry: number;
  deedDutyBuyerTry: number;
  deedDutySellerTry: number;
  revolvingFundFeeTry: number;
  totalTitleDeedCostTry: number;
  capitalGainTry: number;
  capitalGainTaxTry: number;
  exemptionApplied6306: boolean;
  fiveYearExemptApplied: boolean;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculatePropertyTax(input: PropertyTaxInput): PropertyTaxResult {
  const purchasePrice = Math.max(0, input.purchasePriceTry);
  const salePrice = Math.max(0, input.salePriceTry);
  const holdingYears = Math.max(0, input.holdingYears);
  const officialAssessment = Math.max(0, input.officialAssessmentTry2026 ?? 0);
  const coefficient = Math.max(0, input.revolvingFundCoefficient ?? PROPERTY_TAX_CONSTANTS.defaultRevolvingFundCoefficient);
  const exempt6306 = input.isUrbanTransformationExempt6306 === true;
  const assessmentBase = Math.max(salePrice, officialAssessment);

  const deedDutyTotal = exempt6306 ? 0 : assessmentBase * PROPERTY_TAX_CONSTANTS.deedDutyTotalRate;
  const deedDutyBuyer = exempt6306 ? 0 : assessmentBase * PROPERTY_TAX_CONSTANTS.deedDutyBuyerRate;
  const deedDutySeller = exempt6306 ? 0 : assessmentBase * PROPERTY_TAX_CONSTANTS.deedDutySellerRate;
  const revolvingFundFee = exempt6306 ? 0 : PROPERTY_TAX_CONSTANTS.defaultRevolvingFundBaseTry2026 * coefficient;
  const totalTitleDeedCost = deedDutyTotal + revolvingFundFee;
  const capitalGain = Math.max(0, salePrice - purchasePrice);
  const exempt = holdingYears >= PROPERTY_TAX_CONSTANTS.fiveYearExemptionYears;
  const capitalGainTax = exempt ? 0 : capitalGain * PROPERTY_TAX_CONSTANTS.capitalGainTaxRateUnder5Years;

  return {
    deedDutyAssessmentBaseTry: round2(assessmentBase),
    deedDutyTotalTry: round2(deedDutyTotal),
    deedDutyBuyerTry: round2(deedDutyBuyer),
    deedDutySellerTry: round2(deedDutySeller),
    revolvingFundFeeTry: round2(revolvingFundFee),
    totalTitleDeedCostTry: round2(totalTitleDeedCost),
    capitalGainTry: round2(capitalGain),
    capitalGainTaxTry: round2(capitalGainTax),
    exemptionApplied6306: exempt6306,
    fiveYearExemptApplied: exempt,
  };
}
