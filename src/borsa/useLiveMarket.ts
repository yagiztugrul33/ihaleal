import { useEffect, useState } from "react";

export type MarketDirection = "up" | "down";

export type MarketAsset = {
  id: string;
  code: string;
  property: string;
  region: "istanbul" | "ege" | "akdeniz" | "ankara" | "bodrum";
  category: "active" | "rising" | "volume" | "ending";
  price: number;
  changePct: number;
  volume: number;
  remainingMin: number;
  dir: MarketDirection;
};

export const INITIAL_MARKET_ASSETS: MarketAsset[] = [
  { id: "1", code: "KADIKÖY-D", property: "Kadikoy daire", region: "istanbul", category: "active", price: 12_850_000, changePct: 2.1, volume: 840, remainingMin: 54, dir: "up" },
  { id: "2", code: "ÇEŞME-A", property: "Cesme arsa", region: "ege", category: "rising", price: 18_300_000, changePct: 1.4, volume: 520, remainingMin: 112, dir: "up" },
  { id: "3", code: "LEVENT-O", property: "Levent ofis", region: "istanbul", category: "volume", price: 44_000_000, changePct: -0.8, volume: 1_240, remainingMin: 36, dir: "down" },
  { id: "4", code: "BODRUM-V", property: "Bodrum villa", region: "bodrum", category: "ending", price: 37_900_000, changePct: 0.6, volume: 410, remainingMin: 18, dir: "up" },
  { id: "5", code: "BEŞİKTAŞ-D", property: "Besiktas daire", region: "istanbul", category: "active", price: 16_100_000, changePct: -1.1, volume: 910, remainingMin: 65, dir: "down" },
  { id: "6", code: "İZMİR-K", property: "Izmir konut", region: "ege", category: "rising", price: 9_450_000, changePct: 1.8, volume: 600, remainingMin: 89, dir: "up" },
  { id: "7", code: "ANKARA-O", property: "Ankara ofis", region: "ankara", category: "volume", price: 13_650_000, changePct: 0.2, volume: 1_080, remainingMin: 74, dir: "up" },
  { id: "8", code: "SARIYER-V", property: "Sariyer villa", region: "istanbul", category: "active", price: 51_200_000, changePct: -0.5, volume: 460, remainingMin: 125, dir: "down" },
  { id: "9", code: "ALACATI-A", property: "Alacati arsa", region: "ege", category: "ending", price: 22_400_000, changePct: 0.9, volume: 570, remainingMin: 22, dir: "up" },
  { id: "10", code: "MURATPAŞA-D", property: "Antalya daire", region: "akdeniz", category: "rising", price: 11_900_000, changePct: -0.3, volume: 690, remainingMin: 95, dir: "down" },
];

export function useLiveMarket() {
  const [data, setData] = useState<MarketAsset[]>(INITIAL_MARKET_ASSETS);

  useEffect(() => {
    const id = window.setInterval(() => {
      setData((prev) =>
        prev.map((asset) => {
          const drift = Math.random() - 0.48;
          const delta = drift * asset.price * 0.008;
          const nextPrice = Math.max(1, asset.price + delta);
          const nextPct = asset.changePct + (delta / Math.max(asset.price, 1)) * 100;
          const nextVolume = Math.max(10, asset.volume + Math.round((Math.random() - 0.45) * 34));
          const nextRemaining = Math.max(1, asset.remainingMin - Math.floor(Math.random() * 2));
          return {
            ...asset,
            price: nextPrice,
            changePct: nextPct,
            volume: nextVolume,
            remainingMin: nextRemaining,
            dir: delta >= 0 ? "up" : "down",
          };
        }),
      );
    }, 2500);

    return () => window.clearInterval(id);
  }, []);

  return { data };
}
