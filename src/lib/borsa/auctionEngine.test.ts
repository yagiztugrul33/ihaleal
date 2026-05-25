import { describe, expect, it } from "vitest";
import {
  calculateProxyBid,
  isOutbid,
  isReserveMet,
  nextWinner,
  resolveAuctionFormat,
  shouldExtend,
  validateBid,
} from "@/lib/borsa/auctionEngine";

describe("auctionEngine", () => {
  it("proxy bid min artis kadar artirir", () => {
    expect(calculateProxyBid(1_000_000, 1_300_000, 50_000)).toBe(1_050_000);
  });

  it("proxy bid limiti asmadan son adimi alir", () => {
    expect(calculateProxyBid(1_000_000, 1_020_000, 50_000)).toBe(1_020_000);
  });

  it("soft close threshold icinde uzatir", () => {
    const end = new Date("2026-01-01T12:00:00Z").getTime();
    const bid = new Date("2026-01-01T11:58:30Z").getTime();
    const result = shouldExtend(end, bid, { thresholdMinutes: 3, extensionMinutes: 2, mode: "extend" });
    expect(result).toBe(end + 2 * 60_000);
  });

  it("soft close threshold disinda degistirmez", () => {
    const end = new Date("2026-01-01T12:00:00Z").getTime();
    const bid = new Date("2026-01-01T11:50:00Z").getTime();
    expect(shouldExtend(end, bid, { thresholdMinutes: 3, extensionMinutes: 2 })).toBe(end);
  });

  it("teklif min artis altinda reddedilir", () => {
    const validation = validateBid(1_000_000, 1_010_000, 25_000);
    expect(validation.valid).toBe(false);
  });

  it("rezerv met kontrolu dogru calisir", () => {
    expect(isReserveMet(1_300_000, 1_250_000)).toBe(true);
    expect(isReserveMet(1_200_000, 1_250_000)).toBe(false);
  });

  it("waterfall varsayilan defaulter sonrasi adayi secer", () => {
    const winner = nextWinner(
      [
        { bidder: "Aday A", amount: 1_500_000, timestamp: "2026-01-01T10:00:00Z" },
        { bidder: "Aday B", amount: 1_450_000, timestamp: "2026-01-01T10:01:00Z" },
      ],
      ["aday a"],
    );
    expect(winner?.bidder).toBe("Aday B");
  });

  it("outbid tespiti dogru doner", () => {
    expect(isOutbid(900_000, 1_000_000)).toBe(true);
    expect(isOutbid(1_050_000, 1_000_000)).toBe(false);
  });

  it("uc format kurali timed/live/sealed cozer", () => {
    expect(resolveAuctionFormat({ marketingMode: "sealed_offers", liveSession: true })).toBe("sealed");
    expect(resolveAuctionFormat({ marketingMode: "auction", liveSession: true })).toBe("live");
    expect(resolveAuctionFormat({ marketingMode: "auction", liveSession: false })).toBe("timed");
  });
});
