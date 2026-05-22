export type TaxEstimateInput = {
  acquisitionDate: string;
  buyPrice: number;
  currentValue: number;
  isSwap?: boolean;
  now?: Date;
};

export type TaxEstimateResult = {
  fiveYearExempt: boolean;
  monthsUntilExempt: number;
  valueGain: number;
  estimatedValueGainTax: number;
  deedDuty: number;
  swapWarning: string | null;
};

const VALUE_GAIN_TAX_RATE = 0.15;
const DEED_DUTY_RATE = 0.04;

function monthDiff(from: Date, to: Date): number {
  const years = to.getFullYear() - from.getFullYear();
  const months = to.getMonth() - from.getMonth();
  return years * 12 + months;
}

export function estimateTax(input: TaxEstimateInput): TaxEstimateResult {
  const now = input.now ?? new Date();
  const acquiredAt = new Date(input.acquisitionDate);
  const heldMonths = Math.max(0, monthDiff(acquiredAt, now));
  const fiveYearExempt = heldMonths >= 60;
  const monthsUntilExempt = Math.max(0, 60 - heldMonths);
  const valueGain = Math.max(0, input.currentValue - input.buyPrice);
  const estimatedValueGainTax = fiveYearExempt ? 0 : Math.round(valueGain * VALUE_GAIN_TAX_RATE);
  const deedDuty = Math.round(input.currentValue * DEED_DUTY_RATE);
  const swapWarning = input.isSwap
    ? "Takasta cift yukumluluk dogabilir: iki taraf icin ayri tapu harci ve vergi kalemi olusabilir."
    : null;

  return {
    fiveYearExempt,
    monthsUntilExempt,
    valueGain,
    estimatedValueGainTax,
    deedDuty,
    swapWarning,
  };
}
