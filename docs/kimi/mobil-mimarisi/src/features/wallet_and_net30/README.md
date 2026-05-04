# Wallet & Net-30 (Emlakçı Paneli) Modülü

## Amaç
Emlakçıların (realtor) kazançlarını, fatura yükleme süreçlerini ve Net-30 ödeme takvimlerini yönettiği panel. Ayrıca tüm kullanıcıların cüzdan, kart ve provizyon durumlarını takip ettiği merkezi finansal hub.

## İlgili Fasıl
- Fasıl 8 — Realtor Net-30 Paneli
- Fasıl 4 — Tokenize Kart & Provizyon

## Dosya Yapısı

```
wallet_and_net30/
├── README.md
├── index.ts
├── WalletScreen.tsx             # Bakiye + kartlar + provizyonlar
├── AddCardScreen.tsx            # Kart ekleme + 1₺ doğrulama
├── Card3DSScreen.tsx            # WebView 3DS akışı
├── TransactionHistoryScreen.tsx # Tüm finansal hareketler
├── RealtorDashboardScreen.tsx   # Net-30 özet + istatistikler
├── RealtorInvoiceScreen.tsx     # Fatura yükleme + takvim
├── RealtorEarningsScreen.tsx    # Kazanç grafiği + ödeme geçmişi
├── WalletService.ts             # API (wallet, cards, transactions)
├── RealtorService.ts            # API (dashboard, invoices, payouts)
├── WalletStore.ts               # Zustand store
├── components/
│   ├── BalanceCard.tsx          # Ana bakiye kartı
│   ├── ProvisionList.tsx          # Aktif provizyonlar listesi
│   ├── InvoiceUploader.tsx        # Fotoğraf/PDF seçici
│   └── EarningsChart.tsx        # Aylık kazanç bar/line chart
└── types.ts
```

## Net-30 Ödeme Akışı

```
[Emlakçı satış yapar] --> [Komisyon hesaplanır] --> [Fatura yükleme aşaması]
                                                        |
                                                        v
                                              [Fatura onay/ret]
                                                        |
                                    [Onay] -----------+---------- [Ret]
                                       |                          |
                                       v                          v
                              [Net-30 kuyruğuna girer]    [Düzeltme istenir]
                                       |
                                       v
                              [Ödeme tarihi: 15'i]
                                       |
                                       v
                              [EFT/Havale ile ödeme]
```

## Kritik Kurallar

1. **Tokenize Kart:** Gerçek kart numarası hiçbir zaman backend'e gitmez. Doğrudan İyzico/PayTR/Param tokenize endpoint'ine gider. Dönen `cardToken` saklanır.
2. **1₺ Provizyon Doğrulama:** Yeni kart eklendiğinde 1₺ çekilir, 24 saat içinde iade edilir. Kullanıcı bu akışı onaylamadan kart eklenemez.
3. **Net-30 Fatura Takvimi:** Her ayın 5'ine kadar fatura yüklenmelidir. 5-15 arası onay süreci. 15'inde ödeme. Eksik fatura = ödeme ertelemesi.
4. **Bloke (Provision) Yönetimi:** İhale bloke, KKA Data Room bloke, Hemen Al provizyon — hepsi ayrı track edilir. Kullanıcı hangi bloke için ne kadar ödeme yaptığını tek ekranda görür.
5. **Store Riski:** Cüzdan görünümünde pozitif bakiye hiçbir zaman gösterilmez. Sadece "Bloke Tutarları" ve "İade Bekleyen" alanları olur.

## API Endpoint'leri
- `GET /api/v2/wallet`
- `POST /api/v2/wallet/cards`
- `DELETE /api/v2/wallet/cards/{token}`
- `GET /api/v2/realtor/dashboard`
- `POST /api/v2/realtor/invoices`
- `GET /api/v2/realtor/payouts`

## Bağımlılıklar
- `services/payments` — Tokenize & 3DS
- `features/buy_it_now` — Bloke durumu senkronizasyonu
- `features/kat_karsiligi` — Data Room provizyonu

## Test Senaryoları
1. Kart ekleme → 1₺ provizyon → 3DS → token saklama
2. Net-30 fatura yükleme (PDF) → onay bekleme → ödeme
3. 3 aylık kazanç grafiği render
4. Bloke iadesi sonrası bakiye güncellemesi
