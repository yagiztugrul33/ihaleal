import { describe, expect, it } from "vitest";

import {
  getPathnameFromUrl,
  isAllowedWebUrl,
  isBlockedInWebView,
  mapBlockedPathToNative,
  toAbsoluteWebUrl,
  WEB_BASE_URL,
} from "../../../../features/webview/webContentConfig";
import { WEB_CONTENT_ITEMS, findWebContentBySlug } from "../../../../features/webview/webContentCatalog";

describe("Web content config", () => {
  it("builds absolute URL from path", () => {
    const url = toAbsoluteWebUrl("/kvkk");
    expect(url).toBe(`${WEB_BASE_URL}/kvkk`);
  });

  it("allows only own domain and blocks external domain", () => {
    expect(isAllowedWebUrl(`${WEB_BASE_URL}/blog`)).toBe(true);
    expect(isAllowedWebUrl("https://example.com/blog")).toBe(false);
  });

  it("maps login paths to native and blocks bid/payment paths in webview", () => {
    expect(mapBlockedPathToNative("/giris")).toBe("/login");
    expect(mapBlockedPathToNative("/kayit")).toBe("/register");
    expect(mapBlockedPathToNative("/ihale/abc")).toBeNull();
    expect(isBlockedInWebView("/ihale/abc")).toBe(true);
    expect(isBlockedInWebView("/rehber")).toBe(false);
  });

  it("extracts pathname safely", () => {
    expect(getPathnameFromUrl(`${WEB_BASE_URL}/destek`)).toBe("/destek");
    expect(getPathnameFromUrl("not-a-url")).toBeNull();
  });
});

describe("Web content catalog", () => {
  it("contains unique slugs", () => {
    const slugs = WEB_CONTENT_ITEMS.map((item) => item.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves known content slug", () => {
    const item = findWebContentBySlug("kvkk");
    expect(item?.path).toBe("/kvkk");
  });
});
