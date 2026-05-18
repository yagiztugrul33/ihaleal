import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EMLAKCI_FEATURES, EMLAKCI_PLANS, type EmlakciFeature } from "@/data/emlakciFeatures";

export default function EmlakciLanding() {
  const [selected, setSelected] = useState<EmlakciFeature | null>(null);

  return (
    <div className="min-h-screen kurumsal-page">
      <section className="hero-warm py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 text-center relative z-10">
          <span className="badge-corp mb-6 inline-block">İhaleal Emlakçı</span>
          <h1
            className="text-4xl md:text-6xl font-bold leading-tight tracking-tight"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Emlak ofisleri için
            <br />
            <span style={{ color: "var(--color-primary)" }}>modern operasyon altyapısı</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Portföy yönetimi, AI destekli fiyatlama, çok kullanıcılı erişim ve şeffaf ihale modülü.
            RE/MAX, GYO ve büyük emlak grupları için tasarlandı.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/kurumsal/iletisim" className="btn-primary">
              Demo Talep Et
            </Link>
            <Link to="/emlakci/panel" className="btn-ghost">
              Panele Git
            </Link>
            <a href="#planlar" className="btn-ghost">
              Planları İncele
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24" style={{ background: "rgba(15, 23, 42, 0.55)" }}>
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <span className="badge-corp">Özellikler</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4" style={{ color: "var(--color-text)" }}>
              Kurumsal Özellikler
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg" style={{ color: "var(--color-text-muted)" }}>
              Sadece bir ilan sitesi değil; emlak operasyonunuzun çekirdek altyapısı.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {EMLAKCI_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.slug}
                  type="button"
                  onClick={() => setSelected(f)}
                  className="card-warm text-left transition-all duration-300 hover:-translate-y-2 hover:border-[rgba(96,165,250,0.45)] hover:shadow-[0_12px_40px_rgba(37,99,235,0.22)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "var(--color-bg-soft)", color: "var(--color-primary)" }}
                  >
                    <Icon className="w-6 h-6" aria-hidden />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {f.shortDesc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-10">
            <span className="badge-corp">Tanıtım</span>
            <h2 className="text-2xl md:text-4xl font-bold mt-4" style={{ color: "var(--color-text)" }}>
              Platformu canlı izleyin
            </h2>
          </div>
          <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-2xl">
            <video
              className="w-full aspect-video bg-black object-cover"
              controls
              playsInline
              preload="metadata"
              poster="/og-image.png"
            >
              <source src="/videos/reels-09.mp4" type="video/mp4" />
              Tarayıcınız video oynatmayı desteklemiyor.
            </video>
          </div>
        </div>
      </section>

      <section id="planlar" className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <span className="badge-corp">Fiyatlandırma</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4" style={{ color: "var(--color-text)" }}>
              Size Uygun Plan
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg" style={{ color: "var(--color-text-muted)" }}>
              Ekibinizin büyüklüğüne uygun esnek planlar. İstediğiniz zaman yükseltebilirsiniz.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {EMLAKCI_PLANS.map((p) => (
              <div
                key={p.name}
                className="card-warm relative"
                style={{
                  background: p.highlighted ? "var(--color-primary)" : "var(--color-bg-card)",
                  color: p.highlighted ? "var(--color-text-on-dark)" : "inherit",
                  borderColor: p.highlighted ? "var(--color-primary)" : "var(--color-border)",
                }}
              >
                {p.highlighted ? (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full"
                    style={{ background: "var(--color-accent)", color: "white" }}
                  >
                    EN POPÜLER
                  </div>
                ) : null}
                <div
                  className="text-xs uppercase tracking-widest mb-2"
                  style={{ color: p.highlighted ? "rgba(250,248,241,0.7)" : "var(--color-text-muted)" }}
                >
                  {p.name}
                </div>
                <div className="text-4xl font-bold mb-1">
                  {p.price}
                  {p.price !== "Özel" ? (
                    <span
                      className="text-base font-normal ml-1"
                      style={{ color: p.highlighted ? "rgba(250,248,241,0.7)" : "var(--color-text-muted)" }}
                    >
                      /ay
                    </span>
                  ) : null}
                </div>
                <div
                  className="text-sm mb-6"
                  style={{ color: p.highlighted ? "rgba(250,248,241,0.7)" : "var(--color-text-muted)" }}
                >
                  {p.suited}
                </div>
                <ul className="space-y-3 mb-6">
                  {p.features.map((ft) => (
                    <li key={ft} className="flex items-start gap-2 text-sm">
                      <span style={{ color: p.highlighted ? "var(--color-accent-light)" : "var(--color-success)" }}>
                        ✓
                      </span>
                      {ft}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/kurumsal/iletisim"
                  className={p.highlighted ? "btn-accent block text-center" : "btn-primary block text-center"}
                >
                  {p.name === "Enterprise" ? "İletişime Geç" : "Başla"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24" style={{ background: "var(--gradient-cta)" }}>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: "var(--color-text-on-dark)" }}>
            Demo görüşmesi planlayalım
          </h2>
          <p className="mb-10 text-lg max-w-2xl mx-auto" style={{ color: "rgba(250,248,241,0.85)" }}>
            RE/MAX, GYO veya büyük emlak grubu yöneticisiyseniz, ekibimiz size özel 30 dakikalık bir demo hazırlasın.
          </p>
          <Link
            to="/kurumsal/iletisim"
            className="inline-block px-8 py-4 font-semibold rounded-lg text-base transition-all hover:scale-105"
            style={{ background: "var(--color-accent)", color: "white" }}
          >
            Görüşme Talep Et →
          </Link>
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        {selected ? (
          <DialogContent className="max-w-lg border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <DialogHeader>
              <DialogTitle style={{ color: "var(--color-text)" }}>{selected.title}</DialogTitle>
              <DialogDescription>{selected.detail}</DialogDescription>
            </DialogHeader>
            <ul className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
              {selected.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span style={{ color: "var(--color-success)" }}>✓</span>
                  {b}
                </li>
              ))}
            </ul>
            <DialogFooter className="gap-2 sm:gap-0">
              <Link
                to={`/emlakci/ozellikler/${selected.slug}`}
                className="btn-ghost text-sm"
                onClick={() => setSelected(null)}
              >
                Detaylı sayfa
              </Link>
              <Link to="/kurumsal/iletisim" className="btn-primary text-sm" onClick={() => setSelected(null)}>
                Demo talep et
              </Link>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
