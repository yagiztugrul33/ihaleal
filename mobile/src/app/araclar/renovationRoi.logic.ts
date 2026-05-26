import { calculateRenovationRoi } from "../../../shared/calculators";
import { parseNumericInput } from "./formatters";

type RenovationRoiResult = ReturnType<typeof calculateRenovationRoi>;

export type RenovationRoiForm = {
  renovationCostTry: string;
  valueIncreaseTry: string;
};

export function getDefaultRenovationRoiForm(): RenovationRoiForm {
  return {
    renovationCostTry: "450.000",
    valueIncreaseTry: "780.000",
  };
}

export function validateRenovationRoiForm(form: RenovationRoiForm): string | null {
  const cost = parseNumericInput(form.renovationCostTry);
  const increase = parseNumericInput(form.valueIncreaseTry);

  if (!Number.isFinite(cost) || cost <= 0) return "Renovasyon maliyeti 0'dan büyük olmalı.";
  if (!Number.isFinite(increase) || increase < 0) return "Değer artışı negatif olamaz.";
  if (cost > 1_000_000_000 || increase > 1_000_000_000) return "Girdi değeri çok yüksek.";
  return null;
}

export function computeRenovationRoi(form: RenovationRoiForm): { error: string } | { value: RenovationRoiResult } {
  const error = validateRenovationRoiForm(form);
  if (error) return { error };

  const result = calculateRenovationRoi({
    renovationCostTry: parseNumericInput(form.renovationCostTry),
    valueIncreaseTry: parseNumericInput(form.valueIncreaseTry),
  });

  return { value: result };
}

export function buildRenovationRoiRows(result: RenovationRoiResult): { label: string; value: number }[] {
  return [
    { label: "ROI", value: result.roiPct },
    { label: "Net kar", value: result.netProfitTry },
  ];
}
