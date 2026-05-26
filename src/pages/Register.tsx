import { Link } from "react-router-dom";
import AuthRegister from "./auth/Register";

export default function RegisterPage() {
  return (
    <main>
      <AuthRegister />
      <section className="bg-[#050b16] px-4 pb-16">
        <div className="mx-auto max-w-5xl space-y-4">
          <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <h2 className="text-sm font-semibold text-emerald-100">Nedir / neden</h2>
            <p className="mt-2 text-xs text-slate-200">
              Kayıt ekranı, kullanıcı onboarding sürecinin ilk adımıdır; veri onayı, profil kimliği ve rol bazlı başlangıç akışını kurar.
            </p>
          </article>
          <div className="grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">İçerik / yöntem</p>
              <p className="mt-1">Temel kimlik + iletişim + KVKK onayı ile minimum güvenli kayıt seti oluşturulur.</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Örnek akış</p>
              <p className="mt-1">Kayıt tamamlandıktan sonra kullanıcı rolüne göre teklif, satıcı veya proje paneline yönlendirilir.</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Kime göre</p>
              <p className="mt-1">Bireysel kullanıcı, danışman ve kurumsal ekipler aynı onboarding omurgasında buluşur.</p>
            </article>
          </div>
          <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-slate-200">
            <p className="font-semibold text-amber-100">Dürüst sınır</p>
            <p className="mt-1">Bu adım sözleşmesel kimlik doğrulamanın tamamı değildir; üretimde ek KYC kontrolleri zorunludur.</p>
          </article>
          <div className="flex flex-wrap gap-2">
            <Link to="/giris" className="rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
              Mevcut hesapla giriş
            </Link>
            <Link to="/kvkk" className="rounded-lg border border-violet-500/35 bg-violet-500/10 px-3 py-2 text-xs text-violet-100">
              KVKK metni
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Onboarding</p>
              <p className="mt-1">Kayıt sonrası kullanıcıya profil tamamlama, favori oluşturma ve ilk teklif adımı önerilir.</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Yaşam döngüsü</p>
              <p className="mt-1">Kayıt -&gt; doğrulama -&gt; ilk aksiyon -&gt; geri dönüş bildirimleri zinciri ile aktif kullanım hedeflenir.</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Örnek</p>
              <p className="mt-1">Kayıt tamamlanan yatırımcı için piyasa raporu ve favori listesi kısa yolu otomatik açılır.</p>
            </article>
          </div>
          <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-slate-200">
            <p className="font-semibold text-amber-100">Dürüst sınır</p>
            <p className="mt-1">Bu adım hesap açılışıdır; ileri KYC ve sözleşme doğrulaması ayrı süreçlerde tamamlanır.</p>
          </article>
          <div className="grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Kime göre</p>
              <p className="mt-1">Alıcı, satıcı ve kurumsal roller aynı kayıt omurgasında farklı başlangıç yollarına ayrılır.</p>
            </article>
            <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-xs text-slate-200">
              <p className="font-semibold text-emerald-100">CTA</p>
              <p className="mt-1">Kayıt sonrası profil adımlarını tamamlayın, favori/mesaj merkezi ile ilk geri dönüş döngüsünü başlatın.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
