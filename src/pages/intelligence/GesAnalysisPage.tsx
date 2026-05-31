import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Calculator, Sun, BookOpen, FileText, Zap, MapPin, Building,
  AlertTriangle, CheckCircle2, ScrollText, Scale, TrendingUp, BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchPvgisSolar } from "@/lib/data/pvgisClient";
import type { PvgisSolarResponse } from "@/lib/data/pvgisTypes";
import {
  safeCalculateGesFeasibility,
  buildGesPrefeasibilityReport,
  type GesFeasibilityResult,
} from "@/lib/engineering";
import { fmtNum, fmtPct, fmtScore } from "@/lib/engineering/formatDisplay";
import { downloadGesEndeksPdf } from "@/lib/reports/gesEndeksPdf";
import { PreFeasibilityBanner } from "@/components/compliance/PreFeasibilityBanner";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";

function num(s: string, fallback: number): number {
  const n = Number(String(s).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

export default function GesAnalysisPage() {
  const [dcKwp, setDcKwp] = useState("5000");
  const [ghi, setGhi] = useState("1780");
  const [landM2, setLandM2] = useState("100000");
  const [price, setPrice] = useState("2.8");
  const [capexPerKwp, setCapexPerKwp] = useState("12000");
  const [discount, setDiscount] = useState("10");
  const [lat, setLat] = useState("37.87");
  const [lon, setLon] = useState("32.49");
  const [pvgisNote, setPvgisNote] = useState<string | null>(null);
  const [pvgisPayload, setPvgisPayload] = useState<PvgisSolarResponse | null>(null);
  const [fetchingPvgis, setFetchingPvgis] = useState(false);
  const [result, setResult] = useState<GesFeasibilityResult | null>(null);
  const [calcError, setCalcError] = useState("");

  const loadPvgis = async () => {
    setFetchingPvgis(true);
    setPvgisNote(null);
    setPvgisPayload(null);
    try {
      const data = await fetchPvgisSolar({ lat: num(lat, 37.87), lon: num(lon, 32.49), tiltDeg: 25 });
      if (data) {
        setGhi(String(Math.round(data.annualIrradiationKwhM2)));
        const monthly = data.monthly.map((m) => m.H_i_m ?? m.E_m);
        setPvgisPayload({
          source: "pvgis_live",
          lat: data.lat,
          lon: data.lon,
          tiltDeg: data.tilt,
          annualIrradiationKwhM2: data.annualIrradiationKwhM2,
          monthlyIrradiationKwhM2: monthly,
          fetchedAt: new Date().toISOString(),
          providerAvailable: true,
        });
        setPvgisNote(`PVGIS: ${data.source}`);
      } else {
        setPvgisNote("PVGIS ulasilamadi — manuel GHI ve mevsimsel profil kullanilir.");
      }
    } finally {
      setFetchingPvgis(false);
    }
  };

  const run = () => {
    setCalcError("");
    try {
    setResult(
      safeCalculateGesFeasibility({
        landAreaM2: num(landM2, 100000),
        dcCapacityKwp: num(dcKwp, 5000),
        annualGhiKwhM2: num(ghi, 1780),
        pvgis: pvgisPayload,
        electricityPriceTryPerKwh: num(price, 2.5),
        capexTryPerKwp: num(capexPerKwp, 12000),
        annualOpexTry: num(dcKwp, 5000) * 120,
        discountRatePct: num(discount, 10),
        projectYears: 25,
      }),
    );
    } catch {
      setCalcError("Hesaplama tamamlanamadi.");
      setResult(null);
    }
  };

  // Markdown ön fizibilite — alternatif metin formatı (mevcut, korundu).
  const downloadMdReport = () => {
    if (!result) return;
    const md = buildGesPrefeasibilityReport(
      {
        enlem: lat,
        boylam: lon,
        arazi_m2: landM2,
        dc_kwp: dcKwp,
        ghi: ghi,
        veri: result.dataSource,
      },
      result,
    );
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ges-on-fizibilite.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ANA: İhaleal GES Endeks Raporu — kapsamlı PDF (Roboto TR, AI, sensitivity, nakit akış).
  const [pdfBusy, setPdfBusy] = useState(false);
  const downloadPdfReport = async () => {
    if (!result || pdfBusy) return;
    setPdfBusy(true);
    try {
      await downloadGesEndeksPdf(
        {
          enlem: lat,
          boylam: lon,
          araziM2: landM2,
          dcKwp,
          ghi,
          electricityPrice: price,
          capexPerKwp,
          discountRate: discount,
        },
        result,
      );
    } finally {
      setPdfBusy(false);
    }
  };

  // Türetilmiş hızlı metrikler + KATMAN 3 graph data
  const derived = useMemo(() => {
    if (!result) return null;
    const dcKwpN = Number(dcKwp.replace(",", ".")) || 0;
    const priceN = Number(price.replace(",", ".")) || 0;
    const capexPerN = Number(capexPerKwp.replace(",", ".")) || 0;
    const discountN = Number(discount.replace(",", ".")) || 10;
    const totalCapex = dcKwpN * capexPerN;
    const annualKwh = result.annualProductionKwh || 0;
    const annualRev = annualKwh * priceN;
    const annualOpex = dcKwpN * 120;
    const annualNet = annualRev - annualOpex;
    const payback = annualNet > 0 && totalCapex > 0 ? totalCapex / annualNet : null;
    const r = discountN / 100;
    const af = (1 - Math.pow(1 + r, -25)) / r;
    const dNpv = annualKwh * priceN * 0.1 * af;
    const dNpvUpe = annualKwh * priceN * 0.2 * af;
    const dNpvProd = annualKwh * priceN * 0.1 * af; // üretim %10 ≈ gelir %10
    const dNpvCap = totalCapex * 0.15;

    // 25 yıl nakit akış + birikimli
    const cashflow = Array.from({ length: 25 }, (_, i) => {
      const yr = i + 1;
      const deg = Math.pow(0.995, yr); // %0.5 degradasyon
      const rev = annualKwh * deg * priceN;
      const opex = annualOpex * Math.pow(1.05, yr); // %5 OPEX artış
      const net = rev - opex;
      return { yil: yr, gelir: Math.round(rev), opex: Math.round(opex), net: Math.round(net) };
    });
    let cum = -totalCapex;
    const cumulative = cashflow.map((c) => {
      cum += c.net;
      return { yil: c.yil, birikimli: Math.round(cum) };
    });

    // Aylık üretim profili (Türkiye ortalaması — yaz pik, kış düşük)
    const monthlyShare = [0.055, 0.065, 0.085, 0.095, 0.115, 0.12, 0.125, 0.115, 0.095, 0.075, 0.06, 0.045];
    const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    const monthlyProd = monthlyShare.map((s, i) => ({
      ay: months[i],
      uretim: Math.round(annualKwh * s),
    }));

    // 3 senaryo (kötü/baz/iyi)
    const senaryolar = [
      { ad: "Kötümser", npv: result.npvTry - dNpvUpe, irr: result.irrPct - 3 },
      { ad: "Baz", npv: result.npvTry, irr: result.irrPct },
      { ad: "İyimser", npv: result.npvTry + dNpvUpe, irr: result.irrPct + 3 },
    ];

    // CAPEX dağılımı (sektör tipik)
    const capexBreakdown = [
      { kalem: "Panel", oran: 40, tutar: Math.round(totalCapex * 0.4) },
      { kalem: "Inverter", oran: 15, tutar: Math.round(totalCapex * 0.15) },
      { kalem: "Konstrüksiyon", oran: 15, tutar: Math.round(totalCapex * 0.15) },
      { kalem: "İşçilik", oran: 15, tutar: Math.round(totalCapex * 0.15) },
      { kalem: "Diğer (kablo, izleme, BoS)", oran: 15, tutar: Math.round(totalCapex * 0.15) },
    ];

    // Arazi → MW kapasite önerisi (1 MW ≈ 10.000 m²)
    const araziN = Number(landM2.replace(",", ".")) || 0;
    const teorikMw = araziN / 10000;
    const lisansUyari = dcKwpN > 5000;

    return {
      totalCapex,
      annualRev,
      annualNet,
      payback,
      npvUp: result.npvTry + dNpv,
      npvDown: result.npvTry - dNpv,
      npvCapDelta: dNpvCap,
      npvProdDelta: dNpvProd,
      irrVsDiscount: result.irrPct > discountN,
      cashflow,
      cumulative,
      monthlyProd,
      senaryolar,
      capexBreakdown,
      teorikMw,
      lisansUyari,
    };
  }, [result, dcKwp, price, capexPerKwp, discount, landM2]);

  const scores = useMemo(
    () =>
      result
        ? {
            suitability: result.suitabilityScore,
            investment: result.investmentScore,
            risk: result.riskScore,
          }
        : null,
    [result],
  );

  return (
    <motion.div className="min-h-screen pt-24 pb-16">
      <motion.div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-blue-950/50 to-transparent pointer-events-none" aria-hidden />
      <motion.div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 text-slate-400">
          <Link to={INTELLIGENCE_HUB_PATH}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Arastirma
          </Link>
        </Button>
        <motion.div className="flex items-center gap-3 mb-4">
          <motion.div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
            <Sun className="w-5 h-5 text-amber-300" />
          </motion.div>
          <motion.div>
            <h1 className="text-2xl font-bold text-white">GES mühendislik analizi</h1>
            <p className="text-sm text-slate-400">Ön fizibilite — NPV, IRR, LCOE (bankable değil)</p>
          </motion.div>
        </motion.div>
        <PreFeasibilityBanner className="mb-6 text-amber-100" />

        {/* KATMAN 1 — Eğitici giriş (form ÖNCESI): GES nedir/neden + yatırım tipleri + lisans uyarısı */}
        <section className="mb-8 space-y-4">
          <Card className="card-luxury border-amber-500/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <BookOpen className="h-5 w-5 text-amber-300 flex-shrink-0 mt-0.5" />
                <h2 className="text-base font-semibold text-white">GES nedir, neden Türkiye?</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-amber-400/20 bg-amber-500/5 p-3">
                  <p className="text-xs font-semibold text-amber-300 mb-1">Güneşlenme</p>
                  <p className="text-slate-300">
                    Türkiye yıllık <strong className="text-amber-200">2700+ saat</strong> güneşlenme,
                    ortalama <strong>1.450 kWh/m²</strong> radyasyon — AB ortalamasının %35 üstü.
                  </p>
                </div>
                <div className="rounded-lg border border-amber-400/20 bg-amber-500/5 p-3">
                  <p className="text-xs font-semibold text-amber-300 mb-1">Üretim Kapasitesi</p>
                  <p className="text-slate-300">
                    1 kWp kurulu güç yıllık <strong className="text-amber-200">1.200-1.700 kWh</strong> üretir
                    (bölge, eğim, gölgelenme bağlı).
                  </p>
                </div>
                <div className="rounded-lg border border-amber-400/20 bg-amber-500/5 p-3">
                  <p className="text-xs font-semibold text-amber-300 mb-1">Geri Dönüş</p>
                  <p className="text-slate-300">
                    Tipik geri ödeme <strong className="text-amber-200">4-6 yıl</strong>; panel teknik
                    ömrü <strong>25-30 yıl</strong> garantili.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-3">
            <Card className="card-luxury border-cyan-400/20">
              <CardContent className="p-4">
                <Building className="h-5 w-5 text-cyan-300 mb-2" />
                <p className="text-sm font-semibold text-white">Çatı GES</p>
                <p className="mt-1 text-xs text-slate-400">
                  Konut/ticari çatılarda öz tüketim — şebeke desteği. 10 kWp altı bireysel,
                  500 kWp altı KOBİ. <strong className="text-cyan-300">Hızlı dönüş</strong> (3-5 yıl).
                </p>
              </CardContent>
            </Card>
            <Card className="card-luxury border-emerald-400/20">
              <CardContent className="p-4">
                <MapPin className="h-5 w-5 text-emerald-300 mb-2" />
                <p className="text-sm font-semibold text-white">Arazi GES</p>
                <p className="mt-1 text-xs text-slate-400">
                  Marjinal tarım arazisi (İl Tarım onayı), boş arazi — büyük ölçek MW seviyesi.
                  <strong className="text-emerald-300"> 5 MW altı lisanssız</strong>.
                </p>
              </CardContent>
            </Card>
            <Card className="card-luxury border-violet-400/20">
              <CardContent className="p-4">
                <Zap className="h-5 w-5 text-violet-300 mb-2" />
                <p className="text-sm font-semibold text-white">Otopark / Sera GES</p>
                <p className="mt-1 text-xs text-slate-400">
                  AVM/sanayi otoparkı + sera çatısı çift kullanım. CAPEX yüksek ama imar ek hak.
                  <strong className="text-violet-300"> Hibrit gelir</strong>.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="card-luxury border-rose-500/30 bg-rose-950/30">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-300 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300">
                <p className="font-semibold text-rose-200 mb-1">2026 Lisans Eşiği</p>
                <p>
                  <strong className="text-white">5 MW altı</strong> kurulu güç{" "}
                  <span className="text-emerald-300 font-semibold">LİSANSSIZ</span> (Çağrı Mektubu +
                  EDAŞ bağlantı yeterli). <strong className="text-white">5 MW üzeri</strong>{" "}
                  <span className="text-rose-300 font-semibold">EPDK lisansı</span> + ÇED + tarife
                  sözleşmesi şart. 1 Mayıs 2026 itibarıyla{" "}
                  <strong className="text-amber-300">saatlik mahsuplaşma</strong> aktif — öz tüketim
                  4× çarpan kaldırıldı.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {calcError ? <p className="mb-4 text-sm text-red-300">{calcError}</p> : null}
        {result?.dataSource === "ghi_annual_fallback" ? (
          <p className="mb-4 text-xs text-amber-200/90">PVGIS aylik veri yok — GHI uzerinden mevsimsel profil kullanildi.</p>
        ) : null}
        {pvgisNote && !result ? <p className="mb-4 text-xs text-amber-200/80">{pvgisNote}</p> : null}
        <motion.div className="grid lg:grid-cols-2 gap-8">
          <Card className="card-luxury border-white/10">
            <CardContent className="p-6 space-y-4">
              <motion.div className="grid grid-cols-2 gap-4">
                <motion.div className="col-span-2">
                  <Label>Enlem / Boylam</Label>
                  <motion.div className="grid grid-cols-2 gap-2 mt-1">
                    <Input value={lat} onChange={(e) => setLat(e.target.value)} />
                    <Input value={lon} onChange={(e) => setLon(e.target.value)} />
                  </motion.div>
                  <Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={loadPvgis} disabled={fetchingPvgis}>
                    {fetchingPvgis ? "PVGIS..." : "PVGIS ile GHI doldur"}
                  </Button>
                  {pvgisNote ? <p className="text-[10px] text-slate-500 mt-1">{pvgisNote}</p> : null}
                </motion.div>
                <motion.div>
                  <Label>DC kWp</Label>
                  <Input value={dcKwp} onChange={(e) => setDcKwp(e.target.value)} className="mt-1" />
                </motion.div>
                <motion.div>
                  <Label>GHI</Label>
                  <Input value={ghi} onChange={(e) => setGhi(e.target.value)} className="mt-1" />
                </motion.div>
                <motion.div>
                  <Label>Arazi m2</Label>
                  <Input value={landM2} onChange={(e) => setLandM2(e.target.value)} className="mt-1" />
                </motion.div>
                <motion.div>
                  <Label>Fiyat TRY/kWh</Label>
                  <Input value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1" />
                </motion.div>
                <motion.div>
                  <Label>CAPEX/kWp</Label>
                  <Input value={capexPerKwp} onChange={(e) => setCapexPerKwp(e.target.value)} className="mt-1" />
                </motion.div>
                <motion.div>
                  <Label>Iskonto %</Label>
                  <Input value={discount} onChange={(e) => setDiscount(e.target.value)} className="mt-1" />
                </motion.div>
              </motion.div>
              <Button className="btn-primary w-full gap-2" onClick={run}>
                <Calculator className="w-4 h-4" /> Analiz
              </Button>
            </CardContent>
          </Card>
          {result && scores ? (
            <motion.div className="space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <motion.div className="grid grid-cols-3 gap-3">
                {(
                  [
                    ["Uygunluk", scores.suitability],
                    ["Yatirim", scores.investment],
                    ["Risk", scores.risk],
                  ] as const
                ).map(([l, v]) => (
                  <motion.div key={l} className="card-luxury p-4 text-center">
                    <p className="text-[10px] text-slate-500">{l}</p>
                    <p className="text-2xl font-bold text-cyan-300">{fmtScore(v)}</p>
                  </motion.div>
                ))}
              </motion.div>
              <Card className="card-luxury">
                <CardContent className="p-5 text-sm text-slate-300 space-y-2">
                  <p>
                    Yillik: <strong>{fmtNum(result.annualProductionKwh)} kWh</strong>
                  </p>
                  <p>
                    NPV: <strong>{fmtNum(result.npvTry, { suffix: " TRY" })}</strong>
                  </p>
                  <p>
                    IRR: <strong>{fmtPct(result.irrPct)}</strong>
                  </p>
                  <p>
                    LCOE: <strong>{fmtNum(result.lcoeTryPerKwh, { digits: 2, suffix: " TRY/kWh" })}</strong>
                  </p>
                  <p className="text-[10px] text-slate-500">Veri: {result.dataSource} | Guven: {result.confidence}</p>
                </CardContent>
              </Card>
              {/* CEPHE 2: derinleştirme — geri ödeme + sensitivity + IRR yorumu */}
              {derived ? (
                <>
                  <Card className="card-luxury">
                    <CardContent className="p-5 text-sm text-slate-300 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                        Türetilmiş Metrikler
                      </p>
                      <p>
                        Toplam CAPEX: <strong>{fmtNum(derived.totalCapex)} TRY</strong>
                      </p>
                      <p>
                        Yıllık net nakit (gelir − OPEX):{" "}
                        <strong>{fmtNum(derived.annualNet)} TRY</strong>
                      </p>
                      <p>
                        Geri ödeme süresi (basit):{" "}
                        <strong>
                          {derived.payback != null
                            ? `${derived.payback.toFixed(1)} yıl`
                            : "—"}
                        </strong>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        <strong>Çünkü</strong>: CAPEX / yıllık net nakit. 25 yıl ömür içinde
                        geri ödenebilir mi → {derived.payback != null && derived.payback < 25
                          ? "EVET — kalan yıllar net kâr."
                          : "değerlendirme yetersiz."}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-luxury">
                    <CardContent className="p-5 text-sm text-slate-300 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                        Hassasiyet (Elektrik Fiyatı ±%10)
                      </p>
                      <p>
                        Fiyat <span className="text-emerald-300">+%10</span>: NPV ={" "}
                        <strong>{fmtNum(derived.npvUp)} TRY</strong>
                      </p>
                      <p>
                        Baz fiyat: NPV ={" "}
                        <strong>{fmtNum(result.npvTry)} TRY</strong>
                      </p>
                      <p>
                        Fiyat <span className="text-rose-300">−%10</span>: NPV ={" "}
                        <strong>{fmtNum(derived.npvDown)} TRY</strong>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        <strong>Çünkü</strong>: NPV'nin elektrik fiyatına duyarlılığını ölçer.
                        EPDK regülasyonu ve YEKDEM kapsamı bu farkı kritik kılar.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-luxury border-emerald-400/20">
                    <CardContent className="p-5 text-sm text-slate-300 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                        Karar Çerçevesi
                      </p>
                      <p>
                        IRR ({fmtPct(result.irrPct)}){" "}
                        {derived.irrVsDiscount ? (
                          <span className="text-emerald-300 font-bold"> &gt; </span>
                        ) : (
                          <span className="text-rose-300 font-bold"> &lt; </span>
                        )}{" "}
                        İndirgeme oranı (%{discount})
                      </p>
                      <p className="text-[11px] text-slate-400">
                        <strong>Çünkü</strong>: IRR &gt; indirgeme oranı ise yatırım
                        sermayenin alternatif getirisinden DAHA ÇOK kazandırır.{" "}
                        {derived.irrVsDiscount
                          ? "→ Bu projede AKLİ ŞART karşılandı."
                          : "→ Alternatif yatırım (mevduat/tahvil) düşünülmeli."}
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : null}

              <div className="grid sm:grid-cols-2 gap-2">
                <Button
                  variant="accent"
                  className="w-full"
                  disabled={pdfBusy}
                  onClick={downloadPdfReport}
                >
                  {pdfBusy ? "PDF hazırlanıyor…" : "İhaleal GES Endeks Raporu (PDF)"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={downloadMdReport}
                >
                  Markdown özet (.md)
                </Button>
              </div>
              <p className="text-[10px] text-slate-500">{result.limitations[result.limitations.length - 1]}</p>
            </motion.div>
          ) : null}
        </motion.div>

        {/* KATMAN 3 — Grafikler ve tablolar (DOLU sonuç) — sonuç sonrası */}
        {result && derived ? (
          <section className="mt-10 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-bold text-white">Detaylı Analiz Panosu</h2>
            </div>

            {/* 25 yıl nakit akış */}
            <Card className="card-luxury">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-white mb-3">25 Yıllık Nakit Akışı (TRY)</p>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={derived.cashflow}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="yil" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
                      formatter={(v: number) => `₺${v.toLocaleString("tr-TR")}`}
                    />
                    <Area type="monotone" dataKey="gelir" stroke="#22d3ee" fill="#22d3ee33" name="Gelir" />
                    <Area type="monotone" dataKey="net" stroke="#10b981" fill="#10b98144" name="Net" />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-xs text-slate-400 mt-2">
                  <strong>Çünkü</strong>: %0.5 yıllık degradasyon (panel verim kaybı) ve %5 OPEX
                  artışı modelde dahil. Gelir hafif düşerken giderler tırmanır — uzun vadeli
                  ekonomik realizm bu eğride görünür.
                </p>
              </CardContent>
            </Card>

            {/* Kümülatif kâr eğrisi */}
            <Card className="card-luxury">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-white mb-3">Kümülatif Kâr Eğrisi (CAPEX dahil)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={derived.cumulative}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="yil" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
                      formatter={(v: number) => `₺${v.toLocaleString("tr-TR")}`}
                    />
                    <ReferenceLine y={0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Break-even", fill: "#f59e0b", fontSize: 10 }} />
                    <Line type="monotone" dataKey="birikimli" stroke="#22d3ee" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-slate-400 mt-2">
                  <strong>Çünkü</strong>: Eğri 0 çizgisini geçtiği yıl yatırım net kâra geçer
                  (break-even). Yıl {derived.payback != null ? Math.ceil(derived.payback) : "—"} sonrası
                  her TRY net kazançtır.
                </p>
              </CardContent>
            </Card>

            {/* Aylık üretim profili */}
            <Card className="card-luxury">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-white mb-3">Aylık Üretim Profili (kWh)</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={derived.monthlyProd}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="ay" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
                      formatter={(v: number) => `${v.toLocaleString("tr-TR")} kWh`}
                    />
                    <Bar dataKey="uretim" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-slate-400 mt-2">
                  <strong>Çünkü</strong>: Türkiye için Hazi-Temmuz pik (~%12.5/ay), Aralık dip
                  (~%4.5/ay). Yaz aylarında nakit akışı kuvvetli; kış senaryosu
                  pesimistik baz alınmalı.
                </p>
              </CardContent>
            </Card>

            {/* 3 Senaryo tablosu */}
            <Card className="card-luxury">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-white mb-3">Senaryo Analizi</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500 uppercase border-b border-slate-800">
                        <th className="text-left py-2">Senaryo</th>
                        <th className="text-right py-2">NPV (TRY)</th>
                        <th className="text-right py-2">IRR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {derived.senaryolar.map((s, i) => (
                        <tr
                          key={s.ad}
                          className={`border-b border-slate-800/50 ${
                            i === 1 ? "bg-cyan-500/5" : ""
                          }`}
                        >
                          <td className="py-2 text-slate-200 font-medium">{s.ad}</td>
                          <td className="text-right text-slate-300">{fmtNum(s.npv)}</td>
                          <td className={`text-right font-semibold ${s.irr > 10 ? "text-emerald-300" : "text-rose-300"}`}>
                            {fmtPct(s.irr)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  <strong>Çünkü</strong>: Yatırımcı karar verirken kötümser senaryo PV'sini referans
                  almalı (banka kredi onayı genelde P75 üzerinden). İyimser senaryo motivasyon değil,
                  üst sınır.
                </p>
              </CardContent>
            </Card>

            {/* CAPEX dökümü tablosu */}
            <Card className="card-luxury">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-white mb-3">CAPEX Dökümü (Sektör Tipik %)</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500 uppercase border-b border-slate-800">
                        <th className="text-left py-2">Kalem</th>
                        <th className="text-right py-2">Oran</th>
                        <th className="text-right py-2">Tutar (TRY)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {derived.capexBreakdown.map((c) => (
                        <tr key={c.kalem} className="border-b border-slate-800/50">
                          <td className="py-2 text-slate-200">{c.kalem}</td>
                          <td className="text-right text-slate-400">%{c.oran}</td>
                          <td className="text-right text-slate-300">{fmtNum(c.tutar)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  <strong>Çünkü</strong>: Panel %40 baskın; verimli pazarlık alanı. Inverter (%15)
                  10-12 yıl ömür — yeniden CAPEX'e dahil. Konstrüksiyon + işçilik %30 yerel.
                </p>
              </CardContent>
            </Card>

            {/* Arazi uygunluk */}
            <Card className="card-luxury border-emerald-400/20">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-emerald-300 mb-2">
                  Arazi Uygunluk Değerlendirmesi
                </p>
                <p className="text-sm text-slate-300">
                  Girilen <strong>{landM2} m²</strong> alan teorik olarak yaklaşık{" "}
                  <strong className="text-white">{derived.teorikMw.toFixed(2)} MW</strong> kapasite
                  destekleyebilir (1 MW ≈ 10.000 m² rule of thumb). Talep ettiğiniz{" "}
                  <strong>{dcKwp} kWp</strong> ({(Number(dcKwp) / 1000).toFixed(2)} MW) için arazi{" "}
                  {Number(dcKwp) / 1000 < derived.teorikMw ? (
                    <span className="text-emerald-300 font-semibold">YETERLİ</span>
                  ) : (
                    <span className="text-rose-300 font-semibold">YETERSİZ</span>
                  )}.
                </p>
                {derived.lisansUyari ? (
                  <p className="mt-2 text-sm text-rose-200 bg-rose-500/10 p-3 rounded-lg border border-rose-500/30">
                    ⚠️ 5 MW eşiğini aştınız — <strong>EPDK lisansı şart</strong>. Lisanssız yol
                    kapalı. Ayrı bir hukuki süreç ve ÇED gerekir.
                  </p>
                ) : null}
                <p className="text-xs text-slate-400 mt-3">
                  <strong>Çünkü</strong>: Trafo + ENH (Enerji Nakil Hattı) bağlantı kapasitesi
                  EDAŞ'tan teyit edilmeli — arazi büyüklüğü kapasite garantisi vermez.
                </p>
              </CardContent>
            </Card>
          </section>
        ) : null}

        {/* KATMAN 4 — Hukuki süreç ve mevzuat (DAİMA görünür, sayfa altı) */}
        <section className="mt-12 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-5 w-5 text-violet-300" />
            <h2 className="text-xl font-bold text-white">Hukuki Süreç ve Mevzuat</h2>
          </div>

          <Card className="card-luxury border-violet-400/20">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-white mb-3">
                Lisanssız GES — 8 Aşama Süreç (5 MW altı)
              </p>
              <ol className="space-y-2.5 text-sm text-slate-300">
                {[
                  ["1. Ön Fizibilite + Saha Keşif", "Bu sayfanın ürettiği rapor + lisanslı EPC firma değerlendirmesi."],
                  ["2. Arazi Tipi Raporu", "İl Tarım Müdürlüğü — marjinal/mutlak arazi sınıflandırması (yalnız marjinalde GES kurulabilir)."],
                  ["3. ÇED (Çevre Etki Değerlendirmesi)", "Çevre Bakanlığı — 1 MW üzeri kapsama girer; ÇED-gerekli/ÇED-değil kararı."],
                  ["4. EDAŞ Bağlantı Başvurusu", "⚠️ Eksik evrak = RED + 2 ay gecikme. Tapu, izolasyon raporu, tek hat şeması, koordinat planı şart."],
                  ["5. Çağrı Mektubu (TEİAŞ)", "Trafo kapasitesi onayı — bölgesel yoğunluk varsa kuyruk olabilir."],
                  ["6. 90 Gün Proje Onayı", "EDAŞ teknik kontrol + mekanik/elektrik proje (lisanslı mühendis imzalı)."],
                  ["7. Belediye / OSB İzin", "İmar durum yazısı + yapı ruhsatı (sera/otopark hibrit varsa ek izin)."],
                  ["8. Montaj + Kabul", "EDAŞ + sayaç + yeşil sözleşme. Geçici kabul → kesin kabul (~30 gün)."],
                ].map(([title, desc]) => (
                  <li key={title} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/30 border border-white/5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="card-luxury">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ScrollText className="h-4 w-4 text-violet-300" />
                  <p className="text-sm font-semibold text-white">Mevzuat Çerçevesi</p>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  <li>
                    • <strong>EPDK Elektrik Piyasası Lisanssız Yönetmeliği</strong> (Resmi Gazete)
                  </li>
                  <li>
                    • <strong>1044 Sayılı Cumhurbaşkanlığı Kararı</strong> (Lisanssız limit)
                  </li>
                  <li>
                    • <strong>3194 Sayılı İmar Kanunu</strong> + uygulama yönetmeliği
                  </li>
                  <li>
                    • <strong>2872 Sayılı Çevre Kanunu</strong> (ÇED yönetmeliği)
                  </li>
                  <li>
                    • <strong>6331 Sayılı İSG Kanunu</strong> (inşaat aşaması zorunlu)
                  </li>
                  <li>
                    • <strong>1 Mayıs 2026 — Saatlik Mahsuplaşma</strong> (öz tüketim 4× çarpan
                    kaldırıldı)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-cyan-300" />
                  <p className="text-sm font-semibold text-white">Kapasite Kategorileri</p>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  <li>• <strong>5-1-a</strong>: Konut tüketici öz tüketim (10 kWp altı)</li>
                  <li>• <strong>5-1-ç</strong>: Tüketim tesisi ile ilişkili (≤ tüketim+25 kWp)</li>
                  <li>• <strong>5-1-h</strong>: YEKA dışı arazi (orta ölçek)</li>
                  <li>
                    • <strong>5 MW eşik</strong>: Üstü EPDK lisansı + ÇED tam +
                    şebeke bağlantı (TEİAŞ direkt)
                  </li>
                  <li className="pt-2 border-t border-slate-700/50">
                    YEKA-GES 2024 ihalesi: 126 USD/MWh referans tarife
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-300" />
                  <p className="text-sm font-semibold text-white">Finansman Seçenekleri</p>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  <li>
                    • <strong className="text-emerald-300">Yeşil kredi</strong>: %3.79-4.72 yıllık
                    (Halkbank, Ziraat, kalkınma bankası — yenilenebilir özel)
                  </li>
                  <li>
                    • <strong>Finansal kiralama (leasing)</strong>: %18-25 yıllık + amortisman avantajı
                  </li>
                  <li>
                    • <strong>EBRD / Dünya Bankası</strong>: 1 MW+ projeler için döviz kredi
                  </li>
                  <li>
                    • <strong>Devlet hibesi</strong>: TKDK + Tarım+ kırsal alan projeleri kapsamı
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-luxury border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-300" />
                  <p className="text-sm font-semibold text-white">Disclaimer (Kritik)</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Bu sayfa <strong>ön fizibilite</strong> aracıdır — bankable yatırım kararı
                  oluşturmaz. Gerçek kararı vermek için: lisanslı{" "}
                  <strong className="text-amber-200">EPC firma + İl Tarım + EDAŞ + PVsyst yazılım simülasyonu
                  + bağımsız mali müşavir</strong> şart. NPV/IRR tahminleri{" "}
                  ±%25 hata payı taşır.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </motion.div>
    </motion.div>
  );
}