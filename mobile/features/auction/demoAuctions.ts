/**
 * Mobil ihale ekranları için demo veri. Gerçek veri Tool B Supabase istemcisi
 * bağlandıktan sonra `auctions` tablosu RPC'si ile değiştirilecek.
 *
 * `marketingMode` web src/types/auction.ts ile uyumlu üçlü değer:
 *   - "auction"        → açık artırma
 *   - "sealed_offers"  → kapalı teklif
 *   - "listing_only"   → sadece ilan (müzakere)
 */

export type AuctionMarketingMode = 'auction' | 'sealed_offers' | 'listing_only';

export type DemoBidEntry = {
  bidder: string;
  amountTry: number;
  timestamp: string; // ISO
};

export type DemoAuction = {
  id: string;
  title: string;
  city: string;
  district: string;
  description: string;
  marketingMode: AuctionMarketingMode;
  /** ₺ — açık artırma cari, sealed için son görünür satır (geri sayım sürerken). */
  currentBidTry: number;
  startingBidTry: number;
  minIncrementTry: number;
  buyNowPriceTry?: number;
  /** Sealed teklif için satıcının görünür minimum eşik (opsiyonel). */
  sealedReserveTry?: number;
  endDateIso: string;
  bidderCount: number;
  m2: number;
  rooms?: number;
  /** Yer tutucu görsel; Tool B real CDN bağlandığında değişir. */
  imagePlaceholder: string;
  bidHistory: DemoBidEntry[];
  /** Demo banner notu. */
  demoNote: string;
};

const NOW = Date.now();
function inHours(h: number): string {
  return new Date(NOW + h * 3_600_000).toISOString();
}

export const DEMO_AUCTIONS: DemoAuction[] = [
  {
    id: 'AUC-IST-KDK-001',
    title: 'Kadıköy Caferağa 3+1 Bahçe Katı — Açık Artırma',
    city: 'İstanbul',
    district: 'Kadıköy',
    description:
      'Caferağa Mahallesi içinde 142 m² bahçe katı; tadilatlı, deniz manzarası kısmi. ' +
      'Ekspertiz raporu sözleşmede. İhale haftalık oturumda kapanır.',
    marketingMode: 'auction',
    currentBidTry: 8_450_000,
    startingBidTry: 7_800_000,
    minIncrementTry: 25_000,
    buyNowPriceTry: 9_200_000,
    endDateIso: inHours(52),
    bidderCount: 14,
    m2: 142,
    rooms: 3,
    imagePlaceholder: '🏠 Kadıköy',
    demoNote: 'Demo veri — gerçek ihale Tool B Supabase canlıya geçince devreye alınır.',
    bidHistory: [
      { bidder: 'B***1', amountTry: 8_450_000, timestamp: inHours(-2) },
      { bidder: 'A***5', amountTry: 8_400_000, timestamp: inHours(-3) },
      { bidder: 'M***9', amountTry: 8_350_000, timestamp: inHours(-5) },
      { bidder: 'B***1', amountTry: 8_280_000, timestamp: inHours(-9) },
      { bidder: 'D***2', amountTry: 8_100_000, timestamp: inHours(-14) },
    ],
  },
  {
    id: 'AUC-IST-BSK-014',
    title: 'Beşiktaş Etiler Prime Daire — Kapalı Teklif',
    city: 'İstanbul',
    district: 'Beşiktaş',
    description:
      'Etiler omurgasında 220 m² 4+1 prime daire; havuz, kapalı otopark, jeneratör. ' +
      'Kapalı teklifle yönetilir; teklif geçmişi oturum kapanışına kadar gizli.',
    marketingMode: 'sealed_offers',
    currentBidTry: 18_900_000,
    startingBidTry: 18_000_000,
    minIncrementTry: 100_000,
    sealedReserveTry: 19_500_000,
    endDateIso: inHours(120),
    bidderCount: 6,
    m2: 220,
    rooms: 4,
    imagePlaceholder: '🏙️ Beşiktaş',
    demoNote: 'Demo veri — kapalı teklif tutarı oturum kapanışına kadar gizli.',
    bidHistory: [],
  },
  {
    id: 'AUC-ANT-MRT-031',
    title: 'Antalya Lara 88 Oda Butik Otel — Açık Artırma + Hemen Al',
    city: 'Antalya',
    district: 'Muratpaşa',
    description:
      '88 oda butik otel; Lara sahil hattına yürüme mesafesinde; 12 aylık doluluk %78. ' +
      'Açık artırma + sabit Hemen Al fiyatı mevcut.',
    marketingMode: 'auction',
    currentBidTry: 62_400_000,
    startingBidTry: 58_000_000,
    minIncrementTry: 500_000,
    buyNowPriceTry: 68_000_000,
    endDateIso: inHours(72),
    bidderCount: 4,
    m2: 2_400,
    imagePlaceholder: '🏨 Antalya',
    demoNote: 'Demo veri — Hemen Al akışı KYC + ödeme PSP bağlanınca canlı.',
    bidHistory: [
      { bidder: 'K***7', amountTry: 62_400_000, timestamp: inHours(-1) },
      { bidder: 'P***2', amountTry: 61_900_000, timestamp: inHours(-6) },
      { bidder: 'K***7', amountTry: 60_500_000, timestamp: inHours(-22) },
    ],
  },
  {
    id: 'AUC-IST-USK-045',
    title: 'Üsküdar Çengelköy 1.2 dönüm Arsa — Sadece İlan',
    city: 'İstanbul',
    district: 'Üsküdar',
    description:
      '1.200 m² arsa; imar durumu konut; müteahhit dostu, KKA mümkün. ' +
      'Müzakereye açık ilan; teklif yok, doğrudan iletişim.',
    marketingMode: 'listing_only',
    currentBidTry: 14_700_000,
    startingBidTry: 14_700_000,
    minIncrementTry: 0,
    endDateIso: inHours(720),
    bidderCount: 0,
    m2: 1_200,
    imagePlaceholder: '🌳 Üsküdar',
    demoNote: 'Demo veri — bu ilan sadece müzakere modu; teklif/hemen al yok.',
    bidHistory: [],
  },
];

export function findDemoAuction(id: string): DemoAuction | undefined {
  return DEMO_AUCTIONS.find((a) => a.id === id);
}

/**
 * "2 gün 14 saat", "3 saat 12 dakika", "47 dakika", "12 saniye" formatı.
 * Negatif → "Kapandı".
 */
export function formatRemaining(targetIso: string, nowMs: number = Date.now()): string {
  const target = new Date(targetIso).getTime();
  if (!Number.isFinite(target)) return '—';
  const diffMs = target - nowMs;
  if (diffMs <= 0) return 'Kapandı';
  const sec = Math.floor(diffMs / 1000);
  const days = Math.floor(sec / 86_400);
  const hours = Math.floor((sec % 86_400) / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  if (days > 0) return `${days} gün ${hours} saat`;
  if (hours > 0) return `${hours} saat ${mins} dakika`;
  if (mins > 0) return `${mins} dakika`;
  return `${sec} saniye`;
}
