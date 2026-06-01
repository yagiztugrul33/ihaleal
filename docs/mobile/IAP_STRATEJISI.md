# IAP (In-App Purchase) Stratejisi — ihaleal

⚠️ **Master + hukuk + mali müşavir kararı bekliyor.** Bu doküman mevcut Apple/Google
kurallarını özetler; final karar **avukat onayı + danışman görüşü** ile alınmalı.

## 1. Apple App Store IAP Kuralları (App Store Review 3.1.1)

Apple, **dijital içerik + dijital abonelik** için kendi IAP sistemini ZORUNLU tutar
(komisyon **%15 küçük dev** / **%30 büyük dev**). Harici ödeme (iyzico/PayTR)
DİJİTAL içerikte **RED sebebi**dir.

**MUAFİYET — Apple muaf tutar:**
- ✅ **Fiziksel mal/hizmet** (Ev satış, emlak komisyonu, taşıma, otel rezervasyonu, vb.)
- ✅ **Reader apps** (Kindle vb. — dışarıda satın alınan içerik gösterir)
- ✅ **B2B/Enterprise** (kurumsal abonelik, dış faturalama)
- ❌ **Premium dijital özellik** (ek özellik açma, sınırsız erişim) — IAP ZORUNLU

## 2. Google Play IAP Kuralları (Payments Policy)

Google da Apple'a benzer kurallar koyar ama **2024 sonrası AB DMA** sonucu
**3. parti ödeme** kabul edilir (komisyon %26 → düşer; harici %0 ama AB dışında uyumlu olmalı).

Türkiye için durum:
- Türkiye Rekabet Kurulu Google'a 2024 itibariyle harici ödeme zorunluluğu KOYAR
- iyzico/PayTR ile direkt ödeme YASA UYUMLU
- Ama Google Play storefront'unda görünmek için **Google Play Billing** entegrasyonu ister

## 3. ihaleal — Karmaşık Durum

| Ne satıyoruz? | IAP gerekli mi? | Neden |
|---|---|---|
| Emlak satış komisyonu (%2-3) | **HAYIR** | Fiziksel mülk satım hizmeti — Apple muaf |
| iBuyer nakit teklif | **HAYIR** | Fiziksel mülk alım — Apple muaf |
| Kat karşılığı aracılık | **HAYIR** | Fiziksel inşaat hizmeti — Apple muaf |
| Premium aylık üyelik (₺399) | **EVET (büyük olasılıkla)** | Dijital özellik (Bloomberg terminal + sınırsız rapor) — Apple IAP ister |
| PDF rapor satın alma (₺249-499) | **EVET** | Dijital içerik — Apple IAP ister |
| Doping/Vitrin (ilan görünürlük) | **TARTIŞMALI** | Reklam/promosyon değil mi? Apple'a göre dijital özellik |

## 4. 3 Olası Strateji

### STRATEJİ A: **Hibrit (önerilen — ama karmaşık)**

- Premium üyelik + PDF + Doping → **iOS'ta IAP** (Apple Store kuralı)
- Komisyon + iBuyer + KKA → **mevcut web ödeme** (Apple muafiyet)
- Mobilde **2 ayrı ödeme akışı**:
  1. Dijital ödemeler: iOS Apple IAP / Android Google Play Billing
  2. Fiziksel hizmet: iyzico/PayTR

**Maliyet:**
- Apple IAP komisyon %15-30 (₺399 → bize ~₺280-340 kalır)
- Google Play %26 (KSY veya direct billing seçeneği)
- Web tarafı %0 ek komisyon (iyzico/PayTR ~%1-2 transaction fee)

**UX kuralı (Apple 3.1.3):**
- Mobilde "premium" linkten dışarı çıkarmak → **YASAK** (anti-steering)
- "Daha ucuz fiyat web'de" → **YASAK**
- Web'de hesap açıp sonra mobilde kullanmak → **OK**

### STRATEJİ B: **Apple IAP + Google Billing (her dijital şey için)**

- Tüm dijital satışlar IAP zorunlu
- Web fiyat: ₺399
- iOS fiyat: ₺399 (Apple bizden %30 alır = ₺119)
- Android fiyat: ₺399 (Google %26 = ₺104)
- Bize kalır: web ₺399 / iOS ₺280 / Android ₺295

**Avantaj:** Apple review riski sıfır.
**Dezavantaj:** %30 komisyon ağır.

### STRATEJİ C: **Sadece Web Ödeme + Mobil "view-only"**

- Mobil uygulama satın alma yapMAZ
- Kullanıcı "Premium'a yükselt" derse web'e yönlendirilir
- Apple 3.1.3 izin verir AMA Apple **link veya tıklanabilir buton koymayı YASAK** ediyor
- Sadece **"Web sitemizde abonelik mevcut"** TEXT mesajı koyabilirsin (link YOK)

**Avantaj:** Apple komisyonu yok, kontrol bizde.
**Dezavantaj:** Conversion düşer (kullanıcı web'i bulup açacak).

## 5. ihaleal Önerimiz (Master onayı bekler)

**Aşama 1 (lansman):** STRATEJİ C — sadece web ödeme. Mobil app **read-only borsa terminal +
ilan görüntüleme + ihale katılım** sunar. Premium yükseltme web'de.

**Aşama 2 (büyüme):** STRATEJİ A hibrit — premium IAP entegrasyonu eklenir.

**Hangisi Apple Review geçer:**
- C en güvenli (sadece "sign in" ekranı, no purchase)
- A iyi planlanırsa geçer (Apple "fiziksel hizmet" muafiyetinin iyi belgelenmesi şart)
- B garantili geçer ama %30 komisyon

## 6. Apple Review Eli Hile — "Reader App"

Apple 2022'den itibaren **Reader app** kategorisi tanıdı:
- App = dışarıda satın alınan içeriği gösteriyor
- Premium content link OK (komisyon %0)
- Örnek: Kindle, Spotify (eskiden), Netflix

**ihaleal Reader app kriterleri sağlar mı?**
- ✅ İçerik dışarıda (web) satılıyor
- ✅ Mobile sadece görüntüleme + ihale işlemi
- ❌ "Reader" tanımı: kitap/dergi/müzik/video — emlak bilgi platformu sığar mı? Belirsiz.

**Master + avukat danışacak.**

## 7. Mobil Abonelik UX (Apple App Store Review 5.1.1)

Eğer IAP yapacaksak (Strateji A veya B), ekran şart:

```
[Premium Üyelik]

✅ Borsa terminal TAM erişim
✅ Sınırsız PDF rapor
✅ Gerçek kapanış verisi
✅ AI fırsat bildirimi

──── FİYAT ────
Aylık: ₺399/ay (otomatik yenilenir)
Yıllık: ₺3.832/yıl (-%20 indirim)

──── İPTAL ────
Aboneliği iptal etmek için:
- iPhone: Ayarlar → Apple ID → Abonelikler
- Apple her yenilenme öncesi 24 saat önce e-posta gönderir
- iCloud erişimi olmadan iptal yapabilirsiniz

──── ŞARTLAR ────
[Kullanım Koşulları] [Gizlilik Politikası]

[ Aylık Başlat ]   [ Yıllık Başlat ]
```

Apple ŞART:
1. Fiyat, periyot, yenileme bilgisi tek ekranda
2. İptal talimatı aynı ekranda (link değil, **inline text**)
3. Şartlar + gizlilik link ZORUNLU
4. Buton metni: "Başlat" / "Subscribe" / "Continue" — buton metni misleading olmayacak

## 8. Capacitor IAP Entegrasyonu (ileride)

Şu anda kurulu DEĞİL. Strateji A/B karar verilirse:

```bash
npm i @capacitor-community/in-app-purchases
npx cap sync
```

Apple Store Connect + Google Play Console'da product ID'leri tanımla:
- `ihaleal_premium_monthly_399`
- `ihaleal_premium_yearly_3832`
- `ihaleal_emlak_pro_monthly_3500`
- ... (her tier × cycle)

## 9. Master Yapılacaklar

1. **Avukat görüşü:** Apple "fiziksel hizmet" muafiyeti hangi paketler için geçerli?
2. **Mali müşavir görüşü:** Apple/Google komisyon vergi hesabı (KDV beyanı nasıl)
3. **Strateji kararı:** A / B / C — hangisi başlangıçta?
4. **Apple Reviewer'a not:** "ihaleal aracılık komisyon platformudur, fiziksel emlak alım-satım için" demek IAP muafiyeti almayı kolaylaştırır
5. **Fiyat stratejisi:** mobil/web fiyat farkı olur mu (Apple anti-steering YASAĞI sebebiyle)
6. **Lansman strategy:** Mobil olmadan web önce mi, eş zamanlı mı?

— ihaleal IAP stratejisi v1, 2026-06-01
