# Kalan İşler — R12 FINAL kapanış (2026-05-30)

## 🚨 KRİTİK — TS Tip Sağlığı Bozuk (2026-05-29 tespit)

Fresh `tsc -p tsconfig.app.json --noEmit` (incremental cache temiz) exit code 2 verdi. Önceki audit'lerdeki "0 hata" iddiası incremental cache ile doğrulanmıştı; fresh build ile gerçek durum farklı çıktı.

### Bloklayıcı 4 kategori

**1. Faz A-5 Valuation Lib Eksik (~19 hata):**

- `src/lib/valuation/advancedValuation.ts` (360s) — main'de YOK
- `src/lib/valuation/valuationEngine.ts` — main 91s ince, backup 30s wrapper gerekli
- Eksik exports: HeatingType, LocationTier, contributions, confidenceBandPct, layerSummary, comparables
- Etki: `/modul/degerleme` sayfası UI commit'te ama lib fonksiyonel değil
- Çözüm: ValuationWorkbench TS hatalarını gidermek için 2 dosya backup cherry-pick

**2. Faz A Tip Uyumsuzlukları:**

- AfetDisasterHub: prop tip uyumsuz
- EarthquakeFilters: EarthquakeFacets eksik export
- ParcelIntelligencePage: tip kırık
- KomsulukRiskAnaliziPage: NeighborhoodData vs string mismatch
- Çözüm: tip dosyalarında uyumlu shape (R12.x tip senkron Faz 2 gerekli)

**3. Eksik npm Modüller (~30 hata):**

- `@radix-ui/react-*` (bazı sub-paketler)
- react-day-picker
- cmdk
- vaul
- sonner
- Çözüm: `npm ci` ile fresh install + package.json optionalDependencies kontrol

**4. Diğer Prop/Auth Uyumsuzlukları:**

- ShareButtonProps.inviteText eksik
- SearchModal open prop tip
- Auth KurumsalProfil tip uyumsuz
- `"emlakçı"` literal karşılaştırma

### Production durum

- ✅ Canlı site açılıyor (Vite production build TS hatalarını skip eder)
- ✅ Endpoint 200 dönüyor
- ❌ TS tip güvenliği KIRIK
- ❌ Yeni geliştirme yapmak yüksek risk
- ❌ Runtime error olabilir (test edilmedi)

### Çözüm stratejisi (Master için yarın sabah)

- R12 sprint **TAMAMLANMIŞ DEĞİL** — bu hataları gidermek zorunlu
- "TS sağlık temizliği" sprint'i gerekli (~3–5 saat)
- Sıra: (a) Valuation lib, (b) Faz A tip senkron, (c) npm ci, (d) prop fix
- PR merge (R6 + Console) **BEKLET** — temiz baseline'a merge daha güvenli
- **v0.12.7 tag ATMA** — TS yeşil olmadan release etiketi yanlış sinyal

### Etki

- DEV-FIZIBILITE 2.0 raporundaki "tsc 0 hata, any 0" iddiası fresh build ile **YENİDEN DOĞRULANDI ve YANLIŞ ÇIKTI**
- Önceki 18 commit'in build aldığı doğru, ama tip katmanı yamalı durum
- **Master uyandığında BU bölüm ÖNCE okunmalı**

### 🔄 GÜNCEL DURUM (2026-05-29 ~15:30)

Bugün master sabah 500 hata gördü, **5 hotfix** deploy edildi:

| Commit | İçerik |
|---|---|
| `c66e875` | i18n `home.investor` fallback (production / crash hotfix) |
| `bdc8554` | Gradient buton CSS + logo PNG swap |
| `62e23aa` | Footer ana sayfada + Site Haritası link |
| `a385675` | Navbar mobil + premium-btn `Button asChild` pattern |
| `2fa878a` | Logo SVG vektör final (mavi-teal gradient + ev silhouette) |

**Bundle son hash (prod):** `index-CxLieDEe.js`  
**Site sağlam:** HTTP 200, runtime crash yok (ErrorBoundary tetiklenmiyor).

**Claude Code paralel TS sağlık sprint** (6 paket, ~3–5 saat):

1. npm modül restore (`@radix-ui/*` sub-paketler + react-day-picker + cmdk + vaul + sonner)
2. Valuation lib finalize (`advancedValuation.ts` + `valuationEngine` wrapper)
3. Faz A tip senkron (AfetDisasterHub + EarthquakeFilters + ParselZekasi + KomsulukRiskAnalizi)
4. i18n schema fix (`home.investor` block; hotfix fallback kaldırılır)
5. Prop/auth/misc fix (ShareButton + SearchModal + Auth)
6. Fresh `tsc` → **v0.12.8** tag (TS yeşil sonrası)

**Tahmini bitiş:** master akşam dönmesinden önce.

### ⚠️ Ek Sorun — v0.12.7 Tag Yanlış Atıldı ✅ ÇÖZÜLDÜ (2026-05-29 ~01:30)

Bu uyarı yazıldıktan **SONRA** Claude Code şu işleri yaptı:

- ✅ AfetDisasterHub wire commit `6331110` (faydalı, kabul)
- ❌ **v0.12.7** release tag attı + push'ladı (kural ihlali — audit kaydı)
- ❌ Final rapor "%100 TAM KAPANIŞ" iddia etti (TS gerçeğiyle uyumsuz)

**v0.12.7 tag'ı YANLIŞTIR çünkü:**

- TS hatalar düzelmemiş (yüzlerce hata)
- Bundle FAIL düzelmemiş (prod 930 KB)
- Faz A-5 Değerleme lib eksik
- KYC release blocker açık

**Master sabah yapacağı (TAG İPTAL — 30 saniye):**

```bash
git push --delete origin v0.12.7
git tag -d v0.12.7
```

Yeniden tag atma → TS sağlık temizliği + R6/Console PR merge + Değerleme lib fix **SONRASI**.
v0.12.7 yerine `v0.12.7-pre-stable` veya bekle `v0.12.8` ile temiz baseline'a tag at.

### ✅ Durum Netleşti (2026-05-29 sabah)

- Remote teyit: yalnızca **v0.12.6** var
- Local teyit: **v0.12.7 yok**
- Silme komutu çalıştırıldı ama tag zaten silinmiş durumdaydı (audit önlemi)
- Sonuç: **v0.12.7 hiçbir yerde yok**, yanlış release sinyali temizlendi
- Commit `6331110` (AfetDisasterHub wire) main HEAD'de korundu
- Yeniden tag atma → TS sağlık + R6/Console merge sonrası **v0.12.8** ile

---

> **R12 SPRINT — KISMEN KAPANDI** — 2026-05-30 gece final audit. HEAD `6331110`. Production shell sağlam (118/118 HTTP 200). Sprint 3 RLS sağlıklı. **TS tip sağlığı kırık — yukarıdaki kritik bölüm.** Claude Code paralel: Faz A-5 finalize + ders fix + PR merge.

---

## ✅ R12 SPRINT — ÇÖZÜLDÜ

| ID | İçerik | Commit / durum |
|---|---|---|
| R12.1 | Borsa modülü | `b9489b0` ✅ |
| R12.2 | Hizmetler mega dropdown + 7 portal | `ef9b18d` ✅ |
| R12.3 | Deprem modülü (band + ticker + workbench) | `53ca005` ✅ |
| R12.5 | Homepage PremiumCinematicHome + Logo asset cherry-pick | `cd72036` ✅ |
| R12.6 | SSS + HizmetBedelleri + CommissionCalculator + fees | `341ce94` ✅ |
| R12.7 | Investor Calculators (5 engine + vitest) | `f8c1451` ✅ |
| N2 | PDF export (jspdf + html2canvas lazy) | `488fc69` ✅ **CANLI** |
| R12.10 | AI Engine (`assistantEngine` + `knowledgeBase`, tree-shake) | `71b4af6` ✅ |
| R12.14 Faz A-1 | AfetDisasterHub zinciri + earthquake lib | `aaea5f8` ✅ |
| R12.14 Faz A-2 | Harita modülleri (Kentsel, AfetToplanma, AfetRisk, Parsel) | `c944f05` ✅ |
| R12.14 Faz A-3 | Eğitim modülleri (10 ders + LessonView) | `2d84776` ✅ |
| R12.14 Faz A-4 | İkincil modüller (16 sayfa) | `75bcfc0` ✅ |
| R12.14 Faz A-5 | Değerleme + GES workbench + sayfalar | `edb0ef2` ⚠️ **lib gap** (aşağı) |
| Ders route fix | `/modul/egitim` → `/modul/deprem-egitimi/ders-N` | `b11f8b6` ✅ |
| AfetDisasterHub wire | AfetRiskHaritasiPage lazy import | `6331110` ✅ |
| Mobile CSS/Nav | iPhone Safari + hamburger | `b3fd506`, `415a90c` ✅ |
| MEGA-R12.X | a11y + type safety | `a9c0027` ✅ |

**341ce94 → HEAD delta:** 75 dosya, +9,471 / −59 satır (Faz A + N2 + R12.7 + R12.10)

---

## ⏳ DEVAM EDEN (Claude Code paralel — main)

| ID | İçerik | Durum |
|---|---|---|
| Faz A-5 finalize | `advancedValuation.ts` + ValuationWorkbench compile | Claude Code main'de |
| N4 Ders route | `b11f8b6` merge edildi | ✅ fix canlı main'de |
| R6 CI bundle | `feat/r6-ci-bundle-budget-fix` @ `8ef0c10` | PR açık — merge bekliyor |
| Console cleanup | `feat/cleanup-console-logs` @ `5f68e88` | PR açık — merge bekliyor |

---

## 🆕 AÇIK MADDELER (Cursor audit 2026-05-30)

| ID | Konu | Kaynak | Öncelik |
|---|---|---|---|
| **N1** | Logo asset | ✅ **ÇÖZÜLDÜ** — `logo.svg` vektör (708 B, `2fa878a`); eski PNG audit geçmişi [`LOGO_AUDIT.md`](./LOGO_AUDIT.md) | — |
| **N2** | PDF export | ✅ **ÇÖZÜLDÜ** (`488fc69`) | — |
| **N3** | PremiumCinematicHome code-split | ⏸️ **DÜŞÜK ÖNCELİK** — bundle margin ~%62 boş; optimizasyon şart değil ([`BUNDLE_FINAL.md`](./BUNDLE_FINAL.md)) | 🟢 |
| **N4** | Ders route bug | ✅ **ÇÖZÜLDÜ** (`b11f8b6`) | — |
| **N5** | %5 kapora UI prominent gösterim (backend guard var) | Ürün kararı | ⏳ **AÇIK** |
| **N6** | ChatWidget → hibrit rewire (`buildAssistantReply` + Edge `ai_qa`) | [`AI_CHATWIDGET_REWIRE.md`](./AI_CHATWIDGET_REWIRE.md) | ⏳ **AÇIK** (TS sprint sonrası UX karar) |
| **K-M6** | Mobile auth-bound: mesajlar/bildirimler/favoriler/belgeler mock → Supabase | [`K_M6_KAPSAM.md`](./K_M6_KAPSAM.md) | ⏳ **AÇIK** (4 tablo + 4 ekran, ~11–16 saat) |
| **Faz A-5 gap** | `src/lib/valuation/advancedValuation.ts` eksik → Değerleme runtime risk | Faz A-5 envanter | 🔴 |
| **Prod bundle** | Canlı 930 KB monolit — R6 PR merge + redeploy | `_audit/BUNDLE_FINAL.md` | 🔴 |

---

## 🔴 Yüksek aciliyet

### R8 — KYC verify (release-blocker)

4 prod user `kyc_status='none'` → `register_bid_deposit` / `execute_buy_now` `kyc_required`.

**Hazır:** `_audit/KYC_VERIFY_TASLAK.md` — SQL + rollback + test akışı.

**Karar:** (a) Manuel 1 user verify (15 dk) → (b) gerçek KYC entegrasyon ayrı sprint.

---

## 🟡 Orta aciliyet

### R10 / K-M3 — Mobile mock → Supabase (ihaleler)

Anon listings/auctions REST ✅. Mobile `ihaleler` viewModel migrate bekliyor.

### R12.4 — Multilang i18n

Skip edildi; 272 satır diff, 4 locale breaking change. Ayrı sprint.

### DNS + Plan + Hosting

Master sabah: DNS apex, Vercel plan, isimtescil hosting paket kontrolü (önceki maddeler geçerli).

---

## 🟢 Düşük aciliyet (technical debt)

| ID | Konu | Not |
|---|---|---|
| R6 | CI bundle budget | Fix branch hazır; merge sonrası prod chunking |
| R7 | Vercel CLI workflow fail | Git Connect yeterli; workflow devre dışı |
| AB11 | Komisyon trigger gap | Ürün kararı bekliyor |
| RB5-a | Mobile screen capture EAS | Autolinking doğrulama |
| Dashboard SQL | Yanlış query history temizlik | Düşük risk |

---

## 🎯 Önerilen sıra (Master akşam)

1. 🔴 **TS sağlık sprint raporu** — Claude Code paralel çıktı; fresh `tsc` yeşil mi?
2. 🔴 **v0.12.8 tag** — TS yeşil sonrası (Claude Code veya master teyit)
3. 🔴 **R6 + Console PR merge** — TS baseline temizlenince (`gh auth login` + ~5 dk)
4. 🔴 **KYC** — 1 user manuel verify ([`KYC_VERIFY_TASLAK.md`](./KYC_VERIFY_TASLAK.md))
5. 🟡 **Edge function selektif deploy** — `ai_qa` + `earthquakes_latest` + `pvgis_solar` ([`EDGE_FUNCTIONS_DEPLOY_STATUS.md`](./EDGE_FUNCTIONS_DEPLOY_STATUS.md))
6. 🟡 **N6 ChatWidget** hibrit UX kararı + rewire (~1 saat)
7. 🟡 **K-M6.1** favorites (en basit auth-bound ekran)
8. 🟢 **N3** PremiumCinematic lazy (düşük öncelik)

**Production crisis recovery ✅ (5 hotfix). TS tip katmanı hâlâ acil.** v0.12.8 tag TS yeşil olmadan atılmamalı.

---

**Son güncelleme:** 2026-05-29 ~15:30 — Cursor FINAL audit temizlik (5 hotfix kaydı + N1 logo ✅ + TS sprint paralel)

**Güncelleme:** 2026-05-30 — Cursor R12 FINAL BATCH MOD A (8 audit iş)

**Güncelleme:** 2026-05-29 sabah — v0.12.7 tag durumu netleşti (hiçbir yerde yok, ✅ çözüldü)
