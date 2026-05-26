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
        <section className="card-warm mb-6">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Nedir / neden</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Bu özellik sayfası, emlakçı modülünün tek bir kabiliyetini operasyon diliyle açıklar. Amaç yalnızca özellik göstermek değil,
            danışmanın günlük iş akışında zaman ve risk etkisini görünür yapmaktır.
          </p>
        </section>
        <section className="card-warm mb-6">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Örnek / kime göre</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Tek ofis danışmanı hızlı takip için kullanırken, çok ekipli kurumsal yapı aynı özelliği denetim ve süreç standardı için kullanır.
          </p>
        </section>
        <section className="card-warm mb-6" style={{ borderColor: "rgba(245,158,11,.35)", background: "rgba(245,158,11,.10)" }}>
          <h2 className="text-base font-semibold mb-2" style={{ color: "#fde68a" }}>Dürüst sınır + CTA</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
            Modül karar desteği sunar; hukuki ve finansal bağlayıcılık yine resmi süreçlerle tamamlanır.
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text)" }}>
            CTA: Demo talebi oluşturup bu özelliği canlı panel akışında kendi portföy senaryonuzla test edin.
          </p>
        </section>
        <section className="card-warm mb-6">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>İçerik ve örnek kullanım</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Özellik kartı yalnızca "ne yapar" sorusunu değil, "hangi sırada kullanılmalı" sorusunu da yanıtlar. Örneğin ilan eşleştirme
            özelliği teklif hazırlığından önce çalıştırıldığında dönüşüm oranı artar.
          </p>
        </section>
        <section className="card-warm mb-6">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Onboarding ve geri dönüş akışı</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Yeni danışman için ilk hafta görevleri bu modülden başlatılır; geri dönen kullanıcı yarım kalan görev kartını panelde görerek
            aynı noktadan devam eder.
          </p>
        </section>
        <section className="card-warm mb-6">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Kime göre</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Bu özellik seti tek danışmanlı ofislerden çok şubeli kurumsal yapılara kadar farklı ölçekteki ekipler için tasarlanır.
            Tek kullanıcı senaryosunda hız, kurumsal senaryoda ise izlenebilirlik ve standardizasyon ön plana çıkar.
          </p>
        </section>
        <section className="card-warm mb-6">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Örnek işlem</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Danışman bir portföyü sisteme alır, ilgili özelliği kullanarak eşleşen müşteri havuzunu çıkarır, teklif adımına geçmeden önce
            belge durumunu kontrol eder ve müşteri iletişimini tek akışta tamamlar.
          </p>
        </section>
        <section className="card-warm mb-6">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>İçerik (açıklamalı)</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Özellik metinleri modül bazlı iş adımlarına bölünür: veri toplama, eşleştirme, teklif hazırlığı, takip ve raporlama.
            Bu sayede danışman hangi özelliğin hangi adımda kullanılacağını net biçimde görür.
          </p>
        </section>
        <section className="card-warm mb-6">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>CTA</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Bu özelliği gerçek portföy örneğinizle test edin, sonuç kartlarını panele taşıyın ve ekip içi süreç şablonunu standardize edin.
          </p>
        </section>
        <section className="card-warm mb-6">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Dürüst sınır</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Özellik çıktıları karar desteği sağlar; resmi hukuki ve finansal onay süreçlerinin yerini almaz. Bağlayıcı işlem adımlarında
            sözleşme ve evrak doğrulaması ayrı kontrollerle tamamlanmalıdır.
          </p>
        </section>
        <section className="card-warm mb-6">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Hero / Nedir-Neden özeti</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Bu sayfa, emlakçı panelindeki her özelliğin neden var olduğunu ve günlük iş akışında nasıl değer ürettiğini görünür hale getirir.
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Hero mesajı, danışmana “hangi adımı neden yapıyorum?” sorusunun cevabını net verir ve aksiyon kaybını azaltır.
          </p>
        </section>
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
