# ihaleal.com — ilerleme yüzdesi ve tanım

Bu dosya **tahmini** ve iki farklı hedefe göre ayrılır; “tek doğru yüzde” yoktur.

## A) Gezilebilir demo (UI + yasal sayfalar + mock akış)

| Alan | Tamamlanan | Kalan | Not |
|------|------------|-------|-----|
| Rota / sayfa iskeleti | ~85% | ~15% | Eksik özellik veya ince UX |
| Demo veri (localStorage / seed) | ~70% | ~30% | Supabase ile tam senkron değil |
| SEO / meta merkezi | ~65% | ~35% | Sayfa bazlı tam örtüşü hedef değil |
| Yasal / bilgi sayfaları (metin) | ~75% | ~25% | Avukat onayı, güncelleme |
| Görsel / marka varlıkları | ~55% | ~45% | KIMI listesindeki bazı PNG’ler eksik |
| **Ağırlıklı toplam (demo)** | **~72%** | **~28%** | |

## B) Ücretli canlı ürün (ödeme + gerçek KYC + operasyon)

| Alan | Tamamlanan | Kalan | Not |
|------|------------|-------|-----|
| Supabase şema (uzak DB) | ~90% | ~10% | İndeks, gözlem, küçük migration |
| Supabase Auth UI bağlama | ~25% | ~75% | Mock auth ağırlıklı |
| Edge `place_bid` deploy | ~15% | ~85% | Şablon var, prod deploy yok |
| Ödeme / teminat / escrow | ~5% | ~95% | iyzico vb. entegrasyon yok |
| E-posta / SMS operasyon | ~10% | ~90% | Şablon içerik kısmen dokümanda |
| İçerik paketi (30 görev dosyası) | ~30% | ~70% | Repoda `kimi-mega-pack` ≈ 9/30 karşılığı |
| Hukuk onayı (sözleşme / KVKK canlı) | ~20% | ~80% | Taslak metinler |
| **Ağırlıklı toplam (canlı)** | **~32%** | **~68%** | |

## Özet cümle

- **“Siteyi gezip demo göstermek”** hedefi: kabaca **%72 tamam, %28 kaldı**.
- **“Gerçek para ve hukukla canlıya almak”** hedefi: kabaca **%32 tamam, %68 kaldı**.

Son güncelleme: otomatik not — `docs/PROJE_ILERLEME_YUZDE.md` oluşturuldu; rakamlar ürün ekibiyle revize edilmelidir.
