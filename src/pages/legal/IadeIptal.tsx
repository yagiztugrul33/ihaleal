export default function IadeIptal() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-800 dark:text-amber-200">
        Bu metin taslak niteliğindedir. Yasal yayın öncesi avukat onayı şarttır.
      </div>
      <h1 className="text-3xl font-bold mb-6">İade ve İptal Koşulları</h1>
      <div className="prose dark:prose-invert max-w-none">
        <h2>1. Genel</h2>
        <p>
          İhale yöntemiyle satılan ürünlerde, sözleşme tamamlandıktan sonra iade kural olarak mümkün değildir. Ancak ürünün ilanda
          belirtilenden farklı çıkması halinde alıcı, durumu satıcıya bildirir.
        </p>
        <h2>2. Demo Modu</h2>
        <p>Demo modunda gerçek satış olmadığından iade/iptal işlemi yoktur.</p>
        <h2>3. İletişim</h2>
        <p>
          İade/iptal başvuruları için: <strong>destek@ihaleal.com</strong>
        </p>
        <p className="text-sm text-gray-500 mt-8">Son güncelleme: 30 Nisan 2026</p>
      </div>
    </div>
  );
}
