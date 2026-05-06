# ihaleal.com — ilerleme yüzdesi ve tanım

Bu dosya **tahmini** ve iki farklı hedefe göre ayrılır; “tek doğru yüzde” yoktur.

## A) Gezilebilir demo (UI + yasal sayfalar + mock akış)

| Alan | Tamamlanan | Kalan | Not |
|------|------------|-------|-----|
| Rota / sayfa iskeleti | ~97% | ~3% | Hash smoke (`/#/`, yasal, giriş); bilinmeyen landing NotFound |
| Demo veri (localStorage / seed) | ~92% | ~8% | Supabase kapalı mock net; liste yükleme/boş/hata durumları |
| SEO / meta merkezi | ~90% | ~10% | `seoLandings` + kritik `ROUTE_SEO`; canonical/title hizası iyileşti |
| Yasal / bilgi sayfaları (metin) | ~93% | ~7% | `agency_contract.md` + okunabilir görünüm; avukat onayı dışı |
| Görsel / marka varlıkları | ~92% | ~8% | `npm run gen:assets`: OG + PWA ikonları; KIMI PNG’leri ayrı |
| **Ağırlıklı toplam (demo)** | **~97%** | **~3%** | Önceki “~%28 kalan” demo pratikte kapatıldı (ince iş + içerik) |

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

- **“Siteyi gezip demo göstermek”** hedefi: kabaca **%97 tamam, %3 kaldı** (önceki ağırlıklı “~%28 kalan” bandı pratikte kapatıldı).
- **“Gerçek para ve hukukla canlıya almak”** hedefi: kabaca **%32 tamam, %68 kaldı**.

Son güncelleme: **5 Mayıs 2026** — Demo turunda vitrin, yasal sözleşme görünümü, SEO/supabase kenarları, PWA görselleri ve Playwright smoke tamamlandı; kalan pay ince UX ve üçüncü taraf (avukat, ödeme) işleri.
