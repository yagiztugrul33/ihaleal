import { getShareUrlForPath } from "./siteOrigin";

export const HOME_SEO: { title: string; description: string } = {
  title: "ihaleal.com \u2014 Yapay zeka destekli gayrimenkul platformu",
  description:
    "\u0130hale, kapal\u0131 teklif veya ilan modu; ger\u00e7ek al\u0131c\u0131\u2013sat\u0131c\u0131 ve kiral\u0131kta g\u00fcvenli s\u00fcre\u00e7. Teklif verenler anonim; ileti\u015fim platform \u00fczerinden. Yapay zeka destekli fiyat ve b\u00f6lge de\u011ferlendirmesi. Yaln\u0131zca komisyon (hedef). Demo.",
};

export const OG_IMAGE = {
  path: "/og-image.png" as const,
  width: 1200,
  height: 630,
};

/** Same rule as getShareUrlForPath("/", "") for shell og:url. */
export const HOME_HASH_URL = getShareUrlForPath("/", "");
