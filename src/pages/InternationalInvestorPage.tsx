import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

const FX_ADVANTAGES = [
  {
    title: "Kur bazlı karşılaştırma",
    detail:
      "Teklif aşamasında TRY ve yabancı para görünümü aynı panelde izlenir; kur oynaklığı karar notu otomatik gösterilir.",
  },
  {
    title: "Vergi kalemi görünürlüğü",
    detail:
      "Tapu, harç ve potansiyel değer artış vergisi kalemleri işlem öncesi ayrı satırlarla açıklanır.",
  },
  {
    title: "Süreç şeffaflığı",
    detail:
      "KYC, AML, sözleşme dili ve resmi evrak adımları sıra numarasıyla işlenir; eksik adım atlanmaz.",
  },
] as const;

const FOREIGN_PROCESS = [
  "1) Ön uygunluk: hedef varlık tipi, bütçe ve risk iştahı tanımlanır.",
  "2) Kur + vergi ön analizi: ödeme para birimi, olası vergi yükleri ve toplam maliyet görünür.",
  "3) Evrak / KYC / AML: pasaport, adres, fon kaynağı ve işlem amacı kontrolleri tamamlanır.",
  "4) Teklif ve sözleşme: çoklu dilde bilgilendirme + bağlayıcı adım öncesi hukuki doğrulama.",
  "5) Kapanış ve portföy takibi: işlem sonrası performans ekranı ve rapor akışı aktif edilir.",
] as const;

export default function InternationalInvestorPage() {
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
        <section className="rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-cyan-300">International</p>
          <h1 className="mt-1 text-3xl font-black text-foreground">{snippets[languageMode].title}</h1>
          <p className="mt-2 text-sm text-slate-300">{snippets[languageMode].subtitle}</p>
          <p className="mt-2 text-xs text-slate-400">
            Çoklu dil/para birimi ve yabancı süreç akışı demo/temsili amaçlıdır.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4">
            <h2 className="inline-flex items-center gap-2 text-lg font-bold text-foreground">
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
            <h2 className="inline-flex items-center gap-2 text-lg font-bold text-foreground">
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
            <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-slate-300 space-y-1">
              <p>USD/TRY {usdRate.toFixed(4)} · EUR/TRY {eurRate.toFixed(4)} · GBP/TRY {gbpRate.toFixed(4)}</p>
              <p>Altın (gram/TRY): ₺{goldGramTry.toFixed(2)} · EUR/USD parite: {eurUsdParity.toFixed(4)}</p>
              <p>
                Kaynak: {ratesSource === "tcmb_api" ? "TCMB otomatik" : "Mock otomatik"} · Son güncelleme:{" "}
                {new Date(ratesUpdatedAtIso).toLocaleString("tr-TR")}
              </p>
              <button
                type="button"
                onClick={() => void refreshRates()}
                className="rounded border border-cyan-500/30 px-2 py-1 text-cyan-200 hover:bg-cyan-500/10"
              >
                Kurları manuel yenile
              </button>
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
            <h2 className="inline-flex items-center gap-2 text-lg font-bold text-foreground">
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

          <article className="rounded-2xl border border-amber-400/25 bg-slate-900/60 p-4">
            <h2 className="inline-flex items-center gap-2 text-lg font-bold text-foreground">
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

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-cyan-400/25 bg-slate-900/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200">Pazar Masası</p>
            <p className="mt-2 text-sm text-slate-300">Bölgesel fiyat, döviz oynaklığı ve likidite işaretleri tek panelde toplanır.</p>
          </article>
          <article className="rounded-xl border border-emerald-400/25 bg-slate-900/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-200">Uygunluk Akışı</p>
            <p className="mt-2 text-sm text-slate-300">KYC, AML ve evrak kontrolü adım adım ilerler; kritik riskler erken işaretlenir.</p>
          </article>
          <article className="rounded-xl border border-violet-400/25 bg-slate-900/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-200">Aksiyon</p>
            <p className="mt-2 text-sm text-slate-300">
              <Link to="/ihaleler" className="text-primary hover:text-foreground">İhalelere geç</Link> veya{" "}
              <Link to="/komisyon-hesaplayici" className="text-primary hover:text-foreground">maliyetleri simüle et</Link>.
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-cyan-400/20 bg-slate-900/60 p-4">
          <h2 className="text-lg font-bold text-foreground">Döviz / vergi avantajı ve süreç disiplini</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {FX_ADVANTAGES.map((item) => (
              <article key={item.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{item.detail}</p>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Dürüst sınır: Vergi ve vatandaşlık etkileri kişisel duruma göre değişir; nihai değerlendirme için uzman hukuk/mali müşavir görüşü gerekir.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
          <h2 className="text-lg font-bold text-foreground">Yabancı yatırımcı operasyon akışı (dolu demo)</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-secondary/80 p-3 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Doküman paketi</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>- Pasaport + adres doğrulama + vergi numarası</li>
                <li>- Fon kaynağı beyanı (AML/KYC)</li>
                <li>- Vekalet/sözleşme dili eşleşmesi (TR/EN)</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-secondary/80 p-3 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">İşlem kontrol listesi</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>- Çoklu para biriminde teklif görünümü</li>
                <li>- Kur oynaklığına karşı bilgilendirme bandı</li>
                <li>- Tapu, harç ve vergi yükümlülüğü uyarıları</li>
              </ul>
            </div>
          </div>
          <ol className="mt-4 space-y-2 text-xs text-slate-300">
            {FOREIGN_PROCESS.map((step) => (
              <li key={step} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                {step}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
