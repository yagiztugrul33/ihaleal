import { Link } from "react-router-dom";

const features = [
  {
    title: "Multi-Tenant Portföy",
    desc: "Tüm ofislerinizi tek panelden yönetin. Her ofis kendi ilanlarını, ekibini ve performansını görür.",
    icon: "🏢",
  },
  {
    title: "Rol Bazlı Yetki",
    desc: "Owner, Admin, Manager, Agent, Viewer rolleri. Her kullanıcı sadece görmesi gerekeni görür.",
    icon: "🔐",
  },
  {
    title: "Toplu İlan Yükleme",
    desc: "CSV veya Excel ile yüzlerce ilanı saniyede yükleyin. AI sanity check ve duplicate kontrolü dahil.",
    icon: "📤",
  },
  {
    title: "AI Destekli Fiyat",
    desc: "Türkiye gayrimenkul verisi üzerinde eğitilmiş model. Piyasa karşılaştırması, güven aralığı.",
    icon: "🧠",
  },
  {
    title: "Detaylı Analytics",
    desc: "İlan başına görüntülenme, lead, dönüşüm. Ofis bazlı performans, ajan bazlı leaderboard.",
    icon: "📊",
  },
  {
    title: "Webhook & REST API",
    desc: "Mevcut CRM'inize entegre edin. Yeni ilan, yeni teklif, KYC durumu — anlık webhook bildirimi.",
    icon: "🔌",
  },
  {
    title: "Komisyon Paylaşımı",
    desc: "Çok ofisli yapılarda otomatik komisyon split. Şeffaf, denetlenebilir, denkleştirilebilir.",
    icon: "💰",
  },
  {
    title: "KYC ve Doğrulama",
    desc: "Mernis, Findeks, tapu doğrulama. Doğrulanmış ilanlar daha hızlı satılır.",
    icon: "✓",
  },
];

const plans = [
  {
    name: "Free",
    price: "₺0",
    suited: "Bireysel emlakçılar",
    features: ["5 ilan/ay", "Temel AI fiyat", "Email destek"],
    highlighted: false,
  },
  {
    name: "Agency",
    price: "₺2.490",
    suited: "Boutique ofisler (1-10 kişi)",
    features: ["100 ilan/ay", "5 ekip üyesi", "Bulk upload", "Öncelikli destek", "AI quota 500/ay"],
    highlighted: false,
  },
  {
    name: "GYO",
    price: "₺7.490",
    suited: "GYO'lar ve gruplar (10-50 kişi)",
    features: ["Sınırsız ilan", "25 ekip üyesi", "API erişimi", "Webhook", "AI quota 2000/ay", "Özel hesap yöneticisi"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Özel",
    suited: "RE/MAX, büyük gruplar (50+)",
    features: ["Sınırsız her şey", "Sınırsız ekip", "Özel SLA", "White-label opsiyonu", "Kurumsal sözleşme"],
    highlighted: false,
  },
];

export default function Corporate() {
  return (
    <div className="min-h-screen kurumsal-page">
      <section className="hero-warm py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="badge-corp">İhaleal Kurumsal</span>
          </div>

          <h1
            className="text-4xl md:text-6xl font-bold leading-tight tracking-tight"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Emlak ofisleri için
            <br />
            <span style={{ color: "var(--color-primary)" }}>modern operasyon altyapısı.</span>
          </h1>

          <div className="mt-6 max-w-3xl mx-auto space-y-4 text-left md:text-center">
            <p className="text-base md:text-lg leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              İhaleal Kurumsal; portföy yönetimi, ekip koordinasyonu ve teklif süreçlerini tek bir operasyon katmanında toplar.
              Aynı panelde ilan yaşam döngüsü, AI fiyat sinyali, evrak rotası ve müşteri iletişim adımlarını birlikte yönetebilirsiniz.
            </p>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Çözüm özellikle çok ofisli yapılar, GYO ekipleri, franchise ağları ve büyüyen emlak operasyonları için tasarlanır.
              Rol bazlı yetkilerle her ekip üyesi yalnızca kendi sorumluluğundaki akışı görür; yöneticiler ise tek bakışta performans
              ve risk durumunu izler.
            </p>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Amaç yalnızca ilan yayınlamak değil; tekliften sözleşmeye uzanan süreci ölçülebilir, denetlenebilir ve tekrar üretilebilir
              hale getirmektir. Böylece ekip büyüdükçe operasyon kalitesi korunur, müşteriye verilen hizmet standardı düşmez.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/kurumsal/iletisim" className="btn-primary">
              Kurumsal Görüşme Talep Et
            </Link>
            <a href="#planlar" className="btn-ghost">
              Planları İncele
            </a>
          </div>

          <div className="mt-16 pt-12" style={{ borderTop: "1px solid var(--color-border)" }}>
            <p
              className="text-xs uppercase tracking-widest mb-6"
              style={{ color: "var(--color-text-light)" }}
            >
              Görüşme yürütülen kurumsal profiller
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-70">
              <span className="text-lg md:text-xl font-semibold" style={{ color: "var(--color-text-muted)" }}>RE/MAX</span>
              <span className="text-lg md:text-xl font-semibold" style={{ color: "var(--color-text-muted)" }}>Akfen GYO</span>
              <span className="text-lg md:text-xl font-semibold" style={{ color: "var(--color-text-muted)" }}>Tahincioğlu</span>
              <span className="text-lg md:text-xl font-semibold" style={{ color: "var(--color-text-muted)" }}>Nef</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="card-warm space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--color-text)" }}>
              Kurumsal model nasıl çalışır?
            </h2>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              İlk adımda mevcut operasyonunuz birlikte haritalanır: portföy girişi, müşteri aday yönetimi, teklif toplama, hukuki
              kontrol ve kapanış süreçleri tek tek çıkarılır. Sonrasında ihaleal içinde rol bazlı erişim, ekip hiyerarşisi ve ilan
              akış şablonları tanımlanır. Böylece her ofis aynı standardı kullanırken, her bölge kendi çalışma ritmine göre
              uyarlanmış bir panelle çalışır.
            </p>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              İkinci aşama performans ve kontrol katmanıdır. Hangi ilan daha hızlı dönüşüyor, hangi danışman hangi segmentte daha
              iyi sonuç alıyor, tekliften satışa geçiş nerede yavaşlıyor gibi sorular tek panelde izlenir. Kurumlar yalnızca "kaç ilan
              yayınladık?" sorusuna değil, "hangi ilanlar gerçekten kapanışa gidiyor?" sorusuna da net cevap alır.
            </p>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Üçüncü aşama entegrasyon ve büyümedir. API/webhook katmanı sayesinde mevcut CRM, muhasebe veya çağrı merkezi
              sistemleriyle veri akışı kurulabilir. Amaç tek bir yazılımı dayatmak değil; var olan kurumsal altyapıya uyumlu,
              gerektiğinde ölçeklenebilen bir çekirdek operasyon platformu sunmaktır.
            </p>
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
              Sadece bir ilan sitesi değil. Emlak operasyonunuzun çekirdek altyapısı.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="card-warm">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: "var(--color-bg-soft)" }}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
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
              Ekibinizin büyüklüğüne uygun esnek planlar. Her zaman değiştirebilirsiniz.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => (
              <div
                key={p.name}
                className="card-warm relative"
                style={{
                  background: p.highlighted ? "var(--color-primary)" : "var(--color-bg-card)",
                  color: p.highlighted ? "var(--color-text-on-dark)" : "inherit",
                  borderColor: p.highlighted ? "var(--color-primary)" : "var(--color-border)",
                }}
              >
                {p.highlighted && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full"
                    style={{ background: "var(--color-accent)", color: "white" }}
                  >
                    EN POPÜLER
                  </div>
                )}
                <div
                  className="text-xs uppercase tracking-widest mb-2"
                  style={{ color: p.highlighted ? "rgba(250,248,241,0.7)" : "var(--color-text-muted)" }}
                >
                  {p.name}
                </div>
                <div className="text-4xl font-bold mb-1">
                  {p.price}
                  <span
                    className="text-base font-normal ml-1"
                    style={{ color: p.highlighted ? "rgba(250,248,241,0.7)" : "var(--color-text-muted)" }}
                  >
                    /ay
                  </span>
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
                  style={
                    p.highlighted
                      ? { background: "var(--color-accent)", color: "white" }
                      : {}
                  }
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
            Kurumsal keşif görüşmesi planlayalım.
          </h2>
          <p
            className="mb-10 text-lg max-w-2xl mx-auto"
            style={{ color: "rgba(250,248,241,0.85)" }}
          >
            GYO, franchise veya çok şubeli emlak operasyonu yönetiyorsanız; ekibimiz mevcut süreçlerinize göre
            uyarlanmış bir kullanım senaryosu hazırlar. 30 dakikalık toplantıda ihtiyaç, risk ve entegrasyon planı netleşir.
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
    </div>
  );
}
