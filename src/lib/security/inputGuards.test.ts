import { describe, expect, it } from "vitest";
import { sanitizeEmail, sanitizePhone, sanitizeText, validateStrongPassword } from "@/lib/security/inputGuards";

describe("inputGuards", () => {
  it("sanitizes risky text tokens", () => {
    const out = sanitizeText("  <script>alert(1)</script>\nfoo  ");
    expect(out).toBe("scriptalert(1)/scriptfoo");
  });

  it("normalizes email and phone", () => {
    expect(sanitizeEmail(" USER+test@Example.COM ")).toBe("user+test@example.com");
    expect(sanitizePhone("+90(555) 111-22-33<script>")).toBe("+90(555) 111-22-33");
  });

  it("enforces strong password policy", () => {
    expect(validateStrongPassword("weakpass").ok).toBe(false);
    expect(validateStrongPassword("Strong!Pass1").ok).toBe(true);
  });
});

