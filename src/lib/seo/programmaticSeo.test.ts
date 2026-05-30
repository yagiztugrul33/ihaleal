import { describe, expect, it } from "vitest";
import { programmaticSeoPageCount, PROGRAMMATIC_SEO_ROUTES, resolveProgrammaticRoute } from "@/lib/seo/programmaticSeo";

describe("programmaticSeo", () => {
  it("generates 600+ landing routes", () => {
    expect(programmaticSeoPageCount()).toBeGreaterThanOrEqual(600);
  });

  it("resolves istanbul satilik district", () => {
    const route = resolveProgrammaticRoute("satilik", "istanbul", "kadikoy");
    expect(route?.segmentKind).toBe("district");
    expect(route?.districtName).toBeTruthy();
  });

  it("resolves property type segment", () => {
    const route = resolveProgrammaticRoute("kiralik", "ankara", "konut");
    expect(route?.segmentKind).toBe("type");
    expect(route?.propertyType).toBe("konut");
  });

  it("has unique paths", () => {
    const paths = new Set(PROGRAMMATIC_SEO_ROUTES.map((r) => r.path));
    expect(paths.size).toBe(PROGRAMMATIC_SEO_ROUTES.length);
  });
});
