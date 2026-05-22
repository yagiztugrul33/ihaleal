import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useLiveMarket } from "@/borsa/useLiveMarket";

describe("useLiveMarket", () => {
  it("updates on interval and clears interval on unmount", () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(window, "clearInterval");
    const { result, unmount } = renderHook(() => useLiveMarket());
    const initial = result.current.data[0]?.price;

    act(() => {
      vi.advanceTimersByTime(2600);
    });
    const next = result.current.data[0]?.price;
    expect(next).not.toBe(initial);

    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
    vi.useRealTimers();
  });
});
