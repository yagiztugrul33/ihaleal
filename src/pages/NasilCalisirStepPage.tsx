import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "@/components/marketing/PageShell";
import { NasilCalisirBackNav, RelatedLinksBlock } from "@/components/nasilCalisir/NasilCalisirShared";
import { ROUTES } from "@/constants/routes";
import { getStepBySlug, isStepSlug, NASIL_CALISIR_STEPS } from "@/data/nasilCalisirContent";
import { useEnsureLocale } from "@/hooks/useEnsureLocale";

export default function NasilCalisirStepPage() {
  useEnsureLocale("tr");

  const { slug } = useParams<{ slug: string }>();
  if (!isStepSlug(slug ?? null)) {
    return <Navigate to={ROUTES.HOW_IT_WORKS} replace />;
  }

  const step = getStepBySlug(slug);
  if (!step) {
    return <Navigate to={ROUTES.HOW_IT_WORKS} replace />;
  }

  const prev = NASIL_CALISIR_STEPS.find((s) => s.stepNum === step.stepNum - 1);
  const next = NASIL_CALISIR_STEPS.find((s) => s.stepNum === step.stepNum + 1);

  return (
    <PageShell
      badge={`Adım ${step.stepNum} / 4`}
      title={step.title}
      subtitle={step.tagline}
    >
      <NasilCalisirBackNav />

      <p className="text-sm leading-relaxed mb-8 max-w-3xl" style={{ color: "var(--color-text-muted)" }}>
        {step.intro}
      </p>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <section className="card-warm">
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text)" }}>
            Sizin yolculuğunuz
          </h2>
          {step.userJourney.map((block) => (
            <div key={block.title} className="mb-5 last:mb-0">
              <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--color-text)" }}>
                {block.title}
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                {block.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="card-warm">
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text)" }}>
            Platform tarafı
          </h2>
          {step.platformSide.map((block) => (
            <div key={block.title} className="mb-5 last:mb-0">
              <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--color-text)" }}>
                {block.title}
              </h3>
              {block.paragraphs.map((p) => (
                <p key={p} className="text-sm leading-relaxed mb-2 last:mb-0" style={{ color: "var(--color-text-muted)" }}>
                  {p}
                </p>
              ))}
            </div>
          ))}
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <section className="rounded-xl border p-5" style={{ borderColor: "var(--color-border)" }}>
          <h3 className="font-bold text-sm mb-3" style={{ color: "var(--color-text)" }}>
            Veri ve güven
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {step.dataAndTrust.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border p-5" style={{ borderColor: "var(--color-border)" }}>
          <h3 className="font-bold text-sm mb-3" style={{ color: "var(--color-text)" }}>
            Riskler ve sınırlar
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {step.risksAndLimits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <RelatedLinksBlock title="İlgili sayfalar" links={step.relatedRoutes} />

      <section className="mt-8">
        <h3 className="text-lg font-bold mb-4" style={{ color: "var(--color-text)" }}>
          Sık sorulanlar
        </h3>
        <div className="space-y-2 max-w-3xl">
          {step.faq.map((row) => (
            <details key={row.q} className="group card-warm overflow-hidden">
              <summary
                className="cursor-pointer px-5 py-4 text-sm font-medium list-none"
                style={{ color: "var(--color-text)" }}
              >
                {row.q}
              </summary>
              <div className="px-5 pb-4 text-sm leading-relaxed border-t" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
                {row.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      <nav className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-8" style={{ borderColor: "var(--color-border)" }}>
        {prev ? (
          <Link to={`/how-it-works/adim/${prev.slug}`} className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
            ← Adım {prev.stepNum}: {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/how-it-works/adim/${next.slug}`} className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
            Adım {next.stepNum}: {next.title} →
          </Link>
        ) : (
          <Link to="/evraklar" className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
            Belge listesi →
          </Link>
        )}
      </nav>
    </PageShell>
  );
}
