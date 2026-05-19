import { calculateEarthquakeScore } from "@/lib/scoring/earthquakeEngine";
import type { PropertyRecord } from "@/types/property";

export interface EarthquakeNarrative {
  paragraphs: [string, string, string, string, string];
}

function trCity(city: string | undefined): string {
  return city?.trim() || "Belirtilen il";
}

/** Demo metin: ilanin deprem skoru ve afet alanlarindan bes paragraflik ozet. */
export function generateEarthquakeNarrative(property: PropertyRecord): EarthquakeNarrative {
  const score = property.earthquakeScore ?? calculateEarthquakeScore(property);
  const d = property.disaster;
  const city = trCity(property.city);
  const band = score.band;
  const total = Math.round(score.totalScore);
  const soil = d?.soil.zeminSinifiTbdly ?? "—";
  const faultKm = d?.fault.distanceToFaultKm ?? null;
  const faultName = d?.fault.nearestFaultNameTr ?? "referans fay projeksiyonu";
  const pga = d?.fault.afadDesignPgaG ?? null;

  const p0 = `${city} konumlu bu ilan icin birlestirilmis deprem dayaniklilik endeksi ${total}/100 ve band ${band} olarak hesaplanmistir. Bu demo skor; fay mesafesi, zemin sinifi, tasiyici sistem, yas, hasar gecmisi, guclendirme, komsu riski, acil durum, sigorta, toplumsal hazirlik, belge uyumu ve bolgesel YZ sinyalleri agirlikli olarak birlestirilir.`;
  const p1 = `Konumsal katman: ${faultName} ile kok mesafe yaklasik ${faultKm != null ? `${faultKm} km` : "bilinmiyor"} ve tasarim PGA ${pga != null ? `${pga} g` : "tahmini profil"} araliginda modellenmistir. Zemin sinifi TBDY cercevesinde ${soil} olarak tohumlanmistir; svisslasma ve Fa parametreleri alt skorda yansitilir.`;
  const p2 = `Yapi envanteri: insaat yili ${d?.structural.yearOfConstruction ?? "tahmini"}, tasiyici tip ${d?.structural.structuralSystemType ?? "betonarme"}, Hummer sinifi ${d?.structural.hammerEarthquakeClass ?? property.earthquakeClass ?? "—"} ve yumusak kat / duzensizlik gostergeleri yapisal alt skoru olusturur. Mevcut veya planlanan guclendirme adimlari toplam profili yukari ceker.`;
  const p3 = `Operasyonel direnc: toplanma alani erisim mesafesi, su rezervi, DASK ve tamamlayici poliseler ile mahalle olceginde gonulluluk ve altyapi yedekliligi finansal ve lojistik sok dayanikliligini destekler. Belge seti (iskan, performans raporu, periyodik denetim) uyum ve denetlenebilirligi artirir.`;
  const p4 = `Sonuc: ${band} bandi, ilanin deprem stresi altindaki nispi guvenlik ve toparlanma kapasitesinin ozet etiketidir; resmi zemin etudu, performans analizi veya belediye kayitlari yerine gecmez. Detayli kiririm ${score.breakdown.length} alt skor satirinda formulleriyle birlikte tutulur.`;

  return { paragraphs: [p0, p1, p2, p3, p4] };
}
