/**
 * ihaleal — Üyelik / Fiyatlandırma katmanları konfigürasyonu
 *
 * Bu dosya tek noktadan değiştirilebilir (pazar testi). Fiyatları, özellikleri,
 * sınırları güncellemek için sadece bu dosyayı düzenle; UI/lock-gate kodları
 * otomatik adapte olur.
 *
 * Master not (2026-06-01):
 * - KOMİSYON `fees.ts` (tek kaynak, %2 alıcı + %2 satıcı + KDV).
 *   Bu dosya sadece ÜYELİK fiyatları + ek hizmet (one-off) kalemleri.
 * - 2026-06-01 fiyat güncellemesi (Master politika belgesi):
 *   Yatırımcı 399→499, Başlangıç 1500→1900 (20 ilan), Pro 3500→4500 (60 ilan),
 *   Kurumsal 7500→9900. Yıllık indirim %20 korundu.
 * - Erken üye (kuruluş indirimi): EARLY_MEMBER_* flag/fiyatları ile kapatılabilir.
 */

export type TierId = "free" | "yatirimci" | "emlak_baslangic" | "emlak_pro" | "kurumsal";

export type BillingCycle = "monthly" | "yearly";

/** Yıllık ödemede indirim oranı (1 = no discount). 0.20 = %20 indirim. */
export const YEARLY_DISCOUNT_RATE = 0.20;

// ============================================================================
// ERKEN ÜYE / KURULUŞ ÜYESİ İNDİRİMİ
// ============================================================================
//
// Master politikası: ilk 6 ay (veya ilk 100 üye) erken fiyatla katılır.
// Kuruluş üyesi taahhüdü dolduğunda EARLY_MEMBER_ACTIVE=false yap; sayfa
// otomatik liste fiyatına döner. Mevcut aboneler 12 ay fiyat sabit (politika
// belgesi).
//
// Aktif iken: kartta liste fiyatı ÜSTÜ ÇİZİLİ + erken fiyat VURGULU gösterilir.

/** Erken üye indirimi aktif mi (true = kuruluş fiyatı UI'da görünür). */
export const EARLY_MEMBER_ACTIVE = true;

/** Erken üye etiketi — kartta görünür rozet. */
export const EARLY_MEMBER_LABEL = "Kuruluş üyesi · ilk 6 ay";

/** Erken üye açıklaması — ek satır. */
export const EARLY_MEMBER_NOTE =
  "İlk 6 ay (veya ilk 100 üye) erken katılım fiyatı. Mevcut aboneler 12 ay fiyat sabit.";

/** Aylık TL — erken üye fiyatları (yıllıkta yine %20 indirim uygulanır). */
export const EARLY_MEMBER_PRICES: Record<Exclude<TierId, "free">, number> = {
  yatirimci: 349,
  emlak_baslangic: 1400,
  emlak_pro: 3400,
  kurumsal: 7500,
};

export interface PricingFeature {
  /** Kısa etiket, tabloda görünür */
  label: string;
  /** Detay drill-down açıklaması */
  detail?: string;
  /** Bu tier'da bu özelliğin durumu */
  status: "included" | "limited" | "excluded";
  /** Limit bilgisi ("20 ilan", "Sınırsız", "1/yıl" gibi) */
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

/** Bir tier için ödeme döngüsüne göre gösterilecek tutar (LİSTE fiyatı). */
export function priceFor(tier: PricingTier, cycle: BillingCycle): { try: number; period: string } {
  if (tier.monthlyTry === 0) return { try: 0, period: "Ücretsiz" };
  return cycle === "monthly"
    ? { try: tier.monthlyTry, period: "/ay" }
    : { try: yearlyTry(tier.monthlyTry), period: "/yıl" };
}

/** Bir tier için erken üye fiyatı (aktifse). */
export function earlyPriceFor(
  tier: PricingTier,
  cycle: BillingCycle,
): { try: number; period: string } | null {
  if (!EARLY_MEMBER_ACTIVE) return null;
  if (tier.monthlyTry === 0) return null;
  const earlyMonthly = EARLY_MEMBER_PRICES[tier.id as Exclude<TierId, "free">];
  if (earlyMonthly === undefined || earlyMonthly >= tier.monthlyTry) return null;
  return cycle === "monthly"
    ? { try: earlyMonthly, period: "/ay" }
    : { try: yearlyTry(earlyMonthly), period: "/yıl" };
}

/** Günlük birim — "günde ~X₺" psikolojik vurgu (sadece aylık 30, yıllık 365 baz). */
export function dailyEquivalent(tier: PricingTier, cycle: BillingCycle): number | null {
  if (tier.monthlyTry === 0) return null;
  const earlyMonthly = EARLY_MEMBER_ACTIVE
    ? EARLY_MEMBER_PRICES[tier.id as Exclude<TierId, "free">]
    : undefined;
  const monthly = earlyMonthly ?? tier.monthlyTry;
  if (cycle === "monthly") return Math.round(monthly / 30);
  return Math.round((monthly * (1 - YEARLY_DISCOUNT_RATE) * 12) / 365);
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
        detail: "Yılda 1 ücretsiz ilan açma hakkı. Ek ilanlar tek satın alımla (₺299) eklenebilir.",
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
    monthlyTry: 499,
    segment: "yatirimci",
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
    monthlyTry: 1900,
    segment: "emlakci",
    accent: "emerald",
    listingLimit: 20,
    teamSeats: 1,
    features: [
      { label: "20 ilan", limit: "20", status: "included" },
      { label: "5 doping/ay", detail: "İlanı listede üst sıraya çıkar (5x ay içinde).", limit: "5", status: "included" },
      { label: "Temel analiz", detail: "Bölgesel ortalama, m² rayiç, satış hızı — sınırlı detay.", status: "included" },
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
    monthlyTry: 4500,
    segment: "emlakci",
    highlight: "En Popüler",
    accent: "amber",
    listingLimit: 60,
    teamSeats: 3,
    features: [
      { label: "60 ilan", limit: "60", status: "included" },
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
    monthlyTry: 9900,
    segment: "kurumsal",
    highlight: "Premium",
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

/**
 * Tek seferlik satın alım — UI fiyat referansı.
 * 2026-06-01 güncelleme:
 *   valuation_report 249→299 (Endeks Raporu olarak adlandırılır), ges_report
 *   499→599, legal_report 349→399, vitrin_single 199→250, featured_auction
 *   499→599. YENİ: rapor_paketi (3 rapor + AI fırsat 30 gün bundle),
 *   vitrin_premium (1 hafta öne çıkan + üst banner).
 *
 * NOT: SKU adları geriye uyumluluk için sabit; yalnız etiket + fiyat güncellendi.
 */
export const ONE_OFF_PRICES = {
  extra_listing: 299,
  valuation_report: 299, // Endeks Raporu — eski "Değerleme" 249
  ges_report: 599, // eski 499
  legal_report: 399, // eski 349
  rapor_paketi: 1199, // YENİ: Endeks + GES + Hukuki bundle (avantajlı)
  doping_single: 99,
  vitrin_single: 250, // 1 hafta — eski 199
  vitrin_premium: 600, // YENİ: 1 hafta öne çıkan + üst banner
  featured_auction: 599, // 1 ihale öne çıkan — eski 499
} as const;

export type OneOffSku = keyof typeof ONE_OFF_PRICES;

export const ONE_OFF_LABELS: Record<OneOffSku, string> = {
  extra_listing: "Ek ilan açma",
  valuation_report: "Endeks Raporu (PDF)",
  ges_report: "GES Analiz Raporu (PDF)",
  legal_report: "Hukuki Risk Raporu (PDF)",
  rapor_paketi: "Rapor Paketi (3 rapor + AI fırsat 30 gün)",
  doping_single: "Tek seferlik doping (24 saat)",
  vitrin_single: "Vitrin (1 hafta)",
  vitrin_premium: "Vitrin Premium (1 hafta öne çıkan)",
  featured_auction: "Öne çıkan ihale (vitrin)",
};

// Komisyon merkezi: fees.ts (tek kaynak). %2 alıcı + %2 satıcı + KDV (Taşınmaz Ticareti
// Yönetmeliği toplam %4 yasal üst sınır). Kademeli komisyon modeli kaldırıldı (2026-06-01).
// UI komisyon hesabı için: import { calcCommissionBreakdown } from "@/lib/fees";

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
