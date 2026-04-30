/** Demo ortak ofis profilleri (hesaplanmış metrikler; içerik tanıtım amaçlı). */
export interface DemoRealtor {
  slug: string;
  companyName: string;
  city: string;
  rating: number;
  reviewCount: number;
  closedDeals: number;
  /** Son 12 ay (demo) */
  volumeTry: number;
  bio: string;
  specialties: string[];
  salesHistory: { month: string; count: number; volumeTry: number }[];
  reviews: { author: string; score: number; text: string; date: string }[];
}

export const DEMO_REALTORS: DemoRealtor[] = [
  {
    slug: "panorama-gayrimenkul",
    companyName: "Panorama Gayrimenkul A.Ş.",
    city: "İstanbul",
    rating: 4.8,
    reviewCount: 124,
    closedDeals: 89,
    volumeTry: 1_420_000_000,
    bio: "Kurumsal portföy ve ihale süreçlerinde operasyonel eşleştirme; B2B fatura çizgisi ile uyumlu demo profil.",
    specialties: ["İhale", "Ofis", "Lüks konut"],
    salesHistory: [
      { month: "2026-01", count: 6, volumeTry: 185_000_000 },
      { month: "2026-02", count: 7, volumeTry: 210_000_000 },
      { month: "2026-03", count: 8, volumeTry: 228_000_000 },
      { month: "2026-04", count: 5, volumeTry: 156_000_000 },
    ],
    reviews: [
      { author: "Demir Y.", score: 5, text: "Süreç net iletildi; tapu öncesi belge kontrolü iyi.", date: "2026-04-02" },
      { author: "Ayşe K.", score: 5, text: "Teklif turunda iletişim kanalı platform üzerinden akıcıydı.", date: "2026-03-18" },
    ],
  },
  {
    slug: "kent-emlak-broker",
    companyName: "Kent Emlak Broker",
    city: "Ankara",
    rating: 4.6,
    reviewCount: 78,
    closedDeals: 54,
    volumeTry: 680_000_000,
    bio: "Bölge endeksleri ve fiyat bandı ile yatırımcı eşleşmesi; demo performans verisi.",
    specialties: ["Yatırım", "Ofis", "Arsa"],
    salesHistory: [
      { month: "2026-01", count: 4, volumeTry: 112_000_000 },
      { month: "2026-02", count: 5, volumeTry: 138_000_000 },
      { month: "2026-03", count: 6, volumeTry: 159_000_000 },
      { month: "2026-04", count: 5, volumeTry: 142_000_000 },
    ],
    reviews: [
      { author: "Can Ö.", score: 5, text: "Komisyon kalemleri şeffaf açıklandı.", date: "2026-03-28" },
    ],
  },
  {
    slug: "marti-property",
    companyName: "Martı Property",
    city: "İzmir",
    rating: 4.9,
    reviewCount: 203,
    closedDeals: 142,
    volumeTry: 2_050_000_000,
    bio: "Kıyı ve marinaya yakın segmentlerde listeler; platform ile uyumlu yönlendirme kaydı.",
    specialties: ["Villa", "Konut", "Ticari"],
    salesHistory: [
      { month: "2026-01", count: 9, volumeTry: 298_000_000 },
      { month: "2026-02", count: 11, volumeTry: 356_000_000 },
      { month: "2026-03", count: 10, volumeTry: 332_000_000 },
      { month: "2026-04", count: 8, volumeTry: 278_000_000 },
    ],
    reviews: [
      { author: "Selin A.", score: 5, text: "Harita ve çevre metrikleri karşılaştırmada yardımcı oldu.", date: "2026-04-12" },
    ],
  },
  ...generateFill(),
];

function generateFill(): DemoRealtor[] {
  const seeds = [
    { slug: "vadi-real-estate", companyName: "Vadi Real Estate", city: "Bursa" },
    { slug: "nova-portfoy", companyName: "Nova Portföy", city: "Antalya" },
    { slug: "kent-capital", companyName: "Kent Capital Partners", city: "Kocaeli" },
    { slug: "ege-prime", companyName: "Ege Prime", city: "İzmir" },
    { slug: "goksun-property", companyName: "Gökşün Property", city: "Gaziantep" },
    { slug: "kanyon-elite", companyName: "Kanyon Elite Gayrimenkul", city: "İstanbul" },
    { slug: "capital-hub-adana", companyName: "Capital Hub Adana", city: "Adana" },
    { slug: "mersin-coast", companyName: "Mersin Coast Realty", city: "Mersin" },
    { slug: "central-plateau", companyName: "Central Plateau Gayrimenkul", city: "Kayseri" },
    { slug: "bodrum-select", companyName: "Bodrum Select", city: "Muğla" },
    { slug: "trabzon-view", companyName: "Trabzon View Emlak", city: "Trabzon" },
    { slug: "tekirdag-urban", companyName: "Tekirdağ Urban Realty", city: "Tekirdağ" },
  ];
  return seeds.map((s, i) => ({
    ...s,
    rating: 4.4 + (i % 5) * 0.1,
    reviewCount: 40 + i * 11,
    closedDeals: 28 + i * 7,
    volumeTry: 320_000_000 + i * 42_000_000,
    bio: `${s.city} bölgesinde kurumsal yönlendirme ve ihale süreçleri için örnek ofis profili (demo).`,
    specialties: ["Konut", "Ticari", "İhale"].slice(0, 2 + (i % 2)),
    salesHistory: [
      { month: "2026-02", count: 3 + (i % 4), volumeTry: 90_000_000 + i * 12_000_000 },
      { month: "2026-03", count: 4 + (i % 3), volumeTry: 105_000_000 + i * 14_000_000 },
      { month: "2026-04", count: 3 + (i % 5), volumeTry: 98_000_000 + i * 11_000_000 },
    ],
    reviews: [
      { author: `Kullanıcı ${i + 1}`, score: 5, text: "İşlem akışı ve iletişim kanalı düzenli aktarıldı (demo).", date: "2026-04-01" },
    ],
  }));
}

export function getRealtorBySlug(slug: string): DemoRealtor | undefined {
  return DEMO_REALTORS.find((r) => r.slug === slug);
}
