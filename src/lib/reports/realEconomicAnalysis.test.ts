import { describe, expect, it, vi } from "vitest";
import type { Auction } from "@/types/auction";
import { AUCTIONS } from "@/data/auctions";

vi.mock("@/lib/supabaseAuctionsFetch", () => ({
  fetchRemoteAuctionsCatalog: vi.fn(),
}));
vi.mock("@/lib/reports/transactionHistory", async () => {
  const actual = await vi.importActual<typeof import("@/lib/reports/transactionHistory")>(
    "@/lib/reports/transactionHistory",
  );
  return { ...actual, loadListingHistory: vi.fn() };
});

import { fetchRemoteAuctionsCatalog } from "@/lib/supabaseAuctionsFetch";
import { loadListingHistory } from "@/lib/reports/transactionHistory";
import { computeRealEconomicSection, MIN_COMPARABLES, MAX_COMPARABLES_SHOWN } from "./realEconomicAnalysis";

const mockedFetchCatalog = vi.mocked(fetchRemoteAuctionsCatalog);
const mockedLoadHistory = vi.mocked(loadListingHistory);

function fakeAuction(overrides: Partial<Auction> = {}): Auction {
  const base = JSON.parse(JSON.stringify(AUCTIONS[0])) as Auction;
  return {
    ...base,
    id: "target-1",
    city: "İstanbul",
    district: "Kadıköy",
    category: "Konut",
    currentBid: 5_000_000,
    startingBid: 5_000_000,
    propertyDetails: { ...base.propertyDetails, grossSqm: 100 },
    ...overrides,
  };
}

function comparable(id: string, pricePerM2: number, overrides: Partial<Auction> = {}): Auction {
  return fakeAuction({
    id,
    currentBid: pricePerM2 * 100,
    startingBid: pricePerM2 * 100,
    status: "ended",
    ...overrides,
  });
}

describe("computeRealEconomicSection", () => {
  it("yeterli gerçek emsal yoksa hiçbir fiyat üretmez ve isReal:false döner", async () => {
    mockedFetchCatalog.mockResolvedValue([comparable("c1", 50_000), comparable("c2", 52_000)]);
    mockedLoadHistory.mockResolvedValue({ history: [], fromDb: false });

    const { overrides, analysis } = await computeRealEconomicSection(fakeAuction());

    expect(analysis.isReal).toBe(false);
    if (!analysis.isReal) {
      expect(analysis.reason).toBe("insufficient_comparables");
      expect(analysis.comparableCount).toBe(2);
      expect(analysis.minComparableRequired).toBe(MIN_COMPARABLES);
    }
    expect(overrides.economic_fair_market_value_try).toBeNull();
    expect(overrides.economic_lower_bound_try).toBeNull();
    expect(overrides.economic_avg_rent_try).toBeNull();
  });

  it("m² bilgisi yoksa (0) fiyat üretmez, missing_gross_sqm nedeniyle", async () => {
    mockedFetchCatalog.mockResolvedValue([]);
    mockedLoadHistory.mockResolvedValue({ history: [], fromDb: false });

    const { analysis } = await computeRealEconomicSection(
      fakeAuction({ propertyDetails: { ...fakeAuction().propertyDetails, grossSqm: 0 } }),
    );

    expect(analysis.isReal).toBe(false);
    if (!analysis.isReal) expect(analysis.reason).toBe("missing_gross_sqm");
  });

  it("yeterli gerçek emsal varsa medyan m² fiyatından gerçek bir bant hesaplar", async () => {
    mockedFetchCatalog.mockResolvedValue([
      comparable("c1", 48_000),
      comparable("c2", 50_000),
      comparable("c3", 52_000),
      comparable("c4", 54_000),
      comparable("c5", 60_000),
    ]);
    mockedLoadHistory.mockResolvedValue({ history: [], fromDb: false });

    const { overrides, analysis } = await computeRealEconomicSection(fakeAuction());

    expect(analysis.isReal).toBe(true);
    expect(overrides.economic_fair_market_value_try).toBeGreaterThan(0);
    expect(overrides.economic_lower_bound_try).toBeLessThanOrEqual(overrides.economic_fair_market_value_try!);
    expect(overrides.economic_upper_bound_try).toBeGreaterThanOrEqual(overrides.economic_fair_market_value_try!);
    // Kiralık emsal veri kaynağı yok — her zaman null, uydurma sayı yok.
    expect(overrides.economic_avg_rent_try).toBeNull();
    if (analysis.isReal) {
      expect(analysis.comparables.length).toBeGreaterThan(0);
      expect(analysis.comparables.length).toBeLessThanOrEqual(MAX_COMPARABLES_SHOWN);
      for (const row of analysis.comparables) {
        expect(Object.keys(row)).not.toContain("seller");
        expect(Object.keys(row)).not.toContain("sellerName");
        expect(Object.keys(row)).not.toContain("ownerName");
      }
    }
  });

  it("hedef ilan kendi kataloğunda varsa kendisiyle emsal karşılaştırması yapmaz", async () => {
    mockedFetchCatalog.mockResolvedValue([
      fakeAuction(),
      comparable("c1", 48_000),
      comparable("c2", 50_000),
      comparable("c3", 52_000),
      comparable("c4", 54_000),
    ]);
    mockedLoadHistory.mockResolvedValue({ history: [], fromDb: false });

    const { analysis } = await computeRealEconomicSection(fakeAuction());

    expect(analysis.isReal).toBe(true);
    if (analysis.isReal) {
      expect(analysis.comparables.every((c) => c.id !== "target-1")).toBe(true);
      expect(analysis.comparableCount).toBe(4);
    }
  });

  it("gerçek listing_transaction_history varsa (fromDb:true) kendi geçmiş değişimini kullanır, demo fallback'e asla düşmez", async () => {
    mockedFetchCatalog.mockResolvedValue([
      comparable("c1", 48_000),
      comparable("c2", 50_000),
      comparable("c3", 52_000),
      comparable("c4", 54_000),
    ]);
    mockedLoadHistory.mockResolvedValue({
      fromDb: true,
      history: [
        { date: "2023-01-01", type: "listing", priceTry: 4_000_000, ownerChanged: false, source: "platform" },
        { date: "2026-01-01", type: "listing", priceTry: 5_000_000, ownerChanged: false, source: "platform" },
      ],
    });

    const { overrides, analysis } = await computeRealEconomicSection(fakeAuction());

    expect(analysis.isReal).toBe(true);
    if (analysis.isReal) {
      expect(analysis.historyFromDb).toBe(true);
      expect(analysis.ownHistoryChangePct).toBe(25);
    }
    expect(overrides.economic_price_trend_3y_pct).toBe(25);
  });

  it("geçmiş demo fallback'e düştüyse (fromDb:false) trend'i asla gösterge olarak kullanmaz", async () => {
    mockedFetchCatalog.mockResolvedValue([
      comparable("c1", 48_000),
      comparable("c2", 50_000),
      comparable("c3", 52_000),
      comparable("c4", 54_000),
    ]);
    mockedLoadHistory.mockResolvedValue({
      fromDb: false,
      history: [
        { date: "2023-01-01", type: "listing", priceTry: 1_000, ownerChanged: false, source: "demo" },
        { date: "2026-01-01", type: "listing", priceTry: 99_999, ownerChanged: false, source: "demo" },
      ],
    });

    const { overrides, analysis } = await computeRealEconomicSection(fakeAuction());

    expect(analysis.isReal).toBe(true);
    if (analysis.isReal) {
      expect(analysis.historyFromDb).toBe(false);
      expect(analysis.ownHistoryChangePct).toBeNull();
    }
    expect(overrides.economic_price_trend_3y_pct).toBeNull();
  });

  it("targetTotalPrice ve targetPricePerM2 hedef ilanın gerçek fiyatından hesaplanır", async () => {
    mockedFetchCatalog.mockResolvedValue([
      comparable("c1", 48_000),
      comparable("c2", 50_000),
      comparable("c3", 52_000),
      comparable("c4", 54_000),
    ]);
    mockedLoadHistory.mockResolvedValue({ history: [], fromDb: false });

    const { analysis } = await computeRealEconomicSection(fakeAuction({ currentBid: 5_000_000, propertyDetails: { ...fakeAuction().propertyDetails, grossSqm: 100 } }));

    expect(analysis.isReal).toBe(true);
    if (analysis.isReal) {
      expect(analysis.targetTotalPrice).toBe(5_000_000);
      expect(analysis.targetPricePerM2).toBe(50_000);
    }
  });

  it("rankedComparables hedef ilanı isTarget:true ile işaretler ve ₺/m²'ye göre artan sıralar", async () => {
    mockedFetchCatalog.mockResolvedValue([
      comparable("c1", 48_000),
      comparable("c2", 60_000),
      comparable("c3", 52_000),
      comparable("c4", 54_000),
    ]);
    mockedLoadHistory.mockResolvedValue({ history: [], fromDb: false });

    const { analysis } = await computeRealEconomicSection(fakeAuction({ currentBid: 5_500_000 }));

    expect(analysis.isReal).toBe(true);
    if (analysis.isReal) {
      const target = analysis.rankedComparables.find((r) => r.isTarget);
      expect(target).toBeDefined();
      expect(target!.id).toBe("target-1");
      expect(target!.pricePerM2).toBe(55_000);
      // Artan sıralı mı?
      const prices = analysis.rankedComparables.map((r) => r.pricePerM2);
      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sorted);
      // isTarget dışındakiler false olmalı
      expect(analysis.rankedComparables.filter((r) => r.isTarget)).toHaveLength(1);
    }
  });

  it("regionSaleCount/regionRentCount aynı şehirdeki gerçek dealType alanından sayılır", async () => {
    mockedFetchCatalog.mockResolvedValue([
      comparable("c1", 48_000, { dealType: "sale" }),
      comparable("c2", 50_000, { dealType: "sale" }),
      comparable("c3", 52_000, { dealType: "rent" }),
      comparable("c4", 54_000), // dealType tanımsız — sayılmaz
    ]);
    mockedLoadHistory.mockResolvedValue({ history: [], fromDb: false });

    const { analysis } = await computeRealEconomicSection(fakeAuction());

    expect(analysis.isReal).toBe(true);
    if (analysis.isReal) {
      expect(analysis.regionSaleCount).toBe(2);
      expect(analysis.regionRentCount).toBe(1);
    }
  });

  it("regionSaleCount/regionRentCount farklı şehirdeki ilanları saymaz", async () => {
    mockedFetchCatalog.mockResolvedValue([
      comparable("c1", 48_000, { dealType: "sale" }),
      comparable("c2", 50_000, { dealType: "sale" }),
      comparable("c3", 52_000, { dealType: "sale", city: "Ankara" }),
      comparable("c4", 54_000),
    ]);
    mockedLoadHistory.mockResolvedValue({ history: [], fromDb: false });

    const { analysis } = await computeRealEconomicSection(fakeAuction());

    expect(analysis.isReal).toBe(true);
    if (analysis.isReal) {
      // fakeAuction city = İstanbul; Ankara'daki sayılmamalı
      expect(analysis.regionSaleCount).toBe(2);
    }
  });

  it("bir emsalin gerçek görseli varsa rankedComparables'a taşınır, yoksa undefined kalır (uydurulmaz)", async () => {
    mockedFetchCatalog.mockResolvedValue([
      comparable("c1", 48_000, { images: ["https://example.com/real-photo.jpg"] }),
      comparable("c2", 50_000, { images: [] }),
      comparable("c3", 52_000),
      comparable("c4", 54_000),
    ]);
    mockedLoadHistory.mockResolvedValue({ history: [], fromDb: false });

    const { analysis } = await computeRealEconomicSection(fakeAuction());

    expect(analysis.isReal).toBe(true);
    if (analysis.isReal) {
      const withPhoto = analysis.rankedComparables.find((r) => r.id === "c1");
      const withoutPhoto = analysis.rankedComparables.find((r) => r.id === "c2");
      expect(withPhoto?.imageUrl).toBe("https://example.com/real-photo.jpg");
      expect(withoutPhoto?.imageUrl).toBeUndefined();
    }
  });
});
