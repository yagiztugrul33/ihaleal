import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Building2,
  Handshake,
  Heart,
  LineChart,
  Newspaper,
  Scale,
  Shield,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { PageShell } from "@/components/marketing/PageShell";

const TIMELINE = [
  {
    year: "2024",
    title: "Fikir ve prototip",
    detail:
      "Gayrimenkul teklif süreçlerini tek çatıda toplayan ilk taslaklar, şeffaflık ve denetlenebilir kayıt ilkeleriyle şekillendi.",
  },
  {
    year: "2025",
    title: "Demo platform",
    detail:
      "İlan, ihale ve kapalı teklif deneyimleri birleştirildi; KYC ve bildirim hatları için teknik altyapı hazırlandı (bilgilendirme modu).",
  },
  {
    year: "2026",
    title: "Dalga 2 içerik ve iş ortaklıkları",
    detail:
      "Kurumsal sayfalar, eğitim içerikleri ve B2B pilot görüşmeleriyle ölçeklenebilir süreç çizgisi netleştiriliyor.",
  },
] as const;

const TEAM = [
  { name: "Elif Kaya", role: "Kurucu Ortak & Ürün", initials: "EK", from: "#2563eb", to: "#06b6d4" },
  { name: "Deniz Arslan", role: "Baş Teknoloji Sorumlusu", initials: "DA", from: "#7c3aed", to: "#ec4899" },
  { name: "Mehmet Çelik", role: "Operasyon ve Uyumluluk", initials: "MÇ", from: "#059669", to: "#10b981" },
  { name: "Selin Yıldırım", role: "Pazarlama ve Büyüme", initials: "SY", from: "#ea580c", to: "#f59e0b" },
  { name: "Burak Şahin", role: "Veri ve Yapay Zeka", initials: "BŞ", from: "#0ea5e9", to: "#6366f1" },
  { name: "Ayşe Demir", role: "Müşteri Başarısı", initials: "AD", from: "#be123c", to: "#f472b6" },
] as const;

const VALUES = [
  {
    icon: Shield,
    title: "Şeffaflık",
    text: "İlan koşulları, referans ücretler ve süreler mümkün olduğunca açık; nihai hukuki metinler sözleşmede kesinleşir.",
  },
  { icon: Scale, title: "Adalet", text: "Teklif kuralları her kullanıcı için aynı çerçevede uygulanır; öncelik satıcı onayı ve ilan şartnamesiyle tanımlanır." },
  { icon: Handshake, title: "Güven", text: "KYC ve evrak rotaları üretim ortamında sıkılaştırılır; demo modunda işlem ve ödeme gerçekleştirilmez." },
  { icon: Heart, title: "İnsan odaklı", text: "Karmaşık süreçleri sade akışlara böler; emlakçı ve alıcı geri bildirimiyle iyileştiririz." },
] as const;

const PRESS = [
  "Proptech Raporu",
  "Gayrimenkul Türkiye",
  "StartUp Watch",
  "Teknoloji Sohbetleri",
  "Yatırım Notları",
] as const;

export default function About() {
  return (
    <PageShell
      badge="Kurumsal"
      title="ihaleal kimdir?"
      subtitle="Gayrimenkul ihale ve teklif süreçlerini tek platformda, ölçülebilir ve anlaşılır bir deneyimle birleştirmeyi hedefleyen ekibiz. Aşağıdaki içerikler bilgilendirme amaçlıdır; canlı işlem ve ödeme demo sınırları içindedir."
      cta={{ label: "Bize yazın", to: "/iletisim" }}
    >
      <section className="py-12 grid gap-10 lg:grid-cols-2 items-start">
        <div className="card-warm">
          <div className="flex items-center gap-2 mb-4" style={{ color: "var(--color-primary)" }}>
            <Target className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              Misyon
            </span>
          </div>
          <p
            className="text-2xl md:text-3xl font-bold leading-snug"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            Alıcı ile satıcıyı, net kurallar ve güvenilir veri ile aynı masada buluşturmak.
          </p>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Liste yayınından teklif kapanışına kadar her adımda şeffaf iletişim; emlak profesyonelleri için tekrarlanabilir bir operasyon çizgisi.
          </p>
        </div>
        <div className="card-warm">
          <div className="flex items-center gap-2 mb-4" style={{ color: "var(--color-primary)" }}>
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              Vizyon
            </span>
          </div>
          <p
            className="text-2xl md:text-3xl font-bold leading-snug"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            Türkiye&apos;de gayrimenkul teklif kültürünün dijital referans noktası olmak.
          </p>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Modüler analizler, kurumsal entegrasyonlar ve eğitim içerikleriyle ekosistemin sürdürülebilir büyümesine katkı sağlamak.
          </p>
        </div>
      </section>
      <section className="py-10">
        <div className="card-warm space-y-4">
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            Ne yapıyoruz, kimin için yapıyoruz?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            ihaleal; gayrimenkul teklif ve satış süreçlerini aynı çatı altında toplayan bir ürün yaklaşımı geliştirir. İlan yayınlama,
            alıcı iletişimi, teklif toplama, evrak doğrulama ve kapanış hazırlığı tek bir operasyon zinciri olarak tasarlanır.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Bireysel kullanıcılar için daha anlaşılır bir alım-satım deneyimi, emlak ofisleri ve kurumsal ekipler için ise ölçeklenebilir
            bir çalışma düzeni hedeflenir. Aynı zamanda eğitim sayfaları ve rehber içeriklerle, teknik olmayan kullanıcıların da süreci
            adım adım takip edebilmesi amaçlanır.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Ürün yol haritasında güvenlik, şeffaflık ve operasyon kalitesi birlikte ele alınır: süreç netliği artarken işlem riski düşsün,
            kararlar daha ölçülebilir hale gelsin. Canlı ortama geçen her özellik için hukuki ve teknik doğrulama adımları ayrı ayrı tamamlanır.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="flex items-center gap-2 mb-8">
          <Building2 className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            Yolculuk: 2024 — 2026
          </h2>
        </div>
        <div className="relative">
          <div
            className="absolute left-[11px] md:left-4 top-0 bottom-0 w-px hidden sm:block"
            style={{ background: "var(--color-border)" }}
            aria-hidden
          />
          <ul className="space-y-8">
            {TIMELINE.map((item) => (
              <li key={item.year} className="relative sm:pl-12">
                <span
                  className="hidden sm:flex absolute left-0 top-1.5 w-8 h-8 rounded-full items-center justify-center text-xs font-bold text-white"
                  style={{ background: "var(--color-primary)" }}
                >
                  {item.year.slice(2)}
                </span>
                <div className="card-warm">
                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                      {item.year}
                    </span>
                    <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-12">
        <div className="flex items-center gap-2 mb-8">
          <Users className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            Çekirdek ekip
          </h2>
        </div>
        <p className="max-w-2xl mb-8 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          Ürün, teknoloji ve operasyonu aynı hedefe kilitleyen küçük ama deneyimli bir ekip. Unvanlar ve isimler tanıtım amaçlı temsili örneklerdir.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((m) => (
            <div key={m.name} className="card-warm flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0"
                style={{ background: `linear-gradient(135deg, ${m.from}, ${m.to})` }}
              >
                {m.initials}
              </div>
              <div>
                <div className="font-semibold" style={{ color: "var(--color-text)" }}>
                  {m.name}
                </div>
                <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {m.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="flex items-center gap-2 mb-8">
          <Award className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            Değerlerimiz
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="card-warm">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "var(--color-bg-soft)", color: "var(--color-primary)" }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
                  {v.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {v.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-10">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
          <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
            Basında ve etkinliklerde
          </h2>
        </div>
        <p className="text-sm mb-6 max-w-2xl" style={{ color: "var(--color-text-muted)" }}>
          Yayın adları örnek vitrin şerididir; güncel basın bülteni için iletişime geçebilirsiniz.
        </p>
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {PRESS.map((p) => (
            <span
              key={p}
              className="px-4 py-2 rounded-full text-sm font-medium border"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-muted)",
                background: "var(--color-bg-soft)",
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="flex items-center gap-2 mb-8">
          <LineChart className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            Topluluk ve erişim (demo göstergeleri)
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Rehber okuma (30 gün)", value: "48K+", sub: "oturum", icon: Users },
            { label: "Pilot kurum görüşmesi", value: "24", sub: "B2B oturumu", icon: Building2 },
            { label: "Destek talebi SLA hedefi", value: "4s altı", sub: "iş günü (plan)", icon: Shield },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card-warm text-center">
                <Icon className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--color-primary)" }} />
                <div className="text-3xl font-bold" style={{ color: "var(--color-text)" }}>
                  {s.value}
                </div>
                <div className="text-sm font-semibold mt-1" style={{ color: "var(--color-text)" }}>
                  {s.label}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  {s.sub}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs mt-4 text-center sm:text-left" style={{ color: "var(--color-text-muted)" }}>
          Rakamlar tanıtım amaçlıdır ve gerçek üretim metrikleriyle değişir.
        </p>
      </section>

      <section className="py-10">
        <div className="card-warm space-y-4">
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            Neden ihaleal?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Gayrimenkul tarafında en büyük sorunlardan biri, karar anında bilgilerin dağınık kalmasıdır. İhale koşulu bir yerde, ücret
            kalemleri başka bir yerde, belge beklentileri ise çoğu zaman son anda görünür olur. ihaleal bu dağınıklığı azaltmak için
            teklif sürecini tek bir operasyon diliyle kurgular: hangi adımda ne yapılacağı, hangi evrakın eksik olduğu ve kapanışa
            nasıl gidileceği kullanıcıya net şekilde gösterilir.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Ekip yaklaşımımız "önce anlaşılabilirlik, sonra otomasyon" ilkesine dayanır. Bu nedenle ürün ekranlarında yalnızca sonuç
            değil, sonuca nasıl gidildiği de anlatılır. Komisyon, teminat, anti-sniping, teklif günlüğü ve sözleşme ön koşulları gibi
            kritik başlıklar tek tek görünür hale getirilir. Kullanıcı deneyimi kadar, sürecin denetlenebilir olması da temel hedefimizdir.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Kurumsal tarafta ise sürdürülebilirlik öne çıkar: ofis sayısı arttığında bile kalite düşmeden ilerleyebilen standart bir iş
            akışı kurmak isteriz. Bu yüzden ihaleal, bireysel alıcı-satıcı yolculuğunun yanında emlak ofisleri ve operasyon ekipleri için
            ortak bir çalışma zemini sunar. Kısa vadede verim, orta vadede daha güvenli ve ölçülebilir bir pazar hedeflenir.
          </p>
        </div>
      </section>

      <section className="py-14 flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center border-t" style={{ borderColor: "var(--color-border)" }}>
        <Link to="/ihaleler" className="btn-primary gap-2 inline-flex">
          İhalelere göz at
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/nasil-calisir"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-semibold transition-transform hover:-translate-y-0.5"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          Nasıl çalışır?
        </Link>
        <Link to="/sss" className="text-sm font-medium underline-offset-4 hover:underline" style={{ color: "var(--color-primary)" }}>
          Sık sorulan sorular
        </Link>
      </section>
    </PageShell>
  );
}
