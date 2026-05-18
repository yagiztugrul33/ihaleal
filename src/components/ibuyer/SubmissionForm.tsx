import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LEGAL_RISK_FLAG_LABELS,
  assessLegalRisk,
  submitInstantOffer,
  type IBuyerApplicationPayload,
  type IBuyerTargetOption,
  type InstantOfferResult,
  type LegalRiskFlagKey,
  type LegalRiskFlags,
} from "@/lib/ibuyer";
import { auditSubmissionData } from "@/lib/security/fraudEngine";
import { PreFeasibilityBanner } from "@/components/compliance/PreFeasibilityBanner";

const EMPTY_FLAGS: LegalRiskFlags = {
  inheritance: false,
  concordat: false,
  lien: false,
  urban: false,
  arsaPayi: false,
  familySherh: false,
  veraset: false,
  imar: false,
  katMismatch: false,
};

const FLAG_KEYS = Object.keys(EMPTY_FLAGS) as LegalRiskFlagKey[];

type Step = 1 | 2 | 3;

function formatTry(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusLabel(status: InstantOfferResult["status"]): string {
  switch (status) {
    case "OFFER_GENERATED":
      return "Anında teklif üretildi";
    case "LEGAL_REVIEW":
      return "Hukuk incelemesi gerekli";
    case "REJECTED":
      return "Başvuru uygun değil";
    default:
      return status;
  }
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Süre doldu");
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setRemaining(`${h}sa ${m}dk ${s}sn`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  return (
    <p className="inline-flex items-center gap-2 text-cyan-200 text-sm">
      <Clock className="h-4 w-4" />
      Teklif geçerlilik: {remaining}
    </p>
  );
}

export function SubmissionForm() {
  const [step, setStep] = useState<Step>(1);
  const [flags, setFlags] = useState<LegalRiskFlags>(EMPTY_FLAGS);
  const [targetOption, setTargetOption] = useState<IBuyerTargetOption>("CASH_ONLY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<InstantOfferResult | null>(null);
  const [form, setForm] = useState({
    city: "İstanbul",
    district: "",
    address: "",
    parcelNo: "",
    grossM2: 120,
    marketValueTry: 5_000_000,
    propertyType: "konut",
    contactPhone: "",
    contactEmail: "",
    desiredCity: "",
    desiredDistrict: "",
    desiredBudgetTry: 0,
    tradeInNotes: "",
  });

  const preview = useMemo(() => assessLegalRisk(flags), [flags]);

  const toggleFlag = (key: LegalRiskFlagKey, checked: boolean) => {
    setFlags((prev) => ({ ...prev, [key]: checked }));
  };

  const buildPayload = (): IBuyerApplicationPayload => ({
    city: form.city,
    district: form.district || undefined,
    address: form.address || undefined,
    parcelNo: form.parcelNo || undefined,
    grossM2: form.grossM2,
    marketValueTry: form.marketValueTry,
    propertyType: form.propertyType,
    contactPhone: form.contactPhone || undefined,
    contactEmail: form.contactEmail || undefined,
    legalFlags: flags,
    targetOption,
    desiredCity: form.desiredCity || undefined,
    desiredDistrict: form.desiredDistrict || undefined,
    desiredBudgetTry: form.desiredBudgetTry > 0 ? form.desiredBudgetTry : undefined,
    tradeInNotes: form.tradeInNotes || undefined,
  });

  const onSubmit = async () => {
    setError("");
    const fraud = auditSubmissionData({
      grossAreaM2: form.grossM2,
      marketValueTry: form.marketValueTry,
    });
    if (fraud.blocked) {
      setError(
        "Girdi doğrulaması başarısız: şüpheli veya tutarsız veri tespit edildi. Lütfen alanları kontrol edin veya danışmanınızla iletişime geçin.",
      );
      return;
    }
    setLoading(true);
    try {
      const payload = buildPayload();
      const res = await submitInstantOffer(payload);
      if (fraud.manualReview && res.status === "OFFER_GENERATED") {
        setResult({
          ...res,
          status: "LEGAL_REVIEW",
        });
        setStep(3);
        return;
      }
      setResult(res);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Başvuru gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md space-y-4">
      <PreFeasibilityBanner />
      <div className="mb-6 flex gap-2 text-xs text-slate-400">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`rounded-full px-3 py-1 border ${
              step === n ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-100" : "border-white/10"
            }`}
          >
            Adım {n}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Mülk bilgileri</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              İl
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              İlçe
              <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm text-slate-300 sm:col-span-2">
              Adres
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              Brüt m²
              <Input
                type="number"
                min={10}
                value={form.grossM2}
                onChange={(e) => setForm({ ...form, grossM2: Number(e.target.value) })}
              />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              Piyasa değeri (TRY)
              <Input
                type="number"
                min={100_000}
                value={form.marketValueTry}
                onChange={(e) => setForm({ ...form, marketValueTry: Number(e.target.value) })}
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
          <h2 className="text-lg font-semibold text-white">Hukuki kontrol listesi</h2>
          <p className="text-sm text-slate-400">
            Risk skoru: <span className="text-cyan-200 font-medium">{preview.riskScore}</span> — ön durum:{" "}
            {statusLabel(preview.status)}
          </p>
          <ul className="space-y-3">
            {FLAG_KEYS.map((key) => (
              <li key={key} className="flex items-start gap-3 rounded-lg border border-white/10 p-3">
                <Checkbox
                  id={key}
                  checked={flags[key]}
                  onCheckedChange={(v) => toggleFlag(key, v === true)}
                />
                <label htmlFor={key} className="text-sm text-slate-200 cursor-pointer">
                  {LEGAL_RISK_FLAG_LABELS[key]}
                  <span className="block text-xs text-slate-500">+{preview.breakdown.find((b) => b.key === key)?.points ?? 0} puan</span>
                </label>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-white/10 p-4 space-y-3">
            <p className="text-sm font-medium text-white">Takas tercihi</p>
            <div className="flex flex-wrap gap-2">
              {(["CASH_ONLY", "TRADE_IN", "BOTH"] as IBuyerTargetOption[]).map((opt) => (
                <Button
                  key={opt}
                  type="button"
                  size="sm"
                  variant={targetOption === opt ? "default" : "outline"}
                  onClick={() => setTargetOption(opt)}
                >
                  {opt === "CASH_ONLY" ? "Nakit" : opt === "TRADE_IN" ? "Takas" : "Nakit + Takas"}
                </Button>
              ))}
            </div>
            {(targetOption === "TRADE_IN" || targetOption === "BOTH") && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Hedef il"
                  value={form.desiredCity}
                  onChange={(e) => setForm({ ...form, desiredCity: e.target.value })}
                />
                <Input
                  placeholder="Hedef ilçe"
                  value={form.desiredDistrict}
                  onChange={(e) => setForm({ ...form, desiredDistrict: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4" /> Geri
            </Button>
            <Button type="button" disabled={loading} onClick={onSubmit}>
              {loading ? "Hesaplanıyor…" : "Teklifi hesapla"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      )}

      {step === 3 && result && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">{statusLabel(result.status)}</h2>
          {result.demoMode && (
            <p className="text-xs text-amber-200/90 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2">
              Demo modu: Supabase yapılandırılmadı veya RPC kullanılamadı; sonuç yerel motorla üretildi.
            </p>
          )}
          {result.status === "OFFER_GENERATED" &&
            result.offerAmountTry != null &&
            Number.isFinite(result.offerAmountTry) && (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
              <p className="text-emerald-100 text-2xl font-bold">{formatTry(result.offerAmountTry)}</p>
              <p className="text-sm text-emerald-200/80 mt-1">
                Piyasa: {formatTry(result.marketValueTry)} · Risk skoru: {result.riskScore}
              </p>
              {result.expiresAt && <Countdown expiresAt={result.expiresAt} />}
            </div>
          )}
          {result.status === "LEGAL_REVIEW" && (
            <p className="flex items-center gap-2 text-amber-200 text-sm font-medium">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              Mülkünüz Hukuk Heyetimiz Tarafından İnceleniyor. 1–2 iş günü içinde sizinle iletişime geçilecektir.
            </p>
          )}
          {result.status === "REJECTED" && (
            <p className="text-sm text-slate-400">
              Mevcut hukuki profil otomatik nakit teklif için uygun değil; danışmanlık kanalı açılabilir.
            </p>
          )}
          <ul className="text-xs text-slate-500 space-y-1">
            {result.breakdown
              .filter((b) => b.points > 0)
              .map((b) => (
                <li key={b.key}>
                  {LEGAL_RISK_FLAG_LABELS[b.key]}: +{b.points}
                </li>
              ))}
          </ul>
          <Button type="button" variant="outline" onClick={() => { setStep(1); setResult(null); }}>
            <CheckCircle2 className="h-4 w-4" /> Yeni başvuru
          </Button>
        </div>
      )}
    </div>
  );
}
