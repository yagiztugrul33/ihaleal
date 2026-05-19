import type { PropertyRecord } from "@/types/property";
import type {
  EarthquakeBand,
  EarthquakeFacets,
  EarthquakeScorePayload,
  EarthquakeSubScore,
} from "@/types/property/earthquake";

export type { EarthquakeFacets, EarthquakeScorePayload, EarthquakeSubScore };

const WEIGHTS: Record<string, number> = {
  fay_mesafe: 11,
  zemin_sinifi: 11,
  yapi_sinifi: 13,
  kat_performansi: 7,
  bina_yasi: 10,
  baglantilar_bakim: 6,
  yuzey_hasar: 7,
  guclendirme: 10,
  toplanma_erisim: 6,
  acil_cikis: 6,
  yangin_hatlar: 7,
  sigorta_dask: 6,
};

function stableHash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rnd01(seed: number, i: number): number {
  const x = Math.imul(seed + i * 73856093 + 19349663, seed + i) >>> 0;
  return (x % 10000) / 10000;
}

function clampScore(n: number): number {
  return Math.round(Math.min(100, Math.max(0, n)));
}

export function compositeBand(composite: number): { band: EarthquakeBand; label: string } {
  if (composite < 36) return { band: "critical", label: "Kritik dikkat" };
  if (composite < 55) return { band: "low", label: "Dusuk segment" };
  if (composite < 71) return { band: "moderate", label: "Orta segment" };
  if (composite < 86) return { band: "good", label: "Iyi segment" };
  return { band: "excellent", label: "Cok guvenli gorunus" };
}

function hazard(seed: number, city?: string): EarthquakeFacets["regionalHazard"] {
  const lc = city?.toLowerCase() ?? "";
  if (/istanbul|düzce|sakarya|tekird/.test(lc)) return seed % 3 === 0 ? "orta" : "yuksek";
  if (/ankara/.test(lc)) return seed % 2 === 0 ? "orta" : "yuksek";
  if (/izmir|antalya|bodrum|cesme/.test(lc)) return seed % 4 === 0 ? "orta" : "dusuk";
  return seed % 5 === 0 ? "dusuk" : seed % 2 === 0 ? "orta" : "yuksek";
}

function floorRel(property: PropertyRecord, seed: number): { label: string; rel: number } {
  const f = property.floor?.trim().toLowerCase() ?? "";
  if (/^\d+$/.test(f)) {
    const n = Number(f);
    const tf = property.totalFloors && property.totalFloors > 0 ? property.totalFloors : 12;
    return { label: `${n}. kat`, rel: Math.min(n / tf, 1.2) };
  }
  if (/zemin|bodrum/i.test(f)) return { label: property.floor ?? "zemin", rel: 0.05 };
  if (/cati|çati|roof/i.test(f)) return { label: property.floor ?? "cati", rel: 1.05 };
  const h = (seed % 8) / 10;
  return { label: property.floor ?? "-", rel: Math.min(0.2 + h, 1) };
}

function parseAgeYears(age?: string, seed = 0): { years: number; band: EarthquakeFacets["buildingAgeBand"] } {
  const m = age?.match(/(\d{1,3})/);
  const years = m ? Number(m[1]) : 28 + (seed % 42);
  if (years <= 15) return { years, band: "yeni" };
  if (years <= 35) return { years, band: "orta" };
  return { years, band: "eski" };
}

function seismicGuess(cls?: string, seed = 0): EarthquakeFacets["seismicClassGuess"] {
  const up = cls?.toUpperCase() ?? "";
  if (/A\+|(^A|SINIFI)/i.test(up) || /A\s*\+/.test(cls ?? "")) return "a_sinifi";
  if (/\bB\b/.test(up) && !/[CD]/.test(up)) return "b_sinifi";
  if (/C|Ç|D|E/.test(up)) return "c_sinifi";
  if (seed % 9 === 0) return "a_sinifi";
  if (seed % 9 < 5) return "b_sinifi";
  return seed % 17 === 0 ? "bilinmiyor" : "c_sinifi";
}

function dmgFromAi(flags?: string[]): EarthquakeFacets["damageVisible"] | undefined {
  const s = (flags ?? []).join(" ").toLowerCase();
  if (!s) return undefined;
  if (/catlak|hasar|çatlak|risk/i.test(s)) return "orta";
  if (/bakim|onarim/i.test(s)) return "hafif";
  return undefined;
}

function subScores(
  p: PropertyRecord,
  facets: EarthquakeFacets,
  scores: Record<string, number>
): EarthquakeSubScore[] {
  const mk = (
    id: string,
    label: string,
    weight: number,
    inputs: { label: string; value: string }[],
    formula: string,
    explanation: string,
    tips: string[]
  ): EarthquakeSubScore => ({
    id,
    label,
    weight,
    score: clampScore(scores[id] ?? 0),
    inputs,
    formula,
    explanation,
    improvementTips: tips,
  });

  const soilLbl =
    facets.soilBand === "kayalik"
      ? "Kayalik / sert"
      : facets.soilBand === "siki_kill"
        ? "Siki kil benzeri"
        : facets.soilBand === "gevsek"
          ? "Gevsek"
          : "Dolgu / zayif sikisma";

  return [
    mk(
      "fay_mesafe",
      "Fay yakinligi",
      WEIGHTS.fay_mesafe,
      [
        { label: "Yaklasik uzaklık", value: `${facets.faultDistanceKm.toFixed(1)} km` },
        {
          label: "Koordinat",
          value:
            typeof p.latitude === "number" && typeof p.longitude === "number"
              ? `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`
              : p.city ?? "-",
        },
      ],
      "Puan = 100 − min(mesafe,120)/120 × 85 (demo)",
      "Fay yakınlığı arttıkça risk artar; değer gösterim için MTA/mock hatları kullanılır.",
      ["Resmi fay görünüm haritalarıyla teyit edin.", "Ekspertiz raporunda yakınlık notu talep edin."]
    ),
    mk(
      "zemin_sinifi",
      "Zemin davranisi",
      WEIGHTS.zemin_sinifi,
      [
        { label: "Demo zemin grubu", value: soilLbl },
        { label: "Likuifaksiyon uyarısı", value: facets.liquefactionFlag ? "Evet" : "Hayir" },
      ],
      "Puan sabit şablondan; dolgu gevşekte düşüş uygulanır.",
      "Likuifaksiyon bekleniyorsa perde-duvar dizilimi daha kritiktir.",
      ["Geoteknik etüt özetini isteyin.", "Tarihsel dere yatağı araştırması yapın."]
    ),
    mk(
      "yapi_sinifi",
      "Yapi sinifi",
      WEIGHTS.yapi_sinifi,
      [
        { label: "Ilandaki sinif", value: p.earthquakeClass ?? "Belirtilmedi" },
        { label: "Model tahmini", value: facets.seismicClassGuess },
      ],
      "Puan yapı güvenilirliği sınıfına göre ağırlıklandırıldı.",
      "Listedeki düşük güvenilirlik çıktılarını mutlaka resmi tasarımla karşılaştırın.",
      ["Statik/deprem uygun projesini doğrulanmış kabul edin.", "Kentsel dönüşüm tarihçesini görün."]
    ),
    mk(
      "kat_performansi",
      "Kat davranisi",
      WEIGHTS.kat_performansi,
      [
        { label: "Kat", value: p.floor ?? "-" },
        { label: "Dikey risk bandı", value: facets.verticalRisk },
        { label: "Yumusak kat riski", value: facets.softStoryFlag ? "Evet" : "Hayir" },
      ],
      "Ust kata göre tepki yükselişi küçültüldü/yükseltildi.",
      "Yüksek blok + üst kat kombinasyonu çekirdek ve perde uyumunu vurgular.",
      ["Kat planı ve çıkış yollarının ölçüsünü site yönetiminden doğrulayın."]
    ),
    mk(
      "bina_yasi",
      "Bina yasi riski",
      WEIGHTS.bina_yasi,
      [
        { label: "Ilandaki yaş", value: p.buildingAge ?? "Ornek" },
        { label: "Bant", value: facets.buildingAgeBand },
      ],
      "Yaş doğrusal ceza + yeni ise bonus.",
      "Eski yapı stoku güçlendirme ve uygun güncellemeden etkilenir.",
      ["Iskan ve ruhsat tarihleriyle doğrulanacak yaş aralığını kıyaslayın."]
    ),
    mk(
      "baglantilar_bakim",
      "Bakim baglantılar",
      WEIGHTS.baglantilar_bakim,
      [
        { label: "Bina yaşi", value: p.buildingAge ?? "-" },
        { label: "Hasar özeti", value: facets.damageVisible },
      ],
      "Yaşlı ve hasarlı gözükmelerde bağlantı puan düşüşü.",
      "Kullanılmış malzeme ve bakım çıktılarını yüz yüze kontrol gerektirir.",
      ["Bakım onarım defterleri ve blok loglarını görün."]
    ),
    mk(
      "yuzey_hasar",
      "Yuzeysel hasar görünümü",
      WEIGHTS.yuzey_hasar,
      [{ label: "Gözlem", value: facets.damageVisible }],
      "Harici çatlak/oturmadan çıkan ceza göstergesi.",
      "Hasar bildirilirse yüz yüze kontrol çıktılarını gerektirir.",
      ["Ekspertizi foto ile desteklemeyi düşünün."]
    ),
    mk(
      "guclendirme",
      "Guclendirme",
      WEIGHTS.guclendirme,
      [{ label: "Durum", value: facets.reinforcement }],
      "Tam güçlendirme > kısmen > bildirilen yok sıralaması.",
      "Belgelenmemiş çıktılar puan yükseltmez.",
      ["Uygun güçlendirme projesi ve denetimi talep edin."]
    ),
    mk(
      "toplanma_erisim",
      "Toplanma alanı erişimi",
      WEIGHTS.toplanma_erisim,
      [{ label: "Yaklasik yuruyus (dk)", value: String(facets.assemblyWalkMinutes) }],
      "Dakika arttıkça puan eksilir.",
      "AFAD/mock toplanma noktası mesafesi yürüyüş hızına göre senaryolandı.",
      ["Gece ve yağmurda güzergah süresini kendiniz test edin."]
    ),
    mk(
      "acil_cikis",
      "Acil cikıs",
      WEIGHTS.acil_cikis,
      [{ label: "Ilanda bildirilmiş", value: p.emergencyExit == null ? "?" : p.emergencyExit ? "Evet" : "Hayır" }],
      "Bildirilen acil çıkış var ise artı puan.",
      "Resmi blok planları ile teyitleşmelidir.",
      ["Yangın ve deprem çıkış haritasını yöneticiden görün."]
    ),
    mk(
      "yangin_hatlar",
      "Yangin ve kritik altyapi",
      WEIGHTS.yangin_hatlar,
      [
        { label: "Sprinkler", value: p.sprinklerSystem ? "Var" : "Yok" },
        { label: "Yangin bolmesi", value: p.fireCompartment ? "Var" : "Yok" },
      ],
      "Sprinkler + kompartiman + varsa jeneratör bonusu.",
      "Yüksek bloklarda duman tahliyesi daha kritiktir.",
      ["Saha denetimi ve yangın uygun kontrol çıktılarını talep edin."]
    ),
    mk(
      "sigorta_dask",
      "DASK / teminat",
      WEIGHTS.sigorta_dask,
      [{ label: "Ilandaki DASK bildirimi", value: facets.daskLikelyKnown ? "Var" : "Yok/Bilinmiyor" }],
      "Bildirilen DASK +poliçe varlığı güvenilirlik puanına eklenir.",
      "Bolge risk bandı yükseldikçe poliçe olmaması daha sert düşüş getirir.",
      ["Poliçe özeti ile teyitleşin.", "Ek teminat ve bedel seçeneklerini karşılaştırın."]
    ),
  ];
}

export function calculateEarthquakeScore(property: PropertyRecord): EarthquakeScorePayload {
  const seed = stableHash(`${property.id}|${property.latitude ?? ""}|${property.longitude ?? ""}`);
  const soils: EarthquakeFacets["soilBand"][] = ["kayalik", "siki_kill", "gevsek", "dolgu"];
  const soilBand = soils[seed % soils.length];

  let faultKm = 14 + rnd01(seed, 1) * 18 - rnd01(seed, 2) * 12;
  if (typeof property.latitude === "number" && typeof property.longitude === "number") {
    faultKm = 11 + rnd01(seed, 3) * 25 - ((seed % 18) | 0) / 30;
  }
  faultKm = Math.round(Math.max(1.2, faultKm) * 10) / 10;

  const { years, band: ageBand } = parseAgeYears(property.buildingAge, seed);
  const { rel } = floorRel(property, seed);

  const vert: EarthquakeFacets["verticalRisk"] = rel > 0.9 ? "yuksek" : rel > 0.55 ? "orta" : "alcak";

  const reg = hazard(seed, property.city);
  const soft = !!(property.totalFloors && property.totalFloors > 6 && rel > 0.92);

  const reinf: EarthquakeFacets["reinforcement"] =
    property.aiRiskFlags?.some((f) => /guçlendir|guclendir/i.test(f.toLowerCase()))
      ? "kismen"
      : seed % 11 === 0
        ? "tamamlandi"
        : seed % 6 === 0
          ? "yok"
          : "bilinmiyor";

  const dmg: EarthquakeFacets["damageVisible"] =
    dmgFromAi(property.aiRiskFlags) ??
    (years > 52 && seed % 5 === 0 ? "hafif" : seed % 14 === 0 ? "orta" : "yok");

  const walkMin = clampScore(13 + seed % 32);
  const daskKnown = !!property.disasterInsurance;
  const liq = soilBand === "dolgu" || (soilBand === "gevsek" && seed % 4 === 0);

  const facets: EarthquakeFacets = {
    faultDistanceKm: faultKm,
    soilBand,
    buildingAgeBand: ageBand,
    seismicClassGuess: seismicGuess(property.earthquakeClass, seed),
    reinforcement: reinf,
    damageVisible: dmg,
    assemblyWalkMinutes: Math.max(6, Math.min(55, Math.round(walkMin))),
    daskLikelyKnown: daskKnown,
    verticalRisk: vert,
    regionalHazard: reg,
    softStoryFlag: soft,
    liquefactionFlag: liq,
  };

  const s: Record<string, number> = {
    fay_mesafe: clampScore(98 - faultKm * 0.82 + rnd01(seed, 4) * 5),
    zemin_sinifi:
      soilBand === "kayalik" ? 90 : soilBand === "siki_kill" ? 75 : soilBand === "gevsek" ? 55 : 39,
    yapi_sinifi:
      facets.seismicClassGuess === "a_sinifi"
        ? 92
        : facets.seismicClassGuess === "b_sinifi"
          ? 76
          : facets.seismicClassGuess === "c_sinifi"
            ? 52
            : 61,
    kat_performansi: clampScore(
      76 - (vert === "yuksek" ? 28 : vert === "orta" ? 14 : 4) - (soft ? 22 : 0)
    ),
    bina_yasi: clampScore(100 - Math.min(years * 2.55, 100) + (ageBand === "yeni" ? 26 : 0)),
    baglantilar_bakim: clampScore(82 - (years > 54 ? 16 : years > 32 ? 6 : 0) - (dmg !== "yok" ? 9 : 0)),
    yuzey_hasar:
      dmg === "yok"
        ? 92
        : dmg === "hafif"
          ? 66
          : dmg === "orta"
            ? 42
            : 58,
    guclendirme:
      reinf === "tamamlandi" ? 95 : reinf === "kismen" ? 70 : reinf === "yok" ? 44 : 59,
    toplanma_erisim: clampScore(100 - (facets.assemblyWalkMinutes / 55) * 72),
    acil_cikis:
      property.emergencyExit === true ? 88 : property.emergencyExit === false ? 48 : clampScore(64 + rnd01(seed, 5) * 8),
    yangin_hatlar: clampScore(
      (property.sprinklerSystem ? 14 : 0) + (property.fireCompartment ? 36 : 20) + (property.generator ? 8 : 0) + 40
    ),
    sigorta_dask: daskKnown ? 92 : reg === "yuksek" ? 30 : reg === "orta" ? 46 : 60,
  };

  let weighted = 0;
  let tw = 0;
  for (const [k, w] of Object.entries(WEIGHTS)) {
    weighted += (s[k] ?? 60) * w;
    tw += w;
  }
  let composite = weighted / tw;
  if (reg === "yuksek") composite -= 7;
  if (liq) composite -= 4;
  composite = clampScore(composite);

  const { band, label: bandLabelTR } = compositeBand(composite);

  return {
    composite,
    band,
    bandLabelTR,
    facets,
    subScores: subScores(property, facets, s),
    updatedAtDemo: new Date().toISOString().slice(0, 10),
  };
}

export function ensureEarthquakeScore(p: PropertyRecord): EarthquakeScorePayload {
  if (p.earthquakeScore?.subScores?.length) return p.earthquakeScore;
  return calculateEarthquakeScore(p);
}

export function generateEarthquakeNarrative(property: PropertyRecord, d: EarthquakeScorePayload): string[] {
  const city = property.city ?? "Bolge";
  const f = d.facets.faultDistanceKm.toFixed(1);

  const yasEtiketi =
    d.facets.buildingAgeBand === "yeni"
      ? "Genc yapı stoku için tipik model"
      : d.facets.buildingAgeBand === "orta"
        ? "Orta yas yapı için tipik model"
        : "Eski stok icin daha dikkatli model";

  const zem =
    d.facets.soilBand === "dolgu"
      ? "dolgu ve sıvılasma uyarıların yuksek görünebilecek zemin parametresi"
      : d.facets.soilBand === "gevsek"
        ? "gevşek zemin senaryosu"
        : d.facets.soilBand === "kayalik"
          ? "sert zemine yakın senaryosu"
          : "sıkı kil benzeri zemin scenaryosu";

  const reg =
    d.facets.regionalHazard === "dusuk"
      ? "Bolgesel deprem tehlikesi goreceli daha dusuk bant olarak modellendi."
      : d.facets.regionalHazard === "orta"
        ? "Bolgesel tehlike orta bantta goruldu; blok plani ve yapı davranışi belirginlesir."
        : "Bolgesel tehlike yüksek goruluyor; zemin etüdü ve yapi statiği daha kritik.";

  return [
    "Bu yazı ile puan goruntuler bilgilendirme amaci tasir ve resmi garanti olarak kullanilmamalıdır.",
    `${city} icin yaklasik ${f} km yakın/demo fay secimi ve ${zem} uygulanmıştır.`,
    `${yasEtiketi}: ${yearsFromBand(
      d.facets.buildingAgeBand,
      property.buildingAge
    )}, dikey tepki ${d.facets.verticalRisk}; yumusak kat riski ${d.facets.softStoryFlag ? "dikkat gerektiren" : "sinirlı"}.`,
    `${reg} Guclendirme durumu için ${describeReinf(d.facets.reinforcement)}.`,
    `${d.bandLabelTR}: bilesik puan yaklasik ${d.composite}/100. DASK bildiriminiz ${d.facets.daskLikelyKnown ? "olumlu yanstı" : "eksik ise teyit gerek"}; yakın toplanma alanı yürünüş yaklasik ${d.facets.assemblyWalkMinutes} dk kabul görmüş.`,
  ];
}

function yearsFromBand(band: EarthquakeFacets["buildingAgeBand"], age?: string): string {
  const m = age?.match(/(\d{1,3})/)?.[1];
  if (m) return `ilanda yaklasik ${m} yaş`;
  return band === "yeni"
    ? "yas bandı yeni"
    : band === "orta"
      ? "yas bandı orta"
      : band === "eski"
        ? "yas bandı eski"
        : "yas doğrulanmamış";
}

function describeReinf(r: EarthquakeFacets["reinforcement"]): string {
  switch (r) {
    case "tamamlandi":
      return "belgelenmiş güçlendirme olumlu puan yükseltir; belge teyiti gerekir";
    case "kismen":
      return "kısmi bildirimin detay doğrulanmalıdır";
    case "yok":
      return "bilgi yok; risk artabilir ve teyite ihtiyaç gösteriyoruz";
    default:
      return "bilgi bilinmiyor; doğrulanmamış başlangıç gerekir";
  }
}
