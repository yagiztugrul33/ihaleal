import { BookOpen } from "lucide-react";
import { GLOSSARY_TERMS } from "@/data/glossaryTerms";

export default function GlossaryPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-start gap-3">
          <div className="rounded-xl bg-teal-500/15 p-3 text-teal-400">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Emlak sözlüğü</h1>
            <p className="mt-2 text-sm text-slate-400">{GLOSSARY_TERMS.length} terim — bilgilendirme amaçlıdır.</p>
          </div>
        </div>
        <div className="space-y-2">
          {GLOSSARY_TERMS.map((t) => (
            <details
              key={t.term}
              className="group rounded-xl border border-slate-200 bg-slate-900/40 px-4 py-3 open:bg-slate-900/60"
            >
              <summary className="cursor-pointer list-none font-medium text-white marker:content-none [&::-webkit-details-marker]:hidden">
                {t.term}
              </summary>
              <p className="mt-2 border-t border-slate-200/80 pt-3 text-sm leading-relaxed text-slate-400">{t.definition}</p>
            </details>
          ))}
        </div>
        <section className="mt-8 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h2 className="font-semibold text-slate-100">Nedir?</h2>
            <p className="mt-2">Sözlük, platform modüllerinde geçen kavramları tek yorumla açıklayan ortak terminoloji katmanıdır.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h2 className="font-semibold text-slate-100">Neden?</h2>
            <p className="mt-2">Aynı terimin farklı ekiplerde farklı yorumlanması operasyon hatası üretebilir; bu ekran bu riski azaltır.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h2 className="font-semibold text-slate-100">Örnek</h2>
            <p className="mt-2">"Kira çarpanı", "teminat", "ön ekspertiz" gibi terimler ilgili modüllerle uyumlu tanımlanır.</p>
          </article>
        </section>
        <section className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-slate-200">
          <h2 className="font-semibold text-amber-100">Kime göre / dürüst sınır / CTA</h2>
          <p className="mt-2">
            Bu alan onboarding kullanıcıları, yatırımcılar ve operasyon ekipleri için hızlı referans sağlar. Hukuki bağlayıcılık taşımaz;
            terimlerin resmi yorumunda sözleşme ve mevzuat metni esas alınır.
          </p>
          <p className="mt-2">CTA: Kararsız kaldığınız kavramı ilgili modül ekranıyla birlikte okuyup karar notunu dashboard’a taşıyın.</p>
        </section>
        <section className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Hero</h3>
            <p className="mt-2">Emlak sözlüğü, yatırım kararlarında aynı kelimeye aynı anlamı vermek için oluşturulmuş operasyon katmanıdır.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Neden?</h3>
            <p className="mt-2">Terim karmaşası, teklif ve sözleşme adımlarında yanlış yorum riskini artırır; sözlük bu riski düşürür.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Örnek</h3>
            <p className="mt-2">“Likidite” ifadesi borsada işlem derinliği, yatırım modülünde ise nakit dönüş hızını anlatır; yorumlar bağlama göre ayrıştırılır.</p>
          </article>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">İçerik (açıklamalı)</h3>
          <p className="mt-2">
            Sözlük terimleri yalnızca tanım vermez; ilgili modül bağlantısı, örnek kullanım ve karar etkisini de içerir. Böylece kullanıcı,
            bir kavramı okuduktan sonra doğrudan ilgili işlem ekranına geçebilir.
          </p>
          <p className="mt-2">
            Kurumsal ekiplerde bu alan onboarding dokümanı gibi kullanılır: yeni ekip üyesi önce terim setini öğrenir, ardından teklif ve
            sözleşme iş akışına dahil olur. Böylece ekip içi kavram birliği korunur.
          </p>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Kime göre</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Yeni yatırımcı için: temel kavramları hızlıca öğrenme ve hatalı teklif riskini azaltma.</li>
            <li>Deneyimli kullanıcı için: karar öncesi hızlı terim doğrulaması ve iletişim netliği.</li>
            <li>Kurumsal ekip için: ortak eğitim materyali ve süreç standardizasyonu.</li>
          </ul>
        </section>
        <section className="mt-4 rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4 text-xs text-slate-200">
          <h3 className="font-semibold text-cyan-100">CTA</h3>
          <p className="mt-2">
            İşlem öncesi kritik terimleri bu ekrandan doğrulayın; ardından ilgili modül ve belge sayfasında aynı kavramı nasıl uyguladığınızı
            kontrol ederek süreci tamamlayın.
          </p>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Dürüst sınır</h3>
          <p className="mt-2">
            Bu sözlük karar desteği sağlar; hukuki veya finansal bağlayıcılık taşıyan nihai yorumlar sözleşme metinleri ve uzman görüşü ile doğrulanmalıdır.
          </p>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Onboarding ve geri dönüş</h3>
          <p className="mt-2">
            Yeni kullanıcı ilk hafta en çok kullanılan 10 terimle başlar. Geri dönen kullanıcı ise son baktığı terimlerden devam ederek
            öğrenme akışını kesintisiz sürdürebilir.
          </p>
        </section>
        <section className="mt-4 rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4 text-xs text-slate-200">
          <h3 className="font-semibold text-cyan-100">CTA</h3>
          <p className="mt-2">
            İşlem öncesi kritik kavramları bu sözlükte teyit edin, ardından ilgili modüle geçip aynı terimin uygulama karşılığını kontrol edin.
          </p>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Örnek karar akışı</h3>
          <p className="mt-2">
            Kullanıcı önce “amortisman”, “net getiri” ve “likidite” terimlerini bu sayfada kontrol eder; sonra yatırım önerisi modülüne geçip
            aynı terimlerin sayısal karşılığını görerek teklif bandını belirler.
          </p>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Platform modülleri dili</h3>
          <p className="mt-2">
            Sözlükte kullanılan kavram seti borsa, değerleme, sözleşme ve kullanıcı paneliyle aynı terminolojiyi paylaşır; bu uyum
            yatırımcının farklı ekranlarda farklı anlamlarla karşılaşmasını engeller.
          </p>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Hero / Nedir-Neden</h3>
          <p className="mt-2">
            Emlak sözlüğü, platformda geçen kavramları ortak bir zemine oturtarak yatırım kararlarında yorum hatasını azaltmayı hedefler.
          </p>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">İçerik özeti</h3>
          <p className="mt-2">
            Her terim tanım, örnek kullanım, modül bağlantısı ve karar etkisiyle birlikte sunulur; kullanıcı sözlüğü okuduktan sonra doğrudan
            ilgili işlem ekranına geçebilir.
          </p>
        </section>
      </div>
    </div>
  );
}
