import { describe, expect, it } from "vitest";

import { docTypeLabel, formatDocumentSize } from "../helpers";

describe("belgeler helpers", () => {
  it("maps document type labels", () => {
    expect(docTypeLabel("kimlik")).toBe("Kimlik");
    expect(docTypeLabel("rapor")).toBe("Rapor");
  });

  it("formats document size", () => {
    expect(formatDocumentSize(1200)).toContain("MB");
    expect(formatDocumentSize(800)).toContain("KB");
  });
});
