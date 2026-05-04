# Buy It Now (Hemen Al) Modülü

## Amaç
Mobil uygulamada "Hemen Al" butonuna basıldığında 15 dakikalık fiyat kilitleme lifecycle'ını yönetir. Server-sync, offline retry, race condition handling ve 3DS ödeme akışını birleştirir.

## İlgili Fasıl
- Fasıl 3 — Hemen Al Lifecycle
- Fasıl 4 — 1% Provizyon & 3DS WebView

## Dosya Yapısı

```
buy_it_now/
├── README.md
├── index.ts
├── BuyNowScreen.tsx           # Ana kilitleme ekranı (15dk geri sayım)
├── BuyNowCheckoutScreen.tsx   # Adres + kart seçimi + provizyon kontrolü
├── BuyNowSuccessScreen.tsx    # e-Provision onay + sipariş numarası
├── BuyNowService.ts           # API çağrıları (lock, status, checkout)
├── BuyNowStore.ts             # Zustand store (lock state, countdown sync)
├── BuyNowTimer.ts             # Client-server saat senkronizasyonu
├── hooks/
│   ├── useBuyNowLock.ts       # Kilitleme yönetimi
│   └── useCountdownSync.ts    # Server-sync geri sayım
└── types.ts
```

## Ana State Machine

```
[IDLE] --(lock)--> [LOCKED] --(checkout)--> [CHECKOUT] --(3DS callback)--> [COMPLETED]
                     |                           |
                     |--(cancel)--> [CANCELLED] |--(fail)--> [FAILED] --(retry)--> [CHECKOUT]
                     |                           |
                     |--(expire)--> [EXPIRED]    |--(insufficient funds)--> [PAYMENT_ERROR]
```

## Kritik Kurallar

1. **15dk Kuralı:** Client ve server deadline arasındaki fark max 5 saniye olabilir. Fark büyükse server deadline geçerlidir.
2. **Offline Senaryo:** Kullanıcı offline checkout'a basarsa; açık uygulamada `NetInfo` kontrolü ile engellenir. Background'da kilit süresi dolarsa `BackgroundFetch` ile server'dan status sorgulanır.
3. **Race Condition:** İki cihaz aynı anda aynı ilana Hemen Al basarsa; ilk lock alan kazanır, diğerine `409 CONFLICT` döner.
4. **KKA Subtype:** Eğer ilan KKA ise `isKka=true`, `kkaSubtype` (daire/dükkan/ofis) belirtilir. KKA'da hak ediş hesaplayıcıya yönlendirme gösterilir.

## API Endpoint'leri
- `POST /api/v2/buy-it-now/{listingId}/lock`
- `GET /api/v2/buy-it-now/{lockId}/status`
- `POST /api/v2/buy-it-now/{lockId}/checkout`
- `POST /api/v2/buy-it-now/callback` (3DS return)

## Bağımlılıklar
- `services/payments` — Kart & provizyon
- `core/security` — Cihaz fingerprint
- `services/realtime` — Lock release bildirimi (WebSocket)

## Test Senaryoları
1. Happy path: Lock → Checkout → 3DS Success → e-Provision
2. Kilit süresi dolarsa client-side auto-cleanup
3. Offline checkout attempt → error toast
4. Çift tıklama → tek lock (idempotent)
5. Background kill + relaunch → kilit devam ediyor mu?
