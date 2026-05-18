# ihaleal - TAM TESHIS RAPORU

Tarih: 2026-05-17 05:52:00
Repo: C:\Users\yagiz\Documents\GitHub\ihaleal
Kural: Sadece okuma. Kod degisikligi yok. Git commit/push YAPILMADI.

---

## 1. Git ve Branch Durumu

Branch: main (up to date with origin/main)

Remote: https://github.com/yagiztugrul33/ihaleal.git

Son commit: b1f73ba fix(deploy): push luxury theme to prod

Modified (8): eslint.config.js, package.json, package-lock.json, src/App.tsx, Layout.tsx, Navbar.tsx, AuctionDetail.tsx, vitest.config.ts

Untracked (kritik): src/pages/intelligence/, src/lib/engineering/, src/lib/data/, src/components/intelligence/, supabase/functions/pvgis_solar/, supabase/migrations/2026051714*.sql, tests/engineering/

origin/main..HEAD: BOS (ahead yok)

KRITIK: Intelligence modulu git'e eklenmemis. HEAD'te /arastirma rotalari YOK.

---

## 2. Proje Yapisi

- React 19 + Vite 6 + TypeScript + Tailwind + Supabase + PWA
- Tek src/ yapisi (apps/web yok)
- 759 dosya, 408 TS/TSX

---

## 3. v2 Foundation

0001-0009.sql (Claude isimlendirme): YOK
20260516120000_v2_* migrations: VAR (commitli)
Edge functions (_shared, place-bid, ai-price-estimate, matching, bulk, kyc): VAR
workers/bulk-listing: VAR
Corporate frontend: VAR
Intelligence: VAR diskte, UNTRACKED

---

## 4. Router

Dosya: src/App.tsx

HEAD (production): /kurumsal* VAR | /arastirma* YOK
Working tree: + /arastirma, /arastirma/war-room, /arastirma/ges, /arastirma/parsel, /arastirma/yatirim

Corporate: route OK | CorporateContact: route OK | OrganizationDashboard: route OK
CorporateBanner: Home import OK | Intelligence: sadece local

---

## 5. Turkce

ASCII kalinti: 9 dosya | Dogru Turkce: 15+ dosya | Canli meta: mojibake

---

## 6. Tasarim

tailwind.config.js VAR | theme.css, tokens.css VAR | luxury tema commitli

---

## 7. Build/Test/Lint

tsc --noEmit: PASS
npm run build: PASS (26.46s)
npm run test:run: PASS (108 passed, 2 skipped)
npm run lint: FAIL (190 errors)

---

## 8. Supabase

config.toml VAR | project-ref link: yok (bu makine)
22 migration lokal (2 untracked 20260517*)
pvgis_solar: untracked
Remote DB: DOGRULANAMADI

---

## 9. Vercel

vercel.json: vite, SPA rewrite, security headers

| URL | HTTP |
|-----|------|
| / | 200 |
| /kurumsal | 200 |
| /kurumsal/iletisim | 200 |
| /kurumsal/dashboard | 200 |
| /ilanlar | 200 |
| /arastirma | 200 (shell) |
| /arastirma/war-room | 200 (shell) |

UYARI: Intelligence route production bundle'da yok -> 404 UI olasiligi

---

## 10. Uc AI Cakismasi

| AI | Durum | Production |
|----|-------|------------|
| Claude (v2, security, corporate) | Commitli | Canli |
| Grok (luxury UI) | Commitli b1f73ba | Canli |
| ChatGPT/Cursor (intelligence) | UNTRACKED | YOK |

---

## 11. Mobil

viewport: VAR | responsive class: 416 satir

---

## 12. KARAR OZETI

1. Canli: auction + kurumsal OK. /arastirma muhtemelen 404.
2. Yarim: intelligence tamami git disinda.
3. Tasarim: auction tarafinda uygulanmis.
4. Turkce: kismen.
5. Router: intelligence sadece local.
6. Supabase tablolar: dogrulanamadi.
7. Mobil: orta-iyi.
8. Murat Bey: auction demo evet; War Room hayir.

---

Rapor: _audit/diagnosis_full.md | 2026-05-17
