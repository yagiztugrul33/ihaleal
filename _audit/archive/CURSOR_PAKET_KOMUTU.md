# CURSOR — Mobil Sertleştirme Paketi (7 görev, sıralı tek tur)

**Hedef worktree:** `ihaleal-mobile` (branch `feat/mobile-calculators`, HEAD: `4f3a400`)
**Hazırlayan:** Claude Code (ana worktree main)
**Bağlam:** Müfettiş Turu 2 + sistem röntgenli (SISTEM_ROENTGENI.md) kalan bulgular. Adım 4 + 6a tamam (mobile UI gerçek RPC + K-M1/K-M2 fix). Bu paket **mobile sertleştirme + UX olgunlaştırma** turu.

---

## ⚠️ AŞAĞIDAKİ TÜM METNİ CURSOR'A YAPIŞTIR

---

```text
═══ CURSOR — ihaleal-mobile (feat/mobile-calculators). MOBIL SERTLEŞTİRME PAKETİ (7 görev). Çekirdek/supabase/web'e dokunma. Push YOK. ═══

GENEL KAPSAM:
- Yalnız çalışılacak alanlar: mobile/src/app/**, mobile/features/**, mobile/app.json
- DOKUNMA: mobile/shared/** (facade'lar — Adım 2 tamam), src/** (web), supabase/** (RPC'ler)
- d5a81ca donmuş scope-dışı ekranlara (borsa-detay altları vb.) EKLEME YAPMA
- Çekirdek/para/KYC mantığa dokunma — yalnız sertleştirme + UI + config

HER GÖREV BAĞIMSIZ:
- Her görev için AYRI commit (audit izi temiz)
- Bir görevde risk/sürpriz/büyük iş çıkarsa O GÖREVİ ATLA, raporla, diğerine geç (paket durmasın)
- Her görev sonrası kalite kapısı (tsc + lint + expo export) YEŞİL — fail ederse o görevi geri al, raporla

KALİTE KAPISI (her görev sonrası):
1. npx tsc --noEmit  (mobile/ içinde)
2. npm run lint      (mobile/ içinde)
3. npx expo export --platform web  (mobile/ içinde)
Hepsi PASS olacak. KVKK çift-onay akışı korunsun. Accessibility label/role korunsun.

═══════════════════════════════════════════════════════════════════════════
GÖREV 1 (M-3) — KVKK consent SecureStore persist
═══════════════════════════════════════════════════════════════════════════

SORUN: Consent şu an useState(false) ile başlıyor — sayfa yenilenince veya geri butonu ile sıfırlanıyor. Kullanıcı her seferinde yeniden onaylamak zorunda. KVKK semantiğine aykırı (rıza geri çekilmedikçe geçerli).

ETKİLENEN EKRANLAR (önceki keşif):
- mobile/src/app/(tabs)/profil.tsx → locationIlluminationAccepted + locationConsentAccepted + pushIlluminationAccepted + pushConsentAccepted (4 ayrı consent)
- mobile/src/app/analiz/tapu/index.tsx → tapu KVKK consent
- mobile/src/app/analiz/ilan/index.tsx → ilan KVKK consent
- mobile/src/app/ihale/[id]/teklif.tsx → teklif KVKK consent
- mobile/src/app/ihale/[id]/hemen-al.tsx → hemen-al KVKK consent
- mobile/src/app/uluslararasi/index.tsx → uluslararası lead KVKK consent
- mobile/src/app/moduller/deprem/index.tsx → deprem KVKK consent

YAPILACAK:
1. mobile/src/app/(auth)/consentStore.ts (YENİ, küçük helper) oluştur:
   - import * as SecureStore from 'expo-secure-store'
   - Anahtar prefix: 'ihaleal_consent_'
   - getConsent(key: string): Promise<boolean>
   - setConsent(key: string, value: boolean): Promise<void>
   - clearConsent(key: string): Promise<void>
   - useSecureConsent(key: string): React hook — initial state'i SecureStore'dan okur, set olunca SecureStore'a yazar
2. Etkilenen 7 ekranda mevcut useState(false) → useSecureConsent('<key>')
   Anahtar isimleri (öneri, sen düzenle):
     'location' / 'location_illumination'
     'push' / 'push_illumination'
     'tapu_kvkk'
     'ilan_kvkk'
     'teklif_kvkk'
     'hemen_al_kvkk'
     'uluslararasi_kvkk'
     'deprem_kvkk'
3. KVKK çift-onay (aydınlatma + rıza) ayrı tutuldu — iki ayrı consent anahtarı kalsın.

NOTE: Eğer ekran sayısı çoksa veya hook entegrasyonu büyük iş ise paketin diğer görevlerine zaman bırakmak için ATLA + raporla. Min hedef: profil.tsx (4 consent) + 2 ihale ekranı.

Commit önerisi: "feat(mobile-ui): persist KVKK consents via SecureStore (M-3)"

═══════════════════════════════════════════════════════════════════════════
GÖREV 2 (M-1) — Biyometrik strict variant
═══════════════════════════════════════════════════════════════════════════

SORUN: mobile/src/app/(auth)/biometric.ts'te disableDeviceFallback:false — yüksek-değer akışlar (teklif gönder, hemen-al, login sonrası kritik işlem) için PIN/parola fallback'i uygunsuz.

YAPILACAK:
1. mobile/src/app/(auth)/biometric.ts:
   - authenticateBiometric fonksiyonuna ikinci parametre olarak options eklensin:
     authenticateBiometric(reason: string, options?: { strict?: boolean }): Promise<boolean>
   - options.strict===true ise disableDeviceFallback:true geçilsin (yüksek-değer için)
   - Default davranış değişmez (geri-uyumlu — mevcut çağırıcılar bozulmaz)
2. Yüksek-değer çağırıcıları işaretle (yapı gerekiyorsa, ama bu turun kapsamı dışı):
   - profil.tsx biometric opt-in: strict yok (giriş kolaylığı)
   - teklif.tsx / hemen-al.tsx: gelecekte handleSubmit öncesi authenticateBiometric(reason, {strict:true}) çağrısı eklenebilir (bu görev opsiyonel — kapsam dışı işaret et)

Commit önerisi: "feat(mobile-auth): biometric strict variant for high-value flows (M-1)"

═══════════════════════════════════════════════════════════════════════════
GÖREV 3 (M-4) — Push RPC payload error handling
═══════════════════════════════════════════════════════════════════════════

SORUN: mobile/features/notifications/pushNotifications.ts — registerPushTokenToSupabase + unregisterPushTokenFromSupabase yalnız `error` döndürmesini yakalıyor. RPC `{status:'error', code:..., message:...}` döndürürse (sunucu mantık hatası) bu data field'ı, mevcut kod ignore ediyor — sessiz başarısızlık.

YAPILACAK:
1. mobile/features/notifications/pushNotifications.ts:
   - registerPushTokenToSupabase + unregisterPushTokenFromSupabase fonksiyonlarına:
     - rpc çağrısının `data` payload'ını da yakala (RpcClientLike tipinde data:T mevcut — _rpcClient.ts ile uyumlu)
     - Eğer data?.status === 'error' veya benzeri → meaningful string mesaj döndür
     - Mevcut return string interface'i koru (geri-uyumlu)
   - Pattern web pushNotifications dosyasıyla parite gerekmiyor — mobile-local handling
2. Test: rpc çağrısı simüle edilmiş success/error cases — tsc PASS'i kaybedersen geri al.

Commit önerisi: "fix(mobile-push): handle RPC data.status==='error' payload (M-4)"

═══════════════════════════════════════════════════════════════════════════
GÖREV 4 (M-5) — Background location KVKK modal
═══════════════════════════════════════════════════════════════════════════

SORUN: mobile/features/location/locationRadar.ts requestLocationWithConsent + startRadarGeofencing → background location permission istiyor (manifest'te ACCESS_BACKGROUND_LOCATION var). Ama runtime'da background için ayrı KVKK aydınlatma modal yok — kullanıcı sadece OS permission dialog'u görür, "neden bg gerek" anlatımı eksik.

YAPILACAK:
1. mobile/features/location/locationRadar.ts:
   - requestBackgroundPermissionsAsync çağrısı öncesi Alert.alert / Modal ile KVKK aydınlatma metni göster:
     - Başlık: "Arka Plan Konum Aydınlatması"
     - Metin: KVKK m.10 + 11 + 14 atıfla, neden bg gerek (örn. "Belirlediğiniz bölgeye yeni ilan eklenince size bildirim yapabilmek için..."), opt-out hakkı, veri saklama süresi (kısa, örn. "geofence event tetiklendiğinde anında işlenir, log saklanmaz")
     - 2 buton: "Vazgeç" (cancel) + "Kabul ediyorum" (devam et)
   - Modal kabul edilmezse requestBackgroundPermissionsAsync çağrılmasın
2. Veya: profil.tsx içinde bg location toggle eklenmişse, toggle'ı açma akışına consent modal entegre.

NOT: locationRadar.ts'te startRadarGeofencing fonksiyonunda yapısal değişiklik. Test ile çalışıyor durumu doğrula — tsc fail ederse geri al.

Commit önerisi: "feat(mobile-location): KVKK consent modal for background location (M-5)"

═══════════════════════════════════════════════════════════════════════════
GÖREV 5 (O8) — Push deep link → router.push
═══════════════════════════════════════════════════════════════════════════

SORUN: mobile/features/notifications/pushNotifications.ts:94-98 bindNotificationDeepLinking → Linking.openURL('ihaleal://ilan/<id>') ile kendi-app'e link açıyor. Bu güvensiz (custom URL scheme hijack riski + native router-bypass) ve back-stack uyumsuz.

YAPILACAK:
1. mobile/features/notifications/pushNotifications.ts:
   - Linking import'u Linking.openURL kullanımı yerine expo-router'ın router import'u (Linking custom scheme yerine in-app routing)
   - import { router } from 'expo-router'
   - response.notification.request.content.data.type'a göre:
     - 'outbid' ya da 'auction_end' + listingId → router.push(`/ilan/${listingId}`)
     - 'new_opportunity' → router.push('/(tabs)/profil')
   - Custom scheme `ihaleal://` parsing kaldırılsın (artık yetersiz)
2. expo-router instance push edebilmek için bindNotificationDeepLinking fonksiyonunun çağrıldığı yer (root layout veya benzeri) sağlanmış olmalı — kontrol et, sorun yoksa devam.

Commit önerisi: "fix(mobile-push): use expo-router for deep links instead of Linking custom scheme (O8)"

═══════════════════════════════════════════════════════════════════════════
GÖREV 6 (D-1) — EAS projectId NOT (kullanıcı işi, sen değiştirme)
═══════════════════════════════════════════════════════════════════════════

SORUN: mobile/app.json içinde:
  "extra": { "eas": { "projectId": "PLACEHOLDER_EAS_PROJECT_ID" } }
Bu PLACEHOLDER kullanıcının EAS projesinden çekmesi gereken gerçek UUID. Sen YAPAMAZSIN — EAS hesabından alınır.

YAPILACAK:
1. mobile/app.json'da placeholder'ı DEĞİŞTİRME.
2. mobile/app.json yanına veya README.md'ye küçük yorum/not ekle:
   - "// TODO(eas): Bu projectId PLACEHOLDER. Kullanıcı 'eas init' veya EAS Dashboard'dan
      gerçek projectId'yi alıp buraya yazmalı. Aksi takdirde EAS Build çalışmaz."
3. Eğer mobile/README.md varsa orada da "EAS Build önkoşulu" başlığı altında not olsun.

NOT: Bu görev sadece dokümantasyon/işaret — kod değişikliği minimum.

Commit önerisi: "docs(mobile-config): mark EAS projectId placeholder needs user action (D-1)"

═══════════════════════════════════════════════════════════════════════════
GÖREV 7 (D-3/D-4) — Mock PII sentetikleştir
═══════════════════════════════════════════════════════════════════════════

SORUN: Mock veri dosyalarında gerçek-görünümlü Türkçe isim/TC/telefon var (örn. "Ahmet Demir 12345678910", "Ayşe K.", "+90 555 123 4567"). Bu:
- Crash log'a sızarsa benzer gerçek kişi var sanılır
- KVKK audit'inde "gerçek veri" olarak kategorize edilir
- Geliştirici demo verisini "test data" sayar ama dış izleyici karıştırabilir

YAPILACAK:
1. Mobile mock veri dosyalarını grep et (önemli yerler):
   - mobile/src/app/borsa-detay/data.ts
   - mobile/src/app/ihaleler/data.ts
   - mobile/src/app/mesajlar/data.ts
   - mobile/src/app/bildirimler/data.ts
   - mobile/src/app/favoriler/data.ts
   - mobile/src/app/belgeler/data.ts
   - mobile/shared/demoMarket.ts (mobile-only fixture, scope OK)
2. Gerçek-görünümlü PII'leri "TEST" prefix ile veya tamamen sentetik ile değiştir:
   - İsim "Ahmet Demir" → "TEST KULLANICI 1" veya "Demo User A"
   - TC "12345678910" → "00000000000" veya "TC-PLACEHOLDER"
   - Telefon "+90 555 123 4567" → "+90 555 000 0000" veya "TEL-PLACEHOLDER"
   - E-posta "ornek@gmail.com" → "test@example.invalid"
3. Üstte yorum ekle: "// MOCK DATA — sentetik, gerçek kişi/kurumla ilişkisi yoktur"

NOT: Eğer dosyalardaki PII az veya görünür gerçek-veri değilse (örn. zaten "demo-" prefix'li) ATLA + raporla.

Commit önerisi: "chore(mobile-mock): synthesize visible-real-looking PII in mock data (D-3/D-4)"

═══════════════════════════════════════════════════════════════════════════
RAPOR (paket sonunda TEK kapsamlı)
═══════════════════════════════════════════════════════════════════════════

→ Her görev için:
  - YAPILDI / ATLANDI / RİSK
  - Dosya:satır + önce/sonra ne değişti (kısa diff özeti)
  - Commit hash (varsa)
  - Atlanma/risk sebebi (varsa)

→ Genel:
  - tsc/lint/expo export her görev sonrası sonuçları
  - Working tree temiz mi (paket sonu)
  - Origin push EDİLMEDİ (talimat: push YOK — kullanıcı sonradan yedek için pushlar)
  - D-1 (EAS projectId) için kullanıcıya kısa eylem notu: "eas init veya EAS Dashboard'dan projectId'yi al, mobile/app.json'a yaz"

KURAL ÖZET:
- mobile/shared/** DOKUNMA
- src/** (web) DOKUNMA
- supabase/** DOKUNMA
- d5a81ca scope-dışı ekranlara EKLEME YAPMA
- Çekirdek mantığa dokunma — sadece sertleştirme + UI + config
- Her görev BAĞIMSIZ commit
- Risk/sürpriz → o görevi ATLA, paket devam etsin
- Build/tsc/lint fail → o görevi geri al, raporla
- push YOK

Bu paket bittiğinde Claude Code re-check yapacak (bağımsız müfettiş tur).
```

---

## Claude notu (Cursor için değil, kayıt)

Bu komut metnindeki triple-backtick blok'u Cursor penceresine yapıştırılır. 7 bağımsız görev — bazıları atlanabilir, sertleştirme paketi.

**Beklenen sonuç (ideal):**
- 6-7 ayrı commit (her görev ayrı, D-1 sadece dokümantasyon)
- Toplam ~10-15 dosya değişimi (consent helper + 7 ekran + pushNotifications + locationRadar + biometric + mock data)
- tsc/lint/expo build YEŞİL her commit sonrası

**Olası atlama nedenleri:**
- M-3 7 ekran çok iş ise min hedef profil + 2 ihale
- M-5 locationRadar mimari değişiklik gerekiyor ise atla
- D-3/D-4 PII gerçekten "demo-" prefix ile sentetik ise atla

**Sonra:** Claude Code bağımsız müfettiş turu (paketin re-check'i) yapacak. Sonra Adım 5 (büyük resim) yeniden değerlendirilir.
