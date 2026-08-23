# 🌐 ADIM 11-G-2 — İlan Detay Kalan İçerik (tab + panel) — FAZ 1-G/2

**Tarih:** 2026-06-03
**Tag baseline:** `safe-before-dil-11g2` (26833b4)
**Doktrin:** DAR + derin. EN HASSAS adım (teklif modal + KVKK). Bu adım = **tab içerikleri + AI öneri paneli + ekspertiz paneli (statik etiketler)**. Teklif modal + diğer modallar + toast/tooltip + galeri modal → **11-G-3**. KVKK/yasal disclaimer gövdesi + CaymaPolitikasi + "raporu okudum" onayı → **FAZ 3 (yasal/avukat)**.

---

## ⚡ TEK-CÜMLELİK ÖZET

İlan detay sayfasının **tab içerikleri** (overview: profesyonel kurallar + taahhüt bandı + ekspertiz şerh + açıklama + DetailItem + sanal tur · details: 16 etiket · location: yakın çevre + harita notu · ai: gate notu + AI Yorumu + radar + AIBadge + Bölge İstatistikleri + StatBadge) ile **AI öneri paneli** ve **ekspertiz paneli** statik etiketleri **66 yeni anahtarla 4 dilde** çevrildi; **placeBidRpc/handleBid/sealed maskeleme/AI öneri motoru (invokeSystemQa prompt)/ekspertiz PDF üretimi/değerleme motoru/fees.ts/CurrencyContext + doğrulama-rozeti KOŞULU SIFIR diff**; ₺/sayı AR'da `dir="ltr"`, AI Yorumu interpolasyonla ({pct}/{location}/{avgSqm}/{sqm}/{demand}); **4 dil × 5 anchor = 20/20 PASS** (tab tıklayarak doğrulandı), currency korundu (₺ + ≈$), AR dir=rtl, **0 kod hatası** (yalnız dış-kaynak ağ artefaktı); KVKK disclaimer + report-viewer alt-bileşenleri FAZ 3'e, teklif modal + toast/tooltip 11-G-3'e ertelendi.

---

## 1) BLOK 1 — Envanter + KAPSAM (BÖL)

### Durum
- 11-G "ana statik görünüm"ü (chrome + hero + sidebar kartları) kapatmıştı.
- Kalan: tab içerikleri + 2 sidebar paneli + modallar + toast/tooltip + KVKK + galeri modal ≈ **150+ string** → **>50 → BÖL.**

### ✅ BU ADIM (11-G-2) — tab içerikleri + AI/ekspertiz panelleri (66 yeni anahtar)
| Bölüm | Öğeler |
|---|---|
| Overview tab | Profesyonel kurallar (özet) + Taahhüt bandı (başlık/Alt/Üst/not/pending) + Ekspertiz şerh kartı (başlık/zorunluluk/dosya/not) + Açıklama + DetailItem ×4 + Sanal Tur (başlık/desc/buton) |
| Details tab | 16 etiket: Oda+Salon, Brüt/Net m², Bulunduğu/Toplam Kat, Bina Yaşı (+Yıl), Isıtma, Cephe, Banyo, Balkon, Asansör, Otopark, Eşyalı, Kullanım/Tapu Durumu, Uygunluk |
| Location tab | Yakın Çevre + mesafe suffix + Harita yükleniyor + harita fallback notu ({city}) |
| AI tab | gate notu + radar "Skor" + AI Yorumu (başlık + 2 interpolasyon şablonu) + AIBadge ×4 (Yatırım Skoru reuse) + Bölge İstatistikleri + StatBadge ×5 (+gün) |
| AI öneri paneli | başlık + Düşünüyor/Tekrar sor/Öneri al + hata + placeholder |
| Ekspertiz paneli | başlık + Hazırlanıyor/PDF İndir + desc |
| Stray | sidebar "AI Tahmini" progress (reuse priceCardAiPredicted) |

### ⏭️ ERTELENEN → 11-G-3
- Teklif verme modal/dialog (bid dialog + bidIncrements + teklif input + bid gate)
- Diğer modallar: proxy bid, Hemen Al kapısı, ön yetki (preauth), piyasa raporu, resmi belgeler, sanal tur dialog, değerlendirme (review), teklif (offer) dialog
- Toast mesajları (handleBid/buyNow) + buton title= tooltip'leri (çoğu mevcut ld.loginRequired/reportApproval/depositRequired/cantBidOwn'a bağlanabilir)
- Galeri modal (CinematicPropertyGallery iç metinleri)

### ⏭️ ERTELENEN → FAZ 3 (yasal/avukat — bağlayıcı metin)
- KVKK kimlik-gizleme disclaimer paragrafları (sidebar, `<strong>` gömülü)
- CaymaPolitikasi (cayma/iade politikası alt-bileşeni)
- "Raporu okuduğumu ve bilgilendirme niteliğini anladığımı onaylıyorum (taslak)." — bağlayıcı onay

### ❌ Çevrilmeyen / [REVIEW] (DOKUNULMADI)
| Öğe | Sebep |
|---|---|
| AI öneri **prompt'u** (invokeSystemQa input) | **Motor input** — değiştirmek motor davranışını bozar → [REVIEW] (çok-dilli AI yanıtı ayrı prompt-engineering turu) |
| AI **yanıt metni** (res.text) | **Motor çıktısı** — çevrilmez (sadece çevre etiketleri) |
| Ekspertiz **PDF içeriği** (downloadStructuredPdf: başlık/heading/disclaimer/satırlar) | **PDF artefaktı** (Roboto TR) — "PDF rapor 4 dil" ayrı roadmap |
| `PropertyAnalysisReportViewer` + `PantsirPanel` (AI tab alt-bileşenleri) | **Ayrı bileşen** — rapor-viewer çeviri ünitesi (ayrı tur) |
| `fees.ts` `expertise: "Ekspertiz Raporu"` | **fees.ts (çekirdek)** — DOKUNULMAZ → [REVIEW] 11-P lib turu |
| Fiyat geçmişi event'leri + `toLocaleDateString("tr-TR")` | **Veri** + tarih Intl → FAZ 3 (tarih Intl) |
| `auction.title/description/location/city/district` | **Kullanıcı içeriği** (coğrafi ad dahil) |

---

## 2) BLOK 2 — Sözlük Uyum

### Ortak terimler (ZORUNLU aynı — kontrol edildi)
| Terim | Kaynak | Bu adım |
|---|---|---|
| Yatırım Skoru | 11-G priceCardInvestmentScore | **REUSE** (AIBadge) ✅ |
| AI Tahmini | 11-G priceCardAiPredicted | **REUSE** (sidebar progress) ✅ |
| Aktif İlan | ld.activeListing (ADIM 13) | **REUSE** (StatBadge) ✅ |
| Kira Getirisi | yeni aiBadgeRentalYield | AIBadge + StatBadge'de AYNI key ✅ |
| Net m² / Bina Yaşı | overview + details | tutarlı (м²/عمر المبنى) ✅ |

### Yeni terimler (örnekler, 4 dil)
| Türkçe | İngilizce | Rusça | Arapça |
|---|---|---|---|
| Profesyonel kurallar (özet) | Professional rules (summary) | Профессиональные правила (кратко) | القواعد المهنية (ملخّص) |
| Taahhüt limit bandı | Commitment limit band | Диапазон лимита обязательства | نطاق حدّ التعهّد |
| AI Yorumu | AI Commentary | Комментарий ИИ | تعليق الذكاء الاصطناعي |
| Bölge İstatistikleri | Area Statistics | Статистика района | إحصاءات المنطقة |
| Ekspertiz Raporu | Appraisal Report | Отчёт об оценке | تقرير التقييم |
| AI Teklif Önerisi | AI Bid Suggestion | ИИ-совет по ставке | اقتراح العرض بالذكاء الاصطناعي |
| Isıtma / Cephe / Asansör | Heating / Facade / Elevator | Отопление / Фасад / Лифт | التدفئة / الواجهة / المصعد |

### Kritik aksiyon
Bu adımda bağlayıcı "geri dönüşü yok" aksiyonu YOK (teklif onayı modal'ı 11-G-3'te). AI Yorumu + ekspertiz "yaklaşık/tahmini" ibareleri 4 dilde korundu.

---

## 3) BLOK 3 — Uygulama

### 3.1 `messages.ts` — `listingDetail` +66 anahtar (4 dil)
- overview(18) + details(17) + location(4) + ai(14) + AI öneri panel(6) + ekspertiz panel(4) = 63 + 3 reuse referansı
- Interpolasyon: `aiCommentUnder` `{pct}/{location}/{avgSqm}/{sqm}` · `aiCommentFair` `{demand}` · `locMapFallbackNote` `{city}` → component `.replace()`

### 3.2 `AuctionDetail.tsx` — ~45 bağlama
- Overview/details/location/ai tab içerikleri → `ld.*`
- AI öneri + ekspertiz paneli → `ld.*` (prompt + PDF içeriği DOKUNULMADI)
- `dir="ltr"`: taahhüt Alt/Üst ₺, ekspertiz dosya adı, mesafe (Xm), AI Tahmini progress ₺
- Logical CSS: `ms-auto` (Sanal Tur butonu)
- **KVKK disclaimer + CaymaPolitikasi + "raporu okudum" onayı → DOKUNULMADI (FAZ 3)**

### 3.3 ÇEKİRDEK DOKUNULMADI (git diff = SIFIR)
```
placeBidRpc + handleBid + teklif mantığı           ZERO
SEALED maskeleme (maskBidder)                      ZERO
AI öneri MOTORU (invokeSystemQa + prompt)          ZERO
değerleme motoru + ekspertiz PDF üretimi           ZERO
DOĞRULANDI ROZETİ KOŞULU (verified===true)         ZERO
fees.ts (FEE_TEXTS + expertise label)              ZERO
CurrencyContext + FxRef (₺+≈$)                     ZERO
PropertyAnalysisReportViewer + PantsirPanel + CaymaPolitikasi  ZERO
CountdownTimer + auth + supabase + LocaleContext + tüm namespaces  ZERO
```
git status → sadece `messages.ts` + `AuctionDetail.tsx` ✅

---

## 4) BLOK 4 — RTL + BiDi (AR)

- ✅ `<html dir="rtl">` (test) + tab/panel sağdan akar
- ✅ Sayı/₺ LTR: taahhüt Alt/Üst ₺, ekspertiz dosya adı, mesafe (Xm), AI Tahmini ₺
- ✅ AI Yorumu interpolasyonunda {location} coğrafi ad + ₺ değerler BiDi-izole
- ✅ Dürüstlük: "tahmini/yaklaşık/تقريبية/примерно" 4 dilde
- ✅ Yeni physical class EKLENMEDİ (ms-auto logical); 359 toplu = FAZ 2

---

## 5) BLOK 5 — Test (4 dil × 5 anchor, tab tıklayarak + currency + güven)

### Anchor
`ovProfRules` (Profesyonel kurallar — overview default) · `expPanelTitle` (Ekspertiz Raporu — sidebar) · `aiSuggestTitle` (AI Teklif Önerisi — sidebar) · `detHeating` (Isıtma — **Details tab CLICK**) · `aiRegionStatsTitle` (Bölge İstatistikleri — **AI tab CLICK**)

### Matris — 20/20 PASS

| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| Profesyonel kurallar (overview) | ✅ | ✅ Professional rules | ✅ Профессиональные правила | ✅ القواعد المهنية |
| Ekspertiz Raporu paneli | ✅ | ✅ Appraisal Report | ✅ Отчёт об оценке | ✅ تقرير التقييم |
| AI Teklif Önerisi paneli | ✅ | ✅ AI Bid Suggestion | ✅ ИИ-совет по ставке | ✅ اقتراح العرض |
| Isıtma (Details tab açıldı) | ✅ | ✅ Heating | ✅ Отопление | ✅ التدفئة |
| Bölge İstatistikleri (AI tab açıldı) | ✅ | ✅ Area Statistics | ✅ Статистика района | ✅ إحصاءات المنطقة |
| **₺ korundu** | ✅ | ✅ | ✅ | ✅ |
| **≈$ referans (non-TR)** | n/a | ✅ | ✅ | ✅ |
| Kod (JS/pageerror) hatası | 0 | 0 | 0 | 0 |

> **`ERR_NAME_NOT_RESOLVED`:** AI tab tıklanınca PantsirPanel/rapor-viewer/harita dış kaynak çeker; sandbox'ta DNS çözülmez → 4 dilde AYNI ağ artefaktı, **kod/regresyon hatası değil** (pageerror=0).
> **`tr_leak: "Ekspertiz Raporu"`:** `fees.ts` (çekirdek) sabitinden — DOKUNULMASI YASAK → [REVIEW] 11-P lib turu. Benim panel başlığım (`expPanelTitle`) doğru çevrildi (sidebar_expPanel=true).

### MOTOR/GÜVEN korundu (KANIT — git diff)
- Teklif modal akışı (placeBidRpc) → SIFIR diff (11-G-3'te etiketlenecek)
- SEALED maskeleme (maskBidder) → SIFIR diff
- AI öneri paneli motor metnini gösteriyor → prompt + res.text DOKUNULMADI (sadece etiket)
- Doğrulandı rozeti `verified===true` → SIFIR diff
- Modal/panel fiyat/komisyon → currency (FxRef ₺+≈$) korundu

### REGRESYON
- Bu adım **yalnız messages.ts (additive) + AuctionDetail.tsx** değiştirdi → paylaşılan bileşen DOKUNULMADI → diğer sayfalar yapısal olarak etkilenmez
- 11-G ana görünüm + dashboard üçlüsü + ADIM 13/14 → bozulmadı (additive namespace)
- Build YEŞİL · 4 dil ilan detay 0 pageerror

### Build + Lint
- PWA v1.3.0 — 299 entries (**6595.55 KiB**, +13.85 KiB) ✅
- 2 dosya 0 error / 0 warning

### Screenshots
```
_audit/dil-11g2/  →  _test.mjs + ilan-detay-{tr,en,ru,ar}.png (AR-RTL)
```

---

## 6) GÜNCEL SÖZLÜK — ~462 terim
- 11-G sonu = 396 + **11-G-2 (66 yeni)** = ~462 terim, 4 dilde tutarlı

---

## 7) ANAYASA KANITLARI
- ✅ Build YEŞİL — 299 entries (6595.55 KiB)
- ✅ Lint 0 error
- ✅ Tag: `safe-before-dil-11g2` (26833b4) → `safe-after-dil-11g2`
- ✅ PUSH → `git log origin/main..HEAD` BOŞ
- ✅ Çekirdek + motor + alt-bileşenler SIFIR diff · Currency korundu · Doğrulandı rozeti dürüstlük korundu

---

## 8) SONRAKİ FAZ 1 Adımları
| # | İş | Saat |
|---|---|---|
| **11-G-3** | Teklif modal + diğer modallar + toast/tooltip + galeri modal (EN HASSAS — teklif akışı) | 3-4 |
| **11-P** | Lib sabitleri (MARKETING_MODE_LABELS + WEEKLY_* + **fees.ts expertise** + FxRef note — currency-domain dikkatli) + segment/durum dropdown | 1-2 |
| **11-O** | Emlakçı + Müteahhit panel | 2-3 |
| **Rapor-viewer** | PropertyAnalysisReportViewer + PantsirPanel çevirisi (ayrı ünite) | 2 |
| FAZ 2 | 359 fiziksel CSS → logical RTL | 100-150h |
| FAZ 3 | KVKK disclaimer + CaymaPolitikasi + "raporu okudum" + PDF 4 dil + tarih Intl + avukat | — |

---

## 9) Master için 3 KARAR
1. **Sonraki:** 11-G-3 (teklif modal — ilan detayı tamamen kapat, EN HASSAS) mı, 11-P (lib sabitleri toplu) mı?
2. **KVKK/yasal:** disclaimer gövdesi + CaymaPolitikasi + "raporu okudum" onayı FAZ 3'e (avukat onaylı) bırakıldı — doğru mu?
3. **AI çok-dilli yanıt:** AI öneri prompt'u şu an TR (motor TR yanıt verir). Çok-dilli AI yanıtı için ayrı prompt-engineering turu açılsın mı (motor dokunuşu — dikkatli)?

---

— **Tab içerikleri + AI öneri paneli + ekspertiz paneli 66 öğe 4 dilde · placeBid/sealed/AI-motoru/ekspertiz-PDF/değerleme/fees/Currency + doğrulama-rozeti-KOŞULU SIFIR diff · ₺/sayı AR'da LTR · AI Yorumu interpolasyonla · 20/20 PASS (tab tıklayarak) · 0 kod hatası · AR dir=rtl · KVKK→FAZ 3, teklif modal→11-G-3 · ~462 terim sözlük · KAPSAM BÖLÜNDÜ.**
🌐🏛️✅
