import { getShareUrlForPath } from "./siteOrigin";

export const HOME_SEO: { title: string; description: string } = {
  title: "ihaleal.com — Yapay zeka destekli gayrimenkul platformu",
  description:
    "İhale, kapalı teklif veya ilan modu; gerçek alıcı–satıcı ve kiralıkta güvenli süreç. Teklif verenler anonim; iletişim platform üzerinden. Yapay zeka destekli fiyat ve bölge değerlendirmesi. Yalnızca komisyon (hedef). Demo.",
};

export const OG_IMAGE = {
  path: "/og-image.png" as const,
  width: 1200,
  height: 630,
};

/** Same rule as getShareUrlForPath("/", "") for shell og:url. */
export const HOME_HASH_URL = getShareUrlForPath("/", "");
