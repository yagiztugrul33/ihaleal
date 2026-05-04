# Payments Servisi

## Amaç
Tüm finansal işlemlerin merkezi servisi: kart tokenizasyon, provizyon (1% / 50K), 3DS WebView akışı, ödeme callback işleme ve iade yönetimi. İyzico, PayTR ve Param entegrasyonlarını soyutlar.

## İlgili Fasıl
- Fasıl 4 — Tokenize Kartlar, 1% Provizyon UX, Yetersiz Limit Yönetimi

## Dosya Yapısı

```
payments/
├── README.md
├── index.ts
├── CardTokenization.ts      # Kart → token (doğrudan ödeme sağlayıcıya)
├── ProvisionManager.ts      # Provizyon oluşturma / iptal / capture
├── ThreeDSWebView.ts        # react-native-webview 3DS akışı
├── PaymentCallback.ts       # 3DS return URL handler
├── RefundManager.ts         # İade işlemleri
├── InsufficientLimit.ts     # Yetersiz limit UX (alternatif sunma)
├── providers/
│   ├── IyzicoAdapter.ts
│   ├── PayTRAdapter.ts
│   └── ParamAdapter.ts
└── types.ts
```

## 3DS WebView Akışı

```
[Checkout başlatılır]
      |
      v
[POST /api/v2/buy-it-now/{lockId}/checkout]
      |
      v
[Backend ödeme sağlayıcıdan 3DS URL alır]
      |
      v
[WebView açılır, 3DS URL yüklenir]
      |
      v
[Kullanıcı banka şifresi girer]
      |
      v
[Banka callback: ihaleal://payment/success veya .../fail]
      |
      v
[Deep Link handler → POST /api/v2/buy-it-now/callback]
      |
      v
[Sipariş durumu güncellenir]
```

## Kritik Kurallar

1. **Tokenize Güvenliği:** Kart numarası, CVV, son kullanma hiçbir zaman İhaleAL backend'ine gitmez. Doğrudan İyzico/PayTR/Param JS SDK veya API'sine gönderilir. İhaleAL sadece dönen `cardToken`'ı saklar.
2. **1% Provizyon:** Hemen Al checkout'unda provizyon tutarı = fiyat × 0.01. Minimum provizyon 1.000 ₺, maksimum 100.000 ₺. Bu tutar karta bloke edilir, satış tamamlanınca capture yapılır.
3. **Yetersiz Limit:** Kullanıcının kart limiti provizyonu karşılamazsa:
   a. Alternatif kart önerilir
   b. Banka kartı / kredi kartı seçimi sunulur
   c. "Limit Yükseltme" bağlantısı (banka mobil uygulamasına deep link)
   d. İşlem ertelenir, kilit süresi 10dk uzatılır (tek seferlik)
4. **İade Politikası:**
   - İhale iştirak bedeli (bloke): Kazanamazsa 24 saat içinde otomatik iade
   - Hemen Al provizyonu: Vazgeçilirse 48 saat içinde iade
   - KKA Data Room: Erişim sağlanmazsa (proje iptali) tam iade
5. **Offline Fallback:** Kullanıcı 3DS sırasında internet kesilirse WebView `onError` → "Bağlantı hatası" → Yeniden dene butonu. İşlem otomatik timeout 10dk.

## API Endpoint'leri
- `POST /api/v2/wallet/cards` (tokenize sonrası token saklama)
- `DELETE /api/v2/wallet/cards/{token}`
- `POST /api/v2/auctions/{id}/deposit` (ihale bloke)
- `POST /api/v2/buy-it-now/{lockId}/checkout` (Hemen Al provizyon)
- `POST /api/v2/buy-it-now/callback` (3DS callback)

## Bağımlılıklar
- `features/buy_it_now` — Checkout akışı
- `features/wallet_and_net30` — Kart yönetimi
- `core/security` — Cihaz doğrulama + challenge

## Test Senaryoları
1. Kart tokenize → 1₺ provizyon → 3DS → success → token saklama
2. Yetersiz limit → alternatif kart öneri ekranı
3. 3DS sırasında internet kopması → yeniden deneme
4. İade: Bloke tutarı 24 saat içinde karta iade edilir
