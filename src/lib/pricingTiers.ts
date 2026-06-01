/**
 * ihaleal — Üyelik / Fiyatlandırma katmanları konfigürasyonu
 *
 * Bu dosya tek noktadan değiştirilebilir (pazar testi). Fiyatları, özellikleri,
 * sınırları güncellemek için sadece bu dosyayı düzenle; UI/lock-gate kodları
 * otomatik adapte olur.
 *
 * Master not (2026-06-01):
 * - Gerçek ödeme entegrasyonu (iyzico/PayTR) eklenecek; şimdilik UI + mock.
 * - DB tier tablosu Supabase'de `user_membership_tiers` view/tablosu —
 *   migration ileride Master onayı ile eklenecek (BLOK 2'de iskelet).
 */

export type TierId = "free" | "yatirimci" | "emlak_baslangic" | "emlak_pro" | "kurumsal";

export type BillingCycle = "monthly" | "yearly";

/** Yıllık ödemede indirim oranı (1 = no discount). 0.20 = %20 indirim. */
export const YEARLY_DISCOUNT_RATE = 0.20;

export interface PricingFeature {
  /** Kısa etiket, tabloda görünür */
  label: string;
  /** Detay drill-down açıklaması */
  detail?: string;
  /** Bu tier'da bu özelliğin durumu */
  status: "included" | "limited" | "excluded";
  /** Limit bilgisi ("15 ilan", "Sınırsız", "1/yıl" gibi) */
  limit?: string;
}

export interface PricingTier {
  id: TierId;
  /** Kart başlığı (UI) */
  name: string;
  /** 1-line özet */
  tagline: string;
  /** Aylık TL — 0 ise ücretsiz; yıllıkta %20 düşer */
  monthlyTry: number;
  /** Hedef kullanıcı segmenti */
  segment: "bireysel" | "yatirimci" | "emlakci" | "kurumsal";
  /** Vurgulu (En popüler vb.) UI rozet */
  highlight?: string;
  /** Renk teması (tailwind) */
  accent: "slate" | "emerald" | "blue" | "amber" | "violet";
  /** İlan açma limiti */
  listingLimit: number | "unlimited";
  /** Ekip üye sayısı */
  teamSeats: number | "unlimited";
  /** Detay özellik listesi */
  features: PricingFeature[];
}

/** Yıllık ücreti hesapla (% indirim uygulanmış aylık × 12) */
export function yearlyTry(monthlyTry: number): number {
  return Math.round(monthlyTry * (1 - YEARLY_DISCOUNT_RATE) * 12);
}

/** Bir tier için ödeme döngüsüne göre gösterilecek tutar */
export function priceFor(tier: PricingTier, cycle: BillingCycle): { try: number; period: string } {
  if (tier.monthlyTry === 0) return { try: 0, period: "Ücretsiz" };
  return cycle === "monthly"
    ? { try: tier.monthlyTry, period: "/ay" }
    : { try: yearlyTry(tier.monthlyTry), period: "/yıl" };
}

/** TL formatlama yardımcısı */
export function formatTry(v: number): string {
  if (v === 0) return "₺0";
  return `₺${v.toLocaleString("tr-TR")}`;
}

export const PRICING_TIERS: readonly PricingTier[] = [
  {
    id: "free",
    name: "Bireysel",
    tagline: "İhale takibi + 1 ücretsiz ilan",
    monthlyTry: 0,
    segment: "bireysel",
    accent: "slate",
    listingLimit: 1, // 1 ilan/yıl
    teamSeats: 1,
    features: [
      {
        label: "1 ilan/yıl",
        detail: "Yılda 1 ücretsiz ilan açma hakkı. Ek ilanlar tek satın alımla (₺249) eklenebilir.",
        status: "limited",
        limit: "1/yıl",
      },
      { label: "İhale katılım", detail: "Tüm canlı ihalelere teklif verebilir, kapanış takip eder.", status: "included" },
      { label: "Borsa görüntüleme", detail: "Bloomberg-style terminal ticker + counter görünür (sınırlı detay).", status: "limited", limit: "Özet" },
      { label: "Favori liste", detail: "10 ilana kadar favoriye alma + e-posta bildirimi.", status: "limited", limit: "10" },
      { label: "Sınırsız rapor görüntüleme", status: "excluded" },
      { label: "Gerçek kapanış verisi", status: "excluded" },
      { label: "AI fırsat bildirimi", status: "excluded" },
      { label: "Doping / vitrin", status: "excluded" },
      { label: "Ekip üye", limit: "1", status: "limited" },
    ],
  },
  {
    id: "yatirimci",
    name: "Yatırımcı",
    tagline: "Borsa terminali tam + sınırsız rapor",
    monthlyTry: 399,
    segment: "yatirimci",
    highlight: "En Popüler",
    accent: "blue",
    listingLimit: 3,
    teamSeats: 1,
    features: [
      {
        label: "Borsa terminali TAM",
        detail: "Ticker + counter + heat map + order book + top movers + AI signals + sparkline tam erişim.",
        status: "included",
      },
      {
        label: "Sınırsız rapor görüntüleme",
        detail: "İhaleal Endeks Raporu + GES + War Room + Değerleme — istediğin kadar.",
        status: "included",
      },
      {
        label: "Gerçek kapanış verisi",
        detail: "Platformda kapanan ihalelerin gerçek satış fiyatı, m² rayiç, %ROI.",
        status: "included",
      },
      {
        label: "AI fırsat bildirimi",
        detail: "Bölge + bütçe kriterine uyan yeni ilanlar / fırsat ihaleler push + e-posta.",
        status: "included",
      },
      { label: "3 ilan/yıl", limit: "3", status: "limited" },
      { label: "Favori liste", limit: "100", status: "included" },
      { label: "İhale katılım", status: "included" },
      { label: "Doping / vitrin", status: "excluded" },
      { label: "Ekip üye", limit: "1", status: "limited" },
    ],
  },
  {
    id: "emlak_baslangic",
    name: "Emlak Başlangıç",
    tagline: "Yeni başlayan emlakçı / küçük ofis",
    monthlyTry: 1500,
    segment: "emlakci",
    accent: "emerald",
    listingLimit: 15,
    teamSeats: 1,
    features: [
      { label: "15 ilan", limit: "15", status: "included" },
      { label: "5 doping/ay", detail: "İlanı listede üst sıraya çıkar (5x ay içinde).", limit: "5", status: "included" },
      { label: "Profil rozeti", detail: "Doğrulanmış emlakçı rozeti — alıcı güvenini artırır.", status: "included" },
      { label: "Borsa terminel TAM", status: "included" },
      { label: "Sınırsız rapor", status: "included" },
      { label: "Gerçek kapanış", status: "excluded" },
      { label: "Vitrin/öne çıkan", limit: "Tek satın", status: "limited" },
      { label: "AI fırsat bildirimi", status: "included" },
      { label: "Ekip üye", limit: "1", status: "limited" },
    ],
  },
  {
    id: "emlak_pro",
    name: "Emlak Pro",
    tagline: "Profesyonel emlak ofisi — büyüme",
    monthlyTry: 3500,
    segment: "emlakci",
    highlight: "Önerilen",
    accent: "amber",
    listingLimit: 50,
    teamSeats: 3,
    features: [
      { label: "50 ilan", limit: "50", status: "included" },
      { label: "20 doping/ay", limit: "20", status: "included" },
      { label: "Gerçek kapanış verisi", status: "included" },
      { label: "Borsa terminel TAM", status: "included" },
      { label: "Sınırsız rapor", status: "included" },
      { label: "Öncelik sırada gözükme", detail: "Eşit doping skorunda Pro üyenin ilanı öne çıkar.", status: "included" },
      { label: "Vitrin/öne çıkan", limit: "3/ay", status: "included" },
      { label: "Ekip üye", limit: "3", status: "included" },
      { label: "API erişim", status: "excluded" },
    ],
  },
  {
    id: "kurumsal",
    name: "Kurumsal",
    tagline: "Zincir ofisleri + portföy fonları + müteahhitler",
    monthlyTry: 7500,
    segment: "kurumsal",
    accent: "violet",
    listingLimit: "unlimited",
    teamSeats: 10,
    features: [
      { label: "Sınırsız ilan", limit: "∞", status: "included" },
      { label: "API erişim", detail: "REST API ile ilan yönetimi, raporlama, webhooks (Supabase RLS uyumlu).", status: "included" },
      { label: "Tüm modüller", detail: "GES + War Room + KKA + Değerleme + Borsa + Endeks — her şey açık.", status: "included" },
      { label: "Mini-site (Kurumsal sayfa)", detail: "Şirket profili, portföy listesi, iletişim formu — kendi alt domain.", status: "included" },
      { label: "Beyaz etiket PDF rapor", detail: "Kendi logon + renkler ile Endeks Raporu üretimi.", status: "included" },
      { label: "Ekip üye", limit: "10", status: "included" },
      { label: "Öncelikli destek", detail: "WhatsApp + telefon + e-posta — 4 saat SLA.", status: "included" },
      { label: "Eğitim", detail: "Onboarding + 3 aylık ekip eğitimi + best practices.", status: "included" },
    ],
  },
] as const;

/** Tek ekmek satın alımı (rapor + add-on) — UI fiyat referansı */
export const ONE_OFF_PRICES = {
  extra_listing: 249,
  valuation_report: 249,
  ges_report: 499,
  legal_report: 349,
  doping_single: 99,
  vitrin_single: 199,
  featured_auction: 499,
} as const;

export type OneOffSku = keyof typeof ONE_OFF_PRICES;

export const ONE_OFF_LABELS: Record<OneOffSku, string> = {
  extra_listing: "Ek ilan açma",
  valuation_report: "Değerleme PDF raporu",
  ges_report: "GES analiz PDF raporu",
  legal_report: "Hukuki risk PDF raporu",
  doping_single: "Tek seferlik doping",
  vitrin_single: "Vitrin (1 hafta)",
  featured_auction: "Öne çıkan ihale (vitrin)",
};

/** Komisyon kademeli — satış değerine göre */
export interface CommissionBracket {
  /** Üst sınır (TL). undefined ise sonsuz. */
  maxTry?: number;
  /** Yüzde (0.03 = %3) */
  rate: number;
  label: string;
}

export const COMMISSION_BRACKETS: readonly CommissionBracket[] = [
  { maxTry: 3_000_000, rate: 0.03, label: "₺0 – ₺3M arası" },
  { maxTry: 10_000_000, rate: 0.025, label: "₺3M – ₺10M arası" },
  { rate: 0.02, label: "₺10M+ üzeri" },
] as const;

/** Kademeli komisyon hesapla (her dilim için kendi oranı) */
export function calcCommission(saleTry: number): {
  total: number;
  breakdown: Array<{ label: string; from: number; to: number; rate: number; amount: number }>;
} {
  let remaining = Math.max(0, saleTry);
  let cursor = 0;
  let total = 0;
  const breakdown: Array<{ label: string; from: number; to: number; rate: number; amount: number }> = [];
  for (const bracket of COMMISSION_BRACKETS) {
    if (remaining <= 0) break;
    const segmentTop = bracket.maxTry ?? Infinity;
    const segmentSize = segmentTop - cursor;
    const portion = Math.min(remaining, segmentSize);
    const amount = Math.round(portion * bracket.rate);
    if (portion > 0) {
      breakdown.push({
        label: bracket.label,
        from: cursor,
        to: cursor + portion,
        rate: bracket.rate,
        amount,
      });
      total += amount;
    }
    cursor += portion;
    remaining -= portion;
  }
  return { total, breakdown };
}

/** Tier'a göre özellik kilidini sorgula (premium-gate yardımcısı) */
export function isFeatureUnlocked(
  tierId: TierId,
  featureLabel: string,
): boolean {
  const tier = PRICING_TIERS.find((t) => t.id === tierId);
  if (!tier) return false;
  const f = tier.features.find((x) => x.label === featureLabel);
  if (!f) return false;
  return f.status === "included";
}

/** Tier'in popüler/önerilen rozetini al */
export function getHighlight(tierId: TierId): string | undefined {
  return PRICING_TIERS.find((t) => t.id === tierId)?.highlight;
}
