# ihaleal.com — Durum Tespiti Raporu (Kanıt Zorunlu Sürüm)

**Rapor tarihi:** 2026-08-23
**Kural:** Bu raporda hiçbir iddia tahmine dayanmıyor — her satırın yanında komut çıktısı veya `dosya:satır` kanıtı var. Kanıtlanamayan/erişilemeyen maddeler açıkça "kontrol edilmeli / canlı doğrulanamadı" olarak işaretlendi.

---

## Yönetici Özeti

1. **İskelet sağlam ve kanıtlı:** typecheck 0 hata (38.1s), build başarılı (66.8s), unit testler 207/207 geçti (14.0s) — hepsi bu oturumda çalıştırılıp gerçek terminal çıktısıyla doğrulandı.
2. **Önceki turun "npm audit'in tamamı devDependency" iddiası bu turda YANLIŞ çıktı ve düzeltildi:** `npm audit --json` + `npm ls --all` ile paket paket izlendiğinde, 23 zafiyetten **2 tanesinin gerçekten production bundle'a giren paketlerden (react-router-dom, jspdf→dompurify) geldiği** kanıtlandı. Kalan 21'i devDependency.
3. **İki Edge Function, kendi kaynak kodunda açıkça "iskelet/simülasyon" olarak işaretli** (varsayım değil, dosya içi yorum): `payments-paytr` (HTTP 501 `not_implemented`) ve `push-notifier` (gerçek gönderim yok, sadece `console.log`).
4. **Canlı doğrulama bu oturumdan yapılamadı** — `curl` ile hem `ihaleal.vercel.app` hem `*.supabase.co` denendi, proxy seviyesinde 403 ile reddedildi (log kanıtı aşağıda). Edge Function'ların gerçek HTTP yanıtları (404/200) bu ortamdan ölçülemedi.
5. **Git geçmişi (18 saat, 52 commit) ile repodaki tarihli raporların işaret ettiği süre (Nisan-Ağustos 2026) arasında kanıtlanmış bir tutarsızlık var** — kesin tarih alıntılarıyla aşağıda gösteriliyor.

---

## 1. Proje Künyesi

| Metrik | Değer | Kanıt |
|---|---|---|
| Kaynak dosyası (`src/`) | 735 | `find src -type f \| wc -l` |
| Edge Function | 18 (+`_shared`) | `find supabase/functions -maxdepth 1 -type d` |
| Migration | 57 (+4 arşiv) | `find supabase/migrations -name "*.sql" \| wc -l` → 57; `migrations_archive_pre_tur9` → 4 |
| `dependencies` (production) | 66 | `node -e "console.log(Object.keys(require('./package.json').dependencies).length)"` |
| `devDependencies` | 30 | aynı yöntem |
| Kök dizin rapor/komut dosyası | 61 | `find . -maxdepth 1 \( -name "*.md" -o -name "*.txt" -o -name "*.bat" \) \| wc -l` |
| `_audit/` dosya/boyut | 641 dosya / 127 MB | `find _audit -type f \| wc -l`; `du -sh _audit` |

**Teknoloji:** Vite 6, React 19, TypeScript 5.8, Tailwind 3.4, Radix UI, Supabase (Postgres+Auth+Edge Functions), Capacitor 8 (Android/iOS), Vitest + Playwright, Sentry, Vercel Analytics, jsPDF/html2canvas, TCMB EVDS, PVGIS, AFAD, iyzico/PayTR.

**Supabase config:** `supabase/config.toml:5` → `project_id = "ihaleal.com"`; gerçek proje referansı `package.json` içindeki `"supabase:link": "supabase link --project-ref wsjifesrdaeorrdzbvmk"` script'inden okundu. Edge Function isim çiftleri **kontrol edilmeli**: `place-bid` ile `place_bid`, `tcmb_evds` ile `tcmb_yiufe` — ikisi de dizinde mevcut, hangisinin canlıda kullanıldığı bu oturumdan tespit edilemedi (deploy durumu görülemiyor).

### Kurulu ama kullanılmayan paket — kanıtlanmış

`i18next` ve `react-i18next`, `package.json`'da `dependencies` altında listeli, ancak:

```
$ grep -rn "useTranslation" -r src --include="*.tsx" | wc -l
0
```

`src/` içinde hiçbir yerde bu kütüphanelerden `import` veya `useTranslation()` çağrısı **bulunamadı**. Gerçek çeviri sistemi `src/i18n/messages.ts` içinde elle yazılmış özel bir sözlük (`Locale`, `getMessagesFor()`). Kodun kendi yorumu (satır 17, 1094, 3253):

```
src/i18n/messages.ts:17:  * RU/AR FAZ 0: SADECE altyapı. Çoğu metin TR fallback.
src/i18n/messages.ts:1094: * Tam çeviri tabanı: en + tr (mevcut). RU/AR FAZ 0'da `getMessagesFor()` ile
src/i18n/messages.ts:3253:// ───────── RU/AR FAZ 0 — kanıt çevirileri (sadece nav.*) ─────────
```

**Sonuç (kanıtlı):** RU/AR dilleri sadece navigasyon öğelerinde çevrilmiş, geri kalan tüm metin TR'ye düşüyor. `i18next`/`react-i18next` paketleri şu an ölü kod (bundle'da yer kaplıyor ama kullanılmıyor).

---

## 2. Git Durumu ve Tutarsızlık Notu

**Kanıt — `git log`/`git status` çıktısı:**

```
$ git status --short
(bu rapor commit'lenmeden önce: temiz)

$ git branch -a
* claude/ihaleal-status-report-t5dtai
  main
  remotes/origin/claude/ihaleal-status-report-t5dtai
  remotes/origin/main

$ git log --oneline | wc -l
52

$ git log --reverse --format='%H %ci' | head -1
08b680aba92516e3d3392f7e76d7e0b98f74d385 2026-08-05 04:31:14 +0300

$ git log -1 --format='%H %ci'
23454ec60372b20d0e10b5a692cb7a1e20c2d038 2026-08-23 10:15:53 +0000
```

Son "gerçek iş" commit'i (bu rapordan önceki): `c08a387` — 2026-08-06 01:42:13 +0300. Yani **51 iş commit'i, 2026-08-05 04:31 ile 2026-08-06 01:42 arasındaki ~21 saatlik pencerede** atılmış.

### Zorunlu karşılaştırma — kanıtlı tutarsızlık

Repodaki tarihli dosyalardan **doğrudan alıntı**:

```
NEREDEYDIK.md:89:              *Son güncelleme: 2026-05-17 ...*
docs/SECURITY_STATUS.md:3:     **Updated:** 2026-05-16 | ...
_audit/FEATURE_INVENTORY.md:1: # ihaleal — Tam Özellik Envanteri (2026-05-30)
_audit/FEATURE_INVENTORY.md:267: **Durum (2026-05-30):** **27 hata** (önceki sprint: 33 → 13 hedefi; regresyon / yeni dosyalar)
_audit/FEATURE_INVENTORY.md:297: ### Hotfix geçmişi (2026-05-29 sabah krizi)
_audit/FEATURE_INVENTORY.md:382: ## EK — R14 Müteahhit Lansman Sprint (2026-05-30 gece)
```

**Kanıtlanmış çelişki:** Repo, Mayıs 2026'ya tarihlenen "sprint", "hotfix geçmişi", "gece lansmanı" gibi çok aşamalı bir çalışma sürecine ait belgeler içeriyor; ama git log bunun tamamının 21 saatte yazıldığını söylüyor. Bu matematiksel olarak (aynı git geçmişinde) mümkün değil.

**Olası nedenler (öncelik sırasıyla, kanıtlanamadı — sadece olasılık):**
1. **History reset/squash:** Proje aylarca ayrı bir git geçmişiyle geliştirildi, sonra bu repo tek bir temiz dal (`main`, 52 commit) ile "yeniden başlatıldı" — belge dosyaları (markdown, json, png) bu sıfırlamadan etkilenmeden (working tree içeriği olarak) taşındı.
2. **Farklı ortam:** Belgeler Cursor/Kimi gibi başka bir araçla/depoda üretilip bu repoya kopyalanmış olabilir (`docs/kimi/`, `docs/kimi-import/` gibi klasör adları bu ihtimali destekliyor — kanıt: `find docs -maxdepth 1 -type d` çıktısında `kimi`, `kimi-import`, `kimi-mega-pack` klasörleri var).
3. **Bu session'ın gördüğü klon eksik/farklı:** GitHub'daki gerçek `main` dalının tam tarihçesi bu klonda görünmüyor olabilir.

**Kontrol edilmeli:** GitHub web arayüzünden `yagiztugrul33/ihaleal` reposunun gerçek commit sayısı/tarih aralığı doğrulanmalı — bu oturumdan yapılamaz (yalnızca yerel klonu görebiliyorum).

---

## 3. Sağlık Kontrolü (gerçekten çalıştırıldı)

| Kontrol | Komut | Sonuç | Süre | Kanıt |
|---|---|---|---|---|
| Typecheck | `npm run typecheck` | ✅ 0 hata | **38.1s** (`real 0m38.149s`) | terminal çıktısı, hata satırı yok |
| Unit test | `npm run test:run` | ✅ 207 geçti, 2 atlandı (52 dosyadan 51'i) | **14.0s** (`real 0m14.015s`) | `Test Files 51 passed \| 1 skipped (52)` / `Tests 207 passed \| 2 skipped (209)` |
| Build | `npm run build` | ✅ başarılı | **66.8s** (`real 1m6.823s`) | `✓ built in 22.05s` + PWA precache 314 dosya/6847.88 KiB |
| Lint | `npm run lint` (`eslint . --max-warnings 0`) | ⚠️ 2 hata + 1 uyarı | ~birkaç sn | aşağıda tam liste |
| `npm audit --audit-level=high` | JSON ayrıştırıldı | ⚠️ 23 zafiyet (1 kritik, 16 yüksek, 4 orta, 2 düşük) | — | `metadata.vulnerabilities: {"info":0,"low":2,"moderate":4,"high":16,"critical":1,"total":23}` |

### Lint — tam liste (3 sorun, değişmedi iki farklı çalıştırmada)

```
/home/user/ihaleal/.claude/skills/version-bump/scripts/generate_changelog.js
  8:28  error  Parsing error: Unterminated string constant

/home/user/ihaleal/scripts/tasarim-olcum.mjs
  82:107  error  Empty block statement  no-empty

/home/user/ihaleal/src/components/SearchModal.tsx
  65:9  warning  react-hooks/exhaustive-deps
```

### npm audit — paket paket izlenmiş zincir kanıtı

`npm audit --json` çıktısında 23 paketin tamamı listelendi ve her biri `npm ls <paket> --all` ile fiziksel olarak izlendi:

| Paket | Şiddet | `isDirect` | Zincir (npm ls kanıtı) | Prod mu Dev mi |
|---|---|---|---|---|
| `react-router` | high | false | `react-router-dom@7.18.2 → react-router@7.18.2` | **PRODUCTION** — `react-router-dom` `package.json` `dependencies` altında; `grep -rl "react-router-dom" src` → **180 dosya**, `src/App.tsx:2` `import { BrowserRouter, ... } from "react-router-dom"` |
| `react-router-dom` | low | true | doğrudan `dependencies` | **PRODUCTION** (yukarıdaki gibi) |
| `dompurify` | moderate | false | `jspdf@4.2.1 → dompurify@3.4.14` | **PRODUCTION** — `jspdf` `dependencies` altında; `grep -rl "jspdf" src` → `src/lib/pdf/pdfBuilder.ts`, `src/components/PropertyAnalysisReportViewer.tsx` (build çıktısında `jspdf.es.min-*.js` 390.40 kB chunk olarak doğrulandı) |
| `tar` | critical | false | `@capacitor/assets@3.0.5 → @capacitor/cli@5.7.8 → tar@6.2.1` ve `@capacitor/cli@8.5.0 → tar@7.5.22` | DEV (`@capacitor/assets`, `@capacitor/cli` → `devDependencies`) |
| `@capacitor/assets` | high | true | doğrudan `devDependencies` | DEV |
| `@capacitor/cli` | high | false | `@capacitor/assets → @capacitor/cli` | DEV |
| `@trapezedev/project` | high | false | Capacitor iOS/Android tooling zinciri (`xcode`, `replace`) | DEV |
| `xcode` / `uuid` | moderate | false | `@capacitor/cli → xcode → uuid@7.0.3` | DEV |
| `replace` / `minimatch` / `brace-expansion` | high | false | `@capacitor/cli → rimraf → glob → minimatch/brace-expansion`; ayrıca `eslint@10.9.0 → minimatch`; `vite-plugin-pwa → workbox-build → ...` | DEV |
| `undici` | high | false | `jsdom@29.1.1 → undici@7.29.0` | DEV (yalnızca test ortamı) |
| `ws` | high | false | `happy-dom@20.11.6 → ws@8.21.3` | DEV (yalnızca test ortamı) |
| `vite` | high | true | doğrudan `devDependencies` | DEV |
| `postcss` | high | true | doğrudan `devDependencies` | DEV |
| `nanoid` | high | false | `postcss@8.5.26 → nanoid@3.3.18` | DEV |
| `@babel/core` | low | false | `@vitejs/plugin-react`, `eslint-plugin-react-hooks`, `vite-plugin-pwa → workbox-build` | DEV |
| `fast-uri` | high | false | `vite-plugin-pwa → workbox-build → ajv → fast-uri` | DEV |
| `sharp` | high | true | doğrudan `devDependencies` | DEV |
| `pdf-to-png-converter` | high | true | doğrudan `devDependencies` | DEV |
| `pdfjs-dist` | high | false | `pdf-parse`, `pdf-to-png-converter` (ikisi de `devDependencies`) | DEV |
| `supabase` | moderate | true | doğrudan `devDependencies` (CLI) | DEV |

**Sonuç (düzeltilmiş, önceki turdaki hatalı iddiayı düzeltiyor):** 23 zafiyetten **21'i devDependency kaynaklı** (build/test/mobil tooling), **2'si (`react-router` ailesi ve `dompurify`) gerçekten production bundle'a giriyor** çünkü taşıyıcıları (`react-router-dom`, `jspdf`) doğrudan `dependencies` listesinde ve kodda aktif kullanılıyor.

**Önemli nüans — kontrol edilmeli:** `npm audit` `react-router` için özet aralığı `"6.0.0 - 7.18.1"` olarak veriyor, ama kurulu sürüm **tam olarak `7.18.2`** (`node_modules/react-router/package.json` → `"version": "7.18.2"`). JSON'daki 6 alt-advisory'nin etkilenen aralıklarının tamamı (`>=7.12.0 <7.18.2`, `>=6.0.0 <7.18.0` vb.) kurulu `7.18.2` sürümünü **kapsamıyor** (hepsi `<7.18.2` veya `<7.18.0` ile sınırlı, kurulu sürüm bu sınırların dışında/eşit). Yani npm audit paketi "high" olarak işaretliyor ama sürüm-aralığı matematiği kurulu sürümün aslında patch'lenmiş olabileceğini gösteriyor. Bu **çelişkili bir sinyal** — GitHub Advisory veritabanı doğrudan kontrol edilerek netleştirilmeli, bu rapor bunu netleştiremiyor.

---

## 4. Eksik / Yarım İşler (kaynak kod okunarak doğrulandı)

### TODO/FIXME/HACK/XXX — tam liste

`src/` içinde (25 eşleşme, telefon placeholder'ları hariç gerçek not yok):
```
src/pages/ibuyer/IBuyerPage.tsx:191:  {/* KATMAN 4 — GÜVEN, METODOLOJİ, HUKUKİ SÜREÇ */}
```
(kalan 24'ü `+90 XXX XXX XX XX` tipi telefon placeholder'ı — teknik borç değil.)

`supabase/functions/` içinde ise **gerçek, itiraf edilmiş TODO'lar bulundu** (önceki rapor bu dizini taramamıştı):
```
supabase/functions/push-notifier/index.ts:117-119:  // İSKELET — gerçek web-push gönderimi VAPID JWT + AES-128-GCM encryption gerektirir. ... Bu fonksiyon şu anda gönderim simülasyonu yapar.
supabase/functions/push-notifier/index.ts:128:       // TODO: Gerçek web-push call buraya:
supabase/functions/report-notifier/index.ts:25:      * NOT (iskelet): Gerçek mail gönderimi için Master canlı deploy öncesi Resend SDK'sı eklenir ve buradaki TODO gerçek fetch'e dönüşür.
supabase/functions/report-notifier/index.ts:163:     // TODO: Resend, Postmark veya SES SDK entegrasyonu — Master canlı deploy öncesi anahtar setlenir.
supabase/functions/payments-iyzico/index.ts:443:     // GERÇEK MOD: iyzico subscription API (anahtar varsa) — TODO: iyzico subscription endpoint
```

**Ek bulgu (davranış hatası riski):** `report-notifier/index.ts:162-166` — `RESEND_API_KEY` yoksa fonksiyon e-postayı göndermeden `sent++` sayacını artırıyor ve `continue` ediyor (satır 163-166). Yani "gönderilmedi" durumu "gönderildi" gibi raporlanıyor — izleme/monitoring için yanıltıcı olabilir.

### Ödeme altyapısı

| Fonksiyon | Durum | Kanıt |
|---|---|---|
| `payments-iyzico` | **Gerçek implementasyon** (489 satır); secret yoksa sandbox'a düşüyor, secret varsa gerçek iyzico API | `index.ts:206-213` → `if (!e.ok \|\| e.sandbox) { ... mockPaymentPageUrl ... }`; abonelik akışı kısmen TODO (`:443`) |
| `payments-paytr` | **Kanıtlanmış iskelet** | `index.ts:2` dosya başlığı: `"Edge Function: PayTR payment skeleton."`; `index.ts:28` GET yanıtı `"stage": "skeleton"`; `index.ts:54-61` POST → `{ "error": "not_implemented", "message": "PayTR flow not wired yet; secrets are present." }`, HTTP **501** |

### Dış veri entegrasyonları — her biri ayrı ayrı kanıtlandı

| Özellik | Gerçek API mi, Mock mu? | Kanıt (satır) |
|---|---|---|
| Deprem olay verisi (`earthquakes_latest`) | **GERÇEK** — AFAD resmi API'sine bağlı | `supabase/functions/earthquakes_latest/index.ts:69`: `fetch(\`https://deprem.afad.gov.tr/apiv2/event/filter?...\`)` |
| GES/güneş enerjisi verisi (`pvgis_solar`) | **GERÇEK** — AB Ortak Araştırma Merkezi PVGIS API'sine bağlı, API anahtarı gerektirmiyor | `supabase/functions/pvgis_solar/index.ts:77`: `new URL("https://re.jrc.ec.europa.eu/api/v5_2/seriescalc")` |
| AFAD deprem toplanma alanları (`AfetDisasterHub`) | **MOCK** | `src/components/property/AfetDisasterHub.tsx:269`: `fetch("/data/afad-assembly-mock.json")` |
| MTA fay hattı verisi (aynı bileşen) | **MOCK** | `src/components/property/AfetDisasterHub.tsx:252`: `fetch("/geo/mta-faults-mock.geojson")`; `:370`: `"MTA demo cizgisi: ..."` |

**Not:** Aynı özellik grubu içinde bile gerçek ve mock veri kaynakları karışık — bu, önceki denetim dosyalarının ("PVGIS/AFAD mock") kabaca doğru ama kaba bir genelleme olduğunu gösteriyor; gerçekte ayrım daha ince (olay verisi gerçek, coğrafi/statik referans verisi mock).

### KYC akışı

**Gerçek bir gönderim/kayıt akışı, ama otomatik doğrulama yok — manuel inceleme kuyruğu:**
```
supabase/functions/kyc-submit/index.ts:44:  status: "in_review",
supabase/functions/kyc-submit/index.ts:52:  return json({ ok: true, kyc_id: kyc.id, status: "in_review" });
```
Fonksiyon auth kontrolü yapıyor, zod ile body doğruluyor, `kyc_verifications` tablosuna gerçekten yazıyor — simülasyon değil. Ama üçüncü parti bir kimlik doğrulama sağlayıcısına (e-Devlet, eIDV vb.) bağlantı **bulunamadı** — durum her zaman `in_review`'de kalıyor, otomatik onay/red mekanizması yok.

### Canlı test denemesi — SONUÇ: engellenmiş, kod incelemesiyle sınırlı

```
$ curl -s -o /dev/null -w "HTTP:%{http_code}" --max-time 10 https://ihaleal.vercel.app/
HTTP:000  (exit code 56 — bağlantı kurulamadı)

$ curl -s --max-time 10 https://wsjifesrdaeorrdzbvmk.supabase.co/functions/v1/earthquakes_latest
HTTP:000

$ curl -sS "$HTTPS_PROXY/__agentproxy/status" → recentRelayFailures:
{
  "ts": "2026-08-23T10:24:23.214Z", "kind": "connect_rejected",
  "detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)",
  "host": "ihaleal.vercel.app:443"
},
{
  "ts": "2026-08-23T10:24:23.454Z", "kind": "connect_rejected",
  "detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)",
  "host": "wsjifesrdaeorrdzbvmk.supabase.co:443"
}
```

**Sonuç: canlı doğrulama bu oturumdan yapılamadı.** Bu ortamın ağ proxy'si `vercel.app` ve `supabase.co`'ya giden CONNECT isteklerini politika gereği reddediyor (kanıt: proxy'nin kendi `recentRelayFailures` günlüğü, zaman damgalı). Önceki denetim dosyalarındaki "post_chat_message 404", "earthquakes_latest 404" iddiaları bu oturumda **ne doğrulanabildi ne çürütülebildi** — bu, ayrı ve ağ erişimi olan bir ortamda (yerel makine/CI) test edilmeli.

---

## 5. Güvenlik & Repo Hijyeni

### Sızıntı taraması

```
$ grep -rnE "(sk_live_|pk_live_|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC )?PRIVATE KEY-----)" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs" --include="*.json" --include="*.toml" --include="*.env*" \
  -l . | grep -v node_modules | grep -v /dist/
(çıktı yok, exit code 1 — eşleşme yok)
```
`.env.example`/`.env.production.example` yalnızca placeholder içeriyor; `.gitignore` gerçek `.env*` dosyalarını doğru dışlıyor. Git geçmişinde de gerçek bir env dosyası eklenmemiş (önceki turda `git log --diff-filter=A` ile doğrulandı).

### Repo hijyeni — sayısal kanıt

- Kök dizin: **61** adet `.md/.txt/.bat` dosyası (`find . -maxdepth 1 ...`).
- `_audit/`: **641 dosya, 127 MB** (`du -sh _audit`) — repoyu ciddi şekilde şişiriyor.
- Öneri: `_audit/` git geçmişinden çıkarılıp harici depolamaya (obje deposu / ayrı "audit-history" reposu) taşınmalı; kök dizindeki eski `SONUC*.md`/`FIX*_SONUC.md`/`*.bat` dosyaları bir `archive/` klasörüne toplanmalı.

### Ölü kod / kullanılmayan bağımlılık

- `i18next`, `react-i18next` — yukarıda kanıtlandığı gibi `src/` içinde hiç kullanılmıyor.
- Duplicate Edge Function isimleri (`place-bid`/`place_bid`, `tcmb_evds`/`tcmb_yiufe`) — hangisinin aktif olduğu tespit edilip diğeri silinmeli (**kontrol edilmeli**, deploy durumu görülemiyor).

---

## 6. Kısıtlar (bu oturumda yapılamayanlar)

| Kısıt | Neden | Etkilenen bölüm |
|---|---|---|
| Canlı site / Edge Function HTTP testi | Proxy `connect_rejected` / 403 (kanıt yukarıda, zaman damgalı) | Bölüm 4 — "Canlı test denemesi" |
| GitHub'daki gerçek commit geçmişinin doğrulanması | Bu oturum yalnızca yerel klonu görebiliyor, GitHub API/web'e ağ erişimi yok | Bölüm 2 — tutarsızlık notu |
| `npm audit fix`'in gerçek etkisi | Bu oturumda denenmedi (major sürüm riski nedeniyle ayrı bir dalda test edilmeli önerisiyle bırakıldı) | Bölüm 3 |
| Edge Function'ların Supabase projesine gerçekten deploy edilip edilmediği | `supabase functions list` gibi bir komut çalıştırmak canlı proje kimlik bilgisi + ağ erişimi gerektiriyor, ikisi de yok | Bölüm 1, 4 |

---

## Önerilen Sonraki Adımlar (öncelik sırasıyla)

1. **`react-router`/`react-router-dom` ve `dompurify` zafiyetlerini kapat** — bunlar kanıtlanmış tek production-etkili zafiyet ailesi. Önce GitHub Advisory'de kurulu `7.18.2` sürümünün gerçekten etkilenip etkilenmediği netleştirilmeli (yukarıdaki aralık çelişkisi), sonra `npm audit fix` denenmeli.
2. **Ağ erişimi olan bir ortamda Edge Function deploy durumunu doğrula** — özellikle `post_chat_message`, `earthquakes_latest`, ve `place-bid`/`place_bid` duplikasyonu.
3. **PayTR entegrasyonunu bitir ya da resmen kapat** — kod zaten "not_implemented" diyor, karar netleştirilmeli.
4. **`push-notifier` ve `report-notifier`'ı gerçek servislere bağla** — ikisi de kendi TODO'sunda ne yapılması gerektiğini yazmış; `report-notifier`'daki "gönderilmeden sent++ artıyor" davranışı ayrıca düzeltilmeli (yanlış pozitif monitoring riski).
5. **`i18next`/`react-i18next`'i kaldır** (kullanılmıyor) **veya** gerçekten devreye al; RU/AR çevirisini FAZ 0'dan çıkar.
6. **AFAD toplanma alanları ve MTA fay hattı verisini** mock'tan gerçek kaynağa taşı (deprem olay verisi zaten gerçek).
7. **KYC'ye otomatik kimlik doğrulama sağlayıcısı ekle** (şu an sadece manuel `in_review` kuyruğu).
8. **`_audit/` klasörünü (127 MB) git geçmişinden arındır**, kök dizindeki 61 eski rapor dosyasını arşivle.
9. **GitHub'da gerçek commit geçmişini doğrula** (Bölüm 2'deki tutarsızlığı netleştirmek için, ağ erişimi olan biri tarafından).

---

*Bu rapor; `npm install/typecheck/lint/build/test:run`'ın gerçekten çalıştırılması ve süresinin ölçülmesi, `npm audit --json` çıktısının 23 paketin tamamı için `npm ls --all` ile fiziksel olarak izlenmesi, ilgili Edge Function ve frontend dosyalarının satır satır okunması, canlı `curl` denemesi ve proxy'nin kendi hata günlüğünün okunması, genişletilmiş bir secret-regex taraması ve `git log`/`git status` çıktılarının doğrudan alıntılanmasıyla hazırlanmıştır. Kanıtlanamayan hiçbir madde kesin dille yazılmamıştır.*
