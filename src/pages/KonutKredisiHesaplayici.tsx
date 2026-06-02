import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calculator, Percent, Calendar, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { calcMortgagePayment, formatTry } from "@/lib/mortgageCalc";
import { FxRef } from "@/components/FxRef";

const TERM_PRESETS = [60, 120, 180, 240] as const;

export default function KonutKredisiHesaplayici() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAmount = searchParams.get("amount");
  const [amountStr, setAmountStr] = useState(() =>
    initialAmount && Number(initialAmount) > 0 ? String(Math.round(Number(initialAmount))) : "3000000",
  );
  const [rateStr, setRateStr] = useState("2.89");
  const [termMonths, setTermMonths] = useState(120);

  const principal = Math.max(0, Number(String(amountStr).replace(/\D/g, "")) || 0);
  const annualRate = Math.max(0, Number(String(rateStr).replace(",", ".")) || 0);

  const result = useMemo(
    () => calcMortgagePayment(principal, annualRate, termMonths),
    [principal, annualRate, termMonths],
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 gap-2 text-slate-500">
          <ArrowLeft className="h-4 w-4" /> Geri
        </Button>

        <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
          <Calculator className="h-8 w-8 text-blue-400" />
          Konut Kredisi Hesaplayıcı
        </h1>
        <p className="mt-2 text-slate-400">
          Kredi tutarı, vade ve aylık faiz oranına göre taksit ve toplam geri ödeme tahmini (bilgilendirme amaçlı).
        </p>

        <Card className="mt-8 border-slate-200/80 bg-slate-900/40">
          <CardContent className="space-y-6 p-6">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                <Banknote className="h-4 w-4" /> Kredi tutarı (₺)
              </label>
              <Input
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                inputMode="numeric"
                className="border-white/10 bg-slate-950 text-white"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                <Percent className="h-4 w-4" /> Aylık faiz oranı (%)
              </label>
              <Input
                value={rateStr}
                onChange={(e) => setRateStr(e.target.value)}
                inputMode="decimal"
                className="border-white/10 bg-slate-950 text-white"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="h-4 w-4" /> Vade: {termMonths} ay ({Math.round(termMonths / 12)} yıl)
              </label>
              <Slider
                value={[termMonths]}
                min={12}
                max={360}
                step={12}
                onValueChange={(v) => setTermMonths(v[0] ?? 120)}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {TERM_PRESETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTermMonths(m)}
                    className={`rounded-lg px-3 py-1 text-xs ${termMonths === m ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400"}`}
                  >
                    {m / 12} yıl
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-blue-500/20 bg-blue-500/10">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-slate-400">Aylık taksit</p>
              <p className="mt-1 text-2xl font-bold text-blue-300" dir="ltr">{formatTry(result.monthlyPayment)}</p>
              <FxRef amountTry={result.monthlyPayment} variant="block" className="text-[11px] text-amber-300/80" />
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 bg-slate-900/40">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-slate-400">Toplam geri ödeme</p>
              <p className="mt-1 text-xl font-bold text-white" dir="ltr">{formatTry(result.totalPayment)}</p>
              <FxRef amountTry={result.totalPayment} variant="block" className="text-[11px] text-amber-300/80" />
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 bg-slate-900/40">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-slate-400">Toplam faiz</p>
              <p className="mt-1 text-xl font-bold text-amber-300" dir="ltr">{formatTry(result.totalInterest)}</p>
              <FxRef amountTry={result.totalInterest} variant="block" className="text-[11px] text-amber-300/80" />
            </CardContent>
          </Card>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-slate-500">
          Bu hesaplama eşit taksit formülüne dayanır; dosya masrafı, sigorta ve banka kampanyaları dahil değildir. Kesin teklif için bankanıza başvurun.
        </p>
      </div>
    </div>
  );
}
