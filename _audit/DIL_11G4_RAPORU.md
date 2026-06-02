# 🌐 ADIM 11-G-4 — İlan Detay SON PARÇA: buy-now + bilgi dialogları (İLAN DETAY TAM KAPANDI)

**Tarih:** 2026-06-03
**Tag baseline:** `safe-before-dil-11g4` (1cd534d)
**Doktrin:** KÜÇÜK ama LEGAL-SINIR HASSAS. NON-LEGAL UI etiketi çevrilir; **bağlayıcı legal GÖVDE + @/legal/* + buyNow/payment/sealed/çekirdek SIFIR diff** → FAZ 3. Şüphede legal say.

---

## ⚡ TEK-CÜMLELİK ÖZET

İlan detayın son kalan parçası — **buy-now akış dialogları** (Blokaj ön yetkisi + Hemen Al kapısı non-legal + kart ön yetkisi + işlemi tamamla), **bilgi dialogları** (Piyasa raporu analizi + Resmi belgeler özeti + Sanal Tur), **buy-now toast'ları** (ön yetki reddedildi / risk skoru / blokaj kaydedildi / tebrikler kazandınız {amount}) ve buy-now/mortgage/message tooltip'leri — **52 yeni NON-LEGAL anahtarla 4 dilde** çevrildi; **buyNow/preAuthorize/payment akışı + @/legal/* (MASTER_LEGAL_DISCLAIMER, BID_GATE_CHECKBOXES, HEMEN_AL_* gövdeleri, MODULE3, MESAFELİ onayı, cayma/iade satırı) + placeBid/sealed/doğrulama-rozeti + fees/Currency SIFIR diff**; **RENDER (4 dil): bilgi dialogları açıldı + 5 anchor doğru + 0 pageerror + AR dir=rtl**, **BUNDLE: buy-now dialog/toast'ları 4 dilde derlendi**; legal gövdeler FAZ 3'e bırakıldı. **🎯 İLAN DETAY TAM KAPANDI** (11-G + 11-G-2 + 11-G-3 + 11-G-4; geriye yalnız FAZ 3 yasal gövdeler).

---

## 1) BLOK 1 — Envanter + KAPSAM (LEGAL/NON-LEGAL ayrımı = bu adımın kalbi)

### ✅ NON-LEGAL — ÇEVRİLDİ (52 yeni anahtar)
| Bölüm | Öğeler | Tür |
|---|---|---|
| Paylaşılan | close + understood + processing | buton |
| Piyasa raporu dialog | başlık + bilgi gövdesi (dürüstlük) + dosya/no-file + Analiz sayfası + Kapat | bilgi |
| Resmi belgeler dialog | başlık + bilgi gövdesi + beyan var/yok + 3 madde + Anladım | bilgi |
| Blokaj ön yetkisi dialog | başlık + tutar notu ({amount}/{base}/{pct}) + kazanç notu + demo notu + kart token + Ön yetkilendir | finansal bilgi |
| Hemen Al kapısı | Kart ve 3DS + devam butonu | buton/etiket |
| Kart ön yetkisi (buy-now) | başlık + tutar/blokaj notu ({amount}/{pct}) + demo notu + Blokajı başlat | finansal bilgi |
| İşlemi tamamla | başlık + Tutar/komisyon notu ({amount}) + Kaydediliyor/kapat + Atomik RPC | finansal bilgi |
| Sanal Tur dialog | başlık (reuse) + Entegrasyon + açıklama + "Henüz eklenmemiş" | bilgi |
| Buy-now toast (9) | ön yetki reddedildi/risk/blokaj kaydedildi/yerel/AI onay/blokaj tamamla/onay kutusu/tebrikler×2 | toast |
| Tooltip (5) | buy-now gate/mock + Kredi Hesapla + Mesajlaş + mobil bar aria | tooltip/a11y |

### ⏭️ BAĞLAYICI LEGAL GÖVDE → FAZ 3 (ÇEVRİLMEDİ — DOKUNULMADI)
| Öğe | Sebep |
|---|---|
| `MASTER_LEGAL_DISCLAIMER` (bid + Hemen Al) | @/legal sabiti — bağlayıcı |
| `BID_GATE_CHECKBOXES` (teklif zorunlu onaylar) | @/legal — yasal onay |
| `HEMEN_AL_GATE_TITLE/INTRO/MASAK/CARD/DOCS_BLOCK` + `MODULE3_HEMEN_AL_ACCEPTANCE` + `HEMEN_AL_CONTRACT_LINKS` | @/legal — bağlayıcı gövde |
| Hemen Al kapısı 4 onay checkbox metni (inline) | yasal onay beyanı |
| "MESAFELI SATIS... tekrar onaylıyorum" (buy-now confirm) | yasal onay beyanı |
| "Cayarsanız yaklaşık %10 kesinti... cayma politikası" | **cayma/iade şartı** — bağlayıcı (kod yorumu ile işaretlendi) |

### ❌ [REVIEW] (DOKUNULMADI)
- `fees.ts` "Ekspertiz Raporu" / `MARKETING_MODE_LABELS` / `WEEKLY_*` / FxRef note → **11-P lib turu**
- `result.message` / `pr.error` (backend) → motor çıktısı
- `auction.virtualTour` / `auction.*PdfName` → kullanıcı/veri

> **KAPSAM:** 52 NON-LEGAL anahtar (50 hedefini 2 aştı — 4 trivial tooltip + 1 a11y aria-label tam kapanış için dahil; ayrı adıma bölmek anlamsız). Legal gövdeler zaten FAZ 3'te.

---

## 2) BLOK 2 — Sözlük Uyum
| Terim | Kaynak | Bu adım |
|---|---|---|
| Hemen Al | ld.ctaBuyNow (ADIM 13) | mevcut, tutarlı ✅ |
| Vazgeç (cancel) | 11-G-3 ld.cancel | **REUSE** (5 dialog) ✅ |
| Giriş yapın (toast) | 11-G-3 ld.toastLogin | **REUSE** ✅ |
| Giriş gerekli / Önce AI raporunu onaylayın (tooltip) | 11-G ld.loginRequired/reportApproval | **REUSE** (buy-now buton) ✅ |
| 360° Sanal Tur | 11-G-2 ld.ovVirtualTourTitle | **REUSE** (sanal tur dialog) ✅ |
| İşleniyor... (processing) | yeni, 2 dialog ortak | AYNI key ✅ |
| TOPLAM ~537 terim |

### KRİTİK kısa uyarı (non-legal) anlam korunarak
"Blokaj tutarı: ₺{amount}..." · "Hemen Al tutarı: ₺{amount}" · "Risk skoru yüksek — manuel inceleme" → 4 dilde net, {amount}/{pct} interpolasyon + ₺ dir=ltr.

---

## 3) BLOK 3 — Uygulama
### 3.1 `messages.ts` — `listingDetail` +52 anahtar (4 dil)
### 3.2 `AuctionDetail.tsx`
- 4 buy-now dialog + 3 bilgi dialog NON-LEGAL etiketleri → `ld.*`
- 9 buy-now toast (window.alert + toastBid) → `ld.*` (yalnız string argümanı; akış/return DEĞİŞMEDİ)
- 5 tooltip + mobil aria → `ld.*`
- `{amount}/{base}/{pct}` `.replace()` interpolasyon
- `dir="ltr"`: dialog ₺ tutarları + kart token input + URL + sayısal notlar
- **@/legal gövdeleri + 4 checkbox + MESAFELİ + cayma satırı → kod yorumu ile işaretlenip DOKUNULMADI**

### 3.3 ÇEKİRDEK + @/legal DOKUNULMADI (git diff = SIFIR)
```
buyNow + preAuthorize + payment + registerBidDeposit akış/koşul   ZERO
placeBidRpc + handleBid + SEALED maskeleme                        ZERO
DOĞRULANDI ROZETİ KOŞULU (verified===true)                       ZERO
fees.ts + CurrencyContext + FxRef (₺+≈$)                         ZERO
@/legal/* (master/bidGate/hemenAl/module3) + CaymaPolitikasi      ZERO
auth + supabase + RLS + LocaleContext + alt-bileşenler + namespaces  ZERO
```
git status → sadece `messages.ts` + `AuctionDetail.tsx` ✅

---

## 4) BLOK 4 — RTL + BiDi (AR)
- ✅ `<html dir="rtl">` (test) + dialog sağa hizalı
- ✅ Sayı/₺ LTR: blokaj/Hemen Al/komisyon tutarları (`dir="ltr"` + `.text-start`), kart token input, sanal tur URL
- ✅ {amount}/{pct} interpolasyon BiDi-izole
- ✅ Yeni physical class EKLENMEDİ (ms-/me-/text-start); 359 toplu = FAZ 2

---

## 5) BLOK 5 — Test (2 katmanlı, dürüst)

### Katman 1 — RENDER (Playwright, 4 dil) — bilgi dialogları AÇILDI (auth-gated DEĞİL)
| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| Piyasa dialog açıldı + başlık | ✅ | ✅ Market report analysis | ✅ Анализ рыночного отчёта | ✅ تحليل تقرير السوق |
| Analiz sayfasına git | ✅ | ✅ Go to analysis page | ✅ Перейти на страницу | ✅ الانتقال إلى صفحة التحليل |
| Resmi dialog açıldı + başlık | ✅ | ✅ Official documents summary | ✅ Сводка официальных | ✅ ملخّص المستندات الرسمية |
| İmar durumu (madde) | ✅ | ✅ Zoning status | ✅ Статус зонирования | ✅ حالة التنظيم |
| Anladım (buton) | ✅ | ✅ Got it | ✅ Понятно | ✅ فهمت |
| ₺ korundu | ✅ | ✅ | ✅ | ✅ |
| TR sızıntısı (non-TR) | — | 0 ✅ | 0 ✅ | 0 ✅ |
| pageerror | 0 | 0 | 0 | 0 |

### Katman 2 — DERLEME (dist bundle) — buy-now dialog/toast (auth-gated) 4 dilde
✅ `Blokaj ön yetkisi` / `Pre-authorization hold` / `Предавторизационная` / `تفويض الحجز المسبق`
✅ `Hemen Al — işlemi tamamla` / `Buy Now — complete`
✅ `ihaleyi kazandınız` / `won the auction` / `выиграли аукцион` / `فزت بالمزاد`
> Buy-now dialogları auth gerektirir (isSupabaseConfigured()=false preview) → sandbox'ta açılamaz; binding **build ile tip-güvenli** + bilgi dialogları RENDER mekanizmasını kanıtlıyor.

### ÇEKİRDEK/LEGAL korundu (KANIT — git diff)
- buyNow/preAuthorize/payment akışı → SIFIR diff
- @/legal gövdeleri (master/bidGate/hemenAl/module3/cayma) → ÇEVRİLMEDEN duruyor (sadece tetikleyici buton/başlık)
- SEALED maskeleme + doğrulandı rozeti `verified===true` → SIFIR diff
- Currency (FxRef ₺+≈$) → korundu

### REGRESYON (AR smoke 5 sayfa)
/ilan/1 + /ihaleler + /panel + /borsa + /profil → http 200 + rtl + 0 pageerror; yalnız messages.ts (additive) + AuctionDetail.tsx

### Build + Lint
- PWA v1.3.0 — 299 entries (**6617.26 KiB**, +15.06 KiB) ✅
- 2 dosya 0 error / 0 warning

### Screenshots
`_audit/dil-11g4/` → _test.mjs + ilan-buynow-{tr,en,ru,ar}.png (resmi belgeler dialog açık, AR-RTL)

---

## 6) GÜNCEL SÖZLÜK — ~537 terim
- 11-G-3 sonu = 485 + **11-G-4 (52 yeni)** = ~537 terim, 4 dilde tutarlı

---

## 7) ANAYASA KANITLARI
- ✅ Build YEŞİL — 299 entries (6617.26 KiB)
- ✅ Lint 0 error
- ✅ Tag: `safe-before-dil-11g4` (1cd534d) → `safe-after-dil-11g4`
- ✅ PUSH → `git log origin/main..HEAD` BOŞ
- ✅ buyNow/payment/@legal/sealed/çekirdek SIFIR diff · doğrulama rozeti dürüstlük korundu

---

## 8) 🎯 İLAN DETAY TAM KAPANDI
| Adım | Kapsam | Durum |
|---|---|---|
| 11-G | Ana statik görünüm (chrome+hero+sidebar+geri sayım) | ✅ |
| 11-G-2 | Tab içerikleri + AI öneri + ekspertiz paneli | ✅ |
| 11-G-3 | Teklif (bid) modal + bid toast + bid tooltip | ✅ |
| **11-G-4** | **Buy-now akışı + bilgi dialogları + buy-now toast + tooltip** | ✅ |

> **İLAN DETAY (AuctionDetail.tsx, 2178+ satır) NON-LEGAL UI %100 ÇEVRİLDİ.** Geriye yalnız **FAZ 3 yasal gövdeler** (@/legal/*: KVKK, Cayma, BID_GATE, HEMEN_AL/MODULE3/MESAFELİ, MASTER_LEGAL_DISCLAIMER) + tarih Intl kaldı — bunlar avukat onayı normumuz gereği toplu FAZ 3'te.

---

## 9) SONRAKİ
| # | İş |
|---|---|
| **11-P** | Lib sabitleri (fees.ts "Ekspertiz Raporu" + MARKETING_MODE_LABELS + WEEKLY_* + FxRef note) — currency/çekirdek-domain İZOLE + DİKKATLİ tur |
| 11-O | Emlakçı + Müteahhit panel |
| Rapor-viewer | PropertyAnalysisReportViewer + PantsirPanel (ayrı ünite) |
| FAZ 2 | 359 fiziksel CSS → logical RTL |
| FAZ 3 | Yasal toplu: KVKK + Cayma + BID_GATE + Hemen Al/MODULE3/MESAFELİ + buy-now legal gövde + PDF 4 dil + tarih Intl + avukat onayı |
| BACKLOG | Supabase staging E2E (teklif/buy-now/profil auth-arkası) · AI çok-dilli yanıt (motor/prompt) |

---

## 10) Master için 3 KARAR
1. **İlan detay bitti** — sıra 11-P (lib sabitleri, izole) mi, 11-O (emlakçı/müteahhit panel) mı?
2. **Legal toplu FAZ 3:** ilan detayda 6 grup legal gövde (KVKK/Cayma/BID_GATE/Hemen Al blokları/MODULE3/MESAFELİ) biriktirildi — FAZ 3'te avukat onaylı toplu çeviri planı doğru mu?
3. **E2E backlog:** auth-arkası akışların (teklif gönderimi, buy-now tamamlama, profil kaydet) gerçek doğrulaması için Supabase staging E2E turu ne zaman açılsın?

---

— **Buy-now + bilgi dialogları + buy-now toast + tooltip 52 NON-LEGAL öğe 4 dilde · buyNow/payment/@legal/placeBid/sealed/Currency + doğrulama-rozeti SIFIR diff · LEGAL gövde 6 grup FAZ 3'e (şüphede legal say) · ₺ dir=ltr + {amount} interpolasyon · RENDER 4 dil (bilgi dialog açık) ✅ + BUNDLE 4 dil (buy-now) ✅ · TR sızıntısı 0 · 0 pageerror · AR dir=rtl · regresyon temiz (5 sayfa) · ~537 terim · 🎯 İLAN DETAY TAM KAPANDI.**
🌐🏛️🔒✅
