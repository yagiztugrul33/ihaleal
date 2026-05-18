import { Link } from "react-router-dom";
import { PageShell } from "@/components/marketing/PageShell";

const PLANS = [
  {
    name: "Bireysel",
    price: "Ucretsiz",
    desc: "Tek kullanici, temel ihale ve ilan",
    features: ["5 ilan/ay", "Temel analitik", "E-posta destek"],
    highlight: false,
  },
  {
    name: "Profesyonel",
    price: "1.490 TL",
    desc: "Aktif emlak danismanlari",
    features: ["50 ilan/ay", "AI fiyat", "Oncelikli destek", "Kapali teklif"],
    highlight: true,
  },
  {
    name: "Kurumsal",
    price: "Ozel",
    desc: "GYO, muteahhit ve buyuk gruplar",
    features: ["Sinirsiz ilan", "API ve webhook", "Ozel SLA", "Hesap yoneticisi"],
    highlight: false,
  },
];

const COMPARE_ROWS: { feature: string; bireysel: string; pro: string; kurumsal: string }[] = [
  { feature: "Aylik ilan", bireysel: "5", pro: "50", kurumsal: "Sinirsiz" },
  { feature: "Kapali teklif", bireysel: "-", pro: "Evet", kurumsal: "Evet" },
  { feature: "AI fiyat", bireysel: "Temel", pro: "Gelismis", kurumsal: "Gelismis" },
  { feature: "API", bireysel: "-", pro: "-", kurumsal: "Evet" },
  { feature: "Coklu ofis", bireysel: "-", pro: "-", kurumsal: "Evet" },
  { feature: "Destek", bireysel: "E-posta", pro: "Oncelikli", kurumsal: "Ozel SLA" },
];

export default function FiyatlandirmaPage() {
  return (
    <PageShell
      badge="Fiyatlandirma"
      title="Ihtiyaciniza uygun plan"
      subtitle="Bireysel kullanimdan kurumsal entegrasyona kadar esnek secenekler."
    >
      <section className="py-10 grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className="card-warm relative"
            style={{
              borderColor: p.highlight ? "var(--color-primary)" : undefined,
              background: p.highlight ? "rgba(37,99,235,0.12)" : undefined,
            }}
          >
            {p.highlight ? (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-white">
                Populer
              </span>
            ) : null}
            <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
              {p.name}
            </h2>
            <p className="text-3xl font-bold my-2" style={{ color: "var(--color-primary)" }}>
              {p.price}
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
              {p.desc}
            </p>
            <ul className="space-y-2 text-sm mb-6">
              {p.features.map((f) => (
                <li key={f} style={{ color: "var(--color-text-muted)" }}>
                  + {f}
                </li>
              ))}
            </ul>
            <Link to="/kurumsal/iletisim" className="btn-primary block text-center text-sm">
              Basvur
            </Link>
          </div>
        ))}
      </section>

      <section className="py-12 overflow-x-auto">
        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "var(--color-text)" }}>
          Plan karsilastirma
        </h2>
        <table className="w-full min-w-[520px] text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              <th className="text-left py-3 px-2" style={{ color: "var(--color-text-muted)" }}>
                Ozellik
              </th>
              <th className="py-3 px-2" style={{ color: "var(--color-text)" }}>
                Bireysel
              </th>
              <th className="py-3 px-2" style={{ color: "var(--color-text)" }}>
                Profesyonel
              </th>
              <th className="py-3 px-2" style={{ color: "var(--color-text)" }}>
                Kurumsal
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.feature} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td className="py-3 px-2 font-medium" style={{ color: "var(--color-text)" }}>
                  {row.feature}
                </td>
                <td className="py-3 px-2 text-center" style={{ color: "var(--color-text-muted)" }}>
                  {row.bireysel}
                </td>
                <td className="py-3 px-2 text-center" style={{ color: "var(--color-text-muted)" }}>
                  {row.pro}
                </td>
                <td className="py-3 px-2 text-center" style={{ color: "var(--color-text-muted)" }}>
                  {row.kurumsal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageShell>
  );
}
