export default function IadeIptal() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-800 dark:text-amber-200">
        Bu metin profesyonel taslaktır; yürürlük öncesi hukuki danışman onayı gerekir.
      </div>
      <h1 className="text-3xl font-bold mb-6">İade ve İptal Koşulları</h1>
      <div className="prose dark:prose-invert max-w-none">
        <h2>1. Kapsam ve Tanımlar</h2>
        <p>
          Bu metin, ihaleal.com platformunda yürütülen satış, kiralama, kapalı teklif ve açık artırma süreçlerinde iade, iptal, cayma ve
          uyuşmazlık yönetiminin genel çerçevesini düzenleyen taslak açıklamadır. Platform, fiziksel taşınmazlara aracılık eden bir dijital
          hizmettir; sermaye piyasası aracı değildir.
        </p>
        <h2>2. Cayma Hakkının Genel Çerçevesi</h2>
        <p>
          6502 sayılı Kanun kapsamındaki tüketici işlemlerinde cayma hakkı kural olarak 14 gündür. Ancak taşınmazın niteliği, ihale usulü
          satış, kişiye özel sözleşme veya resmi devir işlemi gerektiren durumlarda cayma hakkı mevzuata göre sınırlanabilir ya da
          uygulanmayabilir. Nihai değerlendirme işlem türüne göre yapılır.
        </p>
        <h2>3. İhale ve Kapalı Teklifte İptal Kuralları</h2>
        <ul>
          <li>Bağlayıcı teklif verildiğinde, kullanıcı teklif koşullarını kabul etmiş sayılır.</li>
          <li>İhale kapanışı sonrası tek taraflı iptal talebi, yalnızca hukuken haklı sebep varsa değerlendirilir.</li>
          <li>
            Satıcı veya alıcının sözleşme yükümlülüğünü ihlali halinde, varsa teminat/ceza koşulları ilgili sözleşme ve ihale kurallarına göre
            uygulanır.
          </li>
          <li>Platform, nihai karar merci değildir; taraflar arası uyuşmazlıkta delil ve kayıt desteği sunar.</li>
        </ul>
        <h2>4. Bilgilendirilmiş Onay ve Zaman Damgası</h2>
        <p>
          İşlem öncesi kullanıcıya iade/iptal ve cayma etkisi görünür şekilde gösterilir; kullanıcı &quot;okudum, anladım, kabul ediyorum&quot;
          onayı vermeden süreç ilerlemez. Onaylar zaman damgalı olarak kaydedilir (taslak/mock kayıt).
        </p>
        <h2>5. Ayıplı Mülk ve Yanıltıcı İlan Durumu</h2>
        <p>
          Taşınmazın ilan bilgilerinden esaslı şekilde farklı çıkması (ör. metrekare, tapu niteliği, kullanım durumu, resmi takyidat) halinde
          alıcı, durumu belgeleyerek satıcıya ve platforma bildirmelidir. İlgili mevzuat kapsamında:
        </p>
        <ul>
          <li>Ön inceleme için ekspertiz/evrak talep edilebilir.</li>
          <li>Yanıltıcı beyan sabit ise işlem askıya alınabilir veya iptal önerisi verilebilir.</li>
          <li>Tarafların zarar talepleri, genel hukuk hükümleri çerçevesinde ayrıca değerlendirilir.</li>
        </ul>
        <h2>6. Tapu Özgünlüğü ve Belge Doğrulama</h2>
        <p>
          Platform, satıcı tarafından sunulan tapu ve yetki evraklarının doğruluğunu teknik süreçlerle kontrol etmeyi hedefler; ancak resmi
          kurum teyidinin yerine geçmez. Tapu devri öncesinde noter/tapu müdürlüğü ve uzman danışman kontrolü tarafların sorumluluğundadır.
        </p>
        <h2>7. Teminat ve Cayma Cezası İlişkisi</h2>
        <p>
          İhale katılım teminatı, kötü niyetli teklifleri sınırlama amacıyla kurgulanır. İadesi, kesintisi veya mahsup koşulları ilgili ihale
          sayfasında ve sözleşmede belirtilen hükümlere tabidir. Mevzuata aykırı şartlar uygulanamaz.
        </p>
        <ul>
          <li>İade prensibi: geldiği yoldan geri (aynı kart/aynı IBAN) ve KYC eşleşme kontrolü.</li>
          <li>Kaybeden teminat iadesi hedef penceresi 24-48 saattir; kusursuz işlemde öncelikli değerlendirme uygulanır.</li>
          <li>Mağdur %2 tazminat ödemelerinde gider pusulası/dekont doğrulaması ve doğrulanmış hesap şartı aranır.</li>
          <li>Vergi mükellefi olmayan bireylerde fatura yerine gider pusulası düzenlenir; tazminat kalemi arızi kazanç niteliğiyle değerlendirilir (taslak).</li>
        </ul>
        <h2>8. Gizlilik ve Üçüncü Taraf Erişimi</h2>
        <p>
          İade/iptal başvurularındaki kişisel veriler, sözleşme ve teklif kayıtları yalnızca yetkili ekiplerce görüntülenir. Reklam verenler
          bu kayıtlara erişemez; üçüncü taraf paylaşım yalnızca hukuki zorunluluk veya açık rıza kapsamında yapılır.
        </p>
        <h2>9. Demo Modu İstisnası</h2>
        <p>
          Demo modunda gerçekleştirilen işlemler gerçek satış, gerçek devir veya gerçek ödeme sonucu doğurmaz. Demo verilerde iade/iptal
          yalnızca test kaydı düzeyinde ele alınır; hukuki bağlayıcılığı yoktur.
        </p>
        <h2>10. Uyuşmazlık Çözümü ve Başvuru</h2>
        <p>
          Taraflar öncelikle platform destek kanalı üzerinden çözüm arar. Sonuç alınamaması halinde işlem niteliğine göre Tüketici Hakem Heyeti,
          Tüketici Mahkemesi veya genel görevli mahkemelere başvuru mümkündür.
        </p>
        <h2>11. İletişim</h2>
        <p>
          İade/iptal başvuruları için: <strong>destek@ihaleal.com</strong>
        </p>
        <p>
          Başvurularda işlem numarası, ilan kimliği, talep özeti ve varsa destekleyici belge paylaşılması değerlendirme sürecini hızlandırır.
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Yürürlük öncesi hukuki danışman onayı gerekir; metin &quot;uzman onayı bekliyor&quot; statüsündedir.
        </p>
        <h2>12. Örnek İşlem Akışı</h2>
        <p>
          Örnek senaryoda alıcı, ilan detayında beyan edilen metrekare ile resmi kayıt arasında farklılık tespit eder. Destek kaydı açılır,
          ekspertiz ve belge doğrulama adımı tamamlanır, taraf görüşleri toplanır ve iade/iptal kararı süreç kaydıyla birlikte bildirilir.
        </p>
        <h2>13. Kime Göre?</h2>
        <p>
          Bireysel kullanıcı için bu metin temel hak ve yükümlülük çerçevesini sunar; kurumsal kullanıcı için sözleşme ekleri, teminat
          yönetimi ve denetim izi gerekliliklerini netleştirir.
        </p>
        <h2>14. Dürüst Sınır ve CTA</h2>
        <p>
          Bu sayfa bilgilendirme amaçlı genel çerçevedir; somut uyuşmazlıklarda nihai yorum yetkili hukuk danışmanı ve resmi mercilerdedir.
          İşlem öncesi sözleşme maddelerini ve iade/iptal koşullarını ayrı bir kontrol listesiyle teyit ederek ilerleyin.
        </p>
        <h2>15. Platform Modülleri Dili</h2>
        <p>
          Metin, diğer modüllerle aynı karar şablonunu izler: önce kapsam, sonra gerekçe, ardından örnek durum ve sınır. Böylece kullanıcı
          farklı ekranlarda farklı hukuk diliyle karşılaşmaz ve işlem öncesi doğrulama adımlarını daha net takip eder.
        </p>
        <h2>16. CTA</h2>
        <p>
          İşlem yapmadan önce iade/iptal koşullarını ilgili ilan sayfasındaki kurallarla birlikte okuyun; belirsiz başlıklarda yazılı destek
          kaydı açarak onay izi oluşturun.
        </p>
        <h2>17. Kime Göre</h2>
        <p>
          Bireysel kullanıcı bu metni hak ve yükümlülük özeti olarak kullanır. Kurumsal kullanıcılar için metin; teminat yönetimi,
          süreç sorumluluğu ve denetim izi gerekliliklerinin başlangıç kontrol listesi işlevini görür.
        </p>
        <h2>18. Örnek Operasyon Notu</h2>
        <p>
          İptal talebinde taraflardan gelen belgeler ve zaman damgaları tek dosyada toplanır; değerlendirme sonucu taraflara yazılı
          bildirimle iletilir ve süreç geçmişi saklama politikasına uygun arşivlenir.
        </p>
        <h2>19. Hero / Nedir-Neden</h2>
        <p>
          Bu metin, iade ve iptal süreçlerinde kullanıcıyı belirsizlikten korumak için hazırlanmış operasyonel bir rehberdir. Amaç, işlem
          öncesinde olası riskleri şeffaflaştırmak ve tarafların aynı kurallarda hizalanmasını sağlamaktır.
        </p>
        <h2>20. İçerik Özeti</h2>
        <p>
          Metinde cayma hakkı, ihale iptal koşulları, teminat yönetimi, belge doğrulama, gizlilik ve uyuşmazlık çözümü adımları bütüncül
          bir akışta ele alınır. Böylece kullanıcı hangi durumda hangi kanaldan ilerleyeceğini net biçimde görebilir.
        </p>
        <p>
          CTA: İşleme başlamadan önce bu maddeleri ilan ve sözleşme ekranlarıyla birlikte kontrol ederek yazılı onay izi oluşturun.
        </p>
        <p className="text-sm text-gray-500 mt-8">Son güncelleme: 30 Nisan 2026</p>
      </div>
    </div>
  );
}
