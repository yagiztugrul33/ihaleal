import { Link } from "react-router-dom";
import AuthLogin from "./auth/Login";

export default function LoginPage() {
  return (
    <main>
      <AuthLogin />
      <section className="bg-[#050b16] px-4 pb-16">
        <div className="mx-auto max-w-5xl space-y-4">
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
            <h2 className="text-sm font-semibold text-cyan-100">Nedir / neden</h2>
            <p className="mt-2 text-xs text-slate-200">
              Giriş ekranı, kullanıcı yaşam döngüsünde güvenli oturum başlangıcı ve rol bazlı yönlendirme katmanıdır.
            </p>
          </article>
          <div className="grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Yöntem</p>
              <p className="mt-1">Auth sonrası rol ve profil parametresine göre doğru panele yönlendirme yapılır.</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Örnek</p>
              <p className="mt-1">Kurumsal profil ile girişte kullanıcı satıcı/proje ekranına düşer, bireysel akış standart dashboard’a gider.</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Kime göre</p>
              <p className="mt-1">Alıcı, satıcı, danışman, müteahhit ve kurumsal kullanıcı için ortak giriş omurgası sunar.</p>
            </article>
          </div>
          <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-slate-200">
            <p className="font-semibold text-amber-100">Dürüst sınır</p>
            <p className="mt-1">Demo ortamda bazı yönlendirmeler simülasyondur; üretimde kurum kimlik doğrulama katmanları eklenir.</p>
          </article>
          <div className="flex flex-wrap gap-2">
            <Link to="/kayit" className="rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
              Hesap oluştur
            </Link>
            <Link to="/destek" className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
              Destek merkezi
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Onboarding</p>
              <p className="mt-1">İlk girişte kullanıcıya rolüne uygun başlangıç modülleri ve güvenlik adımları gösterilir.</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Geri dönüş</p>
              <p className="mt-1">Tekrar gelen kullanıcıda yarım kalan işlem veya son ziyaret edilen panel öne çıkarılır.</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Örnek</p>
              <p className="mt-1">Müteahhit profili ile girişte ihale açma + KKA kontrol listesi kısayolu ilk ekranda sunulur.</p>
            </article>
          </div>
          <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-slate-200">
            <p className="font-semibold text-amber-100">Dürüst sınır</p>
            <p className="mt-1">Kimlik doğrulama ve erişim kontrolü canlıda ek uyum katmanlarıyla güçlendirilir.</p>
          </article>
          <div className="grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Kime göre</p>
              <p className="mt-1">Bireysel kullanıcı hızlı erişim isterken, kurumsal kullanıcı süreç bütünlüğü ve rol güvenliği bekler.</p>
            </article>
            <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4 text-xs text-slate-200">
              <p className="font-semibold text-cyan-100">CTA</p>
              <p className="mt-1">Giriş sonrası dashboard üzerinde onboarding kartlarını tamamlayarak ilk aksiyonu başlatın.</p>
            </article>
          </div>
          <section className="grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Panel başlangıcı</p>
              <p className="mt-1">Girişten sonra kullanıcı son açık dashboard kartına veya yarım kalan iş akışına yönlendirilir.</p>
              <p className="mt-1">Bu model, özellikle çok modüllü kullanıcıların yeniden bağlanma süresini kısaltır.</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Örnek geri dönüş</p>
              <p className="mt-1">Dün teklif veren kullanıcı bugün girişte "teklif sonucu", "evrak adımı" ve "mesaj" kartlarını birlikte görür.</p>
              <p className="mt-1">Bu sayede panel içinde dolaşmadan kritik aksiyona gider.</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Kime göre</p>
              <p className="mt-1">Yatırımcı hızlı karar kartı ister; danışman ve müteahhit rolü operasyon sırası ve evrak tamamlamayı öne alır.</p>
              <p className="mt-1">Tek giriş omurgası, rol bazlı farklı ilk ekranlar üretir.</p>
            </article>
          </section>
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Hero -&gt; Nedir/Neden -&gt; İçerik -&gt; Örnek -&gt; Kime göre akışı</h3>
            <p className="mt-2">
              Login sayfası yalnızca kimlik ekranı değil, kullanıcı yaşam döngüsünün kapısı olarak kurgulanır. Giriş adımı; güvenli oturum,
              rol farkı, panel tercihleri ve bildirim eşiklerini tek çatı altında başlatır.
            </p>
            <p className="mt-2">
              Özellikle kurumsal ekiplerde aynı hesap altında birden fazla operasyon aktörü bulunabildiği için, ilk girişte doğru aksiyon
              kartını göstermek üretkenliği doğrudan etkiler.
            </p>
            <p className="mt-2">
              Bu nedenle ekran dilinde "önce güvenlik, sonra aksiyon, en sonda raporlama" sırası korunur ve her rolde aynı terminoloji kullanılır.
            </p>
          </section>
          <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-slate-200">
            <h3 className="font-semibold text-amber-100">Dürüst sınır</h3>
            <p className="mt-2">
              Bu sayfa güvenli giriş deneyimini anlatır; tek başına KYC, sözleşme veya finansal uygunluk doğrulamasının yerini almaz.
            </p>
            <p className="mt-2">
              Bağlayıcı işlem adımlarında yasal belgeler, ek kimlik kontrolleri ve platform içi audit kayıtları zorunludur.
            </p>
          </section>
          <section className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4 text-xs text-slate-200">
            <h3 className="font-semibold text-cyan-100">CTA</h3>
            <p className="mt-2">Giriş sonrası dashboard kartlarını tamamlayın, bildirim merkezini açın ve yarım kalan akışı aynı gün kapatın.</p>
            <p className="mt-1">Kurumsal kullanımda rol bazlı paneli sabitleyerek ekip içi operasyon tutarlılığını artırın.</p>
          </section>
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Yaşam döngüsü notu</h3>
            <p className="mt-2">Giriş tamamlandığında kullanıcı davranışı ölçülür, sonraki oturum için kişiselleştirilmiş dönüş yolu oluşturulur.</p>
            <p className="mt-1">Bu yapı, panel/profil/mesajlar/belgeler akışını tek bir geri dönüş zincirine bağlar.</p>
            <p className="mt-1">Demo ortamında veriler örnek olabilir; üretimde gerçek olay kayıtlarıyla çalışır.</p>
          </section>
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">İşletim örneği</h3>
            <p className="mt-2">
              Aynı kullanıcı bir gün önce teklif verir, ertesi gün girişte "teklif durumu", "eksik belge" ve "mesaj yanıtı" kartlarını
              tek satırda görür. Bu model panel geçişlerini azaltır ve aksiyon hızını yükseltir.
            </p>
            <p className="mt-1">
              Kurumsal tarafta ise ekip üyeleri aynı hesabı farklı rollerle kullandığında, oturum başlangıcında rol bazlı görev dağılımı
              görünür hale gelir.
            </p>
            <p className="mt-1">
              Bu nedenle giriş sayfası yalnızca form ekranı değil, operasyon sürekliliğinin başlangıç düğümüdür.
            </p>
            <p className="mt-1">CTA: Girişten sonra ilk görev kartını aynı oturumda tamamlayın.</p>
          </section>
        </div>
      </section>
    </main>
  );
}
