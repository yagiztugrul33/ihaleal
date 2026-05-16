import { useMemo, useState } from "react";
import { Calculator, Home, MapPin } from "lucide-react";
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
} from "@/lib/valuation/valuationEngine";

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

export default function ValuationTool() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<ReturnType<typeof estimatePropertyValue> | null>(null);

  const districtOptions = useMemo(() => {
    return Object.keys(getCityByKey(form.city)?.districts ?? {});
  }, [form.city]);

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

    if (form.grossM2 <= 10) {
      setError("Metrekare 10 m² uzerinde olmalidir.");
      return;
    }
    if (form.buildingAge < 0) {
      setError("Bina yasi negatif olamaz.");
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-100">
      <section className="max-w-5xl mx-auto px-4 py-24">
        <div className="mb-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <Calculator className="h-3.5 w-3.5" /> Yatirimci sunumu: hizli degerleme
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold">Ne Kadar Eder?</h1>
          <p className="mt-2 text-slate-400 max-w-3xl">
            Il, ilce, m² ve temel ozelliklerle satis veya kira tahmini alabilirsiniz.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-amber-100">
          <p className="font-medium">Onemli Uyari</p>
          <p className="text-sm mt-1">
            Bu arac sadece tahmin uretir, resmi ekspertiz raporu degildir.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-900/50 p-5 md:grid-cols-2"
        >
          <label className="space-y-2">
            <span className="text-sm text-slate-300">Il</span>
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
            <span className="text-sm text-slate-300">Ilce (opsiyonel)</span>
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
                <option value="">Bu ilde ilce bazli veri yok</option>
              )}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Brut m²</span>
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
            <span className="text-sm text-slate-300">Bina yasi</span>
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
            <span className="text-sm text-slate-300">Islem tipi</span>
            <select
              value={form.transactionType}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, transactionType: event.target.value as TransactionType }))
              }
              className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm"
            >
              <option value="sale">Satilik</option>
              <option value="rent">Kiralik</option>
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
              <option value="new">Sifira yakin</option>
              <option value="good">Iyi durumda</option>
              <option value="needs_renovation">Tadilat gerekir</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.hasElevator}
              onChange={(event) => setForm((prev) => ({ ...prev, hasElevator: event.target.checked }))}
            />
            Asansor var
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
              placeholder="Orn: 123 ada 45 parsel"
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
            <Button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold">
              <Calculator className="h-4 w-4" /> Ne Kadar Eder?
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
              Formu sifirla
            </Button>
          </div>
          {error ? <p className="md:col-span-2 text-sm text-rose-300">{error}</p> : null}
        </form>

        {result ? (
          <section className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Home className="h-5 w-5" /> Tahmini sonuc
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <p>
                <span className="text-slate-300">Merkez tahmin:</span>{" "}
                <strong>{formatTry(result.estimatedValue)}</strong>
                {form.transactionType === "rent" ? " / ay" : ""}
              </p>
              <p>
                <span className="text-slate-300">Aralik:</span>{" "}
                <strong>
                  {formatTry(result.minValue)} - {formatTry(result.maxValue)}
                </strong>
                {form.transactionType === "rent" ? " / ay" : ""}
              </p>
              <p>
                <span className="text-slate-300">Birim fiyat:</span>{" "}
                <strong>{formatTry(result.unitPrice)}/m²</strong>
              </p>
              <p>
                <span className="text-slate-300">Guven seviyesi:</span>{" "}
                <strong>{result.confidence === "high" ? "Yuksek" : "Orta"}</strong>
              </p>
            </div>
            <p className="mt-3 text-sm text-emerald-100">{result.note}</p>
            {form.parcelInfo || form.addressNote ? (
              <p className="mt-2 text-xs text-slate-300 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Ada/parsel/adres notlari yalnizca referans icin saklandi, hesaplamaya dahil edilmedi.
              </p>
            ) : null}
          </section>
        ) : null}
      </section>
    </main>
  );
}
