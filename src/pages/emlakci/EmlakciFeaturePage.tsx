import { Link, useParams, Navigate } from "react-router-dom";
import { EMLAKCI_FEATURE_MAP, type EmlakciFeatureSlug } from "@/data/emlakciFeatures";

const SLUGS = Object.keys(EMLAKCI_FEATURE_MAP) as EmlakciFeatureSlug[];

function isSlug(s: string | undefined): s is EmlakciFeatureSlug {
  return !!s && SLUGS.includes(s as EmlakciFeatureSlug);
}

export default function EmlakciFeaturePage() {
  const { slug } = useParams<{ slug: string }>();

  if (!isSlug(slug)) {
    return <Navigate to="/emlakci" replace />;
  }

  const feature = EMLAKCI_FEATURE_MAP[slug];
  const Icon = feature.icon;

  return (
    <div className="min-h-screen kurumsal-page pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4">
        <Link to="/emlakci" className="text-sm mb-6 inline-block" style={{ color: "var(--color-primary)" }}>
          ← Emlakçı çözümleri
        </Link>
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
          style={{ background: "var(--color-bg-soft)", color: "var(--color-primary)" }}
        >
          <Icon className="w-7 h-7" aria-hidden />
        </div>
        <h1
          className="text-3xl md:text-5xl font-bold mb-4"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
        >
          {feature.title}
        </h1>
        <p className="text-lg leading-relaxed mb-8" style={{ color: "var(--color-text-muted)" }}>
          {feature.detail}
        </p>
        <ul className="space-y-3 mb-10">
          {feature.bullets.map((b) => (
            <li key={b} className="card-warm flex gap-3 text-sm" style={{ color: "var(--color-text)" }}>
              <span style={{ color: "var(--color-success)" }}>✓</span>
              {b}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-4">
          <Link to="/kurumsal/iletisim" className="btn-primary">
            Demo talep et
          </Link>
          <Link to="/emlakci/panel" className="btn-ghost">
            Kurumsal panele git
          </Link>
        </div>
      </div>
    </div>
  );
}
