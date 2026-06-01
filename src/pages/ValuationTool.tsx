import { useMemo, useState } from "react";
import { Calculator, Home, MapPin, FileDown, Sparkles, Loader2, TrendingUp, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CITY_OPTIONS,
  getCityByKey,
  type CityKey,
  type TransactionType,
} from "@/lib/valuation/regionalPriceData";
import {
  estimatePropertyValue,
  formatTry,
  type PropertyCondition,
  type ValuationResult,
} from "@/lib/valuation/valuationEngine";
import { downloadStructuredPdf } from "@/lib/pdf/pdfBuilder";
import { invokeSystemQa } from "@/lib/systemQaClient";
import { getLocalAndStaticAuctions } from "@/lib/auctionsSource";
import type { Auction } from "@/types/auction";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

type FormState = {
  city: CityKey;
  district: string;
  grossM2: number;
  buildingAge: number;
  transactionType: TransactionType;
  condition: PropertyCondition;
  hasElevator: boolean;
  hasParking: boolean;
  parcelInfo: string;
  addressNote: string;
};

const INITIAL_STATE: FormState = {
  city: "istanbul",
  district: "Besiktas",
  grossM2: 120,
  buildingAge: 10,
  transactionType: "sale",
  condition: "good",
  hasElevator: true,
  hasParking: true,
  parcelInfo: "",
  addressNote: "",
};

function pickSimilar(catalog: Auction[], form: FormState, target: number, limit = 4): Auction[] {
  const cityName = getCityByKey(form.city)?.name?.toLowerCase() ?? form.city.toLowerCase();
  const inCity = catalog.filter(
    (a) =>
      (a.city.toLowerCase().includes(cityName) || cityName.includes(a.city.toLowerCase())) &&
      typeof a.propertyDetails?.grossSqm === "number",
  );
  // m² yakınlığa göre sırala
  const sorted = inCity
    .map((a) => ({
      a,
      sqmDelta: Math.abs((a.propertyDetails.grossSqm ?? 0) - form.grossM2),
      priceDelta: Math.abs(a.currentBid - target),
    }))
    .sort((x, y) => x.sqmDelta - y.sqmDelta || x.priceDelta - y.priceDelta);
  return sorted.slice(0, limit).map((s) => s.a);
}

export default function ValuationTool() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [catalog] = useState<Auction[]>(() => getLocalAndStaticAuctions());
  // Çoklu kur referans — HESAP MANTIĞI (estimatePropertyValue) ₺ üzerinden YAPMAYA devam eder
  const { currency, formatFromTry } = useCurrency();
  const showFx = currency !== "TRY";

  const districtOptions = useMemo(() => {
    return Object.keys(getCityByKey(form.city)?.districts ?? {});
  }, [form.city]);

  const cityLabel = useMemo(
    () => CITY_OPTIONS.find((c) => c.value === form.city)?.label ?? form.city,
    [form.city],
  );

  const similar = useMemo(() => {
    if (!result) return [];
    return pickSimilar(catalog, form, result.estimatedValue);
  }, [catalog, form, result]);

  const onCityChange = (nextCity: CityKey) => {
    const nextDistricts = Object.keys(getCityByKey(nextCity)?.districts ?? {});
    setForm((prev) => ({
      ...prev,
      city: nextCity,
      district: nextDistricts[0] ?? "",
    }));
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setAiReply(null);

    if (form.grossM2 <= 10) {
      setError("Metrekare 10 m² üzerinde olmalıdır.");
      return;
    }
    if (form.buildingAge < 0) {
      setError("Bina yaşı negatif olamaz.");
      return;
    }

    const next = estimatePropertyValue({
      city: form.city,
      district: form.district || undefined,
      grossM2: form.grossM2,
      buildingAge: form.buildingAge,
      transactionType: form.transactionType,
      condition: form.condition,
      hasElevator: form.hasElevator,
      hasParking: form.hasParking,
    });
    setResult(next);
  };

  const askAi = async () => {
    if (!result || aiBusy) return;
    setAiBusy(true);
    setAiReply(null);
    const prompt =
      `Bir kullanıcı ${cityLabel} ${form.district} bölgesinde ${form.grossM2} m², ${form.buildingAge} yaşında, ` +
      `${form.condition === "new" ? "sıfıra yakın" : form.condition === "good" ? "iyi durumda" : "tadilat gerekli"} bir ` +
      `${form.transactionType === "rent" ? "kiralık" : "satılık"} daire için değerleme aldı. ` +
      `Merkez tahmin ${formatTry(result.estimatedValue)}, aralık ${formatTry(result.minValue)}-${formatTry(result.maxValue)}, ` +
      `birim fiyat ${formatTry(result.unitPrice)}/m². 3 cümlede: (1) bu tahmin ne anlama gelir, ` +
      `(2) sahibinin/alıcının dikkat etmesi gereken noktalar, (3) bu fiyat için pazarlık marjı önerisi. ` +
      `Yatırım tavsiyesi değil; bilgilendirme amaçlı.`;
    const res = await invokeSystemQa([{ role: "user", content: prompt }]);
    if (res.ok) {
      setAiReply(res.text.slice(0, 800));
    } else {
      setAiReply("AI yorum şu an alınamadı. Lütfen birkaç dakika sonra tekrar deneyin.");
    }
    setAiBusy(false);
  };

  const downloadPdf = async () => {
    if (!result || pdfBusy) return;
    setPdfBusy(true);
    try {
      await downloadStructuredPdf({
        title: "İhaleal AVM Değerleme Özeti",
        subtitle: `${cityLabel}${form.district ? " · " + form.district : ""} · ${form.grossM2} m²`,
        filename: `ihaleal-degerleme-${Date.now()}.pdf`,
        disclaimer:
          "Bu rapor algoritmik tahmin üretir; resmi ekspertiz raporu yerine geçmez. " +
          "Banka ekspertiz değeri farklı çıkabilir. Yatırım tavsiyesi değildir.",
        sections: [
          {
            heading: "Mülk Girdileri",
            lines: [
              `İl / İlçe: ${cityLabel} / ${form.district || "—"}`,
              `Brüt alan: ${form.grossM2} m²`,
              `Bina yaşı: ${form.buildingAge}`,
              `İşlem tipi: ${form.transactionType === "rent" ? "Kiralık" : "Satılık"}`,
              `Durum: ${form.condition === "new" ? "Sıfıra yakın" : form.condition === "good" ? "İyi durumda" : "Tadilat gerekir"}`,
              `Asansör: ${form.hasElevator ? "Var" : "Yok"} · Otopark: ${form.hasParking ? "Var" : "Yok"}`,
            ],
          },
          {
            heading: "Değerleme Sonucu",
            lines: [
              `Merkez tahmin: ${formatTry(result.estimatedValue)}${form.transactionType === "rent" ? " / ay" : ""}`,
              `Tahmin aralığı: ${formatTry(result.minValue)} – ${formatTry(result.maxValue)} (±%${result.confidenceBandPct})`,
              `Birim fiyat: ${formatTry(result.unitPrice)}/m²`,
              `Güven seviyesi: ${result.confidence === "high" ? "Yüksek" : "Orta"} (%${Math.round(result.confidenceScore * 100)})`,
            ],
          },
          {
            heading: "Hesaplama Katmanları",
            lines: [
              `Bölge baz birim fiyatı: ${formatTry(result.layerSummary.baseUnitPrice)}/m²`,
              `Hedonik (özellik tabanlı): ${formatTry(result.layerSummary.hedonicUnitPrice)}/m²`,
              `Emsal (komşu mülk): ${formatTry(result.layerSummary.comparableUnitPrice)}/m²`,
              `Mekânsal katsayı: ${result.layerSummary.spatialFactor.toFixed(3)}`,
            ],
          },
          ...(aiReply ? [{ heading: "AI Yorum", lines: [aiReply] }] : []),
          ...(similar.length > 0
            ? [{
                heading: "Bölgeden Benzer İlanlar",
                lines: similar.map(
                  (a) =>
                    `• ${a.title.slice(0, 60)} · ${a.district}, ${a.city} · ${a.propertyDetails?.grossSqm ?? "?"} m² · ${formatTry(a.currentBid)}`,
                ),
              }]
            : []),
        ],
      });
    } finally {
      setPdfBusy(false);
    }
  };

  // Bölge ortalaması (basit: tahmin birim fiyatı baz alınır)
  const regionAvgUnit = result?.layerSummary.baseUnitPrice ?? 0;
  const userUnit = result?.unitPrice ?? 0;
  const compareDelta = regionAvgUnit > 0 ? ((userUnit - regionAvgUnit) / regionAvgUnit) * 100 : 0;

  return (
    <main className="min-h-screen pt-24 pb-16 text-white">
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" /> AVM — Otomatik Değerleme Modeli
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-white">Ne Kadar Eder?</h1>
          <p className="mt-2 text-slate-400 max-w-3xl">
            İl, ilçe, m² ve temel özelliklerle satış veya kira tahmini alın. Hesaplama;
            bölge baz fiyatı + hedonik (özellik) + emsal (komşu mülk) katmanlarının harmanıdır.
            Roboto Türkçe font ile PDF özet indirebilir, AI yorum isteyebilirsiniz.
          </p>
        </div>

        {/* KATMAN 1 — Eğitici giriş (form ÖNCESI) - GES şablonu */}
        <section className="mb-6 space-y-3">
          <div className="rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/5 to-slate-900/40 p-4">
            <p className="text-sm font-semibold text-cyan-200 mb-2">Değerleme nasıl hesaplanır?</p>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-cyan-400/15 bg-slate-900/30 p-3">
                <p className="font-semibold text-cyan-300 mb-1">1. Bölge Baz Fiyatı</p>
                <p className="text-slate-300">
                  İl/ilçe ortalama m² satış fiyatı — TCMB Konut Fiyat Endeksi + platform verisi.
                </p>
              </div>
              <div className="rounded-lg border border-cyan-400/15 bg-slate-900/30 p-3">
                <p className="font-semibold text-cyan-300 mb-1">2. Hedonik Katman</p>
                <p className="text-slate-300">
                  Bina yaşı, kat, ısıtma, asansör, otopark, manzara → yıpranma/prim çarpanı.
                </p>
              </div>
              <div className="rounded-lg border border-cyan-400/15 bg-slate-900/30 p-3">
                <p className="font-semibold text-cyan-300 mb-1">3. Emsal Karşılaştırma</p>
                <p className="text-slate-300">
                  Aynı bölge benzer mülk satışları → P10/P50/P90 (min/medyan/max) bandı.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-amber-100">
            <p className="font-medium">Önemli uyarı</p>
            <p className="text-sm mt-1">
              Bu araç algoritmik tahmin üretir; resmi ekspertiz raporu değildir. Banka ekspertiz değeri farklı çıkabilir.
              Yatırım tavsiyesi değildir.
            </p>
          </div>

          {/* 5 bölge m² emsal + trend (Endeksa-style benchmark) */}
          <div className="rounded-xl border border-emerald-400/20 bg-slate-900/40 p-4">
            <p className="text-sm font-semibold text-emerald-300 mb-3">📊 5 Bölge m² Rayiç + Yıllık Trend (2026 Q2)</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[520px]">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-700">
                    <th className="text-left py-1.5 pr-2 font-medium">Bölge</th>
                    <th className="text-right py-1.5 px-2 font-medium">m² Rayiç</th>
                    <th className="text-right py-1.5 px-2 font-medium">Yıllık Δ</th>
                    <th className="text-right py-1.5 px-2 font-medium">Kira/m²/ay</th>
                    <th className="text-right py-1.5 px-2 font-medium">Brüt Yield</th>
                    <th className="text-right py-1.5 pl-2 font-medium">Likidite</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-800/50">
                    <td className="py-2 pr-2">
                      <p className="text-white font-medium">İstanbul / Kadıköy</p>
                      <p className="text-[10px] text-slate-500">A+ konum</p>
                    </td>
                    <td className="py-2 px-2 text-right font-mono">₺75K</td>
                    <td className="py-2 px-2 text-right text-emerald-300">+%28</td>
                    <td className="py-2 px-2 text-right">₺350</td>
                    <td className="py-2 px-2 text-right text-cyan-300">%5.6</td>
                    <td className="py-2 pl-2 text-right text-emerald-200">⚡ Hızlı</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-2 pr-2">
                      <p className="text-white font-medium">Ankara / Çankaya</p>
                      <p className="text-[10px] text-slate-500">A konum</p>
                    </td>
                    <td className="py-2 px-2 text-right font-mono">₺38K</td>
                    <td className="py-2 px-2 text-right text-emerald-300">+%18</td>
                    <td className="py-2 px-2 text-right">₺180</td>
                    <td className="py-2 px-2 text-right text-emerald-300">%5.7</td>
                    <td className="py-2 pl-2 text-right text-emerald-200">⚡ Hızlı</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-2 pr-2">
                      <p className="text-white font-medium">İzmir / Karşıyaka</p>
                      <p className="text-[10px] text-slate-500">A konum</p>
                    </td>
                    <td className="py-2 px-2 text-right font-mono">₺52K</td>
                    <td className="py-2 px-2 text-right text-emerald-300">+%24</td>
                    <td className="py-2 px-2 text-right">₺265</td>
                    <td className="py-2 px-2 text-right text-cyan-300">%6.1</td>
                    <td className="py-2 pl-2 text-right text-cyan-200">🚀 Orta</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-2 pr-2">
                      <p className="text-white font-medium">Antalya / Konyaaltı</p>
                      <p className="text-[10px] text-slate-500">Turistik</p>
                    </td>
                    <td className="py-2 px-2 text-right font-mono">₺44K</td>
                    <td className="py-2 px-2 text-right text-amber-300">+%32</td>
                    <td className="py-2 px-2 text-right">₺290</td>
                    <td className="py-2 px-2 text-right text-emerald-300">%7.9</td>
                    <td className="py-2 pl-2 text-right text-amber-200">⏳ Mevsim</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-2">
                      <p className="text-white font-medium">Bursa / Nilüfer</p>
                      <p className="text-[10px] text-slate-500">Büyüyen</p>
                    </td>
                    <td className="py-2 px-2 text-right font-mono">₺28K</td>
                    <td className="py-2 px-2 text-right text-emerald-300">+%21</td>
                    <td className="py-2 px-2 text-right">₺145</td>
                    <td className="py-2 px-2 text-right text-emerald-300">%6.2</td>
                    <td className="py-2 pl-2 text-right text-slate-300">⏱️ Orta</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 italic">
              Veri: TCMB Konut Fiyat Endeksi (KFE) + Endeksa karşılaştırma + Platform Kapanış Endeksi.
              Yıllık Δ Mayıs 2025 → Mayıs 2026; brüt yield = (12 ay kira) / mülk değeri.
            </p>
          </div>
        </section>

        <form
          onSubmit={onSubmit}
          className="grid gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5 md:grid-cols-2 card-luxury"
        >
          <label className="space-y-2">
            <span className="text-sm text-slate-300">İl</span>
            <select
              value={form.city}
              onChange={(event) => onCityChange(event.target.value as CityKey)}
              className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm"
            >
              {CITY_OPTIONS.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">İlçe (opsiyonel)</span>
            <select
              value={form.district}
              onChange={(event) => setForm((prev) => ({ ...prev, district: event.target.value }))}
              className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm"
            >
              {districtOptions.length > 0 ? (
                districtOptions.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))
              ) : (
                <option value="">Bu ilde ilçe bazlı veri yok</option>
              )}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Brüt m²</span>
            <Input
              type="number"
              min={10}
              value={form.grossM2}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, grossM2: Number(event.target.value || 0) }))
              }
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Bina yaşı</span>
            <Input
              type="number"
              min={0}
              value={form.buildingAge}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, buildingAge: Number(event.target.value || 0) }))
              }
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">İşlem tipi</span>
            <select
              value={form.transactionType}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, transactionType: event.target.value as TransactionType }))
              }
              className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm"
            >
              <option value="sale">Satılık</option>
              <option value="rent">Kiralık</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Daire durumu</span>
            <select
              value={form.condition}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, condition: event.target.value as PropertyCondition }))
              }
              className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm"
            >
              <option value="new">Sıfıra yakın</option>
              <option value="good">İyi durumda</option>
              <option value="needs_renovation">Tadilat gerekir</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.hasElevator}
              onChange={(event) => setForm((prev) => ({ ...prev, hasElevator: event.target.checked }))}
            />
            Asansör var
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.hasParking}
              onChange={(event) => setForm((prev) => ({ ...prev, hasParking: event.target.checked }))}
            />
            Otopark var
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm text-slate-300">Ada / Parsel (sadece referans)</span>
            <Input
              value={form.parcelInfo}
              placeholder="Örn: 123 ada 45 parsel"
              onChange={(event) => setForm((prev) => ({ ...prev, parcelInfo: event.target.value }))}
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm text-slate-300">Adres notu (sadece referans)</span>
            <Input
              value={form.addressNote}
              placeholder="Mahalle / sokak notu"
              onChange={(event) => setForm((prev) => ({ ...prev, addressNote: event.target.value }))}
            />
          </label>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <Button type="submit" variant="accent">
              <Calculator className="h-4 w-4" /> Ne Kadar Eder?
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(INITIAL_STATE);
                setResult(null);
                setAiReply(null);
                setError("");
              }}
            >
              Formu sıfırla
            </Button>
          </div>
          {error ? <p className="md:col-span-2 text-sm text-rose-300">{error}</p> : null}
        </form>

        {result ? (
          <>
            {/* Üst — Ana çıktı + Tahmin bandı görsel */}
            <section className="mt-6 rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 p-6">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                    <Home className="h-5 w-5 text-emerald-300" /> Tahmini Sonuç
                  </h2>
                  <p className="text-xs text-slate-400">
                    {cityLabel}{form.district ? " · " + form.district : ""} · {form.grossM2} m² · {form.transactionType === "rent" ? "Kiralık" : "Satılık"}
                  </p>
                </div>
                <div className="text-end">
                  <div className="text-3xl md:text-4xl font-bold text-emerald-200">
                    {formatTry(result.estimatedValue)}
                    {form.transactionType === "rent" ? <span className="text-sm font-normal text-slate-400"> /ay</span> : null}
                  </div>
                  {showFx && (
                    <div className="text-[11px] text-amber-300/80 mt-0.5">
                      ≈ {formatFromTry(result.estimatedValue)}
                      <span className="text-slate-500"> ({currency} referans · değerleme ₺)</span>
                    </div>
                  )}
                  <div className="text-xs text-slate-400 mt-1">
                    Güven: {result.confidence === "high" ? "Yüksek" : "Orta"} · %{Math.round(result.confidenceScore * 100)}
                  </div>
                </div>
              </div>

              {/* Tahmin bandı (CSS bar) */}
              <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                <span>{formatTry(result.minValue)}</span>
                <span className="text-emerald-200 font-medium">±%{result.confidenceBandPct}</span>
                <span>{formatTry(result.maxValue)}</span>
              </div>
              {showFx && (
                <p className="mt-1 text-[10px] text-amber-300/70 text-end italic">
                  Aralık ≈ {formatFromTry(result.minValue)} – {formatFromTry(result.maxValue)} (yaklaşık)
                </p>
              )}
              <div className="relative h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="absolute top-0 h-full bg-gradient-to-r from-cyan-500/60 to-emerald-500/60"
                  style={{ left: "10%", right: "10%" }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-emerald-300/40"
                  style={{ left: "calc(50% - 6px)" }}
                  title="Merkez tahmin"
                />
              </div>
              <p className="mt-3 text-sm text-emerald-100/90">{result.note}</p>
            </section>

            {/* Karşılaştırma + katman kart */}
            <section className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-300" /> Bölge Ortalaması Karşılaştırma
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bölge baz birim fiyatı</span>
                    <strong>{formatTry(regionAvgUnit)}/m²</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bu mülkün birim fiyatı</span>
                    <strong className="text-cyan-200">{formatTry(userUnit)}/m²</strong>
                  </div>
                  <div className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium",
                    Math.abs(compareDelta) < 5 ? "bg-slate-800 text-slate-200" :
                    compareDelta > 0 ? "bg-amber-500/15 text-amber-200" : "bg-emerald-500/15 text-emerald-200",
                  )}>
                    {Math.abs(compareDelta) < 5
                      ? `Bölge ortalamasıyla uyumlu (±%${Math.abs(compareDelta).toFixed(1)})`
                      : compareDelta > 0
                        ? `Bölge ortalamasının %${compareDelta.toFixed(1)} üzerinde`
                        : `Bölge ortalamasının %${Math.abs(compareDelta).toFixed(1)} altında`}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-violet-300" /> Hesaplama Katmanları (₺/m²)
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    { label: "Bölge baz", value: result.layerSummary.baseUnitPrice, color: "bg-slate-500" },
                    { label: "Hedonik (özellik)", value: result.layerSummary.hedonicUnitPrice, color: "bg-cyan-500" },
                    { label: "Emsal (komşu)", value: result.layerSummary.comparableUnitPrice, color: "bg-emerald-500" },
                  ].map((row) => {
                    const maxv = Math.max(
                      result.layerSummary.baseUnitPrice,
                      result.layerSummary.hedonicUnitPrice,
                      result.layerSummary.comparableUnitPrice,
                    ) * 1.05;
                    const pct = Math.min(100, (row.value / maxv) * 100);
                    return (
                      <div key={row.label}>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>{row.label}</span>
                          <strong>{formatTry(row.value)}</strong>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className={cn("h-full transition-all", row.color)} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <p className="mt-2 text-[11px] text-slate-500">
                    Mekânsal düzeltme katsayısı: <strong>{result.layerSummary.spatialFactor.toFixed(3)}</strong>
                  </p>
                </div>
              </div>
            </section>

            {/* AI yorum + PDF aksiyonları */}
            <section className="mt-4 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-300" /> AI Yorum + PDF Rapor
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={askAi}
                    disabled={aiBusy}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {aiBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {aiBusy ? "Düşünüyor…" : aiReply ? "Tekrar sor" : "AI yorum iste"}
                  </Button>
                  <Button
                    type="button"
                    onClick={downloadPdf}
                    disabled={pdfBusy}
                    size="sm"
                    variant="accent"
                  >
                    {pdfBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
                    PDF Rapor İndir
                  </Button>
                </div>
              </div>
              {aiReply ? (
                <div className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-100 leading-relaxed whitespace-pre-line">
                  {aiReply}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  AI yorum, değerlemeyi günlük dilde açıklar ve pazarlık marjı önerir. PDF rapor Roboto Türkçe font ile
                  oluşturulur; özellik dökümü, katman analizi, AI yorum (alındıysa) ve bölgeden benzer ilanları içerir.
                </p>
              )}
            </section>

            {/* Bölgeden benzer ilanlar */}
            {similar.length > 0 ? (
              <section className="mt-4 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-300" /> Bölgeden Benzer İlanlar
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {similar.map((a) => (
                    <a
                      key={a.id}
                      href={`/ilan/${a.id}`}
                      className="block rounded-xl border border-white/10 bg-slate-950/40 overflow-hidden hover:border-cyan-400/40 transition-colors"
                    >
                      <div className="aspect-[16/10] bg-slate-800 overflow-hidden">
                        <img src={a.images[0]} alt={a.title} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3 space-y-1">
                        <div className="text-xs text-slate-400 truncate">{a.district}, {a.city}</div>
                        <div className="text-sm font-medium text-white line-clamp-2">{a.title}</div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-bold text-cyan-300">{formatTry(a.currentBid)}</span>
                          <span className="text-[10px] text-slate-500">{a.propertyDetails?.grossSqm ?? "?"} m²</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : null}

        {/* KATMAN 4 — Güven, metodoloji ve disclaimer (DAİMA görünür, sayfa altı) */}
        <section className="mt-12 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-cyan-300" />
            <h2 className="text-xl font-bold text-white">Güven ve Metodoloji</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-cyan-400/20 bg-slate-900/40 p-4">
              <p className="text-sm font-semibold text-cyan-200 mb-2">Veri Kaynakları</p>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• <strong>TCMB EVDS</strong>: Konut Fiyat Endeksi (TP.HKFE01/02/03)</li>
                <li>• <strong>regionalPriceData</strong>: 10 büyük şehir + ilçe baz fiyatlar</li>
                <li>• <strong>Platform işlem geçmişi</strong>: listing_transaction_history</li>
                <li>• <strong>Catalog Auction</strong>: 12 demo + canlı ilanlar</li>
                <li>• <strong>AI (ai_qa)</strong>: bölgesel yorum + fallback</li>
              </ul>
            </div>

            <div className="rounded-xl border border-violet-400/20 bg-slate-900/40 p-4">
              <p className="text-sm font-semibold text-violet-200 mb-2">Hesap Katmanları</p>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• <strong>1. Bölge baz</strong>: il/ilçe ortalama × m² (TCMB endeks ayarlı)</li>
                <li>• <strong>2. Hedonik</strong>: bina yaşı %0.5-2/yıl + asansör/otopark/manzara primi</li>
                <li>• <strong>3. Emsal</strong>: aynı bölge benzer mülk son işlemleri (P10/P50/P90)</li>
                <li>• <strong>Ağırlık</strong>: bölge %40 + hedonik %30 + emsal %30</li>
                <li>• <strong>Güven seviyesi</strong>: veri yoğunluğu × tarihsel doğrulama</li>
              </ul>
            </div>

            <div className="rounded-xl border border-emerald-400/20 bg-slate-900/40 p-4">
              <p className="text-sm font-semibold text-emerald-200 mb-2">Doğrulama Çerçevesi</p>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• <strong>SPK ekspertizi</strong>: lisanslı değerleme uzmanı (zorunlu kararlar için)</li>
                <li>• <strong>TKGM tapu inceleme</strong>: gerçek tapu+irtifak+ipotek kayıt</li>
                <li>• <strong>Banka ekspertizi</strong>: kredi başvurusu için banka kendi yapar</li>
                <li>• <strong>2 farklı tahmin karşılaştır</strong>: bu sayfa + Endeksa/sahibinden</li>
              </ul>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-4">
              <p className="text-sm font-semibold text-amber-200 mb-2">Disclaimer</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bu sayfa <strong>algoritmik tahmin</strong> üretir; SPK uyumlu resmi ekspertiz
                raporu yerine geçmez. Banka kredi ekspertiz değeri ±%15-25 farklı çıkabilir.
                Tahmin doğruluğu veri yoğunluğuna bağlıdır; az emsal olan bölgelerde güven
                seviyesi düşer. Yatırım, satım veya alım kararı için lisanslı uzman görüşü şart.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
