import { useNavigate } from "react-router-dom";
import { ArrowLeft, Cookie, Shield, Eye, ToggleLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CookiePolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 mb-6 text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Cookie className="w-8 h-8 text-amber-400" />
            Çerez Politikası
          </h1>
          <p className="text-slate-400 mt-2">Çerez kullanımı ve tercih yönetimi</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">Çerez Nedir?</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır. Oturum yönetimi, güvenlik, kişiselleştirme ve analitik amaçlarla kullanılırlar.
            </p>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">Kullandığımız Çerezler</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <h4 className="font-semibold text-emerald-400 flex items-center gap-2"><Shield className="w-4 h-4" /> Zorunlu Çerezler</h4>
                <p className="text-sm text-slate-400 mt-1">Oturum yönetimi, güvenlik, bot koruması. Bu çerezler devre dışı bırakılamaz.</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <h4 className="font-semibold text-blue-400 flex items-center gap-2"><Eye className="w-4 h-4" /> Analitik Çerezler</h4>
                <p className="text-sm text-slate-400 mt-1">Site kullanım istatistikleri, ziyaretçi sayıları, sayfa performansı. Google Analytics kullanıyoruz.</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <h4 className="font-semibold text-purple-400 flex items-center gap-2"><ToggleLeft className="w-4 h-4" /> Tercih Çerezleri</h4>
                <p className="text-sm text-slate-400 mt-1">Dil seçimi, tema (karanlık/aydınlık), son görüntülenen ilanlar gibi kişiselleştirme.</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">Çerezleri Nasıl Yönetirsiniz?</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Zorunlu çerezler hariç diğer türleri reddetme hakkına sahipsiniz. Çerezleri engellemeniz durumunda, sitenin bazı özellikleri düzgün çalışmayabilir.
            </p>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">Neden Bu Politika Önemli?</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Çerez yönetimi yalnızca kullanıcı deneyimi için değil, aynı zamanda hesap güvenliği, fraud önleme ve yasal şeffaflık için gereklidir.
              İhale akışında oturum bütünlüğü bozulursa teklif ve sözleşme adımları riske girer. Bu nedenle güvenlik çerezleri varsayılan olarak aktiftir.
            </p>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">Yöntem (Açıklamalı)</h3>
            <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
              <li>Çerezler kategori bazlı sınıflandırılır: zorunlu, analitik, tercih.</li>
              <li>Kullanıcı tercihi saklanır ve bir sonraki ziyarette aynı izin profili uygulanır.</li>
              <li>Zorunlu olmayan çerezler onay olmadan aktif edilmez.</li>
              <li>Politika güncellemelerinde kullanıcıya tekrar bilgilendirme gösterilir.</li>
            </ul>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">Örnek Senaryo</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Kullanıcı analitik çerezleri kapatırsa performans ölçüm scriptleri yüklenmez; ancak oturum güvenliği ve teklif doğrulama
              için gerekli zorunlu çerezler çalışmaya devam eder. Böylece hem gizlilik tercihi korunur hem çekirdek akış bozulmaz.
            </p>
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
              <h3 className="text-sm font-semibold text-cyan-100">Kime Göre</h3>
              <p className="mt-2 text-xs text-slate-200">
                Bireysel kullanıcı için izin yönetimi, kurumsal kullanıcı için denetim izi ve uyum şeffaflığı sağlar.
              </p>
            </article>
            <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <h3 className="text-sm font-semibold text-amber-100">Dürüst Sınır</h3>
              <p className="mt-2 text-xs text-slate-200">
                Bu metin teknik/politika açıklamasıdır; bağlayıcı hukuk görüşü değildir. Nihai sürüm avukat onayı ile yürürlüğe alınır.
              </p>
            </article>
          </div>

          <Card className="bg-emerald-500/10 border-emerald-500/25 p-5">
            <h3 className="text-base font-semibold text-emerald-100 mb-2">CTA</h3>
            <p className="text-sm text-slate-200">
              Çerez tercihlerinizi güncelleyin, gizlilik politikasını inceleyin ve hesap güvenliği için iki adımlı doğrulamayı aktif edin.
            </p>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">Ek Uyum Notları</h3>
            <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
              <li>Çerez politikası güncellendiğinde kullanıcıya bildirim bannerı gösterilir.</li>
              <li>Politika metni sürüm numarası ve tarihçesi kayıt altında tutulur.</li>
              <li>Hukuki revizyonlar tamamlanmadan canlı metin değişikliği yapılmaz.</li>
              <li>Analitik entegrasyonları açık rıza modeline göre düzenlenir.</li>
            </ul>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">Kime Göre</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Bireysel kullanıcı için tercih kontrolü, kurumsal kullanıcı için denetim izi ve hukuk ekibi için açık rıza şeffaflığı sağlar.
              Politika, ürün ve yasal metin güncellemeleriyle eş zamanlı takip edilmelidir.
            </p>
          </Card>
          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">Son Kontrol</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Çerez politikası değişikliğinde kullanıcı onayı, sürüm tarihi ve hukuk onayı birlikte güncellenmelidir.
            </p>
          </Card>
          <p className="text-xs text-slate-500">Politika metni, gizlilik politikası ve KVKK metni ile birlikte değerlendirilmelidir.</p>

          <div className="flex justify-center pt-6">
            <Button onClick={() => navigate(-1)} className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-8">
              Anladım, Geri Dön
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
