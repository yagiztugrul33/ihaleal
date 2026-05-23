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

export function buildTransactionPoints(amountTry: number): number {
  if (!Number.isFinite(amountTry) || amountTry <= 0) return 0;
  return Math.max(0, Math.round(amountTry / 50_000));
}
