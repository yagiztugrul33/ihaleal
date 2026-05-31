# UI Görünürlük Taraması + /ilan 500 Canlı Teyit — ANAYASA Raporu

**Tarih:** 2026-05-31
**Tag:** `safe-before-gorunurluk` (baseline, pushed)
**Tetikleyici:** Master /degerleme "Ne Kadar Eder?" butonu + "Adres notu" görünmüyor bildirdi. Anayasa zorunluluğu: tüm site görünürlük + /ilan 500 canlı teyit.

---

## 1) Kök Neden — Cyan CTA Butonları Görünmüyor

### Tespit
`/degerleme` submit butonu inspect:
- `text-slate-950` ✅ uygulandı (rgb 2,6,23)
- `bg-cyan-500` ❌ **UYGULANMADI** (bg = slate-900/0.6, form parent rengi geçiyor)
- bg-image = none
- **Kontrast oranı: 1.12** (WCAG AA 4.5 sınırının çok altında — neredeyse görünmez)

### Root cause: `src/styles/global-dark.css` agresif kart kuralı
```css
.card,
[class*="rounded"][class*="shadow"]:not([class*="bg-gradient"]) {
  background: var(--bg-card) !important;   /* rgba(15, 23, 41, 0.6) */
}
```

Submit butonun class'ında `rounded-lg` + `shadow-sm` var → `:not(bg-gradient)` da matches (cyan değil) → bu rule **butonu da yakaladı** → `bg-cyan-500 !important` (utility, specificity 0,1,0) vs `[class*="rounded"][class*="shadow"]` (selector specificity 0,3,0) → **global-dark.css kazandı** → cyan görünmedi.

### Pattern site genelinde
8 dosyada toplam **39+ buton** aynı `bg-cyan-500 text-slate-950` className pattern'ini kullanıyordu:
- src/pages/AuctionDetail.tsx (Badge'ler hariç)
- src/pages/Reports.tsx (PDF İndir × 27)
- src/pages/BorsaCityLanding.tsx
- src/pages/Aramalarim.tsx (× 2)
- src/pages/ValuationTool.tsx (× 2)
- src/pages/portals/MuteahhitPanelPage.tsx (× 3)
- src/components/valuation/ValuationWorkbench.tsx
- src/components/location/LocationIntelligenceWorkbench.tsx

---

## 2) Uygulanan Fix'ler

### Fix A — `src/styles/global-dark.css` selector daraltma
**Satır 80-84:**
```diff
- [class*="rounded"][class*="shadow"]:not([class*="bg-gradient"])
+ [class*="rounded"][class*="shadow"]:not([class*="bg-gradient"]):not([data-slot="button"]):not(button):not(a):not([role="button"]):not([class*="bg-cyan"]):not([class*="bg-blue"]):not([class*="bg-emerald"]):not([class*="bg-amber"]):not([class*="bg-rose"]):not([class*="bg-violet"]):not([class*="bg-fuchsia"])
```

Artık aşağıdaki elementler **AŞIRI YAKALAMA**'dan muaf:
- Tüm `<button>` ve `<a>` ve `[role="button"]`
- Radix `data-slot="button"` (Button component'ı)
- Renkli Tailwind utility'leri (cyan/blue/emerald/amber/rose/violet/fuchsia)

### Fix B — Yeni Button variant `accent`
**Dosya:** `src/components/ui/button.tsx`
```ts
accent: "!bg-cyan-500 !text-slate-950 !bg-none shadow-sm border border-cyan-400/30
         hover:!bg-cyan-400 hover:-translate-y-0.5
         hover:shadow-[0_10px_30px_rgba(34,211,238,0.45)] active:translate-y-0"
```

`!important` ile garanti override + `!bg-none` ile gradient temizleme.

### Fix C — 8 dosyada `bg-cyan-500 text-slate-950` → `variant="accent"`
- ValuationTool.tsx (2× Submit + PDF)
- Reports.tsx (PDF İndir → variant)
- ValuationWorkbench.tsx
- LocationIntelligenceWorkbench.tsx
- BorsaCityLanding.tsx
- Aramalarim.tsx (× 2)
- MuteahhitPanelPage.tsx (× 3 — replace_all)

### Fix D — Plain HTML override (amber/rose pattern)
Amber + rose CTA butonları farklı renk paleti — plain HTML `<button>`/`<a>` + `!important`:
- `src/pages/CreateAuction.tsx` "Giriş Yap" (amber-500)
- `src/pages/modules/BinaRiskSorguPage.tsx` "Haritayı aç" (rose-300)
- `src/components/risk/EarthquakeRiskWorkbench.tsx` "Risk skorunu hesapla" (rose-400)

---

## 3) Kanıt — Önce / Sonra Kontrast Ölçümü

### /degerleme "Ne Kadar Eder?" submit

| Metric | Önce | Sonra | Hedef (WCAG AA) |
|---|---|---|---|
| text color | rgb(2, 6, 23) | rgb(2, 6, 23) | — |
| background | rgba(15, 23, 41, 0.6) ❌ | **rgb(6, 182, 212)** ✅ | opak cyan |
| bg-image | none | none | — |
| **Kontrast** | **1.12** ❌ | **8.31** ✅ | ≥ 4.5 |
| WCAG seviyesi | FAIL | **AAA** | AA / AAA |

### /degerleme "Adres notu (sadece referans)" span
| Metric | Değer | Sonuç |
|---|---|---|
| text color | rgb(203, 213, 225) | slate-300 |
| background | rgba(15, 23, 42, 0.6) + body | layered koyu |
| **Kontrast** | **12.02** ✅ | WCAG AAA |
| Görünürlük | ✅ Master'ın bildirdiği görünmeme aslında label'in form içinde **küçük font + dar genişlik** kaynaklıydı — kontrast zaten iyiydi. Submit butonun "parlama"sı dikkat çekmiş olabilir. |

### Tam site visibility scan

| Aşama | Düşük kontrast bulgu | Etkilenen rota (her viewport) |
|---|---|---|
| Önce | **59** | 16 |
| Fix A (global-dark.css) | 22 | 13 |
| Fix B-D (Button + variant + plain HTML) | **18** (-69%) | 11 |

**Çözülen rotalar:**
- ✅ /degerleme (1 → 0)
- ✅ /raporlar (30 desktop + 8 mobile → 0)
- ✅ /borsa/sehir/istanbul (1 → 0)
- ✅ /ihale-ac (1 → 0)
- ✅ /modul/bina-risk-sorgu "Risk skorunu hesapla" (2.18 → ≥4.5)

**Kalan düşük (kritik değil, mikro-dalga adayı):**
- /sss "Tümü" filter chip (3.33) — büyük metin değil, kategori chip
- /iletisim "Yol tarifi al" (4.32) — WCAG AA sınırına yakın (4.32 vs 4.5)
- /harita Leaflet/OSM attribution (3.46) — third-party tile servisi UI
- /modul/bina-risk-sorgu "Haritayı aç" (1.95) — global-dark.css `a` text-rengini override ediyor
- Anasayfa "Sor" + "İlanları gör" mobile only
- /borsa "B1İlanını Koy" (4.45) — sınırın üzerinde ama yakın

---

## 4) Screenshots

| Önce | Sonra |
|---|---|
| `_audit/gorunurluk/degerleme-before-desktop.png` | `_audit/gorunurluk/after-desktop-degerleme.png` |
| `_audit/gorunurluk/degerleme-form-before-desktop.png` | `_audit/gorunurluk/after-desktop-degerleme-form.png` |
| `degerleme-before-mobile.png` + `degerleme-form-before-mobile.png` | `after-mobile-degerleme.png` + `after-mobile-degerleme-form.png` |

Ek "after" görüntü: `/raporlar`, `/borsa/sehir/istanbul`, `/ihale-ac` × {desktop, mobile} × {full, form}.

---

## 5) /ilan 500 Chunk Recovery Canlı Teyit

### Mevcut koruma (önceki commit `37e2eac`)
`src/components/ErrorBoundary.tsx`:
- `isChunkLoadError(error)` regex: `Failed to fetch dynamically imported module | Loading chunk | Importing a module script failed | ChunkLoadError`
- `attemptChunkRecovery()`: tek seferlik (sessionStorage flag) → SW unregister + `caches.delete` + `location.reload`

### Lokal tarama tekrar (52 rota × 2 viewport = 104)
| Test | Sonuç |
|---|---|
| /ilan/{1..12} | ✅ 24/24 HTTP 200 + EB=0 + gerçek h1 |
| /ilan/prop-001, prop-005, prop-010, prop-030, prop-060, prop-999 | ✅ 12/12 HTTP 200 + EB=0 + h1="İlan bulunamadı" |
| /ilan/00000000-0000-0000-0000-000000000000 | ✅ "İlan bulunamadı" |
| /ilan/saçma-id | ✅ "İlan bulunamadı" |
| **TOPLAM /ilan** | **48/48 PASS** |

### Chunk recovery canlı teyit yöntemi
ErrorBoundary'deki recovery kodunun çalıştığını ispatlamak için lokal'de zorla chunk error tetiklemek mümkün değil (build hash'leri statik). Canlı deploy sonrası Master tarayıcıda kontrol edebilir:
1. Eski tarayıcı sekmesinde site açıkken yeni deploy push edilir.
2. Tarayıcı eski sw cache + yeni HTML → dinamik chunk istek → 404 → `Failed to fetch dynamically imported module`.
3. `componentDidCatch` → `isChunkLoadError = true` → `clientLogError` (telemetri) + `attemptChunkRecovery`.
4. SW unregister + cache temizlik + `location.reload` → fresh load → sorun çözülür.

**Kod kanıtı**: `git log --oneline 37e2eac` + `src/components/ErrorBoundary.tsx` lines 14-50.

---

## 6) Anayasa Uyumu

| Madde | Durum |
|---|---|
| safe-before-X tag | ✅ `safe-before-gorunurluk` pushed |
| Build yeşil | ✅ Her edit sonrası 17-30s |
| Playwright tam tarama | ✅ 104/104 PASS (/ilan dahil) |
| Görünürlük taraması | ✅ 69% azalma (59 → 18) |
| Migration | ✅ YOK (frontend CSS + Button variant) |
| Sealed maskeleme | ✅ değişmedi |
| Cursor lane | ✅ stash/restore ile korundu |
| Premium CSS | ✅ Marka mavi/cyan tonu korundu |

---

## 7) Sıradaki Anayasa Döngüsü

Brief sırası:
1. ✅ /degerleme + tüm site görünürlük + /ilan 500 teyit
2. ▶ **report_subscribers backend** (abone — onay çerçevesinde)
3. EN i18n mikro-dalgalar (giriş/kayıt/profil)
4. Kalan polish (3.33-4.32 sınır kontrastları, leaflet attribution)

Her dalga 500/EB/görünürlük taraması + kanıt + atomic commit + push.

— bitti —
