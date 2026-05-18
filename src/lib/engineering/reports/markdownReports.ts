import { compactIsoTimestamp } from "@/lib/dateCompact";
import type { GesEngineInputs, GesEngineResult } from "../ges/gesEngineFeasibility";
import type { ParcelInputs, ParcelFeasibilityResult } from "../parcel/parcelEngineFeasibility";

export function reportId(prefix: string): string {
  const t = compactIsoTimestamp();
  return `${prefix}-${t}`;
}

export function buildGesMarkdownReport(
  id: string,
  inputs: GesEngineInputs,
  result: GesEngineResult,
): string {
  const capexUsd =
    result.yearlyCashFlow[0] != null ? Math.abs(result.yearlyCashFlow[0]) : 0;
  const npmUsd = result.npmResult ?? 0;

  return `
# GES ÖN FİZİBİLİTE RAPORU
**Rapor ID:** ${id}
**Tarih:** ${new Date().toLocaleDateString("tr-TR")}

## 1. Girdiler ve Saha Parametreleri
- Toplam Arsa Alanı: ${inputs.totalAreaM2} m²
- Trafo Merkezine Mesafe: ${inputs.distanceToTrafoKm} km
- Yamaç Yönü (Aspect): ${inputs.slopeAspect}

## 2. Teknik Analiz ve Hesaplamalar
- Kullanılabilir Net Alan: ${result.usableAreaM2.toFixed(2)} m²
- Tahmini Panel Sayısı: ${result.panelCount} Adet (550Wp)
- DC Kurulu Güç Kapasitesi: ${result.dcCapacityKwp.toFixed(2)} kWp
- Yıllık Üretim Projeksiyonu: ${result.annualProductionKwh.toFixed(2)} kWh
- Kapasite Faktörü: %${result.capacityFactor.toFixed(2)}

## 3. Finansal Metrikler
- İlk Yatırım Tahmini (CAPEX): ${capexUsd.toLocaleString("tr-TR")} USD
- Yıllık Net Nakit Akışı: ${npmUsd.toLocaleString("tr-TR")} USD
- Amortisman Süresi (Payback): ${result.paybackYear.toFixed(1)} Yıl
- LCOE (Elektrik Seviyelendirilmiş Maliyeti): ${result.lcoe.toFixed(4)} USD/kWh

## 4. Kabuller ve Sınırlamalar
${result.assumptions.map((a) => `- ${a}`).join("\n")}
${result.limitations.map((l) => `- ${l}`).join("\n")}

---
**HUKUKİ VE TEKNİK UYARI:** İşbu rapor girilen manuel verilere dayanarak üretilmiş bir ÖN FİZİBİLİTE raporudur. Kesinlikle yatırım tavsiyesi (YTD) niteliği taşımamaktadır. Resmi çağrı mektubu, TEDAŞ proje onayı ve imar planı değişiklikleri olmaksızın bankalarca finansmana tabi tutulamaz.
`.trim();
}

export function buildParcelMarkdownReport(
  id: string,
  inputs: ParcelInputs,
  result: ParcelFeasibilityResult,
): string {
  return `
# GAYRİMENKUL PARSEL ÖN FİZİBİLİTE RAPORU
**Rapor ID:** ${id}
**Tarih:** ${new Date().toLocaleDateString("tr-TR")}

## 1. İmar Durumu Özeti (Manuel Girdiler)
- Arsa Alanı: ${inputs.landAreaM2} m²
- Emsal (KAKS): ${inputs.emsal}
- TAKS: ${inputs.taks}

## 2. Hacim ve Alan Dağılımı
- Maksimum Toplam İnşaat Alanı: ${result.maxConstructionArea.toFixed(2)} m²
- Taban Oturumu: ${result.footprint.toFixed(2)} m²
- Gerekli Kat Sayısı: ${result.requiredFloors}
- Satılabilir Brüt Alan: ${result.sellableGrossArea.toFixed(2)} m²
- Tahmini Bağımsız Bölüm (Daire) Sayısı: ${result.estimatedUnitCount}

## 3. Paylaşım ve Karlılık Öngörüleri
- Müteahhit Payına Düşen Alan: ${result.contractorShareM2.toFixed(2)} m²
- Arsa Sahibi Payına Düşen Alan: ${result.landownerShareM2.toFixed(2)} m²
- Tahmini Proje Hasılatı: ${result.totalRevenue.toLocaleString("tr-TR")} TL
- Tahmini Proje İnşaat Maliyeti: ${result.totalCost.toLocaleString("tr-TR")} TL
- Öngörülen Müteahhit Kârı: ${result.contractorProfit.toLocaleString("tr-TR")} TL
- Net Proje Kâr Marjı: %${result.profitMarginPercent.toFixed(2)}

## 4. Kritik Uyarılar
${result.warnings.map((w) => `- ${w}`).join("\n")}

---
**ÖNEMLİ BİLGİLENDİRME:** Bu doküman resmi bir imar durum belgesi yerine geçmez. Belediye onaylı avan proje, mimari proje tasarımı ve zemin etüt raporları hazırlanmadan inşaat maliyet ve hasılat modelleri kesinlik arz etmez. Yatırım tavsiyesi değildir.
`.trim();
}
