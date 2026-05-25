import { describe, expect, it } from "vitest";
import { buildAssistantReply } from "@/lib/ai/assistantEngine";

describe("assistantEngine", () => {
  it("yönlendirme: teklif akışında aksiyon döner", () => {
    const reply = buildAssistantReply("Nasıl teklif veririm?");
    expect(reply.text.toLocaleLowerCase("tr-TR")).toContain("teklif adımları");
    expect(reply.actions.some((a) => a.to === "/borsa")).toBe(true);
    expect(reply.actions.some((a) => a.to === "/ihale-kosullari")).toBe(true);
  });

  it("yönlendirme: komisyon sorusunda hesaplayıcı aksiyonu verir", () => {
    const reply = buildAssistantReply("Komisyon ne kadar?");
    expect(reply.text).toContain("%2");
    expect(reply.actions.some((a) => a.to === "/komisyon-hesaplayici")).toBe(true);
  });

  it("uzmanlık: emsal/imar sorusunda uzman uyarısı içerir", () => {
    const reply = buildAssistantReply("Emsal ve imar durumu nasıl okunur?");
    expect(reply.text.toLocaleLowerCase("tr-TR")).toContain("emsal");
    expect(reply.text.toLocaleLowerCase("tr-TR")).toContain("uzman");
    expect(reply.actions.some((a) => a.to === "/imar-studyo")).toBe(true);
  });

  it("yönlendirme: satıcı niyetinde sat-basla aksiyonu verir", () => {
    const reply = buildAssistantReply("Mülkümü satmak istiyorum");
    expect(reply.actions.some((a) => a.to === "/sat-basla")).toBe(true);
  });

  it("sallamama: kapsama girince de demo uyarısı zorunlu", () => {
    const reply = buildAssistantReply("Foton motoru ile yıldızlararası rota optimizasyonu yapar mısın?");
    expect(reply.text.toLocaleLowerCase("tr-TR")).toContain("demo notu");
    expect(reply.actions.length).toBeGreaterThan(0);
  });
});
