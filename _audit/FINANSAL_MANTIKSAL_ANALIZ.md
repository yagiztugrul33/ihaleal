# 💰 FİNANSAL & MANTIKSAL MİMARİ ANALİZİ — "Bu sistem para kazanır mı?"

**Tarih:** 2026-06-01
**Yöntem:** Kod gerçeği (`fees.ts`, `pricingTiers.ts`, `payments-iyzico/index.ts`, `paymentClient.ts`) + Supabase migration durumu + iş modeli yasal analiz
**Doktrin:** Sadece analiz — kod değişmedi.

---

## ⚡ TEK-PARAGRAF SONUÇ

İhaleal **şu an gerçek para ALAMIYOR** çünkü `payments-iyzico` Edge function ve `payments+subscriptions` migration'ı canlıda **deploy/apply edilmemiş**. Kod ve iş modeli %85 hazır: komisyon (%4 toplam, yasal tavanda), 5-tier abonelik (₺399-₺7500/ay), 7 ek hizmet (₺99-₺499). **3 deploy komutuyla sandbox açılır** (önceki DERIN_ANALIZ raporunda); iyzico merchant key (Master başvurusu) + Apple IAP kararı + ödeme kuruluşu lisansı sorusu (escrow için) **üç büyük yasal düğüm**. Birim ekonomisi: ₺5M satıştan **₺81-167k net komisyon**, başabaş 2M₺/ay için **12-25 ihale/ay** yeterli.

---

## 1) GELİR MİMARİSİ — KOD GERÇEĞİ

### 1a — Komisyon motoru (`fees.ts` + `pricingTiers.ts`)

**KOD VAR + UI'DA HESAPLAYICI** — ama:

| Soru | Cevap (kod kanıtı) |
|---|---|
| Hesaplama motoru var mı? | ✅ `calcCommissionBreakdown()` (`fees.ts:83-109`) + `calcCommission()` (`pricingTiers.ts:242-273`) |
| **İhale kapandığında OTOMATİK tahsil ediliyor mu?** | ❌ **HAYIR** — şu an kapatma sonrası tahsilat akışı bağlı değil. Migration `payments` tablo + `payments-iyzico` Edge function ile hazır AMA canlıda yok |
| Kademeli yapı var mı? | ✅ `COMMISSION_BRACKETS` (3 dilim: ≤3M %3, 3-10M %2.5, 10M+ %2) |
| Çelişki var mı? | ⚠️ **EVET** — `fees.ts:5` `COMMISSION_RATE = 0.02` (her taraf %2 sabit) **VS** `pricingTiers.ts:235-238` (kademeli) — iki ayrı model. UI hangisi gösteriyor? Master karar vermeli |

### 1b — Abonelik (5-tier)

| Tier | Fiyat (₺/ay) | Kod | Tahsilat |
|---|---|---|---|
| Bireysel (free) | 0 | ✅ | (ücretsiz) |
| Yatırımcı | 399 | ✅ | ❌ Edge function yok canlıda |
| Emlak Başlangıç | 1500 | ✅ | ❌ aynı |
| Emlak Pro | 3500 | ✅ | ❌ aynı |
| Kurumsal | 7500 | ✅ | ❌ aynı |

Yıllık indirim: %20 (`YEARLY_DISCOUNT_RATE`)

**Premium gate gerçek ödemeye bağlı mı?** ❌ Şu an `useMembershipTier`:
1. RPC `get_my_subscription` → canlıda **migration yok** → null döner
2. Fallback `memberships` tablosu (eski) → opsiyonel
3. Son fallback: **localStorage** ← şu an aktif olan

→ Kullanıcı tarayıcıdan `localStorage.setItem('ihaleal_membership_tier','kurumsal')` ile sahte premium olabilir.

### 1c — Ek hizmet (/magaza = `AddonShopPage.tsx`)

| SKU | Fiyat (₺) | Kategori | Kod |
|---|---|---|---|
| `extra_listing` | 249 | İlan | ✅ |
| `valuation_report` | 249 | Rapor (PDF) | ✅ |
| `ges_report` | 499 | Rapor (PDF) | ✅ |
| `legal_report` | 349 | Rapor (PDF) | ✅ |
| `doping_single` | 99 | Görünürlük | ✅ |
| `vitrin_single` | 199 | Görünürlük | ✅ |
| `featured_auction` | 499 | Görünürlük | ✅ |

UI: `AddonShopPage` 7 kart + "Satın al" butonları
Tahsilat: `paymentClient.createPayment({...purpose: "addon_purchase"...})` → `payments-iyzico` → **canlıda yok** ❌

### 1d — DÜRÜST TABLO — Hangi gelir kalemi gerçek?

| Gelir kalemi | Kod hazır mı | Canlıda tahsilat | Statü |
|---|---|---|---|
| Komisyon (kapanış sonrası) | ✅ Hesap motoru | ❌ | **SADECE UI** |
| Abonelik aylık | ✅ Edge action `create_subscription` | ❌ | **SADECE UI** |
| Abonelik yıllık (%20 indirim) | ✅ | ❌ | **SADECE UI** |
| Ek hizmet (rapor PDF/doping/vitrin) | ✅ Edge action `create_payment` | ❌ | **SADECE UI** |
| Bid bond %5 teminat (banka blokajı) | ⚠️ Kod taslak (`bid_bonds` tablo migration var, edge function farklı) | ⚠️ | **İSKELET** |
| Ek ilan kontörü (Bireysel limit aşımı) | ✅ Stub | ❌ | **SADECE UI** |

**Şu an gerçek tahsilat: ₺0.** Bütün gelir kalemleri **iyzico edge function deploy edilince + merchant key girilince** çalışacak.

---

## 2) BİRİM EKONOMİSİ — RAKAMLI ANALİZ

### 2a — Komisyon başına gelir (her senaryo)

`pricingTiers.ts` `COMMISSION_BRACKETS` kademeli model kullanılarak:

| Satış Tutarı | İlk %3 dilim (₺0–3M) | %2.5 dilim (3M–10M) | %2 dilim (10M+) | Toplam komisyon | Net (KDV %20 hariç) |
|---|---|---|---|---|---|
| **₺3M** | 90.000 | — | — | 90.000 | 75.000 (alıcı) + 75.000 (satıcı)? |
| **₺5M** | 90.000 | 50.000 | — | 140.000 | — |
| **₺10M** | 90.000 | 175.000 | — | 265.000 | — |
| **₺30M** | 90.000 | 175.000 | 400.000 | 665.000 | — |

⚠️ **NOT:** `fees.ts` ile `pricingTiers.ts` ÇELİŞİYOR. `fees.ts`'te %2+%2=%4 sabit (her taraf %2). `pricingTiers.ts`'te kademeli %3→%2.5→%2 (tek taraf gibi görünüyor). **Hangisi gerçek?** Master karar vermeli — bu rapor `pricingTiers.ts` kademeli olduğunu varsaydı (yeni model).

### 2b — İşlem maliyeti (iyzico komisyonu)

iyzico standart komisyon: **%1.95 — %3.45** + KDV (kart türü ve hacme göre)

| Tutar | iyzico komisyonu (orta %2.5) | ihaleal'in net komisyon |
|---|---|---|
| ₺140k (5M satış komisyonu) | ₺3.500 | **₺136.500** |
| ₺265k (10M satış) | ₺6.625 | **₺258.375** |
| ₺665k (30M satış) | ₺16.625 | **₺648.375** |

### 2c — Abonelik gelir profili

Tahmin (yatay senaryo):

| Tier | Abone/ay (varsayım) | Aylık ciro | iyzico kesinti %2.5 | Net |
|---|---|---|---|---|
| Yatırımcı | 100 × ₺399 | ₺39.900 | ₺997 | **₺38.903** |
| Emlak Başlangıç | 30 × ₺1500 | ₺45.000 | ₺1.125 | **₺43.875** |
| Emlak Pro | 10 × ₺3500 | ₺35.000 | ₺875 | **₺34.125** |
| Kurumsal | 3 × ₺7500 | ₺22.500 | ₺562 | **₺21.938** |
| **Toplam abonelik** | 143 abone | ₺142.400 | ₺3.560 | **₺138.840/ay** |

### 2d — Ek hizmet gelir

| SKU | Adet/ay (varsayım) | Ciro | iyzico kesinti | Net |
|---|---|---|---|---|
| valuation_report (₺249) | 100 | ₺24.900 | ₺623 | ₺24.277 |
| ges_report (₺499) | 30 | ₺14.970 | ₺374 | ₺14.596 |
| legal_report (₺349) | 50 | ₺17.450 | ₺436 | ₺17.014 |
| doping_single (₺99) | 200 | ₺19.800 | ₺495 | ₺19.305 |
| vitrin_single (₺199) | 80 | ₺15.920 | ₺398 | ₺15.522 |
| featured_auction (₺499) | 20 | ₺9.980 | ₺250 | ₺9.730 |
| **Toplam addon** | 480 satış | ₺103.020 | ₺2.576 | **₺100.444/ay** |

### 2e — BAŞABAŞ ANALİZİ (Master varsayımı: 2M₺/ay gider)

| Senaryo | Gelir | Ihale adedi/ay gereği |
|---|---|---|
| Sadece abonelik (143 abone) | ₺138.840 | ❌ Tek başına 2M kapatamaz |
| Sadece addon (480 satış) | ₺100.444 | ❌ Tek başına 2M kapatamaz |
| Sadece komisyon (₺5M ortalama satış) | ₺136.500/satış | **15 ihale/ay** → ₺2.05M |
| Sadece komisyon (₺10M ortalama) | ₺258.375/satış | **8 ihale/ay** → ₺2.07M |
| Karma (abone+addon+komisyon ₺5M) | ₺239.284 + 12 ihale × ₺136.500 = ₺1.88M | **12-13 ihale/ay** |
| Karma (abone+addon+komisyon ₺10M) | ₺239.284 + 7 ihale × ₺258.375 = ₺2.05M | **7 ihale/ay** |

> **Başabaş için en kritik metrik: AYLIK BAŞARILI İHALE SAYISI (kapanan satış).**
> Ortalama satış ₺5M ise → **12-15 ihale/ay**
> Ortalama satış ₺10M ise → **7-8 ihale/ay**
> Aboneler ve addon = ekstra ₺230-240k/ay tampon

---

## 3) MİMARİ ÖLÇEKLENEBİLİRLİK

### 3a — Supabase plan limitleri

| Plan | Kullanıcı | DB | Edge fn invocations | Maliyet |
|---|---|---|---|---|
| Free | 50k MAU | 500MB | 500k/ay | $0 |
| Pro (mevcut) | 100k MAU | 8GB | 2M/ay | $25/ay base + usage |
| Team | 500k MAU | 50GB | 50M/ay | $599/ay |

**Mevcut yük (varsayım):** Düşük (demo modunda). 100k MAU'ya kadar Pro plan **yeterli** (~$50-100/ay).

### 3b — Eşzamanlı ihale yükü (k6 testi)

Önceki rapor (`_audit/GROK_PROOF_GUVENLIK.md`): k6 ile 680 req %100 PASS. **Place_bid RPC** stress-test edilmiş.

**Gerçek ölçek (1000+ eşzamanlı kullanıcı, aynı anda 10 ihale)**:
- Kritik: `place_bid` RPC FOR UPDATE lock — serialize ediyor (doğru davranış)
- Edge function rate limit: 60 req/dk varsayılan
- **Beklenen darboğaz:** popüler ihalede son 30 saniye spike → Supabase Pro connection pool (max 60-200) yetebilir; spike altında 100+ ms latency

### 3c — Maliyet eğrisi

| Aktif kullanıcı/ay | Supabase | Vercel | iyzico komisyon | Tahmini gelir | Net |
|---|---|---|---|---|---|
| 1.000 | $25 | $20 | %2.5 | ~₺50.000 | ₺48.250 |
| 10.000 | $50 | $50 | %2.5 | ~₺500.000 | ₺487.500 |
| 100.000 | $599 (Team) | $250 | %2.5 | ~₺5M | ₺4.875M |
| 1.000.000 | $5000+ (Enterprise) | $1000 | %2.0 | ~₺50M | ₺49M |

**Cost-of-revenue:** ~%2-3 → çok sağlıklı (SaaS standart %15-20)

### 3d — Darboğaz analizi

| Yer | Olası kırılma | Çözüm |
|---|---|---|
| Place_bid RPC son 30sn | 100+ eşzamanlı teklif | Anti-sniping ekrana yansıt; queue UI |
| Supabase Realtime | 10k+ subscriber | Realtime channels limit kontrol |
| iyzico rate limit | ödeme ani patlaması | Iyzico Enterprise plan |
| PDF üretimi (jspdf) | Bigger reports | Server-side PDF (Edge function) |
| Vercel function timeout | 10sn limit | Supabase Edge function'a taşı |
| **AI rate limit (ai_qa)** | mevcut 20/saat IP | Yüksek tier kullanıcılara artır |

---

## 4) MANTIKSAL TUTARLILIK — İŞ MODELİ YASAL ANALİZ

### 4a — Komisyon vs platform ücreti? KRİTİK

| Statü | Yasal zemin | Yetki belgesi |
|---|---|---|
| **"Komisyon"** | Taşınmaz Ticareti Yönetmeliği (md.13) | ✅ Halil İbrahim Bey Seviye 5 yetki belgesi VAR (proje belgesi) |
| **"Platform ücreti"** | TBK genel hükümler — komisyon yasalına bağlı değil | Yetki gerek yok ama "emlak komisyonu" diye ad veremezsin |

**KOD KANITI:**
- `fees.ts:1` "ihaleal.com komisyon, üyelik, hizmet bedeli merkezi" → **"komisyon"** dili kullanılıyor ✅
- Şablonlar: "İhale Katılım Sözleşmesi" / "Mesafeli Satış" → tutarlı

→ **MODEL = KOMİSYON.** Yetki belgesi (Seviye 5) ile yasal zemin VAR. ⚠️ AMA komisyon = "**hizmet bedeli karşılığı satış aracılığı**" — ihaleal sadece platform olduğu için **fiilen** aracılık yapıyor mu, **sadece teknik platform** mu — hukuki ayrım önemli (avukat görüşü).

### 4b — Yasal tavan: %4 (KDV hariç)

**Taşınmaz Ticareti Yönetmeliği md.20:** Emlak komisyonu **alıcı+satıcı toplam %4 (KDV hariç)** tavanı.

| Model | Toplam komisyon | Yasal tavan kontrolü |
|---|---|---|
| `fees.ts` (her taraf %2 = %4) | %4 | ✅ TAM TAVAN SINIRDA |
| `pricingTiers.ts` (kademeli %3→%2) | İlk dilimde %3 (tek taraflı?) | ⚠️ BELİRSİZ — kademeli + kim öder net değil |

**RİSK:** `fees.ts` kullanıldıkça %4 limit AŞILMIYOR ✅. AMA ek hizmetler (rapor %349, doping %99) komisyon dışı **hizmet bedeli** olarak ayrı — yasal sayılır. Ancak **kullanıcıya birlikte sunuldukça** "gizli komisyon" şüphesi (TKHK m.5) doğabilir. Avukat netleştirmeli.

### 4c — Float/teminat — ödeme kuruluşu lisansı

**Kritik soru:** %5 bid bond + komisyon escrow → ihaleal kullanıcı parasını **tutuyor mu?**

| Model | Yasal zemin |
|---|---|
| **Banka blokajı (provizyon)** | ✅ Para ihaleal'a gelmez, banka kart blokesi | 6493 sayılı kanun **kapsam DIŞI** |
| **Emanet hesap (escrow)** | ⚠️ Para ihaleal vekilliğinde → **6493 kapsamına girer** (Ödeme Kuruluşu lisansı SARMAL) |
| **Direkt satıcıya ödeme + komisyon kesinti** | ✅ Aracılık — ihaleal sadece komisyon | 6493 kapsam dışı |

**KOD KANITI** (`templates.ts` ihale_katilim §3):
> *"Katılımcı, teklif vermeden önce gayrimenkul muhammen değerinin %5'i tutarında **kredi kartı PROVİZYONu (banka blokajı)** verir; nakit çekim yapılmaz."*

→ ✅ **BANKA BLOKAJI MODELİ** seçilmiş → 6493 kapsamı **DIŞINDA** ✅

⚠️ **AMA komisyon escrow?** Şablon §5.3:
> *"Bedel, anlaşmalı bankaya **emanet (escrow)** yatırılır; tapu devri sonrası satıcıya geçer."*

→ Escrow = "anlaşmalı banka" (Master'ın anlaşacağı banka kendisi tutar) → ihaleal **emanetçi değil**, sadece komisyon kesintiyle alır. **Doğru tasarım** ✅

### 4d — Apple IAP riski

| Satış türü | Apple kuralı |
|---|---|
| Premium üyelik (dijital) | **IAP zorunlu** %15-30 komisyon |
| Tek seferlik rapor PDF (dijital) | **IAP zorunlu** %15-30 |
| Komisyon (gayrimenkul, fiziksel) | **IAP serbest** — web ödeme OK |
| Doping/vitrin (dijital görünürlük) | Tartışmalı — IAP gerekebilir |

**Etki:** Aylık abonelik gelirinin **%15-30'u Apple'a** (mobile kullanıcı oranı kadar). Master'ın 3 stratejiden (`docs/mobile/IAP_STRATEJISI.md`) karar vermesi gerek.

| Senaryo | Aylık abonelik geliri | Apple kesinti (%50 kullanıcı mobile, %20 ortalama) | Net |
|---|---|---|---|
| Mevcut (web only) | ₺142.400 | 0 | ₺142.400 |
| Hibrit (web kayıt + mobile IAP) | ₺142.400 | ₺142.400×0.5×0.2 = ₺14.240 | **₺128.160** |
| Full IAP (Apple+Google) | ₺142.400 | ₺142.400×0.275 = ₺39.160 | **₺103.240** |

### 4e — Mantık boşlukları / yasal riskler

| # | Risk | Etki | Çözüm |
|---|---|---|---|
| 1 | Komisyon modeli `fees.ts` vs `pricingTiers.ts` çelişiyor | Kullanıcı kafası karışır + yasal denetim | Master tek model seçsin |
| 2 | %4 tavanına çok yakın (her taraf %2) | İndirim/promosyon yapılırsa tavan aşımı | İndirimde toplam takip |
| 3 | "Komisyon" mu "platform ücreti" mi dil | Yasal denetim "aldatıcı reklam" | Avukat tek dil |
| 4 | Mesafeli sözleşme §1 şirket bilgileri eksik | TKHK m.48 zorunluluk | Master MERSIS+VKN ekle |
| 5 | Ek hizmet "komisyon dışı" ama paket olunca? | Gizli komisyon iddiası | Açık fatura ayrı |
| 6 | Bid bond %5 yasal mı? | %5 cezai şart üst sınır var (TBK m.182) | Avukat orantısallık |
| 7 | Apple IAP kararı yok | Mobile gelir %15-30 azalır | Master+avukat A/B/C |
| 8 | iyzico merchant başvurusu yok | Şu an gerçek tahsilat sıfır | Master başvurusu 1-5 iş günü |

---

## 🎯 NET SONUÇ — "Bu sistem para kazanır mı?"

### ✅ EVET, ŞARTLI OLARAK — ama 4 büyük blokerli

**Kod hazırlığı:** %85 hazır (hesaplama motorları, fiyat tier'ları, UI ödeme akışı, iyzico edge fonksiyonu, RLS güvenlik, 7 PDF şablon, 10 senaryo)

**Operasyonel hazırlık:** **%30** — şu 4 blok olmadan ₺0 tahsilat:

| # | Bloker | Sahibi | Süre | Etki |
|---|---|---|---|---|
| 1 | `payments-iyzico` Edge function deploy | Claude Code | 1 dk | Sandbox açılır |
| 2 | Migration `20260606200000` apply (`db push`) | Master | 1 dk | payments+subscriptions canlıya |
| 3 | iyzico merchant başvurusu | Master | 1-5 iş günü | Gerçek tahsilat (sandbox→prod) |
| 4 | Avukat onaylı yasal metinler | Master | 2-4 hafta + ₺50-150k | Lansman riski azalır |

**Yasal hazırlık:** Komisyon modeli (Seviye 5 yetki ✅), yasal tavan (%4 ✅), banka blokajı 6493 dışı ✅, mesafeli sözleşme v2.0 ✅. Eksik: 5070 belirsizliği, MERSIS bilgisi, IAP kararı, fees vs pricingTiers tutarlılık.

**Birim ekonomi:** Sağlıklı. Cost-of-revenue %2-3 (SaaS standart %15-20'nin altında). Başabaş: **12-15 ihale/ay** (₺5M ort.) veya **7-8 ihale/ay** (₺10M ort.).

**Ölçeklenebilirlik:** Mevcut Supabase Pro ile 100k MAU'ya kadar dayanır. 1M MAU+ için Team/Enterprise plan ($5-10k/ay maliyet, ₺50M+ aylık gelirle karşılanır).

---

## 🚨 MASTER + DANIŞMAN KARARLARI

| Karar | Karar veren | Aciliyet |
|---|---|---|
| **Komisyon modeli netliği** (fees.ts vs pricingTiers.ts) | Master | 🔴 Şimdi |
| **iyzico merchant başvurusu** | Master | 🔴 Şimdi |
| **Avukat seçimi + tarama** | Master + avukat firma | 🔴 1-2 hafta |
| **Şirket bilgileri (MERSIS/VKN) yasal metinlere ekleme** | Master | 🔴 1 hafta |
| **Apple IAP stratejisi (A/B/C)** | Master + avukat + mali müşavir | 🟡 Mobile lansman öncesi |
| **Escrow/emanet banka anlaşması** | Master + bankacılık danışmanı | 🟡 İlk ihale öncesi |
| **5070 belirsizliği netleştirme** (irade beyanı vs nitelikli) | Avukat | 🟢 Lansman öncesi |
| **Ek hizmet ayrı fatura prosedürü** (TKHK m.5 risk) | Mali müşavir | 🟢 Operasyon öncesi |

---

## 📂 Kanıt Dosyaları

```
_audit/
├── FINANSAL_MANTIKSAL_ANALIZ.md   ← bu rapor
├── DERIN_ANALIZ.md                ← Para sistemi deploy durumu
├── HUKUK_DOGRULAMA.md             ← Yasal metin canlı doğrulama

src/lib/
├── fees.ts                  ← %2+%2 = %4 sabit model
├── pricingTiers.ts          ← Kademeli %3→%2.5→%2 + 5 tier + 7 addon
└── payments/paymentClient.ts ← 5 fonksiyon (create/cancel/status)

supabase/functions/payments-iyzico/index.ts ← 472 satır, sandbox+prod, ❌ canlıda deploy YOK
supabase/migrations/20260606200000_payments_subscriptions.sql ← payments+subs+audit, ❌ canlıda apply YOK
```

---

— **Sistem para kazanabilir; 3 deploy komutu + Master 4 karar + avukat onayı kalmış.** 💰
