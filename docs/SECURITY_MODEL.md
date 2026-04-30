# Güvenlik ve güven modeli — ihaleal.com

Bu dosya marketing iddiası değil; **repo gerçeği** ile sınırlıdır.

## İstemci (SPA)

- **Supabase anon anahtarı** tarayıcıda görünür — RLS ile satır düzeyinde yetkilendirme tasarımı (`ARCHITECTURE.md`).
- **Service role** yalnızca `.env.local` / CI gizli ortamında; asla `VITE_*` ile paketlenmez.
- Oturumlar **PKCE** ile (`supabase.ts`); üretimde güçlü şifre + 2FA hedefi kullanıcı akışında tanımlanabilir.

## Veritabanı

- **RLS** açık politikalar — yanlış JWT veya politikasız tablolarda **403/401** beklenir; servis rolü yönetim için ayrı tutulur.

## Ödeme ve escrow

- Gerçek tahsilat / bloke hesap / ödeme kuruluşu entegrasyonu **backend veya Edge Functions** ile yapılmalıdır; statik SPA tek başına ödeme güvencesi iddia etmez.

## Yapılacaklar (ürün olgunlaştıkça)

- HttpOnly oturum veya BFF katmanı ile hassas işlemlerin sunucu doğrulaması.
- Rate limit, WAF, güvenlik başlıkları (Vercel / CDN).
- Bağımlılık CVE taraması (`npm audit`) CI’da.

İlgili: [ARCHITECTURE.md](ARCHITECTURE.md), [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md).
