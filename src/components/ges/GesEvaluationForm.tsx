import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Sun, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  submitGesProject,
  type GesAgriculturalClass,
  type GesLandEvaluationInput,
  type GesSlopeAspect,
  type GesSubmitResult,
} from "@/lib/ges-land";
import { runGesLandEvaluation } from "@/lib/ges-land/feasibilityEngine";

type Step = 1 | 2 | 3;

const ASPECTS: GesSlopeAspect[] = ["SOUTH", "NORTH", "EAST", "WEST", "FLAT", "MIXED"];
const AGRI: GesAgriculturalClass[] = ["MARGINAL", "NORMAL", "MUTLAK", "UNKNOWN"];

function formatMw(n: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(n);
}

function formatTry(n: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

function statusLabel(status: GesSubmitResult["status"]): string {
  switch (status) {
    case "HIGH_VIABILITY":
      return "Yuksek fizibilite";
    case "TECHNICAL_REJECTION":
      return "Teknik red";
    case "SUBMITTED_TO_INVESTORS":
      return "Yatirimciya iletildi";
    case "ENGINEERING_CALCULATION":
      return "Muhendislik hesabi";
    default:
      return "Veri toplama";
  }
}

export function GesEvaluationForm() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GesSubmitResult | null>(null);
  const [form, setForm] = useState<GesLandEvaluationInput>({
    city: "Konya",
    district: "Karapinar",
    neighborhood: "",
    ada: "",
    parcel: "",
    totalAreaM2: 150_000,
    distanceToTrafoKm: 4.2,
    trafoName: "",
    trafoCapacityMw: 10,
    solarIrradianceKwh: 1780,
    slopeDegree: 8,
    slopeAspect: "SOUTH",
    agriculturalClass: "MARGINAL",
    isMarginalTarimApproved: true,
    hasCadastralRoad: true,
    hasSitAreaConflict: false,
    hasMilitaryZoneConflict: false,
    hasArchaeologicalSite: false,
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
  });

  const preview = useMemo(() => runGesLandEvaluation(form), [form]);

  const onSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await submitGesProject(form);
      setResult(res);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Degerlendirme gonderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/10 to-transparent p-6 backdrop-blur-md">
      <div className="mb-6 flex flex-wrap gap-2 text-xs text-slate-400">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`rounded-full px-3 py-1 border ${
              step === n ? "border-amber-400/50 bg-amber-500/15 text-amber-100" : "border-white/10"
            }`}
          >
            Adim {n}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-300" /> Konum ve arazi
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              Il
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              Ilce
              <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              Mahalle
              <Input value={form.neighborhood ?? ""} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              Ada / Parsel
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Ada" value={form.ada ?? ""} onChange={(e) => setForm({ ...form, ada: e.target.value })} />
                <Input placeholder="Parsel" value={form.parcel ?? ""} onChange={(e) => setForm({ ...form, parcel: e.target.value })} />
              </div>
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              Toplam alan (m2)
              <Input
                type="number"
                min={1000}
                value={form.totalAreaM2}
                onChange={(e) => setForm({ ...form, totalAreaM2: Number(e.target.value) })}
              />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              Guneslenme (kWh/m2)
              <Input
                type="number"
                min={1200}
                value={form.solarIrradianceKwh}
                onChange={(e) => setForm({ ...form, solarIrradianceKwh: Number(e.target.value) })}
              />
            </label>
          </div>
          <Button type="button" onClick={() => setStep(2)} className="mt-2">
            Devam <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-300" /> Sebeke ve mevzuat
          </h2>
          <p className="text-sm text-slate-400">
            On skor: <span className="text-amber-200 font-medium">{preview.gesFeasibilityScore}</span> / 100
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              Trafo mesafesi (km)
              <Input
                type="number"
                min={0}
                step={0.1}
                value={form.distanceToTrafoKm}
                onChange={(e) => setForm({ ...form, distanceToTrafoKm: Number(e.target.value) })}
              />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              Trafo kapasitesi (MW)
              <Input
                type="number"
                min={0.1}
                value={form.trafoCapacityMw ?? 0}
                onChange={(e) => setForm({ ...form, trafoCapacityMw: Number(e.target.value) })}
              />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              Egim (derece)
              <Input
                type="number"
                min={0}
                value={form.slopeDegree}
                onChange={(e) => setForm({ ...form, slopeDegree: Number(e.target.value) })}
              />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              Bakı
              <select
                className="flex h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white"
                value={form.slopeAspect}
                onChange={(e) => setForm({ ...form, slopeAspect: e.target.value as GesSlopeAspect })}
              >
                {ASPECTS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm text-slate-300 sm:col-span-2">
              Tarim sinifi
              <select
                className="flex h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white"
                value={form.agriculturalClass}
                onChange={(e) => setForm({ ...form, agriculturalClass: e.target.value as GesAgriculturalClass })}
              >
                {AGRI.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ul className="space-y-2 text-sm">
            {(
              [
                ["isMarginalTarimApproved", "Marjinal tarim / GEPA onayi mevcut"],
                ["hasCadastralRoad", "Kadastro yolu var"],
                ["hasSitAreaConflict", "SIT alani cakismasi"],
                ["hasMilitaryZoneConflict", "Askeri yasak bolge"],
                ["hasArchaeologicalSite", "Arkeolojik sit"],
              ] as const
            ).map(([key, label]) => (
              <li key={key} className="flex items-center gap-3 rounded-lg border border-white/10 p-3">
                <Checkbox
                  id={key}
                  checked={form[key]}
                  onCheckedChange={(v) => setForm({ ...form, [key]: v === true })}
                />
                <label htmlFor={key} className="text-slate-200 cursor-pointer">
                  {label}
                </label>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4" /> Geri
            </Button>
            <Button type="button" disabled={loading} onClick={onSubmit}>
              {loading ? "Hesaplaniyor..." : "Degerlendirmeyi tamamla"}
            </Button>
          </div>
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 space-y-3"
            >
              <p>{error}</p>
              <Button type="button" size="sm" variant="outline" onClick={onSubmit} disabled={loading}>
                Tekrar dene
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 3 && result && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">{statusLabel(result.status)}</h2>
          {result.hardKill ? (
            <p className="text-sm text-red-200 border border-red-400/30 bg-red-500/10 rounded-lg p-3">
              {result.rejectionReason}
            </p>
          ) : (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 grid sm:grid-cols-2 gap-3 text-sm">
              <p>
                Skor: <strong className="text-emerald-100">{result.gesFeasibilityScore}</strong>
              </p>
              <p>
                Kapasite: <strong>{formatMw(result.estimatedCapacityMw)} MW</strong>
              </p>
              <p>
                Yillik: <strong>{formatMw(result.estimatedAnnualMwh)} MWh</strong>
              </p>
              <p>
                CAPEX: <strong>{formatTry(result.estimatedCapexTry)}</strong>
              </p>
              {result.paybackYears != null && (
                <p className="sm:col-span-2">
                  Geri odeme: <strong>{result.paybackYears} yil</strong> (varsayilan fiyat)
                </p>
              )}
            </div>
          )}
          <ul className="text-xs text-slate-500 space-y-1">
            {result.engineeringLog.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <Button type="button" variant="outline" onClick={() => { setStep(1); setResult(null); }}>
            <CheckCircle2 className="h-4 w-4" /> Yeni degerlendirme
          </Button>
        </div>
      )}
    </div>
  );
}
