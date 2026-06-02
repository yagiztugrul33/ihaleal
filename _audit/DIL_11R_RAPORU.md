# 🌐 ADIM 11-R — CommissionCalculator i18n (fees-domain çekirdek, izole)

**Tarih:** 2026-06-03
**Tag baseline:** `safe-before-dil-11r` (d675ac3)
**Doktrin:** HESAP/LIB MANTIK DOKUNMA — sadece görünür string render katmanında. Komisyon oranı/formül/matrah/KDV DOKUNULMAZ. >50 + engine/legal-bağlı → BÖL.

---

## ⚡ TEK-CÜMLELİK ÖZET

CommissionCalculator (588 satır, ~85 string) **>50 → BÖLÜNDÜ**: **KOMİSYON ÇEKİRDEĞİ** (header + 3 adım + escrow + temel komisyon kartı + örnek + input + mahsup akışı + dağılım) **yeni `commissionCalc` namespace ~38 anahtarla 4 dilde** çevrildi; SERVICE_FEE_LABELS → **`serviceFees.labels` REUSE** (11-Q leak'i kapandı); **fees.ts + rentalCommissionEngine + masterFinancialEngine + commission/engine + komisyon oranı/formül/matrah/KDV/SERVICE_FEES SIFIR diff**; **ÇEKİRDEK HESAP korundu: bid-bond (5M×%5) 4 dilde AYNI ₺250.000**; oran interpolasyonu ({seller}/{buyer}/{vat}/{bond}/{b2b}) lib sabitlerinden korunarak; **5 anchor 4 dil ✅ + AR dir=rtl + 0 pageerror**; kiralık/devren (Madde 41-46) + kat karşılığı arsa + yatırımcı araçları (kredi/getiri/tapu/değer-artışı) → **11-R-2'ye ertelendi** (engine/legal-ağır).

---

## 1) BLOK 1 — Envanter + SINIFLANDIRMA + KAPSAM

### Sayfa: 588 satır, çok-bölümlü hesaplayıcı (~85 string) → BÖL
### ✅ 11-R (bu adım) — KOMİSYON ÇEKİRDEĞİ (~38 anahtar)
| Bölüm | Öğeler | Sınıf |
|---|---|---|
| Header + 3 adım | başlık + intro + Matrah/Dağılım/Karar | saf etiket |
| Escrow | başlık + gövde | saf etiket |
| Temel komisyon kartı | başlık + oran-desc (interp) + 6 satır (satıcı/alıcı komisyon+KDV, teminat, cayma) + dürüstlük notu | saf etiket (oran interp korundu) |
| Örnek | başlık + body (interp) + not | saf etiket |
| Input | satış tutarı + üyelik + **hizmet bedelleri (serviceFees.labels REUSE)** | saf etiket |
| Mahsup akışı | başlık + 4 kutu (interp) | saf etiket |
| Dağılım kartı | başlık + 5 satır (KDV/B2B interp) + negatif/dürüstlük notu | saf etiket |

### ⏭️ ERTELENEN → 11-R-2 [REVIEW] (engine/legal-ağır)
| Kart | Sebep |
|---|---|
| Kiralık ve devren (Madde 41-46, 66-68, 81-83) | rentalCommissionEngine + yasal Madde referansları + senaryo oranları |
| Kat karşılığı arsa (v2.3) | masterFinancialEngine + commission/engine + havuz dağılım formülleri |
| Yatırımcı araçları (kredi/kira getirisi/tapu harcı/değer artışı/aidat) | 5 ayrı sub-calc, farklı domain |

### 🔒 DOKUNULMAYAN (hesap/mantık değeri)
- Komisyon oranı (COMMISSION_RATE/SELLER_COMMISSION_RATE), KDV oranı (VAT_RATE), BID_BOND_RATE, WITHDRAWAL_PENALTY_RATE, REALTOR_B2B_RATE → sadece görünür %değer interpolasyonla
- `calcCommissionBreakdown`, SERVICE_FEES tutarları, MEMBERSHIP_FEES, tüm engine'ler → SIFIR
- Senaryo butonları + rentalSplit.lawRef (motor çıktısı) → DOKUNULMADI (ertelenen kartta)

---

## 2) BLOK 2 — Sözlük Uyum (komisyon dili tek)
| Terim | Kaynak | Bu adım |
|---|---|---|
| Alıcı/Satıcı komisyonu | 11-G commissionPlatformBuyer | tutarlı (Buyer/Seller commission) ✅ |
| KDV | 11-G commissionVat / fees | KDV/VAT/НДС/ضريبة القيمة المضافة AYNI ✅ |
| Hizmet bedeli etiketleri | **11-Q serviceFees.labels** | **REUSE** (8 etiket, leak kapandı) ✅ |
| Matrah | fees domain | Base/База/الوعاء tutarlı ✅ |
| TOPLAM ~615 terim |

---

## 3) BLOK 3 — Uygulama
### 3.1 `messages.ts` — yeni `commissionCalc` namespace (~38 anahtar, 4 dil)
- interpolasyon: basicRateDesc/exampleBody/mahsupBox/distKdv/distB2b/inputMembership → `.replace()` (lib %değer + tutar)
### 3.2 `CommissionCalculator.tsx`
- `+useLocale` → `cc = t.commissionCalc`
- Çekirdek 8 bölüm → `cc.*`; hizmet etiketleri → `t.serviceFees.labels[k]` (REUSE)
- `SERVICE_FEE_LABELS` import KALDIRILDI (artık serviceFees.labels)
- `data-testid="commission-total-with-vat"` `<p>`'ye taşındı (dış test yok, korundu)
- `dir="ltr"`: satış input + komisyon ₺ tutarları (dağılım/temel kart)
- rental/land/investor kartları + `SERVICE_FEES/calc/engine` → DOKUNULMADI

### 3.3 FEES/ENGINE/HESAP DOKUNULMADI (git diff = SIFIR)
```
fees.ts (oran/formül/SERVICE_FEES/MEMBERSHIP/calcCommissionBreakdown)   ZERO
rentalCommissionEngine + masterFinancialEngine + commission/engine     ZERO
CurrencyContext + FxRef + taxConfig                                    ZERO
```
git status → sadece `messages.ts` + `CommissionCalculator.tsx` ✅

---

## 4) BLOK 4 — RTL (AR)
- ✅ `<html dir="rtl">` + form/sonuç sağa hizalı
- ✅ Satış input + komisyon ₺ tutarları `dir="ltr"`
- ✅ Oran %değerleri interpolasyonla (BiDi); yeni physical class YOK

---

## 5) BLOK 5 — Test (4 dil + HESAP)
| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| Sayfa başlığı | Araçlar/Hesaplayıcılar | Tools/Calculators | Инструменты/Калькуляторы | الأدوات/الحاسبات |
| Satış tutarı label | ✅ | Sale/transaction | Сумма продажи | مبلغ البيع |
| Alıcı komisyonu | ✅ | Buyer commission | Комиссия покупателя | عمولة المشتري |
| Tahmini dağılım | ✅ | Estimated distribution | Ориентировочное распределение | التوزيع التقديري |
| Temel komisyon | ✅ | Basic commission | Базовый расчёт | حساب العمولة الأساسي |
| pageerror | 0 | 0 | 0 | 0 |

### 🔒 ÇEKİRDEK HESAP korundu (KANIT)
> **bid-bond (5.000.000 × %5) 4 dilde AYNI: `₺250.000`** + totalAmounts (₺5.000.000 / ₺240.000 / ₺250.000) 4 dilde tutarlı → komisyon oranı/formül/matrah DEĞİŞMEDİ. Currency korundu (ADIM 8).
- git diff: fees.ts/engine → SIFIR diff

### Not: tr_leak
`"Araçlar / Hesaplayıcılar"` en/ru/ar'da göründü = **ertelenen yatırımcı kartı başlığı** ("Araçlar / Hesaplayıcılar (yatırımcı)", line 527 → 11-R-2). Çekirdek h1 başlığı çevrildi (title=true). Rental/land/investor kartları kasıtlı TR ([REVIEW]).

### REGRESYON (AR smoke 4 sayfa)
/komisyon-hesaplayici + /hizmet-bedelleri + /ilan/1 + /panel → 200 + rtl + 0 pageerror

### Build + Lint
- PWA v1.3.0 — 299 entries (**6644.84 KiB**, +14 KiB) ✅
- 2 dosya 0 error / 0 warning

### Screenshots
`_audit/dil-11r/` → _test.mjs + komisyon-hesaplayici-{tr,en,ru,ar}.png (AR-RTL)

---

## 6) GÜNCEL SÖZLÜK — ~615 terim
- 11-Q sonu = 570 + **11-R (~38 + reuse)** = ~615 terim

---

## 7) ANAYASA KANITLARI
- ✅ Build YEŞİL — 299 entries (6644.84 KiB) · Lint 0
- ✅ Tag: `safe-before-dil-11r` (d675ac3) → `safe-after-dil-11r`
- ✅ PUSH → `git log origin/main..HEAD` BOŞ
- ✅ fees.ts/engine SIFIR diff · HESAP korundu (₺250.000 aynı) · SERVICE_FEE_LABELS leak kapandı

---

## 8) FEES-DOMAIN DURUMU
| Ekran | Durum |
|---|---|
| 11-G ilan detay komisyon hesaplayıcı (sidebar) | ✅ |
| 11-Q HizmetBedelleri (SERVICE_FEE_LABELS) | ✅ |
| **11-R CommissionCalculator ÇEKİRDEK** | ✅ |
| 11-R-2 CommissionCalculator (rental/land/investor) | ⏳ KALDI |

> **FEES-DOMAIN ÇEKİRDEĞİ KAPANDI** (komisyon/hizmet bedeli görünür yüzü 4 dilde). Kalan: CommissionCalculator'ın 3 özel hesaplayıcı kartı (engine/legal-ağır) → 11-R-2.

---

## 9) SONRAKİ
| # | İş |
|---|---|
| **FAZ 2 DALGA 2** | CSS logical/RTL — ilan/borsa (~34) |
| 11-R-2 | CommissionCalculator kalan (rental/land/investor — engine/legal) |
| 11-S | SEO meta/hreflang |
| [MAĞAZA] | Mağaza modeli FİNAL kilit |
| 11-O | Emlakçı/Müteahhit panel · FAZ 3 yasal toplu |
| BACKLOG | CreateAuction · ChatWidget · report-viewer · E2E · AI çok-dilli |

---

## 10) Master için 3 KARAR
1. **Komisyon çekirdeği bitti** — 11-R-2 (rental/land/investor) hemen mi, FAZ 2 DALGA 2 (CSS) mi, mağaza kararı mı?
2. **11-R-2 engine/legal:** Madde 41-46 referansları + havuz formülleri var — FAZ 3 yasal turuyla mı yapılsın?
3. **MAĞAZA + FAZ 3:** mağaza FİNAL kilidi + avukat onaylı yasal toplu ne zaman?

---

— **CommissionCalculator çekirdeği (header+escrow+temel komisyon+örnek+input+mahsup+dağılım) ~38 anahtar 4 dilde · serviceFees.labels REUSE (11-Q leak kapandı) · fees.ts/engine/oran/formül/matrah/KDV SIFIR diff · ÇEKİRDEK HESAP korundu (bid-bond ₺250.000 4 dilde aynı) · 5 anchor 4 dil ✅ · AR dir=rtl · 0 pageerror · rental/land/investor → 11-R-2 (engine/legal) · ~615 terim · FEES-DOMAIN ÇEKİRDEĞİ KAPANDI.**
🌐🏛️🔒✅
