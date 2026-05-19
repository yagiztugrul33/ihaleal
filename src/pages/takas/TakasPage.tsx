import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Repeat,
  ShieldAlert,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LEGAL_RISK_FLAG_LABELS,
  assessLegalRisk,
  type LegalRiskFlagKey,
  type LegalRiskFlags,
} from "@/lib/ibuyer";
import {
  TAKAS_PROPERTY_LABELS,
  TAKAS_TIMELINE_LABELS,
  previewMatchScore,
  submitTakas,
  type TakasApplicationPayload,
  type TakasFormState,
  type TakasPropertyType,
  type TakasResult,
  type TakasRooms,
  type TakasTimeline,
} from "@/lib/takas";
import { useAuth } from "@/contexts/AuthContext";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { ROUTES } from "@/constants/routes";

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
const ROOMS_OPTIONS: TakasRooms[] = ["1+0", "1+1", "2+1", "3+1", "4+1", "5+"];

type Step = 1 | 2 | 3;

function formatTry(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) return setRemaining("Süre doldu");
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
      Takas teklifi geçerlilik: {remaining}
    </p>
  );
}

function TakasHero() {
  return (
    <header className="relative overflow-hidden border-b border-white/5">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 0%, rgba(59,130,246,0.18) 0%, transparent 60%), linear-gradient(180deg, #0a0e1a 0%, #0f1729 100%)",
        }}
        aria-hidden
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
          <Repeat className="h-3.5 w-3.5" /> Takas / Trade-In
        </span>
        <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Gayrimenkulünüzü{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            takas
          </span>{" "}
          edin.
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-base text-slate-300 leading-relaxed">
          Mevcut mülkünüzü kurumsal güvence ile yeni bir gayrimenkul ile değiştirin.
          AI destekli risk analizi + 72 saat geçerli teklif. Komisyon ve danışmanlık
          süreçleri tek platformda.
        </p>
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            72 saat geçerli teklif
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Hukuki risk matrisi
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Bankable ön fizibilite
          </span>
        </div>
      </div>
    </header>
  );
}

function StepDots({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={
            "h-1.5 flex-1 rounded-full transition-colors " +
            (n <= step ? "bg-blue-500" : "bg-white/10")
          }
        />
      ))}
    </div>
  );
}

const TRADE_CARDS = Array.from({ length: 8 }, (_, i) => ({
  id: `t${i + 1}`,
  from: ["Konut 3+1 Kadikoy", "Villa Bodrum", "Ofis Levent", "Arsa Bursa", "Daire Izmir", "Rezidans Ankara", "Yazlik Mugla", "Dukkan Antalya"][i],
  to: ["Villa Cesme", "Konut Ankara", "Arsa Izmir", "Konut Istanbul", "Ticari Bursa", "Villa Antalya", "Konut Eskisehir", "Arsa Konya"][i],
  delta: [-450_000, 1_200_000, 800_000, -200_000, 350_000, 2_100_000, -80_000, 520_000][i],
}));

function TakasShowcase() {
  const [mine, setMine] = useState(5_000_000);
  const [target, setTarget] = useState(5_800_000);
  const diff = target - mine;
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <h2 className="text-xl font-bold text-white text-center">Ornek takas firsatlari (8)</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TRADE_CARDS.map((t) => (
          <article key={t.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm">
            <p className="text-slate-400">{t.from}</p>
            <p className="text-white font-medium my-1">→ {t.to}</p>
            <p className={t.delta >= 0 ? "text-emerald-400" : "text-amber-300"}>
              {t.delta >= 0 ? "+" : ""}
              {formatTry(t.delta)}
            </p>
          </article>
        ))}
      </div>
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 grid gap-4 sm:grid-cols-3 items-end">
        <label className="text-sm text-slate-300">
          Mevcut mulk (TRY)
          <Input type="number" value={mine} onChange={(e) => setMine(Number(e.target.value))} className="mt-1" />
        </label>
        <label className="text-sm text-slate-300">
          Hedef mulk (TRY)
          <Input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} className="mt-1" />
        </label>
        <div className="text-sm">
          <span className="text-slate-500">Fark</span>
          <p className="text-lg font-bold text-white">{formatTry(diff)}</p>
        </div>
      </div>
    </section>
  );
}

function TakasForm() {
  const [step, setStep] = useState<Step>(1);
  const [flags, setFlags] = useState<LegalRiskFlags>(EMPTY_FLAGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TakasResult | null>(null);

  const [form, setForm] = useState<TakasFormState>({
    city: "İstanbul",
    district: "",
    address: "",
    parcelNo: "",
    grossM2: "120",
    marketValueTry: "5000000",
    propertyType: "konut",
    contactPhone: "",
    contactEmail: "",
    legalFlags: EMPTY_FLAGS,
    desiredCity: "",
    desiredDistrict: "",
    desiredPropertyType: "konut",
    desiredBudgetTry: "5000000",
    desiredMinM2: "",
    desiredMaxM2: "",
    desiredRooms: "",
    timeline: "M3",
    tradeInNotes: "",
  });

  const preview = useMemo(() => assessLegalRisk(flags), [flags]);

  const buildPayload = (): TakasApplicationPayload => ({
    city: form.city,
    district: form.district || undefined,
    address: form.address || undefined,
    parcelNo: form.parcelNo || undefined,
    grossM2: Number(form.grossM2),
    marketValueTry: Number(form.marketValueTry),
    propertyType: form.propertyType,
    contactPhone: form.contactPhone || undefined,
    contactEmail: form.contactEmail || undefined,
    legalFlags: flags,
    targetOption: "TRADE_IN",
    desiredCity: form.desiredCity.trim(),
    desiredDistrict: form.desiredDistrict || undefined,
    desiredPropertyType: form.desiredPropertyType,
    desiredBudgetTry: Number(form.desiredBudgetTry),
    desiredMinM2: form.desiredMinM2 ? Number(form.desiredMinM2) : undefined,
    desiredMaxM2: form.desiredMaxM2 ? Number(form.desiredMaxM2) : undefined,
    desiredRooms: form.desiredRooms || undefined,
    timeline: form.timeline,
    tradeInNotes: form.tradeInNotes || undefined,
  });

  const livePreviewScore = useMemo(() => {
    try {
      return previewMatchScore(buildPayload());
    } catch {
      return 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const canProceedFromStep1 =
    form.city.trim().length > 0 &&
    Number(form.grossM2) > 0 &&
    Number(form.marketValueTry) > 0;
  const canProceedFromStep2 =
    form.desiredCity.trim().length > 0 && Number(form.desiredBudgetTry) > 0;

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await submitTakas(buildPayload());
      setResult(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const isOffer = result.status === "OFFER_GENERATED";
    return (
      <div
        data-testid="takas-result"
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Takas başvurusu sonucu
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white">
              {isOffer
                ? "Teklif üretildi"
                : result.status === "LEGAL_REVIEW"
                  ? "Hukuk incelemesi gerekli"
                  : "Başvuru uygun değil"}
            </h2>
          </div>
          {isOffer && result.expiresAt ? (
            <Countdown expiresAt={result.expiresAt} />
          ) : null}
        </div>

        {isOffer ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-5">
              <p className="text-xs text-emerald-200">Nakit teklif</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {formatTry(result.offerAmountTry ?? 0)}
              </p>
              <p className="mt-1 text-xs text-slate-300">
                Piyasa değeri: {formatTry(result.marketValueTry)}
              </p>
            </div>
            <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-5">
              <p className="text-xs text-blue-200">Hedef property eşleşme skoru</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {result.matchPreviewScore ?? 0}
                <span className="text-base text-slate-400">/100</span>
              </p>
              <p className="mt-1 text-xs text-slate-300">
                Daha spesifik kriter = daha iyi eşleşme
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-5 text-sm text-amber-100">
            <ShieldAlert className="h-4 w-4 inline mr-2" />
            Hukuki risk skorunuz {result.riskScore}. Kurumsal incelememiz 24 saat
            içinde size dönecektir.
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="border-white/20"
            onClick={() => {
              setResult(null);
              setStep(1);
            }}
          >
            Yeni başvuru
          </Button>
          <Button asChild>
            <a href={ROUTES.HOME}>Ana sayfa</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
      <StepDots step={step} />

      {step === 1 ? (
        <section data-testid="takas-step-1" className="space-y-5">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Wallet className="h-4 w-4 text-blue-300" />
            <span>1 / 3 — Verdiğiniz gayrimenkul</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">İl</span>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">İlçe</span>
              <Input
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              />
            </label>
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs text-slate-400">Adres (opsiyonel)</span>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">Brüt m²</span>
              <Input
                type="number"
                min={1}
                value={form.grossM2}
                onChange={(e) => setForm({ ...form, grossM2: e.target.value })}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">Piyasa değeri (TRY)</span>
              <Input
                type="number"
                min={1}
                value={form.marketValueTry}
                onChange={(e) =>
                  setForm({ ...form, marketValueTry: e.target.value })
                }
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">Tip</span>
              <select
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white"
                value={form.propertyType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    propertyType: e.target.value as TakasPropertyType,
                  })
                }
              >
                {(Object.keys(TAKAS_PROPERTY_LABELS) as TakasPropertyType[]).map(
                  (p) => (
                    <option key={p} value={p}>
                      {TAKAS_PROPERTY_LABELS[p]}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">Parsel no (opsiyonel)</span>
              <Input
                value={form.parcelNo}
                onChange={(e) => setForm({ ...form, parcelNo: e.target.value })}
              />
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              disabled={!canProceedFromStep1}
              onClick={() => setStep(2)}
              className="gap-2"
            >
              İlerle <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section data-testid="takas-step-2" className="space-y-5">
          <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-300" />
              2 / 3 — Hedef gayrimenkul kriterleri
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              Eşleşme önizleme: {livePreviewScore}/100
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">Hedef il *</span>
              <Input
                value={form.desiredCity}
                onChange={(e) =>
                  setForm({ ...form, desiredCity: e.target.value })
                }
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">Hedef ilçe</span>
              <Input
                value={form.desiredDistrict}
                onChange={(e) =>
                  setForm({ ...form, desiredDistrict: e.target.value })
                }
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">Hedef tip</span>
              <select
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white"
                value={form.desiredPropertyType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    desiredPropertyType: e.target.value as TakasPropertyType,
                  })
                }
              >
                {(Object.keys(TAKAS_PROPERTY_LABELS) as TakasPropertyType[]).map(
                  (p) => (
                    <option key={p} value={p}>
                      {TAKAS_PROPERTY_LABELS[p]}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">Bütçe (TRY) *</span>
              <Input
                type="number"
                min={1}
                value={form.desiredBudgetTry}
                onChange={(e) =>
                  setForm({ ...form, desiredBudgetTry: e.target.value })
                }
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">Min m²</span>
              <Input
                type="number"
                min={0}
                value={form.desiredMinM2}
                onChange={(e) =>
                  setForm({ ...form, desiredMinM2: e.target.value })
                }
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">Max m²</span>
              <Input
                type="number"
                min={0}
                value={form.desiredMaxM2}
                onChange={(e) =>
                  setForm({ ...form, desiredMaxM2: e.target.value })
                }
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">Oda planı</span>
              <select
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white"
                value={form.desiredRooms}
                onChange={(e) =>
                  setForm({
                    ...form,
                    desiredRooms: e.target.value as TakasRooms | "",
                  })
                }
              >
                <option value="">Farketmez</option>
                {ROOMS_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">Zaman tercihi</span>
              <select
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white"
                value={form.timeline}
                onChange={(e) =>
                  setForm({ ...form, timeline: e.target.value as TakasTimeline })
                }
              >
                {(Object.keys(TAKAS_TIMELINE_LABELS) as TakasTimeline[]).map(
                  (t) => (
                    <option key={t} value={t}>
                      {TAKAS_TIMELINE_LABELS[t]}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-xs text-slate-400">
              Ek notlar (örn. otoparklı, deniz manzaralı)
            </span>
            <textarea
              rows={3}
              className="w-full rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-white"
              value={form.tradeInNotes}
              onChange={(e) =>
                setForm({ ...form, tradeInNotes: e.target.value })
              }
            />
          </label>

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              className="border-white/20 gap-2"
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="h-4 w-4" /> Geri
            </Button>
            <Button
              disabled={!canProceedFromStep2}
              onClick={() => setStep(3)}
              className="gap-2"
            >
              İlerle <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section data-testid="takas-step-3" className="space-y-5">
          <div className="text-sm text-slate-300">
            <ShieldAlert className="h-4 w-4 inline mr-2 text-amber-300" />
            3 / 3 — Hukuki durum (her şey doğru beyan edilmelidir)
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 grid sm:grid-cols-2 gap-3">
            {FLAG_KEYS.map((key) => (
              <label
                key={key}
                className="flex items-start gap-2 text-sm text-slate-200"
              >
                <Checkbox
                  checked={flags[key]}
                  onCheckedChange={(c) =>
                    setFlags((prev) => ({ ...prev, [key]: c === true }))
                  }
                />
                <span>{LEGAL_RISK_FLAG_LABELS[key]}</span>
              </label>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">Telefon (opsiyonel)</span>
              <Input
                value={form.contactPhone}
                onChange={(e) =>
                  setForm({ ...form, contactPhone: e.target.value })
                }
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-slate-400">Email (opsiyonel)</span>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm({ ...form, contactEmail: e.target.value })
                }
              />
            </label>
          </div>

          <div className="rounded-xl border border-blue-400/20 bg-blue-500/5 p-4 text-xs text-slate-300">
            Ön risk skoru (önizleme): <strong>{preview.riskScore}</strong>. Backend
            kesin hesaplamayı yapacaktır. Bu sayfa yatırım tavsiyesi değildir, ön
            fizibilite niteliğindedir.
          </div>

          {error ? (
            <div
              data-testid="takas-error"
              className="rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200 flex items-start justify-between gap-3"
            >
              <span>{error}</span>
              <button
                type="button"
                className="underline whitespace-nowrap"
                onClick={handleSubmit}
              >
                Tekrar dene
              </button>
            </div>
          ) : null}

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              className="border-white/20 gap-2"
              onClick={() => setStep(2)}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" /> Geri
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="gap-2"
              data-testid="takas-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Gönderiliyor
                </>
              ) : (
                <>
                  Takas teklifini al <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function TakasPage() {
  const { user, loading } = useAuth();
  return (
    <main className="min-h-screen text-white">
      <TakasHero />
      <TakasShowcase />
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div
            data-testid="takas-loading"
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 animate-pulse space-y-4"
          >
            <div className="h-4 w-1/3 rounded bg-slate-700" />
            <div className="h-10 rounded bg-slate-700" />
            <div className="h-10 rounded bg-slate-700" />
            <div className="h-10 w-1/2 rounded bg-slate-700" />
          </div>
        ) : user ? (
          <TakasForm />
        ) : (
          <RequireAuthGate
            redirectTo="/takas"
            title="Takas başvurusu için giriş yapın"
            description="Kurumsal güvence ve KYC doğrulaması gereği takas başvurusu için hesap zorunludur."
          />
        )}
      </section>
    </main>
  );
}
