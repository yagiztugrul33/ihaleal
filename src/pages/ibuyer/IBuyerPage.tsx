import { Banknote, RefreshCw } from "lucide-react";
import { SubmissionForm } from "@/components/ibuyer/SubmissionForm";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { useAuth } from "@/contexts/AuthContext";
import { ibuyerSubtitle } from "@/lib/ibuyerHub";
import { ROUTES } from "@/constants/routes";
import { IBUYER_DISCLAIMER, MASTER_INFO_DISCLAIMER } from "@/legal/platformDisclaimers";

export default function IBuyerPage() {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen pt-24 pb-16 text-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            <Banknote className="h-3.5 w-3.5" /> iBuyer
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold">Anında Nakit Teklif</h1>
          <p className="mt-2 text-slate-400 max-w-2xl">{ibuyerSubtitle}</p>
        </div>
        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            { title: "Hızlı", desc: "Başvurunu birkaç dakikada tamamla." },
            { title: "Şeffaf", desc: "Fiyat bandı ve risk notunu birlikte gör." },
            { title: "Kontrollü", desc: "Nihai adım öncesi hukuki doğrulama al." },
          ].map((item) => (
            <article key={item.title} className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200">{item.title}</p>
              <p className="mt-1 text-sm text-slate-200">{item.desc}</p>
            </article>
          ))}
        </section>
        <p className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <RefreshCw className="h-4 w-4" />
          Hukuki risk matrisi ile 72 saat geçerli teklif
        </p>
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100">
          <p>{IBUYER_DISCLAIMER}</p>
          <p className="mt-1">{MASTER_INFO_DISCLAIMER}</p>
        </div>
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-base font-bold text-white">3 adımda anında teklif</h2>
          <ol className="mt-3 space-y-2 text-sm text-slate-300">
            <li><strong className="text-slate-100">1) Bilgileri gir:</strong> Mülk ve iletişim detayını tek formda tamamla.</li>
            <li><strong className="text-slate-100">2) Ön fiyat bandını gör:</strong> Sistem değerleme + risk sinyalini birlikte üretir.</li>
            <li><strong className="text-slate-100">3) Kararı netleştir:</strong> Uygunsa ekspertiz ve sözleşme adımıyla ilerle.</li>
          </ol>
          <p className="mt-3 text-xs text-slate-400">
            Not: Demo çıktıları bilgilendirme amaçlıdır; canlıda nihai fiyat ekspertiz + resmi doğrulama sonrası kesinleşir.
          </p>
        </div>
        <section className="mb-6 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-slate-100">Nedir / neden</h3>
            <p className="mt-2 text-xs text-slate-300">
              iBuyer ekranı, satış kararını uzun pazarlık döngüsü yerine ölçülebilir bir teklif hattına taşımak için tasarlanır.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-slate-100">İçerik (açıklamalı)</h3>
            <p className="mt-2 text-xs text-slate-300">
              Mülk girdisi, fiyat bandı, risk notu, doğrulama adımı ve sözleşme öncesi kontrol tek akışta gösterilir.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-slate-100">Örnek</h3>
            <p className="mt-2 text-xs text-slate-300">
              Acil nakit ihtiyacı olan satıcı, ilk fiyat bandını görüp ekspertiz adımına geçerek zaman kaybını azaltır.
            </p>
          </article>
        </section>
        <section className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-slate-100">Kime göre / dürüst sınır</h3>
          <p className="mt-2 text-xs text-slate-300">
            Bu akış özellikle hızlı likidite isteyen satıcılar ve portföy devir planı yapan kurumsal ekipler içindir. Nihai teklif bağlayıcılığı
            resmi ekspertiz, belge doğrulama ve sözleşme adımı tamamlandığında oluşur.
          </p>
          <p className="mt-2 text-xs text-slate-300">
            Demo veriler karar desteği sunar; üretimde saha incelemesi, hukuki inceleme ve operasyonel onay zorunludur.
          </p>
        </section>
        <section className="mb-6 rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
          <h3 className="text-sm font-semibold text-cyan-100">CTA</h3>
          <p className="mt-2 text-xs text-slate-200">
            Formu tamamlayın, ön teklif bandını alın ve dashboard üzerinden ekspertiz + sözleşme hazırlık adımına geçin.
          </p>
        </section>
        <section className="mb-6 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-slate-100">Hero</h3>
            <p className="mt-2 text-xs text-slate-300">Hızlı nakit teklif yaklaşımı, uzun pazarlık sürecinde bekleme maliyetini düşürmeye odaklanır.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-slate-100">Neden?</h3>
            <p className="mt-2 text-xs text-slate-300">Likidite ihtiyacı olan kullanıcı için hız kritik olduğundan ilk fiyat bandı ve risk notu birlikte gösterilir.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-slate-100">CTA</h3>
            <p className="mt-2 text-xs text-slate-300">Başvuruyu tamamlayın, kısa listeye girin ve iBuyer uzman görüşüyle kapanış planı oluşturun.</p>
          </article>
        </section>
        <section className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-slate-100">Dürüst sınır</h3>
          <p className="mt-2 text-xs text-slate-300">
            Bu ekran hızlı teklif ön değerlendirmesi sağlar; gerçek satın alma kararı resmi ekspertiz ve sözleşme onayı olmadan kesinleşmez.
          </p>
        </section>
        <section className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-slate-100">İçerik (açıklamalı)</h3>
          <p className="mt-2 text-xs text-slate-300">
            Süreç dört basamakta ilerler: başvuru verisi, ön fiyat bandı, risk doğrulaması ve kapanış hazırlığı. Her basamakta kullanıcıya
            bir sonraki adım açıkça gösterilir.
          </p>
          <p className="mt-2 text-xs text-slate-300">
            Kurumsal satıcılar için çoklu portföy değerlendirmesi, bireysel kullanıcılar için tek varlık odaklı hızlı karar ekranı sunulur.
          </p>
        </section>
        <section className="mb-6 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-slate-100">Kime göre</h3>
            <p className="mt-2 text-xs text-slate-300">Likidite ihtiyacı yüksek satıcılar ve hızlı devir planlayan kurumsal ekipler için uygundur.</p>
          </article>
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
            <h3 className="text-sm font-semibold text-cyan-100">CTA</h3>
            <p className="mt-2 text-xs text-slate-200">Başvuruyu tamamlayın, ön teklif bandını doğrulayın ve uzman inceleme adımına geçin.</p>
          </article>
        </section>

        {loading ? (
          <div
            data-testid="ibuyer-loading"
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 animate-pulse space-y-4"
          >
            <div className="h-4 w-1/3 rounded bg-slate-700" />
            <div className="h-10 rounded bg-slate-700" />
            <div className="h-10 rounded bg-slate-700" />
            <div className="h-10 w-1/2 rounded bg-slate-700" />
          </div>
        ) : user ? (
          <SubmissionForm />
        ) : (
          <RequireAuthGate redirectTo={ROUTES.IBUYER} />
        )}
      </section>
    </main>
  );
}
