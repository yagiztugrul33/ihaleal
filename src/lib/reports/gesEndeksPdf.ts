/**
 * GES Endeks Raporu — kapsamlı ön fizibilite PDF (Roboto TR).
 *
 * /arastirma/ges-analizi çıktısının derinleştirilmiş PDF versiyonu:
 * NPV/IRR/LCOE + geri ödeme + sensitivity ±%10 + 10 yıllık nakit akış
 * + AI değerlendirme + disclaimer.
 *
 * Mevcut pdfBuilder.downloadStructuredPdf altyapısını kullanır (Roboto TR
 * font otomatik). Markdown değil PDF.
 */

import type { GesFeasibilityResult } from "@/lib/engineering";
import { downloadStructuredPdf } from "@/lib/pdf/pdfBuilder";
import { invokeSystemQa } from "@/lib/systemQaClient";
import { buildSafeQaMessages } from "@/lib/security/aiSanitize";

interface GesPdfInput {
  // Form girdileri (kullanıcı tarafından)
  enlem: string;
  boylam: string;
  araziM2: string;
  dcKwp: string;
  ghi: string;
  electricityPrice: string;
  capexPerKwp: string;
  discountRate: string;
}

function fmtTRY(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `₺${Math.round(n).toLocaleString("tr-TR")}`;
}
// IRR hesaplanamadiginda gesEngine null dondurur; Number.isFinite(null) zaten
// false oldugu icin cikti "—" idi — imza gerceklige hizalandi, davranis ayni.
function fmtPct(n: number | null | undefined, plus = true): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n > 0 && plus ? "+" : "";
  return `%${sign}${n.toFixed(1)}`;
}
function fmtNum(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Geri ödeme süresi (basit) = CAPEX / yıllık net nakit. */
function paybackYears(capex: number, annualNetCashTry: number): number {
  if (annualNetCashTry <= 0 || capex <= 0) return Number.NaN;
  return capex / annualNetCashTry;
}

/** Sensitivity: elektrik fiyatı ±%10 → NPV değişim tahmini (linear yaklaşım). */
function sensitivity(base: { npvTry: number; annualKwh: number; price: number; discountPct: number; years: number }) {
  // basit: NPV değişim = ΔRevenue PV
  // ΔRevenue per year = annual kWh × Δfiyat
  // PV annuity factor
  const r = base.discountPct / 100;
  const af = (1 - Math.pow(1 + r, -base.years)) / r;
  const dPrice = base.price * 0.1;
  const dRevenuePerYear = base.annualKwh * dPrice;
  const dNpv = dRevenuePerYear * af;
  return {
    up: base.npvTry + dNpv,
    down: base.npvTry - dNpv,
    delta: dNpv,
  };
}

/** Basit 10 yıllık nakit akış tablosu (üretim sabit, fiyat sabit). */
function cashflow10y(annualKwh: number, price: number, annualOpex: number): { year: number; revenue: number; opex: number; net: number; cum: number }[] {
  let cum = 0;
  return Array.from({ length: 10 }, (_, i) => {
    const year = i + 1;
    const revenue = annualKwh * price;
    const opex = annualOpex;
    const net = revenue - opex;
    cum += net;
    return { year, revenue, opex, net, cum };
  });
}

/** AI yorumu — fallback dürüst metin. */
async function aiOverall(input: GesPdfInput, result: GesFeasibilityResult): Promise<string> {
  const fallback =
    "AI değerlendirmesi şu an üretilemedi. " +
    `Hesaplanan NPV: ${fmtTRY(result.npvTry)}, IRR: ${fmtPct(result.irrPct)}, ` +
    `LCOE: ₺${result.lcoeTryPerKwh.toFixed(2)}/kWh. ` +
    "Bu rakamlar ön fizibilite niteliğindedir; bankable çalışma için bağımsız ekspertiz şarttır.";
  try {
    const prompt =
      `GES projesi ön fizibilite değerlendirmesi yap. ` +
      `DC: ${input.dcKwp} kWp, GHI: ${input.ghi} kWh/m²/yıl, arazi: ${input.araziM2} m², ` +
      `NPV: ${fmtTRY(result.npvTry)}, IRR: ${fmtPct(result.irrPct)}, LCOE: ₺${result.lcoeTryPerKwh.toFixed(2)}/kWh. ` +
      `Yatırım çekiciliği, ana riskler ve sonraki adımları 4-5 cümle ile açıkla.`;
    // CEPHE 3: sanitize + doğru imza.
    const { messages } = buildSafeQaMessages(prompt, { maxLength: 1500 });
    const r = await invokeSystemQa(messages);
    if (!r.ok) return fallback;
    const text = r.text || "";
    if (text && text.length > 30) return text.slice(0, 700).trim();
    return fallback;
  } catch {
    return fallback;
  }
}

export async function downloadGesEndeksPdf(
  input: GesPdfInput,
  result: GesFeasibilityResult,
): Promise<void> {
  // Türetilmiş metrikler
  const dcKwp = Number(input.dcKwp.replace(",", ".")) || 0;
  const ghi = Number(input.ghi.replace(",", ".")) || 0;
  const price = Number(input.electricityPrice.replace(",", ".")) || 0;
  const capexPerKwp = Number(input.capexPerKwp.replace(",", ".")) || 0;
  const discountPct = Number(input.discountRate.replace(",", ".")) || 0;
  const totalCapex = dcKwp * capexPerKwp;
  const annualOpex = dcKwp * 120;
  const annualKwh = result.annualProductionKwh || dcKwp * ghi * 0.78;
  const annualRevenue = annualKwh * price;
  const annualNet = annualRevenue - annualOpex;
  const payback = paybackYears(totalCapex, annualNet);
  const sens = sensitivity({
    npvTry: result.npvTry,
    annualKwh,
    price,
    discountPct,
    years: 25,
  });
  const cf = cashflow10y(annualKwh, price, annualOpex);

  const aiText = await aiOverall(input, result);

  const filename = `ihaleal-ges-endeks-raporu-${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;

  await downloadStructuredPdf({
    title: "İhaleal GES Endeks Raporu — Ön Fizibilite",
    subtitle: `${input.dcKwp} kWp · ${input.araziM2} m² · ${input.enlem}, ${input.boylam}`,
    filename,
    disclaimer:
      "Bu rapor yapay zeka destekli analiz + platform mühendislik hesaplamalarına dayanır. " +
      "Bankable yatırım kararı için bağımsız EPC ekspertizi, lisanslı elektrik mühendisi onayı, " +
      "ölçümlü pyranometre verisi, AFAD/EPDK ruhsat ve hukuki çevre etki değerlendirmesi şarttır. " +
      "Yatırım tavsiyesi değildir.",
    sections: [
      {
        heading: "1) Proje Künyesi",
        lines: [
          `Lokasyon: ${input.enlem}°N, ${input.boylam}°E`,
          `Arazi: ${input.araziM2} m²`,
          `DC Kurulu Güç: ${input.dcKwp} kWp`,
          `Yıllık GHI: ${input.ghi} kWh/m²/yıl`,
          `Veri kaynağı: ${result.dataSource} (${result.confidence} güven)`,
          `Elektrik satış fiyatı: ₺${price.toFixed(2)}/kWh`,
          `Birim CAPEX: ₺${capexPerKwp.toFixed(0)}/kWp`,
          `Toplam CAPEX: ${fmtTRY(totalCapex)}`,
          `Yıllık OPEX (varsayım %1.2 CAPEX): ${fmtTRY(annualOpex)}`,
          `İndirgeme oranı: %${discountPct.toFixed(1)} | Proje ömrü: 25 yıl`,
        ],
      },
      {
        heading: "2) Üretim ve Gelir Profili",
        lines: [
          `Tahmini yıllık üretim: ${fmtNum(annualKwh)} kWh`,
          `Tahmini yıllık brüt gelir: ${fmtTRY(annualRevenue)}`,
          `Net yıllık nakit akışı (gelir − OPEX): ${fmtTRY(annualNet)}`,
          `Birim üretim (kWh/kWp/yıl): ${fmtNum(annualKwh / Math.max(dcKwp, 1))}`,
          `LCOE (Levelized Cost of Energy): ₺${result.lcoeTryPerKwh.toFixed(2)}/kWh`,
          `Çünkü: LCOE = (Toplam yaşam döngüsü maliyeti) / (Toplam üretim kWh). ` +
            `LCOE < Satış fiyatı (${price.toFixed(2)}) ise teknik olarak karlıdır.`,
        ],
      },
      {
        heading: "3) Finansal Metrikler",
        lines: [
          `Net Bugünkü Değer (NPV): ${fmtTRY(result.npvTry)}`,
          `İç Verim Oranı (IRR): ${fmtPct(result.irrPct)}`,
          `Geri ödeme süresi (basit): ${Number.isFinite(payback) ? payback.toFixed(1) + " yıl" : "—"}`,
          `Yatırım skoru: ${result.investmentScore?.toFixed(0) ?? "—"}/100`,
          `Uygunluk skoru: ${result.suitabilityScore?.toFixed(0) ?? "—"}/100`,
          `Risk skoru: ${result.riskScore?.toFixed(0) ?? "—"}/100`,
          "",
          `Çünkü: NPV ${result.npvTry > 0 ? "POZİTİF" : "NEGATİF"} → indirgeme oranında (%${discountPct.toFixed(0)}) ` +
            `proje ${result.npvTry > 0 ? "değer yaratır" : "değer yıkar"}.`,
          // `null > x` JS'te ToNumber(null)=0 ile karsilastirir; `?? 0` birebir ayni sonuc.
          `IRR (${fmtPct(result.irrPct)}) ${(result.irrPct ?? 0) > discountPct ? ">" : "<"} indirgeme oranı (%${discountPct.toFixed(0)}) → ` +
            `${(result.irrPct ?? 0) > discountPct ? "yatırım çekici" : "alternatif yatırım daha iyi"}.`,
        ],
      },
      {
        heading: "4) Hassasiyet Analizi (Elektrik Fiyatı ±%10)",
        lines: [
          `Baz NPV (mevcut fiyat ₺${price.toFixed(2)}/kWh): ${fmtTRY(result.npvTry)}`,
          `Fiyat +%10 (₺${(price * 1.1).toFixed(2)}/kWh): NPV = ${fmtTRY(sens.up)} (+${fmtTRY(sens.delta)})`,
          `Fiyat −%10 (₺${(price * 0.9).toFixed(2)}/kWh): NPV = ${fmtTRY(sens.down)} (${fmtTRY(-sens.delta)})`,
          "",
          `Yorum: NPV elektrik fiyatına ${Math.abs(sens.delta / Math.max(result.npvTry, 1)) > 0.3 ? "YÜKSEK" : "ORTA"} hassasiyetli. ` +
            "EPDK regülasyonu ve YEKDEM kapsamı kritik faktör.",
        ],
      },
      {
        heading: "5) 10 Yıllık Nakit Akışı (TRY, basit projeksiyon)",
        lines: [
          "Yıl | Gelir | OPEX | Net | Birikimli",
          "----|-------|------|-----|----------",
          ...cf.map(
            (r) =>
              `${r.year}  | ${fmtTRY(r.revenue)} | ${fmtTRY(r.opex)} | ${fmtTRY(r.net)} | ${fmtTRY(r.cum)}`,
          ),
          "",
          `Geri ödeme noktası: ~${Number.isFinite(payback) ? payback.toFixed(1) : "—"} yıl`,
          "Not: 10 yıl sonrası 15 yıl daha (25 yıl ömür) NPV hesabına dahildir; tabloda gösterilmedi.",
        ],
      },
      {
        heading: "6) AI Yatırım Değerlendirmesi",
        lines: [aiText],
      },
      {
        heading: "7) Sonraki Adımlar (Bankable Çalışma İçin)",
        lines: [
          "• Lisanslı pyranometre ile 12 ay yerinde ölçüm",
          "• Zemin etüdü (jeoteknik raporu) + topografik harita",
          "• EPDK lisans başvurusu + bağlantı anlaşması (TEİAŞ)",
          "• Şebeke kapasite ve dağıtım altyapı uygunluk yazısı",
          "• Çevre etki değerlendirme (ÇED) — kapsam bağlı",
          "• EPC sözleşmesi + performans garantisi (PPA varsa)",
          "• Bankable Energy Yield (P50/P75/P90) çalışması",
        ],
      },
      {
        heading: "Veri Kaynağı ve Metodoloji",
        lines: [
          `PVGIS / GHI tahmini: ${result.dataSource}`,
          `Güven seviyesi: ${result.confidence}`,
          `Hesap motoru: safeCalculateGesFeasibility (src/lib/engineering)`,
          `İndirgeme oranı varsayımı: %${discountPct.toFixed(0)} (TRY nominal)`,
          `OPEX varsayımı: yıllık ₺120/kWp (~%1 CAPEX)`,
          ...(result.limitations || []).slice(0, 4).map((l) => `• ${l}`),
        ],
      },
    ],
  });
}
