import { useCallback, useMemo, useState } from "react";
import { Calculator, Database, Loader2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TaxDisclaimerBanner } from "@/components/tax/TaxDisclaimerBanner";
import { taxSimulatorService } from "@/lib/tax/TaxSimulatorService";
import { getDefaultTaxSimulatorDeps } from "@/lib/tax/demoDeps";
import { mergeYiUfeRecords } from "@/lib/tax/mergeYiUfeRecords";
import { fetchYiUfeFromTcmbEdge } from "@/lib/tax/tcmbYiUfeClient";
import type { YiUfeRecord } from "@/lib/tax/TaxSimulatorService";

export default function TaxSimulatorPage() {
  const [purchaseYm, setPurchaseYm] = useState("2021-06");
  const [buyTry, setBuyTry] = useState("1000000");
  const [saleTry, setSaleTry] = useState("2500000");
  const [area, setArea] = useState("");
  const [firstRes, setFirstRes] = useState(false);

  const demoDeps = useMemo(() => getDefaultTaxSimulatorDeps(), []);
  const [tcmbOverlay, setTcmbOverlay] = useState<YiUfeRecord[] | null>(null);
  const [tcmbLoading, setTcmbLoading] = useState(false);
  const [tcmbError, setTcmbError] = useState<string | null>(null);
  const [tcmbMeta, setTcmbMeta] = useState<{ seriesUsed: string; itemCount: number } | null>(null);

  const deps = useMemo(() => {
    if (!tcmbOverlay?.length) return demoDeps;
    return {
      ...demoDeps,
      yiUfeRecords: mergeYiUfeRecords(demoDeps.yiUfeRecords, tcmbOverlay),
    };
  }, [demoDeps, tcmbOverlay]);

  const loadTcmb = useCallback(async () => {
    setTcmbLoading(true);
    setTcmbError(null);
    const r = await fetchYiUfeFromTcmbEdge();
    setTcmbLoading(false);
    if (r.ok) {
      setTcmbOverlay(r.records);
      setTcmbMeta({ seriesUsed: r.seriesUsed, itemCount: r.itemCount });
    } else {
      setTcmbError(r.message);
      if (r.code === "not_configured" || r.code === "bad_response") {
        setTcmbMeta(null);
      }
    }
  }, []);

  const result = useMemo(() => {
    const declared = Math.max(0, Number(String(buyTry).replace(/\D/g, "")) || 0);
    const sale = Math.max(0, Number(String(saleTry).replace(/\D/g, "")) || 0);
    const areaM2 = area.trim() ? Math.max(0, Number(area.replace(/\D/g, "")) || 0) : undefined;
    try {
      return taxSimulatorService.estimate(
        {
          purchaseDate: purchaseYm,
          declaredPurchasePriceTry: declared || 1,
          expectedSalePriceTry: sale || 1,
          isFirstResidence: firstRes,
          areaM2: areaM2 && areaM2 > 0 ? areaM2 : undefined,
          propertyType: "konut",
        },
        deps
      );
    } catch {
      return null;
    }
  }, [purchaseYm, buyTry, saleTry, area, firstRes, deps]);

  return (
    <div className="container max-w-3xl py-10 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <Calculator className="h-7 w-7" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Vergi / harç simülatörü</h1>
          <p className="text-sm text-muted-foreground">
            TaxSimulatorService (Kimi ZIP) ile ön hesaplama: tahmini matrah, resmi hesap değildir.
          </p>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">1) Endeks</p>
          <p className="mt-1 text-sm text-muted-foreground">Yİ-ÜFE verisi demo veya TCMB EVDS kaynağından birleştirilir.</p>
        </article>
        <article className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">2) Matrah</p>
          <p className="mt-1 text-sm text-muted-foreground">Alış-satış, metrekare ve istisna bilgisiyle vergi ön projeksiyonu çıkar.</p>
        </article>
        <article className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">3) Aksiyon</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sonucu <Link to="/komisyon-hesaplayici" className="text-primary hover:text-foreground">Komisyon Hesaplayıcı</Link> ve hukuki kontrolle birlikte değerlendirin.
          </p>
        </article>
      </section>

      <TaxDisclaimerBanner />

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-cyan-500 shrink-0" aria-hidden />
              YI-UFE (TCMB EVDS)
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Demo endeks noktaları yerine resmi aylık seri: Supabase Edge <code className="text-xs">tcmb_yiufe</code>{" "}
              + secret <code className="text-xs">TCMB_EVDS_API_KEY</code>. Anahtar tarayıcıda değil.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button type="button" variant="secondary" size="sm" onClick={loadTcmb} disabled={tcmbLoading} className="gap-2">
              {tcmbLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RefreshCw className="h-4 w-4" aria-hidden />}
              TCMB ile güncelle
            </Button>
            {tcmbMeta && (
              <span className="text-xs text-muted-foreground">
                {tcmbMeta.seriesUsed} · {tcmbMeta.itemCount} ay
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {tcmbError && (
            <p className="text-sm text-amber-700 dark:text-amber-300 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              {tcmbError}
            </p>
          )}
          {tcmbOverlay?.length ? (
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Resmi seri demo ile birleştirildi; ortak aylarda TCMB değeri kullanılır.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Henüz TCMB çekilmedi — simülasyon demo Yİ-ÜFE ile çalışır.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Girdiler</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pur">Alış tarihi (YYYY-AA)</Label>
            <Input id="pur" value={purchaseYm} onChange={(e) => setPurchaseYm(e.target.value)} placeholder="2021-06" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">Alan m2 (opsiyonel)</Label>
            <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="120" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buy">Tapu beyan alış (TRY)</Label>
            <Input id="buy" inputMode="numeric" value={buyTry} onChange={(e) => setBuyTry(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sale">Beklenen satış (TRY)</Label>
            <Input id="sale" inputMode="numeric" value={saleTry} onChange={(e) => setSaleTry(e.target.value)} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <Checkbox id="fr" checked={firstRes} onCheckedChange={(v) => setFirstRes(v === true)} />
            <Label htmlFor="fr" className="text-sm font-normal cursor-pointer">
              Konut tek ikamet / 150 m2 istisna potansiyeli (bilgilendirme)
            </Label>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ozet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid sm:grid-cols-2 gap-2">
              <p>
                <span className="text-muted-foreground">Tapu harcı (satıcı payı):</span>{" "}
                <strong>{result.deedDuty.sellerShare.toLocaleString("tr-TR")} TL</strong>
              </p>
              <p>
                <span className="text-muted-foreground">GV (tahmini):</span>{" "}
                <strong>{result.capitalGainsTax.taxAmount.toLocaleString("tr-TR")} TL</strong>
                {result.capitalGainsTax.isFiveYearExempt && (
                  <span className="ml-2 text-xs text-emerald-600">(5 yil istisna uygulandi)</span>
                )}
              </p>
              <p>
                <span className="text-muted-foreground">Platform + KDV:</span>{" "}
                <strong>{result.platformFee.total.toLocaleString("tr-TR")} TL</strong>
              </p>
              <p>
                <span className="text-muted-foreground">Satıcıya tahmini net:</span>{" "}
                <strong>{result.netToSeller.estimatedNet.toLocaleString("tr-TR")} TL</strong>
              </p>
            </div>
            {result.warnings.length > 0 && (
              <ul className="list-disc pl-5 text-amber-800 dark:text-amber-200 space-y-1">
                {result.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
            <p className="text-xs text-muted-foreground">{result.disclaimer}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
