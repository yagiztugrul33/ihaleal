import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Globe2, Languages, Landmark, PlaneTakeoff } from "lucide-react";
import { CurrencyProvider, useCurrency } from "@/contexts/CurrencyContext";

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

function InternationalInvestorPageBody() {
  const [languageMode, setLanguageMode] = useState<LocalMode>("tr");
  const {
    currency,
    setCurrency,
    formatFromTry,
    usdRate,
    eurRate,
    gbpRate,
    goldGramTry,
    eurUsdParity,
    ratesUpdatedAtIso,
    ratesSource,
    refreshRates,
  } = useCurrency();

  const citizenshipThresholdTry = useMemo(() => 400_000 * usdRate, [usdRate]);

  return (
    <div className="min-h-screen bg-background px-4 pb-16 pt-24 text-foreground lg:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="rounded-[20px] border border-cyan-400/20 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-cyan-300">International</p>
          <h1 className="mt-1 text-3xl font-normal text-foreground">{snippets[languageMode].title}</h1>
          <p className="mt-2 text-sm text-slate-300">{snippets[languageMode].subtitle}</p>
          <p className="mt-2 text-xs text-slate-400">
            Çoklu dil/para birimi ve yabancı süreç akışı demo/temsili amaçlıdır.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[20px] border border-slate-700/80 bg-slate-900/60 p-4">
            <h2 className="inline-flex items-center gap-2 text-lg font-normal text-foreground">
              <Languages className="h-5 w-5 text-cyan-300" /> Dil seçici
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["tr", "en", "ar", "ru"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguageMode(lang)}
                  className={`rounded-[3px] border px-3 py-1.5 text-xs font-normal ${
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

          <article className="rounded-[20px] border border-slate-700/80 bg-slate-900/60 p-4">
            <h2 className="inline-flex items-center gap-2 text-lg font-normal text-foreground">
              <Globe2 className="h-5 w-5 text-cyan-300" /> Para birimi seçici
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["TRY", "USD", "EUR", "GBP"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={`rounded-[3px] border px-3 py-1.5 text-xs font-normal ${
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
            <div className="mt-3 rounded-[10px] border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-slate-300 space-y-1">
              <p>USD/TRY {usdRate.toFixed(4)} · EUR/TRY {eurRate.toFixed(4)} · GBP/TRY {gbpRate.toFixed(4)}</p>
              <p>Altın (gram/TRY): ₺{goldGramTry.toFixed(2)} · EUR/USD parite: {eurUsdParity.toFixed(4)}</p>
              <p>
                Kaynak: {ratesSource === "tcmb_api" ? "TCMB otomatik" : "Mock otomatik"} · Son güncelleme:{" "}
                {new Date(ratesUpdatedAtIso).toLocaleString("tr-TR")}
              </p>
              <button
                type="button"
                onClick={() => void refreshRates()}
                className="rounded-[3px] border border-cyan-500/30 px-2 py-1 text-cyan-200 hover:bg-cyan-500/10"
              >
                Kurları manuel yenile
              </button>
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-[20px] border border-slate-700/80 bg-slate-900/60 p-4">
            <h2 className="inline-flex items-center gap-2 text-lg font-normal text-foreground">
              <PlaneTakeoff className="h-5 w-5 text-amber-300" />
              {snippets[languageMode].guideTitle}
            </h2>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>1) Ön uygunluk ve mülk tipi doğrulaması (demo KYC akışına bağlı).</p>
              <p>2) Değerleme/ekspertiz + yasal evrak kontrolü.</p>
              <p>3) Teklif, sözleşme ve ödeme adımlarında çoklu para birimi görünümü.</p>
              <p>4) Tapu/süreç sonrası portföy takibi ve raporlama.</p>
              <p>5) Yabancı yatırımcı onboarding: AML risk skoru, vergi notu, hukuki taslak onayı (mock).</p>
            </div>
          </article>

          <article className="rounded-[20px] border border-amber-400/25 bg-slate-900/60 p-4">
            <h2 className="inline-flex items-center gap-2 text-lg font-normal text-foreground">
              <Landmark className="h-5 w-5 text-amber-300" />
              Vatandaşlık Uygunluğu Etiketi
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {formatFromTry(citizenshipThresholdTry)} ve üzeri ilanlar için
              <span className="ms-1 rounded-[3px] bg-amber-500/15 px-2 py-0.5 text-xs font-normal text-amber-200">
                Citizenship Eligible 400K+
              </span>{" "}
              etiketi görünür.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Etiketleme kuralı temsili/demo eşik üzerinden çalışır.
            </p>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[20px] border border-cyan-400/25 bg-slate-900/60 p-4">
            <p className="text-xs font-normal uppercase tracking-[0.12em] text-cyan-200">Pazar Masası</p>
            <p className="mt-2 text-sm text-slate-300">Bölgesel fiyat, döviz oynaklığı ve likidite işaretleri tek panelde toplanır.</p>
          </article>
          <article className="rounded-[20px] border border-emerald-400/25 bg-slate-900/60 p-4">
            <p className="text-xs font-normal uppercase tracking-[0.12em] text-emerald-200">Uygunluk Akışı</p>
            <p className="mt-2 text-sm text-slate-300">KYC, AML ve evrak kontrolü adım adım ilerler; kritik riskler erken işaretlenir.</p>
          </article>
          <article className="rounded-[20px] border border-violet-400/25 bg-slate-900/60 p-4">
            <p className="text-xs font-normal uppercase tracking-[0.12em] text-violet-200">Aksiyon</p>
            <p className="mt-2 text-sm text-slate-300">
              <Link to="/ihaleler" className="text-primary hover:text-foreground">İhalelere geç</Link> veya{" "}
              <Link to="/komisyon-hesaplayici" className="text-primary hover:text-foreground">maliyetleri simüle et</Link>.
            </p>
          </article>
        </section>

        <section className="rounded-[20px] border border-slate-700/80 bg-slate-900/60 p-4">
          <h2 className="text-lg font-normal text-foreground">Yabancı yatırımcı operasyon akışı (dolu demo)</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-[10px] border border-border bg-secondary/80 p-3 text-sm text-muted-foreground">
              <p className="font-normal text-foreground">Doküman paketi</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>- Pasaport + adres doğrulama + vergi numarası</li>
                <li>- Fon kaynağı beyanı (AML/KYC)</li>
                <li>- Vekalet/sözleşme dili eşleşmesi (TR/EN)</li>
              </ul>
            </div>
            <div className="rounded-[10px] border border-border bg-secondary/80 p-3 text-sm text-muted-foreground">
              <p className="font-normal text-foreground">İşlem kontrol listesi</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>- Çoklu para biriminde teklif görünümü</li>
                <li>- Kur oynaklığına karşı bilgilendirme bandı</li>
                <li>- Tapu, harç ve vergi yükümlülüğü uyarıları</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// CurrencyProvider App.tsx global tree'sinde YOK; bu rota icin lokal provider
// (kapsami sayfa-icine sinirla — yan etki yok).
export default function InternationalInvestorPage() {
  return (
    <CurrencyProvider>
      <InternationalInvestorPageBody />
    </CurrencyProvider>
  );
}
