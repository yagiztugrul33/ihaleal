# ÖLÜ DOSYA TEMİZLİĞİ TURU — RAPOR

**AMAÇ:** `_vite_utf8.ts` ölü dosyayı sil — yalnız GERÇEKTEN ölü olduğunu kanıtladıktan sonra.
Tarih: 2026-06-03 · Tag: `safe-before-olu-dosya` → `safe-after-olu-dosya` · Nitelik: **İZOLE, çekirdeğe SIFIR dokunuş, tek dosya silme**

---

## 1. DOSYA KİMLİĞİ

**Konum:** `_vite_utf8.ts` (repo kökü — `src/` içinde DEĞİL)

**Ne:** `vite.config.ts`'in **UTF-8-bozulmuş ESKİ KOPYASI**.

**Bozulma kanıtları (mojibake — CP1254/Latin-1 misread as UTF-8):**
- "G├Âreli" (← "Göreli")
- "├╝retimde" (← "üretimde")
- "K├Âk" (← "Kök")
- "ihaleal.com - Gayrimenkul ─░hale Platformu" (— "İhale")
- "T├╝rkiye'nin" (← "Türkiye'nin")
- "ÔåÆ" (← "→" — replaceArrow)

**Obsolete config değerleri (canlı `vite.config.ts`'le karşılaştırıldığında):**

| Alan | _vite_utf8.ts (ölü) | vite.config.ts (canlı) |
|---|---|---|
| `Permissions-Policy` | `geolocation=()` (blocking) | **`geolocation=(self)`** (konum-arama turu fix'i) |
| `registerType` | `"autoUpdate"` (sessiz devral) | **`"prompt"`** (pwa-temeli turu fix'i) |
| `skipWaiting` | `true` | **`false`** |
| `assetsInlineLimit` | `4096` | `8192` (cephe 1 v5) |
| Supabase NetworkOnly `runtimeCaching` | YOK | **VAR** (dürüstlük çekirdeği — fiyat/teklif bayatlama önleme) |
| `navigateFallbackDenylist` | yalnız `/api/` | `/api/, /auth/, /rest/, /storage/, /functions/` |
| `modulePreload` | belirtilmemiş | `{ polyfill: false }` |
| `shortcuts` (manifest) | YOK | İhaleler/Harita/Raporlar |
| `runtimeCaching` (fonts/OSM tiles) | YOK | VAR |

Bu config 5-10 commit gerisinde kalmış bir yedek — muhtemelen bir manuel "save-as" sırasında oluşturulup unutulmuş.

---

## 2. ÖLÜ KANITI (silmeden önce kanıtlandı)

### Grep tarama (`_vite_utf8` ve varyasyonları)

```
grep -rn "_vite_utf8|vite_utf8|vite-utf8|viteUtf8" .
```

**5 eşleşme — HEPSİ `_audit/*.md` raporlarında (meta-referans):**

| Dosya:Satır | Bağlam |
|---|---|
| `_audit/KONUM_ARAMA_RAPORU.md:57` | "ölü bir UTF-8 kopyası, hiçbir yerde referanslı değil… ileride silinmeli" |
| `_audit/KONUM_ARAMA_RAPORU.md:64` | BACKLOG: "`_vite_utf8.ts` temizliği" |
| `_audit/DURUSTLUK_TURU_RAPORU.md:153` | BACKLOG: aynı |
| `_audit/ANASAYFA_BOSLUK_RAPORU.md:120` | BACKLOG: aynı |
| `_audit/LINT_TEMIZLIK_RAPORU.md:121-122` | SONRAKİ + BACKLOG: aynı |

**Bu 5 eşleşmenin tamamı doc/audit metni — kod/config tarafından `import`/`require`/path-alias hiçbiri DEĞİL.** Silindikten sonra da kalacak/kalır (silme nedeninin geçmişi olarak).

### Build/Config include tarama

| Dosya | İçeriği | _vite_utf8.ts hâkim mi? |
|---|---|---|
| `tsconfig.json` | `files: []`, `references: [app, node]` | **Hayır** (file listesinde yok) |
| `tsconfig.app.json` | `include: ["src"]` | **Hayır** (kökte değil src'de) |
| `tsconfig.node.json` | `include: ["vite.config.ts"]` | **Hayır** (yalnız canlı config) |
| `vite.config.ts` | self-referential plugin config | **Hayır** (import/include yok) |
| `package.json` scripts | `build`, `dev`, `preview`, vb. | **Hayır** (script referansı yok) |
| `public/_headers`, `vercel.json` | static deploy config | **Hayır** (alakasız) |

**Vite otomatik dosya keşfi:** Vite yalnız ismine bakar (`vite.config.ts`/`vite.config.js`/`vite.config.mts`/…). `_vite_utf8.ts` Vite tarafından **YÜKLENMEZ** (underscore-prefixed isim Vite'ın konvansiyonunda yok).

**Sonuç:** **0 (sıfır) kod/config referansı.** Dosya hiçbir derleme/runtime path'inde değil. **GÜVENLE SİLİNEBİLİR.**

---

## 3. SİLME (yalnız tek dosya)

```bash
git rm _vite_utf8.ts
# rm '_vite_utf8.ts'
```

`git status --short` (silme sonrası):

```
D  _vite_utf8.ts
```

**Başka hiçbir dosyaya dokunulmadı.** Diğer "M"/"??" girdiler (N12_N18, dalga5-pwa, ANALIZ_OZET vb.) **kapsam dışı** — _audit churn'u, stay-in-lane gereği bu commit'e dahil edilmedi.

---

## 4. DOĞRULAMA (BLOK 3)

| Kontrol | Sonuç |
|---|---|
| **Build** (`npm run build`) | **YEŞİL** ✓ — PWA SW 299 entry üretildi |
| **Lint** (`npm run lint`, `--max-warnings 0`) | **0 hata** ✓ (önceki turun lint=0 durumu korundu) |
| **Sayfa regresyonu** | 4/4 sayfa 0 pageerror ✓ |
| GesAnalysisPage (`/arastirma/ges`) | bodyLen=5577, pageerror=0 ✓ |
| WarRoomPage (`/arastirma/war-room`) | bodyLen=4933, pageerror=0 ✓ |
| Anasayfa (dürüstlük turu) (`/`) | bodyLen=8529, pageerror=0 ✓ |
| İhaleler (konum + PWA) (`/ihaleler`) | bodyLen=9011, pageerror=0 ✓ |
| **Çekirdek MANTIK diff** | **SIFIR** (fees/sealed/placeBid/auth/RLS/routing/CurrencyContext/FxRef) |
| **Git diff** | yalnız `_vite_utf8.ts` silindi |

Dosya hiçbir yere bağlı olmadığından build'in yeşil olması zaten beklenen — siliyor olmak HİÇ bir şeyi değiştirmedi (tanımı gereği "ölü"). Bu, kanıtın doğru olduğunu gösterir.

---

## 5. SONUÇ

`_vite_utf8.ts` (UTF-8-bozulmuş, eski config değerleriyle dolu obsolete `vite.config.ts` kopyası) **silindi**. Önceki turlarda 4 farklı raporda not edilen bu BACKLOG kalemi temizlendi.

- **Kanıt:** 0 kod/config referansı (5 grep eşleşmesinin tamamı doc).
- **Build:** YEŞİL · **Lint:** 0 · **Regresyon:** 4/4 sayfa 0 pageerror.
- **Çekirdek:** SIFIR dokunuş.
- **Repo kökü** artık 1 dosya temiz.

---

**SONRAKİ:** [marka tescili (yarın) + 3 KAPI cevapları] → deploy → mağaza kodu (Kulvar C). Bağımsız temizlik işleri **BİTTİ**.
**BACKLOG:** Supabase staging E2E · AI çok-dilli yanıt · native mobil + geofencing-push (FAZ 2).
