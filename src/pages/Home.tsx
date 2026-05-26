import { Link } from "react-router-dom";
import PremiumCinematicHome from "@/sections/PremiumCinematicHome";

export default function Home() {
  return (
    <>
      <PremiumCinematicHome />
      <section className="px-4 py-14">
        <div className="mx-auto max-w-6xl rounded-2xl border border-cyan-500/25 bg-slate-900/60 p-6">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Gayrimenkul borsası: ilk adım paneli</h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
            Güçlü hero + değer önerisi + güven + modül kartları tek yerde. Bu katman, yatırımcı/arsa sahibi/danışman akışını hızlı başlatmak için eklendi.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-cyan-200">Nedir?</p>
              <p className="mt-2 text-sm text-slate-200">İhaleal, ilan/ihale/veri/uyum katmanlarını tek işletim paneline bağlayan modüler pazar yapısıdır.</p>
            </article>
            <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-emerald-200">Neden?</p>
              <p className="mt-2 text-sm text-slate-200">Dağınık teklif ve analiz sürecini tek ekran akışına alır; karar ve operasyon çevrimini kısaltır.</p>
            </article>
            <article className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-violet-200">Demo etiketi</p>
              <p className="mt-2 text-sm text-slate-200">Bazı modüller demo/proxy veri ile çalışır; resmi karar süreçlerinde kurum verisi ile doğrulama gerekir.</p>
            </article>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Link to="/borsa" className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200">Borsa terminali</Link>
            <Link to="/degerleme" className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200">AI değerleme</Link>
            <Link to="/modul/deprem-risk-haritasi" className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200">Deprem risk</Link>
            <Link to="/arastirma/ges" className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200">GES analizi</Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="font-semibold text-slate-100">İçerik / yöntem</h3>
              <p className="mt-2 text-sm text-slate-300">
                Her modülde aynı dil korunur: önce karar metriği, sonra açıklanabilir yöntem, en sonunda rol bazlı aksiyon.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="font-semibold text-slate-100">Örnek</h3>
              <p className="mt-2 text-sm text-slate-300">
                Aynı ilan için değerleme + deprem + GES + komisyon katmanını birleştirip teklif aralığı ve risk eşiği birlikte okunur.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="font-semibold text-slate-100">Kime göre</h3>
              <p className="mt-2 text-sm text-slate-300">
                Alıcı, satıcı, danışman, müteahhit ve kurumsal yatırımcı aynı omurgayı rol farkıyla kullanır.
              </p>
            </article>
          </div>
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <h3 className="font-semibold text-amber-100">Dürüst sınır</h3>
            <p className="mt-2 text-sm text-slate-200">
              Platform karar desteği sağlar; hukuk, teknik ve mali onay olmadan bağlayıcı taahhüt üretilmez.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/dashboard" className="rounded-lg border border-blue-500/35 bg-blue-500/10 px-3 py-2 text-sm text-blue-100">
              Dashboard aç
            </Link>
            <Link to="/services" className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
              Kurumsal hizmetler
            </Link>
            <Link to="/how-it-works" className="rounded-lg border border-violet-500/35 bg-violet-500/10 px-3 py-2 text-sm text-violet-100">
              Nasıl çalışır akışı
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Dürüst sınır: Modüller ön analiz sağlar; resmi ekspertiz, hukuk ve finans onayı olmadan bağlayıcı işlem yapılmaz.
          </p>
        </div>
      </section>
      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-lg font-semibold text-slate-100">Örnek operasyon zinciri</h3>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-300">
              <li>İlan açılışı ve temel doğrulama</li>
              <li>Değerleme + bölge zekası karşılaştırması</li>
              <li>Teklif/kapalı teklif/ihale model seçimi</li>
              <li>Doküman ve güvenlik kontrolleri</li>
              <li>Kapanış öncesi mali-hukuki teyit</li>
            </ol>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-lg font-semibold text-slate-100">Kime göre değer</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p><strong className="text-slate-100">Alıcı:</strong> karşılaştırmalı risk/fiyat görünümü ile teklif aralığı.</p>
              <p><strong className="text-slate-100">Satıcı:</strong> daha net fiyatlama ve kayıtlı teklif yönetimi.</p>
              <p><strong className="text-slate-100">Kurumsal:</strong> çoklu portföy için standart rapor ve karar disiplini.</p>
            </div>
          </article>
        </div>
        <div className="mx-auto mt-4 max-w-6xl rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <h3 className="text-lg font-semibold text-emerald-100">Final CTA</h3>
          <p className="mt-2 text-sm text-slate-200">
            Hızlı başlangıç için önce dashboard açın, ardından ilgili rol yolunu seçerek modül akışına geçin.
          </p>
        </div>
        <div className="mx-auto mt-4 max-w-6xl grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4">
            <h4 className="text-sm font-semibold text-slate-100">Platform modülleri dili</h4>
            <p className="mt-2 text-xs text-slate-300">Tüm sayfalar aynı karar diliyle konuşur: sinyal, yöntem, sınır, aksiyon.</p>
          </article>
          <article className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4">
            <h4 className="text-sm font-semibold text-slate-100">B2B değer önerisi</h4>
            <p className="mt-2 text-xs text-slate-300">Kurumsal ekipler için tekliften kapanışa kadar izlenebilir operasyon zinciri sağlanır.</p>
          </article>
          <article className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4">
            <h4 className="text-sm font-semibold text-slate-100">Demo etiketi</h4>
            <p className="mt-2 text-xs text-slate-300">Demo veri ile çalışan alanlar açıkça işaretlenir; üretim iddiası ölçümsüz verilmez.</p>
          </article>
        </div>
        <div className="mx-auto mt-4 max-w-6xl rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-5">
          <h3 className="text-lg font-semibold text-cyan-100">Ana hikaye - kurumsal seviye çerçeve</h3>
          <p className="mt-2 text-sm text-slate-200">
            İhaleal’in ana hikayesi, "ilan yayınlama" adımını tek başına bir hedef olarak görmez; tekliften kapanışa kadar uzanan
            tüm süreci ölçülebilir bir operasyon zinciri olarak tasarlar. Bu yaklaşım özellikle çok ekipli kurumsal yapılarda
            standart karar dili üretir.
          </p>
          <p className="mt-2 text-sm text-slate-200">
            Aynı omurga üzerinde alıcı, satıcı, danışman, müteahhit ve yatırımcı farklı rol panelleriyle çalışır. Kurumsal tarafta
            kritik değer; yalnızca "kaç işlem" değil, "hangi işlemler risk yönetimiyle kapandı" sorusuna cevap verebilmektir.
          </p>
          <p className="mt-2 text-sm text-slate-200">
            Bu nedenle ana sayfa, modül vitrini olmanın ötesinde bir karar merkezi gibi kurgulanır: veri sinyali, risk filtresi,
            sözleşme/evrak hattı ve operasyon aksiyonu tek deneyimde birleşir.
          </p>
          <p className="mt-2 text-sm text-slate-200">
            Sonuç hedefi: kullanıcıyı yalnızca "gezinme" değil, güvenli ve tutarlı bir işlem yaşam döngüsüne taşımaktır.
          </p>
          <p className="mt-2 text-sm text-slate-200">CTA: Ana panelden rol yolunu seçin ve modül karar zincirini adım adım tamamlayın.</p>
        </div>
      </section>
    </>
  );
}
