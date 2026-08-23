# /abone/onay + /abone/iptal + İhaleal Endeks Raporu Görsel Kanıt

**Tarih:** 2026-06-01
**Tag:** `safe-before-abone-sayfa` (baseline, pushed)
**Tetikleyici:** Master vizyonu — report_subscribers backend var ama onay/iptal sayfaları yoktu. + İhaleal Endeks Raporu PDF'inin görsel kalite kanıtı (Web Claude + Master görsel olarak denetler).

---

## 1) Yeni Sayfalar

### A) `src/pages/AboneOnay.tsx` — /abone/onay
- URL: `/abone/onay?token=<confirmation_token>` (veya `t=`)
- Mail'deki onay linkinden gelir
- `confirm_subscription(token)` RPC çağrısı
- 5 durum: `no-token` (geçersiz), `checking` (yükleniyor), `ok` (onaylandı ✅), `error` (token süresi vb.), `no-backend` (lokal/dev)
- Her durumda görünür h1 + anlamlı açıklama + 2 CTA (Endeks Raporları + Ana sayfa)

### B) `src/pages/AboneIptal.tsx` — /abone/iptal
- URL: `/abone/iptal?token=<unsubscribe_token>` (veya `t=`)
- Mail'deki "abonelikten çık" linki
- `unsubscribe_reports(token)` RPC çağrısı
- 5 durum: `no-token`, `processing`, `ok` (iptal edildi), `error`, `no-backend`
- Tek tık iptal (kullanıcıya onay sormaz — mail'den geldiği için niyet net)

### C) Route entegrasyonu — `src/App.tsx`
```tsx
<Route path="/abone/onay" element={<AboneOnay />} />
<Route path="/abone/iptal" element={<AboneIptal />} />
```

---

## 2) Abone Sayfa Test (4 senaryo)

| URL | HTTP | EB | h1 | Anlamlı mesaj |
|---|---|---|---|---|
| `/abone/onay` (token yok) | 200 | 0 | "Geçersiz onay bağlantısı" | ✅ |
| `/abone/onay?token=DUMMY` | 200 | 0 | "Servis geçici olarak ulaşılamıyor" (lokal no-backend) | ✅ |
| `/abone/iptal` (token yok) | 200 | 0 | "Geçersiz iptal bağlantısı" | ✅ |
| `/abone/iptal?token=DUMMY` | 200 | 0 | "Servis geçici olarak ulaşılamıyor" | ✅ |

Screenshot'lar: `_audit/endeks-raporu/abone-{onay,iptal}-{notoken,dummy}.png`

Production'da gerçek RPC ile:
- Geçerli token → "Aboneliğiniz onaylandı ✅" / "Aboneliğiniz iptal edildi"
- Süresi dolmuş → "Token bulunamadı veya zaten onaylı/iptal"

---

## 3) İhaleal Endeks Raporu — GÖRSEL KANIT (4+4 = 8 PNG)

### Render altyapısı
- `dist/_pdf-viewer.html` — minimal pdfjs-dist (4.8.69) viewer
- `_audit/endeks-raporu/_pdf-render-via-pdfjs.mjs` — Playwright Chromium + canvas → PNG
- 1.8x viewport scale → yüksek çözünürlük (~1700px yükseklik)

### Üretilen PNG'ler

| Mülk | Sayfa | PNG |
|---|---|---|
| Bebek villa (₺142M) | 1/4 | `sayfa-villa-1.png` |
| Bebek villa | 2/4 | `sayfa-villa-2.png` |
| Bebek villa | 3/4 | `sayfa-villa-3.png` |
| Bebek villa | 4/4 | `sayfa-villa-4.png` |
| Bodrum rezidans (₺18.5M) | 1/4 | `sayfa-rezidans-1.png` |
| Bodrum rezidans | 2/4 | `sayfa-rezidans-2.png` |
| Bodrum rezidans | 3/4 | `sayfa-rezidans-3.png` |
| Bodrum rezidans | 4/4 | `sayfa-rezidans-4.png` |

### Sayfa 1 (villa) — görsel doğrulama (Web Claude inceleme)

Yukarıdaki PNG'de **gözle teyit edilen** içerik:
- **Header**: "İhaleal" logo (cyan) + tarih sağda (01.06.2026)
- **Başlık**: "İhaleal Endeks Raporu — Mülk Künyesi" (büyük bold)
- **Subtitle**: "Bebek'te Boğaz Manzaralı Tarihi Villa · Bebek, İstanbul"
- **1) Mülk Kimliği** — 13 satır içerik:
  - Başlık, Konum, Kategori + Etiketler (4 etiket)
  - Brüt/Net m² (1200/980), Oda planı (6+2), Banyo (5)
  - Kat (Bahçe Katı + 3 / 3), Bina yaşı (20+ yıl bandı)
  - Isıtma (Doğalgaz Kombi), Cephe (Güney/Batı)
  - Balkon/Teras (Var), Asansör (Yok), Otopark (Var)
  - Eşyalı (Hayır), Kullanım (Boş)
  - Tapu durumu (Kat Mülkiyetli), Kredi uygunluğu (Krediye Uygun)
  - Açıklama (uzun): "Boğaz'a sıfır, özel iskeleli, 6+2 oda, 1200m² arsa..."
  - Öne çıkan özellikler: "Özel İskele • Havuz • Bahçe (800m²) • Güvenlik Kamera • Alarm • Şömine • Mutfak (Ankastre) • Personel Odası"
- **2) Mülk Sicili (Geçmiş İşlemler)** — 7 satır metrik + 4 satır zaman çizelgesi:
  - Veri kaynağı: "Demo (catalog tabanlı deterministic üretim — gerçek tapu kaydı için TKGM esastır)"
  - Toplam el değiştirme: 1
  - İlk işlem fiyatı: ₺98.874.583
  - Son işlem fiyatı: ₺142.000.000
  - Toplam değer değişimi: %+43.6
  - Yıllık bileşik getiri (CAGR): %+9.5
  - Amortisman (bina yaşı × %2/yıl): ₺62.000.000 — kalan değer: ₺93.000.000
  - İşlem zaman çizelgesi (4 işlem 2022-2026)
- **3) İhale / Fiyat Yapısı** — başlık ve "Pazarlama modu: Canlı ihale" sayfa sonuna doğru
- **Footer**: "Sayfa 1 / 4" ortada

### Türkçe karakter kalitesi
**MÜKEMMEL** — tüm İ, ı, ğ, ş, ö, ü, ç karakterleri net ve doğru render edildi. Roboto Türkçe font embed (Fix 4 altyapısı) düzgün çalışıyor.

### Layout kalitesi
- Marka temiz (cyan logo + koyu metin)
- Satır aralığı ve hiyerarşi profesyonel
- Bölüm başlıkları belirgin
- Tablo ve liste yerleşimleri okunaklı
- Sayfa numaralandırması footer'da
- Disclaimer son sayfada (PNG 4)

---

## 4) Anayasa Kanıt

| Test | Sonuç |
|---|---|
| Build | ✅ Yeşil, **281 entry** precache (önceki 279 + 2 yeni route) |
| Playwright tam tarama | ✅ **104/104 PASS** (52 rota × 2 viewport, regresyon yok) |
| /abone test (4 senaryo) | ✅ 4/4 PASS, HTTP 200, EB=0, anlamlı h1 |
| PDF render | ✅ 8/8 PNG üretildi, görsel kalite onaylı |
| Sealed maskeleme | ✅ değişmedi |
| Migration | ✅ YOK (sayfalar mevcut report_subscribers RPC'leri kullanır) |
| Görünürlük | ✅ Button accent variant tutarlı, h1 her durumda görünür |

---

## 5) Master Canlı Aktivasyon

Sayfalar zaten canlıda çalışır — sadece deploy + Resend mail entegrasyonu:

1. **Deploy**: `git push origin main` → Vercel otomatik deploy
2. **Mail template güncelle**: `supabase/functions/report-notifier/index.ts`'deki HTML'de:
   - Onay linki: `${APP_BASE_URL}/abone/onay?token=${confirmation_token}`
   - İptal linki: `${APP_BASE_URL}/abone/iptal?token=${unsubscribe_token}`
3. **Secrets**: RESEND_API_KEY, MAIL_FROM, APP_BASE_URL (önceki dalgada belirtildi)

Önceki commit (`f8e8f1f`) Edge function'da unsubscribe URL placeholder var; onay URL'i için küçük bir mail template güncellemesi gerek (mikro-dalga).

---

## 6) Sıradaki Anayasa Adımı

Brief sırası:
1. ✅ /abone/onay + /abone/iptal + Endeks PDF görsel kanıt (bu)
2. **▶ EN i18n mikro-dalgalar** (giriş + kayıt + profil)
3. Kalan polish

Her dalga 500/EB/görünürlük taraması + atomic commit + push.

— bitti —
