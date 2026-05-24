import { Link } from "react-router-dom";

export default function AydinlatmaMetni() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-800 dark:text-amber-200">
        Bu metin profesyonel KVKK taslağıdır; yürürlük öncesi hukuki danışman onayı gerekir.
      </div>
      <h1 className="text-3xl font-bold mb-6">Aydınlatma Metni</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p>
          ihaleal.com, 6698 sayılı KVKK kapsamında veri sorumlusu sıfatıyla kişisel verilerinizi işlerken şeffaflık, veri minimizasyonu ve
          güvenlik ilkeleriyle hareket eder.
        </p>
        <h2>1. İşlenen Veri Kategorileri</h2>
        <ul>
          <li>Kimlik ve iletişim verileri (ad-soyad, e-posta, telefon).</li>
          <li>İşlem güvenliği verileri (IP, cihaz bilgisi, oturum logları, onay zaman damgaları).</li>
          <li>Sözleşme ve teklif süreç verileri (işlem adımı, onay kayıtları, maskeleme kayıtları).</li>
        </ul>
        <h2>2. İşleme Amaçları ve Hukuki Sebepler</h2>
        <p>
          Veriler; sözleşmenin kurulması/ifa edilmesi, hukuki yükümlülüklerin yerine getirilmesi, meşru menfaat kapsamında güvenlik/fraud
          önleme ve gerekli hallerde açık rıza temelinde işlenir.
        </p>
        <h2>3. Açık Rıza ve Bilgilendirilmiş Onay</h2>
        <p>
          İşlem öncesi kullanıcıya &quot;okudum, anladım, kabul ediyorum&quot; adımı gösterilir ve onay zaman damgası ile kayıt altına alınır
          (taslak/mock kayıt dahil). Açık rıza gerektiren işleme faaliyetleri ayrı checkbox ile alınır.
        </p>
        <h2>4. Veri Minimizasyonu ve Saklama</h2>
        <p>
          Amaç için gerekli olmayan kişisel veri talep edilmez; saklama süresi dolan kayıtlar mevzuata uygun şekilde silinir, anonimleştirilir
          veya imha edilir. Fazla veri toplama yaklaşımı uygulanmaz.
        </p>
        <h2>5. Üçüncü Tarafa Aktarım ve Reklam Erişimi</h2>
        <p>
          Kullanıcı verileri yalnızca hukuki zorunluluk, sözleşme ifası veya açık rıza halinde aktarılır. Reklam verenler, kullanıcıların
          kişisel veri, teklif veya sözleşme detaylarına erişemez.
        </p>
        <h2>6. Teknik ve İdari Güvenlik Tedbirleri</h2>
        <ul>
          <li>Maskeli kimlik gösterimi ve yetki bazlı erişim kontrolü.</li>
          <li>RLS/rol bazlı veri erişimi (üretim hedefi).</li>
          <li>Şifreleme, loglama ve denetim izi yaklaşımı (taslak politika).</li>
        </ul>
        <h2>7. KVKK Kapsamındaki Haklarınız</h2>
        <p>
          KVKK m.11 kapsamındaki erişim, düzeltme, silme, işleme itiraz ve veri taşınabilirliği taleplerinizi iletebilirsiniz.
        </p>
        <p>
          Detaylı bilgi için{" "}
          <Link to="/kvkk" className="text-blue-600 hover:underline">
            KVKK sayfamızı
          </Link>{" "}
          ziyaret edebilirsiniz.
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Yürürlük öncesi hukuki danışman onayı gerekir; metin &quot;uzman onayı bekliyor&quot; statüsündedir.
        </p>
        <h2>İletişim</h2>
        <p>
          <strong>kvkk@ihaleal.com</strong>
        </p>
        <p className="text-sm text-gray-500 mt-8">Son güncelleme: 30 Nisan 2026</p>
      </div>
    </div>
  );
}
