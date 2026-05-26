import { calculatePropertyTax } from "../../../shared/calculators";
import { parseNumericInput } from "./formatters";

type PropertyTaxResult = ReturnType<typeof calculatePropertyTax>;

export type PropertyTaxForm = {
  purchasePriceTry: string;
  salePriceTry: string;
  holdingYears: string;
  officialAssessmentTry2026: string;
  revolvingFundCoefficient: string;
  isUrbanTransformationExempt6306: boolean;
};

export function getDefaultPropertyTaxForm(): PropertyTaxForm {
  return {
    purchasePriceTry: "1.200.000",
    salePriceTry: "2.800.000",
    holdingYears: "3",
    officialAssessmentTry2026: "2.700.000",
    revolvingFundCoefficient: "1,00",
    isUrbanTransformationExempt6306: false,
  };
}

export function validatePropertyTaxForm(form: PropertyTaxForm): string | null {
  const purchase = parseNumericInput(form.purchasePriceTry);
  const sale = parseNumericInput(form.salePriceTry);
  const years = parseNumericInput(form.holdingYears);
  const assessment = parseNumericInput(form.officialAssessmentTry2026);
  const coefficient = parseNumericInput(form.revolvingFundCoefficient);

  if (!Number.isFinite(purchase) || purchase < 0) return "Alış tutarı geçersiz.";
  if (!Number.isFinite(sale) || sale <= 0) return "Satış tutarı 0'dan büyük olmalı.";
  if (!Number.isFinite(years) || years < 0 || years > 99) return "Elde tutma yılı 0-99 arasında olmalı.";
  if (!Number.isFinite(assessment) || assessment < 0) return "Matrah değeri geçersiz.";
  if (!Number.isFinite(coefficient) || coefficient < 0 || coefficient > 50) return "Döner sermaye katsayısı 0-50 aralığında olmalı.";

  return null;
}

export function computePropertyTax(form: PropertyTaxForm): { error: string } | { value: PropertyTaxResult } {
  const error = validatePropertyTaxForm(form);
  if (error) return { error };

  const result = calculatePropertyTax({
    purchasePriceTry: parseNumericInput(form.purchasePriceTry),
    salePriceTry: parseNumericInput(form.salePriceTry),
    holdingYears: Math.floor(parseNumericInput(form.holdingYears)),
    officialAssessmentTry2026: parseNumericInput(form.officialAssessmentTry2026),
    revolvingFundCoefficient: parseNumericInput(form.revolvingFundCoefficient),
    isUrbanTransformationExempt6306: form.isUrbanTransformationExempt6306,
  });

  if (result.totalTitleDeedCostTry < 0) return { error: "Motor geçersiz sonuç üretti. Girdileri tekrar kontrol edin." };
  return { value: result };
}

export function buildPropertyTaxSummaryRows(result: PropertyTaxResult): { label: string; value: number }[] {
  return [
    { label: "Tapu harcı toplam", value: result.deedDutyTotalTry },
    { label: "Döner sermaye", value: result.revolvingFundFeeTry },
    { label: "Toplam tapu maliyeti", value: result.totalTitleDeedCostTry },
    { label: "Değer artış vergisi", value: result.capitalGainTaxTry },
  ];
}
