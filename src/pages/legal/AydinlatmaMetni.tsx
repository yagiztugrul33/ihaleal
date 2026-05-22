import { Link } from "react-router-dom";

export default function AydinlatmaMetni() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-800 dark:text-amber-200">
        Bu metin taslak niteliğindedir — AVUKAT ONAYI BEKLER.
      </div>
      <h1 className="text-3xl font-bold mb-6">Aydınlatma Metni</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p>
          ihaleal.com olarak, 6698 sayılı KVKK kapsamında veri sorumlusu sıfatıyla, kişisel verilerinizi işlerken aydınlatma
          yükümlülüğümüzü yerine getirmek amacıyla bu metni hazırladık.
        </p>
        <p>
          Platform, fiziksel taşınmazlar için gayrimenkul ticaret ve açık artırma hizmeti sunan dijital aracı sistemdir; sermaye piyasası
          kurumu veya SPK&apos;ya tabi yatırım borsası değildir.
        </p>
        <p>
          Platformda yayınlanan skor/sinyal/endeks/değerleme çıktıları genel bilgilendirme amaçlıdır; yatırım, hukuk veya vergi
          tavsiyesi/danışmanlığı değildir.
        </p>
        <p>
          Ödeme ve teminat süreçlerinde platform kendi nezdinde para tutmaz; süreç lisanslı ödeme kuruluşu altyapısı üzerinden yönetilir.
        </p>
        <p>
          Detaylı bilgi için{" "}
          <Link to="/kvkk" className="text-blue-600 hover:underline">
            KVKK sayfamızı
          </Link>{" "}
          ziyaret edebilirsiniz.
        </p>
        <h2>Açık Rıza</h2>
        <p>Kişisel verilerinizin işlenmesine ilişkin açık rızanız, üyelik sırasında alınan onay ile temin edilmektedir.</p>
        <h2>İletişim</h2>
        <p>
          <strong>kvkk@ihaleal.com</strong>
        </p>
        <p className="text-sm text-gray-500 mt-8">Son güncelleme: 30 Nisan 2026</p>
      </div>
    </div>
  );
}
