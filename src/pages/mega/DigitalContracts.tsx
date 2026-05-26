import { FileSignature } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CONTRACTS = [
  {
    title: "Ön bilgilendirme / mesafeli hizmet",
    desc: "Üyelik ve platform hizmetine ilişkin özet şartlar; üretimde hukuk onayı.",
    status: "Taslak",
  },
  {
    title: "Teklif ve katılım şartnamesi",
    desc: "İhale turunda bağlayıcı kurallar, teminat ve süre uzatma çizgisi.",
    status: "Taslak",
  },
  {
    title: "Aracılık ve komisyon çerçevesi",
    desc: "Komisyon matrahı, mahsup ve B2B ortak payı faturalama düzeni.",
    status: "Taslak",
  },
  {
    title: "KVKK ve iletişim rızası",
    desc: "Kişisel veri işleme ve bildirim kanalları için çerçeve metni.",
    status: "Taslak",
  },
];

/** E-imza: üretimde zaman damgalı ve saklama politikası ile tamamlanır (demo metin). */
export default function DigitalContractsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-start gap-3">
          <div className="rounded-xl bg-sky-500/15 p-3 text-sky-400">
            <FileSignature className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Dijital sözleşme</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Dört sözleşme tipi için çerçeve (demo). E-imza entegrasyonu üretimde güvenilir zaman damgası ve saklama ile tamamlanır; bağlayıcı hukuki görüş değildir.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {CONTRACTS.map((c) => (
            <Card key={c.title} className="border-slate-200 bg-slate-900/40">
              <CardContent className="space-y-2 p-6">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{c.status}</span>
                <h2 className="text-lg font-semibold text-white">{c.title}</h2>
                <p className="text-sm text-slate-400">{c.desc}</p>
                <p className="text-xs text-slate-600">E-imza akışı demo — gerçek imza yok.</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <section className="mt-6 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h2 className="font-semibold text-slate-100">Nedir?</h2>
            <p className="mt-2">Dijital sözleşme alanı, işlem yaşam döngüsündeki temel metinleri tek akışta görünür kılar.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h2 className="font-semibold text-slate-100">Neden?</h2>
            <p className="mt-2">Tarafların aynı metni ve aynı sürümü görmesi, kapanışta uyum riskini ve iletişim maliyetini azaltır.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h2 className="font-semibold text-slate-100">Örnek</h2>
            <p className="mt-2">Teklif şartnamesi ile komisyon çerçevesi eş zamanlı incelenerek operasyon planı netleştirilir.</p>
          </article>
        </section>
        <section className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-slate-200">
          <h2 className="font-semibold text-amber-100">Kime göre / dürüst sınır / CTA</h2>
          <p className="mt-2">
            Bu ekran yatırımcı, satıcı ve danışman ekipleri için sözleşme hazırlık rehberidir. Taslak metinler bilgilendirme amaçlıdır,
            hukuki bağlayıcılık için avukat onayı ve nihai imza süreci gerekir.
          </p>
          <p className="mt-2">CTA: İlgili taslağı seçin, kontrol listenizi tamamlayın ve resmi sözleşme adımına geçin.</p>
        </section>
        <section className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">İçerik</h3>
            <p className="mt-2">
              Her sözleşme kartı kapsam, risk ve operasyon etkisiyle birlikte okunur. Böylece yalnızca metin değil süreç etkisi de görünür.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Örnek</h3>
            <p className="mt-2">
              Teklif şartnamesinde teminat ve süre maddesi güncellenince komisyon çerçevesi ve ödeme adımları da eş zamanlı gözden geçirilir.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Kime göre</h3>
            <p className="mt-2">
              Bireysel kullanıcı metin özetine odaklanır, kurumsal ekip ise versiyon takibi ve onay zinciri yönetimini önceliklendirir.
            </p>
          </article>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Platform modülleri dili</h3>
          <p className="mt-2">
            Sözleşme içerikleri diğer modüllerle aynı çerçevede sunulur: nedir, neden, kapsam, örnek, sınır ve sonraki aksiyon.
            Bu yapı kullanıcıyı dağınık hukuki metin hissinden çıkarıp operasyon akışına bağlar.
          </p>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">İçerik (açıklamalı)</h3>
          <p className="mt-2">
            Sözleşme tipleri işlem yaşam döngüsündeki sorumluluk paylaşımını netleştirir: hangi adımda kim onay verir, hangi belge zorunludur
            ve hangi durumda süreç durdurulur sorularına standart cevap üretir.
          </p>
          <p className="mt-2">
            Kurumsal kullanıcı için versiyon yönetimi kritik olduğundan, sözleşme kartları farklı revizyonların izlenebileceği şekilde
            tasarlanmıştır. Böylece ekipler güncel metin üzerinden hizalanır.
          </p>
        </section>
        <section className="mt-4 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-slate-200">
            <h3 className="font-semibold text-amber-100">Dürüst sınır</h3>
            <p className="mt-2">
              Bu sayfa sözleşme hazırlık rehberidir; nihai hukuki yorum ve bağlayıcılık yetkili hukuk uzmanı ve resmi imza süreciyle oluşur.
            </p>
          </article>
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4 text-xs text-slate-200">
            <h3 className="font-semibold text-cyan-100">CTA</h3>
            <p className="mt-2">
              İlgili sözleşme kartını seçin, kontrol listenizi tamamlayın ve işlem öncesi taraf sorumluluklarını yazılı doğrulayın.
            </p>
          </article>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Onboarding ve geri dönüş</h3>
          <p className="mt-2">
            Yeni kullanıcı sözleşme tiplerini kısa özetlerle öğrenir; geri dönen kullanıcı son açtığı taslak kartına dönerek revizyon
            adımını kaldığı yerden sürdürebilir.
          </p>
        </section>
      </div>
    </div>
  );
}
