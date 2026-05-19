export type ExpertCategoryId =
  | "insaat-muhendisi"
  | "jeoloji-muhendisi"
  | "mimar"
  | "spk-ekspertiz"
  | "sigorta-brokeri"
  | "avukat"
  | "psikolog"
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
  chamberNo: string;
  city: string;
  experienceYears: number;
  completedJobs: number;
  rating: number;
  reviewCount: number;
  languages: string[];
  specialties: string[];
  hourlyRateMin: number;
  hourlyRateMax: number;
  availableSlotsThisWeek: string[];
  licensed: boolean;
}

export const EXPERT_CATEGORIES: ExpertCategory[] = [
  {
    id: "insaat-muhendisi",
    label: "Insaat muhendisi (statik)",
    description: "Tasiyici sistem, performans analizi, guclendirme projesi ve saha denetimi.",
  },
  {
    id: "jeoloji-muhendisi",
    label: "Jeoloji muhendisi (zemin)",
    description: "Zemin etudu, mikro bolgeleme, sivilasma ve temel tasarim danismanligi.",
  },
  {
    id: "mimar",
    label: "Mimar (proje)",
    description: "Ruhsat, mimari proje, kentsel donusum uyumu ve uygulama koordinasyonu.",
  },
  {
    id: "spk-ekspertiz",
    label: "SPK ekspertiz uzmani",
    description: "Gayrimenkul degerleme, hasar sonrasi ekspertiz ve raporlama.",
  },
  {
    id: "sigorta-brokeri",
    label: "Sigorta brokeri",
    description: "DASK, konut ve deprem teminatlari, hasar dosyasi koordinasyonu.",
  },
  {
    id: "avukat",
    label: "Avukat (gayrimenkul + afet)",
    description: "Kat mulkiyeti, tahliye, sigorta ve kentsel donusum sozlesmeleri.",
  },
  {
    id: "psikolog",
    label: "Psikolog (afet sonrasi travma)",
    description: "Travma sonrasi aile ve cocuk destek programlari.",
  },
  {
    id: "afet-koordinator",
    label: "Afet koordinatoru (kurumsal hazirlik)",
    description: "Kurumsal tatbikat, acil plan, toplanma alani ve kriz yonetimi.",
  },
];

const FIRST = [
  "Ayse", "Mehmet", "Zeynep", "Can", "Elif", "Burak", "Selin", "Emre", "Deniz", "Kerem",
  "Merve", "Oguz", "Ece", "Baris", "Cem", "Gul", "Hakan", "Irem", "Kaan", "Lale",
];
const LAST = [
  "Yilmaz", "Kaya", "Demir", "Celik", "Sahin", "Aydin", "Ozturk", "Arslan", "Koc", "Polat",
  "Aksoy", "Erdogan", "Gunes", "Kurt", "Aslan", "Tekin", "Bulut", "Sari", "Tas", "Ozkan",
];
const CITIES = ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Kocaeli", "Gaziantep", "Konya", "Mersin"];

const CHAMBER_PREFIX: Record<ExpertCategoryId, string> = {
  "insaat-muhendisi": "IMO",
  "jeoloji-muhendisi": "JMO",
  mimar: "TMMOB",
  "spk-ekspertiz": "SPK",
  "sigorta-brokeri": "SEDDK",
  avukat: "TBB",
  psikolog: "TPD",
  "afet-koordinator": "AFAD",
};

const SPECIALTIES: Record<ExpertCategoryId, string[][]> = {
  "insaat-muhendisi": [
    ["Karbon lif guclendirme", "Perde takviyesi"],
    ["Yumusak kat analizi", "Performans degerlendirme"],
    ["Yigma bina guclendirme", "Sivama"],
    ["Temel-perde baglantisi", "Hasar tespit"],
  ],
  "jeoloji-muhendisi": [
    ["Mikro bolgeleme", "Vs30"],
    ["Sivilasma riski", "Dolgu zemin"],
    ["Heyelan analizi", "Sondaj yorumu"],
    ["Zemin sinifi", "TBDY raporu"],
  ],
  mimar: [
    ["Kentsel donusum projesi", "Ruhsat"],
    ["Restorasyon", "Koruma"],
    ["Kat irtifaki", "Uygulama denetimi"],
    ["Emsal hesabi", "Cephe cozumu"],
  ],
  "spk-ekspertiz": [
    ["Konut ekspertizi", "Ticari gayrimenkul"],
    ["Hasar sonrasi deger", "Sigorta raporu"],
    ["Arsa degerleme", "Gelir yaklasimi"],
    ["SPK lisansli rapor", "Karsilastirmali analiz"],
  ],
  "sigorta-brokeri": [
    ["DASK yenileme", "Konut paketi"],
    ["Hasar dosyasi", "Eksper koordinasyonu"],
    ["Isyeri deprem", "Makine kirilmasi"],
    ["Teminat karsilastirma", "Prim optimizasyonu"],
  ],
  avukat: [
    ["Kat malikleri kurulu", "Tahliye"],
    ["Muteahhit sozlesmesi", "Tapu"],
    ["Sigorta davasi", "Kentsel donusum"],
    ["Ortak alan", "Garanti ihtiyati"],
  ],
  psikolog: [
    ["Travma sonrasi", "Aile terapisi"],
    ["Cocuk ve ergen", "Okul uyumu"],
    ["Grup destek", "Kurumsal EAP"],
    ["Uyku ve kaygi", "Stres yonetimi"],
  ],
  "afet-koordinator": [
    ["Kurumsal tatbikat", "Senaryo yazimi"],
    ["Toplanma alani", "Lojistik"],
    ["Bina tahliye plani", "Kriz masasi"],
    ["Tedarik zinciri", "Acil stok"],
  ],
};

const TITLES: Record<ExpertCategoryId, string[]> = {
  "insaat-muhendisi": ["Insaat Muhendisi", "Statik Proje Muhendisi", "Yapi Muhendisi"],
  "jeoloji-muhendisi": ["Jeoloji Muhendisi", "Jeoteknik Uzman", "Zemin Etudu Muhendisi"],
  mimar: ["Mimar", "Proje Mimari", "Restorasyon Mimari"],
  "spk-ekspertiz": ["SPK Lisansli Ekspertiz Uzmani", "Gayrimenkul Degerleme Uzmani"],
  "sigorta-brokeri": ["Sigorta Brokeri", "Risk Danismani", "Hasar Uzmani"],
  avukat: ["Avukat", "Gayrimenkul Avukati"],
  psikolog: ["Klinik Psikolog", "Psikolojik Danisman"],
  "afet-koordinator": ["Afet Yonetimi Uzmani", "Kriz Koordinatoru", "ISG Uzmani"],
};

const SLOT_POOL = ["Pzt 09:00", "Pzt 14:00", "Sal 10:30", "Sal 16:00", "Car 11:00", "Per 09:30", "Cum 15:00"];

function buildExpertsForCategory(categoryId: ExpertCategoryId, count: number): ExpertProfile[] {
  const specs = SPECIALTIES[categoryId];
  const titles = TITLES[categoryId];
  return Array.from({ length: count }, (_, i) => {
    const seed = categoryId.length * 100 + i * 17;
    const name = `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`;
    const city = CITIES[(seed + i) % CITIES.length]!;
    const experienceYears = 5 + ((seed + i * 2) % 22);
    const completedJobs = 40 + ((seed + i * 7) % 320);
    const rating = Math.round((4.2 + ((seed + i) % 8) * 0.1) * 10) / 10;
    const reviewCount = 12 + ((seed + i * 5) % 180);
    const hourlyBase = experienceYears > 15 ? 1800 : experienceYears > 8 ? 1200 : 850;
    const hourlyMax = hourlyBase + 400 + (i % 3) * 100;
    const slotCount = 2 + (i % 3);
    const slots = Array.from({ length: slotCount }, (_, s) => SLOT_POOL[(i + s) % SLOT_POOL.length]!);
    return {
      id: `exp-${categoryId}-${String(i + 1).padStart(2, "0")}`,
      categoryId,
      name,
      title: titles[i % titles.length]!,
      chamberNo: `${CHAMBER_PREFIX[categoryId]}-${city.slice(0, 3).toUpperCase()}-${10000 + seed + i}`,
      city,
      experienceYears,
      completedJobs,
      rating: Math.min(5, rating),
      reviewCount,
      languages: i % 4 === 0 ? ["Turkce", "Ingilizce"] : ["Turkce"],
      specialties: specs[i % specs.length]!,
      hourlyRateMin: hourlyBase,
      hourlyRateMax: hourlyMax,
      availableSlotsThisWeek: slots,
      licensed: i % 9 !== 0,
    };
  });
}

const COUNTS: Record<ExpertCategoryId, number> = {
  "insaat-muhendisi": 13,
  "jeoloji-muhendisi": 12,
  mimar: 13,
  "spk-ekspertiz": 12,
  "sigorta-brokeri": 13,
  avukat: 12,
  psikolog: 13,
  "afet-koordinator": 12,
};

export const ALL_EXPERTS: ExpertProfile[] = EXPERT_CATEGORIES.flatMap((c) =>
  buildExpertsForCategory(c.id, COUNTS[c.id]),
);

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

export function expertInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function hourlyRateLabel(e: ExpertProfile): string {
  return `${e.hourlyRateMin.toLocaleString("tr-TR")} – ${e.hourlyRateMax.toLocaleString("tr-TR")} TL/saat`;
}
