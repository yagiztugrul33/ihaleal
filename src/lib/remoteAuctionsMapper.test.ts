import { describe, expect, it } from "vitest";
import { auctionFromRemoteRow, type DbAuctionRow } from "./remoteAuctionsMapper";

function realRow(overrides: Partial<DbAuctionRow> = {}): DbAuctionRow {
  return {
    id: "row-1",
    status: "live",
    starts_at: "2026-01-01T00:00:00.000Z",
    ends_at: "2026-01-08T00:00:00.000Z",
    current_high_bid_try: null,
    listings: {
      id: "listing-1",
      title: "Beşiktaş'ta Deniz Manzaralı Daire",
      body: { size_m2: 145, rooms: "3+1", bath_count: 2, floor: 4, total_floors: 8, year_built: 2015 },
      status: "active",
      city: "İstanbul",
      district: "Beşiktaş",
      category: "real_estate_residential",
      start_price_try: 4_500_000,
      reserve_price_try: null,
      buy_now_price_try: null,
      is_featured: false,
      featured_badge: null,
      view_count: 0,
    },
    ...overrides,
  };
}

describe("auctionFromRemoteRow — gerçek ilan kolon eşlemesi", () => {
  it("gerçek city/district/category kolonlarını demo şablona değil kendi değerlerine eşler", () => {
    const auction = auctionFromRemoteRow(realRow());
    expect(auction.city).toBe("İstanbul");
    expect(auction.district).toBe("Beşiktaş");
    expect(auction.category).toBe("Konut");
  });

  it("DB category slug'ını kanonik UI etiketine çevirir (ticari/arsa)", () => {
    const ticari = auctionFromRemoteRow(realRow({ listings: { ...realRow().listings!, category: "real_estate_commercial" } as never }));
    expect(ticari.category).toBe("Ticari");
    const arsa = auctionFromRemoteRow(realRow({ listings: { ...realRow().listings!, category: "real_estate_land" } as never }));
    expect(arsa.category).toBe("Arsa");
  });

  it("body.size_m2/rooms/floor gibi düz alanları propertyDetails'e doğru eşler", () => {
    const auction = auctionFromRemoteRow(realRow());
    expect(auction.propertyDetails.grossSqm).toBe(145);
    expect(auction.propertyDetails.roomCount).toBe("3+1");
    expect(auction.propertyDetails.bathroom).toBe(2);
    expect(auction.propertyDetails.floor).toBe("4");
    expect(auction.propertyDetails.totalFloors).toBe(8);
  });

  it("henüz teklif almamış yeni bir ilanda başlangıç fiyatını 0 değil gerçek start_price_try'den okur", () => {
    const auction = auctionFromRemoteRow(realRow({ current_high_bid_try: null }));
    expect(auction.startingBid).toBe(4_500_000);
    expect(auction.currentBid).toBe(4_500_000);
  });

  it("teklif geldiğinde currentBid gerçek current_high_bid_try'yi yansıtır, startingBid sabit kalır", () => {
    const auction = auctionFromRemoteRow(realRow({ current_high_bid_try: 4_800_000 }));
    expect(auction.startingBid).toBe(4_500_000);
    expect(auction.currentBid).toBe(4_800_000);
  });

  it("gerçek m²'den hesaplanan pricePerSqm demo şablon değerine düşmez", () => {
    const auction = auctionFromRemoteRow(realRow({ current_high_bid_try: 4_800_000 }));
    expect(auction.pricePerSqm).toBe(Math.round(4_800_000 / 145));
  });
});
