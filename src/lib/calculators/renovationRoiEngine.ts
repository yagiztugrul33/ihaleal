export type RenovationRoiInput = {
  renovationCostTry: number;
  valueIncreaseTry: number;
};

export type RenovationRoiResult = {
  roiPct: number;
  netProfitTry: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateRenovationRoi(input: RenovationRoiInput): RenovationRoiResult {
  const cost = Math.max(1, input.renovationCostTry);
  const valueIncrease = input.valueIncreaseTry;
  const netProfit = valueIncrease - cost;
  const roi = (netProfit / cost) * 100;
  return {
    roiPct: round2(roi),
    netProfitTry: round2(netProfit),
  };
}
