import { describe, expect, it } from "vitest";

import { DEMO_MARKET_ASSETS } from "../../../../shared/demoMarket";
import { marketTrendLabel, sortAssets } from "../helpers";

describe("borsa-detay helpers", () => {
  it("sorts by descending price", () => {
    const out = sortAssets(DEMO_MARKET_ASSETS, "priceDesc");
    expect(out[0].price).toBeGreaterThanOrEqual(out[out.length - 1].price);
  });

  it("returns trend labels", () => {
    expect(marketTrendLabel(1)).toBe("Pozitif");
    expect(marketTrendLabel(-1)).toBe("Negatif");
    expect(marketTrendLabel(0.01)).toBe("Nötr");
  });
});
