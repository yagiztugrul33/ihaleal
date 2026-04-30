# Cursor’a tek komut (ihaleal.com)

25 maddelik fazlı yol haritası ve checklist: **`CURSOR_MUKEMMEL_SITE_KOMUTU.md`** (repo kökü).

Önizleme adresi (**erişilemez veya zaman aşımı olabilir** — gerektiğinde ekran görüntüsü veya deploy çıktısı ekleyin):

**https://73ne2wvm6u3no.kimi.show**

## Kopyala-yapıştır prompt

```
Projeyi https://73ne2wvm6u3no.kimi.show adresinden incele, React + TypeScript + Tailwind + shadcn/ui stack'ini kullanarak ihaleal.com gayrimenkul açık artırma platformunu geliştir. Yıllık üyelik (Satıcı 5.000 TL / Alıcı 1.000 TL) + Komisyon Mahsup + Emlakçı B2B Ortaklığı iş modelini uygula.
```

## Repo içi doğruluk

| Konu | Konum |
|------|--------|
| Üyelik & komisyon | `src/lib/fees.ts` (`MEMBERSHIP_FEES`, `calcCommissionBreakdown`) |
| HashRouter rotalar | `src/App.tsx` |
| SSS (40 soru / 5 kategori) | `src/data/mega/faq.ts`, `#/sss` |
| Komisyon hesaplayıcı | `#/komisyon-hesaplayici` → `src/pages/mega/CommissionCalculator.tsx` |
| Mimari | `docs/ARCHITECTURE.md` |

## Tamamlanan başlıklar (genel durum)

- [x] Proje yapısı (Vite + React + TS + Tailwind; shadcn/ui bileşenleri `src/components/ui/`)
- [x] Demo veriler / içerik (`src/data/`, `src/data/mega/`)
- [x] Layout, Navbar, Footer (`src/components/`)
- [x] Ana sayfa (Hero, Auctions, Features vb. — `src/pages/Home.tsx`, `src/sections/`)
- [x] İhale listesi (`Auctions` bölümü / arama sayfaları — gerçek rota yapısına göre)
- [x] İhale detay (`#/ilan/:id`, `#/ihale/:id`)
- [x] SSS `#/sss`
- [x] Komisyon hesaplayıcı
- [x] Emlakçı ortaklığı `#/emlakci-ortaklik`
- [x] Blog `#/blog`, `#/blog/:slug`
- [x] Build (`npm run verify`) — deploy ortamınıza göre Vercel / CI

**Not:** Kökte `init-webapp.sh` yoksa yerelde `npm install && npm run dev` kullanın.

## Sonraki adımlar (isteğe bağlı)

- Üretim Supabase migrasyonları ve `.env.local`
- Ödeme / ÖHS entegrasyonu (arka plan)
- Kimi önizlemedeki ekstra bileşenler — önce adresin çözülmesini veya statik export ile karşılaştırmayı deneyin
