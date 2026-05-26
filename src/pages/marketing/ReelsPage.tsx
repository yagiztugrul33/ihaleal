import { PageShell } from "@/components/marketing/PageShell";

const REEL_COUNT = 10;

export default function ReelsPage() {
  return (
    <PageShell
      badge="Reels"
      title="Platform tanitim videolari"
      subtitle="Dikey kaydirmali kisa videolar ile ozellikleri kesfedin."
      className="!pb-0"
    >
      <section
        className="h-[calc(100vh-12rem)] overflow-y-auto snap-y snap-mandatory rounded-2xl border border-[var(--color-border)]"
        aria-label="Reels galerisi"
      >
        {Array.from({ length: REEL_COUNT }, (_, i) => {
          const num = String(i + 1).padStart(2, "0");
          return (
            <div
              key={num}
              className="snap-start snap-always min-h-full flex items-center justify-center bg-black"
            >
              <video
                className="w-full max-w-md h-full max-h-[85vh] object-contain"
                controls
                playsInline
                preload="metadata"
                poster="/og-image.png"
              >
                <source src={`/videos/reels-${num}.mp4`} type="video/mp4" />
              </video>
            </div>
          );
        })}
      </section>
      <section className="mt-6 grid gap-3 md:grid-cols-3">
        <article className="card-warm">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Nedir?</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Reels alanı, modül değerlerini kısa formatta gösteren hızlı anlatım katmanıdır.
          </p>
        </article>
        <article className="card-warm">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Neden?</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Kullanıcılar uzun doküman öncesi kısa içerikle özellik farkını daha hızlı kavrar.
          </p>
        </article>
        <article className="card-warm">
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Örnek</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Teklif akışı, değerleme sonucu ve risk modülü tek seri içinde kısa videolarla anlatılır.
          </p>
        </article>
      </section>
      <section className="mt-4 card-warm">
        <h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>Kime göre / dürüst sınır / CTA</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          Reels, onboarding kullanıcıları ve hızlı karar isteyen yatırımcılar için ön izleme sağlar. Video içeriği tanıtım amaçlıdır;
          bağlayıcı karar için ilgili modül ve sözleşme sayfaları temel alınmalıdır.
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          CTA: İzlediğiniz video sonrası ilgili modüle geçin, örnek girdilerle kendi senaryonuzu test edin.
        </p>
      </section>
      <section className="mt-4 grid gap-3 md:grid-cols-3">
        <article className="card-warm">
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>İçerik standardı</h3>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Her video aynı çerçevede ilerler: sorun tanımı, çözüm adımı, gerçek kullanım örneği ve dürüst sınır notu.
          </p>
        </article>
        <article className="card-warm">
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Örnek akış</h3>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Kullanıcı Reel içinden değerleme modülüne geçip demo hesaplama yapar, ardından teklif stratejisi için borsa ekranına döner.
          </p>
        </article>
        <article className="card-warm">
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Platform dili</h3>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Video metinleri tüm modüllerde ortak terminolojiyi korur; kullanıcı aynı kavramı farklı sayfalarda aynı anlamla görür.
          </p>
        </article>
      </section>
      <section className="mt-4 card-warm">
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Onboarding ve geri dönüş</h3>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          İlk ziyaretçi reels akışıyla ürün mimarisini hızlıca tanır. Geri dönen kullanıcı ise daha önce izlediği videodan ilgili modüle
          doğrudan geçerek yarım kalan adımı tamamlayabilir.
        </p>
      </section>
      <section className="mt-4 card-warm">
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>İçerik (açıklamalı)</h3>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          Reels akışı sadece görsel tanıtım değildir; her video bir işlem adımını temsil eder. Kullanıcı kısa videoda hangi modülün neyi
          çözdüğünü gördükten sonra ilgili ekrana tek adımda gider.
        </p>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          Özellikle mobil kullanıcılar için uzun rehber yerine kısa, odaklı ve eyleme dönük anlatım daha yüksek dönüş sağlar.
          Bu nedenle video sırası “problem, çözüm, örnek, sonraki adım” formatına göre düzenlenir.
        </p>
      </section>
      <section className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="card-warm">
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Dürüst sınır</h3>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Videolar örnek senaryolar içerir; gerçek işlem kararında resmi evrak, ekspertiz ve sözleşme adımları zorunludur.
          </p>
        </article>
        <article className="card-warm">
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>CTA</h3>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            İzlediğiniz video için “ilgili modüle git” adımını tamamlayın, ardından dashboard üzerinde yarım kalan kartı kapatın.
          </p>
        </article>
      </section>
      <section className="mt-4 card-warm">
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Kime göre</h3>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          İlk kez gelen kullanıcı için hızlı ürün tanıtımı, deneyimli yatırımcı için modüller arası hızlı geçiş noktası sağlar.
          Kurumsal ekipler bu akışı iç eğitim ve süreç hizalama amaçlı kullanabilir.
        </p>
      </section>
      <section className="mt-4 card-warm">
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Hero ve CTA</h3>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Hero mesajı: kısa videoyla doğru modüle en hızlı geçiş. CTA: ilgili modül ekranında örnek senaryoyu çalıştır ve sonucu
          dashboard görevlerine bağla.
        </p>
      </section>
      <section className="mt-4 card-warm">
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>İçerik özeti</h3>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Reels akışı borsa, değerleme, risk, sözleşme ve kullanıcı paneli modüllerinin kısa anlatım köprüsüdür. İzleyen kullanıcı için
          bir sonraki aksiyonun net olması hedeflenir.
        </p>
      </section>
      <section className="mt-4 card-warm">
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Dürüst sınır</h3>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Reels içerikleri demo senaryo anlatımıdır; gerçek işlem kararında resmi kayıt ve uzman onayı gereklidir.
        </p>
      </section>
    </PageShell>
  );
}
