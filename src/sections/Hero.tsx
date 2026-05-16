import { Link } from "react-router-dom";

const TRUST_BADGES = [
  "Doğrulanmış İlanlar",
  "AI Fiyat Garantisi",
  "KVKK Uyumlu",
] as const;

export function Hero() {
  return (
    <section
      id="hero"
      className="hero-warm relative flex min-h-[min(88vh,900px)] items-center justify-center overflow-hidden pt-20 pb-16 sm:pb-20"
    >
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-center">
          <span className="badge-corp">Türkiye&apos;nin Şeffaf Gayrimenkul Pazaryeri</span>
        </div>

        <h1
          className="text-4xl font-bold leading-[1.08] tracking-tight text-black sm:text-5xl lg:text-6xl break-words"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Gayrimenkulde doğru fiyat,
          <br />
          açık süreç.
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-800 sm:text-lg md:text-xl font-medium"
        >
          İhaleal; klasik ilan, kapalı teklif ve açık ihale modlarını tek çatı altında toplayan,
          AI destekli fiyatlama ve doğrulanmış satıcı altyapısıyla çalışan Türkiye&apos;nin yeni
          nesil gayrimenkul platformudur.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/ilanlar" className="btn-primary">
            İlanları Keşfet
          </Link>
          <Link to="/kurumsal" className="btn-ghost">
            Kurumsal Çözümler
          </Link>
        </div>

        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t pt-10"
          style={{ borderColor: "var(--color-border)" }}
        >
          {TRUST_BADGES.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 text-sm font-medium sm:text-base"
              style={{ color: "var(--color-text)" }}
            >
              <span style={{ color: "var(--color-success)" }} aria-hidden>
                ✓
              </span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
