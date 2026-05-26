import { describe, expect, it } from "vitest";

import { notificationBadgeLabel } from "../helpers";

describe("bildirim helpers", () => {
  it("maps badge labels", () => {
    expect(notificationBadgeLabel("auction")).toBe("İhale");
    expect(notificationBadgeLabel("system")).toBe("Sistem");
  });
});
