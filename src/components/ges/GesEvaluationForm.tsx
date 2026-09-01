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
import { FxRef } from "@/components/FxRef";
import { useLocale } from "@/contexts/LocaleContext";

type Step = 1 | 2 | 3;

const ASPECTS: GesSlopeAspect[] = ["SOUTH", "NORTH", "EAST", "WEST", "FLAT", "MIXED"];
const AGRI: GesAgriculturalClass[] = ["MARGINAL", "NORMAL", "MUTLAK", "UNKNOWN"];

function formatMw(n: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(n);
}

function formatTry(n: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

function statusLabel(status: GesSubmitResult["status"], g: { statusHigh: string; statusReject: string; statusSubmitted: string; statusEngineering: string; statusGathering: string }): string {
  switch (status) {
    case "HIGH_VIABILITY":
      return g.statusHigh;
    case "TECHNICAL_REJECTION":
      return g.statusReject;
    case "SUBMITTED_TO_INVESTORS":
      return g.statusSubmitted;
    case "ENGINEERING_CALCULATION":
      return g.statusEngineering;
    default:
      return g.statusGathering;
  }
}

export function GesEvaluationForm() {
  const { t } = useLocale();
  const g = t.gesForm;
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
      setError(e instanceof Error ? e.message : g.errSubmit);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[20px] border border-amber-500/20 bg-amber-500/10 p-6 backdrop-blur-md">
      <div className="mb-6 flex flex-wrap gap-2 text-xs text-slate-400">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`rounded-full px-3 py-1 border ${
              step === n ? "border-amber-400/50 bg-amber-500/15 text-amber-100" : "border-white/10"
            }`}
          >
            {g.stepLabel} {n}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-normal text-white flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-300" /> {g.step1Title}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              {g.city}
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              {g.district}
              <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              {g.neighborhood}
              <Input value={form.neighborhood ?? ""} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              {g.adaParcel}
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder={g.adaPlaceholder} value={form.ada ?? ""} onChange={(e) => setForm({ ...form, ada: e.target.value })} />
                <Input placeholder={g.parcelPlaceholder} value={form.parcel ?? ""} onChange={(e) => setForm({ ...form, parcel: e.target.value })} />
              </div>
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              {g.totalAreaM2}
              <Input
                type="number"
                min={1000}
                value={form.totalAreaM2}
                onChange={(e) => setForm({ ...form, totalAreaM2: Number(e.target.value) })}
                dir="ltr"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              {g.solarIrradiance}
              <Input
                type="number"
                min={1200}
                value={form.solarIrradianceKwh}
                onChange={(e) => setForm({ ...form, solarIrradianceKwh: Number(e.target.value) })}
                dir="ltr"
              />
            </label>
          </div>
          <Button type="button" onClick={() => setStep(2)} className="mt-2">
            {g.continueBtn} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-normal text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-300" /> {g.step2Title}
          </h2>
          <p className="text-sm text-slate-400">
            {g.preScore}: <span className="text-amber-200 font-normal" dir="ltr">{preview.gesFeasibilityScore}</span> / 100
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              {g.trafoDistance}
              <Input
                type="number"
                min={0}
                step={0.1}
                value={form.distanceToTrafoKm}
                onChange={(e) => setForm({ ...form, distanceToTrafoKm: Number(e.target.value) })}
                dir="ltr"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              {g.trafoCapacity}
              <Input
                type="number"
                min={0.1}
                value={form.trafoCapacityMw ?? 0}
                onChange={(e) => setForm({ ...form, trafoCapacityMw: Number(e.target.value) })}
                dir="ltr"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              {g.slopeDegree}
              <Input
                type="number"
                min={0}
                value={form.slopeDegree}
                onChange={(e) => setForm({ ...form, slopeDegree: Number(e.target.value) })}
                dir="ltr"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              {g.slopeAspect}
              <select
                className="flex h-10 w-full rounded-[3px] border border-white/10 bg-black/30 px-3 text-sm text-white"
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
              {g.agriculturalClass}
              <select
                className="flex h-10 w-full rounded-[3px] border border-white/10 bg-black/30 px-3 text-sm text-white"
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
                ["isMarginalTarimApproved", g.chkMarginal],
                ["hasCadastralRoad", g.chkCadastralRoad],
                ["hasSitAreaConflict", g.chkSitConflict],
                ["hasMilitaryZoneConflict", g.chkMilitaryZone],
                ["hasArchaeologicalSite", g.chkArchaeological],
              ] as const
            ).map(([key, label]) => (
              <li key={key} className="flex items-center gap-3 rounded-[10px] border border-white/10 p-3">
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
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {g.backBtn}
            </Button>
            <Button type="button" disabled={loading} onClick={onSubmit}>
              {loading ? g.computingBtn : g.completeBtn}
            </Button>
          </div>
          {error && (
            <div
              role="alert"
              className="rounded-[10px] border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 space-y-3"
            >
              <p>{error}</p>
              <Button type="button" size="sm" variant="outline" onClick={onSubmit} disabled={loading}>
                {g.retryBtn}
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 3 && result && (
        <div className="space-y-4">
          <h2 className="text-lg font-normal text-white">{statusLabel(result.status, g)}</h2>
          {result.hardKill ? (
            <p className="text-sm text-red-200 border border-red-400/30 bg-red-500/10 rounded-[10px] p-3">
              {result.rejectionReason}
            </p>
          ) : (
            <div className="rounded-[20px] border border-emerald-400/30 bg-emerald-500/10 p-4 grid sm:grid-cols-2 gap-3 text-sm">
              <p>
                {g.scoreLabel}: <strong className="text-emerald-100" dir="ltr">{result.gesFeasibilityScore}</strong>
              </p>
              <p>
                {g.capacityLabel}: <strong dir="ltr">{formatMw(result.estimatedCapacityMw)} MW</strong>
              </p>
              <p>
                {g.annualLabel}: <strong dir="ltr">{formatMw(result.estimatedAnnualMwh)} MWh</strong>
              </p>
              <p>
                {g.capexLabel}: <strong dir="ltr">{formatTry(result.estimatedCapexTry)}</strong>
                <FxRef amountTry={result.estimatedCapexTry} variant="compact" className="ms-1.5 text-[11px] text-amber-300/80" />
              </p>
              {result.paybackYears != null && (
                <p className="sm:col-span-2">
                  {g.paybackLabel}: <strong dir="ltr">{result.paybackYears} {g.paybackYearSuffix}</strong> {g.paybackDefaultPriceNote}
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
            <CheckCircle2 className="h-4 w-4" /> {g.newEvaluation}
          </Button>
        </div>
      )}
    </div>
  );
}
