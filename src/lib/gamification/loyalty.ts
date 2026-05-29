export type RewardActionKey =
  | "daily_login"
  | "join_auction"
  | "complete_transaction"
  | "create_listing"
  | "share_listing"
  | "leave_review"
  | "invite_friend";

export interface RewardAction {
  key: RewardActionKey;
  label: string;
  basePoints: number;
  description: string;
}

export interface RewardCatalogItem {
  id: string;
  title: string;
  cost: number;
  detail: string;
}

export interface RewardLedgerItem {
  id: string;
  action: string;
  points: number;
  createdAt: string;
  note?: string;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  rule: string;
  icon: string;
}

export interface MissionDefinition {
  id: string;
  title: string;
  points: number;
}

export interface VipTier {
  id: "bronze" | "silver" | "gold" | "platinum";
  title: string;
  minPoints: number;
  minVolumeTry: number;
  perks: string[];
}

export const REWARD_ACTIONS: RewardAction[] = [
  {
    key: "daily_login",
    label: "Günlük giriş",
    basePoints: 8,
    description: "Günlük aktiflik bonusu (mock).",
  },
  {
    key: "join_auction",
    label: "İhaleye katılma",
    basePoints: 25,
    description: "Canlı veya kapalı teklif katılımı.",
  },
  {
    key: "complete_transaction",
    label: "İşlem tamamlama",
    basePoints: 120,
    description: "İşlem tutarına göre ekstra puan uygulanır.",
  },
  {
    key: "create_listing",
    label: "İlan oluşturma",
    basePoints: 30,
    description: "Yeni ilan açılışı.",
  },
  {
    key: "share_listing",
    label: "İlan paylaşımı",
    basePoints: 14,
    description: "Sosyal paylaşım veya bağlantı kopyalama.",
  },
  {
    key: "leave_review",
    label: "Değerlendirme bırakma",
    basePoints: 20,
    description: "Doğrulanmış kullanıcı yorumu.",
  },
  {
    key: "invite_friend",
    label: "Davet gönderme",
    basePoints: 40,
    description: "Davet linkiyle yeni kullanıcı kazandırma (mock).",
  },
];

export const REWARD_CATALOG: RewardCatalogItem[] = [
  {
    id: "discount-commission-5",
    title: "%5 Komisyon İndirimi Kuponu",
    cost: 500,
    detail: "Bir sonraki işlemde demo komisyon indirimi.",
  },
  {
    id: "featured-listing-boost",
    title: "Öne Çıkan İlan Boost (48 saat)",
    cost: 750,
    detail: "İlan kartını üst sıralara taşır (temsili).",
  },
  {
    id: "premium-data-pack",
    title: "Premium Veri Paketi",
    cost: 900,
    detail: "Bölge sinyal raporu + emsal bandı (demo).",
  },
  {
    id: "auction-priority-pass",
    title: "Öncelikli İhale Erişimi",
    cost: 1200,
    detail: "Belirli ihalelerde erken erişim slotu (mock).",
  },
];

export const DEMO_REWARDS_NOTE =
  "Ödül/puan sistemi demo ve temsili amaçlıdır; canlı ortamda hukuki ve finansal şartlar ayrıca yayınlanır.";

export const GAMIFICATION_NOTE =
  "Rozet, liderlik ve tahmin oyunu akışı Zillow/Redfin benzeri modelin temsili demo uyarlamasıdır.";

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: "first_bid", title: "İlk Teklif", rule: "İlk ihaleye katılım", icon: "🥇" },
  { id: "five_auctions", title: "5 İhale", rule: "5+ ihale katılımı", icon: "⚡" },
  { id: "region_expert", title: "Bölge Uzmanı", rule: "3+ bölge analizi", icon: "🗺️" },
  { id: "early_user", title: "Erken Kullanıcı", rule: "İlk 30 gün içinde aktiflik", icon: "🚀" },
];

export const MISSIONS: MissionDefinition[] = [
  { id: "complete_profile", title: "Profili tamamla", points: 35 },
  { id: "first_favorite", title: "İlk favoriyi ekle", points: 20 },
  { id: "first_share", title: "İlk paylaşımını yap", points: 18 },
];

export const DEMO_LEADERBOARD = [
  { alias: "BlueFalcon", score: 2420 },
  { alias: "AnatoliaBidder", score: 2285 },
  { alias: "MapInvestor", score: 2140 },
  { alias: "EarlyDelta", score: 1970 },
  { alias: "GeoHunter", score: 1865 },
] as const;

export const VIP_TIERS: VipTier[] = [
  {
    id: "bronze",
    title: "Bronze",
    minPoints: 0,
    minVolumeTry: 0,
    perks: ["Standart komisyon", "Temel rapor erişimi"],
  },
  {
    id: "silver",
    title: "Silver",
    minPoints: 700,
    minVolumeTry: 1_500_000,
    perks: ["%2 demo komisyon indirimi", "Öncelikli destek sırası"],
  },
  {
    id: "gold",
    title: "Gold",
    minPoints: 1500,
    minVolumeTry: 5_000_000,
    perks: ["%4 demo komisyon indirimi", "Özel ihale ön bildirimi", "Premium veri akışı"],
  },
  {
    id: "platinum",
    title: "Platinum",
    minPoints: 2600,
    minVolumeTry: 10_000_000,
    perks: ["%6 demo komisyon indirimi", "VIP canlı ihale hattı", "Tam premium veri seti"],
  },
];

export function buildTransactionPoints(amountTry: number): number {
  if (!Number.isFinite(amountTry) || amountTry <= 0) return 0;
  return Math.max(0, Math.round(amountTry / 50_000));
}
