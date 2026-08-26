import { Link } from "react-router-dom";
import { Building, CheckCircle2, Hammer, HardHat, Landmark, Ruler, Truck } from "lucide-react";

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
            <span style={{ color: "var(--color-text)" }}>şeffaf ve hızlı yönetin</span>
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

      <section className="py-14 md:py-16" style={{ background: "var(--zemin-yumusak)" }}>
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--color-text)" }}>
            Neden müteahhitler bu modeli kullanıyor?
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              "Proje bazlı teklif akışı ile yüklenici seçimleri kayıtlı ve karşılaştırılabilir ilerler.",
              "Kat karşılığı, ihale açma ve panel yönetimi tek sistemde birleşir; operasyon kopmaz.",
              "Dürüst ön analiz ile finansal ve teknik riskler daha erken görünür.",
            ].map((item) => (
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

      <section className="py-12 border-y border-[var(--color-border)]" style={{ background: "var(--zemin-yumusak)" }}>
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

      <section className="py-10 border-b border-[var(--color-border)]" style={{ background: "var(--zemin-yumusak)" }}>
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold md:text-3xl" style={{ color: "var(--color-text)" }}>
            Bağlı araçlar
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/muteahhit/panel" className="btn-ghost text-sm">Proje paneli</Link>
            <Link to="/ihale-ac" className="btn-ghost text-sm">İhale aç</Link>
            <Link to="/kat-karsiligi" className="btn-ghost text-sm">Kat karşılığı merkezi</Link>
            <Link to="/kat-karsiligi/studio" className="btn-ghost text-sm">KKA Studio</Link>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-18">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--color-text)" }}>
            Nasıl çalışır?
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="card-warm">
              <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>1) Proje panelini kur</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                Faz, lot, maliyet ve hakediş adımlarını panelde tanımla.
              </p>
            </article>
            <article className="card-warm">
              <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>2) İhaleyi aç ve yönet</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                Kapalı teklif veya açık ihale modelini seç, teklifleri karşılaştır.
              </p>
            </article>
            <article className="card-warm">
              <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>3) Kapanış ve devir</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                Uyum adımları ve sözleşme kontrolleriyle proje kapanışına geç.
              </p>
            </article>
          </div>
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
                      style={{ background: "var(--color-bg-soft)", color: "var(--color-text)" }}
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
                        style={{ background: "var(--color-bg-soft)", color: "var(--color-text)" }}
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

      <section className="py-14 md:py-18" style={{ background: "var(--zemin-yumusak)" }}>
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--color-text)" }}>
            Örnek senaryo ve SSS
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <article className="card-warm">
              <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>Örnek senaryo</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                Ankara’daki karma proje için müteahhit panelde lot bazlı ihaleyi açıyor, teklifleri karşılaştırıyor ve hakediş
                dilimlerini güvenli biçimde yönetiyor. Kat karşılığı modülüyle arsa sahibine düşen paylar anlık simüle ediliyor.
              </p>
            </article>
            <div className="grid gap-3">
              <article className="card-warm">
                <p className="text-sm font-semibold text-white">KKA zorunlu mu?</p>
                <p className="mt-1 text-xs text-slate-400">Hayır. Proje tipine göre bağımsız ihale akışı da kullanılabilir.</p>
              </article>
              <article className="card-warm">
                <p className="text-sm font-semibold text-white">Finansal hesaplar bağlayıcı mı?</p>
                <p className="mt-1 text-xs text-slate-400">Hayır, demo/ön analizdir. Sözleşme ve uzman onayı ile kesinleşir.</p>
              </article>
              <article className="card-warm">
                <p className="text-sm font-semibold text-white">Hangi CTA ile başlamak gerekir?</p>
                <p className="mt-1 text-xs text-slate-400">Önce proje paneli, sonra ihale açma akışı önerilir.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--color-text)" }}>
            Kazanç / komisyon yaklaşımı
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="card-warm">
              <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>İşlem bazlı tahakkuk</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                Gelir proje ve teslim adımlarına bağlı ilerler; sadece ilan paketi satışıyla gelir yazılmaz.
              </p>
            </article>
            <article className="card-warm">
              <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>By-pass yok</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                Tekliften kapanışa kayıtlı akış korunur; platform dışı kısa yol modeli teşvik edilmez.
              </p>
            </article>
            <article className="card-warm">
              <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>Dürüst sınır</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                Nihai komisyon, vergi ve fatura detayları sözleşme + mali müşavir doğrulamasıyla kesinleşir.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 vurgu-yuzey">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4" style={{ color: "var(--uzerine)" }}>
            Projeniz için özel demo
          </h2>
          <p className="mb-8" style={{ color: "var(--uzerine-ikincil)" }}>
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
