import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/marketing/PageShell";
import { NasilCalisirVideoSection } from "@/components/nasilCalisir/NasilCalisirVideoSection";
import { JourneyIcon } from "@/components/nasilCalisir/NasilCalisirShared";
import { ROUTES } from "@/constants/routes";
import { ANTI_SNIPING_EXTEND_SECONDS, ANTI_SNIPING_THRESHOLD_SECONDS, FEES, formatBidBondPercent } from "@/lib/fees";
import {
  NASIL_CALISIR_ARCHITECTURE,
  NASIL_CALISIR_BELGELER,
  NASIL_CALISIR_INTRO,
  NASIL_CALISIR_JOURNEYS,
  NASIL_CALISIR_PRENSIPLER,
  NASIL_CALISIR_SOZLESMELER,
  NASIL_CALISIR_STEPS,
  isJourneySlug,
  type NasilCalisirJourneySlug,
} from "@/data/nasilCalisirContent";
import { useEnsureLocale } from "@/hooks/useEnsureLocale";

const MINI_SSS = [
  {
    soru: "Teklifim geçerli sayılması için AI raporunu onaylamak zorunlu mu?",
    cevap:
      "Demo akışında güvenlik ve uyum simülasyonu için sıkça istenir. Canlı üretimde ilan şartnamesi ve regülasyon hangi onayların zorunlu olduğunu belirler.",
  },
  {
    soru: "Teminat yüzdesi nereden geliyor?",
    cevap: `Referans bid bond yüzdesi ${formatBidBondPercent()} olarak yapılandırmada tutulur; yasal metinler onaylandığında güncellenir.`,
  },
  {
    soru: "Bakiye iade penceresi ne kadar?",
    cevap: `Taslak refund penceresi ${FEES.refundWindowDays} gün olarak referans alınır; teklif koşullarında farklı yazılabilir.`,
  },
  {
    soru: "Kapalı teklifte kimler fiyat görür?",
    cevap: "Kapanışa kadar yalnızca satıcı ve yetkili operasyon rolleri tüm teklifleri görebilir; katılımcılar kendi tekliflerini görür.",
  },
  {
    soru: "Yurtdışından katılabilir miyim?",
    cevap: "Ülke ve ödeme kurallarına göre değişir; bazı ihaleler yalnızca yerel kimlikle sınırlanabilir. İlan etiketlerini okuyun.",
  },
  {
    soru: "Ana sayfadaki intro ile bu tanıtım videosu aynı mı?",
    cevap:
      "Hayır. Ana sayfa hero’sunda kısa görsel alan vardır; bu sayfadaki bölüm ürün tanıtım videosu ve adım adım platform anlatımı içindir.",
  },
];

export default function NasilCalisir() {
  useEnsureLocale("tr");

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const yParam = searchParams.get("yol");
  const aktifYol: NasilCalisirJourneySlug = isJourneySlug(yParam) ? yParam : "alici";

  const setYol = (slug: NasilCalisirJourneySlug) => {
    setSearchParams({ yol: slug }, { replace: true });
  };

  const aktifJourney = NASIL_CALISIR_JOURNEYS.find((y) => y.slug === aktifYol)!;

  return (
    <PageShell
      badge="Rehber"
      title="Nasıl çalışır?"
      subtitle="Platform tanıtımı, dört genel adım, beş rol yolculuğu, belgeler ve sözleşmeler. Süreler ve ücretler yapılandırılabilir; hukuki kesinlik ilan şartnamesi ve sözleşmededir."
      cta={{ label: "Canlı ihaleler", to: "/ihaleler" }}
    >
      <div className="pb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 mb-4 -ml-2" style={{ color: "var(--color-text-muted)" }}>
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Button>
      </div>

      <section className="card-warm mb-10">
        <h2 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
          {NASIL_CALISIR_INTRO.title}
        </h2>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--color-text-muted)" }}>
          {NASIL_CALISIR_INTRO.lead}
        </p>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {NASIL_CALISIR_INTRO.audience}
        </p>
      </section>

      <NasilCalisirVideoSection />

      <section className="py-8 rounded-2xl border px-4 md:px-6 mb-10" style={{ borderColor: "var(--color-border)", background: "var(--color-bg-soft)" }}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          <Shield className="w-4 h-4 inline-block mr-1 align-text-bottom" style={{ color: "var(--color-primary)" }} />
          <strong style={{ color: "var(--color-text)" }}>Referans teminat: </strong>
          Kazanan taraf için bid bond referansı {formatBidBondPercent()}; bakiye tamamlama penceresi {FEES.refundWindowDays} gün —{" "}
          <Link to="/hizmet-bedelleri" className="underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
            hizmet bedelleri
          </Link>
          .
        </p>
      </section>
      <section className="card-warm mb-10">
        <h2 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
          Şeffaflık panosu
        </h2>
        <ul className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <li>• Teminat oranı referansı: {formatBidBondPercent()} · Komisyon hedefi: %2 (+KDV).</li>
          <li>• Anti-sniping kuralı: son {ANTI_SNIPING_THRESHOLD_SECONDS} saniyede geçerli teklifte süre {ANTI_SNIPING_EXTEND_SECONDS} saniye uzar.</li>
          <li>• Nihai yasal metin ve oranlar, ilan koşulları + avukat onayı ile kesinleşir.</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/komisyon-hesaplayici" className="btn-primary inline-flex items-center gap-2">
            Ücret hesaplayıcı
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/ihale-kosullari"
            className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            Kural setini aç
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl md:text-2xl font-bold mb-2 text-center" style={{ color: "var(--color-text)" }}>
          Dört genel adım
        </h2>
        <p className="text-sm text-center max-w-2xl mx-auto mb-8" style={{ color: "var(--color-text-muted)" }}>
          Her adımın detay sayfasında kullanıcı yolculuğu, platform tarafı, riskler ve ilgili linkler yer alır.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {NASIL_CALISIR_STEPS.map((step) => (
            <Link
              key={step.slug}
              to={`/how-it-works/adim/${step.slug}`}
              className="card-warm block no-underline hover:border-blue-500/40 transition-colors"
              style={{ color: "var(--color-text)" }}
            >
              <span className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>
                Adım {step.stepNum}
              </span>
              <h3 className="font-bold mt-1">{step.title}</h3>
              <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
                {step.tagline}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-medium mt-3" style={{ color: "var(--color-primary)" }}>
                Detaylı rehber <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
          {NASIL_CALISIR_PRENSIPLER.title}
        </h2>
        <p className="text-sm mb-6 max-w-3xl" style={{ color: "var(--color-text-muted)" }}>
          {NASIL_CALISIR_PRENSIPLER.lead}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {NASIL_CALISIR_PRENSIPLER.items.map((item) => (
            <article key={item.title} className="rounded-xl border p-4" style={{ borderColor: "var(--color-border)" }}>
              <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--color-text)" }}>
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-12 card-warm">
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
          {NASIL_CALISIR_ARCHITECTURE.title}
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
          {NASIL_CALISIR_ARCHITECTURE.flowSummary}
        </p>
        <div className="space-y-4">
          {NASIL_CALISIR_ARCHITECTURE.layers.map((layer) => (
            <div key={layer.name} className="border-l-2 pl-4" style={{ borderColor: "var(--color-primary)" }}>
              <h3 className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                {layer.name}
              </h3>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {layer.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-center" style={{ color: "var(--color-text)" }}>
          Beş yolculuk, her biri dört adım
        </h2>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {NASIL_CALISIR_JOURNEYS.map((y) => {
            const active = aktifYol === y.slug;
            return (
              <button
                key={y.slug}
                type="button"
                onClick={() => setYol(y.slug)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-transform"
                style={{
                  borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                  background: active ? "rgba(37,99,235,0.12)" : "var(--color-bg-card)",
                  color: "var(--color-text)",
                }}
              >
                {y.baslik}
              </button>
            );
          })}
        </div>

        <div className="card-warm mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
            <JourneyIcon icon={aktifJourney.icon} />
            <div className="flex-1">
              <h3 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
                {aktifJourney.baslik}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {aktifJourney.ozet}
              </p>
              <Link
                to={`/how-it-works/yol/${aktifJourney.slug}`}
                className="inline-flex items-center gap-1 text-sm font-semibold mt-4"
                style={{ color: "var(--color-primary)" }}
              >
                Tam yolculuk rehberi
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {aktifJourney.adimlar.map((adim, i) => (
              <li key={adim.baslik} className="flex gap-4 rounded-xl border p-4" style={{ borderColor: "var(--color-border)" }}>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm text-white"
                  style={{ background: "var(--color-primary)" }}
                >
                  {i + 1}
                </div>
                <div>
                  <span className="font-semibold block mb-1" style={{ color: "var(--color-text)" }}>
                    {adim.baslik}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {adim.metin}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mb-12 grid gap-6 lg:grid-cols-2">
        <div className="card-warm">
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
            {NASIL_CALISIR_BELGELER.title}
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
            {NASIL_CALISIR_BELGELER.lead}
          </p>
          <div className="space-y-4">
            {NASIL_CALISIR_BELGELER.categories.map((cat) => (
              <div key={cat.title}>
                <Link to={cat.path} className="font-semibold text-sm hover:underline" style={{ color: "var(--color-primary)" }}>
                  {cat.title}
                </Link>
                <ul className="list-disc pl-5 mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {cat.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link to="/evraklar" className="inline-flex items-center gap-1 text-sm font-medium mt-4" style={{ color: "var(--color-primary)" }}>
            Tam evrak rehberi <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="card-warm">
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
            {NASIL_CALISIR_SOZLESMELER.title}
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
            {NASIL_CALISIR_SOZLESMELER.lead}
          </p>
          <ul className="space-y-2">
            {NASIL_CALISIR_SOZLESMELER.links.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-10 mb-8">
        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "var(--color-text)" }}>
          Mini SSS
        </h2>
        <div className="max-w-3xl mx-auto space-y-2">
          {MINI_SSS.map((row) => (
            <details key={row.soru} className="group card-warm overflow-hidden">
              <summary
                className="cursor-pointer px-5 py-4 text-sm font-medium list-none flex justify-between gap-4 items-center"
                style={{ color: "var(--color-text)" }}
              >
                {row.soru}
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-open:rotate-90" style={{ color: "var(--color-text-muted)" }} />
              </summary>
              <div className="px-5 pb-4 text-sm leading-relaxed border-t" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
                {row.cevap}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="py-12 flex flex-wrap gap-4 justify-center border-t" style={{ borderColor: "var(--color-border)" }}>
        <Link to="/ihaleler" className="btn-primary inline-flex gap-2">
          İhale listesi
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/sss"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl border font-semibold"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          Tüm SSS
        </Link>
        <Link to="/yasal-cerceve" className="text-sm font-medium underline-offset-4 hover:underline" style={{ color: "var(--color-primary)" }}>
          Yasal çerçeve
        </Link>
      </section>
    </PageShell>
  );
}
