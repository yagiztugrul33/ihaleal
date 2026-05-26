import { Link } from "react-router-dom";
import { Mail, MessageCircle, Phone, BookOpen } from "lucide-react";
import { PageShell } from "@/components/marketing/PageShell";

const CHANNELS = [
  {
    icon: Mail,
    title: "E-posta destek",
    desc: "Kurumsal ve bireysel talepler için 7/24 kayıt; iş günlerinde yanıt.",
    action: "destek@ihaleal.com",
    href: "mailto:destek@ihaleal.com",
  },
  {
    icon: MessageCircle,
    title: "Canlı sohbet",
    desc: "Platform içi asistan ve insan destek hattı (iş saatleri).",
    action: "Sohbeti başlat",
    href: "/iletisim",
  },
  {
    icon: Phone,
    title: "Kurumsal hat",
    desc: "GYO ve müteahhit hesapları için öncelikli telefon hattı.",
    action: "+90 (212) 000 00 00",
    href: "tel:+902120000000",
  },
  {
    icon: BookOpen,
    title: "Bilgi bankası",
    desc: "Sık sorulan sorular, rehberler ve video içerikler.",
    action: "SSS sayfasına git",
    href: "/sss",
  },
];

export default function DestekPage() {
  return (
    <PageShell
      badge="Destek"
      title="Size nasıl yardımcı olabiliriz?"
      subtitle="Teknik sorun, ihale süreci veya kurumsal entegrasyon konularında ekibimiz yanınızda."
    >
      <section className="py-10 grid gap-6 md:grid-cols-2">
        {CHANNELS.map((ch) => {
          const Icon = ch.icon;
          const isExternal = ch.href.startsWith("http") || ch.href.startsWith("mailto") || ch.href.startsWith("tel");
          const inner = (
            <>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--color-bg-soft)", color: "var(--color-primary)" }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
                {ch.title}
              </h2>
              <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
                {ch.desc}
              </p>
              <span className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
                {ch.action} →
              </span>
            </>
          );
          return isExternal ? (
            <a key={ch.title} href={ch.href} className="card-warm block hover:-translate-y-1 transition-transform">
              {inner}
            </a>
          ) : (
            <Link key={ch.title} to={ch.href} className="card-warm block hover:-translate-y-1 transition-transform">
              {inner}
            </Link>
          );
        })}
      </section>
      <section className="pb-10 grid gap-3 md:grid-cols-3">
        <article className="card-warm">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Nedir?</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Destek merkezi; kullanıcı sorularını, operasyon aksiyonlarını ve geri dönüş kayıtlarını tek kanal mimarisinde toplar.
          </p>
        </article>
        <article className="card-warm">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Neden?</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            İhale, belge ve sözleşme gibi kritik adımlarda gecikme maliyetlidir; doğru kanal eşlemesi çözüm süresini düşürür.
          </p>
        </article>
        <article className="card-warm">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Örnek</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            İlan evrakında eksik tespit edildiğinde kullanıcı canlı sohbetten kayıt açar, ekip doküman listesiyle dönüş yapar.
          </p>
        </article>
      </section>
      <section className="pb-10 card-warm">
        <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>İçerik (açıklamalı)</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          Her kanal farklı görev taşır: e-posta yazılı kayıt ve SLA takibi için, sohbet hızlı triage için, kurumsal hat çok paydaşlı
          operasyonlar için, bilgi bankası ise tekrarlayan soruların self-servis çözümü için kullanılır.
        </p>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          Böylece kullanıcı "kime yazmalıyım?" sorusunda zaman kaybetmeden doğru akışa gider ve destek ekibi ölçülebilir kuyruk yönetimi yapar.
        </p>
      </section>
      <section className="pb-10 grid gap-3 md:grid-cols-2">
        <article className="card-warm">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Kime göre</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Bireysel kullanıcı kısa ve net cevap beklerken, kurumsal ekipler kayıt geçmişi, sorumlu atama ve SLA takibi ister.
          </p>
        </article>
        <article className="card-warm" style={{ borderColor: "rgba(245,158,11,.35)", background: "rgba(245,158,11,.10)" }}>
          <h2 className="text-base font-semibold mb-2" style={{ color: "#fde68a" }}>Dürüst sınır</h2>
          <p className="text-sm" style={{ color: "var(--color-text)" }}>
            Destek merkezi operasyon kolaylaştırır; hukuki bağlayıcılık yine sözleşme ve resmi kanallarla oluşur.
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text)" }}>
            CTA: Sorunuzu kanal bazında doğru seçip kayıt açın; takip adımlarını bildirim merkezinden yönetin.
          </p>
        </article>
      </section>
      <section className="pb-10 card-warm">
        <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>CTA</h2>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Sorununuzu doğru kanalla kaydedin, destek durumunu bildirim merkezinden izleyin ve tamamlanan aksiyonu ilgili modül ekranında doğrulayın.
        </p>
      </section>
      <section className="pb-10 card-warm">
        <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Onboarding örneği</h2>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          İlk kez destek alan kullanıcıya kanal seçimi rehberi gösterilir; ikinci temaslarda sistem önceki kayıt geçmişini öneri olarak öne çıkarır.
        </p>
      </section>
      <section className="pb-10 card-warm">
        <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Dürüst sınır</h2>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Destek merkezi operasyon kolaylaştırır; hukuki bağlayıcılık ve resmi bildirim süreçleri yine sözleşme ve mevzuat kanalları üzerinden yürür.
        </p>
      </section>
    </PageShell>
  );
}
