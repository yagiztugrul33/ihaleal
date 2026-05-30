import { describe, expect, it, beforeEach } from "vitest";
import {
  hasRecordedViewInSession,
  markViewRecordedInSession,
  viewCountSessionKey,
} from "@/lib/listingViewCount";

describe("listingViewCount session dedup", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("tracks one view per listing per session", () => {
    const id = "11111111-1111-1111-1111-111111111111";
    expect(hasRecordedViewInSession(id)).toBe(false);
    markViewRecordedInSession(id);
    expect(sessionStorage.getItem(viewCountSessionKey(id))).toBe("1");
    expect(hasRecordedViewInSession(id)).toBe(true);
  });

  it("uses distinct keys per listing", () => {
    markViewRecordedInSession("a");
    expect(hasRecordedViewInSession("b")).toBe(false);
  });
});
