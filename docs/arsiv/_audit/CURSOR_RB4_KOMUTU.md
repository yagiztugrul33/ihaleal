# CURSOR RB4 KOMUTU (Mobile Sertleştirme — M-1/M-3/M-4/M-5/O8)

Aşağıdaki metni Cursor'a tek parça olarak yapıştır:

```text
═══ CURSOR — ihaleal-mobile (feat/mobile-calculators). RB4 TEK TUR: mobil sertleştirme (M-3 → M-1 → M-5 → O8 → M-4). Push YOK. ═══

BAĞLAM (Müfettiş kalan bulgular, kanıtlı):
- M-1: `mobile/src/app/(auth)/biometric.ts` içinde `disableDeviceFallback: false` (strict varyant yok).
- M-3: KVKK consent state-only (`mobile/src/app/(tabs)/profil.tsx`), refresh/back ile sıfırlanıyor.
- M-4: `mobile/features/notifications/pushNotifications.ts` RPC tarafında yalnız network/postgrest `error` kontrolü var; payload `status='error'` parse edilmiyor.
- M-5: background location için ayrı KVKK modal + runtime background permission akışı yok (`profil.tsx` + `locationRadar.ts`).
- O8: push deep link handler `Linking.openURL(...)` kullanıyor; `router.push` ile iç route yönlendirme daha güvenli.

KAPSAM / KISIT:
- SADECE: `mobile/src/app/**` + `mobile/features/**`.
- DOKUNMA: `mobile/shared/**`, `src/**` (web), `supabase/**`.
- d5a81ca donmuş scope-dışı ekranlara yeni özellik ekleme YOK; sadece bu güvenlik düzeltmeleri.
- KVKK mevcut çift-onay mantığını bozma; sadece persist + sertleştirme ekle.
- Sürpriz/risk çıkarsa DUR, o bulguyu atla, diğerine geç; raporda açıkça belirt.

════════════════════════════════════════════════════════════════════════════
SIRA 1 — M-3 (en değerli): KVKK consent SecureStore persist
════════════════════════════════════════════════════════════════════════════
HEDEF DOSYA:
- `mobile/src/app/(tabs)/profil.tsx`

YAPILACAK:
1) Profil ekranındaki 4 consent state'i persist et:
   - `locationIlluminationAccepted`
   - `locationConsentAccepted`
   - `pushIlluminationAccepted`
   - `pushConsentAccepted`
2) Ekran açılışında SecureStore'dan hydrate et, switch değişiminde anında kaydet.
3) Back/refresh sonrası onayların korunmasını sağla.
4) Mevcut davranış bozulmasın (consent yoksa radar/push açılmama kuralı aynı kalsın).

NOT:
- Minimal ve güvenli kal; yeni ekran ekleme.
- Anahtarları net isimlerle tut (örn. `ihaleal_kvkk_location_illumination_v1`).

COMMIT (ayrı):
- `fix(mobile-security): persist KVKK consent toggles in SecureStore`

════════════════════════════════════════════════════════════════════════════
SIRA 2 — M-1: biometric strict variant (yüksek-değer akış)
════════════════════════════════════════════════════════════════════════════
HEDEF DOSYALAR:
- `mobile/src/app/(auth)/biometric.ts`
- Yüksek-değer akış ekranları: en az `mobile/src/app/ihale/[id]/teklif.tsx` ve `mobile/src/app/ihale/[id]/hemen-al.tsx`

YAPILACAK:
1) `authenticateBiometric` fonksiyonuna strict varyant ekle (örn. opsiyonel parametre):
   - strict=false (default): mevcut davranış korunur.
   - strict=true: `disableDeviceFallback: true`.
2) Yüksek-değer submit noktalarında (teklif gönder / hemen al onayı) strict biyometrik kontrol ekle:
   - biometric opt-in açıksa strict doğrulama çalışsın.
   - doğrulama başarısızsa işlem durdurulsun ve kullanıcıya net mesaj verilsin.
3) Biometric opt-in kapalıysa mevcut akış bozulmadan devam etsin.

NOT:
- Yeni ürün akışı icat etme; sadece güvenlik kapısı ekle.

COMMIT (ayrı):
- `fix(mobile-security): add strict biometric gate for high-value actions`

════════════════════════════════════════════════════════════════════════════
SIRA 3 — M-5: background location KVKK modal + runtime bg permission
════════════════════════════════════════════════════════════════════════════
HEDEF DOSYALAR:
- `mobile/src/app/(tabs)/profil.tsx`
- `mobile/features/location/locationRadar.ts`

YAPILACAK:
1) Background location için ayrı KVKK modal/ack ekle (foreground consent'ten ayrı):
   - Kullanıcıya neden/etki açık metinle göster.
   - Kabul etmeden `requestBackgroundPermissionsAsync` çağrılmasın.
2) Runtime background permission çağrısını net adım haline getir:
   - foreground granted + bg consent + modal onayı sonrası background izni iste.
3) Red/deny durumlarında güvenli fallback mesajları göster (çökme yok).

NOT:
- Mevcut radar akışını kırma; sadece bg adımını hukuki/izinli hale getir.

COMMIT (ayrı):
- `fix(mobile-security): add background location consent modal and runtime gate`

════════════════════════════════════════════════════════════════════════════
SIRA 4 — O8: push deep link openURL -> router.push
════════════════════════════════════════════════════════════════════════════
HEDEF DOSYALAR:
- `mobile/features/notifications/pushNotifications.ts`
- `mobile/src/app/(tabs)/profil.tsx` (listener bind noktası)

YAPILACAK:
1) Push response deep-link handling'de `Linking.openURL('ihaleal://...')` yerine app içi route yönlendirmesi kullan:
   - `router.push(...)` veya callback üzerinden push (örn. `bindNotificationDeepLinking((path) => router.push(path))`).
2) Sadece allow-list route'lara yönlendir:
   - örn. `/ilan/[id]`, `/profil` (veya mevcut route karşılıkları).
3) Bilinmeyen payload type/path için no-op + güvenli log/not.

NOT:
- Dış URL açma davranışını azalt; internal navigation güvenli olsun.

COMMIT (ayrı):
- `refactor(mobile-security): route push notification deep links via router.push`

════════════════════════════════════════════════════════════════════════════
SIRA 5 — M-4: push RPC payload status='error' kontrolü
════════════════════════════════════════════════════════════════════════════
HEDEF DOSYA:
- `mobile/features/notifications/pushNotifications.ts`

YAPILACAK:
1) RPC yanıt tipini yalnız `{error}` değil `{data, error}` okuyacak şekilde genişlet.
2) `register_push_token` / `unregister_push_token` dönüşünde payload `status === 'error'` durumunu da hata say.
3) Kullanıcıya dönen metinlerde network error vs payload error ayrımı yap.

NOT:
- API contract kırma; mevcut başarılı akış korunmalı.

COMMIT (ayrı):
- `fix(mobile-security): handle push RPC payload error status`

════════════════════════════════════════════════════════════════════════════
KALİTE KAPISI (her commit öncesi/sonrası kırmızıya düşerse düzelt)
════════════════════════════════════════════════════════════════════════════
`mobile/` içinde çalıştır:
1) `npx tsc --noEmit`
2) `npm run lint`
3) `npx expo export --platform web`

Hepsi YEŞİL olacak.

PUSH:
- YASAK. Push yapma.

RAPOR (tek kapsamlı, iş bitiminde):
- Her bulgu için:
  - dosya:satır
  - önce/sonra ne değişti
  - neden çözüm bu şekilde seçildi
- listing / teklif / hemen-al güvenlik davranışı etkisi
- kalite kanıtı (tsc + lint + expo export)
- commit hash listesi (bulgu bazında)
- working tree temiz mi
- sürpriz/risk ve atlanan adım var mı
```

