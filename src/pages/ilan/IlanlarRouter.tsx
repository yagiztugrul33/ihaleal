import { Link, useParams } from "react-router-dom";
import { isPropertyDetailId } from "@/lib/demo-data";
import CategoryLandingPage from "@/pages/ilan/CategoryLandingPage";
import IlanDetayPage from "@/pages/ilan/IlanDetayPage";
import { isSupabaseConfigured } from "@/lib/supabase";

const SEGMENT_HELP = [
  "Kategori -> alt kırılım -> tip sırasıyla okunur.",
  "prop-XXX formatındaki segmentler otomatik olarak ilan detayına yönlenir.",
  "Boş/eksik segmentte katalog varsayılan kategori görünümü açılır.",
] as const;

const SEGMENT_DECISION = [
  "Kategori seçimi piyasa taraması için geniş filtre sağlar.",
  "Alt kırılım yatırım segmenti daraltır (ör. konut/villa).",
  "Tip kırılımı nihai shortlist üretir.",
] as const;

const ROUTER_FAQ = [
  {
    q: "Segment eksikse ne olur?",
    a: "Sistem varsayılan katalog yönlendirmesi açar ve kullanıcıyı güvenli rotada tutar.",
  },
  {
    q: "prop-XXX neden önemli?",
    a: "Bu format, detay sayfasına geçişte ilan kimliğini kesinleştirir.",
  },
  {
    q: "Canlı veri yoksa?",
    a: "Fallback kartı demo veri modunu açıkça bildirir ve aksiyon linklerini sunar.",
  },
] as const;

function MissingSegmentFallback() {
  const envReady = isSupabaseConfigured();
  return (
    <section className="mx-auto my-8 max-w-4xl rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white">
      <h2 className="text-xl font-bold">İlan rota eşleyici bilgilendirme</h2>
      <p className="mt-2 text-sm text-slate-300">
        Segment bulunamadığında sistem boş ekran yerine varsayılan katalog yönlendirmesine döner.
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-300">
        {SEGMENT_HELP.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="mt-3 grid gap-2 md:grid-cols-3 text-xs text-slate-300">
        {SEGMENT_DECISION.map((item) => (
          <article key={item} className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
            {item}
          </article>
        ))}
      </div>
      {!envReady ? (
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Supabase ortam değişkenleri eksik: katalog/ilan yönlendirmeleri demo veri üzerinden çalışıyor.
        </p>
      ) : null}
      <div className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-100">
        Segmentler bulunamadığında sistem kullanıcıyı güvenli rotaya yönlendirir; ürün davranışı "boş ekran" yerine "kılavuzlu akış"
        olarak tasarlanmıştır.
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3 text-xs text-slate-300">
        {ROUTER_FAQ.map((item) => (
          <article key={item.q} className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
            <p className="font-semibold text-slate-100">{item.q}</p>
            <p className="mt-1">{item.a}</p>
          </article>
        ))}
      </div>
      <div className="mt-3 rounded-lg border border-violet-500/30 bg-violet-500/10 p-3 text-xs text-violet-100">
        Operasyon notu: Router katmanı, ilan/ihale deneyiminin ilk kapısıdır; hatalı segmentte akışı durdurmak yerine
        yönlendirme ve açıklama vermek kullanıcı kaybını azaltır.
      </div>
      <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-100">
        <p className="font-semibold">Kontrol listesi</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Segmentler çözümlendi mi?</li>
          <li>Detay id varsa doğru rota seçildi mi?</li>
          <li>Eksik URL durumunda fallback kartı açıldı mı?</li>
          <li>Kullanıcıya en az iki güvenli dönüş CTA&apos;sı verildi mi?</li>
        </ul>
        <p className="mt-2">
          Bu checklist, URL kaynaklı kullanıcı kaybını azaltmak ve teklif akışını katalog üzerinden güvenli yeniden başlatmak için kullanılır.
        </p>
        <p className="mt-2">
          Segment çözümlemesi ve fallback davranışı birlikte izlendiğinde, rota kaynaklı destek talepleri önemli ölçüde azalır.
        </p>
        <p className="mt-2">
          Router davranışı, ilan/ihale keşif zincirini kullanıcı odaklı ve geri dönülebilir halde tutar.
        </p>
        <p className="mt-2">
          Bu yapı özellikle mobilde kırık link senaryolarında kullanıcı deneyimini korur.
        </p>
        <p className="mt-2">
          Sonuç olarak kullanıcı, akışı yeniden başlatmak için her zaman görünür bir çıkış yoluna sahip olur.
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to="/ilanlar" className="rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
          Tüm ilanlar
        </Link>
        <Link to="/ihaleler" className="rounded-lg border border-violet-500/35 bg-violet-500/10 px-3 py-2 text-sm text-violet-100">
          İhale akışı
        </Link>
      </div>
    </section>
  );
}

/**
 * /ilanlar/* — prop-XXX → detay; aksi halde kategori landing.
 */
export default function IlanlarRouter() {
  const params = useParams();
  const segments = [
    params["*"]?.split("/").filter(Boolean)[0],
    params.kategori,
    params.alt,
    params.tip,
  ].filter((s): s is string => Boolean(s));

  const unique = [...new Set(segments)];
  const first = unique[0];

  if (first && isPropertyDetailId(first)) {
    return <IlanDetayPage id={first} />;
  }

  if (unique.length === 0) {
    return <MissingSegmentFallback />;
  }

  const category = params.kategori ?? unique[0];
  const alt = params.alt ?? unique[1];
  const tip = params.tip ?? unique[2];

  return <CategoryLandingPage category={category} sub={alt} type={tip} />;
}
