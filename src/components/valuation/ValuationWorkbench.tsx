import { useMemo, useState } from "react";
import { ArrowRight, BarChart3, Building2, Calculator, ShieldCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CITY_OPTIONS, getCityByKey, type CityKey, type TransactionType } from "@/lib/valuation/regionalPriceData";
import {
  estimatePropertyValue,
  formatTry,
  type HeatingType,
  type LocationTier,
  type PropertyCondition,
} from "@/lib/valuation/valuationEngine";

type WorkbenchState = {
  city: CityKey;
  district: string;
  grossM2: number;
  roomCount: number;
  floor: number;
  totalFloors: number;
  buildingAge: number;
  transactionType: TransactionType;
  condition: PropertyCondition;
  heatingType: HeatingType;
  locationTier: LocationTier;
  hasElevator: boolean;
  hasParking: boolean;
};

const INITIAL_STATE: WorkbenchState = {
  city: "istanbul",
  district: "Kadikoy",
  grossM2: 120,
  roomCount: 3,
  floor: 4,
  totalFloors: 10,
  buildingAge: 8,
  transactionType: "sale",
  condition: "good",
  heatingType: "central",
  locationTier: "prime",
  hasElevator: true,
  hasParking: true,
};

export function ValuationWorkbench({
  title = "Değerleme başlat",
  compact = false,
}: {
  title?: string;
  compact?: boolean;
}) {
  const [form, setForm] = useState<WorkbenchState>(INITIAL_STATE);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReturnType<typeof estimatePropertyValue> | null>(null);

  const districtOptions = useMemo(() => Object.keys(getCityByKey(form.city)?.districts ?? {}), [form.city]);

  const contributionChart = useMemo(
    () =>
      (result?.contributions ?? []).map((row) => ({
        name: row.label,
        pct: row.pctImpact,
      })),
    [result],
  );

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (form.grossM2 < 20) {
      setError("Brüt m² en az 20 olmalı.");
      return;
    }
    if (form.roomCount < 1) {
      setError("Oda sayısı en az 1 olmalı.");
      return;
    }
    if (form.totalFloors < 1) {
      setError("Toplam kat en az 1 olmalı.");
      return;
    }
    if (form.floor < 0) {
      setError("Kat bilgisi negatif olamaz.");
      return;
    }
    const next = estimatePropertyValue({
      city: form.city,
      district: form.district || undefined,
      grossM2: form.grossM2,
      roomCount: form.roomCount,
      floor: form.floor,
      totalFloors: form.totalFloors,
      buildingAge: form.buildingAge,
      transactionType: form.transactionType,
      condition: form.condition,
      heatingType: form.heatingType,
      locationTier: form.locationTier,
      hasElevator: form.hasElevator,
      hasParking: form.hasParking,
    });
    setResult(next);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white md:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-slate-300">Demo veri / ön analiz: hedonik + emsal + mekansal düzeltme birlikte çalışır.</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-100">
          <ShieldCheck className="h-3.5 w-3.5" /> Açıklanabilir model
        </span>
      </header>

      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1 text-xs text-slate-300">
          İl
          <select
            value={form.city}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                city: event.target.value as CityKey,
                district: Object.keys(getCityByKey(event.target.value as CityKey)?.districts ?? {})[0] ?? "",
              }))
            }
            className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white"
          >
            {CITY_OPTIONS.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs text-slate-300">
          İlçe
          <select
            value={form.district}
            onChange={(event) => setForm((prev) => ({ ...prev, district: event.target.value }))}
            className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white"
          >
            {districtOptions.length ? districtOptions.map((district) => <option key={district}>{district}</option>) : <option value="">İlçe verisi yok</option>}
          </select>
        </label>

        <label className="space-y-1 text-xs text-slate-300">
          Brüt m²
          <Input
            type="number"
            min={20}
            value={form.grossM2}
            onChange={(event) => setForm((prev) => ({ ...prev, grossM2: Number(event.target.value || 0) }))}
          />
        </label>

        <label className="space-y-1 text-xs text-slate-300">
          Oda sayısı
          <Input
            type="number"
            min={1}
            value={form.roomCount}
            onChange={(event) => setForm((prev) => ({ ...prev, roomCount: Number(event.target.value || 1) }))}
          />
        </label>

        <label className="space-y-1 text-xs text-slate-300">
          Kat
          <Input
            type="number"
            min={0}
            value={form.floor}
            onChange={(event) => setForm((prev) => ({ ...prev, floor: Number(event.target.value || 0) }))}
          />
        </label>

        <label className="space-y-1 text-xs text-slate-300">
          Toplam kat
          <Input
            type="number"
            min={1}
            value={form.totalFloors}
            onChange={(event) => setForm((prev) => ({ ...prev, totalFloors: Number(event.target.value || 1) }))}
          />
        </label>

        <label className="space-y-1 text-xs text-slate-300">
          Bina yaşı
          <Input
            type="number"
            min={0}
            value={form.buildingAge}
            onChange={(event) => setForm((prev) => ({ ...prev, buildingAge: Number(event.target.value || 0) }))}
          />
        </label>

        <label className="space-y-1 text-xs text-slate-300">
          Isıtma
          <select
            value={form.heatingType}
            onChange={(event) => setForm((prev) => ({ ...prev, heatingType: event.target.value as HeatingType }))}
            className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white"
          >
            <option value="district">Merkezi sistem</option>
            <option value="central">Merkezi daire</option>
            <option value="combi">Kombi</option>
            <option value="underfloor">Yerden ısıtma</option>
            <option value="stove">Soba</option>
          </select>
        </label>

        <label className="space-y-1 text-xs text-slate-300">
          Konum kalitesi
          <select
            value={form.locationTier}
            onChange={(event) => setForm((prev) => ({ ...prev, locationTier: event.target.value as LocationTier }))}
            className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white"
          >
            <option value="prime">Prime</option>
            <option value="strong">Güçlü</option>
            <option value="balanced">Dengeli</option>
            <option value="emerging">Gelişen</option>
          </select>
        </label>

        <label className="space-y-1 text-xs text-slate-300">
          Fiziksel durum
          <select
            value={form.condition}
            onChange={(event) => setForm((prev) => ({ ...prev, condition: event.target.value as PropertyCondition }))}
            className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white"
          >
            <option value="new">Yeni</option>
            <option value="good">İyi</option>
            <option value="needs_renovation">Tadilat gerekli</option>
          </select>
        </label>

        <label className="space-y-1 text-xs text-slate-300">
          İşlem tipi
          <select
            value={form.transactionType}
            onChange={(event) => setForm((prev) => ({ ...prev, transactionType: event.target.value as TransactionType }))}
            className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white"
          >
            <option value="sale">Satış değeri</option>
            <option value="rent">Kira değeri</option>
          </select>
        </label>

        <label className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={form.hasElevator}
            onChange={(event) => setForm((prev) => ({ ...prev, hasElevator: event.target.checked }))}
          />
          Asansör
        </label>

        <label className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={form.hasParking}
            onChange={(event) => setForm((prev) => ({ ...prev, hasParking: event.target.checked }))}
          />
          Otopark
        </label>

        <div className="xl:col-span-4 flex flex-wrap items-center gap-2 pt-1">
          <Button type="submit" className="bg-cyan-500 font-semibold text-slate-950 hover:bg-cyan-400">
            <Calculator className="mr-1.5 h-4 w-4" /> Değerleme başlat
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setForm(INITIAL_STATE);
              setResult(null);
              setError("");
            }}
          >
            Formu sıfırla
          </Button>
          {error ? <span className="text-xs text-rose-300">{error}</span> : null}
        </div>
      </form>

      {result ? (
        <div className="space-y-4">
          <article className="grid gap-3 rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs text-emerald-100">Tahmini değer</p>
              <p className="text-xl font-black text-white">{formatTry(result.estimatedValue)}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-100">Güven aralığı</p>
              <p className="text-sm font-semibold text-white">
                {formatTry(result.minValue)} - {formatTry(result.maxValue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-100">Belirsizlik bandı</p>
              <p className="text-sm font-semibold text-white">± %{result.confidenceBandPct}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-100">Model skoru</p>
              <p className="text-sm font-semibold text-white">
                {result.confidenceScore}/100 ({result.confidence === "high" ? "Yüksek" : "Orta"})
              </p>
            </div>
          </article>

          <article className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
              <h3 className="mb-2 text-sm font-black uppercase tracking-[0.12em] text-cyan-200">SHAP katkı dökümü</h3>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contributionChart} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                    <Tooltip formatter={(value: number) => [`${value >= 0 ? "+" : ""}${value.toFixed(2)}%`, "Etkisi"]} />
                    <Bar dataKey="pct" fill="#22d3ee" radius={[4, 4, 4, 4]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
              <h3 className="mb-2 text-sm font-black uppercase tracking-[0.12em] text-cyan-200">Katman özeti</h3>
              <ul className="space-y-2 text-sm text-slate-200">
                <li>
                  Baz birim fiyat: <strong>{formatTry(result.layerSummary.baseUnitPrice)}</strong>
                </li>
                <li>
                  Hedonik birim: <strong>{formatTry(result.layerSummary.hedonicUnitPrice)}</strong>
                </li>
                <li>
                  Emsal birim: <strong>{formatTry(result.layerSummary.comparableUnitPrice)}</strong>
                </li>
                <li>
                  Mekansal düzeltme: <strong>x{result.layerSummary.spatialFactor.toLocaleString("tr-TR")}</strong>
                </li>
                <li>
                  Mahalle trendi: <strong>{result.neighborhoodTrendPct >= 0 ? "+" : ""}{result.neighborhoodTrendPct}%</strong>
                </li>
              </ul>
              <p className="mt-3 text-xs text-slate-300">{result.note}</p>
            </div>
          </article>

          <article className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-violet-200">SPK - Emsal yaklaşımı</p>
              <p className="mt-1 text-lg font-black text-white">{formatTry(result.approaches.salesComparisonTry)}</p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-amber-200">SPK - Maliyet yaklaşımı</p>
              <p className="mt-1 text-lg font-black text-white">{formatTry(result.approaches.costApproachTry)}</p>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-200">SPK - Gelir yaklaşımı</p>
              <p className="mt-1 text-lg font-black text-white">{formatTry(result.approaches.incomeApproachTry)}</p>
            </div>
          </article>

          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <h3 className="mb-2 text-sm font-black uppercase tracking-[0.12em] text-cyan-200">Benzer emsaller (demo)</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[740px] text-xs">
                <thead className="text-left uppercase tracking-[0.1em] text-slate-400">
                  <tr>
                    <th className="pb-2 pr-2">ID</th>
                    <th className="pb-2 pr-2">İlçe</th>
                    <th className="pb-2 pr-2">m²</th>
                    <th className="pb-2 pr-2">Oda</th>
                    <th className="pb-2 pr-2">Yaş</th>
                    <th className="pb-2 pr-2">Mesafe</th>
                    <th className="pb-2 pr-2">Satış</th>
                  </tr>
                </thead>
                <tbody>
                  {result.comparables.slice(0, compact ? 6 : 10).map((row) => (
                    <tr key={row.id} className="border-t border-slate-800 text-slate-200">
                      <td className="py-1.5 pr-2">{row.id}</td>
                      <td className="py-1.5 pr-2">{row.district}</td>
                      <td className="py-1.5 pr-2">{row.grossM2}</td>
                      <td className="py-1.5 pr-2">{row.roomCount}+1</td>
                      <td className="py-1.5 pr-2">{row.buildingAge}</td>
                      <td className="py-1.5 pr-2">{row.distanceKm.toLocaleString("tr-TR")} km</td>
                      <td className="py-1.5 pr-2">{formatTry(row.salePriceTry)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          {!compact ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
              <p className="text-sm text-cyan-100">
                Ön değerleme tamamlandı. Resmi değer için SPK lisanslı değerleme uzmanı (TDUB) teyidi gerekir.
              </p>
              <Button type="button" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                Değerleme başlat <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">
          <p className="inline-flex items-center gap-2 text-cyan-200">
            <BarChart3 className="h-4 w-4" />
            Formu doldurup analiz başlatın; güven aralığı, SHAP katkı dökümü ve emsal tablosu tek ekranda üretilecek.
          </p>
        </div>
      )}
    </section>
  );
}
