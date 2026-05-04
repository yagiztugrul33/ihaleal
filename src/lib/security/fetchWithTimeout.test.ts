import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createFetchWithTimeout } from "@/lib/security/fetchWithTimeout";

describe("createFetchWithTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("rejects when fetch does not settle before timeout", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
        return new Promise<Response>((resolve, reject) => {
          const s = init?.signal;
          if (!s) {
            reject(new Error("no signal"));
            return;
          }
          s.addEventListener("abort", () => reject(s.reason), { once: true });
        });
      }),
    );
    const f = createFetchWithTimeout(1000);
    const p = f("https://example.com/test", {});
    const assertRejected = expect(p).rejects.toMatchObject({ name: "AbortError" });
    await vi.advanceTimersByTimeAsync(1000);
    await assertRejected;
  });
});