# ihaleal.com — Final Durum Raporu

**Tarih:** 17.05.2026 22:39:42
**Canlı URL:** https://ihaleal.vercel.app
**Production bundle:** `index-B8quZ-Y0.js`

> SPA testi Playwright ile yapıldı (gerçek React render). Sadece curl HTTP 200 her route için yeterli değildir.

## Canlı Sayfa Testleri

| Grup | Sayfa | HTTP | Durum | Görünen başlık / not |
|------|-------|------|-------|----------------------|
| Ana | `/` | 200 | ✅ OK | Luxury landing — Gayrimenkul ihalelerinin geleceği |
| Pazar | `/ilanlar` | 200 | ⚠️ H1 yok | İlan listesi — Tüm ihaleler — ihaleal.com |
| Pazar | `/ihaleler` | 200 | ✅ OK | Canlı ihaleler — Gerçek piyasa,gerçek fiyat. |
| Pazar | `/harita` | 200 | ✅ OK | Harita + liste — Türkiye Gayrimenkul Haritası |
| Pazar | `/karsilastir` | 200 | ✅ OK | Karşılaştırma — Gayrimenkul Karşılaştırma |
| Pazar | `/degerleme` | 200 | ✅ OK | Değerleme aracı — Ne Kadar Eder? |
| Pazar | `/favoriler` | 200 | ✅ OK | Favoriler — Favorilerim |
| Pazar | `/nasil-calisir` | 200 | ✅ OK | Nasıl çalışır — Gayrimenkul ihale yolculuğu: uçtan uca çerçeve |
| Kurumsal | `/kurumsal` | 200 | ✅ OK | Kurumsal landing — Emlak ofisleri içinmodern operasyon altyapısı. |
| Kurumsal | `/kurumsal/iletisim` | 200 | ✅ OK | İletişim formu — Demo talebi oluşturun |
| Kurumsal | `/kurumsal/dashboard` | 200 | ⚠️ H1 yok | Org panel (auth gerekebilir) — ihaleal.com — Yapay zeka destekli gayrimenkul platformu |
| Intelligence | `/arastirma` | 200 | ✅ OK | Araştırma hub — 500 |
| Intelligence | `/arastirma/war-room` | 200 | ✅ OK | War Room GIS — Stratejik War Room |
| Intelligence | `/arastirma/ges` | 200 | ✅ OK | GES analiz — GES muhendislik analizi |
| Intelligence | `/arastirma/parsel` | 200 | ✅ OK | Parsel istihbarat — Ada parsel istihbarat |
| Intelligence | `/arastirma/yatirim` | 200 | ✅ OK | → hub redirect — 500 |
| KKA | `/kat-karsiligi` | 200 | ✅ OK | Kat karşılığı hub — Kat karşılığı arsa |
| KKA | `/kat-karsiligi/studio` | 200 | ✅ OK | İmar stüdyosu — Ada / parsel ve imar stüdyosu |
| Auth | `/giris` | 200 | ✅ OK | Giriş — Giriş Yap |
| Auth | `/kayit` | 200 | ✅ OK | Kayıt — Kayıt Ol |
| Auth | `/dashboard` | 200 | ✅ OK | Dashboard — Giriş Yap |
| Kurumsal | `/hakkimizda` | 200 | ✅ OK | Hakkımızda — Hakkımızda |
| Kurumsal | `/iletisim` | 200 | ⚠️ H1 yok | İletişim — İletişim — ihaleal.com |
| İçerik | `/blog` | 200 | ✅ OK | Blog — Blog |
| Hukuk | `/kvkk` | 200 | ✅ OK | KVKK — KVKK Aydınlatma Metni |
| Hukuk | `/gizlilik` | 200 | ✅ OK | Gizlilik — Gizlilik Politikası |
| Hukuk | `/sss` | 200 | ✅ OK | SSS — Sıkça Sorulan Sorular |
| Pazar | `/ilan/demo-1` | 200 | ⚠️ H1 yok | Örnek ilan (ID değişebilir) — İlan detayı — ihaleal.com |
| Test | `/foo-bar-yok` | 200 | ✅ NotFound | Bilinmeyen → NotFound beklenir — 404 |

## Özet

- ✅ Başarılı / beklenen: **25**
- ⚠️ Uyarı: **4**
- ❌ Hata: **0**
