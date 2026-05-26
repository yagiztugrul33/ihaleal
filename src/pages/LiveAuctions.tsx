import { Link } from "react-router-dom";
import { Auctions } from "@/sections/Auctions";
import { isSupabaseConfigured } from "@/lib/supabase";

/** Tam sayfa "Canlı İhaleler" — Navbar ile uyumlu; içerik `Auctions` bölümünü kullanır. */
export default function LiveAuctions() {
  const envReady = isSupabaseConfigured();
  return (
    <div className="min-h-screen pt-16" style={{ background: "var(--color-bg)" }}>
      <section className="hero-warm py-16 md:py-22">
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-6 flex justify-center">
            <span className="badge-corp">Canlı İhaleler</span>
          </div>

          <h1
            className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Gerçek piyasa,
            <br />
            <span style={{ color: "var(--color-primary)" }}>gerçek fiyat.</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg md:text-xl"
            style={{ color: "var(--color-text-muted)" }}
          >
            İhaleal Endeks&apos;i ile teklif yoğunluğunu, bölge fiyat aralığını ve AI destekli
            yatırım sinyallerini tek ekranda görün. Şeffaf canlı artırma, doğrulanmış ilan, anti-snipe
            koruması.
          </p>
          {!envReady ? (
            <p className="mx-auto mt-4 max-w-2xl rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              Supabase ortam değişkenleri eksik: canlı ihale yazma işlemleri yerine demo katalog ve eğitim akışı gösteriliyor.
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="#auctions" className="btn-primary">
              Canlı İhaleleri Gör
            </a>
            <Link to="/nasil-calisir" className="btn-ghost">
              Nasıl Çalışır?
            </Link>
          </div>

          <p
            className="mx-auto mt-12 max-w-xl text-xs leading-relaxed sm:text-sm"
            style={{ color: "var(--color-text-light)" }}
          >
            * Gösterilen veriler bilgilendirme amaçlıdır. Yatırım kararları için profesyonel
            danışmanlık alınız.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="card-warm">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
              1) İlan detayını doğrula
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Galeri, AI değerleme, deprem skoru, emsal ve satıcı geçmişini teklif öncesi kontrol edin.
            </p>
          </article>
          <article className="card-warm">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
              2) Teklif modunu seç
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Açık artırma, kapalı teklif, hemen al veya anında teklif (iBuyer) akışına uygun ilerleyin.
            </p>
          </article>
          <article className="card-warm">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
              3) Maliyeti net gör
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Toplam yükümlülükte komisyon/vergileri ayrı izleyin; karar kalitesini teklif anında yükseltin.
            </p>
          </article>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="card-warm">
            <h3 className="text-base font-semibold text-slate-100">Borsa akış disiplini</h3>
            <p className="mt-2 text-sm text-slate-300">
              İhale açılışı, teklif yükseltme ve kapanış onayı aynı kayıt zincirinde tutulur; geriye dönük denetim mümkün olur.
            </p>
          </article>
          <article className="card-warm">
            <h3 className="text-base font-semibold text-slate-100">Karar çerçevesi</h3>
            <p className="mt-2 text-sm text-slate-300">
              Fiyat rekabeti tek başına kullanılmaz; AI değerleme, deprem riski ve emsal karşılaştırma birlikte okunur.
            </p>
          </article>
          <article className="card-warm">
            <h3 className="text-base font-semibold text-slate-100">Kime göre</h3>
            <p className="mt-2 text-sm text-slate-300">
              Alıcı için fırsat/risk dengesi, satıcı için şeffaf fiyat keşfi, danışman için kayıtlı operasyon akışı sağlar.
            </p>
          </article>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <h3 className="font-semibold text-amber-100">Dürüst sınır</h3>
          <p className="mt-2 text-sm text-slate-200">
            Canlı ihale ekranı karar desteği üretir; resmi sözleşme, ödeme ve tapu adımları uzman/hukuk onayı olmadan tamamlanmış sayılmaz.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="card-warm">
            <h3 className="text-base font-semibold text-slate-100">Sık sorulanlar</h3>
            <p className="mt-2 text-sm text-slate-300">
              "Canlı ihale" etiketi olan kartlarda teklif geçmişi ve süre uzatma kuralı görünür; diğerlerinde katalog modu sürer.
            </p>
          </article>
          <article className="card-warm">
            <h3 className="text-base font-semibold text-slate-100">CTA</h3>
            <p className="mt-2 text-sm text-slate-300">
              İhaleye girmeden önce ilan detayındaki AI değerleme, deprem ve emsal sekmelerini tamamlayın.
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Bu hazırlık, teklif disiplinini ve kapanış başarısını belirgin şekilde artırır.
            </p>
          </article>
        </div>
      </section>

      <Auctions hideIntro layout="page" />
    </div>
  );
}
