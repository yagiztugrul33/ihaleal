# Vercel / GHA Build Fix — Nihai Rapor

## Kok neden (kanitlanan)

1. **vite.config.ts UTF-16LE git'te** — Linux/Vercel `vite build` ~4-32s icinde coker (`\0` / encoding). Yerel Windows calisir, GHA encoding check ve build fail.
2. **NODE_ENV=production + npm ci** — devDependencies (vite, tsc) yuklenmez; build 3-11s "vite not found".
3. **@rollup/rollup-linux-x64-gnu** — Windows lockfile ile Linux CI'da optional native binary eksik.
4. **vite-plugin-pwa / workbox** — CI/Vercel Linux'ta precache adimi flake; PWA static import bile modulu yukler.
5. **ci.yml `tee` pipefail** — Build fail gizlenip bundle-budget fail gosteriyordu.
6. **deploy-vercel / supabase workflow** — UTF-16 YAML veya eksik secret (VERCEL_TOKEN, SUPABASE_ACCESS_TOKEN) → push basina 3 fail.

## Production /arastirma

- Canli bundle: `index-BG8dl6Wm.js` (arastirma=0) — eski deploy.
- Yeni build yerelde `index-BJ19nv3m.js` (arastirma route'lari dahil).
- Vercel yeni commit deploy edemiyor (build fail) → SPA 404 devam.

## Yapilan fixler (main, son: 98db611)

- vite.config.ts UTF-8, async PWA, `skipPwaOnCi` + `DISABLE_PWA`
- vercel.json: `npm ci --include=dev`, rollup guard, `npm run build`
- package.json: postinstall rollup linux, vite-build-safe build
- ci.yml: rollup install, pipefail, build env (8GB, GITHUB_ACTIONS, DISABLE_PWA, VITE secrets)
- deploy/supabase workflow: workflow_dispatch only
- tests/smoke/demo-routes: kurumsal heading matcher

## CI durumu (run #83)

- Typecheck, encoding, validate, unit tests: **OK**
- Build: **FAIL** (~32s) — log satiri GitHub UI'dan okunmali (public API log yok)

## Zorunlu manuel adim (Vercel canli)

1. https://vercel.com → ihaleal → Deployments
2. Son commit (98db611) veya Redeploy
3. **Use existing Build Cache: KAPALI**
4. Build basarili olunca `index.html` hash degisir; `/arastirma` incognito test

## Yerel dogrulama

```powershell
$env:CI="true"; $env:GITHUB_ACTIONS="true"; $env:DISABLE_PWA="1"
npm run verify:ci
npx playwright test tests/smoke/arastirma-routes.spec.ts tests/smoke/demo-routes.spec.ts
```

Tarih: 2026-05-17