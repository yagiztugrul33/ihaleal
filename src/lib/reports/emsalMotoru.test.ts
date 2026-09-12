import { describe, expect, it } from "vitest";
import type { Auction } from "@/types/auction";
import { AUCTIONS } from "@/data/auctions";
import { daysBetween, findEmsaller } from "@/lib/reports/emsalMotoru";

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
    status: "live",
    propertyDetails: { ...base.propertyDetails, grossSqm: 100 },
    ...overrides,
  };
}

describe("daysBetween", () => {
  it("geçersiz/boş tarihte 0 döner", () => {
    expect(daysBetween(null)).toBe(0);
    expect(daysBetween(undefined)).toBe(0);
    expect(daysBetween("not-a-date")).toBe(0);
  });

  it("geçmiş bir tarih için doğru gün sayısını döner", () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 86_400_000).toISOString();
    expect(daysBetween(tenDaysAgo)).toBe(10);
  });

  it("gelecekteki bir tarih için negatif değil 0 döner", () => {
    const inFuture = new Date(Date.now() + 5 * 86_400_000).toISOString();
    expect(daysBetween(inFuture)).toBe(0);
  });
});

describe("findEmsaller — daysOnMarket doğruluk düzeltmesi", () => {
  it("startsAt yoksa aktif/canlı ilanlarda daysOnMarket=0 VE daysOnMarketKnown=false döner (uydurulmaz)", () => {
    const target = fakeAuction();
    const liveNoStart = fakeAuction({ id: "c1", status: "live", startsAt: undefined });
    const summary = findEmsaller(target, [liveNoStart]);

    expect(summary.rows[0].daysOnMarket).toBe(0);
    expect(summary.rows[0].daysOnMarketKnown).toBe(false);
  });

  it("startsAt varsa — canlı/aktif bir ilan için de (bitiş tarihi gelecekte olsa bile) doğru gün sayısı hesaplanır", () => {
    // Bu, düzeltilen asıl hata: eskiden endDate'e (gelecekte) bakıldığı için
    // aktif ilanlar hep 0 gün gösteriyordu. Artık startsAt (geçmişte) kullanılıyor.
    const target = fakeAuction();
    const liveWithStart = fakeAuction({
      id: "c1",
      status: "live",
      startsAt: new Date(Date.now() - 42 * 86_400_000).toISOString(),
      endDate: new Date(Date.now() + 5 * 86_400_000).toISOString(),
    });
    const summary = findEmsaller(target, [liveWithStart]);

    expect(summary.rows[0].daysOnMarket).toBe(42);
    expect(summary.rows[0].daysOnMarketKnown).toBe(true);
  });

  it("kapanmış bir ilanda da startsAt üzerinden doğru gün sayısı hesaplanır", () => {
    const target = fakeAuction();
    const ended = fakeAuction({
      id: "c1",
      status: "ended",
      startsAt: new Date(Date.now() - 100 * 86_400_000).toISOString(),
      endDate: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    });
    const summary = findEmsaller(target, [ended]);

    expect(summary.rows[0].daysOnMarket).toBe(100);
    expect(summary.rows[0].daysOnMarketKnown).toBe(true);
  });
});

describe("findEmsaller — benzerlik ve görsel", () => {
  it("benzerlik skoru 30'un altında olan ilanları emsal listesine almaz", () => {
    const target = fakeAuction({ city: "İstanbul", district: "Kadıköy", category: "Konut" });
    // Hiçbir alan eşleşmiyor → skor 0
    const unrelated = fakeAuction({ id: "c1", city: "Van", district: "Erciş", category: "Arsa" });
    const summary = findEmsaller(target, [unrelated]);
    expect(summary.count).toBe(0);
  });

  it("gerçek kapak görseli varsa imageUrl'e taşınır, yoksa undefined kalır", () => {
    const target = fakeAuction();
    const withPhoto = fakeAuction({ id: "c1", images: ["https://example.com/real.jpg"] });
    const withoutPhoto = fakeAuction({ id: "c2", images: [] });
    const summary = findEmsaller(target, [withPhoto, withoutPhoto]);

    const row1 = summary.rows.find((r) => r.id === "c1");
    const row2 = summary.rows.find((r) => r.id === "c2");
    expect(row1?.imageUrl).toBe("https://example.com/real.jpg");
    expect(row2?.imageUrl).toBeUndefined();
  });
});

describe("findEmsaller — kapanış primi", () => {
  it("aynı şehirde kapanmış gerçek satışlardan ortalama kapanış primini hesaplar", () => {
    const target = fakeAuction({ city: "İstanbul" });
    const closed1 = fakeAuction({ id: "c1", status: "ended", startingBid: 100_000, currentBid: 120_000 }); // +%20
    const closed2 = fakeAuction({ id: "c2", status: "ended", startingBid: 100_000, currentBid: 110_000 }); // +%10
    const summary = findEmsaller(target, [closed1, closed2]);

    expect(summary.closingSampleSize).toBe(2);
    expect(summary.closingPremiumPct).toBeCloseTo(15, 5);
  });

  it("kapanmış ilan yoksa closingSampleSize 0 ve prim 0 döner", () => {
    const target = fakeAuction({ city: "İstanbul" });
    const live = fakeAuction({ id: "c1", status: "live" });
    const summary = findEmsaller(target, [live]);

    expect(summary.closingSampleSize).toBe(0);
    expect(summary.closingPremiumPct).toBe(0);
  });
});
