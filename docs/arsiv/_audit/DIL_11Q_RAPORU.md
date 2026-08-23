# 🌐 ADIM 11-Q — SERVICE_FEE_LABELS i18n (11-P'nin ertelenen parçası, izole)

**Tarih:** 2026-06-03
**Tag baseline:** `safe-before-dil-11q` (52ccfd4)
**Doktrin:** LIB/HESAP MANTIK DOKUNMA — sadece görünür string render katmanında. Riskli/incoherent → [REVIEW] + atla. fees.ts SIFIR diff.

---

## ⚡ TEK-CÜMLELİK ÖZET

11-P'de [REVIEW] bırakılan `SERVICE_FEE_LABELS` (fees.ts, 8 hizmet adı) — render yeri **HizmetBedelleri** (/hizmet-bedelleri) sayfası **tam i18n** edildi (labels + descriptions + chrome) **yeni `serviceFees` namespace 27 anahtar (+16 nested) 4 dilde**; **fees.ts/SERVICE_FEES tutar + supabase insert + %5 (BID_BOND_RATE) + currency SIFIR diff**; ikinci tüketici **CommissionCalculator (mega, i18n'siz büyük sayfa) → [REVIEW] ertelendi** (incoherent kısmi bağlama yapılmadı); **ÇEKİRDEK HESAP korundu: ₺45.000 + ₺40.000 hizmet bedeli 4 dilde AYNI** (SERVICE_FEES dokunulmadı); ekspertiz=11-G-2 ile tutarlı; **5 anchor + 8 açıklama 4 dilde RENDER ✅ + AR dir=rtl + 0 pageerror**; görünür gövdede TR sızıntısı 0 (kalan "Hizmet bedelleri" yalnız SEO `<head><title>` → ayrı SEO domain).

---

## 1) BLOK 1 — Envanter + SINIFLANDIRMA

| String grubu | Kaynak | Sınıf | KARAR |
|---|---|---|---|
| `SERVICE_FEE_LABELS` (8 hizmet adı) | fees.ts | **SAF ETİKET** (SERVICE_FEES tutar ayrı) | ✅ `sf.labels[key]` render'da |
| `SERVICE_DESCRIPTIONS` (8 açıklama) | HizmetBedelleri.tsx local | **SAF ETİKET** | ✅ `sf.descriptions[key]` (local const kaldırıldı) |
| `SERVICE_FEE_DYNAMIC.bid_entry` (%5 etiketi) | fees.ts | **SAF ETİKET** (%5 oran korunur) | ✅ `sf.dynamicBidEntry` |
| Sayfa chrome (başlık, 3 intro, butonlar, özet) | HizmetBedelleri.tsx | **SAF ETİKET** | ✅ tam i18n |
| `SERVICE_FEES[key]` (₺ tutar) | fees.ts | **HESAP DEĞER** | 🔒 DOKUNULMADI |
| `supabase.from("service_fees").insert` + `amount_try` | HizmetBedelleri.tsx | **ÇEKİRDEK** (DB yazımı) | 🔒 DOKUNULMADI |
| `SERVICE_FEE_LABELS` @ **CommissionCalculator.tsx** | fees.ts | saf etiket ama sayfa i18n'siz | **[REVIEW]** → ayrı tur |

### Render yerleri
- **HizmetBedelleri.tsx** (/hizmet-bedelleri) — küçük dedike hizmet sayfası → **TAM i18n** (coherent)
- **CommissionCalculator.tsx** (/komisyon-hesaplayici, mega) — büyük i18n'siz sayfa → **[REVIEW] ertelendi** (11-P doktrini: tek etiketi çevirip sayfayı TR bırakmak incoherent; SERVICE_FEE_LABELS lib'i TR fallback olarak duruyor, o sayfa kendi i18n adımında — öneri **11-R**)

### Yöntem: lib (fees.ts) DOKUNULMADI
- `serviceFees` namespace messages.ts'e eklendi; HizmetBedelleri render'da `sf.*` kullanıyor.
- fees.ts'in SERVICE_FEE_LABELS/SERVICE_DESCRIPTIONS(local)/SERVICE_FEE_DYNAMIC sabitleri **aynen duruyor** (CommissionCalculator + diğer tüketiciler için TR fallback).
- SERVICE_FEES (tutar) + supabase insert **HİÇ değişmedi**.

---

## 2) BLOK 2 — Sözlük Uyum
| Terim | Kaynak | Bu adım |
|---|---|---|
| Ekspertiz Raporu | ld.expPanelTitle (11-G-2) | serviceFees.labels.expertise = "Appraisal Report"/"Отчёт об оценке"/"تقرير التقييم" **BİREBİR** ✅ |
| Sanal Tur 360° | ld.ovVirtualTourTitle (11-G-2) | "360° Virtual Tour" tutarlı ✅ |
| %5 (dinamik bloke) | BID_BOND_RATE / 11-G-3 | oran korundu, etiket çevrildi ✅ |
| TOPLAM ~570 terim |

---

## 3) BLOK 3 — Uygulama
### 3.1 `messages.ts` — yeni `serviceFees` namespace (27 + 16 nested anahtar, 4 dil)
- `ServiceFeesMessages` tipi + `Messages.serviceFees`
- chrome(11) + dynamicBidEntry(1) + labels{8} + descriptions{8} (nested Record)
- EN base + TR + RU override + AR override (deep-merge)

### 3.2 `HizmetBedelleri.tsx` — tam i18n
- `+ useLocale` → `sf = t.serviceFees`
- Local `SERVICE_DESCRIPTIONS` const KALDIRILDI → `sf.descriptions[key]`
- `SERVICE_FEE_LABELS[key]` → `sf.labels[key]` (import'tan kaldırıldı)
- `SERVICE_FEE_DYNAMIC[key] ? sf.dynamicBidEntry : <span dir="ltr">₺...` (check korundu, ₺ dir=ltr)
- chrome + buy() mesajları (`sf.loginFirst`, `sf.recordCreated.replace("{label}",…)`) → `sf.*`
- **supabase insert + SERVICE_FEES tutar → DOKUNULMADI** (kod yorumu ile işaretlendi)

### 3.3 FEES/LIB/HESAP DOKUNULMADI (git diff = SIFIR)
```
fees.ts (SERVICE_FEES tutar + SERVICE_FEE_LABELS/DYNAMIC + komisyon/oran)   ZERO
CurrencyContext + FxRef + taxConfig + supabase.ts                          ZERO
placeBid + listingPolicy + sealed + auth + diğer namespaces                ZERO
```
git status → sadece `messages.ts` + `HizmetBedelleri.tsx` ✅

---

## 4) BLOK 4 — RTL + BiDi (AR)
- ✅ `<html dir="rtl">` (test) + hizmet kartları sağdan akar
- ✅ ₺ hizmet bedeli `dir="ltr"` (span); dinamik %5 etiketi akışta
- ✅ Yeni physical class YOK

---

## 5) BLOK 5 — Test (4 dil + ÇEKİRDEK HESAP)

### Matris
| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| Sayfa başlığı | Hizmet bedelleri | Service fees | Стоимость услуг | رسوم الخدمات |
| labels.expertise | Ekspertiz Raporu | Appraisal Report | Отчёт об оценке | تقرير التقييم |
| Satın al butonu | ✅ | Buy | Купить | اشترِ |
| Model özeti | ✅ | Service model summary | Сводка модели услуг | ملخّص نموذج الخدمة |
| Açıklama (expertise) | ✅ | ✅ | ✅ | ✅ |
| dinamik %5 | ✅ | ✅ | ✅ | ✅ |
| Görünür gövde TR sızıntısı | — | **0 ✅** | **0 ✅** | **0 ✅** |
| pageerror | 0 | 0 | 0 | 0 |

> **`tr_leak "Hizmet bedelleri"`:** yalnız SEO `<head><title>` ("Hizmet bedelleri — ihaleal.com", `seo.ts:230`); **görünür gövdede YOK** (`leak_in_visible_body: false`, body "Service fees" gösteriyor). SEO meta başlıkları ayrı domain → **[REVIEW] SEO i18n / hreflang (FAZ 3)**. Diğer kaynaklar (nasilCalisirContent/assistantEngine nav-data, faq.ts, ChatWidget) bu sayfada render olmuyor; kendi i18n adımlarında.

### ÇEKİRDEK HESAP korundu (KANIT)
> **₺45.000 (legal) + ₺40.000 (expertise) hizmet bedeli 4 dilde AYNI** → SERVICE_FEES tutarları + supabase insert DEĞİŞMEDİ. Currency (₺) korundu (ADIM 8).
- git diff: fees.ts → **SIFIR diff**

### REGRESYON (AR smoke 5 sayfa)
/hizmet-bedelleri + /ilan/1 + /ihaleler + /panel + **/komisyon-hesaplayici** → http 200 + rtl + 0 pageerror
> /komisyon-hesaplayici (CommissionCalculator, ertelendi) çalışıyor — TR kalıyor, kırılma yok.

### Build + Lint
- PWA v1.3.0 — 299 entries (**6630.52 KiB**, +11.02 KiB) ✅
- 2 dosya 0 error / 0 warning (local const + kullanılmayan import temizlendi)

### Screenshots
`_audit/dil-11q/` → _test.mjs + hizmet-bedelleri-{tr,en,ru,ar}.png (AR-RTL)

---

## 6) GÜNCEL SÖZLÜK — ~570 terim
- 11-P sonu = 543 + **11-Q (~27 yeni)** = ~570 terim, 4 dilde tutarlı

---

## 7) ANAYASA KANITLARI
- ✅ Build YEŞİL — 299 entries (6630.52 KiB)
- ✅ Lint 0 error
- ✅ Tag: `safe-before-dil-11q` (52ccfd4) → `safe-after-dil-11q`
- ✅ PUSH → `git log origin/main..HEAD` BOŞ
- ✅ **fees.ts SIFIR diff** · ÇEKİRDEK HESAP korundu (₺45.000+₺40.000 aynı) · currency korundu

---

## 8) DİL FAZ-1 ÜRÜN/İLAN TARAFI DURUMU
| Alan | Durum |
|---|---|
| Navbar/Onboarding/Hero/Pricing/Payment | ✅ (ADIM 11/12) |
| İlan detay (chrome+tab+modal+buy-now) | ✅ (11-G..G-4) |
| Borsa/Mega menü/Footer/Tier | ✅ (ADIM 14/15/16) |
| Kredi/Değerleme/Mortgage/DataAnalysis/GES/Dashboard üçlüsü | ✅ (ADIM 17/L/H/N + 11-N-2/3) |
| Lib sabitleri (marketing/weekly/FxRef) | ✅ (11-P) |
| **Hizmet bedelleri sayfası** | ✅ (11-Q) |

> **DİL FAZ-1 ürün/ilan tarafı büyük ölçüde KAPANDI.** Kalan [REVIEW] (ayrı turlar):
> - **CommissionCalculator** (mega) full i18n → 11-R
> - **CreateAuction** (satıcı tarafı) → ayrı
> - **SEO meta başlıkları** (seo.ts, tüm rotalar) + hreflang → FAZ 3
> - **ChatWidget + assistantEngine** (asistan) → ayrı
> - **report-viewer alt-bileşenleri** (PropertyAnalysisReportViewer/PantsirPanel) → ayrı
> - **FAZ 3 yasal toplu** (KVKK/Cayma/BID_GATE/Hemen Al/MODULE3/MESAFELİ + tarih Intl)

---

## 9) SONRAKİ
| # | İş |
|---|---|
| **[MAĞAZA]** | Mağaza modeli FİNAL kilit + yasal zemin (Master kararı bekliyor) |
| 11-R | CommissionCalculator full i18n (SERVICE_FEE_LABELS oradaki kullanım dahil) |
| 11-O | Emlakçı + Müteahhit panel (mağaza sonrası) |
| FAZ 2 | 359 fiziksel CSS → logical RTL (toplu) |
| FAZ 3 | Yasal toplu + SEO hreflang + tarih Intl + avukat |
| BACKLOG | Supabase staging E2E · AI çok-dilli yanıt · CreateAuction · ChatWidget/assistant · report-viewer |

---

## 10) Master için 3 KARAR
1. **Hizmet sayfası bitti** — CommissionCalculator (11-R) hemen mi, yoksa mağaza/panel kararına mı geçilsin?
2. **DİL FAZ-1 ürün/ilan tarafı kapandı** — kalan [REVIEW] kümeleri (CommissionCalculator/CreateAuction/SEO/ChatWidget/report-viewer) öncelik sırası nedir?
3. **MAĞAZA + FAZ 3 yasal:** mağaza FİNAL kilidi + avukat onaylı yasal toplu çeviri ne zaman tetiklensin?

---

— **SERVICE_FEE_LABELS render yeri (HizmetBedelleri) tam i18n: 8 etiket + 8 açıklama + chrome · yeni serviceFees namespace 4 dilde · fees.ts/SERVICE_FEES tutar/supabase insert/%5 SIFIR diff · CommissionCalculator incoherent→[REVIEW] 11-R · ÇEKİRDEK HESAP korundu (₺45.000+₺40.000 4 dilde aynı) · ekspertiz=11-G-2 tutarlı · 5 anchor+açıklama 4 dil RENDER ✅ · AR dir=rtl · görünür gövde TR sızıntısı 0 (kalan yalnız SEO head) · 0 pageerror · regresyon temiz (5 sayfa) · ~570 terim · DİL FAZ-1 ürün/ilan tarafı büyük ölçüde KAPANDI.**
🌐🏛️🔒✅
