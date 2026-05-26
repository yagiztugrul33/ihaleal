import { Link, useParams } from "react-router-dom";
import { isPropertyDetailId } from "@/lib/demo-data";
import AuctionDetail from "@/pages/AuctionDetail";
import IlanDetayPage from "@/pages/ilan/IlanDetayPage";
import { isSupabaseConfigured } from "@/lib/supabase";

const ROUTE_EXAMPLES = [
  "/ilan/prop-001",
  "/ilan/demo-ihale-1",
  "/ilan/ihale-ankara-merkez",
] as const;

const ROUTE_RULES = [
  "prop-XXX formatı -> ilan katalog detayına gider.",
  "Diğer id biçimleri -> ihale detay akışına yönlenir.",
  "Eksik id -> fallback kartı ve güvenli yönlendirme linkleri açılır.",
] as const;

const ROUTE_RECOVERY = [
  "1) Önce /ilanlar kataloğundan geçerli kaydı seçin.",
  "2) İlan kartında galeri + AI + deprem + emsal sekmelerini doğrulayın.",
  "3) Sonra teklif/ihale akışına aynı kayıt üzerinden girin.",
] as const;

const ROUTER_FAQ = [
  {
    q: "ID neden zorunlu?",
    a: "Detay veya ihale ekranının doğru kaydı açabilmesi için rota kimliği gerekir.",
  },
  {
    q: "Hangi durumda ihale detayına gider?",
    a: "prop-XXX olmayan id'ler varsayılan olarak ihale detay akışına düşer.",
  },
  {
    q: "Fallback ne sağlar?",
    a: "Eksik URL'de kullanıcıyı kaybetmeden kataloga ve ihale listesine geri taşır.",
  },
] as const;

function RouterFallback() {
  const envReady = isSupabaseConfigured();
  return (
    <main className="min-h-screen px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h1 className="text-2xl font-bold">İlan detay rotası için ID bulunamadı</h1>
        <p className="mt-2 text-sm text-slate-300">
          Bu rota bir ilan veya ihale ID&apos;si bekler. Geçerli bir ID ile detay ekranına veya ihale akışına yönlenebilirsiniz.
        </p>
        <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-100">
          <p className="font-semibold">Rota örnekleri</p>
          <ul className="mt-2 space-y-1">
            {ROUTE_EXAMPLES.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">Yönlendirme kuralları</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {ROUTE_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
        <div className="mt-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-100">
          <p className="font-semibold">Kurtarma akışı</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {ROUTE_RECOVERY.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        {!envReady ? (
          <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
            Supabase yapılandırması bulunmadığı için canlı veri senaryoları yerine demo rota akışı gösteriliyor.
          </div>
        ) : null}
        <div className="mt-3 grid gap-2 md:grid-cols-3 text-xs text-slate-300">
          <article className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
            <p className="font-semibold text-slate-100">Galeri</p>
            <p className="mt-1">İlk adımda ilan görsellerini ve temel teknik bilgileri doğrulayın.</p>
          </article>
          <article className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
            <p className="font-semibold text-slate-100">Risk ve emsal</p>
            <p className="mt-1">AI/deprem/emsal sekmeleriyle teklif öncesi kontrol yapın.</p>
          </article>
          <article className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
            <p className="font-semibold text-slate-100">Teklif akışı</p>
            <p className="mt-1">Kayıt doğrulandıktan sonra teklif veya hemen-al yoluna geçin.</p>
          </article>
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
          Router katmanı, ilan detay deneyiminde "yolunu kaybetmiş kullanıcı" senaryosunu absorbe eder ve akışı tekrar güvenli şekilde başlatır.
        </div>
        <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-100">
          <p className="font-semibold">Yönlendirme kalite kontrolü</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>ID varsa türüne göre detay/ihale ayrımı yapılır.</li>
            <li>ID yoksa fallback + CTA açılır.</li>
            <li>Kullanıcı tekrar kataloga dönüp doğru kaydı seçebilir.</li>
          </ul>
          <p className="mt-2">Böylece yanlış URL kaynaklı işlem kesintisi minimuma indirilir.</p>
          <p className="mt-1">Kullanıcı deneyimi, teknik hata yerine yönlendirme odaklı devam eder.</p>
          <p className="mt-1">Doğru kayıt seçimi sonrası teklif akışı kesintisiz devam eder.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/ilanlar" className="rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
            İlan listesine dön
          </Link>
          <Link to="/ihaleler" className="rounded-lg border border-violet-500/35 bg-violet-500/10 px-3 py-2 text-sm text-violet-100">
            Canlı ihaleleri aç
          </Link>
        </div>
      </section>
    </main>
  );
}

/**
 * /ilan/:id
 * - prop-xxx gibi katalog id'leri -> ilan detay bileşeni
 * - diğer id'ler -> ihale detay akışı
 */
export default function IlanDetailRouter() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <RouterFallback />;
  if (isPropertyDetailId(id)) {
    return <IlanDetayPage id={id} />;
  }
  return <AuctionDetail />;
}
