import { Link, useParams } from "react-router-dom";
import { isPropertyDetailId } from "@/lib/demo-data";
import CategoryLandingPage from "@/pages/ilan/CategoryLandingPage";
import IlanDetayPage from "@/pages/ilan/IlanDetayPage";
import { isSupabaseConfigured } from "@/lib/supabase";

const SEGMENT_ROUTE_GUIDE = [
  "/ilanlar/konut",
  "/ilanlar/konut/villa",
  "/ilanlar/konut/villa/mustakil",
  "/ilanlar/prop-001",
] as const;

const SEGMENT_WORKFLOW = [
  "1) Segmentleri sırayla okuyup en dar kategoriye in.",
  "2) Geçerli detay id bulunursa doğrudan ilan detayına geç.",
  "3) Aksi halde kategori landing ile filtre odaklı gezin.",
] as const;

const SEGMENT_FAQ = [
  {
    q: "Neden boş ekran yok?",
    a: "Yanlış segmentte kullanıcıyı yönlendirme kartı karşılar ve akış kopmaz.",
  },
  {
    q: "Detay id nasıl bulunur?",
    a: "Kategori/alt/tip segmentlerinde prop-XXX formatı otomatik taranır.",
  },
  {
    q: "Canlı veri olmadan ne değişir?",
    a: "Sadece veri kaynağı demo olur; rota çözümleme davranışı aynı kalır.",
  },
] as const;

function SegmentFallback() {
  const envReady = isSupabaseConfigured();
  return (
    <main className="min-h-screen px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h1 className="text-2xl font-bold">Segment rotası okunamadı</h1>
        <p className="mt-2 text-sm text-slate-300">
          Kategori segmentleri eksik olduğunda sistem boş ekran göstermez; güvenli varsayılan kataloğa yönlenmenizi önerir.
        </p>
        <div className="mt-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-100">
          <p className="font-semibold">Örnek segment rotaları</p>
          <ul className="mt-2 space-y-1">
            {SEGMENT_ROUTE_GUIDE.map((route) => (
              <li key={route}>{route}</li>
            ))}
          </ul>
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">Segment iş akışı</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {SEGMENT_WORKFLOW.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        {!envReady ? (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
            Ortam değişkenleri olmadığı için canlı kaynaklar yerine demo katalog yönlendirmesi kullanılıyor.
          </p>
        ) : null}
        <div className="mt-3 grid gap-2 md:grid-cols-3 text-xs text-slate-300">
          <article className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
            Katalog filtresi: genişten dara segment daraltması.
          </article>
          <article className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
            Detay filtresi: prop-XXX tespitinde otomatik detay yönlendirme.
          </article>
          <article className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
            Güvenli fallback: eksik segmentte yönlendirme kartı ve CTA.
          </article>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-3 text-xs text-slate-300">
          {SEGMENT_FAQ.map((item) => (
            <article key={item.q} className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
              <p className="font-semibold text-slate-100">{item.q}</p>
              <p className="mt-1">{item.a}</p>
            </article>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-violet-500/30 bg-violet-500/10 p-3 text-xs text-violet-100">
          Router amacı: ilan keşif akışını kesintiye uğratmadan, eksik URL durumlarında kullanıcıyı doğru kataloga geri taşımak.
        </div>
        <div className="mt-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-100">
          <p className="font-semibold">Segment kalite kontrolü</p>
          <p className="mt-1">Kategori -&gt; alt -&gt; tip sırası bozulduğunda fallback kartı devreye girer ve kullanıcıyı tekrar kataloga döndürür.</p>
          <p className="mt-1">Bu yaklaşım rota hatalarında oturumu korur ve teklif sürecine geçiş kaybını azaltır.</p>
          <p className="mt-1">Aynı zamanda destek ekiplerine hata sınıfını daha hızlı teşhis etme imkanı verir.</p>
          <p className="mt-1">Katalog yönlendirmesi tamamlandığında kullanıcı, ilgili segmenti yeniden seçerek akışı sürdürebilir.</p>
          <p className="mt-1">Bu model, keşif akışını tek URL hatasında kesintiye uğratmaz.</p>
          <p className="mt-1">Segment fallback kartı, kullanıcıya net sonraki adımı göstererek terk oranını düşürür.</p>
          <p className="mt-1">Ayrıca kalite ekipleri için ölçülebilir bir hata geri kazanım standardı oluşturur.</p>
          <p className="mt-1">Bu nedenle rota tabanlı kullanıcı yolculuğu daha dayanıklı hale gelir.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/ilanlar" className="rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
            Kataloga dön
          </Link>
          <Link to="/teklif-al" className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
            Teklif akışları
          </Link>
        </div>
      </section>
    </main>
  );
}

/**
 * /ilanlar/:kategori/:alt/:tip — prop-XXX → detay; aksi halde kategori landing.
 */
export default function IlanlarSegmentRouter() {
  const { kategori, alt, tip } = useParams<{
    kategori?: string;
    alt?: string;
    tip?: string;
  }>();

  const detailIdCandidate = [kategori, alt, tip].find((value) =>
    value ? isPropertyDetailId(value) : false,
  );
  if (detailIdCandidate) {
    return <IlanDetayPage id={detailIdCandidate} />;
  }

  if (!kategori && !alt && !tip) {
    return <SegmentFallback />;
  }

  return (
    <CategoryLandingPage
      category={kategori}
      sub={alt}
      type={tip}
    />
  );
}
