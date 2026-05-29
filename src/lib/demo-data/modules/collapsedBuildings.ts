export type CollapseEventYear = 1999 | 2011 | 2020 | 2023;

export interface CollapsedBuildingRecord {
  id: string;
  eventYear: CollapseEventYear;
  city: string;
  district: string;
  neighborhood: string;
  buildingName: string;
  floors: number;
  units: number;
  collapseMode: "tam" | "kismi" | "cokme-tehlikesi";
  casualties: number;
  contractor: string;
  inspectionFirm: string;
  permitYear: number;
  structuralSystem: string;
  notes: string;
}

const CITIES = [
  { city: "İstanbul", districts: ["Kadıköy", "Üsküdar", "Maltepe", "Avcılar", "Bakırköy", "Kartal"] },
  { city: "İzmit", districts: ["İzmit", "Gölcük", "Kartepe", "Derince"] },
  { city: "Adapazarı", districts: ["Serdivan", "Erenler", "Adapazarı"] },
  { city: "Van", districts: ["Merkez", "Erciş", "Edremit"] },
  { city: "Elazığ", districts: ["Merkez", "Sivrice", "Palu"] },
  { city: "Hatay", districts: ["Antakya", "Defne", "İskenderun", "Samandağ"] },
  { city: "Kahramanmaraş", districts: ["Oniki Şubat", "Dulkadiroğlu", "Elbistan"] },
  { city: "Gaziantep", districts: ["Şahinbey", "Şehitkamil", "Nizip"] },
  { city: "Malatya", districts: ["Battalgazi", "Yeşilyurt", "Akçadağ"] },
  { city: "Düzce", districts: ["Merkez", "Akçakoca", "Gölyaka"] },
] as const;

const CONTRACTORS = [
  "Yıldırım İnşaat A.Ş.",
  "Marmara Yapı Grup",
  "Anadolu Taahhüt",
  "Kuzey Beton Sanayi",
  "Ege Konut Üretim",
  "Akdeniz Müteahhitlik",
  "Doğu Yapı Sistemleri",
  "Merkez Kentsel Dönüşüm",
  "Boğaziçi Yapı Teknik",
  "Çukurova İnşaat",
  "Karadeniz Yapı",
  "Güney Şehircilik",
  "Atlas Mühendislik İnşaat",
  "Nova Yapı Çözümleri",
  "Seta Taahhüt",
] as const;

const INSPECTORS = [
  "İstanbul Teknik Denetim",
  "BETA Yapı Denetim",
  "Sigma Statik Kontrol",
  "Anadolu Yapı Denetim",
  "Güven Yapı Müşavirlik",
  "Delta Mühendislik Denetim",
  "Epsilon Statik",
  "Omega Yapı Kontrol",
  "Prime Denetim Hizmetleri",
  "Ulusal Yapı Denetim",
] as const;

const MODES: CollapsedBuildingRecord["collapseMode"][] = ["tam", "kismi", "cokme-tehlikesi"];
const SYSTEMS = ["Betonarme çerçeve", "Yığma", "Prefabrik beton", "Karma sistem", "Çelik çerçeve"];

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length]!;
}

function buildRecord(index: number, eventYear: CollapseEventYear): CollapsedBuildingRecord {
  const loc = pick(CITIES, index * 7 + eventYear);
  const district = pick(loc.districts, index * 3);
  const floors = 4 + (index % 9);
  const units = floors * (2 + (index % 4));
  const mode = pick(MODES, index + eventYear);
  const casualties =
    mode === "tam" ? (eventYear === 2023 ? 8 + (index % 40) : 2 + (index % 18)) : mode === "kismi" ? index % 5 : 0;

  return {
    id: `yb-${eventYear}-${String(index + 1).padStart(3, "0")}`,
    eventYear,
    city: loc.city,
    district,
    neighborhood: `${district} Mah. ${100 + (index % 80)}. Sok.`,
    buildingName: `${district} Sitesi Blok ${String.fromCharCode(65 + (index % 6))}`,
    floors,
    units,
    collapseMode: mode,
    casualties,
    contractor: pick(CONTRACTORS, index * 11),
    inspectionFirm: pick(INSPECTORS, index * 13),
    permitYear: eventYear === 1999 ? 1988 + (index % 8) : eventYear - (3 + (index % 6)),
    structuralSystem: pick(SYSTEMS, index),
    notes:
      eventYear === 1999
        ? "17 Ağustos depremi sonrası yıkım kararı; zemin ve yumuşak kat etkisi raporlarda öne çıkmıştır."
        : eventYear === 2011
          ? "Van depremleri; kısa periyotlu ivme ve yığma-duvar etkileşimi kayıtlara geçmiştir."
          : eventYear === 2020
            ? "Elazığ-Sivrice; sığ derinlik ve yerel amplifikasyon vurgulanmıştır."
            : "6 Şubat depremleri; bindirme kirişi ve kolon-kiriş birleşim detayları inceleme konusudur.",
  };
}

const y1999 = Array.from({ length: 20 }, (_, i) => buildRecord(i, 1999));
const y2011 = Array.from({ length: 10 }, (_, i) => buildRecord(20 + i, 2011));
const y2020 = Array.from({ length: 10 }, (_, i) => buildRecord(30 + i, 2020));
const y2023 = Array.from({ length: 10 }, (_, i) => buildRecord(40 + i, 2023));

export const COLLAPSED_BUILDINGS: CollapsedBuildingRecord[] = [...y1999, ...y2011, ...y2020, ...y2023];

export const COLLAPSE_YEAR_COUNTS: Record<CollapseEventYear, number> = {
  1999: 20,
  2011: 10,
  2020: 10,
  2023: 10,
};

export function filterCollapsedBuildings(opts: {
  eventYear?: CollapseEventYear | "all";
  city?: string;
  contractor?: string;
  inspectionFirm?: string;
  query?: string;
}): CollapsedBuildingRecord[] {
  const q = (opts.query ?? "").trim().toLocaleLowerCase("tr-TR");
  return COLLAPSED_BUILDINGS.filter((r) => {
    if (opts.eventYear && opts.eventYear !== "all" && r.eventYear !== opts.eventYear) return false;
    if (opts.city && opts.city !== "all" && r.city !== opts.city) return false;
    if (opts.contractor && opts.contractor !== "all" && r.contractor !== opts.contractor) return false;
    if (opts.inspectionFirm && opts.inspectionFirm !== "all" && r.inspectionFirm !== opts.inspectionFirm) return false;
    if (!q) return true;
    const hay = `${r.buildingName} ${r.city} ${r.district} ${r.contractor} ${r.inspectionFirm}`.toLocaleLowerCase("tr-TR");
    return hay.includes(q);
  });
}

export const UNIQUE_CITIES = [...new Set(COLLAPSED_BUILDINGS.map((r) => r.city))].sort((a, b) => a.localeCompare(b, "tr"));
export const UNIQUE_CONTRACTORS = [...new Set(COLLAPSED_BUILDINGS.map((r) => r.contractor))].sort((a, b) =>
  a.localeCompare(b, "tr"),
);
export const UNIQUE_INSPECTORS = [...new Set(COLLAPSED_BUILDINGS.map((r) => r.inspectionFirm))].sort((a, b) =>
  a.localeCompare(b, "tr"),
);
