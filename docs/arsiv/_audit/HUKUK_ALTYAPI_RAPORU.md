# ⚖️ Hukuki Altyapı — Final Rapor

> ## ⚠️ Master — DİKKAT
> **localhost'a DEĞİL, canlı `ihaleal.com`'a bak.** Tüm değişiklikler `origin/main`'e push edildi → Vercel auto-deploy.
> Hard refresh: `Ctrl + Shift + R` (Windows) / `Cmd + Shift + R` (Mac).
>
> ### 🔴 KRİTİK AVUKAT ONAYI ŞART
> **Tüm hukuki metin, şablon, senaryo analizi ve risk uyarıları TASLAK/EĞİTİCİ niteliktedir.**
> Yasal yayına çıkmadan ÖNCE baroya kayıtlı bir AVUKAT tarafından **mutlaka** gözden geçirilmelidir.
> İhaleal Avukatlık Kanunu 1136 m. 35 gereği danışmanlık VERMEZ — kullanıcı her ekranda bilgilendirilir.

**Tarih:** 2026-06-01
**Tag:** `safe-before-hukuk-altyapi` → `safe-before-hukuk-blok{2..6}`
**Toplam commit:** 5 atomik (BLOK 1+2+3+4+6; BLOK 5 sadece not — Master kararı bekliyor)
**Final scan:** ✅ Desktop **143/143** + Mobile 320px **143/143** + Hukuk akış **7/7**

---

## 📊 Bir Bakışta

| Blok | Konu | Commit | Sonuç |
|------|------|--------|-------|
| 1 | Zorunlu metinler + `/yasal` hub + ortak disclaimer | `0fbfd62` | ✅ |
| 2 | `/arastirma/hukuki-cozucu` 4 katman + 10 senaryo | `5946a84` | ✅ |
| 3 | Riskli satış uyarı sistemi (5 detector) | `4d63de6` | ✅ |
| 4 | `/yasal/sablonlar` 7 şablon + önizle/indir | `380ba8d` | ✅ |
| 5 | **NOT (yapılmadı — ileride):** Avukat ağı + belge doğrulama API | — | 📌 |
| 6 | Final 143/143 + bu rapor | (bu commit) | ✅ |

---

## 🔹 BLOK 1 — Zorunlu Metinler + /yasal Hub (commit `0fbfd62`)

**Yeni dosyalar:**
- `src/components/legal/LegalDisclaimer.tsx` — 3 komponent ortak disclaimer
  - `LegalDisclaimer` (full): Avukatlık 1136 m. 35 + 4 zorunlu uzman (avukat/YMM/noter/eksper)
  - `LegalDraftBanner` (üst): "TASLAK / EĞİTİCİ" amber banner
  - `LegalCitationStrip` (alt): mevzuat etiket şeridi
- `src/pages/legal/LegalHubPage.tsx` (`/yasal`) — **YENİ HUB**
  - 12 yasal metin kategorize (Veri+KVKK, Üyelik+Sözleşme, İhale, Eğitici Rehber)
  - Arama + filtre chip + Required/Yeni badge
  - **Mevzuat Haritası**: 6 kategori × ~18 kanun referansı (KVKK/TKHK/TMK/İmar/Ödeme/Yargı)
  - Yasal iletişim (kvkk@ + hukuk@ + guvenlik@)

**Derinleştirilen metinler:**
- `MesafeliSatisSozlesmesi.tsx`: 33 → **280 satır**, 12 madde tam sözleşme (Taraflar, Konu, Fiyat+KDV, Cayma 14 gün, Hizmet sunumu, Fesih, Yükümlülük, Komisyon, Sorumluluk sınırı, KVKK, Uyuşmazlık, Yürürlük)
- `AydinlatmaMetni.tsx`: 30 → **200 satır**, 8 madde (Veri sorumlusu, Kategori, Amaç, Hukuki sebep KVKK m.5, Aktarım m.8-9, Haklar m.11, Saklama, Açık rıza)
- `IadeIptal.tsx`: 24 → **180 satır**, 7 madde (Premium iptal, PDF istisnası, Doping, Komisyon, Hesap silme, Başvuru, Şikayet)

**Diğer:**
- `Footer.tsx`: "Yasal Hub (tümü)" Scale ikon ile en üste eklendi
- Route: `/yasal` + alias `/legal`

---

## 🔹 BLOK 2 — Hukuki Senaryo Çözücü (commit `5946a84`)

**`src/lib/legal/scenarioEngine.ts` (530 satır)** — Pure function kural motoru:
- 10 senaryo blueprint × ortalama 3 dava + 3 vergi + 5 adım güvenli yol + AI yorum
- Dinamik risk skoru (input-aware: saklı pay sayısı, paper trail flag)
- TypeScript strict: ScenarioInput, ScenarioAnalysis, RiskLevel, DavaRiski, VergiYuku, GuvenliYol

**10 Senaryo:**
1. **Para ebeveyn → tapu çocuk** (muvazaa + tenkis + bağış + vergi) — Yargıtay 1.HD E.2018/3274 içtihat
2. **Miras paylaşımı** (elbirliği mülkiyet + izale-i şuyu + VİV)
3. **Hisseli / izale-i şuyu** (aynen taksim → açık artırma satışı)
4. **Eşler arası / boşanma** (edinilmiş mallara katılma TMK 218+)
5. **Vekaletle satış** (noter özel vekalet + sahte vekalet kontrol)
6. **Yabancıya satış** (2644 m. 35 + askeri yasak bölge + 30 ha kota)
7. **İpotekli / hacizli** (TKGM sorgu + fek belgesi + ilişik kesme)
8. **Ölünceye kadar bakma** (TBK 611-619 + tenkis riski)
9. **Kat karşılığı** (teminat + hak ediş + müteahhit iflas)
10. **Şirket üzerinden** (KVK 5/e + transfer fiyat + TTK 408)

**`src/pages/legal/LegalScenarioPage.tsx` (400 satır) — 4 KATMAN:**
- **KATMAN 1 EĞİTİCİ:** 3 hedef profil kartı (Bireysel / Müteahhit / Yatırımcı)
- **KATMAN 2 SEÇİM + PARAMETRELER:** 10 kart grid + arama + filtre + mülk değer + saklı pay sayısı + paper trail
- **KATMAN 3 ANALİZ (dinamik):**
  - Risk skor kartı (0-100 + tone-coded Düşük/Orta/Yüksek)
  - Hukuki nitelik özeti
  - Açılabilecek davalar tablosu (mevzuat + davacı + detay)
  - Vergi yükü tablosu (oran + yükümlü + mevzuat)
  - Saklı pay etkisi (input-aware mesaj)
  - Güvenli yol — numaralı adımlar (eylem + sebep + süre)
  - AI yorum (dikkat çekilen 4 nokta)
  - Yargıtay içtihat referansı (varsa)
- **KATMAN 4 GÜVEN:** LegalCitationStrip + LegalDisclaimer (Avukatlık 1136)

Route: `/arastirma/hukuki-cozucu` + alias `/yasal/cozucu`

---

## 🔹 BLOK 3 — Riskli Satış Uyarı Sistemi (commit `4d63de6`)

**`src/lib/legal/riskWarnings.ts`** — 5 detector (pure function):
- **`elderly`**: 65+ yaş → fiil ehliyeti sağlık kurulu raporu (Tapu Sicili Tüzüğü md.19) — 80+ Kritik
- **`guardianship`**: Vesayet altında → Sulh Hukuk Mahkemesi izni zorunlu (TMK 462) — KESİN HÜKÜMSÜZ
- **`inherited`**: Miras mülkü → TÜM mirasçı muvafakat + VİV ilişik kesme (TMK 599, 676)
- **`familyTransfer`**: 1. derece akraba devri → muvazaa + saklı pay uyarısı (TBK 19, TMK 560-571)
- **`mortgageLien`**: İpotek/haciz/şerh → TKGM sorgu + fek belgesi + ilişik kesme (TMK 880+)

**`src/components/legal/RiskWarningPanel.tsx`** — Drop-in component:
- Sayfa/form'a göm: `<RiskWarningPanel context={...} />`
- Boş durumda yeşil "özel risk uyarısı yok" banner
- Her uyarı: severity rozet (info/uyari/kritik) + checklist + mevzuat + çözücü link
- "İşlemi engellemez · bilgilendirir" notu

**`src/pages/legal/RiskWarningDemoPage.tsx`** (`/yasal/risk-uyarilari`):
- KATMAN 1: 5 örnek kart eğitici
- KATMAN 2: doğum yılı + 4 checkbox SIMÜLASYON formu
- KATMAN 3: RiskWarningPanel canlı (form değişince anında güncellenir)
- KATMAN 4: LegalDisclaimer

**Doğrulanan davranış (4 senaryo):**
- 1955 (71 yaş): "65+" + Fiil Ehliyeti + Sağlık Kurulu uyarısı ✅
- 1940 (86 yaş): **Kritik** rozet ✅
- Tüm kutular açık: 5 uyarı birlikte (Vesayet + Miras + Muvazaa + İpotek) ✅
- 1995 + tüm kutular kapalı: "özel risk uyarısı yok" yeşil banner ✅

**İleri sprint:** `RiskWarningPanel` `CreateAuction.tsx`/`SubmissionForm.tsx` içine entegre edilecek (gerçek ilan formunda satıcı durumu kontrolü).

---

## 🔹 BLOK 4 — Şablon Kütüphanesi (commit `380ba8d`)

**`src/lib/legal/templates.ts`** — 7 şablon × 7 kategori:

| # | Şablon | Kategori | Mevzuat | Badge |
|---|--------|----------|---------|-------|
| 1 | İhale Katılım Sözleşmesi | İhale | TBK 274+ | Popüler |
| 2 | Gayrimenkul Satış Vaadi | Satış Vaadi | TBK 29, TMK 1009 | — |
| 3 | Kaparo / Ön Protokol | Kaparo | TBK 178 | — |
| 4 | Mirasçı Muvafakatname | Muvafakat | TMK 599, 676 | — |
| 5 | Vekaletname Kontrol Listesi (10 adım) | Vekalet | TBK 504 | — |
| 6 | Bağışlama Bilgi Notu | Bağış | TBK 288-295, VİV 7338 | — |
| 7 | Fiil Ehliyeti / Sağlık Raporu Notu | Sağlık Raporu | TMK 13-16 | Yeni |

**`src/pages/legal/LegalTemplatesPage.tsx`** (`/yasal/sablonlar`):
- KATMAN 1 EĞİTİCİ: "Şablon kütüphanesi nedir, avukat onayı şart"
- KATMAN 2 LİSTE: 7 kart × kategori chip + arama + filter
- KATMAN 3 ÖNİZLE: kapsamlı görünüm
  - Meta (kategori, süre, mevzuat)
  - Gerekli ek belgeler kartı (amber)
  - Şablon gövdesi monospace bordo (terminal görünüm)
  - **".txt indir"** butonu (client-side Blob)
  - "Avukat eşleştir (iletişim)" CTA
- KATMAN 4: avukat eşleştirme CTA + LegalDisclaimer

---

## 🔹 BLOK 5 — İLERİDE (yapılmadı — Master kararı bekliyor)

Bu blok kasıtlı yapılmadı; SABAH RAPORU'na not edildi:

### 5a) **Anlaşmalı Avukat Ağı**
- Kullanıcı hukuki çözücü/şablon kullanırken doğrudan baroya kayıtlı bir avukata yönlendirme
- Avukat profil + uzmanlık + ücret + iletişim sayfası
- Komisyon modeli (referral fee — Avukatlık Kanunu uyumlu olmak ŞART)
- Master kararı: bu modüle geçecek miyiz?

### 5b) **Gerçek Belge Doğrulama (KYC + tapu API)**
- T.C. Kimlik kartı doğrulama (NVI servisi)
- Tapu kayıt sorgu (TKGM resmi API — başvuru gerek)
- Vekaletname doğrulama (Noter Birliği e-belge)
- E-imza entegrasyon (5070 sayılı kanun)
- Master kararı: API anlaşmaları + maliyet onayı

**ÖNEMLİ:** Bu iki blok yasal olarak hassas — Avukatlık Kanunu (1136 m. 35-36 reklam yasağı + danışmanlık) ve KVKK + KYC mevzuatına tam uyum gerekir. Master + avukat danışmanlığı sonrası planlanacak.

---

## 🔹 BLOK 6 — Final Tam Tarama (bu rapor)

### 📈 Sonuçlar

**PHASE 1 — Desktop Scan (1280×900):**
```
✅ PASS: 143 / 143 routes
❌ FAIL: 0
```

**PHASE 2 — Mobile Scan (iPhone SE 320px viewport):**
```
✅ PASS: 143 / 143 routes
❌ FAIL: 0 horizontal overflow
```

**PHASE 3 — Hukuk Akış Smoke (7 sayfa):**
| Sayfa | Status | İçerik kontrol |
|-------|--------|----------------|
| `/yasal` | 200 | ✅ Yasal Metinler + Mevzuat Haritası |
| `/mesafeli-satis-sozlesmesi` | 200 | ✅ Cayma Hakkı + TKHK |
| `/aydinlatma-metni` | 200 | ✅ KVKK + Veri Sorumlusu |
| `/iade-iptal` | 200 | ✅ 14 Gün + Cayma |
| `/arastirma/hukuki-cozucu` | 200 | ✅ Senaryo + Parayı Ebeveyn + Tenkis |
| `/yasal/risk-uyarilari` | 200 | ✅ Risk Uyarı + Fiil Ehliyeti |
| `/yasal/sablonlar` | 200 | ✅ Şablon + Vekaletname |

JSON: `_audit/hukuk-blok6/_desktop-scan.json` + `_mobile-scan.json` + `_hukuk-flow.json`

---

## 🔒 Anayasa Kanıtı

- ✅ **Build green** her blok sonu
- ✅ **143/143 rota** desktop + mobile
- ✅ **7/7 hukuk akış** sealed maskeleme + 4 katman + disclaimer
- ✅ **Sealed maskeleme** `listing_offers_safe` dokunulmadı
- ✅ **Core RLS / register / auth / placeBidRpc** dokunulmadı
- ✅ **Migration yok** (tüm hukuki içerik frontend; ileride scenario_templates Supabase tablo Master onayı bekliyor)
- ✅ **Cursor lane** bozulmadı (stash/pop protokolü)
- ✅ **CLS=0** koridoru korundu (tüm yeni paneller statik kart)
- ✅ **YASAK uyuldu** (Prisma/Redis/Node backend/microservice yok)

---

## 🌐 Master — Canlı Doğrulama (8 adım)

1. **Hard refresh:** `Ctrl + Shift + R`
2. **/yasal:** 12 yasal metin kartı + arama + 6 kategori filter + Mevzuat Haritası
3. **/mesafeli-satis-sozlesmesi:** 12 madde tam sözleşme + 8 güvence rozeti + LegalDisclaimer
4. **/arastirma/hukuki-cozucu:** "Parayı Ebeveyn → Tapu Çocuk" seç → risk skoru 70+, muvazaa/tenkis/bağış + 5 adım güvenli yol + Yargıtay içtihat
5. **/yasal/risk-uyarilari:** doğum yılı 1940 (kritik) + tüm kutular açık → 5 uyarı birden
6. **/yasal/sablonlar:** "İhale Katılım" önizle → tam metin görünür → ".txt indir" → dosya indi
7. **Footer (her sayfa):** "Yasal Hub (tümü)" Scale ikon en üstte; tıklayınca `/yasal`
8. **LegalDisclaimer** ve **LegalDraftBanner** her hukuki sayfada görünür ("Avukatlık 1136 m. 35")

---

## 🚨 Master Yapılacaklar

### 🔴 KRİTİK — Avukat Onayı (yayın öncesi şart)
1. **Tüm hukuki metin/şablon/senaryo bir AVUKAT tarafından gözden geçirilmeli** — şu an taslak.
2. Özellikle:
   - 10 senaryo çözücü (vergi oranı + mevzuat madde no doğrulama)
   - 7 şablon gövde (taraf adı placeholder + cezai şart tutarları)
   - Mesafeli Satış Sözleşmesi (12 madde)
   - Risk uyarıları (çekist + mevzuat referansları)

### 📌 İleride (BLOK 5 — Master kararı bekliyor)
3. **Anlaşmalı Avukat Ağı:**
   - Baroya kayıtlı avukat profil kataloğu
   - Komisyon/referral modeli (Avukatlık Kanunu uyumlu)
   - Avukat eşleştirme + iletişim
4. **Gerçek Belge Doğrulama API:**
   - NVI T.C. doğrulama (devlet servisi)
   - TKGM tapu sorgu API (başvuru + onay)
   - Noter Birliği e-belge entegrasyonu
   - 5070 e-imza modülü

### 🎯 Diğer Hızlı İyileştirmeler
5. **`RiskWarningPanel` `CreateAuction.tsx` içine entegrasyon** — gerçek ilan formunda satıcı yaş/durum kontrolü.
6. **`scenario_templates` Supabase tablo** — şu an `src/lib/legal/scenarioEngine.ts` statik; ileride versiyonlanabilir tablo + audit.
7. **PDF üretim**: şablonlar şu an .txt; jspdf ile Roboto TR PDF üretimi (zaten altyapı var).
8. **/iletisim'de hukuk@ihaleal.com** ayrı seçenek eklemek (form select dropdown).

---

## 🏷️ Tag Zinciri

```
safe-before-hukuk-altyapi (start)
   ↓
safe-before-hukuk-blok2 (BLOK 1 sonrası)
safe-before-hukuk-blok3 (BLOK 2 sonrası)
safe-before-hukuk-blok4 (BLOK 3 sonrası)
safe-before-hukuk-blok6 (BLOK 4 sonrası)
   ↓
HEAD (BLOK 6 = bu commit)
```

**Rollback:** `git reset --hard safe-before-hukuk-altyapi` (en başa) veya herhangi ara tag.

---

## 📂 Audit Ayak İzi

```
_audit/
├── HUKUK_ALTYAPI_RAPORU.md       ← bu dosya
├── FIYAT_SISTEMI_RAPORU.md
├── EK_FAZ_BITTI.md
├── SABAH_RAPORU.md
├── hukuk-blok1/                  ← yasal hub + mesafeli + aydinlatma + iade
├── hukuk-blok2/                  ← çözücü 3 senaryo
├── hukuk-blok3/                  ← risk uyarı 4 senaryo
├── hukuk-blok4/                  ← şablon liste + önizle + filter
└── hukuk-blok6/                  ← Final 143 rota desktop + mobile + 7 hukuk akış JSON
```

---

## 📊 Toplam Üretim (Bu Komut)

- **5 atomik commit** (her biri push edildi — Vercel canlı)
- **9 yeni dosya:**
  - `src/components/legal/LegalDisclaimer.tsx` (ortak disclaimer 3 component)
  - `src/components/legal/RiskWarningPanel.tsx` (drop-in panel)
  - `src/lib/legal/scenarioEngine.ts` (530 satır 10 senaryo motoru)
  - `src/lib/legal/riskWarnings.ts` (5 detector)
  - `src/lib/legal/templates.ts` (7 şablon)
  - `src/pages/legal/LegalHubPage.tsx` (`/yasal`)
  - `src/pages/legal/LegalScenarioPage.tsx` (`/arastirma/hukuki-cozucu`)
  - `src/pages/legal/RiskWarningDemoPage.tsx` (`/yasal/risk-uyarilari`)
  - `src/pages/legal/LegalTemplatesPage.tsx` (`/yasal/sablonlar`)
- **3 sayfa derinleştirme:** MesafeliSatisSozlesmesi (33→280), AydinlatmaMetni (30→200), IadeIptal (24→180)
- **2 dosya modify:** App.tsx (8 yeni route), Footer.tsx (Yasal Hub link)
- **143 → 143 rota:** 8 yeni route eklendi (`/yasal` + 7 alt sayfa/alias)

---

— Hukuki altyapı bitti, 4 fonksiyonel blok + 1 not + 1 final = 5 push, **143/143 yeşil** + **7/7 hukuk akış**.

**Master:** ⚠️ **AVUKAT ONAYI** olmadan canlı yayına alma. Şablon/senaryo/uyarı metinleri TASLAKTIR. ☕⚖️
