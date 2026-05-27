import type { MarketDataAsset } from "../../../shared/borsa";
import type { DataSort } from "./types";

export function formatTl(value: number): string {
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value)} TL`;
}

export function formatPercent(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

export function sortAssets(assets: MarketDataAsset[], sort: DataSort): MarketDataAsset[] {
  const output = [...assets];
  output.sort((a, b) => {
    if (sort === "volumeDesc") return b.volume - a.volume;
    if (sort === "priceDesc") return b.price - a.price;
    return b.changePct - a.changePct;
  });
  return output;
}

export function marketTrendLabel(changePctAvg: number): "Pozitif" | "Negatif" | "Nötr" {
  if (changePctAvg > 0.1) return "Pozitif";
  if (changePctAvg < -0.1) return "Negatif";
  return "Nötr";
}
