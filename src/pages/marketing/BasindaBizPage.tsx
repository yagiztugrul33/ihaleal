import { PageShell } from "@/components/marketing/PageShell";

const PRESS = [
  {
    date: "15 Mart 2026",
    outlet: "Gayrimenkul Dunyasi",
    title: "Ihaleal, kapali teklif modulunu kurumsal musterilere acti",
    excerpt: "GYO ve muteahhit segmentinde seffaf ihale talebi artiyor.",
  },
  {
    date: "2 Subat 2026",
    outlet: "Teknoloji Haberleri",
    title: "Turkiye verisi ile AI destekli fiyatlama",
    excerpt: "Platform, bolgesel endeks ve son islem verilerini birlestiriyor.",
  },
  {
    date: "10 Ocak 2026",
    outlet: "Insaat Sektoru",
    title: "Kat karsiligi studio lansmani",
    excerpt: "Arsa-muteahhit paylasim senaryolari tek ekranda modelleniyor.",
  },
  {
    date: "5 Aralik 2025",
    outlet: "Startup Ekosistemi",
    title: "Ihaleal, yatirim turunu tamamladi",
    excerpt: "Urün odakli buyume ve uyum altyapisi guclendirilecek.",
  },
];

export default function BasindaBizPage() {
  return (
    <PageShell
      badge="Basinda biz"
      title="Haberler ve basin bultenleri"
      subtitle="Ihaleal hakkinda yayinlanan guncel haberler ve duyurular."
      cta={{ label: "Basin iletisimi", to: "/kurumsal/iletisim" }}
    >
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
    </PageShell>
  );
}
