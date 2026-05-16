import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Trash2, Cookie, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 mb-6 text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            Gizlilik Politikası
          </h1>
          <p className="text-slate-400 mt-2">ihaleal.com gizlilik taahhüdü</p>
          <p className="text-xs text-slate-600 mt-1">Son güncelleme: 01.01.2025</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">1. Taahhüdümüz</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              ihaleal.com olarak, kullanıcılarımızın gizliliğini en üst düzeyde korumayı taahhüt ediyoruz. Platformumuz üzerindeki tüm kişisel ve finansal veriler banka seviyesinde şifreleme (AES-256, SSL/TLS) ile korunmaktadır. Verileriniz asla izniniz olmadan üçüncü taraflarla pazarlama amacıyla paylaşılmayacaktır.
            </p>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">2. Topladığımız Veriler</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-400">
              <div>
                <h4 className="font-semibold text-white mb-2">Hesap Verileri</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Ad, soyad, T.C. kimlik numarası</li>
                  <li>E-posta adresi, telefon numarası</li>
                  <li>Profil fotoğrafı (isteğe bağlı)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Finansal Veriler</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Banka hesap bilgileri (maskelenmiş)</li>
                  <li>Ödeme geçmişi ve faturalar</li>
                  <li>Findeks kredi notu (talep üzerine)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">İhale Verileri</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Teklif geçmişi ve tutarları</li>
                  <li>Kazanılan/kaybedilen ihaleler</li>
                  <li>Favori ilanlar</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Teknik Veriler</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>IP adresi, tarayıcı bilgisi</li>
                  <li>Cihaz bilgileri, konum (yaklaşık)</li>
                  <li>Çerez verileri</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">3. Veri Güvenliği</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Verilerinizin güvenliği için aşağıdaki önlemleri uygulamaktayız:
            </p>
            <ul className="mt-2 space-y-2 text-sm text-slate-400 list-disc list-inside">
              <li>SSL/TLS şifrelemesi ile tüm veri iletimi</li>
              <li>AES-256 veritabanı şifrelemesi</li>
              <li>İki faktörlü kimlik doğrulama (2FA) desteği</li>
              <li>reCAPTCHA bot koruma</li>
              <li>Düzenli güvenlik denetimleri ve penetrasyon testleri</li>
              <li>Veri ihlali durumunda 72 saat içinde bilgilendirme</li>
            </ul>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">4. Çerez Kullanımı</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Platformumuz, kullanıcı deneyimini iyileştirmek ve güvenliği artırmak amacıyla çerezler kullanmaktadır. Kullandığımız çerez türleri:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-400 list-disc list-inside">
              <li><strong className="text-white">Zorunlu Çerezler:</strong> Oturum yönetimi, güvenlik, anti-bot koruması</li>
              <li><strong className="text-white">Analitik Çerezler:</strong> Google Analytics ile site kullanım istatistikleri</li>
              <li><strong className="text-white">Tercih Çerezleri:</strong> Dil seçimi, tema tercihi, son görüntülenen ilanlar</li>
            </ul>
            <p className="text-sm text-slate-400 mt-3">
              Çerez ayarlarınızı tarayıcı ayarlarından yönetebilirsiniz. Zorunlu çerezler hariç diğerlerini reddedebilirsiniz.
            </p>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">5. Veri Silme</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hesabınızı silmek istediğinizde, tüm kişisel verileriniz 30 gün içinde sistemden kalıcı olarak silinir. Ancak yasal yükümlülüklerimiz nedeniyle bazı kayıtlar (ihale geçmişi, ödeme kayıtları) yasal süreler boyunca saklanabilir. Detaylı bilgi için <a href="mailto:kvkk@ihaleal.com" className="text-blue-400">kvkk@ihaleal.com</a> adresine başvurabilirsiniz.
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
