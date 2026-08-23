# N43 — Cinematic Premium Redesign Raporu

**Tarih:** 2026-05-30  
**Geri dönüş tag:** `safe-before-redesign` (commit `52ebb2f`)  
**Referans:** Active Theory terminal-AI + koyu cinematic (WebGL yok)

## Commit zinciri

| Adım | Commit | Dosyalar |
|------|--------|----------|
| N43.0 | `20e47c0` | Logo büyütme, `_audit/REDESIGN_ROLLBACK.md` |
| N43.1 | (push) | Terminal hero + typewriter + i18n |
| N43.2 | (push) | Canvas partikül + cinematic CSS |
| N43.3 | (push) | ScrollReveal |
| N43.4 | (push) | Count-up istatistik bar |
| N43.5 | (push) | Home entegrasyon + smoke + geçişler |

## Bundle

| Metrik | Önce (N43.0) | Sonra (N43.5) |
|--------|--------------|---------------|
| Ana chunk (`index-*.js`) | ~352 KB | ~360 KB |
| WebGL / ağır 3D | Yok | Yok |
| Kapı (<800 KB) | ✓ | ✓ |

## Smoke / işlevsellik

- `npm run test:smoke` → **17 passed**, 1 skipped (iBuyer auth mock — önceden de skip)
- Funnel / ilan / borsa rotaları dokunulmadı
- `Register.tsx`, migrations, core RLS **dokunulmadı**

## Dosya özeti (satır referansları)

### N43.1 — Terminal-AI Hero
- `src/hooks/useTypewriter.ts` — yazı makinesi + `prefers-reduced-motion`
- `src/components/cinematic/TerminalHero.tsx` — KİRALIK/SATILIK/İHALE/LANSMAN, AI sor (`invokeSystemQa`), graceful fallback
- `src/i18n/messages.ts` — `home.terminal` EN/TR

### N43.2 — Koyu cinematic + partikül
- `src/components/cinematic/CinematicParticles.tsx` — canvas 40/80 parçacık, mobil azaltım
- `src/styles/premium-cinematic-home.css:1-26` — `#050508` mor gradient tema
- `src/styles/premium-cinematic-home.css:2076-2264` — terminal, partikül, glow orb

### N43.3 — Scroll reveal
- `src/components/cinematic/ScrollReveal.tsx` — IntersectionObserver + opsiyonel parallax
- `src/styles/premium-cinematic-home.css:2266-2279` — reveal animasyon
- `src/sections/PremiumCinematicHome.tsx:389-605` — bölüm sarmalayıcıları

### N43.4 — Animasyonlu istatistik
- `src/hooks/useCountUp.ts` — sayı animasyonu
- `src/components/cinematic/CinematicStatsBar.tsx` — SEO sayfa + çevrimiçi presence
- `src/styles/premium-cinematic-home.css:2281-2326` — stats bar

### N43.5 — Premium geçişler + entegrasyon
- `src/styles/premium-cinematic-home.css:2328-2367` — kart hover glow, `premium-hero-shell`, reduced-motion
- `src/sections/PremiumCinematicHome.tsx:318-331` — hero shell, partikül, terminal, stats
- `tests/smoke/home-navbar-ges.spec.ts` — terminal hero + mobil GES accordion

## Yaratıcı dokunuşlar (Active Theory uyarlama)

1. **Mor/violet sinematik palet** — `#050508` + radial violet/cyan glow (WebGL yerine CSS)
2. **Monospace terminal** — `>` prefix, yanıp sönen imleç, pill-shaped “Her şeyi sorun” input
3. **Glass hero shell** — `backdrop-filter` + violet border glow
4. **Canlı stats şeridi** — 6552+ SEO sayfa count-up + presence pulse “CANLI”
5. **Kademeli scroll reveal** — `delayMs` stagger (80→320 ms) + hafif parallax (desktop)
6. **i18n terminal** — EN “What are you looking for?” / TR “Ne arıyorsunuz?”

## Geri alma

```bash
# Tüm redesign
git reset --hard safe-before-redesign && git push --force-with-lease origin main

# Tek adım
git revert <n43.x-commit-sha>
```
