export default function CerezPolitikasi() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-800 dark:text-amber-200">
        Bu metin taslak niteliğindedir. Yasal yayın öncesi avukat onayı şarttır.
      </div>
      <h1 className="text-3xl font-bold mb-6">Çerez Politikası</h1>
      <div className="prose dark:prose-invert max-w-none">
        <h2>1. Çerez Nedir?</h2>
        <p>
          Çerezler, web sitelerinin tarayıcınızda sakladığı küçük metin dosyalarıdır. Sitenin doğru çalışması ve deneyiminizin
          iyileştirilmesi için kullanılır.
        </p>
        <h2>2. Kullandığımız Çerez Türleri</h2>
        <ul>
          <li>
            <strong>Zorunlu:</strong> Oturum, güvenlik. Devre dışı bırakılamaz.
          </li>
          <li>
            <strong>Performans:</strong> Site kullanımını analiz eder.
          </li>
          <li>
            <strong>İşlevsel:</strong> Tercihlerinizi hatırlar.
          </li>
        </ul>
        <h2>3. Çerez Yönetimi</h2>
        <p>
          Tarayıcı ayarlarınızdan yönetebilir, silebilir veya engelleyebilirsiniz. Zorunlu çerezleri engellerseniz site düzgün
          çalışmayabilir.
        </p>
        <h2>4. Üçüncü Taraf</h2>
        <p>Supabase (kimlik) ve Vercel (hosting) kendi çerezlerini kullanabilir.</p>
        <p className="text-sm text-gray-500 mt-8">Son güncelleme: 30 Nisan 2026</p>
      </div>
    </div>
  );
}
