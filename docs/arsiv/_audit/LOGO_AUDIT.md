# Logo Asset Audit — R12 Kapanış Sonrası

> **⚠️ GÜNCEL DEĞİL (2026-05-30):** Bu dosya tarihsel kayıt. **UI canlı asset: `/logo.svg`** (mavi-teal gradient + ev silhouette, vektör 0.7 KB, [`2fa878a`](https://github.com/yagiztugrul33/ihaleal/commit/2fa878a) ile finalleşti). `ihaleal-logo.png` (305 KB) ve `ihaleal_com_logo.png` (116 KB) artık UI'da KULLANILMIYOR — `Logo.tsx:27` `src="/logo.svg"`. Master tekrar "eski logo" derse: tarayıcı cache temizliği (Edge Ctrl+Shift+R, iPhone tab kapat-aç) gerekli. Bu dosyadaki "UI canlı" iddiası eski HEAD'e ait, güncel canli bundle `index-*.js` `/logo.svg` baked teyit edildi.

---

**Tarih:** 2026-05-30 (R12 FINAL refresh)
**Referans HEAD:** `6331110`
**Tetikleyici:** Master WhatsApp — "eski logo görünüyor" (DEV-FIZIBILITE N1)

---

## 1. `public/` logo / marka envanteri

| Dosya | Format | Boyut | Son FS değişim | Git (son commit) |
|---|---|---:|---|---|
| `public/ihaleal-logo.png` | PNG | **305.3 KB** | 2026-05-18 | `90370cb` 2026-05-17 — "Replace navbar logo with processed gold emblem from logom.png" |
| `public/ihaleal_com_logo.png` | PNG | **116.1 KB** | 2026-05-29 | `cd72036` 2026-05-29 — R12.5 Homepage swap |
| `public/logo.svg` | SVG | 0.7 KB | 2026-05-03 | `b86c2f2` 2026-04-28 — initial commit |
| `public/favicon.svg` | SVG | 0.7 KB | 2026-05-03 | `debb382` 2026-05-01 |
| `public/favicon.png` | PNG | 0.3 KB | 2026-05-07 | — |
| `public/logo/logo-mark-512.png` | PNG | 12.1 KB | 2026-05-07 | `64af102` 2026-04-28 |
| `public/icon-192.png` | PNG | 2.3 KB | 2026-05-07 | — |
| `public/icon-512.png` | PNG | 12.1 KB | 2026-05-07 | — |
| `public/icon-maskable-192.png` | PNG | 2.0 KB | 2026-05-16 | — |
| `public/icon-maskable-512.png` | PNG | 11.2 KB | 2026-05-16 | — |
| `public/email/email-header-600.png` | PNG | 6.1 KB | 2026-05-07 | — |
| `public/social/share-card-1200.png` | PNG | 38.6 KB | 2026-05-07 | — |
| `public/og-image.png` | PNG | 21.4 KB | 2026-05-07 | — |

**Not:** `BrandLockup.tsx` ayrı dosya değil — `src/components/Logo.tsx` içinde export.

---

## 2. Kod referansları

### `Logo.tsx` / `BrandLockup` (main + backup aynı)

```tsx
src="/ihaleal-logo.png"
```

- Navbar, auth, footer vb. tüm UI **`/ihaleal-logo.png`** (305 KB, Mayıs 17) kullanıyor.
- **`/ihaleal_com_logo.png` (116 KB, Mayıs 29) hiçbir bileşende referans edilmiyor.**

### SEO / PWA (Logo.tsx dışı)

| Kaynak | Asset |
|---|---|
| `index.html` favicon | `/favicon.svg` |
| `index.html` JSON-LD `logo` | `https://ihaleal.com/logo.svg` (0.7 KB placeholder) |

**Çelişki:** UI büyük PNG; schema.org küçük SVG — marka tutarsızlığı riski.

---

## 3. main vs backup/blok1-borsa

| Asset | main blob | backup blob | Aynı? |
|---|---|---|---|
| `ihaleal-logo.png` | `0d524e49…` | `0d524e49…` | ✅ birebir |
| `ihaleal_com_logo.png` | `77dbfdc8…` | `77dbfdc8…` | ✅ birebir |
| `logo.svg` | `6403543a…` | `6403543a…` | ✅ birebir |

**Backup diff (logo ile ilgili kod):**

- `src/components/Logo.tsx` — fark var (R12.5 img-tabanlı sürüm main'de)
- `src/components/Logo.test.tsx` — backup'ta ek test
- `reports/logo-slogan-*.png` — tasarım referans görselleri (prod asset değil)

**Sonuç:** Backup'ta **daha yeni bir navbar PNG yok**; backup da `ihaleal-logo.png` kullanıyor. R12.5'te eklenen `ihaleal_com_logo.png` backup'ta da **kullanılmıyor**.

---

## 4. Kök neden analizi

| Hipotez | Kanıt |
|---|---|
| Logo.tsx eksik mi? | ❌ R12.5'te geldi, `<img>` doğru render ediyor |
| Yanlış path mi? | ❌ `/ihaleal-logo.png` dosyası mevcut (305 KB) |
| **Asset içeriği eski mi?** | ✅ **Evet** — UI hâlâ Mayıs 17 `ihaleal-logo.png` kullanıyor; daha yeni `ihaleal_com_logo.png` repoda ama bağlı değil |
| CDN/cache mi? | Olası ikincil faktör; asıl sorun asset seçimi |

---

## 5. Önerilen aksiyon (master kararı)

| Seçenek | Açıklama | Efor | Risk |
|---|---|---:|---|
| **A) Master yeni logo gönderir** | Marka onaylı PNG/SVG → `public/` + `Logo.tsx` path güncelle + favicon/og senkron | 1–2 saat (asset gelince) | Düşük |
| **B) Mevcut `ihaleal_com_logo.png` wire** | R12.5'te eklenen 116 KB dosyayı `Logo.tsx` `src` olarak kullan; master görsel onayı gerekir | ~15 dk kod | Orta (onaysız marka) |
| **C) Tasarım sprint** | logo.svg + logo-mark-512 + BrandLockup slogan hizalama + dark/light varyant | 4–8 saat | Düşük (kalıcı) |

**Cursor önerisi:** Master'dan **onaylı final PNG/SVG (A)** veya en azından **`ihaleal_com_logo.png` onayı (B)** alınmadan "eski logo" şikâyeti kapanmaz. Backup cherry-pick tek başına çözüm değil.

---

## 6. Doğrulama checklist (fix sonrası)

- [ ] Navbar / Login / Footer aynı asset
- [ ] Retina: `logo-mark-512` veya 2x PNG net
- [ ] `index.html` JSON-LD logo URL = UI ile uyumlu
- [ ] PWA manifest icon set güncel
- [ ] iPhone Safari + Android Chrome smoke
- [ ] Bundle: PNG < 150 KB hedef (mevcut 305 KB ağır)
