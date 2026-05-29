import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, HandCoins, Handshake, Shield, Sparkles, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EMLAKCI_FEATURES, EMLAKCI_PLANS, type EmlakciFeature } from "@/data/emlakciFeatures";
import { REALTOR_B2B_RATE } from "@/lib/fees";

const WHY_US = [
  "İlan, teklif, evrak ve kapanış tek panelde akar; ekipler ekranlar arası kaybolmaz.",
  "AI destekli değerleme ve deprem/konum katmanlarıyla müşteri sunumu daha ikna edici hale gelir.",
  "İşlem bazlı ortaklık modeli ile gelir, gerçek kapanışa bağlı çalışır; paket satışıyla şişirilmez.",
] as const;

const FLOW = [
  { title: "1) Portföyü hazırla", text: "Evrak, fiyat bandı, risk notu ve ilan stratejisini panelde tek seferde kur." },
  { title: "2) Teklifi yönet", text: "Canlı teklif akışını izle, müşteri iletişimini kayıtlı ilerlet." },
  { title: "3) Kapanışı hızlandır", text: "Kazanan adımında escrow, KYC ve devir hazırlığını senkron yürüt." },
] as const;

const FAQ = [
  {
    q: "Ortaklık modelinde sabit paket ücreti var mı?",
    a: "Hayır. Model işlem bazlıdır; gelir gerçek kapanış üzerinden hesaplanır.",
  },
  {
    q: "B2B pay oranı nasıl çalışıyor?",
    a: `Demo modelde işlem tutarı üzerinden yaklaşık %${(REALTOR_B2B_RATE * 100).toFixed(0)} B2B pay kuralı örneklenir; nihai oran sözleşmeyle kesinleşir.`,
  },
  {
    q: "Teklif ve sözleşme adımları denetlenebilir mi?",
    a: "Evet, panel akışı kayıtlı ilerler; canlı kullanımda resmi belge ve hukuki onay zorunludur.",
  },
] as const;

export default function EmlakciLanding() {
  const [selected, setSelected] = useState<EmlakciFeature | null>(null);

  return (
    <div className="min-h-screen kurumsal-page">
      <section className="hero-warm py-20 md:py-28">
        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <span className="badge-corp mb-6 inline-block">Emlakçı Operasyon Merkezi</span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl" style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}>
            Emlak ofisleri için
            <br />
            <span style={{ color: "var(--color-primary)" }}>uçtan uca işlem motoru</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed md:text-xl" style={{ color: "var(--color-text-muted)" }}>
            Hero’dan kapanışa kadar tek amaç: daha hızlı satış, daha şeffaf süreç, daha yüksek güven. Bu sayfa demo/ön analiz
            içerir; canlı sözleşme adımları yazılı mutabakatla kesinleşir.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/emlakci/panel" className="btn-primary">
              Emlakçı paneline gir
            </Link>
            <Link to="/emlakci-ortaklik" className="btn-ghost">
              Ortaklık modelini aç
            </Link>
            <Link to="/kurumsal/iletisim" className="btn-ghost">
              Demo talep et
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14" style={{ background: "rgba(15, 23, 42, 0.55)" }}>
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--color-text)" }}>
            Neden biz?
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {WHY_US.map((item) => (
              <article key={item} className="card-warm">
                <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-300" />
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {item}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--color-text)" }}>
            Nasıl çalışır?
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {FLOW.map((step) => (
              <article key={step.title} className="card-warm">
                <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14" style={{ background: "rgba(15, 23, 42, 0.45)" }}>
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--color-text)" }}>
            Araç seti
          </h2>
          <p className="mt-3 max-w-3xl text-sm" style={{ color: "var(--color-text-muted)" }}>
            Ofis operasyonunu tek tek modüllerle değil, bağlı bir sistemle çalıştırın. Kartlara tıklayarak detay ekranını açabilirsiniz.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {EMLAKCI_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.slug}
                  type="button"
                  onClick={() => setSelected(f)}
                  className="card-warm text-left transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(96,165,250,0.45)]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--color-bg-soft)", color: "var(--color-primary)" }}>
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="mb-2 text-lg font-bold" style={{ color: "var(--color-text)" }}>
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

      <section className="py-10 border-y border-[var(--color-border)]" style={{ background: "rgba(15, 23, 42, 0.4)" }}>
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold md:text-3xl" style={{ color: "var(--color-text)" }}>
            Bağlı araçlar (tek akış)
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/degerleme" className="btn-ghost text-sm">AI değerleme</Link>
            <Link to="/modul/deprem-risk-haritasi" className="btn-ghost text-sm">Deprem zekası</Link>
            <Link to="/komisyon-hesaplayici" className="btn-ghost text-sm">Komisyon hesaplayıcı</Link>
            <Link to="/ihale-ac" className="btn-ghost text-sm">İhale aç</Link>
          </div>
          <p className="mt-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Bu araçlar panel ve ortaklık modeliyle aynı veri dili üzerinden ilerler; by-pass etmeyen süreç esas alınır.
          </p>
        </div>
      </section>

      <section id="planlar" className="py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--color-text)" }}>
            Kazanç ve komisyon modeli
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <article className="card-warm lg:col-span-2">
              <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <HandCoins className="h-4 w-4" /> Örnek senaryo
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                Kadıköy’de bir portföy için danışman panelde değerleme + risk notu hazırlıyor, ilanı canlı ihaleye alıyor ve teklif akışını
                yönetiyor. Kapanışta ortaklık payı işlem üzerinden hesaplanıyor; vitrin paketi satışıyla değil, gerçek başarıyla gelir oluşuyor.
              </p>
              <ul className="mt-3 space-y-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                <li>• İşlem bazlı ortaklık: yaklaşık %{(REALTOR_B2B_RATE * 100).toFixed(0)} (demo kural).</li>
                <li>• Paket by-pass yok: "liste satışı" değil, kapanış bağlı tahakkuk.</li>
                <li>• Dürüst sınır: vergi/fatura kalemleri sözleşme ve mali müşavirle netleşir.</li>
              </ul>
            </article>
            <article className="card-warm">
              <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                <Handshake className="h-4 w-4" /> Ortaklık ilkesi
              </div>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                By-pass etmeyen model: platform dışı kısa yol yerine kayıtlı işlem akışı teşvik edilir.
              </p>
              <Link to="/emlakci-ortaklik" className="mt-4 inline-flex text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                Detaylı ortaklık sayfası →
              </Link>
            </article>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                <div className="text-xs uppercase tracking-widest mb-2" style={{ color: p.highlighted ? "rgba(250,248,241,0.7)" : "var(--color-text-muted)" }}>
                  {p.name}
                </div>
                <div className="mb-1 text-3xl font-bold">{p.price}</div>
                <div className="mb-4 text-sm" style={{ color: p.highlighted ? "rgba(250,248,241,0.75)" : "var(--color-text-muted)" }}>
                  {p.suited}
                </div>
                <ul className="space-y-2">
                  {p.features.slice(0, 3).map((ft) => (
                    <li key={ft} className="text-xs">
                      • {ft}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14" style={{ background: "rgba(15, 23, 42, 0.55)" }}>
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--color-text)" }}>
            SSS
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {FAQ.map((item) => (
              <article key={item.q} className="card-warm">
                <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-violet-300">
                  <Sparkles className="h-4 w-4" /> {item.q}
                </div>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {item.a}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24" style={{ background: "var(--gradient-cta)" }}>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-5xl" style={{ color: "var(--color-text-on-dark)" }}>
            Emlakçı Faz A paketini canlı görün
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg" style={{ color: "rgba(250,248,241,0.85)" }}>
            Panel + ortaklık + kurumsal araçlar tek akışta hazır. Demo veriler ön analizdir, canlı süreçte resmi kontroller uygulanır.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/emlakci/panel" className="btn-accent">Panele git</Link>
            <Link to="/emlakci-ortaklik" className="btn-ghost">Ortaklık başvurusu</Link>
          </div>
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
              <Link to={`/emlakci/ozellikler/${selected.slug}`} className="btn-ghost text-sm" onClick={() => setSelected(null)}>
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
