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
          <section className="grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Nedir?</p>
              <p className="mt-1">Kayıt ekranı, kullanıcı kimliğini güvenli biçimde başlatan ve rol bazlı çalışma alanını tanımlayan giriş katmanıdır.</p>
              <p className="mt-1">Form tamamlandığında kullanıcı tipi işaretlenerek panel önerileri otomatik hazırlanır.</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">Neden?</p>
              <p className="mt-1">Eksik veya dağınık onboarding, ilk haftada kullanıcı kaybını artırır; bu ekran ilk değer temasını standardize eder.</p>
              <p className="mt-1">Amaç, kayıt sonrası kullanıcıyı boş ekrana değil anlamlı aksiyonlara taşımaktır.</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">İçerik</p>
              <p className="mt-1">Profil bilgisi, KVKK onayı, rol başlangıcı ve ilk görev kartı tek omurgada ilerler.</p>
              <p className="mt-1">Bu yaklaşım, bireysel ve kurumsal kullanıcıların aynı dilde ilerlemesini sağlar.</p>
            </article>
          </section>
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Örnek senaryo</h3>
            <p className="mt-2">
              Yeni kayıt olan bir yatırımcıya ilk gün "favori portföy oluştur", "piyasa raporu incele", "ilk teklif simülasyonu yap" kartları açılır.
              Emlak danışmanı kaydında ise "portföy yükle", "müşteri eşleştir", "teklif akışı başlat" kartları öne çıkar.
            </p>
            <p className="mt-2">
              Böylece farklı roller aynı kayıt deneyiminden geçse de ilk hafta aksiyonları farklılaştırılır ve panel geri dönüş oranı yükseltilir.
            </p>
          </section>
          <section className="grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <h3 className="font-semibold text-slate-100">Kime göre</h3>
              <p className="mt-2">
                Bireysel kullanıcı için hız ve netlik, kurumsal ekip için süreç izlenebilirliği öne çıkar. Bu yüzden kayıt metinleri sade,
                aksiyon kartları ise rol bazlı detaylıdır.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <h3 className="font-semibold text-slate-100">Onboarding + geri dönüş</h3>
              <p className="mt-2">
                İlk 24 saatte tamamlanmayan adımlar bildirim merkezine düşer; kullanıcı ikinci girişte doğrudan yarım adıma yönlendirilir.
              </p>
              <p className="mt-1">
                Bu döngü, kayıt sonrası terk oranını azaltmak için tasarlanır.
              </p>
            </article>
          </section>
          <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-slate-200">
            <h3 className="font-semibold text-amber-100">Dürüst sınır</h3>
            <p className="mt-2">
              Kayıt adımı hesap açılışı sağlar; tek başına finansal uygunluk, kimlik teyidi ve sözleşmesel bağlayıcılık üretmez.
            </p>
          </section>
          <section className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-xs text-slate-200">
            <h3 className="font-semibold text-emerald-100">CTA</h3>
            <p className="mt-2">
              Kayıt sonrası profilinizi tamamlayın, bildirim eşiklerini açın ve ilk dashboard görevini aynı oturumda tamamlayın.
            </p>
          </section>
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Platform modülleri dili</h3>
            <p className="mt-2">Kayıt sonrası açılan tüm kartlar aynı dilde ilerler: nedir, neden, örnek, kime göre, dürüst sınır, CTA.</p>
            <p className="mt-1">Bu yapı kullanıcıyı dağınık metinlerden korur ve ilk hafta öğrenme eğrisini düşürür.</p>
          </section>
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Kısa operasyon notu</h3>
            <p className="mt-2">
              Kayıt tamamlandığında kullanıcıya rol bazlı ilk üç görev atanır ve bildirim merkezi üzerinden geri dönüş döngüsü başlatılır.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
