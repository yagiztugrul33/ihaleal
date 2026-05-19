import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "@/components/marketing/PageShell";
import { JourneyIcon, NasilCalisirBackNav, RelatedLinksBlock } from "@/components/nasilCalisir/NasilCalisirShared";
import { ROUTES } from "@/constants/routes";
import { getJourneyBySlug, isJourneySlug } from "@/data/nasilCalisirContent";

export default function NasilCalisirJourneyPage() {
  const { slug } = useParams<{ slug: string }>();
  if (!isJourneySlug(slug ?? null)) {
    return <Navigate to={ROUTES.HOW_IT_WORKS} replace />;
  }

  const journey = getJourneyBySlug(slug);
  if (!journey) {
    return <Navigate to={ROUTES.HOW_IT_WORKS} replace />;
  }

  return (
    <PageShell badge="Yolculuk rehberi" title={journey.baslik} subtitle={journey.ozet}>
      <NasilCalisirBackNav />

      <div className="flex flex-col md:flex-row md:items-start gap-4 mb-8">
        <JourneyIcon icon={journey.icon} />
        <div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Bu sayfa <strong style={{ color: "var(--color-text)" }}>{journey.baslik}</strong> rolü için dört adımlık
            uçtan uca akışı detaylandırır. Süreler ve ücretler yapılandırılabilir; hukuki kesinlik ilan şartnamesi ve
            imzalanan sözleşmelerdedir.
          </p>
        </div>
      </div>

      <ol className="space-y-6">
        {journey.adimlar.map((adim, i) => (
          <li key={adim.baslik} className="card-warm">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm text-white"
                style={{ background: "var(--color-primary)" }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
                  {adim.baslik}
                </h2>
                {adim.sure ? (
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                    Tahmini süre: {adim.sure}
                  </p>
                ) : null}
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {adim.metin}
                </p>
              </div>
            </div>

            {adim.yapilacaklar.length > 0 ? (
              <div className="mb-4 pl-14">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                  Yapılacaklar
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {adim.yapilacaklar.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {adim.belgeler.length > 0 ? (
              <div className="pl-14 flex flex-wrap gap-2">
                {adim.belgeler.map((b) => (
                  <Link
                    key={b.path + b.label}
                    to={b.path}
                    className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium no-underline hover:border-blue-500/50"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-primary)" }}
                  >
                    {b.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ol>

      <RelatedLinksBlock title="İlgili sözleşmeler" links={journey.ilgiliSozlesmeler} />
      <RelatedLinksBlock title="İlgili sayfalar" links={journey.ilgiliSayfalar} />

      <div className="mt-10 flex flex-wrap gap-3 justify-center border-t pt-8" style={{ borderColor: "var(--color-border)" }}>
        <Link to={`${ROUTES.HOW_IT_WORKS}?yol=${journey.slug}`} className="btn-primary inline-flex">
          Hub’da görüntüle
        </Link>
        <Link
          to="/evraklar"
          className="inline-flex items-center px-5 py-2.5 rounded-xl border text-sm font-semibold no-underline"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          Belge listesi
        </Link>
      </div>
    </PageShell>
  );
}
