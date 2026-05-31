import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calculator, Sun } from "lucide-react";
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

  // Türetilmiş hızlı metrikler (UI özet kartları için)
  const derived = useMemo(() => {
    if (!result) return null;
    const dcKwpN = Number(dcKwp.replace(",", ".")) || 0;
    const priceN = Number(price.replace(",", ".")) || 0;
    const capexPerN = Number(capexPerKwp.replace(",", ".")) || 0;
    const totalCapex = dcKwpN * capexPerN;
    const annualKwh = result.annualProductionKwh || 0;
    const annualRev = annualKwh * priceN;
    const annualOpex = dcKwpN * 120;
    const annualNet = annualRev - annualOpex;
    const payback = annualNet > 0 && totalCapex > 0 ? totalCapex / annualNet : null;
    // sensitivity ±%10 fiyat → NPV
    const r = (Number(discount.replace(",", ".")) || 10) / 100;
    const af = (1 - Math.pow(1 + r, -25)) / r;
    const dNpv = annualKwh * priceN * 0.1 * af;
    return {
      totalCapex,
      annualRev,
      annualNet,
      payback,
      npvUp: result.npvTry + dNpv,
      npvDown: result.npvTry - dNpv,
      irrVsDiscount: result.irrPct > (Number(discount.replace(",", ".")) || 10),
    };
  }, [result, dcKwp, price, capexPerKwp, discount]);

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
      </motion.div>
    </motion.div>
  );
}