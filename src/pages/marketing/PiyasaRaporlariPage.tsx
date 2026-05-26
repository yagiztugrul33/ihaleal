import { PageShell } from "@/components/marketing/PageShell";
import { FileBarChart } from "lucide-react";

const KFE_2026 = {
  nominal: 26.6,
  reel: -4.3,
  ankaraNominal: 36.7,
} as const;

const REPORTS = [
  {
    id: "r-istanbul-ofis-q2",
    title: "İstanbul Ofis Pazarı — Q2 2026",
    date: "2026-05-15",
    pages: 24,
    summary:
      "Levent, Maslak ve Kozyatağı aksında A sınıfı arzın doluluk ve kira bandı karşılaştırması. Yatırımcılar için nakit akışı, çıkış çarpanı ve yeniden kiralama riski ayrı tablolarla ele alınır.",
  },
  {
    id: "r-izmir-turizm",
    title: "Ege Turizm Varlıkları Dönüşüm Raporu",
    date: "2026-05-10",
    pages: 18,
    summary:
      "Bodrum, Çeşme ve Kuşadası otel portföylerinde sezonluk gelir oynaklığı, doluluk tahmini ve operasyonel gider etkisi. Senaryo seti yüksek sezon ve düşük sezon için ayrı değerlendirilir.",
  },
  {
    id: "r-ges-arazi",
    title: "GES Uyumlu Arazi Segmentasyonu",
    date: "2026-05-08",
    pages: 20,
    summary:
      "İmar, trafo mesafesi ve eğim parametreleri ile GES kuruluma uygun arsa grupları. Teknik fizibilite ön skoru ve sözleşme hazırlık notlarıyla birlikte sunulur.",
  },
  {
    id: "r-kentsel-donusum",
    title: "Kentsel Dönüşüm Fırsat Haritası",
    date: "2026-05-02",
    pages: 16,
    summary:
      "İstanbul, Ankara ve İzmir merkezli dönüşüm bölgelerinde ruhsat süreci, maliyet basamakları ve beklenen satış hızının karşılaştırmalı görünümü. Ortaklık yapısı için risk/ödül matrisi içerir.",
  },
  {
    id: "r-endustri-lojistik",
    title: "Endüstri ve Lojistik Varlıkları",
    date: "2026-04-28",
    pages: 22,
    summary:
      "Depo ve hafif üretim tesislerinde kira kontratı yapısı, boşluk riski ve enerji giderlerinin NOI üzerindeki etkisi. Kurumsal kiracı profiline göre farklı gelir hassasiyetleri hesaplanır.",
  },
  {
    id: "r-konut-villa",
    title: "Lüks Konut ve Villa Talep Endeksi",
    date: "2026-04-22",
    pages: 14,
    summary:
      "Boğaz, Adalar ve kıyı ilçelerinde villa stok hareketi, satış süresi ve teklif rekabeti. Alıcı davranışı, finansmana erişim ve fiyat esnekliği tek tabloda özetlenir.",
  },
];

export default function PiyasaRaporlariPage() {
  return (
    <PageShell badge="Piyasa" title="Piyasa rapor merkezi" subtitle="Yönetici özeti, saha notu ve senaryo tabloları">
      <section className="py-4 grid gap-3 md:grid-cols-3">
        <article className="card-warm p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-cyan-300">Nedir?</p>
          <p className="mt-2 text-sm text-slate-300">Piyasa rapor merkezi, yatırım kararında kullanılan veri setlerini standart formatta birleştirir.</p>
        </article>
        <article className="card-warm p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Neden?</p>
          <p className="mt-2 text-sm text-slate-300">Nominal/reel ayrımını görünür kılar, bölgesel sapmaları tek tabloda kıyaslamayı kolaylaştırır.</p>
        </article>
        <article className="card-warm p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-violet-300">Demo etiketi</p>
          <p className="mt-2 text-sm text-slate-300">Kartlar karar desteği içindir; resmi rapor onayı kurum verisi ve uzman incelemesiyle tamamlanır.</p>
        </article>
      </section>
      <section className="py-6 grid gap-3 sm:grid-cols-3">
        <article className="card-warm">
          <p className="text-xs uppercase tracking-[0.12em] text-cyan-300">KFE 2026 nominal</p>
          <p className="mt-2 text-2xl font-bold text-slate-100">+%{KFE_2026.nominal.toFixed(1)}</p>
          <p className="mt-1 text-xs text-slate-400">Türkiye konut fiyat endeksi yıllık nominal değişim</p>
        </article>
        <article className="card-warm">
          <p className="text-xs uppercase tracking-[0.12em] text-amber-300">KFE 2026 reel</p>
          <p className="mt-2 text-2xl font-bold text-slate-100">%{KFE_2026.reel.toFixed(1)}</p>
          <p className="mt-1 text-xs text-slate-400">Enflasyondan arındırılmış yıllık değişim (reel)</p>
        </article>
        <article className="card-warm">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Ankara yıllık</p>
          <p className="mt-2 text-2xl font-bold text-slate-100">+%{KFE_2026.ankaraNominal.toFixed(1)}</p>
          <p className="mt-1 text-xs text-slate-400">Ankara özelinde yıllık nominal değişim</p>
        </article>
      </section>
      <section className="py-6 space-y-3 text-sm leading-relaxed text-slate-300">
        <p>
          Bu merkezde yayınlanan raporlar, ihale ve ilan akışlarında kullanılan değerleme varsayımlarını görünür kılar.
          Her rapor; bölgesel talep, fiyat oynaklığı, işlem süresi ve operasyon maliyeti gibi yatırım kararını etkileyen
          ana değişkenleri tek formatta toplar.
        </p>
        <p>
          İçerikler haftalık olarak güncellenir ve her sürümde kullanılan veri aralığı ayrıca belirtilir. Böylece yönetim
          ekipleri hangi tablonun hangi döneme ait olduğunu açıkça görebilir ve karşılaştırmalı karar alabilir.
        </p>
        <p>
          2026 KFE görünümü, nominal artışın güçlü kalmasına rağmen reel tarafta baskı olduğunu gösterir. Bu nedenle rapor
          kartlarında hem nominal hem reel sinyal birlikte verilir; Ankara gibi bölgesel pozitif ayrışmalar ayrı izlenir.
        </p>
      </section>
      <section className="py-2 grid gap-3 md:grid-cols-2">
        <article className="card-warm p-4">
          <h2 className="text-base font-semibold text-slate-100">Yöntem (açıklamalı)</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-xs text-slate-300">
            <li>Fiyat sinyali: nominal + reel birlikte okunur.</li>
            <li>Likidite sinyali: pazarda kalma süresi ve teklif yoğunluğu.</li>
            <li>Risk sinyali: gelir oynaklığı, boşluk riski, operasyon maliyeti.</li>
            <li>Karar: tek metrik yerine çoklu skor matrisi.</li>
          </ul>
        </article>
        <article className="card-warm p-4">
          <h2 className="text-base font-semibold text-slate-100">Örnek</h2>
          <p className="mt-2 text-sm text-slate-300">
            Ankara’da nominal ivme güçlüyken reel tarafta baskı sınırlı kalabilir; bu durumda yatırım kararı için kira devamlılığı ve satış süresi birlikte değerlendirilir.
          </p>
        </article>
      </section>
      <section className="py-2">
        <article className="card-warm p-4">
          <h2 className="text-base font-semibold text-slate-100">Yönetici özeti: 2026 okuması</h2>
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            <li>- Nominal fiyat artışı tek başına yeterli sinyal değildir; reel bant zorunlu KPI olarak izlenmelidir.</li>
            <li>- Ankara gibi yüksek nominal ivme yakalayan şehirlerde likidite ve işlem süresi birlikte kontrol edilmelidir.</li>
            <li>- İhaleal rapor seti, fiyat + talep + süre + risk bileşenini aynı tabloda toplar (demo metodoloji).</li>
          </ul>
        </article>
      </section>
      <section className="py-3 grid gap-3 md:grid-cols-2">
        <article className="card-warm p-4">
          <h3 className="font-semibold text-slate-100">Kime göre</h3>
          <p className="mt-2 text-sm text-slate-300">
            Kurumsal yatırımcı, fon yöneticisi ve saha operasyon ekipleri için aynı raporun rol bazlı okuma katmanları sunulur.
          </p>
        </article>
        <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <h3 className="font-semibold text-amber-100">Dürüst sınır</h3>
          <p className="mt-2 text-sm text-slate-200">
            İçerik yatırım tavsiyesi değildir; raporlar ön değerlendirme ve karar önceliklendirme amacıyla hazırlanır.
          </p>
        </article>
      </section>
      <section className="py-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <article key={r.id} className="card-warm p-4 space-y-2">
            <FileBarChart className="h-5 w-5 text-cyan-300" />
            <h2 className="text-sm font-semibold text-slate-100">{r.title}</h2>
            <p className="text-xs text-slate-400">{r.date} · {r.pages} sayfa</p>
            <p className="text-xs leading-relaxed text-slate-300">{r.summary}</p>
          </article>
        ))}
      </section>
      <section className="py-2 flex flex-wrap gap-2">
        <a href="/services" className="rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
          Kurumsal hizmetler
        </a>
        <a href="/veri-ve-endeks" className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          Veri ve endeks metodolojisi
        </a>
      </section>
    </PageShell>
  );
}