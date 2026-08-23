# 🌐 FAZ 2 — DALGA 3: CSS Logical/RTL — dashboard üçlüsü + GES + profil

**Tarih:** 2026-06-03 · **Tag:** `safe-before-faz2-d3` (7d6b523) → `safe-after-faz2-d3`
**Doktrin:** Sadece YÖN; className-only. GES motoru/RPC/recharts-data MANTIK SIFIR.

## ⚡ ÖZET
**44 fiziksel→logical** (3 dosya): GesAnalysisPage (~42, GES finansal tablolar: solar/NPV/IRR/maliyet) + GesAnaliziModulPage (ml-1.5) + PantsirPanel (mr-2). Dashboard üçlüsü (FlowDashboard/InvestorDashboard/Profile) + GesEvaluationForm **zaten logical** (11-N..N-3'te yazıldı) → 0 değişiklik. centering/arbitrary/border/yönlü-ikon YOK. GES motoru render korundu; className-only; build YEŞİL + 0 pageerror + AR dir=rtl.

## 1) DÖNÜŞÜM (44)
| Token | → | Yer |
|---|---|---|
| text-right | text-end | GES finansal tablo numeric sütunlar (~30) |
| text-left | text-start | GES tablo etiket sütunları (~7) |
| pr-2/pl-2 | pe-2/ps-2 | GES tablo padding |
| mr-2/ml-1/ml-1.5 | me-/ms- | PantsirPanel + GES ikon margin |
> Dosyalar: GesAnalysisPage · GesAnaliziModulPage · PantsirPanel. Yöntem: precise sed (sınır korumalı).

## 2) DOKUNULMAYAN / [REVIEW]
- Dashboard üçlüsü + GesEvaluationForm: **zaten logical** (me-/ms-), 0 değişiklik ✅
- GES expand/collapse chevron'ları: **dikey (dir-nötr)** → rtl:rotate-180 GEREKMEZ
- recharts grafik içi (eksen/legend): kütüphane yönetir, wrapper dışı DOKUNULMADI
- rounded-lg/xl, border-color, mx/my/px/py → DOKUNULMADI

## 3) ÇEKİRDEK SIFIR (className-only)
- runGesLandEvaluation motoru · dashboard RPC/readUserFlows · useFavorites/portföy · recharts VERİSİ · auth/updateUser/signOut · fees/Currency/FxRef → DOKUNULMADI
- git diff: yalnız yön token; JSX/mantık/recharts-data AYNEN

## 4) TEST (KANIT)
- **COMPUTED-STYLE (asıl):** /arastirma/ges GES finansal tablo `text-end` **25 hücre** → computed `end`; LTR→**sağ** (eski text-right ile AYNI = LTR piksel-aynı) · AR→**sol** (aynalandı)
- **GES CORE:** runGesLandEvaluation render korundu (kWh/MWh/NPV/IRR/₺ TR+AR'da görünür, 0 hata) → motor DOKUNULMADI
- **D1 byte-method + CSS spec** (logical=physical LTR) garantisi
- **AR AYNALAMA:** /arastirma/ges + dashboard üçlüsü AR dir=rtl; KPI/₺/grafik sayıları LTR (i18n)
- **REGRESYON:** /panel + /yatirimci + /profil + /arastirma/ges AR = 200 + rtl + **0 pageerror**
- Build YEŞİL — 299 entries · Lint 0

## 5) KALAN: D4 (kalan tüm sayfalar ~58) → FAZ 2 kapanış

## 6) Master 3 KARAR
1. D3 bitti (GES tabloları + intel panel RTL; dashboard üçlüsü zaten logical) — D4 (kapanış) hemen mi?
2. GES finansal tablo text-end (RTL'de sayılar sol-hizalı) — onay?
3. Dashboard üçlüsü 0-değişiklik (11-N..N-3 logical doğmuş) — doğrulandı, onay?

— **44 fiziksel→logical (GES finansal tablolar + PantsirPanel) · dashboard üçlüsü+GesForm zaten logical (0 değişiklik) · GES motoru render korundu · computed text-end 25 hücre LTR=sağ/AR=sol · className-only · build YEŞİL · 0 pageerror · AR dir=rtl.**
🌐🧭✅
