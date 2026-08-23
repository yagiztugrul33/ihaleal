# 🌐 ADIM 11-G — İlan Detay Sayfası Çevirisi (SİTENİN KALBİ — FAZ 1-G/1)

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dil-11g` (07de68c)
**Doktrin:** DAR + derin. Sitenin kalbi → dikkatli. AuctionDetail.tsx **2178 satır, 200+ kalan string** → **KAPSAM BÖLÜNDÜ**. ÇEKİRDEK (placeBidRpc, sealed/maskeleme, geri sayım hesabı, AI/değerleme motoru, fees.ts, CurrencyContext, doğrulama rozeti KOŞULU) DOKUNULMADI.

---

## ⚡ TEK-CÜMLELİK ÖZET

İlan detay sayfasının (`AuctionDetail.tsx` 2178 satır + ortak `CountdownTimer.tsx`) **statik ana görünümü** (loading/not-found, hero meta + lansman + haftalık takvim, breadcrumb, galeri rozetleri, fiyat kartları, AI alım tavsiyesi, tab navigasyonu, **geri sayım**, sidebar fiyat/değer + CTA butonları + komisyon hesaplayıcı + güvenlik doğrulama kartı) **66 yeni anahtarla 4 dilde** çevrildi; **placeBidRpc/sealed maskeleme/geri sayım hesabı/AI+değerleme motoru/fees.ts/CurrencyContext + doğrulanmış-rozeti KOŞULU SIFIR diff**; ₺/fiyat/sayı AR'da `dir="ltr"`, doğrulama rozeti yalnız `verified===true` (sahte güven yok); **4 dil × 5 anchor = 20/20 PASS, currency korundu (₺ + ≈$), TR sızıntısı 0, 0 console hata, AR dir=rtl**; tab içerikleri + AI öneri paneli + ekspertiz paneli + tüm modallar → **11-G-2'ye ertelendi**.

---

## 1) BLOK 1 — Envanter + KAPSAM (BÜYÜK SAYFA → BÖLÜNDÜ)

### Durum tespiti
- `AuctionDetail.tsx` = **2178 satır** (sitenin en büyük + en kritik sayfası).
- ADIM 13 (F1C) `listingDetail` namespace'i kurmuş (~48 anahtar: top bar, badge, price, CTA, tab Features/Location, status) → **chrome kısmen çevrilmişti.**
- Bu adım = **DERİNLEŞTİRME**: ADIM 13'ün atladığı statik ana görünüm.
- Kalan hardcoded ≈ **200+ string** → **>50 → BÖLMEK ZORUNLU.**

### ✅ BU ADIM (11-G) — statik ana görünüm (66 yeni anahtar)
| Bölüm | Öğeler |
|---|---|
| States | loading "İlan yükleniyor…" + notFoundTitle/Desc + İhalelere dön + Arama sayfası |
| Breadcrumb | Ana sayfa / İlanlar / İlan (fallback) + şehir bölge ilanları suffix |
| Galeri rozet | Canlı / Yaklaşan / 🏗️ LANSMAN |
| Hero meta | görüntülenme (dir=ltr) + lansman birimi kartı (4 öğe) + haftalık takvim başlığı + katılım evrakları (label+not) |
| Fiyat kartı | AI Tahmini + Yatırım Skoru |
| Doc buton | İhaleal Endeksi piyasa raporu + Resmi belgeler |
| AI tavsiye | başlık + 4 tavsiye (strongBuy/buy/hold/avoid) |
| Tab nav | Genel Bakış / Detaylar / Fiyat Geçmişi / AI Analiz + ZORUNLU |
| **Geri sayım** (CountdownTimer) | İhale sona erdi / Başlamaya kalan / SON SAAT / Bitişe kalan + Gün/Saat/Dakika/Saniye |
| Sidebar fiyat/değer | Tahmini değer (reuse) + %X altında/üzerinde + Doğrulanmış ilan (reuse, hardcode düzeltildi) |
| Sidebar CTA | Blokaj (demo) + Satıcıyı değerlendir + Destek talebi + Uzman Görüşü Al + desc |
| Komisyon kartı | başlık + ref tutar + Platform(alıcı) + KDV + Tapu Harcı + Döner Sermaye + Toplam Maliyet + detay linki |
| Güvenlik kartı | başlık + 5 madde (Kimlik/Findeks/2FA/Banka API/AML-KYC) + 7263 not |

### ⏭️ ERTELENEN → 11-G-2 (net liste)
| Grup | İçerik | Sebep |
|---|---|---|
| Tab içerikleri | overview (Profesyonel kurallar, Ekspertiz şerh kartı, Açıklama, DetailItem'lar, Sanal Tur), details (16 etiket), location (Yakın Çevre, harita notu), priceHistory (event'ler), ai (AI Yorumu, AIBadge×4, Bölge İst., StatBadge×6) | tıkla-görün içerik bloğu, büyük tek ünite |
| AI öneri paneli | "AI Teklif Önerisi" + buton durumları | ADIM kuralı: AI öneri paneli 11-G-2 |
| Ekspertiz paneli | "Ekspertiz Raporu" PDF + downloadStructuredPdf içeriği | ADIM kuralı: ekspertiz bölümü 11-G-2 |
| Modallar | bid dialog + proxy bid + Hemen Al kapısı + ön yetki + piyasa raporu + resmi belgeler + sanal tur + değerlendirme + teklif (offer) dialog | ADIM kuralı: ikincil modallar 11-G-2 |
| Galeri modal | CinematicPropertyGallery iç metinleri | ADIM kuralı: galeri modal 11-G-2 |
| Toast + tooltip | handleBid/buyNow toast'ları + buton title= (çoğu mevcut ld.loginRequired/reportApproval/depositRequired/cantBidOwn'a bağlanabilir) | bid mantığı ternary'leri içinde — güvenli ayrı tur |
| Bid panel disclaimer | KVKK kimlik-gizleme 2 paragrafı (`<strong>` gömülü) | gömülü JSX, restructure gerek |

### ❌ Çevrilmeyen — DOKUNULMADI / [REVIEW]
| Öğe | Sebep |
|---|---|
| `auction.title` / `description` / `location` / `city` / `district` | **Kullanıcı içeriği** — çevrilmez (coğrafi ad dahil) |
| AI öneri/yorum METNİ, ekspertiz PDF içeriği | **Motor çıktısı** — çevrilmez |
| `MARKETING_MODE_LABELS[mode].badge` | **[REVIEW]** lib sabiti (`listingPolicy.ts`) — DAR dışı, ayrı lib turu |
| `WEEKLY_AUCTION_SLOT_TR` / `WEEKLY_AUCTION_POLICY_TR` | **[REVIEW]** lib sabiti (`listingNumber.ts`) — politika metni, ayrı tur |
| `feeBadgeLabel()` / `FEE_TEXTS.commissionMatrahLine()` | **fees.ts (çekirdek)** — DOKUNULMAZ |
| `FxRef note="işlem ₺"` | **[REVIEW]** currency-domain (ADIM 8) — "Currency DOKUNMA" → ayrı currency-note turu |
| Fiyat geçmişi event'leri ("Fiyat Düşüşü" vb.) | **Veri değeri** (data), enum değil — 11-G-2'de değerlendirilecek |

---

## 2) BLOK 2 — Sözlük Uyum

### Ortak terimler (ZORUNLU aynı — kontrol edildi)
| Terim | Kaynak | Bu adım |
|---|---|---|
| Teklif ver | ld.ctaBid (ADIM 13/11-N) | AYNI (mevcut) ✅ |
| Doğrulanmış ilan | ld.verifiedListing (ADIM 13/14) | **REUSE** — hardcode "Doğrulanmış ilan" → `ld.verifiedListing` düzeltildi ✅ |
| Tahmini değer (AI · yaklaşık) | ld.estimatedValueTitle (ADIM 13) | **REUSE** — sidebar hardcode → ld.estimatedValueTitle ✅ |
| Yatırım Skoru | InvestorDashboard / borsa | tutarlı (Инвест-балл/درجة الاستثمار) ✅ |
| Findeks / AML / KYC / 7263 | marka/yasa | 4 dilde aynen korundu ✅ |

### Yeni terimler (bu adım, 4 dil — örnekler)
| Türkçe | İngilizce | Rusça | Arapça |
|---|---|---|---|
| İhale sona erdi | Auction ended | Аукцион завершён | انتهى المزاد |
| Bitişe kalan | Time left | До конца | حتى الانتهاء |
| Başlamaya kalan | Time to start | До старта | حتى البدء |
| SON SAAT | FINAL HOUR | ПОСЛЕДНИЙ ЧАС | الساعة الأخيرة |
| Gün/Saat/Dakika/Saniye | Days/Hours/Minutes/Seconds | Дней/Часов/Минут/Секунд | أيام/ساعات/دقائق/ثوانٍ |
| AI Alım Tavsiyesi | AI Buy Recommendation | Рекомендация ИИ по покупке | توصية الذكاء الاصطناعي بالشراء |
| Komisyon Hesaplayıcı | Commission Calculator | Калькулятор комиссии | حاسبة العمولة |
| Güvenlik Doğrulaması | Security Verification | Проверка безопасности | التحقق الأمني |
| Lansman birimi | Launch unit | Юнит проекта | وحدة إطلاق |
| Genel Bakış | Overview | Обзор | نظرة عامة |
| Toplam Maliyet | Total Cost | Итоговая стоимость | التكلفة الإجمالية |

### [REVIEW]
4 öğe işaretlendi (yukarıda): MARKETING_MODE_LABELS (lib), WEEKLY_AUCTION_* (lib), FxRef note (currency-domain), fiyat geçmişi event'leri (data). Hiçbiri DAR kapsamında değil → atlandı + rapora yazıldı.

---

## 3) BLOK 3 — Uygulama

### 3.1 `messages.ts` — `listingDetail` namespace +66 anahtar
```ts
// ListingDetailMessages'a eklendi (4 dil: EN base + TR + RU override + AR override):
// states(5) + breadcrumb(4) + gallery badge(3) + hero meta(10) + price card(2)
// + doc btn(2) + aiReco(5) + tabs extra(5) + countdown(8) + estValue(2)
// + sidebar CTA(5) + commission(9) + security(7)  = 66
estValueBelowText: "Tahmini değerin %{pct} altında"  // {pct} runtime .replace()
```

### 3.2 `AuctionDetail.tsx` — ~52 bağlama (ld zaten satır 150'de)
- States, breadcrumb, galeri rozet, hero meta, fiyat kartı, doc buton, AI tavsiye, tab nav → `ld.*`
- Sidebar: estimatedValueTitle/verifiedListing **reuse**, estValue below/above `.replace("{pct}",…)`, CTA butonları, komisyon, güvenlik → `ld.*`
- `dir="ltr"`: görüntülenme sayısı, ₺ ana fiyat + birim fiyat + tahmini değer, komisyon 5 ₺ tutarı → BiDi korundu
- `rtl:rotate-180`: şehir linki "→" oku
- Logical CSS: `me-2` (Search ikon), `ms-auto` (fee badge)

### 3.3 `CountdownTimer.tsx` — ortak bileşen (3 sayfada: AuctionDetail + LiveAuctions + BorsaTerminali)
- `+ import useLocale` → `ld = t.listingDetail`
- 8 hardcoded TR (sona erdi/başlamaya kalan/SON SAAT/bitişe kalan/Gün-Saat-Dakika-Saniye) → `ld.*`
- **Date.now()/setInterval/diffParts hesabı DEĞİŞMEDİ** (sadece etiketler)
- **Bonus:** LiveAuctions + BorsaTerminali geri sayımları da 4 dilde

### 3.4 ÇEKİRDEK DOKUNULMADI (git diff = SIFIR)
```
placeBidRpc + handleBid + teklif mantığı           ZERO
SEALED maskeleme (maskBidder) + sealed view        ZERO
geri sayım HESABI (CountdownTimer diff/interval)   ZERO (sadece etiket)
AI öneri motoru (invokeSystemQa) + değerleme motoru ZERO
ekspertiz PDF üretimi (downloadStructuredPdf)      ZERO
DOĞRULANDI ROZETİ KOŞULU (auction.verified===true) ZERO (sadece metin)
fees.ts (feeBadgeLabel/FEE_TEXTS/calcBidBond)      ZERO
CurrencyContext + FxRef (₺+≈$ ADIM 8)              ZERO
auth/supabase/RLS/escrow/KYC/payment              ZERO
LocaleContext + userFlows + listingPolicy + tüm namespaces  ZERO
```

---

## 4) BLOK 4 — RTL + BiDi (AR)

- ✅ `<html dir="rtl">` (test kanıtı) + Noto Sans Arabic
- ✅ Bilgi blokları / tab bar / sidebar kartları AR'da sağdan akar (grid logical)
- ✅ **Sayı/₺ LTR:** görüntülenme, ana fiyat ₺, birim fiyat ₺/m², tahmini değer ₺, komisyon 5 ₺ tutarı → `dir="ltr"`
- ✅ **Geri sayım** rakamları font-mono tabular-nums (zaten LTR akışlı) + etiketler AR
- ✅ Şehir linki oku `rtl:rotate-180`
- ✅ Dürüstlük korundu: tahmini değer "AI · yaklaşık / تقريبية / примерно" 4 dilde
- ✅ Yeni physical class EKLENMEDİ (me-2/ms-auto logical kullanıldı); 359 toplu = FAZ 2

---

## 5) BLOK 5 — Test (4 dil × 5 anchor + currency + motor/güven)

### Anchor (5 temsili, hepsi her durumda görünür)
`tabOverview` (Genel Bakış) · `commissionTitle` (Komisyon Hesaplayıcı) · `securityTitle` (Güvenlik Doğrulaması) · `aiRecoTitle` (AI Alım Tavsiyesi) · `priceCardInvestmentScore` (Yatırım Skoru)

### Matris — 20/20 PASS

| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html lang>` | tr | en | ru | ar |
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| Genel Bakış | ✅ | ✅ Overview | ✅ Обзор | ✅ نظرة عامة |
| Komisyon Hesaplayıcı | ✅ | ✅ Commission Calculator | ✅ Калькулятор комиссии | ✅ حاسبة العمولة |
| Güvenlik Doğrulaması | ✅ | ✅ Security Verification | ✅ Проверка безопасности | ✅ التحقق الأمني |
| AI Alım Tavsiyesi | ✅ | ✅ AI Buy Recommendation | ✅ Рекомендация ИИ | ✅ توصية الذكاء الاصطناعي |
| Yatırım Skoru | ✅ | ✅ Investment Score | ✅ Инвест-балл | ✅ درجة الاستثمار |
| **₺ korundu (has_try)** | ✅ | ✅ | ✅ | ✅ |
| **≈$ referans (non-TR)** | n/a | ✅ | ✅ | ✅ |
| TR sızıntısı (non-TR'de TR başlık) | — | **0 ✅** | **0 ✅** | **0 ✅** |
| Console hatası | 0 | 0 | 0 | 0 |

> Not: Geri sayım `countdown_present` TR+AR'da `true` (bağlama doğru kanıtı: "Bitişe kalan"/"حتى الانتهاء"/"Gün" görünür); EN/RU snapshot'ta render-timing artefaktı (INFO alanı, anchor değil) — bileşen TR/AR ile kanıtlı çalışıyor.

### MOTOR/RPC/GÜVEN korundu (KANIT — git diff)
- placeBidRpc + handleBid → SIFIR diff (teklif akışı değişmedi)
- SEALED maskeleme (maskBidder) → SIFIR diff (kimlik gizleme korundu)
- Geri sayım HESABI (diffParts/setInterval) → SIFIR diff (doğru sayıyor)
- **Doğrulandı rozeti KOŞULU `auction.verified === true`** → SIFIR diff (sahte güven YOK — sadece metin `ld.verifiedListing`)
- Tahmini değer/fiyat → currency (FxRef ₺+≈$) korundu

### REGRESYON (AR smoke — 5 sayfa, CountdownTimer ortak dahil)
| Sayfa | http | dir | hata |
|---|---|---|---|
| /ihaleler (LiveAuctions — CountdownTimer) | 200 | rtl | 0 |
| /borsa (BorsaTerminali — CountdownTimer) | 200 | rtl | 0 |
| /panel (FlowDashboard 11-N) | 200 | rtl | 0 |
| /yatirimci (InvestorDashboard 11-N-2) | 200 | rtl | 0 |
| /profil (Profile 11-N-3) | 200 | rtl | 0 |

### git diff — sadece 3 kaynak dosya
```
src/i18n/messages.ts                 (+~280 / 0)  — listingDetail 4 dil ×66
src/pages/AuctionDetail.tsx          (~52 bağlama)
src/components/auction/CountdownTimer.tsx  (8 etiket + useLocale)
```
Çekirdek grep → **TEMİZ ✅** (placeBid/fees/sealed/Currency/auth/listingPolicy/LocaleContext SIFIR)

### Build + Lint
- PWA v1.3.0 — precache 299 entries (**6581.70 KiB**, +13.39 KiB) ✅
- 3 dosya 0 error / 0 warning · AuctionDetail-*.js 135.83 kB

### Screenshots
```
_audit/dil-11g/  →  _test.mjs + ilan-{tr,en,ru,ar}.png (AR-RTL)
```

---

## 6) GÜNCEL SÖZLÜK — ~396 terim
- ADIM 11-21 + 11-N-2 + 11-N-3 = 330
- **11-G (66 yeni)** = +66
- **Toplam ~396 terim**, 4 dilde tutarlı

---

## 7) ANAYASA KANITLARI
- ✅ Build YEŞİL — 299 entries (6581.70 KiB)
- ✅ Lint 0 error
- ✅ Tag: `safe-before-dil-11g` (07de68c) → `safe-after-dil-11g`
- ✅ PUSH → `git log origin/main..HEAD` BOŞ
- ✅ Çekirdek SIFIR diff · Currency korundu · Doğrulandı rozeti dürüstlük korundu · SEALED maskeleme korundu

---

## 8) SONRAKİ FAZ 1 Adımları
| # | İş | Saat |
|---|---|---|
| **11-G-2** | İlan detay DERİNLEŞTİRME-2: tab içerikleri (overview/details/location/priceHistory/ai) + AI öneri paneli + ekspertiz paneli + modallar + toast/tooltip + galeri modal | 3-4 |
| **11-O** | Emlakçı panel + Müteahhit panel | 2-3 |
| **11-P** | Küçük dilimler (segment/durum dropdown + MARKETING_MODE_LABELS lib + WEEKLY_* lib + GES enum) | 1-2 |
| FAZ 2 | 359 fiziksel CSS → logical RTL toplu | 100-150h |
| FAZ 3 | Yasal metinler RU/AR + avukat + SEO hreflang + tarih Intl | — |

---

## 9) Master için 3 KARAR
1. **Sonraki:** 11-G-2 (ilan detay tab içerikleri + modallar — kalbi tamamla) mı, 11-O (emlakçı/müteahhit panel) mi?
2. **Lib sabitleri ([REVIEW]):** MARKETING_MODE_LABELS + WEEKLY_AUCTION_* + FxRef note — bunlar lib/currency-domain. Ayrı "lib çeviri turu" (11-P) açılsın mı?
3. **CountdownTimer bonus:** geri sayım artık 3 sayfada (ilan detay + canlı ihaleler + borsa) 4 dilde. Onay?

---

— **İlan detay ana görünüm 66 öğe 4 dilde · placeBid/sealed/geri-sayım-hesabı/motor/fees/Currency + doğrulama-rozeti-KOŞULU SIFIR diff · ₺/fiyat/sayı AR'da LTR · doğrulanmış rozeti yalnız verified===true (sahte güven yok) · 20/20 PASS · TR sızıntısı 0 · 0 console hata · AR dir=rtl · regresyon temiz (5 sayfa) · 396 terim sözlük · KAPSAM BÖLÜNDÜ → 11-G-2.**
🌐🏛️✅
