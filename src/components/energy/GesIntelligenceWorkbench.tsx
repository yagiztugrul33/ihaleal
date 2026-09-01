import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateGesIntelligence } from "@/lib/energy/gesIntelligenceEngine";

type FormState = {
  landAreaM2: number;
  dcCapacityKwp: number;
  annualGhiKwhM2: number;
  slopePercent: number;
  transformerDistanceKm: number;
  zoningPermitted: boolean;
  electricityPriceTryPerKwh: number;
  capexTryPerKwp: number;
  annualOpexTry: number;
  discountRatePct: number;
};

const INITIAL: FormState = {
  landAreaM2: 100_000,
  dcCapacityKwp: 1_000,
  annualGhiKwhM2: 1780,
  slopePercent: 4,
  transformerDistanceKm: 2.6,
  zoningPermitted: true,
  electricityPriceTryPerKwh: 2.9,
  capexTryPerKwp: 14_500,
  annualOpexTry: 1_250_000,
  discountRatePct: 10,
};

export function GesIntelligenceWorkbench({ compact = false, title = "GES katmanlı analiz" }: { compact?: boolean; title?: string }) {
  const [form, setForm] = useState(INITIAL);
  const [result, setResult] = useState<ReturnType<typeof calculateGesIntelligence> | null>(null);
  const [error, setError] = useState("");

  const barData = useMemo(() => (result ? result.contributions.map((c) => ({ katman: c.label, skor: c.score })) : []), [result]);
  const radarData = useMemo(() => barData.map((x) => ({ subject: x.katman, value: x.skor })), [barData]);

  const run = () => {
    setError("");
    if (form.annualGhiKwhM2 < 1000) {
      setError("GHI çok düşük; 1000 üstü değer girin.");
      return;
    }
    setResult(calculateGesIntelligence(form));
  };

  return (
    <section className="space-y-4 rounded-[20px] border border-slate-700 bg-slate-950/70 p-4 md:p-6">
      <header>
        <h2 className="text-xl font-normal text-white md:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-slate-300">
          Demo veri / ön analiz: solar fizibilite + siting + finansal + mevzuat katmanları ile birleşik GES puanı üretilir.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1 text-xs text-slate-300">Arazi (m²)
          <Input type="number" value={form.landAreaM2} onChange={(e) => setForm((p) => ({ ...p, landAreaM2: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">DC güç (kWp)
          <Input type="number" value={form.dcCapacityKwp} onChange={(e) => setForm((p) => ({ ...p, dcCapacityKwp: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">GHI (kWh/m²/yıl)
          <Input type="number" value={form.annualGhiKwhM2} onChange={(e) => setForm((p) => ({ ...p, annualGhiKwhM2: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">Eğim (%)
          <Input type="number" value={form.slopePercent} onChange={(e) => setForm((p) => ({ ...p, slopePercent: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">Trafo mesafesi (km)
          <Input type="number" value={form.transformerDistanceKm} onChange={(e) => setForm((p) => ({ ...p, transformerDistanceKm: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">Fiyat (TRY/kWh)
          <Input type="number" value={form.electricityPriceTryPerKwh} onChange={(e) => setForm((p) => ({ ...p, electricityPriceTryPerKwh: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">CAPEX (TRY/kWp)
          <Input type="number" value={form.capexTryPerKwp} onChange={(e) => setForm((p) => ({ ...p, capexTryPerKwp: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">Yıllık OPEX (TRY)
          <Input type="number" value={form.annualOpexTry} onChange={(e) => setForm((p) => ({ ...p, annualOpexTry: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">İskonto (%)
          <Input type="number" value={form.discountRatePct} onChange={(e) => setForm((p) => ({ ...p, discountRatePct: Number(e.target.value || 0) }))} />
        </label>
        <label className="inline-flex items-center gap-2 rounded-[3px] border border-slate-700 px-3 py-2 text-xs text-slate-300">
          <input type="checkbox" checked={form.zoningPermitted} onChange={(e) => setForm((p) => ({ ...p, zoningPermitted: e.target.checked }))} />
          İmar uygunluğu var
        </label>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" onClick={run} className="bg-amber-300 text-slate-900 hover:bg-amber-200">GES analizini hesapla</Button>
        {error ? <span className="text-xs text-rose-300">{error}</span> : null}
      </div>

      {result ? (
        <div className="space-y-4">
          <article className="grid gap-3 rounded-[20px] border border-amber-500/35 bg-amber-500/10 p-4 md:grid-cols-2 xl:grid-cols-4">
            <div><p className="text-xs text-amber-100">Birleşik skor</p><p className="text-2xl font-normal text-white">{result.overallScore}/100</p></div>
            <div><p className="text-xs text-amber-100">NPV</p><p className="text-sm font-normal text-white">{result.feasibility.npvTry.toLocaleString("tr-TR")} TRY</p></div>
            <div><p className="text-xs text-amber-100">IRR</p><p className="text-sm font-normal text-white">{result.feasibility.irrPct?.toFixed(1) ?? "-"}%</p></div>
            <div><p className="text-xs text-amber-100">LCOE</p><p className="text-sm font-normal text-white">{result.feasibility.lcoeTryPerKwh.toFixed(2)} TRY/kWh</p></div>
          </article>
          <article className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <div className="rounded-[20px] border border-slate-700 bg-slate-900/60 p-4">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="katman" tick={{ fill: "#cbd5e1", fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="skor" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-[20px] border border-slate-700 bg-slate-900/60 p-4">
              <h3 className="text-sm font-normal uppercase tracking-[0.12em] text-amber-200">Katkı dökümü</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {result.contributions.map((c) => (
                  <li key={c.key}>
                    <p className="font-normal">{c.label}</p>
                    <p className="text-xs text-slate-300">Skor {c.score}/100 · Ağırlık %{c.weightPct} · Katkı {c.contributionPts}</p>
                  </li>
                ))}
              </ul>
            </div>
          </article>
          <article className="rounded-[20px] border border-slate-700 bg-slate-900/60 p-4">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#cbd5e1", fontSize: 10 }} />
                  <Tooltip />
                  <Radar dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.32} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </article>
          {!compact ? <div className="rounded-[20px] border border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-100">{result.disclaimer}</div> : null}
        </div>
      ) : null}
    </section>
  );
}
