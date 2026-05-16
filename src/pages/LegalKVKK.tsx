import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, FileText, CheckCircle, AlertTriangle, Clock, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function KVKK() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 mb-6 text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            KVKK Aydınlatma Metni
          </h1>
          <p className="text-slate-400 mt-2">Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme</p>
          <p className="text-xs text-slate-600 mt-1">Son güncelleme: 01.01.2025</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">1. Veri Sorumlusu</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              İhaleal.com olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verilerinizin işlenmesi, saklanması ve korunması konusunda veri sorumlusu sıfatıyla hareket etmekteyiz. Şirketimizin iletişim bilgileri:
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" /> İstanbul, Türkiye</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400" /> kvkk@ihaleal.com</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-400" /> +90 212 123 45 67</div>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">2. İşlenen Kişisel Veriler</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Platformumuz üzerinden topladığımız kişisel veriler şunlardır:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-400 list-disc list-inside">
              <li>Kimlik bilgileri (ad, soyad, T.C. kimlik numarası)</li>
              <li>İletişim bilgileri (e-posta, telefon, adres)</li>
              <li>Finansal bilgiler (banka hesap bilgileri, ödeme kayıtları)</li>
              <li>İhale aktivite kayıtları (teklif geçmişi, ihale katılımları)</li>
              <li>IP adresi, cihaz bilgileri, çerez verileri</li>
              <li>Findeks kredi notu ve finansal geçmiş (talep etmeniz halinde)</li>
            </ul>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">3. Veri İşleme Amaçları</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-400 list-disc list-inside">
              <li>İhale platformu hizmetlerinin sunulması</li>
              <li>Kullanıcı doğrulama ve güvenlik kontrolleri</li>
              <li>Tekliflerin ve ödemelerin yönetimi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Pazarlama ve kampanya bildirimleri (izin vermeniz halinde)</li>
              <li>Dolandırıcılık ve kara para aklamaya karşı önlemler (AML/KYC)</li>
            </ul>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">4. Veri Aktarımı</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Kişisel verileriniz, yalnızca aşağıdaki durumlarda üçüncü taraflarla paylaşılabilir:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-400 list-disc list-inside">
              <li>Yasal mercilerin talebi üzerine (mahkeme, savcılık vb.)</li>
              <li>Findeks, Merkezi Kayıt Kuruluşu (MKK) gibi finansal kuruluşlar (sadece gerekli durumlarda)</li>
              <li>Bankalar (ödeme işlemleri için)</li>
              <li>SMS/e-posta servis sağlayıcıları (doğrulama kodları için)</li>
            </ul>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">5. Haklarınız</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              KVKK kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-400 list-disc list-inside">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileriniz düzeltilmesini, silinmesini veya yok edilmesini talep etme</li>
              <li>İşlenen verilerinizin aktarıldığı üçüncü kişileri öğrenme</li>
              <li>Veri işlemeye itiraz etme</li>
              <li>Veri kaybına uğraması halinde zararın giderilmesini talep etme</li>
            </ul>
            <p className="text-sm text-slate-400 mt-3">
              Haklarınızı kullanmak için <a href="mailto:kvkk@ihaleal.com" className="text-blue-400">kvkk@ihaleal.com</a> adresine başvurabilirsiniz.
            </p>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3">6. Veri Saklama Süresi</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Kişisel verileriniz, hesabınız aktif olduğu sürece ve yasal yükümlülüklerimizin gerektirdiği süre boyunca saklanır. Hesabınızı sildiğinizde, verileriniz 30 gün içinde sistemden kaldırılır. Ancak yasal mercilerin talep ettiği kayıtlar yasal süreler boyunca saklanabilir.
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
