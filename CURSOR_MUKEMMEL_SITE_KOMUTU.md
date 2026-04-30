# Cursor — ihaleal.com mükemmel site komutu (yol haritası)

Tek komut özeti ve repo bağlantıları için bkz. **`docs/CURSOR_SINGLE_COMMAND.md`**. Önizleme adresi (erişilemeyebilir): https://73ne2wvm6u3no.kimi.show

---

## Dört aşama özeti

| Aşama | İçerik | Adet |
|-------|--------|------|
| 1 | Hata düzeltmeler & iyileştirmeler | 6 |
| 2 | Yeni sayfalar (Mesajlar, Belgeler, Ayarlar, Giriş, Kayıt, Şifre sıfırlama) | 6 |
| 3 | Gelişmiş özellikler (Dark mode, Harita, SEO landing, Sanal tur, Kredi, Affiliate, Dashboard, …) | 8 |
| 4 | Performans & SEO (Meta, JSON-LD, Sitemap, Lazy loading, Erişilebilirlik) | 5 |

**Toplam:** 25 geliştirme maddesi (checklist aşağıda).

---

## 25 madde — kontrol listesi

### Aşama 1 — Hata düzeltmeleri & iyileştirmeler (6)

| # | Madde | Durum |
|---|--------|--------|
| 1.1 | Router’da eksik bileşen importları (`AuctionListPage`, `NotFound`) — üretim derlemesi güvenilirliği | [x] |
| 1.2 | Toast olayı ile uyumlu bildirim payload’ı (`message` / `type`) | [x] şifre sıfırlama düzeltmesi |
| 1.3 | Navbar / Footer ile tutarlı kurumsal URL’ler (`/iletisim` ana sayfa scroll yerine opsiyonel) | [x] |
| 1.4 | Mobil menüde yeni rotalarla eşleşen bağlantılar | [x] |
| 1.5 | Demo banner ve güvenlik iddiası çizgisi (mevcut `DemoBanner`, hukuki sayfalar) | [~] sürekli gözden geçirme |
| 1.6 | Erişilebilirlik: `skip-to-content`, odak sırası, form etiketleri | [~] iyileştirme devam |

### Aşama 2 — Yeni sayfalar (6)

| # | Madde | Rota / konum |
|---|--------|----------------|
| 2.1 | Mesajlar | `#/mesajlar` → `src/pages/Messages.tsx` |
| 2.2 | Belgeler | `#/belgeler` → `src/pages/Documents.tsx` |
| 2.3 | Ayarlar | `#/ayarlar` → `src/pages/Settings.tsx` |
| 2.4 | Giriş | `#/giris` → `src/pages/auth/Login.tsx` |
| 2.5 | Kayıt | `#/kayit` → `src/pages/auth/Register.tsx` |
| 2.6 | Şifre sıfırlama | `#/sifre-yenile` → `src/pages/auth/PasswordReset.tsx` |

### Aşama 3 — Gelişmiş özellikler (8)

| # | Madde | Durum / not |
|---|--------|----------------|
| 3.1 | Dark mode toggle | Navbar (`useTheme`) |
| 3.2 | Harita | `#/harita`, `#/ihaleler` içi Leaflet |
| 3.3 | SEO şehir landing | `src/data/seoLandings.ts`, `#/istanbul-ihaleleri` vb. |
| 3.4 | Sanal tur (Matterport vb.) | [ ] üretim entegrasyonu yok; changelog / rakip tablosunda referans |
| 3.5 | Kredi / Mortgage | `#/mortgage` |
| 3.6 | Affiliate / B2B emlakçı | `#/emlakci-ortaklik` |
| 3.7 | Dashboard | `#/dashboard`, `#/dashboard/yatirimci` |
| 3.8 | Panel & mesaj / belge özetleri | `#/panel` |

### Aşama 4 — Performans & SEO (5)

| # | Madde | Durum / not |
|---|--------|----------------|
| 4.1 | Meta başlık / açıklama (`RouteSeo`, `lib/seo.ts`) | [x] |
| 4.2 | JSON-LD (şehir landing vb.) | [x] kısmi |
| 4.3 | Sitemap | [ ] SPA / Hash için üretim pipeline’ında tanımla |
| 4.4 | Lazy loading (`React.lazy` + route bazlı) | [x] `App.tsx` |
| 4.5 | Erişilebilirlik (WCAG hedefi) | [~] sürekli |

---

## Temel altyapı (proje içinde tamamlanan başlıklar)

- [x] **Analiz ve bilgilendirme belgeleri** — `#/raporlar`, `#/rapor/:id` (`src/pages/Reports.tsx`, `ReportDetail.tsx`, `src/data/reportsDemo.ts`)
- [x] **Kurumsal sayfalar** — `#/hakkimizda`, `#/iletisim` (gizlilik: `#/gizlilik`, KVKK: `#/kvkk`)
- [x] **Navbar** — Raporlar + İletişim rotası; üst menü güncel
- [x] **Bu komut dosyası** — `CURSOR_MUKEMMEL_SITE_KOMUTU.md` (repo kökü)
- [x] **Build & deploy** — `npm run build`, `npm run verify`; dağıtım ortamına göre CI/CD

---

## Tek satırlık Cursor prompt (kopyala)

```
ihaleal.com reposunu aç: React + TypeScript + Tailwind + shadcn/ui, HashRouter.
Yıllık üyelik + komisyon mahsup + B2B emlakçı çizgisine uy; demo veride sahte güvenlik veya yasak paket vaadi kullanma.
CURSOR_MUKEMMEL_SITE_KOMUTU.md ve docs/CURSOR_SINGLE_COMMAND.md ile 25 maddelik yol haritasına göre eksik [ ] kalemleri tamamla.
```

---

## İlgili dosyalar

| Konu | Dosya |
|------|--------|
| Rotalar | `src/App.tsx` |
| SEO | `src/lib/seo.ts`, `src/components/SeoSync.tsx`, `src/data/seoLandings.ts` |
| Ücret modeli | `src/lib/fees.ts` |
| Mimari | `docs/ARCHITECTURE.md` (varsa) |
