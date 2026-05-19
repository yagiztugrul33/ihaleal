# Acil Eylem Planı — ihaleal.com (19 Mayıs 2026)

**Dal:** `fix/premium-cinematic-uctan-uca`  
**Amaç:** P1 locale, route audit hub boşluğu, kanıt zinciri, logo koruma, commit-ready paket.  
**Kural:** Logo dosyalarına dokunma (`Logo.tsx`, `Logo.test.tsx`, `public/logo*`).

---

## Tek blok komut (Cursor / PowerShell — kopyala-yapıştır)

```powershell
cd C:\Users\yagiz\Documents\GitHub\ihaleal
# K001–K120 sırası — acil-eylem-proof.mjs sonunda özet JSON üretir
npm run verify
npm run build
npm run preview -- --port 4190
$env:PLAYWRIGHT_BASE_URL="http://localhost:4190"
npx playwright test tests/smoke/how-it-works.spec.ts tests/smoke/home-navbar-ges.spec.ts
npm run test:run -- src/components/Logo.test.tsx src/pages/NasilCalisir.test.tsx
node scripts/verify-how-it-works-links.mjs
node scripts/route-audit.mjs --base http://localhost:4190
node scripts/acil-eylem-proof.mjs --base http://localhost:4190
```

---

## K001–K020 — Ortam ve git hijyeni

| Komut | Açıklama |
|-------|----------|
| K001 | `cd C:\Users\yagiz\Documents\GitHub\ihaleal` |
| K002 | `git branch --show-current` → `fix/premium-cinematic-uctan-uca` |
| K003 | `git log -1 --oneline` → son commit kaydı |
| K004 | `git status --short` → working tree |
| K005 | Çöp dosya sil: `UsersyagizDocumentsGitHubihalealscreenshots*` |
| K006 | `.gitignore` → `.claude/` ekle |
| K007 | `git diff --stat HEAD` → kaynak diff özeti |
| K008 | Logo dosyaları var mı: `src/components/Logo.tsx` |
| K009 | Logo test var mı: `src/components/Logo.test.tsx` |
| K010 | `public/videos/ihaleal-tanitim.mp4` byte kontrolü |
| K011 | `scripts/_patch-home-utf8.mjs` yok (geçici silindi) |
| K012 | `Home.tsx` → yalnızca `PremiumCinematicHome` |
| K013 | `HomeTarget.tsx` repoda yok / kullanılmıyor |
| K014 | P1 locale dosyaları: `src/hooks/useEnsureLocale.ts` |
| K015 | `NasilCalisir.tsx` → `useEnsureLocale("tr")` |
| K016 | `NasilCalisirJourneyPage.tsx` → `useEnsureLocale("tr")` |
| K017 | `NasilCalisirStepPage.tsx` → `useEnsureLocale("tr")` |
| K018 | `route-audit.mjs` → `EXTRA_PATHS` içinde `/how-it-works` |
| K019 | `scripts/acil-eylem-proof.mjs` kanıt scripti |
| K020 | `_audit/ACIL_EYLEM_PLANI_KOMUT.md` (bu dosya) |

## K021–K040 — Encoding ve typecheck

| Komut | Açıklama |
|-------|----------|
| K021 | `npm run precheck:encoding` |
| K022 | `npm run typecheck` |
| K023 | Logo.test.tsx UTF-8 BOM yok |
| K024 | HeroLiveAuctionCard.tsx UTF-8 |
| K025 | nasilCalisirContent.ts UTF-8 |
| K026 | PremiumCinematicHome.tsx UTF-8 |
| K027 | `tsc --noEmit` exit 0 |
| K028 | strict mod uyumu (any eklenmedi) |
| K029 | `src/constants/routes.ts` HOW_IT_WORKS = `/how-it-works` |
| K030 | App.tsx slug redirect `/ilanlar/turizm` |
| K031 | App.tsx slug redirect `/ilanlar/ges` |
| K032 | Legacy `/nasil-calisir` → `/how-it-works` |
| K033 | 4 adım rotaları `/how-it-works/adim/*` |
| K034 | 5 yolculuk `/how-it-works/yol/*` |
| K035 | seo.ts how-it-works meta kayıtları |
| K036 | taxonomy konaklama label → Turizm |
| K037 | taxonomy altyapi label → GES |
| K038 | IlanDetailTabs GES sekmesi |
| K039 | PremiumCinematicHome kategori Turizm/GES |
| K040 | intro video hero'da yok (`.premium-hero__video`) |

## K041–K060 — Unit testler

| Komut | Açıklama |
|-------|----------|
| K041 | `npm run test:run` (tüm suite) |
| K042 | `npm run test:run -- src/components/Logo.test.tsx` |
| K043 | Logo badge testId görünür |
| K044 | Logo wordmark `ihaleal` |
| K045 | Logo dot-com `.com` |
| K046 | Logo icon variant wordmark gizler |
| K047 | `npm run test:run -- src/pages/NasilCalisir.test.tsx` |
| K048 | Hub 4 detaylı rehber linki |
| K049 | Journey alici 4 adım |
| K050 | Step kesfet ihale listesi linki |
| K051 | Locale storage en → journey tr zorlar |
| K052 | `npm run test:run -- src/components/Navbar.test.tsx` |
| K053 | Mobil 4 giriş portalı |
| K054 | Mobil 4 kayıt portalı |
| K055 | `npm run test:run -- src/pages/Home.test.tsx` |
| K056 | Hero intro video null |
| K057 | Vitest 162+ passed |
| K058 | 2 skipped bilinçli |
| K059 | test:run exit 0 |
| K060 | coverage opsiyonel (verify:ci) |

## K061–K080 — Build ve preview

| Komut | Açıklama |
|-------|----------|
| K061 | `npm run build` |
| K062 | build exit 0 |
| K063 | dist/index-*.js ana chunk ≤ 300 kB hedef |
| K064 | useEnsureLocale chunk ayrılmış |
| K065 | NasilCalisir lazy chunk |
| K066 | `npm run preview -- --port 4190` |
| K067 | preview HTTP 200 `/` |
| K068 | preview HTTP 200 `/how-it-works` |
| K069 | preview HTTP 200 `/how-it-works/yol/alici` |
| K070 | preview video HEAD 200 `/videos/ihaleal-tanitim.mp4` |
| K071 | HashRouter `#/` ana sayfa |
| K072 | DepremTransparencyBand render |
| K073 | LiveEarthquakeTicker render |
| K074 | EmergencyActionBand Layout'ta |
| K075 | PlatformModulesShowcase embedded |
| K076 | HeroLiveAuctionCard hero'da |
| K077 | Navbar Logo `<Logo size="sm" />` |
| K078 | Mobil nav `data-testid="nav-mobile-menu"` |
| K079 | Cookie consent dismiss test helper |
| K080 | Preview = son build (build sonrası preview) |

## K081–K100 — Playwright smoke

| Komut | Açıklama |
|-------|----------|
| K081 | `$env:PLAYWRIGHT_BASE_URL="http://localhost:4190"` |
| K082 | `tests/smoke/how-it-works.spec.ts` |
| K083 | Hub video asset HEAD 200 |
| K084 | Hub heading Nasıl çalışır |
| K085 | Promo video play click |
| K086 | 4 step detail sayfaları |
| K087 | 5 journey detail sayfaları |
| K088 | Legacy nasil-calisir redirect |
| K089 | Journey TR navbar locale en→tr |
| K090 | Home step link kesfet |
| K091 | `tests/smoke/home-navbar-ges.spec.ts` |
| K092 | Navbar GES desktop mega menü |
| K093 | Navbar GES mobile |
| K094 | Hero görünür + search |
| K095 | Mobil login/signup portalları |
| K096 | Hero intro video yok |
| K097 | Kategori turizm/ges slug |
| K098 | Smoke toplam 21/21 |
| K099 | Playwright exit 0 |
| K100 | Screenshot `how-it-works-journey-alici-tr-navbar.png` |

## K101–K120 — Link proof, route audit, commit

| Komut | Açıklama |
|-------|----------|
| K101 | `node scripts/verify-how-it-works-links.mjs` |
| K102 | 55/55 internal link OK |
| K103 | `reports/how-it-works-proof.json` güncel |
| K104 | `node scripts/route-audit.mjs --base http://localhost:4190` |
| K105 | audit total ≥ 167 (hub eklendi) |
| K106 | audit failed = 0 |
| K107 | audit http404 = [] |
| K108 | audit `/how-it-works` path kayıtlı |
| K109 | consoleErrorTotal = 0 |
| K110 | mobileOverflowCount = 0 |
| K111 | `node scripts/acil-eylem-proof.mjs --base http://localhost:4190` |
| K112 | `reports/acil-eylem-proof.json` allGreen true |
| K113 | Commit 1: locale + route-audit fix + tests |
| K114 | Commit 2: wave3-final-audit.json + acil plan |
| K115 | Commit dışı: 300+ audit PNG (bilinçli) |
| K116 | Commit dışı: `_audit/komut2` PNG drift |
| K117 | Push yapılmadı (kullanıcı istemedikçe) |
| K118 | Logo commit'e dahil edilmedi (değişiklik yok) |
| K119 | `npm run verify` commit sonrası tekrar |
| K120 | Kanıt tablosu kullanıcıya raporla |

---

## Beklenen yeşil çıktılar

| Metrik | Hedef |
|--------|--------|
| verify | EXIT 0 |
| Vitest | 162+ passed |
| Smoke | 21/21 |
| Link proof | 55/55 |
| Route audit | 167/167, 0 failed |
| Hub path | `/how-it-works` audit'te |
| Logo test | 2/2 |
| acil-eylem-proof | allGreen: true |

---

## Bilinçli commit dışı

- `screenshots/audit/wave3-final/*` (332 PNG — ayrı PR veya LFS)
- `_audit/komut2/*.png` (araştırma preview drift)
- `.claude/` (yerel IDE)

---

*Oluşturulma: 2026-05-19 — otomatik acil eylem paketi*
