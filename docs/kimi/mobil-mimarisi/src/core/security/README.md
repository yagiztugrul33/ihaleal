# Core Security Modülü

## Amaç
Mobil uygulamanın güvenlik katmanı: Cihaz bağlama, root/jailbreak tespiti, biyometrik doğrulama, anti-debug, sertifika pinning ve ClientLockManager (cihaz kilitleri).

## İlgili Fasıl
- Fasıl 2 — Cihaz Bağlama, Biometrik Intent, Root/Jailbreak, FLAG_SECURE

## Dosya Yapısı

```
core/security/
├── README.md
├── index.ts
├── DeviceBinding.ts         # Cihaz-Kullanıcı bağlama + max 3 cihaz limiti
├── BiometricAuth.ts         # FaceID / TouchID / Fingerprint challenge-response
├── RootDetection.ts         # Jailbreak / Root tespiti (expo-device + jail-monkey)
├── ClientLockManager.ts     # Cihaz kilitleme (şüpheli aktivite → 24s kilitleme)
├── AntiDebug.ts             # __DEV__ kontrolü + debugger tespiti
├── CertificatePinning.ts    # SSL pinning konfigürasyonu
├── SecureStorage.ts         # expo-secure-store wrapper (Keychain/Keystore)
├── AppAttestation.ts        # iOS DeviceCheck / Android SafetyNet
├── SessionManager.ts        # Token lifecycle + refresh + logout cleanup
└── types.ts
```

## Güvenlik Katmanları

| Katman | Fonksiyon | Tetikleyici |
|--------|-----------|-------------|
| 1. Cihaz Bağlama | Cihazı kullanıcı hesabına bağla, max 3 cihaz | İlk login sonrası |
| 2. Biyometrik | Challenge-response ile FaceID/TouchID doğrulama | Hassas işlemler (ödeme, teklif) |
| 3. Root Tespiti | Root/Jailbreak/Emulator tespiti | Uygulama başlangıcı + finansal işlemler |
| 4. Client Lock | Şüpheli aktivite (5 başarısız şifre, saat uyuşmazlığı) → cihaz kilit | Güvenlik ihlali |
| 5. Anti-Debug | Debugger/Frida/Xposed tespiti → uygulama sonlandır | Runtime |
| 6. Sertifika Pinning | Man-in-the-middle saldırı önlemi | Her API çağrısı |

## Biyometrik Challenge-Response Akışı

```
[Client] --(login)--> [Server]
[Client] <--(challenge + challengeId)-- [Server]
[Client] --(biometric sign challenge)--> [Biometric API]
[Client] <--(signature)-- [Biometric API]
[Client] --(challengeId + signature)--> [Server]
[Client] <--(new JWT token)-- [Server]
```

## Client Lock Manager Kuralları

Cihaz aşağıdaki durumlarda 24 saat kilitlenir:
- 5 başarısız şifre denemesi (15dk backoff ile)
- Cihaz saati ile server saati arası fark > 2dk
- Root tespiti + finansal işlem denemesi
- Aynı ihaleye 3sn içinde 3+ teklif (snipe attempt)
- Bilinen emulator fingerprint

Kilit açma: Sadece `POST /api/v2/security/unlock` + e-posta/SMS doğrulama + yönetici onayı.

## API Endpoint'leri
- `POST /api/v2/security/device-bind`
- `POST /api/v2/security/verify-biometric`
- `GET /api/v2/security/challenge`
- `POST /api/v2/security/unlock` (admin onaylı)

## Test Senaryoları
1. 3 cihaz bağlandı, 4. cihaz denemesi → maxDevicesReached
2. Root'lu cihazda login → flagged status, finansal işlem engellenir
3. Biometrik challenge imzası doğru → token yenilenir
4. Saat değiştirme (2dk+) → ClientLockManager tetiklenir
