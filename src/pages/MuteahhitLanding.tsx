import { Link } from "react-router-dom";
import { Building, Hammer, HardHat, Landmark, Ruler, Truck } from "lucide-react";

const PROJECTS = [
  { title: "Konut Kule", city: "Kadikoy", type: "Konut", units: "124 daire", status: "Ihale", icon: Building },
  { title: "Ticari Plaza", city: "Ankara", type: "Ticari", units: "18.400 m2", status: "Teklif", icon: Landmark },
  { title: "Villa Sitesi", city: "Bodrum", type: "Luks konut", units: "32 villa", status: "On yeterlilik", icon: Hammer },
  { title: "Loft Donusum", city: "Izmir", type: "Donusum", units: "56 unite", status: "Yuklenici", icon: Ruler },
  { title: "Depo Lojistik", city: "Kocaeli", type: "Endustriyel", units: "12.000 m2", status: "Kapali teklif", icon: Truck },
  { title: "Ogrenci Yurdu", city: "Eskisehir", type: "Egitim", units: "420 yatak", status: "Planlama", icon: HardHat },
];

export default function MuteahhitLanding() {
  return (
    <div className="min-h-screen kurumsal-page">
      <section className="hero-warm py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 text-center relative z-10">
          <span className="badge-corp mb-6 inline-block">İhaleal Müteahhit</span>
          <h1
            className="text-4xl md:text-6xl font-bold leading-tight tracking-tight"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Proje ihalelerinizi
            <br />
            <span style={{ color: "var(--color-primary)" }}>şeffaf ve hızlı yönetin</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Yüklenici seçimi, kapalı teklif, kat karşılığı senaryoları ve proje panosu.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/iletisim" className="btn-primary">
              Demo Formu
            </Link>
            <Link to="/muteahhit/panel" className="btn-ghost">
              Proje Paneli
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 border-y border-[var(--color-border)]" style={{ background: "rgba(15,23,42,0.4)" }}>
        <div className="mx-auto max-w-5xl px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--color-text)" }}>
              Kat karşılığı (KKA) modülü
            </h2>
            <p className="mt-2 text-sm md:text-base" style={{ color: "var(--color-text-muted)" }}>
              Arsa sahibi–müteahhit paylaşım senaryolarını modelleyin.
            </p>
          </div>
          <Link to="/kat-karsiligi" className="btn-primary shrink-0">
            KKA Studio
          </Link>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <span className="badge-corp">Aktif projeler</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4" style={{ color: "var(--color-text)" }}>
              Örnek proje kartları
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((p) => {
              const Icon = p.icon;
              return (
                <article
                  key={p.title}
                  className="card-warm transition-all duration-300 hover:-translate-y-2 hover:border-[rgba(96,165,250,0.35)]"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "var(--color-bg-soft)", color: "var(--color-primary)" }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: "var(--color-text)" }}>
                        {p.title} - {p.city}
                      </h3>
                      <p className="text-xs mt-1 uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                        {p.type} | {p.units}
                      </p>
                      <span
                        className="inline-block mt-3 text-xs font-medium px-2 py-1 rounded-full"
                        style={{ background: "var(--color-bg-soft)", color: "var(--color-primary)" }}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-2xl overflow-hidden border border-[var(--color-border)]">
            <video className="w-full aspect-video bg-black object-cover" controls playsInline preload="metadata">
              <source src="/videos/reels-07.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ background: "var(--gradient-cta)" }}>
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4" style={{ color: "var(--color-text-on-dark)" }}>
            Projeniz için özel demo
          </h2>
          <p className="mb-8" style={{ color: "rgba(250,248,241,0.85)" }}>
            Teknik ekibimiz proje tipinize göre ihale akışını birlikte kurgulasın.
          </p>
          <Link to="/iletisim" className="btn-accent inline-block">
            İletişim formu →
          </Link>
        </div>
      </section>
    </div>
  );
}
