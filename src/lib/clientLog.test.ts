import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { clientLogError } from "./clientLog";

describe("clientLogError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("does not throw for Error instance", () => {
    expect(() => clientLogError("scope", new Error("x"), { k: 1 })).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });

  it("does not throw for string reason", () => {
    expect(() => clientLogError("scope", "oops")).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });

  it("falls back to 'Bilinmeyen hata' for a non-Error, non-string reason", () => {
    expect(() => clientLogError("scope", { weird: true })).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });

  describe("production path (DEV=false)", () => {
    beforeEach(() => {
      vi.stubEnv("DEV", false);
    });

    it("logs a generic message and does not leak error details to console", () => {
      clientLogError("scope", new Error("secret detail"));
      expect(console.error).toHaveBeenCalledWith("[scope]", {
        message: "İşlem sırasında bir hata oluştu",
        code: "scope",
      });
    });

    it("fires telemetry POST when Supabase env vars are configured", async () => {
      vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
      vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-key");
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal("fetch", fetchMock);

      clientLogError("scope", new Error("boom"));
      await Promise.resolve();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://example.supabase.co/rest/v1/client_errors");
      expect(init.method).toBe("POST");
      expect(init.headers.apikey).toBe("anon-key");
      const body = JSON.parse(init.body);
      expect(body.message).toContain("boom");
    });

    it("does not throw when the telemetry fetch rejects", async () => {
      vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
      vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-key");
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

      expect(() => clientLogError("scope", new Error("boom"))).not.toThrow();
      await Promise.resolve();
    });

    it("skips telemetry silently when Supabase env vars are missing", () => {
      vi.stubEnv("VITE_SUPABASE_URL", "");
      vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      clientLogError("scope", new Error("boom"));

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("skips telemetry silently when fetch is unavailable", () => {
      vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
      vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-key");
      vi.stubGlobal("fetch", undefined);

      expect(() => clientLogError("scope", new Error("boom"))).not.toThrow();
    });
  });
});