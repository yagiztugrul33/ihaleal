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
        <h2>8. Veri Aktarım Disiplini</h2>
        <p>
          Kişisel veriler; ödeme kuruluşu, doğrulama sağlayıcıları ve mevzuat gereği yetkili kurumlarla yalnızca gerekli kapsamda paylaşılır.
          Aktarımın amacı, hukuki sebebi ve veri kategorisi kayıt altına alınır.
        </p>
        <h2>9. İşlem Güvenliği ve Dolandırıcılık Savunması</h2>
        <p>
          Şüpheli işlem, kimlik tutarsızlığı veya teklif manipülasyonu sinyalinde ek doğrulama adımı işletilir. Bu adım, hem kullanıcı
          güvenliğini hem de platform bütünlüğünü korumak için zorunlu olabilir.
        </p>
        <ul>
          <li>Riskli işlemde geçici blokaj ve manuel inceleme uygulanabilir.</li>
          <li>Onay kayıtları ve uyarı logları denetim izi için saklanır.</li>
          <li>İhlal tespitinde ilgili mevzuat doğrultusunda bildirim süreçleri çalıştırılır.</li>
        </ul>
        <h2>10. Kime Göre</h2>
        <p>
          Bireysel kullanıcı için haklarını görünür kılan şeffaf bilgilendirme metni; kurumsal kullanıcı için veri yönetişimi ve sözleşme
          uyumu açısından referans metin; platform ekipleri için operasyonel kontrol listesidir.
        </p>
        <h2>11. Dürüst Sınır</h2>
        <p>
          Bu metin genişletilmiş aydınlatma içeriğidir; bağlayıcı hukuki mütalaa değildir. Nihai metnin yürürlüğü avukat onayı ve
          mevzuat kontrolü sonrası başlatılır.
        </p>
        <h2>12. CTA</h2>
        <p>
          Hak başvurusu, veri erişim/silme talebi veya itiraz başvurusu için kayıtlı iletişim kanalından kimlik doğrulamalı başvuru yapın.
        </p>
        <h2>13. Ek Saklama ve İmha İlkeleri</h2>
        <ul>
          <li>Yasal zorunluluk süresi dolan veriler için periyodik imha planı çalıştırılır.</li>
          <li>Anonimleştirme mümkün olan veri kümelerinde öncelik anonimleştirmeye verilir.</li>
          <li>Silme/anonimleştirme işlemleri denetim kaydıyla belgelenir.</li>
          <li>Yedekleme ortamlarındaki veri saklama süreleri ana sistem politikasıyla uyumlu tutulur.</li>
        </ul>
        <h2>14. Avukat Onayı ve Güncelleme</h2>
        <p>
          Metin, mevzuat değişikliği ve ürün güncellemesine bağlı olarak düzenli aralıklarla revize edilir. Yürürlük versiyonu yalnızca
          hukuk onayı alınmış sürümdür; taslak sürümler bilgilendirme amaçlıdır.
        </p>
        <h2>15. Operasyonel Uyum Kontrolü</h2>
        <ul>
          <li>Her yeni ürün akışında veri kategorisi ve işleme amacı güncellenir.</li>
          <li>Gereksiz veri toplama tespit edilirse alanlar kapatılır veya anonimleştirilir.</li>
          <li>Üçüncü taraf entegrasyonlarında aktarım kapsamı ve hukuki sebep kontrol edilir.</li>
          <li>Kullanıcı talepleri için başvuru-yanıt SLA kayıt altına alınır.</li>
        </ul>
        <h2>16. Kime Göre ve CTA</h2>
        <p>
          Kullanıcılar bu metni haklarını öğrenmek için, kurum ekipleri ise veri yönetişimi standartlarını korumak için referans alır.
          İşlem öncesi bu metin ile KVKK ve gizlilik politikası birlikte okunmalı, tereddüt halinde yazılı açıklama talep edilmelidir.
        </p>
        <h2>17. Son Kontrol Listesi</h2>
        <ul>
          <li>Veri kategorileri güncel ürün akışı ile tutarlı mı?</li>
          <li>Açık rıza gerektiren alanlar ayrı ve net mi?</li>
          <li>Silme/anonimleştirme süreci ölçülebilir mi?</li>
          <li>Hukuk onayı tarihi ve sürüm numarası görünür mü?</li>
        </ul>
        <h2>18. Son Not</h2>
        <p>
          Aydınlatma metni, gizlilik politikası ve KVKK metni arasında çelişki bulunmamalıdır. Çelişki tespit edilirse en güncel hukuk onaylı
          metin esas alınır ve kullanıcıya değişiklik bildirimi yapılır.
        </p>
        <h2>19. CTA</h2>
        <p>
          Veri haklarınızla ilgili taleplerinizi kimlik doğrulama ile iletin; başvuru durumunu destek kanalından takip edin.
        </p>
        <p>Güncel sürüm tarihini ve hukuk onay notunu işlem öncesi mutlaka kontrol edin.</p>
        <p className="text-sm text-gray-500 mt-8">Son güncelleme: 30 Nisan 2026</p>
      </div>
    </div>
  );
}
