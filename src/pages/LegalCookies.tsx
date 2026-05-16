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
