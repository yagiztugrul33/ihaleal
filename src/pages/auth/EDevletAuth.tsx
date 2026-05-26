import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type Phase = "intro" | "redirect" | "done";

/** Akış B (ihaleden satış) — e-Devlet yetki MOCK. Gerçek entegrasyon yok (§D-K6/K9). */
export default function EDevletAuth() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");

  useEffect(() => {
    if (phase !== "redirect") return;
    const t = window.setTimeout(() => setPhase("done"), 3000);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" data-demo="true">
      <div className="max-w-md mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 gap-2">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>
        <div className="rounded-2xl border border-slate-200 bg-slate-900/60 p-6 text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-teal-400 mx-auto" />
          <h1 className="text-xl font-bold text-white">e-Devlet yetkisi (DEMO)</h1>
          {phase === "intro" && (
            <>
              <p className="text-sm text-slate-400">
                Gerçek yönlendirme yok. Bu sayfa yalnızca <strong className="text-white">Akış B</strong> (ihaleden satan) için ürün taslağıdır.
              </p>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white" onClick={() => setPhase("redirect")}>
                e-Devlet&apos;e yönlendir (simülasyon)
              </Button>
            </>
          )}
          {phase === "redirect" && (
            <div className="py-6 space-y-3">
              <Loader2 className="w-10 h-10 text-teal-400 animate-spin mx-auto" />
              <p className="text-sm text-slate-300">e-Devlet&apos;e yönlendiriliyorsunuz…</p>
              <p className="text-xs text-slate-500">3 saniye sonra demo onay.</p>
            </div>
          )}
          {phase === "done" && (
            <div className="space-y-3">
              <p className="text-emerald-400 font-semibold">Yetki verildi (DEMO)</p>
              <p className="text-xs text-slate-500">Üretimde imza / vekalet / KEP akışı avukat onaylı olmalıdır.</p>
              <Button variant="outline" className="w-full border-white/15" onClick={() => navigate("/onboarding/akis")}>
                Akış seçimine dön
              </Button>
            </div>
          )}
        </div>

        <section className="grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
            <h2 className="text-xs font-semibold text-cyan-100">Nedir?</h2>
            <p className="mt-2 text-xs text-slate-200">Bu ekran, satış yetkisi doğrulaması için tasarlanan kullanıcı doğrulama adımıdır.</p>
          </article>
          <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <h2 className="text-xs font-semibold text-emerald-100">Yöntem</h2>
            <p className="mt-2 text-xs text-slate-200">Kullanıcı önce bilgilendirilir, sonra yönlendirme-simülasyon ve sonuç adımı çalışır.</p>
          </article>
          <article className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-4">
            <h2 className="text-xs font-semibold text-violet-100">Kime göre</h2>
            <p className="mt-2 text-xs text-slate-200">Özellikle satıcı akışında vekalet/yetki kontrolü gereken kullanıcılar için tasarlanır.</p>
          </article>
        </section>

        <section className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
          <h3 className="text-xs font-semibold text-amber-100">Dürüst sınır + CTA</h3>
          <p className="mt-2 text-xs text-slate-200">
            Bu ekran gerçek kamu entegrasyonu değildir. Canlıda resmi entegrasyon, hukuki metinler ve güvenlik testleri tamamlanmadan
            doğrulama tamamlandı kabul edilmez.
          </p>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-semibold text-slate-100">Kontrol listesi</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-300">
            <li>Kullanıcı bilgilendirme metni gösterildi mi?</li>
            <li>Yönlendirme sonrası onay/ret durumları kayıtlandı mı?</li>
            <li>Başarısız akışta kullanıcı destek kanalına yönlendirildi mi?</li>
            <li>Canlıda hukuki metin ve güvenlik koşulları eşitlendi mi?</li>
          </ul>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-semibold text-slate-100">Adım bazlı kullanıcı deneyimi</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-slate-300">
            <li>Kullanıcı neden bu doğrulamaya yönlendirildiğini açıkça görür.</li>
            <li>Yönlendirme sırasında bekleme ve durum mesajları şeffaf gösterilir.</li>
            <li>Başarılı veya başarısız sonuçta bir sonraki ekran net şekilde belirtilir.</li>
            <li>Tüm adımlar işlem güvenliği ve denetim izi için kayıt altına alınır.</li>
          </ol>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-semibold text-slate-100">Sık sorulanlar</h3>
          <div className="mt-2 space-y-1 text-xs text-slate-300">
            <p>Bu doğrulama neden gerekli? Yetkisiz işlem ve sahte satış riskini azaltmak için.</p>
            <p>Başarısız olursa ne olur? Kullanıcı destek kanalına yönlendirilir ve alternatif akış önerilir.</p>
            <p>Demo ile canlı farkı nedir? Canlıda resmi entegrasyon, imza ve hukuk metinleri zorunludur.</p>
            <p>Hangi kullanıcılar için? Özellikle satıcı ve yetki devri gerektiren rollerde.</p>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-semibold text-slate-100">Kime göre / CTA</h3>
          <p className="mt-2 text-xs text-slate-300">
            Bu ekran, kullanıcı yaşam döngüsünde kimlik ve yetki adımını tamamlar. Doğrulama sonrası onboarding akışına dönüp panel,
            belge ve sözleşme adımlarını sırasıyla kapatın.
          </p>
        </section>
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-semibold text-slate-100">Operasyon ve hukuk notu</h3>
          <p className="mt-2 text-xs text-slate-300">
            Yetki doğrulama kayıtları, sözleşme ve evrak süreçleriyle birlikte saklanmalı; mevzuat değişikliğinde entegrasyon metinleri
            hukuk ekibi tarafından güncellenmelidir.
          </p>
          <p className="mt-2 text-xs text-slate-300">
            Canlı geçişte bu adım için hata senaryoları, geri dönüş yolları ve kullanıcı bilgilendirme metinleri test planına dahil edilmelidir.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-300">
            <li>Başarılı doğrulama sonrası akış yönlendirmesi kontrol edilir.</li>
            <li>Başarısız doğrulamada destek ve tekrar dene adımı görünür olur.</li>
            <li>Yasal metin bağlantıları her sürümde güncel tutulur.</li>
          </ul>
          <p className="mt-2 text-xs text-slate-300">Bu adım, kullanıcı güvenliği ve işlem doğrulanabilirliği için yaşam döngüsünün kritik parçasıdır.</p>
          <p className="mt-2 text-xs text-slate-300">Nihai canlı kullanımda entegrasyon logları denetim ekibiyle periyodik paylaşılmalıdır.</p>
          <p className="mt-2 text-xs text-slate-300">Kullanıcıya açık hata dilinin sade ve yönlendirici olması güven deneyimini artırır.</p>
          <p className="mt-2 text-xs text-slate-300">Doğrulama sonrası kullanıcının hangi ekrana döneceği her zaman net biçimde belirtilmelidir.</p>
          <p className="mt-2 text-xs text-slate-300">Yetki akışı kapanmadan işlem adımı başlatılmamalıdır.</p>
        </section>
      </div>
    </div>
  );
}
