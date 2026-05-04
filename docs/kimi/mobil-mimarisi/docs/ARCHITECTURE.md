# İhaleAL Mobile Mimari Dokümantasyonu

## Bölüm 1: Mimari Kararlar (Fasıl A)

### Teknoloji Yığını (Stack)
- **Framework**: React Native 0.74 + Expo SDK 51
- **Navigasyon**: React Navigation v6 (Stack + Bottom Tabs)
- **State Yönetimi**: Zustand + React Query (TanStack Query)
- **Backend Sync**: tRPC React Query adapter
- **Harita**: react-native-maps + Mapbox (KKA modülü için)
- **OCR**: react-native-vision-camera + mlkit-text-recognition
- **Biometrik**: expo-local-authentication
- **Push**: expo-notifications + Firebase Cloud Messaging
- **WebSocket**: Socket.io-client
- **Deep Link**: expo-linking
- **Ödeme**: react-native-webview (3DS WebView akışı için)

### Güvenlik Katmanı (Security Layer)
- **Root/Jailbreak Tespiti**: expo-device + jail-monkey
- **FLAG_SECURE**: expo-secure-store + Screen capture prevention
- **Certificate Pinning**: SSL pinning via expo-updates
- **Anti-Debug**: __DEV__ koşullu derleme + prod optimizasyonları
- **Keychain/Keystore**: expo-secure-store (iOS Keychain / Android Keystore)
- **Obfuscation**: ProGuard (Android) + SwiftShield (iOS)

## Bölüm 2: API Sözleşmesi

Bakınız: `API_CONTRACT.md` — Tam OpenAPI 3.1 endpoint dokümantasyonu.

## Bölüm 3: Mağaza Risk Listesi

Bakınız: `STORE_REVIEW_RISK.md` — iOS/Android review reddi riskleri ve çözümleri.

## Bölüm 4: Modül Yapısı

```
src/
├── features/
│   ├── buy_it_now/          # Hemen Al 15dk lifecycle
│   ├── kat_karsiligi/       # KKA harita + hak ediş
│   └── wallet_and_net30/    # Emlakçı Net-30 paneli
├── core/
│   └── security/            # Cihaz bağlama, biyometrik, anti-root
└── services/
    ├── ai_engine/           # OCR + Tapu skan + AI skorlama
    ├── payments/            # Tokenize kart + provizyon + 3DS
    ├── realtime/            # WebSocket ihale + anti-snipe
    └── contracts/           # Sözleşme PDF + imza + JSON log
```

Her modül kendi içinde `index.ts`, `README.md`, `[Module]Screen.tsx`, `[Module]Service.ts`, `[Module]Store.ts` ve test dosyalarını barındırır.

## Bölüm 5: Ekran Listesi (Screen Inventory)

### Auth Flow
1. `WelcomeScreen` — Logo + Giriş / Kayıt / Misafir butonları
2. `LoginScreen` — E-posta + Şifre + Biyometrik giriş
3. `RegisterScreen` — Adım adım kayıt (KVKK onayı scroll-to-end)
4. `ForgotPasswordScreen` — SMS/Email reset
5. `KVKKConsentScreen` — 400 madde scroll-to-end + hash log

### Ana Akış
6. `HomeScreen` — Keşfet / Arama / Kategoriler
7. `SearchScreen` — Filtreli arama (fiyat, m2, il, ilçe)
8. `ListingDetailScreen` — İlan detay + AI skor + Hemen Al butonu
9. `CompareScreen` — 2-3 ilan karşılaştırma (radar chart)
10. `MapScreen` — Harita üzerinde ilanlar (clustering)

### İhale Akışı
11. `AuctionListScreen` — Aktif ihaleler + geri sayım
12. `AuctionDetailScreen` — Teklif paneli + son 10 teklif
13. `BidConfirmScreen` — Bloke kontrolü + teklif onay
14. `AuctionResultScreen` — Kazanma / Kaybetme / Uzatma

### Hemen Al (Buy It Now)
15. `BuyNowScreen` — 15dk geri sayım + fiyat kitlenmesi
16. `BuyNowCheckoutScreen` — Adres + ödeme + provizyon kontrolü
17. `BuyNowSuccessScreen` — e-Provision + sipariş numarası

### KKA (Kat Karşılığı Arsa)
18. `KKAEntryScreen` — Giriş formu (m2, emsal, hisse)
19. `KKAMapScreen` — 500m yarıçaplı etki alanı haritası
20. `KKACalculateScreen` — Hak ediş hesaplayıcı + 3 senaryo
21. `KKAContractScreen` — Dinamik KKA sözleşmesi + imza

### Emlakçı Paneli
22. `RealtorDashboardScreen` — Net-30 özet + istatistikler
23. `RealtorListingsScreen` — İlan yönetimi (aktif/pasif)
24. `RealtorInvoiceScreen` — Fatura yükleme + takvim
25. `RealtorEarningsScreen` — Kazanç grafiği + ödeme geçmişi

### Cüzdan & Ödeme
26. `WalletScreen` — Bakiye + kart listesi + bloke tutarları
27. `AddCardScreen` — Kart ekleme (tokenize + 1₺ provizyon)
28. `3DSScreen` — WebView 3DS akışı (İyzico/PayTR/Param)
29. `TransactionHistoryScreen` — Tüm finansal hareketler

### Sözleşme & Profil
30. `ProfileScreen` — Kullanıcı bilgileri + doğrulama
31. `ContractsScreen` — Sözleşme geçmişi + PDF indirme
32. `ContractDetailScreen` — Sözleşme görüntüleme + imza durumu
33. `SettingsScreen` — Bildirim, tema, dil, güvenlik
34. `HelpScreen` — SSS + canlı destek (AI chatbot)

### Toplam: 34 ekran

## Bölüm 6: Derin Bağlantı (Deep Link) Şeması

```
ihaleal://auth/callback          — OAuth/Social login callback
ihaleal://auction/{id}           — İhale detayına yönlendirme
ihaleal://listing/{id}/buy       — Hemen Al başlat
ihaleal://payment/success        — 3DS ödeme başarılı
ihaleal://payment/fail           — 3DS ödeme başarısız
ihaleal://contract/{id}/sign     — Sözleşme imza ekranı
```

## Bölüm 7: Veri Senkronizasyon Stratejisi

- **Online**: React Query + WebSocket realtime
- **Offline-First**: WatermelonDB (SQLite) + Sync primitive
- **Conflict Resolution**: Server-wins + timestamp vector clock
- **Background Sync**: expo-background-fetch (15dk interval)

## Bölüm 8: Performans Hedefleri

| Metric | Target |
|--------|--------|
| App Launch (TTI) | < 2.0s |
| Screen Transition | < 300ms |
| API Response | < 500ms (p95) |
| WebSocket Latency | < 100ms |
| APK Size | < 45MB |
| iOS IPA Size | < 55MB |

## Bölüm 9: Erişilebilirlik (a11y)

- Tüm butonlar minimum 44x44dp
- Renk kontrastı WCAG 2.1 AA
- TalkBack / VoiceOver etiketleri
- Dinamik yazı tipi boyutu desteği

## Bölüm 10: Sürüm Yönetimi

- Semantic Versioning (MAJOR.MINOR.PATCH)
- OTA Updates: expo-updates (kritik olmayan UI değişiklikleri)
- Force Update: API `/api/v1/minimum-version` kontrolü
- A/B Testing: Firebase Remote Config
