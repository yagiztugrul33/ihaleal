/** Şehir SEO landing sayfaları — HashRouter path anahtarları (örn. /istanbul-ihaleleri). */

export type SeoLandingConfig = {
  path: string;
  title: string;
  description: string;
  cityTr: string;
  /** Analytics CITY_DATA anahtarı ile eşleşir */
  analyticsKey: string;
  heroKeywords: string[];
};

export const SEO_LANDING_PAGES: SeoLandingConfig[] = [
  {
    path: "/istanbul-ihaleleri",
    title: "İstanbul gayrimenkul ihaleleri — ihaleal.com",
    description:
      "İstanbul il ve ilçe bazında aktif ihale ilanları, bölge endeksi özeti ve ortak emlakçı ağı (demo veri). Yıllık üyelik ve komisyon mahsup modeli.",
    cityTr: "İstanbul",
    analyticsKey: "Istanbul",
    heroKeywords: ["Kadıköy", "Beşiktaş", "Ataşehir", "Şişli"],
  },
  {
    path: "/ankara-gayrimenkul",
    title: "Ankara gayrimenkul ihaleleri — ihaleal.com",
    description:
      "Ankara konut ve ticari ihale ilanları; şehir özeti ve yatırım notları (demo). Güvenli ödeme havuzu ve komisyon çerçevesi.",
    cityTr: "Ankara",
    analyticsKey: "Ankara",
    heroKeywords: ["Çankaya", "Yenimahalle", "Keçiören"],
  },
  {
    path: "/izmir-acik-artirma",
    title: "İzmir açık artırma ve ihale — ihaleal.com",
    description:
      "İzmir sahilden iç bölgelere ihale ve kapalı teklif ilanları; demo katalog filtrelenebilir.",
    cityTr: "İzmir",
    analyticsKey: "Izmir",
    heroKeywords: ["Konak", "Karşıyaka", "Bornova"],
  },
  {
    path: "/antalya-gayrimenkul-ihale",
    title: "Antalya gayrimenkul ihaleleri — ihaleal.com",
    description:
      "Antalya tatil ve yerleşik konut ihaleleri; bölge talebi ve getiri notları (bilgilendirme, demo).",
    cityTr: "Antalya",
    analyticsKey: "Antalya",
    heroKeywords: ["Muratpaşa", "Konyaaltı"],
  },
  {
    path: "/bursa-emlak-ihale",
    title: "Bursa emlak ihaleleri — ihaleal.com",
    description:
      "Bursa Osmangazi, Nilüfer ve çevresinde ihale ilanları — demo veri ve şehir özeti.",
    cityTr: "Bursa",
    analyticsKey: "Bursa",
    heroKeywords: ["Osmangazi", "Nilüfer"],
  },
];

export function landingConfigByPath(pathname: string): SeoLandingConfig | undefined {
  return SEO_LANDING_PAGES.find((p) => p.path === pathname);
}
