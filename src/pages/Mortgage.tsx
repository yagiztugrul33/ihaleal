import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calculateMortgage } from "@/lib/calculators/mortgageEngine";
import { calculateRealFxReturn } from "@/lib/calculators/realFxReturnEngine";

export default function Mortgage() {
  const navigate = useNavigate();
  const [propertyPrice, setPropertyPrice] = useState("5000000");
  const [downPaymentPct, setDownPaymentPct] = useState("20");
  const [annualRate, setAnnualRate] = useState("36");
  const [termMonths, setTermMonths] = useState("120");
  const [realInitialTry, setRealInitialTry] = useState("1000000");
  const [realFinalTry, setRealFinalTry] = useState("1350000");
  const [kfeInflationPct, setKfeInflationPct] = useState("41.1");
  const [usdStart, setUsdStart] = useState("32.4");
  const [usdEnd, setUsdEnd] = useState("38.7");

  const property = Math.max(0, Number(propertyPrice) || 0);
  const downPct = Math.max(0, Math.min(90, Number(downPaymentPct) || 0));
  const principal = Math.max(0, property * (1 - downPct / 100));
  const rate = Math.max(0, Number(annualRate) || 0);
  const months = Math.max(1, Number(termMonths) || 1);

  const result = useMemo(
    () =>
      calculateMortgage({
        principalTry: principal,
        annualInterestRatePct: rate,
        termMonths: months,
      }),
    [principal, rate, months],
  );

  const sample = calculateMortgage({
    principalTry: 2_400_000,
    annualInterestRatePct: 34,
    termMonths: 120,
  });
  const realFx = useMemo(
    () =>
      calculateRealFxReturn({
        initialTry: Math.max(1, Number(realInitialTry) || 1),
        finalTry: Math.max(0, Number(realFinalTry) || 0),
        annualInflationPct: Number(kfeInflationPct) || 0,
        startUsdTry: Math.max(0.0001, Number(usdStart) || 0.0001),
        endUsdTry: Math.max(0.0001, Number(usdEnd) || 0.0001),
      }),
    [realInitialTry, realFinalTry, kfeInflationPct, usdStart, usdEnd],
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-3 gap-2">
          <ArrowLeft className="h-4 w-4" /> Geri
        </Button>

        <section className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-6">
          <h1 className="flex items-center gap-3 text-3xl font-bold md:text-5xl">
            <Calculator className="h-8 w-8 text-cyan-300" />
            Mortgage hesap motoru
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-200 md:text-base">
            Aylık taksit, toplam faiz ve amortisman tablosunu gerçek annuite formülüyle hesaplar. Farklı girdi, farklı sonuç
            verir; sabit demo değer kullanılmaz.
          </p>
          <p className="mt-3 rounded-lg border border-cyan-400/30 bg-slate-950/60 p-3 text-xs text-cyan-100">
            Formül: <code>Aylık Taksit = P × [r(1+r)^n] / [(1+r)^n−1]</code> (P=anapara, r=aylık faiz, n=ay sayısı).
          </p>
          <p className="mt-2 text-xs text-slate-300">
            Güncel referans: KFE Nisan 2026 reel örnek <strong>- %4,3</strong> (nominal +%35, enflasyon +%41,1). Kira
            çarpanı benchmark: Türkiye <strong>214 ay</strong>, İstanbul <strong>212 ay</strong>.
          </p>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="border-border bg-card">
            <CardContent className="space-y-4 p-5">
              <h2 className="text-xl font-bold">Girdi</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted-foreground">Gayrimenkul fiyatı (TL)</label>
                  <Input id="mortgage-price" value={propertyPrice} onChange={(e) => setPropertyPrice(e.target.value)} inputMode="numeric" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Peşinat (%)</label>
                  <Input id="mortgage-down" value={downPaymentPct} onChange={(e) => setDownPaymentPct(e.target.value)} inputMode="decimal" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Yıllık faiz (%)</label>
                  <Input id="mortgage-rate" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} inputMode="decimal" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Vade (ay)</label>
                  <Input id="mortgage-term" value={termMonths} onChange={(e) => setTermMonths(e.target.value)} inputMode="numeric" />
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Anapara: <strong className="text-slate-200">{Math.round(principal).toLocaleString("tr-TR")} TL</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="space-y-4 p-5">
              <h2 className="text-xl font-bold">Sonuç</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
                  <p className="text-xs text-blue-200">Aylık taksit</p>
                  <p data-testid="mortgage-monthly" className="text-lg font-bold text-blue-100">
                    {Math.round(result.monthlyInstallmentTry).toLocaleString("tr-TR")} TL
                  </p>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="text-xs text-amber-200">Toplam faiz</p>
                  <p className="text-lg font-bold text-amber-100">{Math.round(result.totalInterestTry).toLocaleString("tr-TR")} TL</p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <p className="text-xs text-emerald-200">Toplam ödeme</p>
                  <p className="text-lg font-bold text-emerald-100">{Math.round(result.totalPaymentTry).toLocaleString("tr-TR")} TL</p>
                </div>
                <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-3">
                  <p className="text-xs text-violet-200">Aylık faiz oranı</p>
                  <p className="text-lg font-bold text-violet-100">%{(result.monthlyRate * 100).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-xl font-bold">Amortisman tablosu (ilk 12 ay)</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2 text-left">Ay</th>
                  <th className="p-2 text-right">Taksit</th>
                  <th className="p-2 text-right">Anapara</th>
                  <th className="p-2 text-right">Faiz</th>
                  <th className="p-2 text-right">Kalan borç</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.slice(0, 12).map((row) => (
                  <tr key={row.month} className="border-b border-border/60">
                    <td className="p-2">{row.month}</td>
                    <td className="p-2 text-right">{Math.round(row.installmentTry).toLocaleString("tr-TR")}</td>
                    <td className="p-2 text-right text-emerald-400">{Math.round(row.principalPaidTry).toLocaleString("tr-TR")}</td>
                    <td className="p-2 text-right text-amber-400">{Math.round(row.interestPaidTry).toLocaleString("tr-TR")}</td>
                    <td className="p-2 text-right text-blue-400">{Math.round(row.remainingPrincipalTry).toLocaleString("tr-TR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <h3 className="text-lg font-semibold">Örnek senaryo</h3>
              <p className="mt-2 text-sm text-slate-300">
                2.4M TL kredi, %34 yıllık faiz, 120 ay vade için aylık taksit yaklaşık{" "}
                <strong>{Math.round(sample.monthlyInstallmentTry).toLocaleString("tr-TR")} TL</strong>.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <h3 className="text-lg font-semibold">Dürüst sınır</h3>
              <p className="mt-2 text-sm text-slate-300">
                Bu hesaplama ön analizdir; banka tahsis süreci, dosya masrafı ve sigorta kalemleriyle nihai rakam değişebilir.
                Kesin karar öncesi finans uzmanı ile teyit edilmelidir.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5">
          <h2 className="text-xl font-bold text-violet-100">Reel / döviz getiri modülü (yatırım-mortgage)</h2>
          <p className="mt-2 text-sm text-slate-200">
            TL nominal getiri, KFE bazlı reel getiri ve USD bazlı performans aynı tabloda karşılaştırılır.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="text-xs text-slate-200">Başlangıç TL</label>
              <Input value={realInitialTry} onChange={(e) => setRealInitialTry(e.target.value)} inputMode="numeric" />
            </div>
            <div>
              <label className="text-xs text-slate-200">Bitiş TL</label>
              <Input value={realFinalTry} onChange={(e) => setRealFinalTry(e.target.value)} inputMode="numeric" />
            </div>
            <div>
              <label className="text-xs text-slate-200">KFE enflasyon (%)</label>
              <Input value={kfeInflationPct} onChange={(e) => setKfeInflationPct(e.target.value)} inputMode="decimal" />
            </div>
            <div>
              <label className="text-xs text-slate-200">USD başlangıç</label>
              <Input value={usdStart} onChange={(e) => setUsdStart(e.target.value)} inputMode="decimal" />
            </div>
            <div>
              <label className="text-xs text-slate-200">USD bitiş</label>
              <Input value={usdEnd} onChange={(e) => setUsdEnd(e.target.value)} inputMode="decimal" />
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3">
              <p className="text-xs text-cyan-200">TL nominal</p>
              <p data-testid="mortgage-nominal-return" className="text-lg font-bold text-cyan-100">
                %{realFx.nominalReturnPct.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-xs text-amber-200">Reel (KFE)</p>
              <p data-testid="mortgage-real-return" className="text-lg font-bold text-amber-100">
                %{realFx.realReturnPct.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="text-xs text-emerald-200">USD bazlı</p>
              <p className="text-lg font-bold text-emerald-100">%{realFx.usdReturnPct.toFixed(2)}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Banknote className="h-4 w-4 text-cyan-200" />
            <span>Kredi sonrası yatırım verimini görmek için modüllere geç:</span>
            <Link to="/modul/yatirim-onerisi" className="underline">Yatırım önerisi</Link>
            <span>·</span>
            <Link to="/modul/renovasyon-roi" className="underline">Renovasyon ROI</Link>
            <span>·</span>
            <Link to="/araclar/vergi-simulator" className="underline">Vergi simülatörü</Link>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Çekirdek ödeme/escrow süreçlerine dokunmadan yalnızca karar destek hesabı üretir.
          </p>
        </section>
      </div>
    </div>
  );
}
