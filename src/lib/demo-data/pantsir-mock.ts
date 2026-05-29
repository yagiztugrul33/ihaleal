// R13.4 Pantsir — Konum bazlı emlak istihbarat panelı mock veri
// Master vizyon: kullanıcı ilan açtığında 5 ana skor + yakın POI özet
// Gerçek API entegrasyonu R13.2'de (OSM Overpass)

export type PantsirScoreKey = "konum" | "egitim" | "guvenlik" | "ses" | "saglik";

export interface PantsirScoreCard {
  key: PantsirScoreKey;
  label: string;
  score: number; // 0-100
  detail: string;
}

export interface PantsirPOI {
  category: "saglik" | "egitim" | "devlet" | "ticaret" | "ulasim" | "sosyal";
  name: string;
  distanceM: number;
  direction: "K" | "G" | "D" | "B" | "KD" | "KB" | "GD" | "GB";
}

export interface PantsirSnapshot {
  listingId: string;
  scores: PantsirScoreCard[];
  poiSummary: { okul: number; hastane: number; market: number; metro: number };
  poiList: PantsirPOI[];
  generatedAt: string;
}

function seeded(id: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % 100;
}

const POI_CATALOG: Record<PantsirPOI["category"], string[]> = {
  saglik: ["Devlet Hastanesi", "Aile Sağlığı Merkezi", "Özel Klinik", "Eczane Merkezi", "Acil Servis"],
  egitim: ["İlkokul Yıldız", "Anaokulu Çiçek", "Lise Atatürk", "Üniversite Kampüsü", "Anadolu Lisesi"],
  devlet: ["Muhtarlık", "Belediye Hizmet", "PTT Şubesi", "Tapu Müdürlüğü", "Karakol"],
  ticaret: ["AVM Park", "Migros", "BİM", "Marketler Cad.", "Pazaryeri"],
  ulasim: ["Metro İstasyonu", "Otobüs Durağı", "Tramvay Hattı", "Minibüs Cad.", "Taksi Durağı"],
  sosyal: ["Şehir Parkı", "Spor Salonu", "Kütüphane", "Müze", "Kafe Sokağı"],
};

const DIRECTIONS: PantsirPOI["direction"][] = ["K", "G", "D", "B", "KD", "KB", "GD", "GB"];

export function getPantsirSnapshot(listingId: string): PantsirSnapshot {
  const scores: PantsirScoreCard[] = [
    { key: "konum", label: "Konum", score: 60 + seeded(listingId, 1) % 40, detail: "Ulaşım + erişim skoru" },
    { key: "egitim", label: "Eğitim", score: 55 + seeded(listingId, 2) % 40, detail: "MEB resmi sıralama (mock)" },
    { key: "guvenlik", label: "Güvenlik", score: 50 + seeded(listingId, 3) % 45, detail: "Suç istatistiği proxy" },
    { key: "ses", label: "Sosyo-Ekonomik", score: 55 + seeded(listingId, 4) % 40, detail: "TÜİK gelir + eğitim" },
    { key: "saglik", label: "Sağlık", score: 60 + seeded(listingId, 5) % 35, detail: "Hastane + klinik erişimi" },
  ];

  const poiList: PantsirPOI[] = [];
  (Object.keys(POI_CATALOG) as PantsirPOI["category"][]).forEach((cat, catIdx) => {
    const names = POI_CATALOG[cat];
    for (let i = 0; i < 5; i++) {
      poiList.push({
        category: cat,
        name: names[i % names.length],
        distanceM: 200 + ((seeded(listingId, catIdx * 10 + i) * 18) % 1800),
        direction: DIRECTIONS[(seeded(listingId, catIdx + i) % 8) as number],
      });
    }
  });

  return {
    listingId,
    scores,
    poiSummary: {
      okul: 12,
      hastane: 5,
      market: 18,
      metro: 2,
    },
    poiList,
    generatedAt: new Date().toISOString(),
  };
}
