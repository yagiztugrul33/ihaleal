import { PageShell } from "@/components/marketing/PageShell";

const PRESS = [
  {
    date: "15 Mart 2026",
    outlet: "Gayrimenkul Dünyası",
    title: "İhaleal, kapalı teklif modülünü kurumsal müşterilere açtı",
    excerpt: "GYO ve müteahhit segmentinde şeffaf ihale talebi artıyor.",
  },
  {
    date: "2 Şubat 2026",
    outlet: "Teknoloji Haberleri",
    title: "Türkiye verisi ile AI destekli fiyatlama",
    excerpt: "Platform, bölgesel endeks ve son işlem verilerini birleştiriyor.",
  },
  {
    date: "10 Ocak 2026",
    outlet: "İnşaat Sektörü",
    title: "Kat karşılığı stüdyo lansmanı",
    excerpt: "Arsa-müteahhit paylaşım senaryoları tek ekranda modelleniyor.",
  },
  {
    date: "5 Aralık 2025",
    outlet: "Startup Ekosistemi",
    title: "İhaleal, yatırım turunu tamamladı",
    excerpt: "Ürün odaklı büyüme ve uyum altyapısı güçlendirilecek.",
  },
];

export default function BasindaBizPage() {
  return (
    <PageShell
      badge="Basinda biz"
      title="Haberler ve basin bultenleri"
      subtitle="İhaleal hakkında yayınlanan güncel haberler ve duyurular."
      cta={{ label: "Basın iletişimi", to: "/kurumsal/iletisim" }}
    >
      <section className="py-6 max-w-4xl mx-auto">
        <div className="grid gap-3 md:grid-cols-3">
          <article className="card-warm p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-cyan-300">Nedir?</p>
            <p className="mt-2 text-sm text-slate-300">Basın merkezi, ürün güncellemeleri ve kurumsal duyuruların tek kaynaktan izlendiği resmi akıştır.</p>
          </article>
          <article className="card-warm p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Neden?</p>
            <p className="mt-2 text-sm text-slate-300">Yatırımcı, paydaş ve medya ekiplerine aynı veri seti ile tutarlı mesaj iletmek için kullanılır.</p>
          </article>
          <article className="card-warm p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-violet-300">Demo etiketi</p>
            <p className="mt-2 text-sm text-slate-300">Liste örnek haber kartları içerir; doğrulanmış basın linkleri canlı yayında kesinleşir.</p>
          </article>
        </div>
      </section>
      <section className="py-10 space-y-6 max-w-3xl mx-auto">
        {PRESS.map((item) => (
          <article key={item.title} className="card-warm">
            <time className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              {item.date} · {item.outlet}
            </time>
            <h2 className="text-xl font-bold mt-2 mb-2" style={{ color: "var(--color-text)" }}>
              {item.title}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              {item.excerpt}
            </p>
          </article>
        ))}
      </section>
      <section className="py-4 max-w-4xl mx-auto">
        <article className="card-warm p-5">
          <h2 className="text-lg font-semibold text-slate-100">İçerik / yöntem (editoryal çerçeve)</h2>
          <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-slate-300">
            <li>Her bülten: ürün değişikliği + etkilenen rol + zaman çizgisi.</li>
            <li>Her haberde: hangi modülün hangi KPI’a etkilediği açıkça belirtilir.</li>
            <li>Teknik iddialar demo/prod ayrımıyla işaretlenir, ölçülmeyen iddia yazılmaz.</li>
          </ul>
        </article>
      </section>
      <section className="py-4 max-w-4xl mx-auto grid gap-3 md:grid-cols-2">
        <article className="card-warm p-4">
          <h3 className="font-semibold text-slate-100">Örnek</h3>
          <p className="mt-2 text-sm text-slate-300">
            "Kapalı teklif modülü kurumsala açıldı" duyurusu; ihaleye giriş oranı, teklif sayısı ve kapanış süresi metrikleriyle birlikte verilir.
          </p>
        </article>
        <article className="card-warm p-4">
          <h3 className="font-semibold text-slate-100">Kime göre</h3>
          <p className="mt-2 text-sm text-slate-300">
            Medya, kurumsal partner, yatırımcı ilişkileri ve iç operasyon ekipleri için farklı okunabilirlik seviyesinde hazırlanır.
          </p>
        </article>
      </section>
      <section className="py-4 max-w-4xl mx-auto">
        <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <h3 className="font-semibold text-amber-100">Dürüst sınır</h3>
          <p className="mt-2 text-sm text-slate-200">
            Bu sayfa hukuki beyan yerine geçmez; basın içeriği ürün ve operasyon görünürlüğü sağlar, resmi taahhüt metni değildir.
          </p>
        </article>
      </section>
      <section className="py-4 max-w-4xl mx-auto flex flex-wrap gap-2">
        <a href="mailto:basin@ihaleal.com" className="rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
          Basın iletişim e-postası
        </a>
        <a href="/services" className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          Kurumsal hizmetler
        </a>
      </section>
      <section className="py-4 max-w-4xl mx-auto grid gap-3 md:grid-cols-3">
        <article className="card-warm p-4 text-sm">
          <h3 className="font-semibold text-slate-100">Kime göre</h3>
          <p className="mt-2 text-slate-300">Basın mensupları için hızlı briefing, kurumsal ekip için mesaj tutarlılığı sağlar.</p>
        </article>
        <article className="card-warm p-4 text-sm">
          <h3 className="font-semibold text-slate-100">Örnek kullanım</h3>
          <p className="mt-2 text-slate-300">Lansman haftasında teknik özellik ve etki metrikleri tek basın kartıyla paylaşılır.</p>
        </article>
        <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <h3 className="font-semibold text-amber-100">CTA</h3>
          <p className="mt-2 text-slate-200">Özel röportaj ve veri talebi için kurumsal iletişim kanalından zamanlı briefing planlayın.</p>
        </article>
      </section>
      <section className="py-4 max-w-4xl mx-auto">
        <article className="card-warm p-5">
          <h3 className="text-base font-semibold text-slate-100">Dürüst sınır</h3>
          <p className="mt-2 text-sm text-slate-300">
            Basın merkezi ürün anlatımı sağlar; hukuki veya finansal bağlayıcılık taşıyan resmi metinlerin yerine geçmez.
          </p>
        </article>
      </section>
      <section className="py-4 max-w-4xl mx-auto grid gap-3 md:grid-cols-2">
        <article className="card-warm p-4">
          <h3 className="font-semibold text-slate-100">Kurumsal basın yöntemi</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-300 space-y-1">
            <li>Önce değişiklik özeti, sonra etki metriği, en sonda kapsam sınırı paylaşılır.</li>
            <li>Demo ve canlı kapsamı her duyuruda açıkça ayrıştırılır.</li>
            <li>Yatırımcı iletişiminde doğrulanmayan büyüme iddiası kullanılmaz.</li>
          </ul>
        </article>
        <article className="card-warm p-4">
          <h3 className="font-semibold text-slate-100">B2B mesaj çerçevesi</h3>
          <p className="mt-2 text-sm text-slate-300">
            Kurumsal anlatıda değer önerisi "daha çok ilan" değil; teklif, evrak, risk ve kapanışın tek operasyon diliyle yönetilmesidir.
            Basın metinleri bu farkı somut KPI örnekleriyle görünür kılar.
          </p>
        </article>
      </section>
      <section className="py-4 max-w-4xl mx-auto rounded-xl border border-blue-500/25 bg-blue-500/10 p-4">
        <h3 className="font-semibold text-blue-100">Ek CTA</h3>
        <p className="mt-2 text-sm text-slate-200">
          Kurumsal medya dosyası, metrik destekli ürün özeti veya görüşme talebi için basın ve kurumsal iletişim ekipleriyle takvimli briefing planlayın.
        </p>
      </section>
    </PageShell>
  );
}
