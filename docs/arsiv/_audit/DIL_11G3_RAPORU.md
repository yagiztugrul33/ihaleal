# 🌐 ADIM 11-G-3 — İlan Detay TEKLİF MODAL + bid toast (EN HASSAS DİL ADIMI)

**Tarih:** 2026-06-03
**Tag baseline:** `safe-before-dil-11g3` (0029c74)
**Doktrin:** EN HASSAS adım — teklif verme akışı + sealed + para. DAR + maksimum dikkat. **placeBidRpc/handleBid/validasyon/min-artış/sealed maskeleme + doğrulama-rozeti KOŞULU SIFIR diff** — yalnız etiket/toast string'i çevrildi. KVKK/Cayma/legal GÖVDE → FAZ 3.

---

## ⚡ TEK-CÜMLELİK ÖZET

İlan detayın **teklif (bid) modal'ı** (maliyet başlığı, tutar etiketi+input `dir=ltr`, proxy bid paneli, zorunlu-onaylar başlığı, Vazgeç, footer tooltip) + **bid-akışı toast'ları** (handleBid: ihale sona erdi / geçersiz teklif / min teklif / gate / duplicate / kayıt / demo — interpolasyonla `{amount}`) + **bid/negotiate buton tooltip'leri** (mevcut `loginRequired/reportApproval/depositRequired/cantBidOwn`'a bağlandı) + offer toast **22 yeni anahtarla 4 dilde** çevrildi; **placeBidRpc + handleBid akışı/validasyonu/min-artış + sealed maskeleme + doğrulama rozeti KOŞULU + fees.ts + Currency + bidGateAgreement/payment/buyNow legal'leri SIFIR diff**; kritik uyarılar (min teklif, geçersiz teklif) anlamı koruyarak; **RENDER (4 dil): bid buton etiketi + tooltip doğru + 0 pageerror + AR dir=rtl**, **BUNDLE: 10 modal/toast string'i 4 dilde derlendi**; KVKK/legal gövdeler → FAZ 3, **buy-now akışı + bilgi dialogları → 11-G-4** (KAPSAM BÖLÜNDÜ).

---

## 1) BLOK 1 — Envanter + KAPSAM (BÖL — teklif modal MUTLAKA bu adımda)

### Durum
- Kalan modallar envanteri ≈ **78 çevrilebilir string** → **>50 → BÖL.**

### ✅ BU ADIM (11-G-3) — TEKLİF (bid) akışı (22 yeni anahtar)
| Bölüm | Öğeler |
|---|---|
| Teklif modal | bidCostTitle + bidCostNote ({pct}) + bidAmountLabel + bidAmountPlaceholder + proxy paneli (title/desc/aria/maxLabel/placeholderPrefix/demoNote) + bidGateTitle + cancel + bidGateTooltip |
| Bid toast (handleBid) | toastAuctionEnded + toastInvalidBid + toastMinBid ({amount}) + toastBidGate + toastDuplicate + toastBidSaved ({amount}) + toastDemoBid |
| Offer toast | toastOfferSubmitted |
| Genel toast | toastLogin ("Giriş yapın.") |
| Tooltip (reuse) | desktop+mobil bid butonu → loginRequired/reportApproval/depositRequired ; negotiate → loginRequired/cantBidOwn |

### ⏭️ ERTELENEN → 11-G-4 (İLAN DETAY son parça)
| Grup | İçerik |
|---|---|
| Buy-now akışı dialogları | preAuth (Blokaj ön yetkisi) + Hemen Al kapısı (non-legal: Kart ve 3DS, devam butonu) + preAuth buy-now + buy-now confirm |
| Buy-now toast'ları | runPreAuth/runPreAuthBuyNow/executeBuyNowConfirm (ön yetki reddedildi, risk skoru, blokaj kaydedildi, tebrikler kazandınız {amount}, vb.) |
| Bilgi dialogları | Piyasa raporu analizi + Resmi belgeler özeti + Sanal Tur dialog |
| Tooltip | buy-now buton tooltip + Kredi Hesapla + Mesajlaş |

### ⏭️ ERTELENEN → FAZ 3 (yasal/avukat — bağlayıcı GÖVDE)
- `MASTER_LEGAL_DISCLAIMER` (bid modal + Hemen Al)
- KVKK kimlik-gizleme metni (bid modal, `<strong>` gömülü)
- `BID_GATE_CHECKBOXES` (bid modal zorunlu onay metinleri — legal)
- `HEMEN_AL_GATE_TITLE/INTRO/MASAK/CARD/DOCS_BLOCK` + `MODULE3_HEMEN_AL_ACCEPTANCE` + Hemen Al checkbox'ları + `MESAFELI SATIS...` onayı + `HEMEN_AL_CONTRACT_LINKS`

### ❌ Çevrilmeyen / [REVIEW] (DOKUNULMADI)
| Öğe | Sebep |
|---|---|
| `placeBidRpc` + `handleBid` akış/validasyon/min-artış | **Teklif motoru/çekirdek** — sadece toast string'i |
| `res.message` (backend yanıt) | **Motor çıktısı** |
| `maskBidder` / sealed kimlik | **KVKK maskeleme** — DB-seviyesi, UI-blur değil |
| `auction.title` | **Kullanıcı içeriği** |
| `MARKETING_MODE_LABELS` / `WEEKLY_*` / `fees.ts` / FxRef note | **[REVIEW] 11-P** lib turu |

---

## 2) BLOK 2 — Sözlük Uyum + KRİTİK AKSİYON

### Ortak terimler (ZORUNLU aynı — kontrol edildi)
| Terim | Kaynak | Bu adım |
|---|---|---|
| Teklif Ver (modal başlık/buton) | ld.ctaBid/ctaBidSubmit (ADIM 13/11-N) | mevcut, AYNI ✅ |
| Giriş gerekli (tooltip) | ld.loginRequired (11-G) | **REUSE** ✅ |
| Önce AI raporunu onaylayın | ld.reportApproval (11-G) | **REUSE** ✅ |
| Blokaj ön yetkisi gerekli | ld.depositRequired (11-G) | **REUSE** ✅ |
| Kendi ilanınıza teklif veremezsiniz | ld.cantBidOwn (11-G) | **REUSE** ✅ |
| Teklif için giriş yapın | ld.bidLoginRequired (ADIM 13) | **REUSE** (toast) ✅ |
| Tüm sözleşme/beyan kutuları | ld.bidAcceptRequired (ADIM 13) | **REUSE** (toast) ✅ |

### KRİTİK AKSİYON çevirisi — anlam KORUNARAK (yumuşatma/çarpıtma YOK)
| Türkçe | İngilizce | Rusça | Arapça |
|---|---|---|---|
| Teklif en az ₺{amount} olmalı. | Bid must be at least ₺{amount}. | Ставка должна быть не менее ₺{amount}. | يجب ألا يقل العرض عن ₺{amount}. |
| Geçerli bir teklif tutarı girin (pozitif tam sayı...) | Enter a valid bid amount (positive integer...) | Введите корректную сумму ставки (целое положительное...) | أدخل مبلغ عرض صالحاً (عدد صحيح موجب...) |
| Önce AI raporunu onaylayın ve teminat (ön yetki) adımını tamamlayın. | First approve the AI report, then complete the deposit (pre-authorization) step. | Сначала одобрите отчёт ИИ, затем завершите шаг залога. | وافق أولاً على تقرير الذكاء الاصطناعي، ثم أكمل خطوة التأمين. |
| Vazgeç | Cancel | Отмена | إلغاء |
| Zorunlu onaylar | Required approvals | Обязательные согласия | الموافقات الإلزامية |

> İnterpolasyon `{amount}`/`{pct}` i18n ile; AR'da ₺{amount} BiDi-izole + input `dir="ltr"`. Hardcoded birleştirme YOK.

---

## 3) BLOK 3 — Uygulama + ÇEKİRDEK KORU

### 3.1 `messages.ts` — `listingDetail` +22 anahtar (4 dil)
bid dialog(13) + bid toast(7) + offer toast(1) + toastLogin(1)

### 3.2 `AuctionDetail.tsx` — bağlama
- Teklif modal: maliyet/tutar/placeholder/proxy(6)/gate başlık/Vazgeç/footer tooltip → `ld.*`
- handleBid toast'ları: 7 string + 2 reuse (`bidLoginRequired`, `bidAcceptRequired`) → `ld.*` (**yalnız string argümanı; if/return/placeBidRpc DEĞİŞMEDİ**)
- `toastMinBid`/`toastBidSaved` `.replace("{amount}", …toLocaleString("tr-TR"))`
- `bidCostNote` `.replace("{pct}", …)`
- Bid/negotiate buton tooltip (desktop+mobil) → mevcut ld anahtarları
- `dir="ltr"`: teklif tutarı input + proxy max input + maliyet ₺
- KVKK/MASTER_LEGAL_DISCLAIMER/BID_GATE_CHECKBOXES → DOKUNULMADI (FAZ 3)

### 3.3 ÇEKİRDEK DOKUNULMADI (git diff = SIFIR) — EN KRİTİK
```
placeBidRpc + handleBid akış/validasyon/min-artış (minNextBidTry/parsePositiveTryFromInput)  ZERO
SEALED maskeleme (maskBidder)                          ZERO
DOĞRULANDI ROZETİ KOŞULU (verified===true)             ZERO
fees.ts + CurrencyContext + FxRef (₺+≈$)               ZERO
preAuthorize/payment + buyNow + auctionEngine          ZERO
@/legal/* (bidGateAgreement, masterContract, hemenAl)  ZERO (FAZ 3)
auth + supabase + RLS + LocaleContext + tüm namespaces  ZERO
```
git status → sadece `messages.ts` + `AuctionDetail.tsx` ✅

---

## 4) BLOK 4 — RTL + BiDi (AR)
- ✅ `<html dir="rtl">` (test) + modal sağa hizalı
- ✅ Teklif tutarı input + proxy max input `dir="ltr"`
- ✅ Maliyet ₺ `dir="ltr"`; toast `{amount}` BiDi-izole
- ✅ Bid buton tooltip AR'da "يجب تسجيل الدخول" (test kanıtı)
- ✅ Yeni physical class EKLENMEDİ; 359 toplu = FAZ 2

---

## 5) BLOK 5 — Test (2 katmanlı — ORTAM KISITI dürüst raporlandı)

### ⚠️ Ortam kısıtı
`isSupabaseConfigured()=false` (preview build) → `useAuth().user=null` → teklif butonu **kaçınılmaz `disabled`** (kod doğru: giriş+rapor+blokaj ister) → modal sandbox'ta gerçek auth olmadan **açılamaz**. Bu ortam kısıtı, kod/regresyon sorunu DEĞİL. İki katmanlı doğrulama uygulandı:

### Katman 1 — RENDER (Playwright, 4 dil) — görünür bid-akışı chrome'u
| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| Bid buton etiketi (ctaBid) | ✅ | ✅ Place bid | ✅ Сделать ставку | ✅ تقديم عرض |
| Bid buton tooltip (loginRequired) | ✅ Giriş gerekli | ✅ Login required | ✅ Необходимо войти | ✅ يجب تسجيل الدخول |
| ₺ korundu | ✅ | ✅ | ✅ | ✅ |
| pageerror | 0 | 0 | 0 | 0 |

### Katman 2 — DERLEME (dist bundle grep) — modal/toast 4 dilde derlendi
✅ `Zorunlu onaylar` / `Required approvals` / `Обязательные согласия` / `الموافقات الإلزامية`
✅ `Teklif en az` / `Bid must be at least` / `Ставка должна быть не менее` / `يجب ألا يقل العرض`
✅ `Otomatik teklif (proxy bid)` / `Automatic bid (proxy bid)`
→ Binding **build ile tip-güvenli** (yanlış ld anahtarı = derleme hatası). Render mekanizması 11-G/11-G-2 ile AYNI (tab/panel'de kanıtlandı).

### TEKLİF AKIŞI/SEALED/PARA korundu (KANIT — git diff)
- placeBidRpc + handleBid validasyon/min-artış → SIFIR diff (akış değişmedi)
- SEALED maskeleme (maskBidder) → SIFIR diff
- Doğrulandı rozeti `verified===true` → SIFIR diff
- Modal maliyet/komisyon → fees.ts + FxRef (₺+≈$) korundu

### REGRESYON (AR smoke 4 sayfa)
| Sayfa | http | dir | pageerror |
|---|---|---|---|
| /ilan/1 (ilan detay) | 200 | rtl | 0 |
| /ihaleler | 200 | rtl | 0 |
| /panel (dashboard) | 200 | rtl | 0 |
| /borsa | 200 | rtl | 0 |
- yalnız messages.ts (additive) + AuctionDetail.tsx → paylaşılan bileşen DOKUNULMADI

### Build + Lint
- PWA v1.3.0 — 299 entries (**6602.03 KiB**, +6.48 KiB) ✅
- 2 dosya 0 error / 0 warning

### Screenshots
```
_audit/dil-11g3/  →  _test.mjs + ilan-modal-{tr,en,ru,ar}.png (AR-RTL)
```

---

## 6) GÜNCEL SÖZLÜK — ~485 terim
- 11-G-2 sonu = 462 + **11-G-3 (23 yeni)** = ~485 terim, 4 dilde tutarlı

---

## 7) ANAYASA KANITLARI
- ✅ Build YEŞİL — 299 entries (6602.03 KiB)
- ✅ Lint 0 error
- ✅ Tag: `safe-before-dil-11g3` (0029c74) → `safe-after-dil-11g3`
- ✅ PUSH → `git log origin/main..HEAD` BOŞ
- ✅ Teklif akışı/sealed/para/çekirdek SIFIR diff · kritik uyarılar anlam-korundu · doğrulama rozeti dürüstlük korundu

---

## 8) İLAN DETAY DURUMU
| Adım | Kapsam | Durum |
|---|---|---|
| 11-G | Ana statik görünüm (chrome+hero+sidebar+geri sayım) | ✅ |
| 11-G-2 | Tab içerikleri + AI öneri + ekspertiz paneli | ✅ |
| **11-G-3** | **Teklif (bid) modal + bid toast + bid tooltip** | ✅ |
| 11-G-4 | Buy-now akışı dialogları + bilgi dialogları (piyasa/resmi/sanal tur) | ⏳ KALDI |
| FAZ 3 | KVKK + Cayma + Hemen Al legal gövdeleri + tarih Intl | ⏳ |

> **İLAN DETAY ~%90 KAPANDI** — teklif (bid) akışı TAM çevrildi. Buy-now akışı + bilgi dialogları (çoğu legal-ağırlıklı, gövdeleri zaten FAZ 3) **11-G-4**'te kapanacak.

---

## 9) SONRAKİ
| # | İş |
|---|---|
| **11-G-4** | Buy-now akışı dialogları (non-legal etiketler) + bilgi dialogları + buy-now toast'ları + buy-now/mortgage/message tooltip → İLAN DETAY TAM KAPAT |
| 11-P | Lib sabitleri (fees.ts "Ekspertiz Raporu" + MARKETING_MODE + WEEKLY_* + FxRef note) — currency/çekirdek-domain DİKKATLİ |
| 11-O | Emlakçı + Müteahhit panel |
| FAZ 2 | 359 fiziksel CSS → logical RTL |
| FAZ 3 | KVKK + Cayma + Hemen Al legal gövdeleri + PDF 4 dil + tarih Intl + avukat |

---

## 10) Master için 3 KARAR
1. **Sonraki:** 11-G-4 (ilan detayı TAM kapat — buy-now + bilgi dialogları) mı, 11-P (lib sabitleri) mı?
2. **Modal test:** Sandbox auth kısıtı nedeniyle modal-açılışı RENDER yerine bundle-derleme + build-binding ile doğrulandı; gerçek auth'lu E2E (Supabase staging) ayrı bir QA turunda mı yapılsın?
3. **Buy-now legal:** Hemen Al kapısı + buy-now confirm büyük oranda legal gövde (MASAK/MODULE3/MESAFELI) → 11-G-4'te yalnız non-legal butonlar, gövdeler FAZ 3 — onaylıyor musunuz?

---

— **Teklif (bid) modal + bid toast + bid tooltip 22+1 öğe 4 dilde · placeBid/validasyon/min-artış/sealed/fees/Currency + doğrulama-rozeti SIFIR diff · kritik uyarılar anlam-korundu (yumuşatma yok) · input dir=ltr + {amount} interpolasyon · RENDER 4 dil ✅ + BUNDLE 4 dil ✅ · 0 pageerror · AR dir=rtl · regresyon temiz (4 sayfa) · ~485 terim · KVKK/legal→FAZ 3, buy-now→11-G-4 · İLAN DETAY ~%90 KAPANDI.**
🌐🏛️🔒✅
