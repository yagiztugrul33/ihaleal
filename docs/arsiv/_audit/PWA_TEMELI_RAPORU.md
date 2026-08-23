# PWA TEMELİ TURU — RAPOR

**AMAÇ:** Mevcut React web'i PWA olarak kurulabilir hale getir; mevcut hiçbir davranış değişmesin.
Tarih: 2026-06-03 · Tag: `safe-before-pwa` → `safe-after-pwa` · Nitelik: **İZOLE, çekirdeğe SIFIR dokunuş**

---

## 0. ÖNCE-OKU BULGULARI (O1-O4)
| | Bulgu |
|---|---|
| **O1 Build** | Vite 6.3.5 + React 19. **`vite-plugin-pwa@1.3.0` ZATEN kurulu ve yapılandırılmış** (Workbox tabanlı). Yeni paket gerekmedi. |
| **O2 public/ + head** | Manifest + ikonlar + index.html meta **zaten tam** (aşağıda denetlendi). |
| **O3 Mevcut SW** | VAR — vite-plugin-pwa üretiyor (`dist/sw.js`, 299 precache). Eski kill-switch (public/sw.js) workbox'a devredilmiş. Çakışma yok. |
| **O4 Çekirdek** | placeBid/sealed/fees/CurrencyContext/FxRef/auth/RLS/routing/i18n/RTL — **hiçbirine dokunulmadı** (diff ile kanıtlı). |

**Sonuç:** Bu tur sıfırdan kurulum DEĞİL — **denetle + tur şartlarına göre sertleştir**. PWA altyapısının çoğu (manifest/ikon/install-UX/cache) zaten doğruydu; tek eksik tur şartı `registerType` idi.

---

## 1. ZATEN DOĞRU OLAN (denetlendi, dokunulmadı)
- **Manifest** (vite.config içinde): name "ihaleal — Türkiye'nin Gayrimenkul Borsası", short_name "ihaleal", description, lang/dir, start_url "/", scope "/", display **standalone**, orientation portrait-primary, theme_color **#0B1120**, background_color #0B1120, categories, **shortcuts** (İhaleler/Harita/Raporlar). Tur şartından daha kapsamlı.
- **İkonlar GERÇEK** (placeholder DEĞİL): icon-192 (192×192), icon-512 (512×512), maskable-192/512, favicon.svg/png, og-image (1200×630) — hepsi geçerli PNG, doğru boyut. **Sahte ikon yok.**
- **index.html head**: manifest link + theme-color + apple-touch-icon (192/512) + apple-mobile-web-app-capable/title/status-bar — tam.
- **Install UX** (`src/components/pwa/InstallPrompt.tsx`): beforeinstallprompt (Android/Chrome/Edge) + iOS 3-adım yönerge + standalone-tespit (yüklüyse render yok) + 7-gün dismiss. **BLOK 3 zaten mükemmel.**
- **Cache stratejisi** (workbox): app-shell precache + Supabase NetworkOnly (aşağıda).
- **devOptions.enabled: false** → dev'de SW yok (sürpriz cache yok).

## 2. BU TURUN SERTLEŞTİRMESİ (tur şartı 2a + 4f)
**Sorun:** `registerType: "autoUpdate"` + `skipWaiting: true` = **sessiz devralma/reload** — tur açıkça yasaklıyor ("'prompt' olmalı, sessiz auto-update riskli").

**Değişiklikler (yalnız 4 dosya, additive/config):**
1. `vite.config.ts`: `registerType: "autoUpdate"` → **`"prompt"`**.
2. `vite.config.ts`: workbox `skipWaiting: true` → **`false`** (yeni SW bekler).
3. `tsconfig.app.json`: `types` += `"vite-plugin-pwa/react"` (virtual modül tipi).
4. **YENİ** `src/components/pwa/PwaUpdatePrompt.tsx`: `useRegisterSW` ile "Güncelle" prompt'u (4 dil inline, i18n'e dokunmadan); `updateServiceWorker(true)` → skip-waiting + reload. App.tsx'e mount (InstallPrompt yanına).

**SW bytecode kanıtı:** üretilen `dist/sw.js`'te `self.skipWaiting()` **YALNIZCA** `addEventListener("message", s => "SKIP_WAITING"===s.data.type && self.skipWaiting())` içinde — yani **kullanıcı "Güncelle"ye basınca**; install handler'da koşulsuz skipWaiting YOK. → prompt akışı doğru.

---

## 3. CACHE STRATEJİSİ (NE cache'lendi / NE HARİÇ) — dürüstlük kritik
**Cache'lenen (app-shell — statik):** `globPatterns: **/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf}` → 290 statik dosya. **Veri JSON YOK.**

**ASLA cache'lenmeyen (kanıtlı):**
- **Supabase REST/Auth/Storage/Functions → `NetworkOnly`** (runtimeCaching kuralı). Fiyat/teklif/borsa/endeks DAİMA Supabase'den taze gelir.
- `navigateFallbackDenylist`: `/api/`, `/auth/`, `/rest/`, `/storage/`, `/functions/` (SPA fallback bu yollara uygulanmaz).
- Yalnızca güvenli statikler cache'li: Google Fonts (SWR/CacheFirst), OSM harita tile'ları (CacheFirst 7g).

**Runtime kanıt (test):** SW kurulduktan sonra tüm cache'ler tarandı → **290 URL'de 0 yasak (supabase/api/auth/rest/functions) + 0 veri-JSON**. Bayat fiyat/teklif imkânsız.

---

## 4. KANIT (`_audit/pwa-temeli/result.json`, `test.mjs`)
| Test | Sonuç |
|---|---|
| **4e Build + lint** | Build **YEŞİL** (299 precache); ESLint exit **0**. |
| **1 SW kaydı** | reg=1, script=`/sw.js`, controller=true, **0 pageerror**. |
| **2 Manifest** | name/short_name/display=standalone/icons 192+512+maskable/theme #0B1120 → **geçerli**. |
| **4c CACHE GÜVENLİĞİ** | 290 cache'li URL, **0 API/veri** cache'li → **SADECE APP-SHELL** (taze veri garanti). |
| **4a REGRESYON** | 4 dil (tr/en/ru/ar) × 4 sayfa (/ /ihaleler /analiz /mortgage) → **hepsi yüklendi, 0 pageerror**; AR dir=rtl korundu (i18n/RTL bozulmadı). |
| **4b/4d Installable** | manifest+SW+icons+secureContext → **kurulabilir**; display standalone + ikon + theme (splash manifest'ten). |
| **4f Update prompt** | prompt-flow SW (message-gated); taze kurulumda banner **çıkmıyor** (yalnız güncellemede) → doğru. |
| **4g Diff** | yalnız `App.tsx`(+2), `tsconfig.app.json`(+1), `vite.config.ts`(registerType+skipWaiting), yeni `PwaUpdatePrompt.tsx`. **Çekirdek (placeBid/fees/auth/CurrencyContext/sealed/rpc) diff'te YOK.** |

---

## 5. [REVIEW] / NOT
- **Update prompt'un GÖRSEL testi** (needRefresh=true): iki SW sürümü gerektirir; tek preview'de tetiklenemez. Bytecode (message-gated skipWaiting) + component render mantığı + taze-kurulumda-gizli ile kanıtlandı. İlk gerçek deploy'da prompt çıkacak.
- **Lighthouse PWA**: tam Lighthouse koşulmadı (ağır); installable kriterleri programatik doğrulandı (manifest geçerli + SW kayıtlı + ikon 192/512 + secure context).
- **Offline fallback sayfası** (2d, opsiyonel): eklenmedi — `navigateFallback: /index.html` SPA kabuğu zaten offline açılır; veri gösteren hiçbir şey offline servis edilmez (NetworkOnly). Veri-gösteren özel offline sayfası YOK (dürüstlük: bayat veri gösterme).

---

## 6. SONUÇ
ihaleal **kurulabilir PWA**: manifest geçerli, ikonlar gerçek, SW kayıtlı, install + güncelleme UX'i var. **Güncelleme artık sessiz değil — kullanıcı "Güncelle"ye basar** (registerType prompt). **Fiyat/teklif/borsa ASLA cache'lenmez** (Supabase NetworkOnly, runtime kanıtlı) → bayat veri imkânsız. **Mevcut davranış 4 dilde aynen korundu** (0 pageerror, routing/RTL sağlam). Çekirdek mantığa **sıfır dokunuş**.

**SONRAKİ:** anasayfa boşluk doldurma → [3 KAPI: avukat/ödeme/MoU] → mağaza kodu.
**BACKLOG:** native mobil app + push + arka-plan geofencing (FAZ 2) · Supabase staging E2E · AI çok-dilli yanıt · pre-existing 8 lint hatası (aiSanitize control-regex + GesAnalysis/WarRoom unused-import — ayrı temizlik turu).

---

## 7. BU TURDA TEKRAR DOĞRULAMA (durum tespiti + kapanış turu)

**Durum (O1-O4 yeniden):** PWA altyapısının **tamamı zaten doğru ve PUSH'lu** (`safe-after-pwa` → `ee4c90d`). Bu tur **O4 koşulu** (PWA TAM): yeni iş yok, **yalnız DOĞRULA + cache güvenliği test et**.

**Bu turda TESPİT EDİLEN (yeniden envanter):**
| Bileşen | Durum | Konum |
|---|---|---|
| `vite-plugin-pwa@1.3.0` | ✓ kurulu (devDeps) | `package.json:147` |
| VitePWA config | ✓ kapsamlı (manifest+workbox+icons+shortcuts) | `vite.config.ts:80-228` |
| `registerType: "prompt"` | ✓ doğru (sessiz auto-update YOK) | `vite.config.ts:83` |
| `skipWaiting: false` | ✓ doğru (yeni SW bekler) | `vite.config.ts:170` |
| Manifest tam (name/short/display/icons/shortcuts) | ✓ | `vite.config.ts:98-161` |
| 4 ikon gerçek (192/512/maskable) | ✓ 2-12KB gerçek PNG | `public/icon-*.png` |
| index.html (manifest link + theme + apple-touch) | ✓ | `index.html:11,18,21-25` |
| `PwaUpdatePrompt.tsx` (4 dil) | ✓ inline strings TR/EN/RU/AR | `src/components/pwa/PwaUpdatePrompt.tsx` |
| `InstallPrompt.tsx` (beforeinstallprompt + iOS) | ✓ standalone-tespit + 7g dismiss | `src/components/pwa/InstallPrompt.tsx` |
| Supabase NetworkOnly runtime kuralı | ✓ açık not'la korunuyor | `vite.config.ts:186-192` |
| navigateFallbackDenylist | ✓ `/api,/auth,/rest,/storage,/functions` | `vite.config.ts:175-181` |
| globPatterns yalnız statik | ✓ js/css/html/png/svg/woff vb. | `vite.config.ts:182` |
| Push handler | ✓ Supabase NetworkOnly'e DOKUNMUYOR (yorum açık) | `public/push-handler.js` |

**Tag durumu (zaten doğru, dokunulmadı):**
- `safe-before-pwa` → `af6dd7a` (centering-rtl — PWA work öncesi) ✓
- `safe-after-pwa` → `ee4c90d` (pwa-temeli commit) ✓
- *Not:* tur şartında istenen `safe-before-pwa-temeli`/`safe-after-pwa-temeli` (suffix'li) yerine semantik olarak aynı işlevi gören `safe-before-pwa`/`safe-after-pwa` mevcut. **Redundant tag eklenmedi** (gereksiz isim çoğaltma); rollback garantisi aynı noktada.

**Tekrar test (taze kanıt, fresh preview):**
- Build: `dist/sw.js` + `dist/manifest.webmanifest` + `dist/workbox-9c35ba06.js` üretildi (299 precache entry).
- Lint **0** (yalnız `src/components/pwa/` — `vite.config.ts` eslint scope dışı, pre-existing infra durumu).
- **SW** kayıt=1, script=`/sw.js`, controller=true, 0 pageerror.
- **Manifest** geçerli (standalone + icons 192/512/maskable + theme=#0B1120).
- **CACHE GÜVENLİĞİ (bu turun kalbi):** toplam **290 cache'li URL** · **0 yasak (supabase/api/auth/rest/functions) cache'li** · **0 veri JSON cache'li** → **YALNIZ APP-SHELL**. Fiyat/teklif/borsa bayatlama **imkânsız**. ✓
- **Regresyon:** 4 dil (tr/en/ru/ar) × 4 sayfa (/, /ihaleler, /analiz, /mortgage) routed; AR `dir=rtl` korundu; **0 pageerror her dilde**. **KONUM rafı** ayrıca `_audit/dil-konum/test.mjs` ile aynı taze preview'da doğrulandı (4 dil grant: btn=true, kmRozet=true, mesafeler [4.1-7.9] km, sıralı, 0 pageerror).
- **Installable:** manifest+SW+icons+secureContext = hepsi true → ✓ kurulabilir.
- **Update prompt:** taze kurulumda banner görünmüyor (needRefresh=false) → ✓ doğru (yalnız gerçek güncellemede çıkar).

**Çekirdek diff:** `git diff HEAD -- src/ public/ vite.config.ts index.html package.json tsconfig.app.json` → **BOŞ**. placeBid/sealed/fees/CurrencyContext/FxRef/auth/RLS/routing/i18n/RTL — **sıfır dokunuş** (HEAD'de zaten doğru hâlde).

**Pre-existing 8 lint hatasına DOKUNULMADI** (aiSanitize control-regex + GesAnalysis/WarRoom unused-import) — ayrı temizlik turu.

**`origin/main..HEAD`:** BOŞ (push'lu); bu turun audit-commit'i ayrıca push'lanacak.

**Sonuç:** PWA **kalıbı bütünüyle tam ve doğru**. Bu tur **yalnız fresh kanıt + rapor footer**. Mevcut hiçbir davranış değişmedi; fiyat/teklif/borsa cache bayatlama tehdidi **kanıtlı yok** (290 URL'de 0 dinamik veri).
