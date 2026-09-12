import { describe, expect, it } from "vitest";
import { sanitizeChatPlainText } from "./sanitizePlainText";

describe("sanitizeChatPlainText", () => {
  it("trims and removes ASCII control chars", () => {
    expect(sanitizeChatPlainText("  merhaba\u0001dunya  ")).toBe("merhabadunya");
  });

  it("returns empty for whitespace-only", () => {
    expect(sanitizeChatPlainText("   \t\n")).toBe("");
  });

  it("caps length at 8000", () => {
    const long = "a".repeat(9000);
    expect(sanitizeChatPlainText(long).length).toBe(8000);
  });

  it("returns empty for null/undefined input", () => {
    expect(sanitizeChatPlainText(null as unknown as string)).toBe("");
    expect(sanitizeChatPlainText(undefined as unknown as string)).toBe("");
  });
});