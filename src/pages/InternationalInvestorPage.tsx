import { useMemo, useState } from "react";
import { Globe2, Languages, Landmark, PlaneTakeoff } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

type LocalMode = "tr" | "en" | "ar" | "ru";

const snippets: Record<LocalMode, { title: string; subtitle: string; guideTitle: string }> = {
  tr: {
    title: "Uluslararası Yatırımcı Modu",
    subtitle: "TR/EN aktif, AR/RU altyapı modu dahil demo uluslararası akış.",
    guideTitle: "Yabancı yatırımcı satış rehberi",
  },
  en: {
    title: "International Investor Mode",
    subtitle: "TR/EN active, AR/RU infrastructure-ready in demo mode.",
    guideTitle: "Foreign investor sales guide",
  },
  ar: {
    title: "وضع المستثمر الدولي",
    subtitle: "العربية وضع تجريبي (بنية تحتية) مع دعم TR/EN.",
    guideTitle: "دليل بيع المستثمر الأجنبي",
  },
  ru: {
    title: "Режим международного инвестора",
    subtitle: "Русский в режиме инфраструктурного демо вместе с TR/EN.",
    guideTitle: "Руководство для иностранного инвестора",
  },
};

export default function InternationalInvestorPage() {
  const [languageMode, setLanguageMode] = useState<LocalMode>("tr");
  const { currency, setCurrency, formatFromTry, usdRate } = useCurrency();

  const citizenshipThresholdTry = useMemo(() => 400_000 * usdRate, [usdRate]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-16 pt-24 text-slate-100 lg:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-cyan-300">International</p>
          <h1 className="mt-1 text-3xl font-black text-white">{snippets[languageMode].title}</h1>
          <p className="mt-2 text-sm text-slate-300">{snippets[languageMode].subtitle}</p>
          <p className="mt-2 text-xs text-slate-400">
            Çoklu dil/para birimi ve yabancı süreç akışı demo/temsili amaçlıdır.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4">
            <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
              <Languages className="h-5 w-5 text-cyan-300" /> Dil seçici
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["tr", "en", "ar", "ru"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguageMode(lang)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                    languageMode === lang
                      ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-100"
                      : "border-slate-600 text-slate-300"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-300">
              TR + EN tam aktif, AR/RU altyapı modu uluslararası içerik üretimine hazır.
            </p>
          </article>

          <article className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4">
            <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
              <Globe2 className="h-5 w-5 text-cyan-300" /> Para birimi seçici
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["TRY", "USD", "EUR", "GBP"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                    currency === code
                      ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-100"
                      : "border-slate-600 text-slate-300"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Örnek liste fiyatı: <strong className="text-cyan-200">{formatFromTry(18_900_000)}</strong>
            </p>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
            <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
              <PlaneTakeoff className="h-5 w-5 text-amber-300" />
              {snippets[languageMode].guideTitle}
            </h2>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>1) Ön uygunluk ve mülk tipi doğrulaması (demo KYC akışına bağlı).</p>
              <p>2) Değerleme/ekspertiz + yasal evrak kontrolü.</p>
              <p>3) Teklif, sözleşme ve ödeme adımlarında çoklu para birimi görünümü.</p>
              <p>4) Tapu/süreç sonrası portföy takibi ve raporlama.</p>
            </div>
          </article>

          <article className="rounded-2xl border border-amber-400/25 bg-slate-900/60 p-4">
            <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
              <Landmark className="h-5 w-5 text-amber-300" />
              Vatandaşlık Uygunluğu Etiketi
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {formatFromTry(citizenshipThresholdTry)} ve üzeri ilanlar için
              <span className="ml-1 rounded bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-200">
                Citizenship Eligible 400K+
              </span>{" "}
              etiketi görünür.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Etiketleme kuralı temsili/demo eşik üzerinden çalışır.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
