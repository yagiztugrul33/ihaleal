# 🎯 ONBOARDING YENİDEN KURGU — UYGULAMA RAPORU

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-onboarding-yeni`
**Doktrin:** Çekirdek (placeBid/sealed/RLS/fees.ts/auth/payments/CurrencyContext) DOKUNULMADI. CLS=0 korundu. Sadece UI yenilendi.

---

## ⚡ TEK-CÜMLELİK ÖZET

`/onboarding/akis` (FlowSelector) tamamen yeniden yazıldı — eski karmaşa (§D-K3 notları, "Birleşik evrak listesi", DocumentUploader, e-Devlet mock buton, 4 akış checkbox) **TÜMÜYLE TEMİZLENDİ**; yerine **3 net kart** (Keşfet/Sat/Al) gerçek rotalara (`/ihaleler`, `/ihale-ac`, `/auctions`) yönlendiriyor; **Tailwind logical CSS** (`ms-/me-/text-start/rtl:rotate-180`) ile RTL-hazır; lacivert (#0A1F44) + amber 60/30/10 disiplini.

---

## 1) BLOK 1 — ANTI-PATTERN KALDIRMA (kanıtlı)

| Önce (KALKTI) | Sonra |
|---|---|
| *"Backend yok — ürün taslağı (§D-K3)"* not | ❌ KALKMIŞ |
| *"Birleşik evrak listesi"* başlıklı kart | ❌ KALKMIŞ |
| `DocumentUploader` "Örnek evrak yükleme" | ❌ KALKMIŞ |
| e-Devlet yetki (DEMO) — Akış B butonu | ❌ KALKMIŞ |
| 4 akış checkbox (browser_only/listing_only/auction_seller/auction_bidder) | ❌ KALKMIŞ |
| `useUserFlows / mergedRequirements` kullanım | ❌ KALKMIŞ (lib dokunulmadı) |
| *"Kullanıcı akışı seçimi"* başlık | ❌ KALKMIŞ |
| `Kaynak: src/lib/userFlows.ts` teknik referans | ❌ KALKMIŞ |
| `DemoDataCornerBadge` köşe rozeti | ❌ KALKMIŞ |
| `auth/edevis-mock` redirect | ❌ KALKMIŞ |
| "Kaydet ve panele git" zorlama buton | ❌ KALKMIŞ |

**Canlı kanıt (Playwright):**
```json
"has_eski_backend_yok": false,
"has_eski_evrak": false,
"has_eski_edevlet_buton": false,
"has_eski_kullaniciakisi": false,
"has_eski_userFlows_kod": false
```

⚠️ **DİKKAT:** `src/lib/userFlows.ts` ve `src/components/DocumentUploader.tsx` **silinmedi** — Dashboard (`src/pages/dashboard/index.tsx`) hâlâ kullanıyor. Sadece bu sayfa tarafından bırakıldı (dosyalar başka yerde lazım).

---

## 2) BLOK 2 — 3 KART (gerçek rotalar)

### Sade başlık + jargonsuz dil
> *"**Hoş geldin!**"*
> *"Nereden başlamak istersin?"*

### 3 kart (eşit grid, dokunmatik dostu)

| Kart | Subtitle | CTA | Hedef rota |
|---|---|---|---|
| 🔍 **Keşfet** | "İhaleleri, ilanları ve piyasa verisini incele." | İhaleleri gör | `/ihaleler` → `LiveAuctions` (canlı + 2 vitrin) |
| 📋 **Sat / İlan ver** | "Mülkünü ihaleye ya da satışa çıkar." | İlan oluştur | `/ihale-ac` → `CreateAuction` |
| 🏷️ **Al / Teklif ver** | "Açık artırmalara katıl, fırsatları yakala." | Aktif ihaleler | `/auctions` → `AuctionListPage` (tam liste + filtre) |

### Canlı doğrulama (Playwright)
```json
"h2": ["🔍Keşfet", "📋Sat / İlan ver", "🏷️Al / Teklif ver"]

// Keşfet tıkla:
"afterKesfet": {
  "finalUrl": "http://localhost:4173/ihaleler",
  "expectedContains_ihaleler": true   ← ✅ doğru rota
}
```

### Atla + değiştirilebilir notu
- **"Şimdilik geç →"** linki → `/` (ana sayfa) — zorlama yok
- *"Bunu istediğin zaman değiştirebilirsin"* — küçük not

### Onboarding hatırlama
```ts
const STORAGE_KEY = "ihaleal_onboarding_seen";
localStorage.setItem(STORAGE_KEY, "1");   // hem choose() hem skip()'te
```
→ İlk girişte gösterilir; tekrar açılırsa kullanıcı kararı zaten alındı. *(NOT: ana yönlendirici bu key'e bakmıyor şu an; onboarding'i otomatik açan akış yok. Manuel `/onboarding/akis` ziyareti.)*

---

## 3) BLOK 3 — GÖRSEL DİSİPLİN (60/30/10)

| Renk dağılımı | Kullanım |
|---|---|
| **60% nötr** (slate-300/400 metin, slate-700/60 border) | Gövde, alt metin, kart border |
| **30% lacivert** (#0A1F44 inline style, slate-900) | Ana arka plan, başlık, kart bg |
| **10% amber** (amber-300/400) | Sadece hover'da CTA renk, focus ring, vurgu rozeti |

**Sade + ferah + Idealista çizgisi:**
- Hero başlık: `text-3xl md:text-4xl font-bold tracking-tight` (büyük + sade)
- Subtitle: `text-base md:text-lg text-slate-300`
- Kart hover: `hover:border-amber-400/40 hover:bg-slate-900/60` (amber sadece etkileşim)
- Kart focus-visible: `ring-2 ring-amber-400/60` (a11y)
- Min-touch alanı: `p-6` + büyük tıklama hedefi

**Mobil-öncelik:**
- `grid sm:grid-cols-2 lg:grid-cols-3` (320px tek sütun, 640px 2 sütun, 1024px 3 sütun)
- Dokunmatik dostu padding + min-height

**CLS=0:** kartlar sabit yapıda, JS yükleme sonrası layout shift yok.

---

## 4) BLOK 4 — RTL-HAZIR LOGICAL CSS

Bu sayfa **tamamen Tailwind logical** kullanır — gelecekte Arapça/RTL gelirse otomatik hazır.

| Logical kullanım | Yer |
|---|---|
| `text-start` | Kart içerik hizalama (LTR: sol, RTL: sağ) |
| `me-2` | Emoji sonrası boşluk (margin-inline-end) |
| `gap-1.5`, `gap-2`, `gap-4` | Yönsüz (RTL-doğal) |
| `rtl:rotate-180` | ArrowRight + Back ArrowLeft otomatik döner |
| `rtl:group-hover:-translate-x-0.5` | CTA hover hareket yönü ters |

❌ **HİÇ KULLANILMADI** (RTL borç eklenmedi):
- `ml-*`, `mr-*`, `pl-*`, `pr-*`
- `text-left`, `text-right`
- `inset-l-*`, `inset-r-*`

→ **Bu sayfa RTL-temiz.** (359 fiziksel CSS borcuna **EKLEME YAPILMADI**.)

---

## 5) BLOK 5 — MİSAFİR MOD KONTROL (sadece rapor)

### `src/App.tsx` route tarama sonucu

**Login gerek YOK (anonim erişim — keşif açık):**
| Rota | Bileşen | Misafir? |
|---|---|---|
| `/` | Home | ✅ Açık |
| `/arama` | SearchResults | ✅ Açık |
| `/ihaleler` | LiveAuctions | ✅ Açık |
| `/auctions` | AuctionListPage | ✅ Açık |
| `/ilanlar` → `/auctions` | (redirect) | ✅ Açık |
| `/ilan/:id`, `/ihale/:id` | AuctionDetail | ✅ Açık |
| `/borsa`, `/analiz`, `/karsilastir` | — | ✅ Açık |
| `/yasal/*`, `/kvkk`, `/gizlilik`, `/fiyatlandirma`, `/komisyon` | — | ✅ Açık |
| `/sehirler`, `/sehir/:cityName` | — | ✅ Açık |
| `/rehber`, `/sss`, `/hakkimizda`, `/nasil-calisir` | — | ✅ Açık |

**Login gerek (içeride wall):**
| Rota | Bileşen | Wall şekli |
|---|---|---|
| `/ihale-ac` | CreateAuction | İçeride `useAuth` — sayfa render olur ama submit login bekler |
| `/odeme/baslat` | PaymentStartPage | İçeride `useAuth` + `createSubscription` 401 döner |
| `/profil`, `/favoriler`, `/bildirimler` | — | İçeride RLS |

**Login zorunlu (Route guard):**
| Rota | Guard |
|---|---|
| `/muteahhit/panel`, `/muteahhit/onay-bekleniyor`, `/muteahhit/yeni-proje`, `/muteahhit/proje/:projectId` | `<ProtectedRoute>` |
| `/emlakci-giris` | `<LocalAuthGate>` |

→ **Ana akış (keşif/ilan görme/araştırma) MİSAFİR-AÇIK ✅** — kullanıcı login olmadan değer görüyor. Onboarding doktrini ("önce değer gör") zaten uyumlu.

**Engelleme:** Sadece **işlem yapma adımı** (ilan oluştur SUBMIT, ödeme, KYC, müteahhit panel) login bekler — bu **doğru desen** (sürtünme ihtiyaç anına ertelenmiş).

### ⚠️ Bu turda **DEĞİŞTİRİLMEDİ** — Master istediği gibi sadece rapor.

İlerleyen turda:
- `/ihale-ac` misafir görür ama submit login wall → bunu **daha açık** göstermek (üstte info banner: "Yayınlamak için giriş yapmanız gerekir") iyi UX olur. Şimdi sessizce yapıyor.
- `/odeme/baslat` benzer.

→ Ayrı dilim (Master onayı), bu turun konusu değil.

---

## 6) DOKUNULAN DOSYALAR

```
src/pages/onboarding/FlowSelector.tsx     ← TAMAMEN YENİDEN YAZILDI (-103 / +152 ≈ -130 net karmaşa)
```

**Çekirdek (dokunulmadı):**
- ✅ `fees.ts`, `placeBid` RPC, RLS, sealed view, auth, KYC
- ✅ `payments-iyzico`, `subscriptions`, `CurrencyContext`
- ✅ `lib/userFlows.ts` (Dashboard kullanıyor — sadece onboarding referansı kaldı)
- ✅ `components/DocumentUploader.tsx` (başka yerde lazım)

---

## 7) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 298 entries (6445.96 KiB)
```
✅ **YEŞİL**

### Lint
```
$ npx eslint src/pages/onboarding/FlowSelector.tsx
→ 0 hata
```

### Canlı kanıt (Playwright local 4173)
```json
{
  "http": 200,
  "has_hosgeldin": true,
  "has_nereden": true,
  "has_kesfet": true,
  "has_sat": true,
  "has_al": true,
  "has_simdilik_gec": true,
  "has_degistirebilirsin": true,
  "has_eski_backend_yok": false,        ← ESKİ KALKTI ✅
  "has_eski_evrak": false,              ← ESKİ KALKTI ✅
  "has_eski_edevlet_buton": false,      ← ESKİ KALKTI ✅
  "has_eski_kullaniciakisi": false,     ← ESKİ KALKTI ✅
  "h2": ["🔍Keşfet", "📋Sat / İlan ver", "🏷️Al / Teklif ver"],
  "afterKesfet": {
    "finalUrl": "http://localhost:4173/ihaleler",   ← Doğru rota ✅
  },
  "errs": []                            ← 0 console error
}
```

---

## 8) MASTER İÇİN AKSİYON

1. ✅ Bu commit push edildi (sonda) — canlı `https://www.ihaleal.com/onboarding/akis` ~5-15 dk Vercel deploy
2. **Hard refresh** (`Ctrl+Shift+R`) veya `?v=$(date +%s)` ile hemen yeni içerik
3. **Test akışı:**
   - Aç `/onboarding/akis` → 3 kart görür
   - Keşfet → `/ihaleler` (canlı vitrin)
   - Sat → `/ihale-ac` (form — submit login wall)
   - Al → `/auctions` (tam liste filtre)
   - Şimdilik geç → `/`

### Ayrı dilim olarak Master onayı sonra
- **`useAuth` wall'larını daha açık göster:** `/ihale-ac` üstünde "Yayınlamak için giriş yapmalısın" banner (şu an sessiz wall)
- **Onboarding otomatik açılması:** Yeni kullanıcılar ilk girişte `/onboarding/akis`'e yönlendirme (localStorage `ihaleal_onboarding_seen` kontrol)
- Diğer 359 fiziksel CSS → logical dönüşümü (RTL faz altyapısı)
- i18next migration (önceki envanter raporundaki F1 fazı)

---

## 📂 Audit Ayak İzi

```
_audit/
├── ONBOARDING_YENI_RAPORU.md         ← bu rapor
└── onboarding-yeni/
    ├── _test-onb.mjs                  (Playwright doğrulama)
    └── onboarding-yeni.png            (canlı ekran kanıtı)
```

---

— **Onboarding sade · 3 kart gerçek rotaya · §D-K karmaşası KALKTI · RTL-hazır · misafir mod ana akışta açık · çekirdek korundu · push hazır.**
🎯✅
