import { describe, expect, it } from "vitest";

import {
  createAutoBidRule,
  createPriceAlert,
  readAutoBidRules,
  readPriceAlerts,
  readWatchlistIds,
  toggleAutoBidRule,
  togglePriceAlert,
  toggleWatchlistAsset,
} from "../data";

describe("borsa mock data store", () => {
  it("toggles watchlist ids", () => {
    const base = readWatchlistIds();
    const candidate = "IST-KDK-001";
    const next = toggleWatchlistAsset(candidate);
    expect(next.includes(candidate)).toBe(!base.includes(candidate));
  });

  it("creates and toggles alert", () => {
    const created = createPriceAlert({
      assetId: "IST-KDK-001",
      direction: "above",
      targetPrice: 9_000_000,
    });
    expect(created.length).toBeGreaterThan(0);
    const first = readPriceAlerts()[0];
    const toggled = togglePriceAlert(first.id);
    expect(toggled.find((item) => item.id === first.id)?.enabled).toBe(false);
    expect(first).toBeDefined();
  });

  it("creates and toggles auto bid rule", () => {
    createAutoBidRule({
      assetId: "IST-KDK-001",
      maxBid: 9_200_000,
      stepTry: 50_000,
    });
    const first = readAutoBidRules()[0];
    const updated = toggleAutoBidRule(first.id);
    expect(updated.find((item) => item.id === first.id)?.enabled).toBe(false);
  });
});
