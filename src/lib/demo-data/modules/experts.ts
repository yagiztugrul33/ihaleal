export type ExpertCategoryId =
  | "statik"
  | "imar"
  | "sigorta"
  | "hukuk"
  | "psikoloji"
  | "afet-koordinator";

export interface ExpertCategory {
  id: ExpertCategoryId;
  label: string;
  description: string;
}

export interface ExpertProfile {
  id: string;
  categoryId: ExpertCategoryId;
  name: string;
  title: string;
  city: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  languages: string[];
  specialties: string[];
  nextSlot: string;
  feeBand: string;
  licensed: boolean;
}

export const EXPERT_CATEGORIES: ExpertCategory[] = [
  {
    id: "statik",
    label: "Statik ve güçlendirme",
    description: "Bina performans analizi, güçlendirme projesi ve saha denetimi.",
  },
  {
    id: "imar",
    label: "İmar ve ruhsat",
    description: "Parsel durumu, ruhsat uyumu ve kentsel dönüşüm süreçleri.",
  },
  {
    id: "sigorta",
    label: "Sigorta ve hasar",
    description: "DASK, konut poliçesi ve hasar tespit koordinasyonu.",
  },
  {
    id: "hukuk",
    label: "Hukuk ve tapu",
    description: "Ortak mülkiyet, tahliye ve sözleşme danışmanlığı.",
  },
  {
    id: "psikoloji",
    label: "Psikososyal destek",
    description: "Travma sonrası aile ve çocuk destek programları.",
  },
  {
    id: "afet-koordinator",
    label: "Afet koordinasyonu",
    description: "Kurumsal tatbikat, acil plan ve toplanma alanı planlaması.",
  },
];

const FIRST = [
  "Ayşe",
  "Mehmet",
  "Zeynep",
  "Can",
  "Elif",
  "Burak",
  "Selin",
  "Emre",
  "Deniz",
  "Kerem",
  "Merve",
  "Oğuz",
  "Ece",
  "Barış",
  "Cem",
  "Gül",
  "Hakan",
  "İrem",
  "Kaan",
  "Lale",
];
const LAST = [
  "Yılmaz",
  "Kaya",
  "Demir",
  "Çelik",
  "Şahin",
  "Aydın",
  "Öztürk",
  "Arslan",
  "Koç",
  "Polat",
  "Aksoy",
  "Erdoğan",
  "Güneş",
  "Kurt",
  "Aslan",
  "Tekin",
  "Bulut",
  "Sarı",
  "Taş",
  "Özkan",
];
const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Kocaeli", "Gaziantep", "Konya", "Mersin"];

const SPECIALTIES: Record<ExpertCategoryId, string[][]> = {
  statik: [
    ["Karbon lif güçlendirme", "Perde takviyesi"],
    ["Yumuşak kat analizi", "Mikro modelleme"],
    ["Yığma bina güçlendirme", "Sıvama"],
    ["Temel iyileştirme", "Zemin etüdü"],
    ["Hasar tespit", "Performans analizi"],
  ],
  imar: [
    ["Kentsel dönüşüm", "Parsel birleştirme"],
    ["Ruhsat ihyası", "İskan"],
    ["İmar planı yorumu", "Emsal"],
    ["Sit alanı", "Koruma"],
    ["Kat irtifakı", "Arsa payı"],
  ],
  sigorta: [
    ["DASK yenileme", "Eksper koordinasyonu"],
    ["Konut poliçesi", "Makine kırılması"],
    ["Hasar dosyası", "Tazminat süreci"],
    ["Ticari risk", "İşyeri"],
    ["Ferdi kaza", "Ek teminat"],
  ],
  hukuk: [
    ["Ortak alan uyuşmazlığı", "Kat malikleri"],
    ["Tahliye", "Kira"],
    ["Tapu iptali", "Şerh"],
    ["Müteahhit sözleşmesi", "Garanti"],
    ["Sigorta davası", "Tazminat"],
  ],
  psikoloji: [
    ["Travma sonrası", "Aile terapisi"],
    ["Çocuk ve ergen", "Okul uyumu"],
    ["Grup destek", "Kurumsal EAP"],
    ["Uyku ve kaygı", "Stres yönetimi"],
    ["Yaşlı bakım", "Bakıcı desteği"],
  ],
  "afet-koordinator": [
    ["Kurumsal tatbikat", "Senaryo yazımı"],
    ["Toplanma alanı", "Lojistik"],
    ["Bina tahliye planı", "Asansör prosedürü"],
    ["İletişim krizi", "Medya"],
    ["Tedarik zinciri", "Acil stok"],
  ],
};

const TITLES: Record<ExpertCategoryId, string[]> = {
  statik: ["İnşaat Mühendisi", "Yapı Mühendisi", "Statik Proje Mühendisi"],
  imar: ["Şehir Plancısı", "İmar Uzmanı", "Mimar"],
  sigorta: ["Sigorta Eksperi", "Risk Danışmanı", "Hasar Uzmanı"],
  hukuk: ["Avukat", "Hukuk Danışmanı"],
  psikoloji: ["Klinik Psikolog", "Psikolojik Danışman"],
  "afet-koordinator": ["Afet Yönetimi Uzmanı", "İSG Uzmanı", "Kriz Koordinatörü"],
};

function buildExpertsForCategory(categoryId: ExpertCategoryId, count: number): ExpertProfile[] {
  const specs = SPECIALTIES[categoryId];
  const titles = TITLES[categoryId];
  return Array.from({ length: count }, (_, i) => {
    const seed = categoryId.length * 100 + i * 17;
    const name = `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`;
    const city = CITIES[(seed + i) % CITIES.length]!;
    const experienceYears = 5 + ((seed + i * 2) % 22);
    const rating = Math.round((4.2 + ((seed + i) % 8) * 0.1) * 10) / 10;
    const reviewCount = 12 + ((seed + i * 5) % 180);
    const day = 1 + (i % 12);
    const hour = 9 + (i % 6);
    return {
      id: `exp-${categoryId}-${String(i + 1).padStart(2, "0")}`,
      categoryId,
      name,
      title: titles[i % titles.length]!,
      city,
      experienceYears,
      rating: Math.min(5, rating),
      reviewCount,
      languages: i % 4 === 0 ? ["Türkçe", "İngilizce"] : ["Türkçe"],
      specialties: specs[i % specs.length]!,
      nextSlot: `${day} gün sonra ${hour}:00`,
      feeBand: experienceYears > 15 ? "1.800 – 2.400 TL" : experienceYears > 8 ? "1.200 – 1.700 TL" : "850 – 1.150 TL",
      licensed: i % 9 !== 0,
    };
  });
}

const COUNTS: Record<ExpertCategoryId, number> = {
  statik: 18,
  imar: 16,
  sigorta: 17,
  hukuk: 15,
  psikoloji: 16,
  "afet-koordinator": 18,
};

export const ALL_EXPERTS: ExpertProfile[] = EXPERT_CATEGORIES.flatMap((c) => buildExpertsForCategory(c.id, COUNTS[c.id]));

export function expertsByCategory(categoryId: ExpertCategoryId): ExpertProfile[] {
  return ALL_EXPERTS.filter((e) => e.categoryId === categoryId);
}

export function filterExperts(
  categoryId: ExpertCategoryId,
  opts: { city?: string; licensedOnly?: boolean; minRating?: number; query?: string },
): ExpertProfile[] {
  const q = (opts.query ?? "").trim().toLocaleLowerCase("tr-TR");
  return expertsByCategory(categoryId).filter((e) => {
    if (opts.city && opts.city !== "all" && e.city !== opts.city) return false;
    if (opts.licensedOnly && !e.licensed) return false;
    if (opts.minRating && e.rating < opts.minRating) return false;
    if (!q) return true;
    const hay = `${e.name} ${e.title} ${e.city} ${e.specialties.join(" ")}`.toLocaleLowerCase("tr-TR");
    return hay.includes(q);
  });
}
