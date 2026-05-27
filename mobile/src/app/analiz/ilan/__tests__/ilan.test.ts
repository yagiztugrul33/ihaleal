import { describe, expect, it } from "vitest";
import { findListing } from "../../../../../shared/demoMarket";

import { mockIlanAiService } from "../aiService";

describe("ilan mock data access", () => {
  it("finds known listing from internal source", () => {
    const listing = findListing("IST-KDK-001");
    expect(listing?.title).toContain("Kadıköy");
    expect(listing?.priceTry).toBeGreaterThan(1_000_000);
  });
});

describe("ilan ai mock service", () => {
  it("returns analysis for selected listing", async () => {
    const listing = findListing("IST-KDK-001");
    if (!listing) {
      throw new Error("Expected listing to exist");
    }

    const result = await mockIlanAiService.analyzeIlan({
      ilan: {
        id: listing.id,
        title: listing.title,
        city: listing.city,
        district: listing.district,
        priceTry: listing.priceTry,
        estimatedValueTry: listing.estimatedValueTry,
        aiScore: listing.aiScore,
      },
      consent: {
        illuminationAccepted: true,
        explicitConsentAccepted: true,
      },
    });

    expect(result.providerName).toBe("MockAI Secure");
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
    expect(["Uygun", "Sınırda", "Yüksek"]).toContain(result.priceFairness);
  });
});
