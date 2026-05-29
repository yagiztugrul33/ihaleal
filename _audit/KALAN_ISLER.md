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
| **N1** | Logo asset — UI `ihaleal-logo.png` (305 KB, May 17); `ihaleal_com_logo.png` (116 KB) kullanılmıyor | `_audit/LOGO_AUDIT.md` | 🟡 Master karar |
| **N2** | PDF export | ✅ **ÇÖZÜLDÜ** (`488fc69`) | — |
| **N3** | PremiumCinematicHome code-split (~79 KB index şişmesi) | `_audit/BUNDLE_FINAL.md` | 🟢 1–2 saat |
| **N4** | Ders route bug | ✅ **ÇÖZÜLDÜ** (`b11f8b6`) | — |
| **N5** | %5 kapora UI prominent gösterim (backend guard var) | Ürün kararı | 🟡 |
| **N6** | ChatWidget → `buildAssistantReply` rewire (hibrit öneri) | `_audit/AI_CHATWIDGET_REWIRE.md` | 🟡 ~1 saat |
| **K-M6** | Mobile auth-bound: mesajlar/bildirimler/favoriler/belgeler mock → Supabase | `_audit/K_M6_KAPSAM.md` | 🟡 ~11–16 saat |
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

## 🎯 Önerilen sıra (Master sabah)

1. 🔴 **TS sağlık temizliği** — fresh `tsc` yeşil olana kadar (valuation lib → Faz A tip → npm ci → prop fix); ~3–5 saat
2. 🔴 **R6 + Console PR merge BEKLET** — TS baseline temizlenince
3. 🔴 **DNS + Plan** kontrol
4. 🔴 **KYC** — 1 user manuel verify (`KYC_VERIFY_TASLAK.md`)
5. 🟡 **R6 PR merge** → redeploy → prod bundle < 819 KB (TS yeşil sonrası)
6. 🟡 **N1 Logo** — `ihaleal_com_logo.png` veya yeni master asset
7. 🟡 **N6 ChatWidget** UX kararı + rewire
8. 🟡 **K-M6.1** favorites (en basit auth-bound ekran)
9. 🟢 **N3** PremiumCinematic lazy

**Production shell sağlam; TS tip katmanı acil.** v0.12.7 tag TS yeşil olmadan atılmamalı.

---

**Son güncelleme:** 2026-05-30 — Cursor R12 FINAL BATCH MOD A (8 audit iş)

**Güncelleme:** 2026-05-29 ~01:00 — Cursor fresh tsc denetimi
