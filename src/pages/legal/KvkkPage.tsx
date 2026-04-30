export default function KvkkPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-800 dark:text-amber-200">
        Bu metin taslak niteliğindedir. Yasal yayın öncesi avukat onayı şarttır.
      </div>
      <h1 className="text-3xl font-bold mb-6">KVKK Aydınlatma Metni</h1>
      <div className="prose dark:prose-invert max-w-none">
        <h2>1. Veri Sorumlusu</h2>
        <p>
          ihaleal.com olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu sıfatıyla,
          kişisel verilerinizin güvenliğini sağlamak ve mahremiyetinizi korumak en önemli önceliklerimizdendir.
        </p>
        <h2>2. Toplanan Kişisel Veriler</h2>
        <ul>
          <li>Kimlik bilgileri (ad, soyad, T.C. kimlik numarası)</li>
          <li>İletişim bilgileri (e-posta, telefon, adres)</li>
          <li>Finansal bilgiler (banka hesap, ödeme bilgileri — şirket açılınca)</li>
          <li>İşlem güvenliği bilgileri (IP adresi, cihaz bilgisi, log kayıtları)</li>
          <li>Müşteri işlem bilgileri (teklif geçmişi, satın alma geçmişi)</li>
        </ul>
        <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
        <ul>
          <li>Üyelik ve kullanıcı hesabı oluşturulması</li>
          <li>İhale ve satın alma süreçlerinin yürütülmesi</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          <li>Hizmet kalitesinin iyileştirilmesi</li>
          <li>Bilgilendirme ve pazarlama faaliyetleri (onay verilmesi halinde)</li>
        </ul>
        <h2>4. Kişisel Verilerin Aktarılması</h2>
        <p>
          Kişisel verileriniz, yasal zorunluluklar dışında üçüncü kişilerle paylaşılmaz. Yetkili kamu kurumları, ödeme aracılık
          kuruluşları ve hizmet sağlayıcıları (Supabase, Vercel) ile sınırlı olarak paylaşılabilir.
        </p>
        <h2>5. Saklanma Süresi</h2>
        <p>
          Kişisel verileriniz, ilgili mevzuatta öngörülen süreler boyunca saklanır. Üyelik sona erdikten sonra yasal saklama süresi
          dolduğunda silinir veya anonimleştirilir.
        </p>
        <h2>6. Haklarınız</h2>
        <p>KVKK 11. madde kapsamında aşağıdaki haklara sahipsiniz:</p>
        <ul>
          <li>İşlenip işlenmediğini öğrenme</li>
          <li>Bilgi talep etme</li>
          <li>Amacını ve uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Aktarılan üçüncü kişileri bilme</li>
          <li>Düzeltme/silme isteme</li>
          <li>Otomatik analize itiraz etme</li>
          <li>Zarar tazmini talep etme</li>
        </ul>
        <h2>7. İletişim</h2>
        <p>
          Haklarınızı kullanmak için <strong>kvkk@ihaleal.com</strong> adresine e-posta gönderebilirsiniz.
        </p>
        <p className="text-sm text-gray-500 mt-8">Son güncelleme: 30 Nisan 2026</p>
      </div>
    </div>
  );
}
