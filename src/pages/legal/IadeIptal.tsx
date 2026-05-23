export default function IadeIptal() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-800 dark:text-amber-200">
        Bu metin taslaktır; yürürlük öncesi hukuki danışman onayı gerekir.
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
        <h2>4. Ayıplı Mülk ve Yanıltıcı İlan Durumu</h2>
        <p>
          Taşınmazın ilan bilgilerinden esaslı şekilde farklı çıkması (ör. metrekare, tapu niteliği, kullanım durumu, resmi takyidat) halinde
          alıcı, durumu belgeleyerek satıcıya ve platforma bildirmelidir. İlgili mevzuat kapsamında:
        </p>
        <ul>
          <li>Ön inceleme için ekspertiz/evrak talep edilebilir.</li>
          <li>Yanıltıcı beyan sabit ise işlem askıya alınabilir veya iptal önerisi verilebilir.</li>
          <li>Tarafların zarar talepleri, genel hukuk hükümleri çerçevesinde ayrıca değerlendirilir.</li>
        </ul>
        <h2>5. Tapu Özgünlüğü ve Belge Doğrulama</h2>
        <p>
          Platform, satıcı tarafından sunulan tapu ve yetki evraklarının doğruluğunu teknik süreçlerle kontrol etmeyi hedefler; ancak resmi
          kurum teyidinin yerine geçmez. Tapu devri öncesinde noter/tapu müdürlüğü ve uzman danışman kontrolü tarafların sorumluluğundadır.
        </p>
        <h2>6. Teminat ve Cayma Cezası İlişkisi</h2>
        <p>
          İhale katılım teminatı, kötü niyetli teklifleri sınırlama amacıyla kurgulanır. İadesi, kesintisi veya mahsup koşulları ilgili ihale
          sayfasında ve sözleşmede belirtilen hükümlere tabidir. Mevzuata aykırı şartlar uygulanamaz.
        </p>
        <h2>7. Demo Modu İstisnası</h2>
        <p>
          Demo modunda gerçekleştirilen işlemler gerçek satış, gerçek devir veya gerçek ödeme sonucu doğurmaz. Demo verilerde iade/iptal
          yalnızca test kaydı düzeyinde ele alınır; hukuki bağlayıcılığı yoktur.
        </p>
        <h2>8. Uyuşmazlık Çözümü ve Başvuru</h2>
        <p>
          Taraflar öncelikle platform destek kanalı üzerinden çözüm arar. Sonuç alınamaması halinde işlem niteliğine göre Tüketici Hakem Heyeti,
          Tüketici Mahkemesi veya genel görevli mahkemelere başvuru mümkündür.
        </p>
        <h2>9. İletişim</h2>
        <p>
          İade/iptal başvuruları için: <strong>destek@ihaleal.com</strong>
        </p>
        <p>
          Başvurularda işlem numarası, ilan kimliği, talep özeti ve varsa destekleyici belge paylaşılması değerlendirme sürecini hızlandırır.
        </p>
        <p className="text-sm text-gray-500 mt-8">Son güncelleme: 30 Nisan 2026</p>
      </div>
    </div>
  );
}
