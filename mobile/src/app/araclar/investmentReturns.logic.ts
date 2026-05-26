import { calculateInvestmentReturns } from "../../../shared/calculators";
import { parseNumericInput } from "./formatters";

type InvestmentReturnsResult = ReturnType<typeof calculateInvestmentReturns>;

export type InvestmentReturnsForm = {
  propertyPriceTry: string;
  monthlyRentTry: string;
  annualExpensesTry: string;
  annualAppreciationPct: string;
  holdingYears: string;
  city: "istanbul" | "tr";
};

export function getDefaultInvestmentReturnsForm(): InvestmentReturnsForm {
  return {
    propertyPriceTry: "6.000.000",
    monthlyRentTry: "38.000",
    annualExpensesTry: "72.000",
    annualAppreciationPct: "12",
    holdingYears: "5",
    city: "istanbul",
  };
}

export function validateInvestmentReturnsForm(form: InvestmentReturnsForm): string | null {
  const price = parseNumericInput(form.propertyPriceTry);
  const rent = parseNumericInput(form.monthlyRentTry);
  const expenses = parseNumericInput(form.annualExpensesTry);
  const appreciation = parseNumericInput(form.annualAppreciationPct);
  const years = parseNumericInput(form.holdingYears);

  if (!Number.isFinite(price) || price <= 0) return "Varlık fiyatı 0'dan büyük olmalı.";
  if (!Number.isFinite(rent) || rent < 0) return "Aylık kira negatif olamaz.";
  if (!Number.isFinite(expenses) || expenses < 0) return "Yıllık gider negatif olamaz.";
  if (!Number.isFinite(appreciation) || appreciation < -100 || appreciation > 300)
    return "Yıllık değer artışı %-100 ile %300 arasında olmalı.";
  if (!Number.isFinite(years) || years < 1 || years > 100) return "Elde tutma süresi 1-100 yıl arasında olmalı.";
  return null;
}

export function computeInvestmentReturns(
  form: InvestmentReturnsForm,
): { error: string } | { value: InvestmentReturnsResult } {
  const error = validateInvestmentReturnsForm(form);
  if (error) return { error };

  const result = calculateInvestmentReturns({
    propertyPriceTry: parseNumericInput(form.propertyPriceTry),
    monthlyRentTry: parseNumericInput(form.monthlyRentTry),
    annualExpensesTry: parseNumericInput(form.annualExpensesTry),
    annualAppreciationPct: parseNumericInput(form.annualAppreciationPct),
    holdingYears: Math.floor(parseNumericInput(form.holdingYears)),
    city: form.city,
  });

  return { value: result };
}

export function buildInvestmentReturnsRows(result: InvestmentReturnsResult): { label: string; value: number }[] {
  return [
    { label: "Yıllık brüt kira", value: result.annualGrossRentTry },
    { label: "Yıllık net kira", value: result.annualNetRentTry },
    { label: "Brüt getiri", value: result.grossYieldPct },
    { label: "Net getiri", value: result.netYieldPct },
    { label: "Toplam ROI", value: result.roiPct },
  ];
}
