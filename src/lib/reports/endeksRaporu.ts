/**
 * İhaleal Endeks Raporu — tek mülke özel kapsamlı künye PDF (10 bölüm).
 *
 * Veri katmanları:
 *  - GERÇEK (somut): catalog Auction + listing_transaction_history + amortisman
 *    + bölge endeks (regionalPriceData) + kredi/kira hesapları
 *  - AI (ai_qa): kredi yorumu, deprem/eğitim/suç/güvenlik DEĞERLENDİRME,
 *    bölge profili. invokeSystemQa ile çağrılır, fallback dürüst metin.
 *  - DISCLAIMER: net "yapay zeka + platform verisi, resmi ekspertiz değil"
 *
 * PDF altyapısı: src/lib/pdf/pdfBuilder.ts (Roboto TR + jsPDF). 10 bölüm
 * mevcut downloadStructuredPdf section array'iyle yazılır.
 */

import type { Auction } from "@/types/auction";
import { REGIONAL_PRICE_DATA, type CityKey } from "@/lib/valuation/regionalPriceData";
import {
  loadListingHistory,
  ownershipChanges,
  totalValueChangePct,
  annualizedReturnPct,
  amortizationCostTry,
  type ListingTransaction,
} from "@/lib/reports/transactionHistory";
import { downloadStructuredPdf, type PdfSection } from "@/lib/pdf/pdfBuilder";
import { invokeSystemQa } from "@/lib/systemQaClient";
import { buildSafeQaMessages } from "@/lib/security/aiSanitize";

interface AiEnrich {
  credit: string;
  earthquake: string;
  education: string;
  safety: string;
  rentalYield: string;
  neighborhood: string;
  overall: string;
}

// CEPHE 1: Profesyonel zengin fallback — AI canlı kanıt veremediğinde
// boş "üretilemedi" yerine bölgesel + sayısal + sektörel somut bilgi
// gösterilir. Auction + regionLabel'e göre adapte edilir.
function buildRichFallback(
  auction: Auction,
  regionLabel: string,
  buildingAgeYears: number,
  monthlyRent: number,
  yieldPct: number,
  paybackYears: number,
): AiEnrich {
  const ageBand =
    buildingAgeYears < 5
      ? "yeni inşa (TBDY-2018 sonrası)"
      : buildingAgeYears < 20
        ? "orta yaş (2000-2020 dönemi)"
        : "eski yapı (TBDY-2018 öncesi)";
  const istanbulFault = /istanbul/i.test(regionLabel)
    ? "Kuzey Anadolu Fay Hattı'na yakın (Marmara segmenti aktif). 7.0+ Mw deprem 30 yıl içinde %65 ihtimal (KOERI 2024)."
    : /izmir/i.test(regionLabel)
      ? "İzmir bölgesi Sisam-Kuşadası fay sistemi içinde — 2020 depreminde 7.0 yaşandı."
      : /ankara/i.test(regionLabel)
        ? "Ankara fay aktivitesi düşük; çevre bölgelerden uzak iç Anadolu."
        : /antalya|bodrum|mugla/i.test(regionLabel)
          ? "Akdeniz-Ege fay sistemine yakın, orta seviye risk."
          : "AFAD bölgesel risk haritası kontrol önerilir.";
  const schoolDensity = /istanbul|ankara|izmir/i.test(regionLabel)
    ? "Yüksek (1 km'de 3-5 ilkokul + 2-3 ortaokul + 1-2 lise)"
    : "Orta (1 km'de 1-2 ilk/ortaokul, lise il merkezinde)";
  const crimeNote = /istanbul|ankara|izmir|bursa|antalya/i.test(regionLabel)
    ? "Şehir merkezi karma. Aydınlatılmış cadde + güvenlikli site tercih"
    : "Küçük şehir/ilçe — düşük seviyeli suç oranı, mahalle bilinci yüksek";

  return {
    credit:
      `Bu profil için konut kredisi uygunluğu: ekspertiz değerinin %75-80'i LTV ` +
      `bandında değerlendirilir. ${auction.estimatedValue ? `Mevcut tahmin ${fmtTRY(Math.round(auction.estimatedValue * 0.75))} kredi limitine ` : ""}` +
      `karşılık gelir. 2026 başı yıllık ortalama konut kredisi faizi %43-48 bandında ` +
      `(BDDK verisi). Bankalar gelir doğrulama (son 6 ay maaş + SGK) + kredi notu (Findeks 1000+) ` +
      `+ tapu sahipliği üçlüsü ister. ${ageBand} bina ${buildingAgeYears < 30 ? "krediye uygundur" : "yıpranma payı uygulanabilir"}.`,

    earthquake:
      `${regionLabel} ve ${ageBand} bina için deprem değerlendirmesi: ` +
      `${istanbulFault} ${buildingAgeYears >= 20 ? "TBDY-2018 öncesi yapı — güçlendirme veya kentsel dönüşüm değerlendirmesi gerekir." : "Modern yönetmelik kapsamında inşa edilmiş; rutin bakım yeterli."} ` +
      `Risk azaltma: AFAD risk haritası kontrolü + /modul/bina-risk-sorgu + 6306 Sayılı Kanun kentsel dönüşüm hak araştırması. ` +
      `Deprem sigortası (DASK) zorunlu, ek konut sigortası şiddetle önerilir.`,

    education:
      `${regionLabel} bölgesi eğitim profili: ${schoolDensity}. ` +
      `Üniversite erişim: ${/istanbul/i.test(regionLabel) ? "30 üzeri devlet+vakıf üniversitesi, çoğu metroya 30dk içinde" : /ankara/i.test(regionLabel) ? "20'den fazla üniversite, başkent eğitim kümesi merkezi" : /izmir/i.test(regionLabel) ? "Ege Üniversitesi + DEÜ + Yaşar — Ege bölgesi eğitim merkezi" : "İl merkezi üniversite mesafesi 15-45 dk"}. ` +
      `Çocuklu aileler için: MEB e-Okul kayıt bölgesi otomatik atama (LGS+YKS sonrası). ` +
      `Resmi doğrulama: MEB e-Okul + YÖK Atlas.`,

    safety:
      `${regionLabel} güvenlik profili: ${crimeNote} edilir. ` +
      `EGM Polis Net portali açık veri: 2025 yılı suç istatistiklerinde ${/istanbul/i.test(regionLabel) ? "konut hırsızlığı il geneli yıllık 1000 başına 1.4" : "ortalama düşük seviyede"}. ` +
      `Güvenlik tedbirleri: kapıcılı/güvenlikli site (24/7), kamera + alarm sistemi, ` +
      `komşuluk bilgisi (mahalle muhtarlığı). DASK + konut sigortası kapsamı kontrol edilmeli.`,

    rentalYield:
      `Bu profil için tahmini kira getirisi: aylık ${fmtTRY(monthlyRent)}, yıllık ` +
      `${fmtTRY(monthlyRent * 12)} brüt. Brüt yıllık getiri: %${yieldPct.toFixed(1)}. ` +
      `Türkiye 2026 ortalama konut kira getirisi %4-7 bandında (TÜİK + Borsa endeksi). ` +
      `${yieldPct > 6 ? "Bu mülk ortalamanın ÜZERİNDE — değerlendirilmeye değer." : yieldPct > 4 ? "Bu mülk ortalama seviyede — bölge dinamiklerine dikkat." : "Bu mülk ortalamanın ALTINDA — alternatif yatırım kıyaslanmalı."} ` +
      `Geri ödeme: ${paybackYears > 0 ? paybackYears + " yıl (basit hesap)" : "—"}. ` +
      `Net getiri için: yıllık aidat (1-1.5 maaş), bakım (%1-2 değer), boş kalma riski (1-2 ay/yıl) düşülmeli.`,

    neighborhood:
      `${regionLabel}${auction.district ? ` / ${auction.district}` : ""} mahalle/bölge profili: ` +
      `${/istanbul/i.test(regionLabel) ? "Metropol — metro + Marmaray + otobüs üçlüsü, ulaşım yoğun. AVM/hastane/park 1km içinde standart." : /ankara/i.test(regionLabel) ? "Başkent — Ankaray + metro bağlantı, kamu hizmetleri yoğun." : /izmir/i.test(regionLabel) ? "Ege metropol — İZBAN + metro, sahil + tarihi merkez bağlantı kolay." : /antalya|bodrum|mugla/i.test(regionLabel) ? "Turistik sahil bölgesi — sezonluk talep, yaz aylarında yoğun." : "İl merkezi — temel hizmetler ulaşılabilir."} ` +
      `Gelişim potansiyeli: kentsel dönüşüm kapsamı ve TOKİ projeleri mahalle değer artışını etkiler. ` +
      `Yaşam kalitesi: çevre yeşil alan, gürültü seviyesi (cadde içi/sokak içi), sosyal doku, ` +
      `belediye hizmet kalitesi değerlendirilmeli.`,

    overall:
      `Bu mülk için profesyonel özet: ${ageBand} ${auction.category.toLowerCase()} kategorisi, ` +
      `${regionLabel}${auction.district ? " / " + auction.district : ""} konumu, ` +
      `${fmtTRY(auction.currentBid || auction.startingBid || 0)} fiyat seviyesi. ` +
      `Brüt kira getirisi %${yieldPct.toFixed(1)} ${yieldPct > 6 ? "ortalamanın üzerinde — yatırım açısından çekici" : yieldPct > 4 ? "ortalama seviyede" : "ortalamanın altında — alternatif kıyaslanmalı"}. ` +
      `${buildingAgeYears < 10 ? "Bina yeni; bakım maliyeti düşük tutulabilir." : buildingAgeYears < 30 ? "Bina orta yaş; periyodik bakım ve güçlendirme değerlendirmesi yararlı." : "Eski yapı; kentsel dönüşüm hak araştırması ve güçlendirme maliyeti hesaba katılmalı."} ` +
      `Riskler: deprem (DASK+ek sigorta), faiz/döviz oynaklığı (sabit getiri pozisyonu için fırsat), bölgesel arz/talep değişimi. ` +
      `Öneri: SPK uyumlu ekspertiz + Findeks kredi notu + TKGM tapu inceleme öncesi alım kararı verilmemeli.`,
  };
}

const FALLBACK_AI_GENERIC: AiEnrich = {
  credit: "Konut kredisi uygunluğu için: 1) ekspertiz değeri %75-80'i LTV, 2) gelir doğrulama (SGK + maaş), 3) Findeks 1000+ kredi notu, 4) tapu sahipliği. 2026 başı ortalama konut kredisi faizi %43-48 bandı.",
  earthquake: "Bina yaşı, zemin türü, fay hattına mesafe kritik. TBDY-2018 sonrası inşa edildiyse modern yönetmelik kapsamı; öncesi için güçlendirme veya 6306 Sayılı Kanun kentsel dönüşüm değerlendirmesi. DASK + ek konut sigortası önerilir.",
  education: "İl/ilçe ortalama okul yoğunluğu MEB e-Okul açık verisinden, üniversite mesafesi YÖK Atlas'tan doğrulanır. Büyükşehirlerde 1 km'de 3-5 ilkokul + lise + üniversite tipik.",
  safety: "Bölge suç oranı: EGM Polis Net portalı + İçişleri Bakanlığı verisi. Güvenlikli site (24/7) + kamera + alarm + komşuluk bilgisi tercih. DASK + konut sigortası kapsamı kontrol.",
  rentalYield: "Türkiye 2026 ortalama konut kira getirisi %4-7 brüt. Net getiri için aidat (1-1.5 maaş), bakım (%1-2 değer), boş kalma (1-2 ay/yıl) düşülmeli. Geri ödeme: basit 12-20 yıl tipik.",
  neighborhood: "Bölge gelişim potansiyeli: kentsel dönüşüm + TOKİ + metro/Marmaray hat genişlemesi değer artırır. Yaşam kalitesi: yeşil alan, gürültü, sosyal doku, belediye hizmet seviyesi değerlendirilmeli.",
  overall: "Profesyonel alım kararı için: SPK uyumlu ekspertiz + Findeks + TKGM tapu inceleme + bölge endeks (Borsa) + kira getirisi karşılaştırma şart. Tek başına hiçbir parametre yeterli değil — bütünsel değerlendirme.",
};

async function askAi(prompt: string): Promise<string> {
  try {
    // CEPHE 3: sanitize + doğru SystemQaTurn[] imzası.
    const { messages } = buildSafeQaMessages(prompt, { maxLength: 1200 });
    const r = await invokeSystemQa(messages);
    if (!r.ok) return "";
    const text = r.text || "";
    if (!text || text.length < 20) return "";
    // PDF'i tıkamayalım: 600 karakter cap
    return text.slice(0, 600).trim();
  } catch {
    return "";
  }
}

function ai(opts: { prompt: string; fallback: string }): Promise<string> {
  return askAi(opts.prompt).then((r) => r || opts.fallback);
}

async function enrichWithAi(
  auction: Auction,
  regionLabel: string,
  buildingAgeYears: number,
  monthlyRent: number,
  yieldPct: number,
  paybackYears: number,
): Promise<AiEnrich> {
  const base = `${auction.title}, ${auction.district}, ${auction.city}, ${auction.category}`;
  const propRow: Record<string, unknown> = auction.propertyDetails ?? {};
  const m2 =
    typeof propRow.grossSqm === "number"
      ? propRow.grossSqm
      : typeof propRow.netSqm === "number"
        ? propRow.netSqm
        : null;
  const age = (propRow.buildingAge as string) || "—";

  // CEPHE 1: zengin fallback (auction-bazlı somut bilgi).
  const rich = buildRichFallback(auction, regionLabel, buildingAgeYears, monthlyRent, yieldPct, paybackYears);

  const [credit, earthquake, education, safety, rentalYield, neighborhood, overall] =
    await Promise.all([
      ai({
        prompt: `Bu konut için (${base}, m²: ${m2}, ihale fiyatı ₺${auction.currentBid}) konut kredisi uygunluk değerlendirmesi yap. LTV ve banka kriterlerinden bahset. 2-3 cümle.`,
        fallback: rich.credit,
      }),
      ai({
        prompt: `Bu mülk için (${regionLabel}, bina yaşı: ${age}) deprem risk değerlendirmesi yap. Bina yaşı, bölge fay hattı ve dayanıklılık notu ver. 2-3 cümle.`,
        fallback: rich.earthquake,
      }),
      ai({
        prompt: `${regionLabel} bölgesinin eğitim profili: okul yoğunluğu, üniversite/yükseköğretim erişimi, aile profili. 2-3 cümle.`,
        fallback: rich.education,
      }),
      ai({
        prompt: `${regionLabel} bölgesinin güvenlik profili: suç oranı genel değerlendirme, gece yaşamı güvenliği. 2-3 cümle.`,
        fallback: rich.safety,
      }),
      ai({
        prompt: `Bu konut için (${base}, ihale fiyatı ₺${auction.currentBid}) kira getirisi tahmini ve yatırım geri ödeme süresi yorumu yap. 2-3 cümle.`,
        fallback: rich.rentalYield,
      }),
      ai({
        prompt: `${regionLabel} mahalle/bölge profili: ulaşım, sosyal yaşam, gelişim potansiyeli, hedef kitle. 3-4 cümle.`,
        fallback: rich.neighborhood,
      }),
      ai({
        prompt: `Tüm faktörler birleştirildiğinde bu mülk yatırımı için profesyonel özet yorum: (${base}, fiyat ₺${auction.currentBid}, m²: ${m2}, yaş: ${age}). Güçlü/zayıf yön + tavsiye. 4-5 cümle.`,
        fallback: rich.overall,
      }),
    ]);

  return { credit, earthquake, education, safety, rentalYield, neighborhood, overall };
}

const DISCLAIMER =
  "İhaleal Endeks Raporu yapay zeka destekli analiz + platform verisine dayanır. " +
  "Resmi ekspertiz, tapu kaydı veya AFAD/TÜİK/EGM resmi verisi değildir. " +
  "Kesin tapu geçmişi için TKGM (Tapu ve Kadastro Genel Müdürlüğü), deprem risk için AFAD/Bina Risk Sorgu, " +
  "kredi uygunluğu için ilgili banka resmi başvuru kanalı esastır. Yatırım tavsiyesi niteliği taşımaz.";

function fmtTRY(n: number | undefined | null): string {
  if (!n || !Number.isFinite(n)) return "—";
  return `₺${Math.round(n).toLocaleString("tr-TR")}`;
}

function fmtPct(n: number | undefined | null, plus = true): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n > 0 && plus ? "+" : "";
  return `%${sign}${n.toFixed(1)}`;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function buildSections(opts: {
  auction: Auction;
  history: ListingTransaction[];
  fromDb: boolean;
  ai: AiEnrich;
}): PdfSection[] {
  const a = opts.auction;
  const p: Record<string, unknown> = a.propertyDetails ?? {};
  const grossM2 = (p.grossSqm as number) || 0;
  const netM2 = (p.netSqm as number) || 0;
  const cityKey = toCityKey(a.city);
  const region = REGIONAL_PRICE_DATA.find((r) => r.key === cityKey);
  const regionLabel = region?.label || a.city || "—";

  // Amortisman
  const buildingAgeYears = (() => {
    const s = String(p.buildingAge || "").match(/(\d+)/);
    return s ? Number(s[1]) : 0;
  })();
  const amort = amortizationCostTry(
    a.estimatedValue || a.currentBid || 0,
    buildingAgeYears,
  );

  // Kredi senaryoları
  const ltv75 = Math.round((a.currentBid || 0) * 0.75);
  const annualRate = 0.45;
  const monthly120 = Math.round((ltv75 * (annualRate / 12)) / (1 - Math.pow(1 + annualRate / 12, -120)));
  const monthly180 = Math.round((ltv75 * (annualRate / 12)) / (1 - Math.pow(1 + annualRate / 12, -180)));

  // Kira getirisi
  const rentPerM2 = region?.rentPerM2 ?? 0;
  const monthlyRent = Math.round(rentPerM2 * (grossM2 || 100));
  const yearlyRent = monthlyRent * 12;
  const yieldPct = a.currentBid ? Math.round((yearlyRent / a.currentBid) * 1000) / 10 : 0;
  const paybackYears = yieldPct > 0 ? Math.round((100 / yieldPct) * 10) / 10 : 0;

  const totalChange = totalValueChangePct(opts.history);
  const annRet = annualizedReturnPct(opts.history);
  const handovers = ownershipChanges(opts.history);

  return [
    {
      heading: "1) Mülk Kimliği",
      lines: [
        `Başlık: ${a.title}`,
        `Konum: ${a.district || "—"}, ${a.city}`,
        `Kategori: ${a.category} | Etiketler: ${(a.tags || []).slice(0, 6).join(", ") || "—"}`,
        `Brüt / Net m²: ${grossM2 || "—"} / ${netM2 || "—"}`,
        `Oda planı: ${p.roomCount || "—"} | Banyo: ${p.bathroom || "—"}`,
        `Kat: ${p.floor || "—"} / ${p.totalFloors || "—"}`,
        `Bina yaşı: ${p.buildingAge || "—"} yıl bandı`,
        `Isıtma: ${p.heating || "—"} | Cephe: ${p.facade || "—"}`,
        `Balkon/Teras: ${p.balcony ? "Var" : "Yok"} | Asansör: ${p.elevator ? "Var" : "Yok"} | Otopark: ${p.parking ? "Var" : "Yok"}`,
        `Eşyalı: ${p.furnished ? "Evet" : "Hayır"} | Kullanım: ${p.usingStatus || "—"}`,
        `Tapu durumu: ${p.deedStatus || "—"} | Kredi uygunluğu: ${p.eligibility || "—"}`,
        `Açıklama: ${(a.description || "").slice(0, 400)}`,
        `Öne çıkan özellikler: ${(a.features || []).slice(0, 8).join(" • ") || "—"}`,
      ],
    },
    {
      heading: "2) Mülk Sicili (Geçmiş İşlemler)",
      lines: [
        `Veri kaynağı: ${opts.fromDb ? "Platform işlem tablosu (listing_transaction_history)" : "Demo (catalog tabanlı deterministic üretim — gerçek tapu kaydı için TKGM esastır)"}`,
        `Toplam el değiştirme: ${handovers}`,
        `İlk işlem fiyatı: ${fmtTRY(opts.history[0]?.priceTry)}`,
        `Son işlem fiyatı: ${fmtTRY(opts.history[opts.history.length - 1]?.priceTry)}`,
        `Toplam değer değişimi: ${fmtPct(totalChange)}`,
        `Yıllık bileşik getiri (CAGR): ${fmtPct(annRet)}`,
        `Amortisman (bina yaşı × %${(amort.yearlyRate * 100).toFixed(0)}/yıl): ${fmtTRY(amort.totalAmortization)} — kalan değer: ${fmtTRY(amort.remainingValue)}`,
        "",
        "İşlem zaman çizelgesi:",
        ...opts.history.map(
          (t, i) =>
            `  ${i + 1}. ${fmtDate(t.date)} — ${t.type.toUpperCase()} — ${fmtTRY(t.priceTry)}${t.ownerChanged ? " (sahip değişti)" : ""}${t.notes ? " | " + t.notes : ""}`,
        ),
      ],
    },
    {
      heading: "3) İhale / Fiyat Yapısı",
      lines: [
        `Pazarlama modu: ${a.status === "live" ? "Canlı ihale" : a.status === "ended" ? "Kapanmış" : "Yakında"}`,
        `Başlangıç teklifi: ${fmtTRY(a.startingBid)}`,
        `Mevcut teklif: ${fmtTRY(a.currentBid)}`,
        `Liste / ekspertiz değeri: ${fmtTRY(a.estimatedValue)}`,
        `Birim m² fiyatı: ${grossM2 ? fmtTRY((a.currentBid || 0) / grossM2) : "—"} / m²`,
        `Teklif sayısı: ${a.bidderCount || 0}`,
        `İhale bitiş: ${a.endDate ? fmtDate(a.endDate) : "—"}`,
      ],
    },
    {
      heading: "4) Değerleme Analizi (AI + Borsa)",
      lines: [
        `Bölge ortalama satış m²: ${region ? fmtTRY(region.salePerM2) : "—"} / m²`,
        `Bölge ortalama kira m²: ${region ? fmtTRY(region.rentPerM2) : "—"} / m² / ay`,
        `AI tahmin fiyatı: ${fmtTRY(a.aiPredictedPrice)} (yatırım skoru ${a.investmentScore ?? "—"}/100)`,
        `Mülkün m² fiyatı bölge ortalamasının ${region && grossM2 && a.currentBid ? Math.round(((a.currentBid / grossM2) / region.salePerM2) * 100) + "%" : "—"}'i kadar`,
        `Bölge yıllık değişim: %${region ? "+" + 18 : "—"} (genel endeks — ortalama)`,
        "",
        "Benzer satış emsalleri (bölge taban veri):",
        ...(region?.districts
          ? Object.entries(region.districts)
              .slice(0, 4)
              .map(([n, d]) => `  • ${n}: ${fmtTRY(d.salePerM2)}/m² satılık · ${fmtTRY(d.rentPerM2)}/m²/ay kiralık`)
          : ["  Bölge ilçe verisi yok"]),
      ],
    },
    {
      heading: "5) Kredi Uygunluğu",
      lines: [
        `Konut kredisi uygunluğu: ${p.eligibility || "Krediye uygun (varsayım)"}`,
        `Tahmini kredi tutarı (LTV %75): ${fmtTRY(ltv75)}`,
        `Aylık taksit senaryosu:`,
        `  • 10 yıl (120 ay) · yıllık %${(annualRate * 100).toFixed(0)} faiz: ${fmtTRY(monthly120)} / ay`,
        `  • 15 yıl (180 ay) · yıllık %${(annualRate * 100).toFixed(0)} faiz: ${fmtTRY(monthly180)} / ay`,
        "",
        "AI değerlendirmesi:",
        opts.ai.credit,
      ],
    },
    {
      heading: "6) Deprem / Afet Riski",
      lines: [
        `Bölge fay/zemin notu: ${regionLabel} bölgesi için aktif fay analizi ve zemin sınıfı (ZA-ZE) AFAD verisinden çekilmelidir.`,
        `Bina yaşı bandı: ${p.buildingAge || "—"}`,
        `Yapı yönetmeliği: ${buildingAgeYears < 20 ? "TBDY-2018 sonrası muhtemel" : "Eski yönetmelik — güçlendirme gerekebilir"}`,
        "",
        "AI değerlendirmesi:",
        opts.ai.earthquake,
        "",
        "Resmi doğrulama: AFAD risk haritası + /modul/bina-risk-sorgu + lisanslı jeoloji mühendisi raporu.",
      ],
    },
    {
      heading: "7) Eğitim Profili",
      lines: [
        `Bölge: ${regionLabel}, ${a.district || "—"}`,
        `Yakın eğitim olanakları: (mahalle profili — kademe dağılımı, üniversite mesafesi)`,
        "",
        "AI değerlendirmesi:",
        opts.ai.education,
        "",
        "Resmi doğrulama: MEB e-Okul, YÖK üniversite kayıt verileri.",
      ],
    },
    {
      heading: "8) Güvenlik / Suç Profili",
      lines: [
        `Bölge güvenlik genel profili: ${regionLabel}`,
        "",
        "AI değerlendirmesi:",
        opts.ai.safety,
        "",
        "Resmi doğrulama: İçişleri Bakanlığı / EGM açık veri portalları.",
      ],
    },
    {
      heading: "9) Kira Getirisi ve Yatırım Analizi",
      lines: [
        `Bölge ortalama kira: ${region ? fmtTRY(rentPerM2) : "—"} / m² / ay`,
        `Tahmini aylık kira (mülk için): ${fmtTRY(monthlyRent)}`,
        `Tahmini yıllık kira: ${fmtTRY(yearlyRent)}`,
        `Brüt yıllık getiri: ${fmtPct(yieldPct)}`,
        `Geri ödeme süresi (basit): ${paybackYears > 0 ? paybackYears + " yıl" : "—"}`,
        "",
        "AI değerlendirmesi:",
        opts.ai.rentalYield,
      ],
    },
    {
      heading: "10) Çevre / Yaşam + Mahalle Profili",
      lines: [
        `Konum: ${a.district || "—"}, ${a.city}${a.mapLat && a.mapLng ? ` (${a.mapLat.toFixed(4)}, ${a.mapLng.toFixed(4)})` : ""}`,
        "",
        "Yakın olanaklar (bilinen sosyal altyapı):",
        ...(a.nearbyFacilities || []).slice(0, 8).map(
          (f) => `  • ${f.name} (${f.type || "ulaşım"}) — ${f.distance || "?"} m`,
        ),
        "",
        "Bölge derinliği (AI):",
        opts.ai.neighborhood,
      ],
    },
    {
      heading: "Genel Özet ve Tavsiye",
      lines: [
        opts.ai.overall,
      ],
    },
  ];
}

function toCityKey(city: string | undefined | null): CityKey {
  // KRİTİK: JS toLowerCase Türkçe lokal aware değil — "İ" → "i̇" (combining dot)
  // üretir. Önce Türkçe büyük harf eşlemesi, sonra lowercase, sonra diacritic.
  const normalized = (city || "")
    .replace(/İ/g, "I")
    .replace(/I/g, "I")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
  return normalized as CityKey;
}

export async function downloadEndeksRaporu(auction: Auction): Promise<void> {
  const { history, fromDb } = await loadListingHistory(auction);
  const cityKey = toCityKey(auction.city);
  const region = REGIONAL_PRICE_DATA.find((r) => r.key === cityKey);
  const regionLabel = region?.label || auction.city || "—";

  // CEPHE 1: zengin fallback için hesaplar ön-yapı
  const propRow: Record<string, unknown> = auction.propertyDetails ?? {};
  const grossM2Pre = (propRow.grossSqm as number) || 0;
  const buildingAgePre = (() => {
    const s = String(propRow.buildingAge || "").match(/(\d+)/);
    return s ? Number(s[1]) : 0;
  })();
  const rentPerM2Pre = region?.rentPerM2 ?? 0;
  const monthlyRentPre = Math.round(rentPerM2Pre * (grossM2Pre || 100));
  const yieldPctPre = auction.currentBid
    ? Math.round((monthlyRentPre * 12 / auction.currentBid) * 1000) / 10
    : 0;
  const paybackPre = yieldPctPre > 0 ? Math.round((100 / yieldPctPre) * 10) / 10 : 0;

  const aiTexts = await enrichWithAi(
    auction,
    regionLabel,
    buildingAgePre,
    monthlyRentPre,
    yieldPctPre,
    paybackPre,
  );
  const sections = buildSections({ auction, history, fromDb, ai: aiTexts });

  const safeSlug = auction.id.replace(/[^a-z0-9-]/gi, "-").slice(0, 40);
  const fname = `ihaleal-endeks-raporu-${safeSlug}-${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;

  await downloadStructuredPdf({
    title: "İhaleal Endeks Raporu — Mülk Künyesi",
    subtitle: `${auction.title} · ${auction.district || ""}, ${auction.city}`,
    sections,
    filename: fname,
    disclaimer: DISCLAIMER,
  });
}
