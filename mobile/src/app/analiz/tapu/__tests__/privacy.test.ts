import { describe, expect, it } from "vitest";

import { mockTapuAiService } from "../aiService";
import { canSendToAi, maskOwnerName, maskParcel, maskTckn } from "../privacy";

describe("tapu privacy helpers", () => {
  it("requires separate illumination and explicit consent", () => {
    expect(
      canSendToAi({
        illuminationAccepted: true,
        explicitConsentAccepted: false,
      }),
    ).toBe(false);
    expect(
      canSendToAi({
        illuminationAccepted: true,
        explicitConsentAccepted: true,
      }),
    ).toBe(true);
  });

  it("masks tckn, owner and parcel fields", () => {
    expect(maskTckn("12345678910")).toBe("*******8910");
    expect(maskOwnerName("Ahmet Demir")).toBe("A***t D***r");
    expect(maskParcel("123 Ada 45 Parsel")).toBe("1*3 A*a 4* *a*s*l");
  });
});

describe("tapu ai mock service", () => {
  it("returns masked response fields", async () => {
    const result = await mockTapuAiService.analyzeTapu({
      document: {
        uri: "file:///tmp/test.pdf",
        name: "ornek-tapu.pdf",
        mimeType: "application/pdf",
        kind: "pdf",
      },
      consent: {
        illuminationAccepted: true,
        explicitConsentAccepted: true,
      },
    });

    expect(result.providerName).toBe("MockAI Secure");
    expect(result.tcknMasked.endsWith("8910")).toBe(true);
    expect(result.ownerMasked).not.toContain("Ahmet Demir");
    expect(result.parcelMasked).not.toBe("123 Ada 45 Parsel");
  });
});
