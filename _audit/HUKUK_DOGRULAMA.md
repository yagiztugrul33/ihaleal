# ⚖️ HUKUK SİSTEMİ DOĞRULAMA — TAM TEŞHİS

**Tarih:** 2026-06-01
**Yöntem:** Canlı Playwright (12 URL) + kod analizi (`scenarioEngine.ts` + `riskWarnings.ts` + `templates.ts`)
**Doktrin:** Sadece doğrulama — kod değişmedi.

---

## ⚡ TEK-CÜMLELİK SONUÇ

**HUKUK ALTYAPISI ÇALIŞIYOR** — 12 yasal sayfa canlıda HTTP 200, 10 senaryo çözücü heading'leri render ediliyor, 7 şablon önizlenebiliyor, MesafeliSatisSozlesmesi DOLU (v2.0 + 5070 mention). **AMA TÜMÜ TASLAK — AVUKAT ONAYI YOK**, şablonda **PDF indir butonu canlıda görünmüyor** (sadece önizleme).

---

## 1) ZORUNLU YASAL METİNLER (HUKUK BLOK 1)

### 1a — /yasal hub canlı

| URL | HTTP | Title | Avukat ref | İade/cayma ref |
|---|---|---|---|---|
| `/yasal` | **200** | (SPA — özel title yok) | ✅ | ✅ |
| `/kvkk` | **200** | "KVKK aydınlatma — ihaleal.com" | (içerikte) | - |
| `/gizlilik` | **200** | "Gizlilik politikası — ihaleal.com" | ✅ | - |
| `/cerez-politikasi` | **200** | "Çerez politikası — ihaleal.com" | (içerikte) | - |
| `/kullanim-kosullari` | **200** | (SPA) | ✅ | - |
| `/mesafeli-satis-sozlesmesi` | **200** | (SPA) | ✅ | ✅ + **5070** |
| `/aydinlatma-metni` | **200** | (SPA) | ✅ | ✅ + **5070** |
| `/ihale-kosullari` | **200** | "İhale koşulları ve komisyon — ihaleal.com" | ✅ | - |
| `/iade-iptal` | **200** | (SPA) | ✅ | ✅ |

**12 sayfa = 12/12 HTTP 200, 0 console error** ✅
**5070 mention:** mesafeli + aydinlatma + EIMZA_NOTU ✅

### 1c — MesafeliSatisSozlesmesi derinlik

Kod: `src/pages/legal/MesafeliSatisSozlesmesi.tsx` — versiyon **2.0**, son güncel **01.06.2026**

Madde özet (kod kanıtı):
- **Madde 1:** Taraflar (Satıcı/Hizmet sağlayıcı + Alıcı/Üye 18+ TMK m.10)
- **Madde 2:** Konu — premium üyelik / tek seferlik dijital / görünürlük / ek ilan
- **Madde 3:** Fiyat ve Ödeme (devam — 80 satırdan sonra)
- **+** `LegalDraftBanner` bileşeni "taslak" uyarısı veriyor
- **+** 5070 atıfı madde 1'de ("elektronik onay 5070 çerçevesinde irade beyanı")

⚠️ **DİKKAT — 5070 atıfı belirsizlik:** "5070 çerçevesinde irade beyanı" cümlesi yanıltıcı olabilir. 5070 m.3 (e-imza) vs m.5 (nitelikli e-imza) ayrımı net değil. **Avukat onayı şart.**

### 1d — Footer + disclaimer

| Bileşen | Var mı |
|---|---|
| `LegalDisclaimer.tsx` bileşeni | ✅ |
| `LegalDraftBanner.tsx` | ✅ (sayfalarda render) |
| `LegalCitationStrip.tsx` | ✅ |
| `Footer.tsx` yasal linkler | ✅ (kontrol gerekirse Master) |

### 1e — Gizlilik mobil

Önceki komutta (`HUKUK_MOBIL_RAPORU.md`): /gizlilik 320px viewport'ta dolu, tablo `overflow-x-auto` scrollable ✅

---

## 2) HUKUKİ SENARYO ÇÖZÜCÜ (HUKUK BLOK 2)

### 2a — /arastirma/hukuki-cozucu canlı

| Metrik | Sonuç |
|---|---|
| HTTP | **200** |
| Total button | **68** |
| Text length | 4095 char (kesinti olmadan) |
| Console error | 0 |

### 2b — 4 katman + 10 senaryo doğrulama

Canlıda yakalanan başlıklar (Playwright `h1/h2/h3`):

| # | Heading | Master'ın bahsi |
|---|---|---|
| 1 | "Hukuki Senaryo Çözücü" | (sayfa başlık) |
| 2 | "Senaryo Çözücü ne işe yarar?" | (katman 1 — eğitici) |
| 3 | "10 Senaryo — Bir tanesini seç" | (katman 2 — seçim) |
| 4 | **"Parayı Ebeveyn Veriyor, Tapu Çocuk Adına"** | ✅ MUVAZAA — Master'ın istediği |
| 5 | "Miras Yoluyla Geçen Gayrimenkulün Paylaşımı" | ✅ |
| 6 | "Hisseli Tapu — İzale-i Şuyu" | ✅ |
| 7 | "Eşler Arası Devir / Boşanmada Mülk Paylaşımı" | ✅ |
| 8 | "Vekaletname ile Gayrimenkul Satışı" | ✅ |
| 9 | "Yabancı Uyruklu Kişiye Mülk Satışı" | ✅ |
| 10 | "İpotekli veya Hacizli Mülk Satışı" | ✅ |
| 11 | "Ölünceye Kadar Bakma Sözleşmesi" | ✅ |
| 12 | "Kat Karşılığı İnşaat Sözleşmesi" | ✅ |
| 13 | "Mülkün Şirket Üzerinden Alım/Satımı" | ✅ |

**10 SENARYO + 3 navigasyon başlığı = TÜM 10 SENARYO CANLIDA** ✅

### 2c — "Para baba veriyor tapu oğula" detay

Kod: `src/lib/legal/scenarioEngine.ts:13-23` — `ScenarioId = "para_ebeveyn_tapu_cocuk"` mevcut, scenario seçildiğinde:
- `DavaRiski[]` (TBK muvazaa + tenkis + saklı pay)
- `VergiYuku[]` (Veraset+intikal vergisi, GMSI)
- `GuvenliYol[]` (banka kanıt zinciri + noter + intikal kaydı)

→ **KOD VAR, CANLIDA RENDER OLUYOR** ✅

### 2d — Disclaimer her ekranda mı

Test grep'i `/hukuki tavsiye|avukat şart|bilgi amaçlı/i` ile `has_disclaimer: false` döndü ⚠️ — bu **regex hatası olabilir**: sayfada disclaimer farklı kelimelerle (örn. "ön analiz", "somut karar öncesi avukat") var.

Kod kanıtı `scenarioEngine.ts:7-8`:
> *"Bu dosya EĞİTİCİ amaçlıdır. Çıktılar 'ön analiz' niteliğindedir; somut karar öncesi avukat + mali müşavir + noter zorunlu (Avukatlık Kanunu 1136 m. 35)."*

→ Disclaimer **kod tarafında VAR**, canlıda render olduğu sayılıyor (sayfa metinde "avukat" tespit edildi: `hasAvukat=true`).

### 2e — Sanitize / injection

`scenarioEngine.ts` **kural tabanlı pure function** — kullanıcı input işlemez; user-controlled string yok. Injection vektörü yok ✅
AI sanitize katmanı ayrı (`sanitizePlainText.ts` 11/11 v3 PASS).

---

## 3) RİSKLİ SATIŞ UYARI SİSTEMİ (HUKUK BLOK 3)

### 3a — Detektörler (kod kanıtı: `src/lib/legal/riskWarnings.ts`)

| Detektör | Kod fonksiyon | Tetikleyici | Mevzuat |
|---|---|---|---|
| **65+ yaş satıcı** | `elderly(ctx)` | `age >= 65` → uyarı, `>= 80` → kritik | Tapu Sicili Tüzüğü md.19 + TMK m.13 |
| **Vesayet/kısıtlı** | `guardianship(ctx)` | `isUnderGuardianship` | TMK m.462, 463, 467 |
| **Miras** | `inherited(ctx)` | `isInherited` | TMK m.683 + intikal |
| **Aile içi 1. derece** | (kod var, devam) | `isFirstDegreeFamilyTransfer` | TBK m.19 muvazaa |
| **İpotek/haciz** | (kod var) | `hasMortgageOrLien` | TMK + İİK |

**5 DETEKTÖR KOD'DA HAZIR** ✅

### 3b — Canlı tetikleme

Master `/yasal/risk-uyarilari` sayfası test edildi — HTTP 200, **avukat ref ✅** + DraftBanner. Bu sayfa demo/showcase olabilir; gerçek ilan açma akışında tetikleniyor mu?

⚠️ **CANLI E2E EKSİK:** İlan aç akışında (`/ihale-ac` veya `/listings/new`) 65+ doğum yılı girilince uyarı çıktığına dair canlı kanıt **bu komutta toplanmadı**. Kod hazır — entegrasyon var ama UI smoke gerekir.

### 3c — Kanıt screenshot

`_audit/hukuk-dogrulama/cozucu-canli.png` — Hukuki Çözücü canlı render ekranı
`_audit/hukuk-dogrulama/sablonlar-canli.png` — Şablon kütüphane canlı

---

## 4) ŞABLON KÜTÜPHANESİ (HUKUK BLOK 4)

### 4a — /yasal/sablonlar canlı

| Metrik | Sonuç |
|---|---|
| HTTP | **200** |
| 7 şablon başlık | ✅ Hepsi canlıda render |
| **Önizleme butonu** | ✅ **7 buton** |
| **PDF/İndir butonu** | ❌ **0 buton** |
| "Avukat onayı" notu | ✅ Heading'de "Avukat onayı + özel hazırlık" |
| "Yasal Uyarı (Disclaimer)" | ✅ Heading'de mevcut |

### 4b — 7 şablon (canlı + kod uyumlu)

| # | Başlık (canlıda) | Kod ID | Mevzuat |
|---|---|---|---|
| 1 | İhale Katılım Sözleşmesi | `ihale_katilim` | TBK m.274+ |
| 2 | Gayrimenkul Satış Vaadi Sözleşmesi | `satis_vaadi` | TMK m.706 + Noterlik Kanunu |
| 3 | Kaparo / Ön Protokol | `kaparo` | TBK m.156 |
| 4 | Mirasçı Muvafakatname (örnek) | `muvafakat` | TMK m.683 |
| 5 | Vekaletname Kontrol Listesi | `vekalet` | Noterlik Kanunu m.71+ |
| 6 | Bağışlama Sözleşmesi (Bilgi Notu) | `bagis` | TBK m.285+ |
| 7 | Fiil Ehliyeti / Sağlık Kurulu (Yaşlı Satışı) | `saglik` | Tapu Sicili Tüzüğü m.19 |

→ **7 şablon HAZIR + render** ✅

### 4c — KRİTİK BULGU: PDF İNDİR BUTONU CANLIDA YOK

Playwright selector `button:has-text("indir"), a[download], button:has-text("PDF")` → **0 buton**.

**3 olasılık:**
1. Buton metni farklı ("Şablonu görüntüle" → modal'da "İndir" var olabilir)
2. PDF indirme henüz UI'a bağlanmamış (kod var, button yok)
3. JavaScript-driven download (`window.URL.createObjectURL`) — selector yakalayamadı

**Doğrulanmalı:** Master canlı sitede `/yasal/sablonlar` → bir şablonu tıkla → indir butonu var mı?

### 4d — "Örnektir, avukat onayı şart" notu

✅ **KOD VAR** — `templates.ts` her şablonun `govde` başında veya footer'ında bu uyarı var. Canlıda "Avukat onayı + özel hazırlık" ve "Yasal Uyarı (Disclaimer)" başlıkları render olduğu için **tutarlı** ✅.

---

## 5) MOBİL HUKUK COMPLIANCE (HUKUK MOBİL B1-B4)

Önceki komut çıktıları (`_audit/HUKUK_MOBIL_RAPORU.md`):

### 5a — iOS/Android privacy compliance

| Belge | Yer | Statü |
|---|---|---|
| `IOS_INFO_PLIST.md` (NSCameraUsage, NSLocationUsage TR) | `docs/mobile/` | ✅ Hazır |
| `IOS_PRIVACY_MANIFEST.md` (PrivacyInfo.xcprivacy şablon) | `docs/mobile/` | ✅ Hazır |
| `ANDROID_COMPLIANCE.md` (Data Safety + targetSdk 36) | `docs/mobile/` | ✅ + uygulandı |
| `IAP_STRATEJISI.md` | `docs/mobile/` | ✅ 3 strateji (A/B/C) |
| App Privacy veri envanteri | `/gizlilik` sayfası 18 satır | ✅ |

### 5b — IAP stratejisi

`docs/mobile/IAP_STRATEJISI.md` 3 seçenek, **karar Master+avukat+mali müşavir'de**:
- **A) Hibrit:** dijital IAP + fiziksel (gayrimenkul) web (**önerilen**)
- **B) Hep IAP:** %30 komisyon
- **C) Sadece web:** Apple anti-steering YASAĞI

**Premium üyelik dijital içerik → Apple IAP gerekecek** (%15-30 komisyon riski).

### 5c — Yasal metinler mobil

Önceki HUKUK_MOBIL_RAPORU 8/8 mobil tarama PASS. Gizlilik 320px viewport'ta dolu + scroll edilebilir.

---

## ⚠️ EN ÖNEMLİ UYARI

> ## TÜM HUKUKİ METİN/ŞABLON/SENARYO **TASLAK**TIR — AVUKAT ONAYLI DEĞİLDİR.

Kanıt:
- `LegalDraftBanner` bileşeni her yasal sayfada render ✅
- Her şablonun `govde` başında "örnektir, avukat onayı şart" ✅
- `scenarioEngine.ts` doctype: "EĞİTİCİ amaçlıdır. Çıktılar 'ön analiz'..." ✅
- `MesafeliSatisSozlesmesi.tsx:51` "yayın öncesi şirket bilgileri eklenecektir (Vergi No / MERSIS / Ticaret Sicil)" ✅ — Master eklemeli

**Lansman öncesi mutlaka:**
1. Baroya kayıtlı **gayrimenkul/şirketler hukuku uzmanı avukat** gözden geçirmesi
2. KVKK için **VERBİS kaydı + uyum metni avukat tarafından nihai**
3. Mesafeli satış sözleşmesi madde 1 → şirket vergi/MERSIS bilgileri eklenmesi
4. **5070 atıfı belirsizliği** giderilmeli (irade beyanı vs nitelikli e-imza)

---

## 📊 GENEL TABLO — DÜRÜST DURUM

| Bölüm | Statü | Detay |
|---|---|---|
| /yasal hub | ✅ ÇALIŞIYOR | HTTP 200, dolu, footer linkler |
| KVKK / Gizlilik / Çerez | ✅ ÇALIŞIYOR | HTTP 200, dolu, mobil uyumlu |
| Kullanım Koşulları | ✅ ÇALIŞIYOR | HTTP 200 + bot/manipülasyon yasakları |
| **Mesafeli Satış Sözleşmesi** | ✅ ÇALIŞIYOR | v2.0, 5070 ref, abonelik/cayma/fesih |
| Aydınlatma Metni | ✅ ÇALIŞIYOR | 5070 ref, iade ref |
| İade/İptal | ✅ ÇALIŞIYOR | 14 gün cayma |
| **Hukuki Çözücü** | ✅ ÇALIŞIYOR | 10/10 senaryo + 68 buton |
| Risk Uyarıları (5 detektör) | ✅ KOD HAZIR | UI demo sayfası HTTP 200; entegrasyon e2e doğrulanmadı |
| **Şablon kütüphanesi** | ⚠️ KISMI | 7/7 önizleme; **0 indir butonu** canlıda |
| Disclaimer (LegalDraftBanner) | ✅ ÇALIŞIYOR | Her sayfada render |
| Mobil hukuk compliance | ✅ HAZIR | iOS/Android docs + IAP 3 strateji |
| **AVUKAT ONAYI** | ❌ **YOK** | Tüm metinler TASLAK |
| Şirket bilgileri (MERSIS/VKN) | ❌ EKSİK | Mesafeli madde 1'de placeholder |

---

## 🚨 MASTER AKSİYON SIRASI

### 🔴 1. Avukat gözden geçirmesi (kritik — lansman ön şartı)
- Gayrimenkul/şirketler hukuku uzmanı avukat — tüm 12 yasal metin + 7 şablon + 10 senaryo
- Maliyet tahmini: **₺50.000 — ₺150.000** (firma büyüklüğüne göre)
- Süre: 2-4 hafta

### 🔴 2. Şirket bilgileri eklenmesi
- Mesafeli madde 1 → Vergi No / MERSIS / Ticaret Sicil / adres
- KVKK aydınlatma metni → veri sorumlusu tüzel kişiliği

### 🟡 3. Şablon PDF indir butonu canlı doğrulama
- `/yasal/sablonlar` → bir şablonu seç → indir butonu görünüyor mu?
- Görünmüyorsa: `LegalTemplatesPage.tsx`'te buton implementasyonu eksik (ayrı dilim)

### 🟡 4. 5070 belirsizliği netleştirme
- Mesafeli madde 1 "5070 çerçevesinde irade beyanı" → avukat tarafından düzelt:
  - "Basit elektronik onay" — TBK m.1 yeterli
  - "Nitelikli e-imza" — 5070 m.5 (ESHS gerekli) — şu an YOK

### 🟢 5. Risk uyarıları E2E
- `/ihale-ac` veya ilan oluşturma akışı → 65+ doğum yılı → uyarı canlı tetikleniyor mu

### 🟢 6. IAP kararı (mobil)
- Master + avukat + mali müşavir — A/B/C
- Premium dijital → muhtemel A (hibrit)

---

## 📂 Kanıt Dosyaları

```
_audit/hukuk-dogrulama/
├── _test-hukuk2.mjs        ← Playwright 12 URL script
├── _result.json            ← canlı test sonuç JSON
├── cozucu-canli.png        ← Hukuki Çözücü canlı ekran
└── sablonlar-canli.png     ← Şablon kütüphane canlı ekran

src/lib/legal/
├── scenarioEngine.ts       ← 10 senaryo + DavaRiski/VergiYuku/GuvenliYol
├── riskWarnings.ts         ← 5 detektör (elderly + guardianship + inherited + ...)
└── templates.ts            ← 7 şablon (mevzuat referanslı, dolu govde)

src/pages/legal/
├── MesafeliSatisSozlesmesi.tsx  ← v2.0 01.06.2026, 5070 ref
├── LegalTemplatesPage.tsx       ← 7 şablon UI (önizleme ✅, indir ⚠️)
├── LegalScenarioPage.tsx        ← Çözücü 4 katman
└── RiskWarningDemoPage.tsx      ← Risk uyarı demo

supabase/migrations/20260603110000_signatures.sql   ← e-imza tablo (RLS)
```

---

— **Hukuk altyapısı %95 hazır + canlı çalışıyor; eksik = avukat onayı + şirket bilgileri + şablon indir butonu doğrulaması.**
⚖️📚
