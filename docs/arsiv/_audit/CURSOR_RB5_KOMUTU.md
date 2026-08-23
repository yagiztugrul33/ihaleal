# CURSOR RB5 KOMUTU (App Store + Güvenlik Dış Katmanı — 4 görev)

**Hedef worktree:** `ihaleal-mobile` (branch `feat/mobile-calculators`, son commit `4da7c43`)
**Hazırlayan:** Claude Code (master koordinatör — ana worktree main)
**Bağlam:** RB4 tamam (5 commit: M-3 consent + M-1 biometric strict + M-5 bg location + O8 router deep link + M-4 payload error). Re-check yeşil, scope sızıntısı yok, KVKK çift-onay korundu, shared dokunulmamış. Bu paket **App Store hazırlık + güvenlik dış katmanı** — kalan mobil güvenlik bulguları.

---

## ⚠️ AŞAĞIDAKİ TÜM METNİ CURSOR'A YAPIŞTIR

---

```text
═══ CURSOR — ihaleal-mobile (feat/mobile-calculators, HEAD 4da7c43). RB5 PAKETİ: App Store + güvenlik dış katmanı (4 görev). Push YOK. ═══

EXPO 56 KURALI (mobile/AGENTS.md):
- Yeni paket/plugin/config değişikliği yazmadan ÖNCE: https://docs.expo.dev/versions/v56.0.0/
- expo-screen-capture, expo-build-properties (privacy manifests), app.json plugin sırası, vs. için resmi 56 docs'ı oku, sonra kod yaz.

KAPSAM / KISIT:
- SADECE: mobile/src/app/** + mobile/features/** + mobile/app.json (+ gerekirse mobile/README.md)
- DOKUNMA: mobile/shared/** (facade'lar), src/** (web), supabase/** (RPC'ler), mobile/ root config dışındaki dosyalar
- Her görev BAĞIMSIZ commit (audit izi temiz)
- Risk/sürpriz çıkarsa O GÖREVİ ATLA + raporla + diğerine geç (paket durmaz)
- KVKK çift-onay (aydınlatma + rıza) bozma — sadece sertleştirme ekle
- Geri-uyumlu kal: mevcut çağırıcılar bozulmasın

KALİTE KAPISI (her commit öncesi+sonrası — mobile/ içinde çalıştır):
1. npx tsc --noEmit
2. npm run lint
3. npx expo export --platform web
Üçü de PASS olacak. Fail → o görevi geri al + raporla.

PUSH:
- YASAK. Sadece lokal commit. Kullanıcı sonradan yedek için manuel push edebilir.

═══════════════════════════════════════════════════════════════════════════
GÖREV 1 (RB5-a) — Screen capture engelleme (hassas ekranlarda)
═══════════════════════════════════════════════════════════════════════════

SORUN: Teklif/Hemen-Al/Profil ekranları KYC verisi, ödeme/teminat aşamaları, push token, lokasyon koordinatları gösteriyor. Screenshot/screen recording ile bunlar dış uygulamaya sızabilir (iOS Control Center screen recording, Android third-party recorder app). Ödeme/KYC akışlarında bu finansal/fintech güvenliği için standart sertleştirme.

ÇÖZÜM: expo-screen-capture (SDK 56 ✓, iOS+Android destekli).
- iOS: native screen recording detection + screenshot block
- Android: FLAG_SECURE — sistem-seviyesi screenshot/screen recording engelle (uygulama görseli dış aplara çıkmaz)

HEDEF EKRANLAR (sadece hassas):
1. mobile/src/app/ihale/[id]/teklif.tsx (teminat + bid tutarı + KVKK rıza)
2. mobile/src/app/ihale/[id]/hemen-al.tsx (KYC akış + buy_now)
3. mobile/src/app/(tabs)/profil.tsx (push token + lokasyon + email)

YAPILACAK:
1. Paket ekle: `npx expo install expo-screen-capture` (mobile/ içinde). package.json güncel.
2. Her hedef ekranda useEffect ile mount→prevent / unmount→allow:
   ```typescript
   import { preventScreenCaptureAsync, allowScreenCaptureAsync } from 'expo-screen-capture';

   useEffect(() => {
     let mounted = true;
     void preventScreenCaptureAsync().catch(() => null);
     return () => {
       mounted = false;
       void allowScreenCaptureAsync().catch(() => null);
     };
   }, []);
   ```
   - Mevcut useEffect'lerin yanına ek useEffect (önce/sonra fark etmez, ayrı tutmak okunabilirlik için iyi).
   - try/catch ile sarmala — modül init fail ederse uygulama crash etmesin.
3. app.json plugins listesine `"expo-screen-capture"` ekle (config plugin gerek değil ama best practice). Sıra: expo-secure-store sonrası.
4. Test: tsc/lint/expo export geçsin. Mount/unmount logic'i test etmek için development build gerek (web export'unda no-op).

NOT:
- profil.tsx zaten bind notification deep link useEffect'i var (RB4'ten). Yeni useEffect ona dokunmadan ek olarak yazılsın.
- teklif.tsx ve hemen-al.tsx şu an useEffect yok — yeni eklenecek (sadece bu prevent/allow için).
- DOKUNMA: kapali-teklif.tsx (preview ekran, hassas veri yok), borsa.tsx (genel terminal, hassas değil — opsiyonel: KKKVK toggle göründüğünden eklenebilir ama master karar bekleyebilir, ATLA).

Commit önerisi: `feat(mobile-security): block screen capture on sensitive screens (teklif/hemen-al/profil) — RB5-a`

═══════════════════════════════════════════════════════════════════════════
GÖREV 2 (RB5-b) — PrivacyInfo.xcprivacy (iOS App Store privacy manifest)
═══════════════════════════════════════════════════════════════════════════

SORUN: Apple App Store 2024-Q1+ zorunlu: iOS uygulamaları privacy manifest dosyası (PrivacyInfo.xcprivacy) içermek zorunda. Reasons-API (NSPrivacyAccessedAPI) deklare edilmezse store reddi. ihaleal'in kullandığı 3rd-party SDK'lar (Expo modülleri) bu API'leri kullanıyor ama main app deklarasyonu eksik.

ÇÖZÜM: app.json içinde `ios.privacyManifests` veya `expo-build-properties` plugin config. Expo SDK 56 destekli.
- Önce Expo 56 docs'tan privacyManifests yaklaşımını teyit et: https://docs.expo.dev/versions/v56.0.0/config/app/#privacymanifests
- Tercih: app.json ios.privacyManifests inline (config plugin gerekmiyor). Eğer 56'da config plugin gerekirse expo-build-properties ekle.

HEDEF: mobile/app.json (ios block içine privacyManifests ekle)

YAPILACAK:
1. `mobile/app.json` ios block içine:
   ```json
   "privacyManifests": {
     "NSPrivacyAccessedAPITypes": [
       {
         "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
         "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
       },
       {
         "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryFileTimestamp",
         "NSPrivacyAccessedAPITypeReasons": ["C617.1"]
       },
       {
         "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryDiskSpace",
         "NSPrivacyAccessedAPITypeReasons": ["E174.1"]
       },
       {
         "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategorySystemBootTime",
         "NSPrivacyAccessedAPITypeReasons": ["35F9.1"]
       }
     ],
     "NSPrivacyTrackingDomains": [],
     "NSPrivacyTracking": false,
     "NSPrivacyCollectedDataTypes": []
   }
   ```
   Reason kodlar:
   - CA92.1 — UserDefaults: SecureStore + auth token storage için (expo-secure-store + expo-constants kullanıyor)
   - C617.1 — FileTimestamp: expo-file-system + app bundle modification time
   - E174.1 — DiskSpace: storage check (expo-file-system + EAS update)
   - 35F9.1 — SystemBootTime: expo-device + crash log + analytics
2. `NSPrivacyTracking: false` — ihaleal'de tracking SDK yok (Firebase Analytics, Facebook SDK, vs.).
3. `NSPrivacyCollectedDataTypes` boş — uygulama veri toplamıyor (auth + KYC veri Supabase'e gidiyor, manifest'te "third-party data collection" değil — ana toplayıcı user-deklare).

NOT:
- Bu manifest yapısı App Store Connect upload'ta otomatik validate edilir.
- Apple'ın güncel reason kodları: https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api
- Eğer Expo 56 docs'ta farklı yaklaşım gerekiyorsa (örn. config plugin zorunluysa) ona uy. Şüphede docs > tahmin.
- Build test: `npx expo prebuild --platform ios --no-install` ile prebuild dene → ios/<app>/PrivacyInfo.xcprivacy üretilmiş mi kontrol et. (Prebuild yapılırsa cleanup gerekir — sadece test, commit etme prebuild output'unu. Mobile worktree'de ios/ klasörü .gitignore'da olabilir — kontrol et.)

EĞER prebuild test riski büyükse (mobile yapısı Expo managed ve ios/ klasörü repo'da yok varsayım): manifest yazımı + tsc/lint/expo export ile yetin. Prebuild'i skip et.

Commit önerisi: `feat(mobile-security): add iOS privacy manifest (App Store required-reason APIs) — RB5-b`

═══════════════════════════════════════════════════════════════════════════
GÖREV 3 (D-3/D-4) — Mock PII sentetikleştirme
═══════════════════════════════════════════════════════════════════════════

SORUN: Mock data'da gerçek-görünümlü Türkçe isim/TC/telefon/e-posta var. Risk:
- Crash log'a sızarsa benzer gerçek kişi var sanılır
- KVKK audit'inde "gerçek veri" kategorisine sokulur
- Geliştirici "test data" bilir ama dış izleyici karıştırabilir (öyle yorumlanan ekran görüntüsü dışarı çıkabilir)

HEDEF DOSYALAR (mobile/src/app/** + mobile/features/** — shared TUTMA):
Önce keşfet:
```bash
cd mobile
grep -r -E "(TC|TCKN|kimlik|telefon|phone|email|e-mail|@).{0,60}([0-9]{11}|[+]90|@gmail|@hotmail)" src/app/ features/ --include="*.tsx" --include="*.ts" --include="*.json"
grep -r -E "['\"][A-ZÇŞÖÜĞIİ][a-zçşöüğı]+ +[A-ZÇŞÖÜĞIİ][a-zçşöüğı]+['\"]" src/app/ features/ --include="*.tsx" --include="*.ts"
```
Olası hotspot'lar (önceki incelemeye göre):
- mobile/src/app/belgeler/index.tsx
- mobile/src/app/analiz/tapu/aiService.ts
- mobile/src/app/analiz/tapu/__tests__/privacy.test.ts
- mobile/src/app/bildirimler/, mesajlar/, favoriler/ (içlerinde mock liste varsa)
- mobile/src/app/borsa-detay/, ihaleler/ (varsa mock satıcı/alıcı isimleri)

YAPILACAK:
1. Bulunan gerçek-görünümlü PII'leri sentetikle:
   - İsim "Ahmet Demir" → "TEST KULLANICI 1" veya "Demo User A" (en az 1, en fazla 5 numerik suffix)
   - TC "12345678910" → "00000000000" veya "TC-PLACEHOLDER"
   - Telefon "+90 555 123 4567" → "+90 555 000 0000" veya "TEL-PLACEHOLDER"
   - E-posta "ornek@gmail.com" → "test@example.invalid" (RFC 6761 reserved)
2. Her dosyanın üstüne (mock data block başına) yorum ekle:
   ```typescript
   // MOCK DATA — tamamen sentetik, gerçek kişi/kurum/iletişim bilgisi ile ilişkisi yoktur.
   ```
3. Mock data tipinde "isMock: true" alanı varsa korunsun. Yoksa eklenmesi opsiyonel.

ATLA-EĞER:
- Dosyada zaten "TEST" / "DEMO" / "MOCK" prefix'li veriler varsa (zaten sentetik) → ATLA + raporda belirt.
- mobile/shared/demoMarket.ts shared'da → DOKUNMA (scope dışı). Eğer demoMarket içindeki PII'ler kullanıcı ekranlarına sızıyorsa, RB6 için flag et (atla + raporla).
- analiz/tapu/__tests__/privacy.test.ts test fixture'sı — testin geçmesi için belirli PII format gerekiyorsa dokunma; sadece açıkça gerçek-görünümlü olan değerleri değiştir.

NOT:
- TC: gerçek geçerli TC formatı (11 hane, ilk hane 0 değil, 10. hane çift, 11. hane checksum) gibi görünmesin. "00000000000" basit ve net sentetik.
- E-posta: example.invalid (RFC 6761) > example.com (rezerve ama tıklanabilir görünür). .invalid TLD asla resolved değil.

Commit önerisi: `chore(mobile-mock): synthesize real-looking PII to clearly-placeholder values — D-3/D-4`

═══════════════════════════════════════════════════════════════════════════
GÖREV 4 (D-1) — EAS projectId NOT (sadece işaret, DEĞİŞTİRME)
═══════════════════════════════════════════════════════════════════════════

SORUN: mobile/app.json:
```json
"extra": { "eas": { "projectId": "PLACEHOLDER_EAS_PROJECT_ID" } }
```
Bu UUID kullanıcının EAS Dashboard'undan (eas.dev) veya `eas init` komutundan gelmeli. Cursor BU DEĞERİ DEĞİŞTİREMEZ — kullanıcı hesabı + yetki gerek.

YAPILACAK:
1. mobile/app.json'da DEĞİŞTİRME — placeholder kalsın.
2. mobile/README.md varsa "EAS Build önkoşulu" başlığı altında NOT ekle. Yoksa oluştur:
   ```markdown
   # ihaleal mobile

   ## EAS Build önkoşulu

   `mobile/app.json` içinde `extra.eas.projectId` şu an `PLACEHOLDER_EAS_PROJECT_ID` — gerçek değerle değiştirmeden EAS Build (development client + production submit) çalışmaz.

   Adımlar:
   1. https://expo.dev'de oturum aç (Expo Account).
   2. ihaleal projesi yoksa oluştur (Project Settings → ID kopyala).
   3. CLI: `npx eas init` → çalıştırınca `app.json`'a projectId otomatik yazılır.
   4. Veya manuel: kopyaladığın UUID'yi `extra.eas.projectId` alanına yapıştır.
   5. EAS Build çalışmazsa: `eas account:view` ile login durumunu kontrol et.

   **Not:** projectId UUID gerçek değer olmadan `expo-notifications` push token alma çalışmaz (production'da). Web export ve local dev için sorun yok.
   ```
3. Eğer mobile/README.md zaten varsa: mevcut yapıya uygun başlık ile not ekle (yıkma).

NOT:
- Bu görev pure dokümantasyon — kod değişikliği YOK.
- README.md eklenirken Markdown formatlama temiz tut (başlık, liste, code block).
- Eğer mobile/ kök README'si yoksa repo kökündeki README'ye değil **mobile/README.md** yeni dosyaya yaz.

Commit önerisi: `docs(mobile-config): mark EAS projectId placeholder as user-action — D-1`

═══════════════════════════════════════════════════════════════════════════
PAKET KURALI ÖZET
═══════════════════════════════════════════════════════════════════════════

- Scope: mobile/src/app/** + mobile/features/** + mobile/app.json + mobile/README.md (gerekirse)
- DOKUNMA: mobile/shared/**, src/**, supabase/**, root config (.gitignore, package.json hariç GÖREV 1 için)
- Her görev AYRI commit (4 görev = 4 commit, max — atlananları sayma)
- Risk/sürpriz → ATLA + raporla, paket devam etsin
- Kalite kapısı her commit sonrası: tsc + lint + expo export (üçü PASS)
- Push YOK — sadece lokal commit

═══════════════════════════════════════════════════════════════════════════
RAPOR (paket sonunda TEK kapsamlı)
═══════════════════════════════════════════════════════════════════════════

→ Her görev için:
  - YAPILDI / ATLANDI / RİSK
  - Değişen dosyalar (dosya:satır + önce/sonra kısa diff özeti)
  - Commit hash (varsa)
  - Atlanma/risk sebebi (varsa)

→ Genel:
  - tsc / lint / expo export her commit sonrası sonuç (PASS/FAIL)
  - Working tree temiz mi (paket sonu)
  - Push YAPILMADI (kural)
  - GÖREV 4 için kullanıcıya eylem notu: "eas init veya EAS Dashboard'dan projectId al, mobile/app.json'a yaz"
  - GÖREV 2 için (varsa) Expo 56 privacyManifests docs link'inden çıkardığın net karar (config plugin gerek mi, inline yeterli mi)

KURAL ÖZET (tekrar — dikkat):
- mobile/shared/** DOKUNMA
- src/** (web) DOKUNMA
- supabase/** DOKUNMA
- Çekirdek mantığa dokunma — sadece sertleştirme + config + dokümantasyon + mock sentetik
- Her görev BAĞIMSIZ commit
- Risk/sürpriz → o görevi ATLA
- Build/tsc/lint fail → o görevi geri al, raporla
- Push YOK

Bu paket bittiğinde Claude Code re-check yapacak (bağımsız müfettiş turu).
```

---

## Claude notu (Cursor için değil, kayıt)

Bu komut metnindeki triple-backtick blok'u Cursor penceresine yapıştırılır. 4 bağımsız görev — bazıları atlanabilir, sertleştirme + App Store paketi.

**Beklenen sonuç (ideal):**
- 4 ayrı commit (GÖREV 1 + 2 + 3 + 4)
- Toplam ~10-15 dosya değişimi (3 ekran useEffect + app.json + 1 README + ~5 mock data dosyası)
- tsc/lint/expo build YEŞİL her commit sonrası

**Olası atlama nedenleri:**
- GÖREV 2 PrivacyInfo: Expo 56 docs'unda yaklaşım belirsizse veya config plugin Expo dev client gerektiriyorsa ATLA
- GÖREV 3 mock PII: zaten sentetik prefix'li veriler varsa ATLA (raporda belirt)
- GÖREV 1 screen capture: expo-screen-capture iOS+Android desteği SDK 56'da net (✓ ataması, riskli değil)

**Sonra:** Claude Code bağımsız müfettiş turu (paketin re-check'i) yapacak. Sonra RB6 / Faz 4 / main push gibi büyük adımlar değerlendirilir.

**Bağlam dosyaları (Cursor opsiyonel olarak okuyabilir):**
- mobile/AGENTS.md (Expo 56 docs kuralı)
- _audit/CURSOR_RB4_KOMUTU.md (önceki paket — RB4 pattern referansı)
- _audit/OTURUM_DURUMU_2.md (büyük resim — kullanıcı vermez ise Cursor ihtiyaç duymaz)
