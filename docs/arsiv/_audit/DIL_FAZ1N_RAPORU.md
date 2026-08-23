# 🌐 ADIM 21 — Çok Dil FAZ 1-N: GES + Dashboard Çevirisi

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dil-faz1n`
**Doktrin:** DAR + derin. GES modülü tam + Dashboard ANA görünüm. `runGesLandEvaluation` motor + dashboard RPC/state DOKUNULMADI. ADIM 8/12/13/14 ortak terimleri AYNI.

---

## ⚡ TEK-CÜMLELİK ÖZET

GES modülü (`GesEvaluationForm`, 305 satır — 3 adımlı form) **tam çevrildi** + Dashboard ana panel (`dashboard/index.tsx`, 217 satır) **tam çevrildi**; toplam **~60 arayüz öğesi** 4 dilde (GES: 35 form/durum/sonuç + Dashboard: 24 menü/kart/CTA); **`runGesLandEvaluation` motor + dashboard veri/flow RPC mantığı SIFIR değişiklik**; **Currency (₺+≈$ ADIM 8 CAPEX) korundu**; `GesFormMessages` (40 alan) + `DashboardMessages` (23 alan) yeni tipler; **4 dil × 4 string = 16/16 PASS, 0 console hata, AR dir=rtl**.

---

## 1) BLOK 1 — Envanter + KAPSAM KARARI

### KAPSAM KARARI: GES + Dashboard ANA BÖLÜNDÜ
| Bileşen | Satır | String | Bu adımda? |
|---|---|---|---|
| `GesEvaluationForm.tsx` | 305 | ~35 | ✅ TAM |
| `dashboard/index.tsx` (FlowDashboard) | 217 | ~24 | ✅ TAM |
| `dashboard/InvestorDashboard.tsx` | 275 | ~40 | ❌ **SONRAKİ ADIM** (11-N-2) |
| `Profile.tsx` | 326 | ~45 | ❌ **SONRAKİ ADIM** (11-N-3) |

**Karar gerekçesi:** GES (35) + Dashboard ana (24) = ~59 string yönetilebilir tek adımda kaliteli çeviri. InvestorDashboard (40) + Profile (45) = 85 string ek → toplam 144 olurdu → **özensiz toplu çeviri riski**. Bölündü. InvestorDashboard + Profile sonraki adım (11-N devamı) + rapora yazıldı.

### ✅ Çevrilen — GES (35 öğe)
- 3 adım göstergesi: "Adım {n}"
- Step 1: başlık + 6 form label (İl/İlçe/Mahalle/Ada+Parsel/Toplam alan/Güneşlenme) + 2 placeholder + Devam butonu
- Step 2: başlık + Ön skor + 3 form label (Trafo mesafesi/kapasitesi/Eğim) + Bakı/Tarım sınıfı label + 5 checkbox + Geri/Hesaplanıyor/Tamamla + Tekrar dene + error
- Step 3: status (5 durum) + 5 sonuç KPI (Skor/Kapasite/Yıllık/CAPEX/Geri ödeme) + varsayılan fiyat notu + Yeni değerlendirme

### ✅ Çevrilen — Dashboard ana (24 öğe)
- Geri + H1 "Hesap paneli" + subtitle + "Akışları değiştir"
- 7 kart (İlanlarım/İhale aç/Tekliflerim/Favoriler/Kayıtlı aramalar/Yetki belgeleri/Profil) — her biri başlık + (varsa body) + CTA
- Portföy yönlendirme notu + CTA

### ❌ Çevrilmedi — Veri/Hesap (DOKUNULMADI)
| Öğe | Sebep |
|---|---|
| `runGesLandEvaluation` motor (preview + submit) | GES hesap motoru (ADIM 8) |
| GES sonuç sayıları (skor/kapasite/CAPEX ₺) | Hesaplanmış değer |
| ASPECTS dropdown (SOUTH/NORTH/EAST...) | Enum kodu (kısaltma — teknik) |
| AGRI dropdown (MARGINAL/NORMAL/MUTLAK/UNKNOWN) | Enum kodu (teknik) |
| Form default değerler (Konya/Karapinar) | Veri |
| FLOW_LABELS[f].title (akış rozet) | userFlows.ts data (ayrı sistem) |
| Dashboard flow/session RPC mantığı | Veri çekme |

**NOT — ASPECTS/AGRI dropdown:** GES bakı (SOUTH/NORTH) + tarım sınıfı (MARGINAL/MUTLAK) `<option>` text'i enum kodu olarak gösteriliyor (kısaltma — teknik standart). Çevrilmesi gerekirse ayrı dilim ([REVIEW] — teknik jeoloji/tarım terimi, native uzman). Bu adımda enum kodu korundu.

---

## 2) BLOK 2 — Sözlük

### ADIM 8/13'ten ortak (AYNI çeviri)
- "CAPEX" → CAPEX (uluslararası, ADIM 8)
- "Favoriler" → Favorites/Избранное/المفضلة (ADIM 13)
- "İl/İlçe" → City/District/Город/Район - المدينة/المنطقة (ADIM 19 ValuationForm)

### Bu adımda eklenen 30+ yeni terim

| Türkçe | İngilizce | Rusça | Arapça |
|---|---|---|---|
| GES / Konum ve arazi | Location and land | Местоположение и участок | الموقع والأرض |
| Mahalle | Neighborhood | Квартал | الحي |
| Ada / Parsel | Block / Parcel | Квартал / Участок | البلوك / القطعة |
| Güneşlenme (kWh/m²) | Solar irradiance | Солнечное излучение | الإشعاع الشمسي |
| Şebeke ve mevzuat | Grid and regulations | Сеть и регулирование | الشبكة واللوائح |
| Trafo mesafesi/kapasitesi | Substation distance/capacity | Расстояние/мощность подстанции | بُعد/سعة المحطة الفرعية |
| Eğim (derece) | Slope (degrees) | Уклон (градусы) | الانحدار (درجة) |
| Marjinal tarım / GEPA | Marginal agriculture / GEPA | Маргинальное с/х / GEPA | زراعة هامشية / GEPA |
| SİT alanı çakışması | Protected area (SIT) conflict | Конфликт с охраняемой зоной | تعارض مع منطقة محمية |
| Askeri yasak bölge | Military restricted zone | Военная запретная зона | منطقة عسكرية محظورة |
| Arkeolojik sit | Archaeological site | Археологический памятник | موقع أثري |
| Geri ödeme (süresi) | Payback | Окупаемость | فترة الاسترداد |
| Yüksek fizibilite | High feasibility | Высокая осуществимость | جدوى عالية |
| Hesap paneli | Account panel | Панель аккаунта | لوحة الحساب |
| İlanlarım | My listings | Мои объявления | إعلاناتي |
| Tekliflerim / teminat | My bids / deposit | Мои ставки / залог | عروضي / الضمان |
| Kayıtlı aramalar | Saved searches | Сохранённые запросы | عمليات البحث المحفوظة |
| Yetki belgeleri | Authority documents | Документы полномочий | وثائق التفويض |
| Satıcı merkezi | Seller center | Центр продавца | مركز البائع |
| Akışları değiştir | Change flows | Изменить потоки | تغيير المسارات |

### [REVIEW]
- ASPECTS/AGRI enum dropdown'ları (SOUTH/MARGINAL) — teknik jeoloji/tarım, enum kodu korundu (native uzman gerekirse ayrı dilim)
- Geri kalan **hiçbir [REVIEW] gerekmedi** (standart enerji/panel terminolojisi).

---

## 3) BLOK 3 — Uygulama

### 3.1 `messages.ts`
```ts
export type GesFormMessages = { ... 40 alan ... };       // step1/2/3 + status + sonuç
export type DashboardMessages = { ... 23 alan ... };     // back/title/7 kart/portföy
// Messages.gesForm + Messages.dashboard + EN/TR/RU/AR
```

### 3.2 `GesEvaluationForm.tsx`
- `useLocale + g = t.gesForm`
- `statusLabel(status, g)` — fonksiyon imzası g param aldı (5 durum + default → `g.statusGathering`)
- 35 hardcoded TR → `g.*`
- Form sayısal input'lara `dir="ltr"` (5 yer: alan/güneşlenme/trafo×2/eğim)
- ArrowLeft/Right `rtl:rotate-180`
- `runGesLandEvaluation` + `submitGesProject` çağrıları SIFIR

### 3.3 `dashboard/index.tsx`
- `useLocale + d = t.dashboard`
- 24 hardcoded TR → `d.*`
- ArrowLeft `rtl:rotate-180`
- Flow/session RPC mantığı SIFIR (readSession/readUserFlowsFromStorage/mergedFlowPermissions)

### 3.4 Çekirdek DOKUNULMADI
- `runGesLandEvaluation` (ges-land/feasibilityEngine) → SIFIR
- `submitGesProject` → SIFIR
- Dashboard `readUserFlowsFromStorage` + `mergedFlowPermissions` → SIFIR
- FxRef CAPEX gösterimi (ADIM 8) → korundu

---

## 4) BLOK 4 — RTL + BiDi (AR)

### Doğrulama
- ✅ `<html dir="rtl">` set
- ✅ GES 3 adım göstergesi + form grid AR'da sağdan akar
- ✅ GES sayısal input'lar `dir="ltr"` (alan m²/güneşlenme/trafo/eğim)
- ✅ GES sonuç KPI (Skor/Kapasite/CAPEX) `dir="ltr"`
- ✅ Dashboard 7 kart grid (sm:grid-cols-2) AR'da sağdan sola
- ✅ ArrowLeft/Right `rtl:rotate-180`
- ✅ Noto Sans Arabic font
- ✅ CAPEX FxRef referansı korundu (₺+≈$)
- ✅ Checkbox label'lar (Asansör/Marjinal tarım vd.) RTL'de doğru

### Logical CSS
- GES form input `dir="ltr"` (5 sayısal)
- ArrowLeft/Right `rtl:rotate-180` (GES step nav + Dashboard geri)

---

## 5) BLOK 5 — Test (4 dil × 4 string)

```json
{
  "tr": {http_ges: 200, http_dash: 200, lang: "tr", dir: "ltr",
         ges_step1: ✅ Konum ve arazi, ges_continue: ✅ Devam,
         dash_title: ✅ Hesap paneli, dash_fav: ✅ Favoriler, errs: []},
  "en": {... Location and land + Continue + Account panel + Favorites ...},
  "ru": {... Местоположение и участок + Продолжить + Панель аккаунта + Избранное ...},
  "ar": {dir: "rtl", الموقع والأرض + متابعة + لوحة الحساب + المفضلة}
}
```

### Test matrisi — 16/16 PASS

| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html lang>` | tr | en | ru | ar |
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| GES Step1 (Konum ve arazi) | ✅ | ✅ Location and land | ✅ Местоположение и участок | ✅ الموقع والأرض |
| GES Devam butonu | ✅ | ✅ Continue | ✅ Продолжить | ✅ متابعة |
| Dashboard başlık (Hesap paneli) | ✅ | ✅ Account panel | ✅ Панель аккаунта | ✅ لوحة الحساب |
| Dashboard Favoriler | ✅ | ✅ Favorites | ✅ Избранное | ✅ المفضلة |
| Console hatası | 0 | 0 | 0 | 0 |

### Motor korundu (KANIT)
- GES: aynı form input (Konya/150000m²/1780kWh) → 4 dilde aynı `runGesLandEvaluation` sonucu (skor/kapasite/CAPEX)
- Dashboard: flow permission (auction_seller/bidder) → 4 dilde aynı kart görünürlüğü (mergedFlowPermissions değişmedi)

### Screenshots
```
_audit/dil-faz1n/
├── _test.mjs
├── ges-{tr,en,ru,ar}.png
└── dashboard-{tr,en,ru,ar}.png   (8 total)
```

### Build + Lint
- PWA v1.3.0 — precache 299 entries (6555.79 KiB) ✅ +9.76 KiB
- 3 dosya 0 error / 0 warning

---

## 6) Dokunulan dosyalar

```
src/i18n/messages.ts                       (+260 / 0)
  - GesFormMessages (40 alan) + DashboardMessages (23 alan)
  - Messages.gesForm + Messages.dashboard
  - EN + TR + RU + AR full

src/components/ges/GesEvaluationForm.tsx   (+40 / -38)
  - useLocale + g
  - statusLabel(status, g) imza
  - 35 hardcoded TR → g.*
  - dir="ltr" 5 sayısal input + rtl:rotate-180 ok

src/pages/dashboard/index.tsx              (+25 / -24)
  - useLocale + d
  - 24 hardcoded TR → d.*
  - ArrowLeft rtl:rotate-180

_audit/DIL_FAZ1N_RAPORU.md                 (+ YENİ)
_audit/dil-faz1n/_test.mjs                 (+ YENİ test)
_audit/dil-faz1n/*.png                     (+ 8 screenshot)
```

**Çekirdek + motor dokunulmadı (git diff sıfır):**
```
src/lib/ges-land/feasibilityEngine.ts      ZERO (runGesLandEvaluation)
src/lib/ges-land/* (submitGesProject)      ZERO
src/lib/userFlows.ts                       ZERO (FLOW_LABELS, mergedFlowPermissions)
dashboard readSession/readUserFlowsFromStorage  ZERO
placeBidRpc, fees.ts, sealed view, auth, payments  ZERO
CurrencyContext + FxRef + useCurrency (ADIM 8 CAPEX)  ZERO
LocaleContext (ADIM 10), ADIM 11-20 namespaces  ZERO
supabase/, tailwind.config                 ZERO
```

---

## 7) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6555.79 KiB)
```
✅ **YEŞİL** (+9.76 KiB)

### Git
- `safe-before-dil-faz1n` (ea45f74)
- `safe-after-dil-faz1n` (bu commit)

### Regresyon — KANIT
- TR: GES form + Dashboard etiketleri korundu
- EN: yeni eklenen tam EN
- ADIM 11-20 namespaces → bozulmadı
- `runGesLandEvaluation` motor → değişmedi
- FxRef CAPEX (₺+≈$) → korundu

### Dürüstlük
- ✅ GES "varsayılan fiyat" notu 4 dilde (ADIM 8 ile tutarlı)
- ✅ GES "yaklaşık getiri" abartısız
- ✅ Dashboard "demo; backend yok" subtitle 4 dilde net
- ✅ Status etiketleri (Yüksek fizibilite/Teknik red) doğru anlam

---

## 8) GÜNCEL SÖZLÜK (ADIM 11-21) — ~295 terim

- ADIM 11-20 = 265
- **ADIM 21 (GES + Dashboard 30 terim)** = +30
- **Toplam ~295 terim**, sözlük zinciri 4 dilde tutarlı

---

## 9) Sonraki FAZ 1 Adımları

| # | İş | Saat |
|---|---|---|
| **11-N-2** | InvestorDashboard (275 satır, ~40 string) — bölündü | 1-2 |
| **11-N-3** | Profile.tsx (326 satır, ~45 string) — bölündü | 1-2 |
| **11-G** | İlan detay derinleştirme (AI Insight + SellerTrustCard) | 2-3 |
| **11-O** | Emlakçı panel + Müteahhit panel | 2-3 |
| **11-P** | Küçük dilimler (ValuationTool sayfa + DataAnalysis dropdown + GES enum) | 1-2 |

### FAZ 2 (RTL CSS 359) + FAZ 3 (yasal+avukat) korunur.

---

## 10) Master için 3 KARAR

1. **Sonraki:** 11-N-2/3 (Dashboard kalan: InvestorDashboard + Profile, tutarlılık için) mı, 11-G (ilan derinleştirme) mi, 11-O (emlakçı+müteahhit panel) mi?
2. **GES enum dropdown:** ASPECTS (SOUTH/NORTH) + AGRI (MARGINAL/MUTLAK) enum kodu olarak gösteriliyor — çevrilsin mi (teknik jeoloji/tarım terimi, native uzman) yoksa enum kodu kalsın mı (uluslararası teknik standart)?
3. **InvestorDashboard + Profile:** Bu adımda bölündü — bir sonraki adımda hemen tamamlanması mı yoksa başka konuya (ilan/panel) geçiş mi?

---

— **GES modülü (3 adım form, 35 öğe) + Dashboard ana panel (24 öğe) 4 dilde · runGesLandEvaluation + dashboard flow RPC SIFIR diff · Currency korundu · KAPSAM BÖLÜNDÜ (InvestorDashboard + Profile sonraki) · 16/16 PASS · 0 console hata · AR dir=rtl + sayı LTR · 295 terim sözlük (ADIM 11-21).**
🌐✅
