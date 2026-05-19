import type { PropertyRecord } from "@/types/property";
import type { NeighborhoodData } from "@/types/property/neighborhood";

function u32(s: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rf(s: string, salt: number): number {
  return u32(s, salt) / 4294967296;
}

function ri(s: string, salt: number, lo: number, hi: number): number {
  return Math.floor(lo + rf(s, salt) * (hi - lo + 1));
}

export function seedNeighborhoodForProperty(property: PropertyRecord): PropertyRecord {
  if (property.neighborhood) return property;
  const id = property.id;
  const cn = (property.city ?? "").toLocaleLowerCase("tr-TR");
  const dn = (property.district ?? "").toLocaleLowerCase("tr-TR");
  const isIst = cn.includes("istanbul");
  const isSisli = dn.includes("sisli") || dn.includes("besiktas") || dn.includes("beşiktaş");
  const isHatay = cn.includes("hatay");
  const isBodrum = cn.includes("bodrum");

  let walk = 62;
  let gelir = 42000;
  let asayis = 72;
  let pm25 = 28;
  let socio: NeighborhoodData["socioEconomicLevel"] = 3;

  if (isIst && isSisli) {
    walk = 88;
    gelir = 78000;
    asayis = 81;
    pm25 = 32;
    socio = 5;
  } else if (isHatay) {
    walk = 41;
    gelir = 28000;
    asayis = 58;
    pm25 = 38;
    socio = 2;
  } else if (isBodrum) {
    walk = 58;
    gelir = 52000;
    asayis = 76;
    pm25 = 22;
    socio = 4;
  }

  const neighborhood: NeighborhoodData = {
    crime: {
      hirsizlikOrani: ri(id, 1, 8, 45) / 10,
      gaspOrani: ri(id, 2, 1, 12) / 10,
      trafikKazasi: ri(id, 3, 5, 30),
      asayisSkoru: asayis,
    },
    education: {
      yakinOkullar: [
        { name: "Cumhuriyet Ilkokulu", type: "ilkokul", lgsScore: 72 + ri(id, 4, 0, 18), distanceKm: 0.4 + rf(id, 5) * 0.8 },
        { name: "Sehir Lisesi", type: "lise", yksPlacementPct: 55 + ri(id, 6, 0, 35), distanceKm: 1.2 + rf(id, 7) },
      ],
      kresErisim: ri(id, 8, 40, 95),
      universiteMesafe: 3 + rf(id, 9) * 12,
      ozelOkulOrani: ri(id, 10, 8, 42),
    },
    health: {
      yakinHastaneler: [
        { name: "Devlet EAH", kind: "kamu", emergencyQuality: 78, distanceKm: 1.5 + rf(id, 11) },
        { name: "Ozel Saglik", kind: "ozel", emergencyQuality: 86, distanceKm: 2.2 + rf(id, 12) },
      ],
      aileHekimi: rf(id, 13) > 0.2,
      eczaneSayisi: ri(id, 14, 2, 14),
      disKlinik: ri(id, 15, 1, 8),
    },
    transportation: {
      metroHat: isIst ? [{ name: "M2", stationKm: 0.3 + rf(id, 16) * 1.2 }] : [],
      metrobusMesafe: isIst ? 0.8 + rf(id, 17) * 2 : 99,
      otobusHat: ["42", "54T", "BK1"].slice(0, 1 + ri(id, 18, 0, 2)),
      trafikSikisiklik: [
        { hour: "08:00", congestionIndex: 72 + ri(id, 19, 0, 20) },
        { hour: "18:00", congestionIndex: 78 + ri(id, 20, 0, 18) },
      ],
      otoparkErisim: ri(id, 21, 35, 90),
      bisikletYolu: rf(id, 22) > 0.45,
      yurunebilir: walk,
    },
    lifeQuality: {
      parkM2PerKisi: 4 + rf(id, 23) * 12,
      havaKalitesiPm25: pm25,
      gurultuDb: 52 + ri(id, 24, 0, 18),
      kopekParki: rf(id, 25) > 0.35,
      cocukOyunAlani: rf(id, 26) > 0.4,
      cafeRestoranYogunluk: ri(id, 27, 20, 95),
      marketErisim: ri(id, 28, 50, 98),
    },
    demographics: {
      yasDagilimi: [
        { band: "0-14", pct: 16 + ri(id, 29, 0, 6) },
        { band: "15-34", pct: 28 + ri(id, 30, 0, 8) },
        { band: "35-54", pct: 32 + ri(id, 31, 0, 6) },
        { band: "55+", pct: 24 + ri(id, 32, 0, 8) },
      ],
      hanehalkBuyukluk: 2.6 + rf(id, 33) * 1.4,
      egitimSeviyesi: 62 + ri(id, 34, 0, 28),
      ortalamaGelir: gelir,
      yabanciOrani: ri(id, 35, 2, 18),
      eskiYeniKomsuOrani: 0.35 + rf(id, 36) * 0.4,
    },
    socioEconomicLevel: socio,
    jobOpportunityIndex: ri(id, 37, 45, 92),
    livingCostIndex: ri(id, 38, 55, 110),
    aiMahalleOzeti: isHatay
      ? "Deprem sonrasi yeniden insaat sureci devam eden bir mahalle profili; yurunebilirlik ve altyapi gecici olarak sinirli, uzun vadede planli kentsel donusumle toparlanma beklenir."
      : isIst && isSisli
        ? "Merkezi konum, yuksek yurunebilirlik ve guclu ulasim baglantilari ile calisan profesyoneller ve aileler icin cekici; yasam maliyeti sehir ortalamasinin uzerindedir."
        : isBodrum
          ? "Turizm sezonunda yogun, kis doneminde sakin bir ritim; hava kalitesi ve yesil alan erisimi iyi, konut stokunda mevsimsel fiyat dalgalanmasi belirgindir."
          : "Dengeli bir yerlesim profili; okul ve saglik erisimi orta-iyi bandinda, trafik yogunlugu saat dilimlerine gore degisir.",
    nearbyPoints: [
      { icon: "hospital", name: "Acil servis", distanceKm: 1.4, walkMin: 18 },
      { icon: "school", name: "Ilkokul", distanceKm: 0.5, walkMin: 7 },
      { icon: "market", name: "Market", distanceKm: 0.2, walkMin: 3 },
      { icon: "park", name: "Park", distanceKm: 0.6, walkMin: 8 },
      { icon: "metro", name: "Metro", distanceKm: 0.4, walkMin: 6 },
      { icon: "pharmacy", name: "Eczane", distanceKm: 0.3, walkMin: 4 },
      { icon: "fire", name: "Itfaiye", distanceKm: 2.1, walkMin: 26 },
      { icon: "afad", name: "AFAD birimi", distanceKm: 3.2, walkMin: 40 },
      { icon: "cafe", name: "Kafe/restoran", distanceKm: 0.15, walkMin: 2 },
      { icon: "bus", name: "Otobus duragi", distanceKm: 0.1, walkMin: 2 },
    ],
  };

  return { ...property, neighborhood };
}
