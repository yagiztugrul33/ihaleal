import type { MarketDataAsset } from './borsa';

/**
 * Mobil terminal için demo varlık seti. Web ile aynı motorları besler.
 * Gerçek market verisi cekirdek + lisansli veri akisi ile gelecek (Tool B Supabase entegrasyonu sonrası).
 */
export const DEMO_MARKET_ASSETS: MarketDataAsset[] = [
  {
    id: 'IST-KDK-001',
    code: 'KDK-K3',
    property: 'Kadıköy Konut 3+1',
    price: 8_450_000,
    changePct: 1.42,
    volume: 124,
    previousClose: 8_330_000,
    openPrice: 8_360_000,
    high: 8_510_000,
    low: 8_290_000,
  },
  {
    id: 'IST-BSK-014',
    code: 'BSK-PR',
    property: 'Beşiktaş Prime Daire',
    price: 18_900_000,
    changePct: -0.65,
    volume: 38,
    previousClose: 19_024_000,
    openPrice: 19_010_000,
    high: 19_050_000,
    low: 18_780_000,
  },
  {
    id: 'ANK-CKY-007',
    code: 'CKY-OF',
    property: 'Çankaya Ofis Plaza',
    price: 24_650_000,
    changePct: 0.32,
    volume: 27,
    previousClose: 24_572_000,
    openPrice: 24_600_000,
    high: 24_780_000,
    low: 24_540_000,
  },
  {
    id: 'IZM-KSY-022',
    code: 'KSY-K2',
    property: 'Karşıyaka Konut 2+1',
    price: 5_120_000,
    changePct: 2.18,
    volume: 89,
    previousClose: 5_011_000,
    openPrice: 5_020_000,
    high: 5_160_000,
    low: 5_000_000,
  },
  {
    id: 'ANT-MRT-031',
    code: 'MRT-TR',
    property: 'Antalya Turizm Otel',
    price: 62_400_000,
    changePct: 3.05,
    volume: 11,
    previousClose: 60_550_000,
    openPrice: 60_700_000,
    high: 62_500_000,
    low: 60_650_000,
  },
  {
    id: 'IST-USK-045',
    code: 'USK-AR',
    property: 'Üsküdar Arsa 1200m²',
    price: 14_700_000,
    changePct: -1.12,
    volume: 19,
    previousClose: 14_867_000,
    openPrice: 14_850_000,
    high: 14_900_000,
    low: 14_620_000,
  },
];

/**
 * Demo ilan listesi — İlanlar ekranı için.
 * AI değerleme skoru = (changePct + 5) * 10, sınırla normalize (0..100).
 */
export type DemoListing = {
  id: string;
  title: string;
  city: string;
  district: string;
  type: 'konut' | 'ticari' | 'arsa' | 'turizm';
  priceTry: number;
  estimatedValueTry: number;
  aiScore: number;
  m2: number;
  rooms?: number;
  thumbnail?: string;
};

export const DEMO_LISTINGS: DemoListing[] = [
  {
    id: 'IST-KDK-001',
    title: 'Kadıköy Caferağa 3+1 Bahçe Katı',
    city: 'İstanbul',
    district: 'Kadıköy',
    type: 'konut',
    priceTry: 8_450_000,
    estimatedValueTry: 8_780_000,
    aiScore: 78,
    m2: 142,
    rooms: 3,
  },
  {
    id: 'IST-BSK-014',
    title: 'Beşiktaş Etiler Prime Daire',
    city: 'İstanbul',
    district: 'Beşiktaş',
    type: 'konut',
    priceTry: 18_900_000,
    estimatedValueTry: 19_400_000,
    aiScore: 86,
    m2: 220,
    rooms: 4,
  },
  {
    id: 'ANK-CKY-007',
    title: 'Çankaya GMK Bulvarı Ofis Plaza Kat',
    city: 'Ankara',
    district: 'Çankaya',
    type: 'ticari',
    priceTry: 24_650_000,
    estimatedValueTry: 23_900_000,
    aiScore: 64,
    m2: 380,
  },
  {
    id: 'IZM-KSY-022',
    title: 'Karşıyaka Bostanlı Deniz Manzaralı',
    city: 'İzmir',
    district: 'Karşıyaka',
    type: 'konut',
    priceTry: 5_120_000,
    estimatedValueTry: 5_350_000,
    aiScore: 81,
    m2: 105,
    rooms: 2,
  },
  {
    id: 'ANT-MRT-031',
    title: 'Antalya Lara 88 Oda Butik Otel',
    city: 'Antalya',
    district: 'Muratpaşa',
    type: 'turizm',
    priceTry: 62_400_000,
    estimatedValueTry: 65_000_000,
    aiScore: 89,
    m2: 2_400,
  },
  {
    id: 'IST-USK-045',
    title: 'Üsküdar Çengelköy 1.2 dönüm Arsa',
    city: 'İstanbul',
    district: 'Üsküdar',
    type: 'arsa',
    priceTry: 14_700_000,
    estimatedValueTry: 14_200_000,
    aiScore: 58,
    m2: 1_200,
  },
];

export function findListing(id: string): DemoListing | undefined {
  return DEMO_LISTINGS.find((l) => l.id === id);
}

export function findMarketAsset(id: string): MarketDataAsset | undefined {
  return DEMO_MARKET_ASSETS.find((a) => a.id === id);
}
