import { useState } from "react";
import { ChevronDown } from "lucide-react";

const SORULAR = [
  {
    soru: "ihaleal.com nedir?",
    cevap:
      "Yapay zeka destekli akıllı gayrimenkul ihale platformudur. Açık artırma, hemen al ve özel teklif yöntemleri sunar.",
  },
  {
    soru: "Demo modu ne demek?",
    cevap:
      "Şu anda site demo modundadır. Gerçek ödeme alınmamakta, ihaleler test amaçlıdır. Şirketleşme tamamlandıktan sonra gerçek işlem alınacaktır.",
  },
  { soru: "Nasıl üye olurum?", cevap: "Üst menüden 'Kayıt Ol' butonuna tıklayarak e-posta ve şifre ile kayıt oluşturabilirsiniz." },
  {
    soru: "Teklif nasıl veririm?",
    cevap: "Önce kayıt olup giriş yapın. İhale detayında teklif tutarınızı girip 'Teklif Ver' butonuna basın.",
  },
  {
    soru: "Hemen Al nasıl çalışır?",
    cevap: "Bazı ihalelerde satıcı 'Hemen Al' fiyatı belirler. Bu fiyatı ödediğinizde ihale anında size kalır.",
  },
  {
    soru: "Komisyon ne kadar?",
    cevap: "Komisyon oranları şirketleşme sonrası ilan edilecektir. Demo modunda komisyon yoktur.",
  },
  {
    soru: "Şifremi unuttum?",
    cevap: "Giriş sayfasındaki 'Şifremi Unuttum' linkine tıklayın, e-postanızı girin. Sıfırlama linki gelecek.",
  },
  {
    soru: "Hesabımı silmek istiyorum?",
    cevap: "destek@ihaleal.com adresine e-posta ile silme talebi gönderin.",
  },
  {
    soru: "Teknik sorun var?",
    cevap: "destek@ihaleal.com adresine sorunu yazın, ekran görüntüsü ekleyin.",
  },
  {
    soru: "Mobil uygulama var mı?",
    cevap: "Şu anda mobil uygulama yok ancak site mobil uyumludur ve PWA olarak telefonunuza ekleyebilirsiniz.",
  },
];

export default function SSS() {
  const [acik, setAcik] = useState<number | null>(0);
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Sıkça Sorulan Sorular</h1>
      <div className="space-y-3">
        {SORULAR.map((item, idx) => (
          <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setAcik(acik === idx ? null : idx)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <span className="font-medium">{item.soru}</span>
              <ChevronDown className={`h-5 w-5 transition-transform ${acik === idx ? "rotate-180" : ""}`} />
            </button>
            {acik === idx && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                {item.cevap}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
