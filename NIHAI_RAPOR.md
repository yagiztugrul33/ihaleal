# Nihai Build Fix Raporu

## Kok nedenler (9 ardisik FAIL)

1. **NODE_ENV=production** → npm ci devDependencies kurmuyor (vite/tsc yok)
2. **deploy-vercel.yml UTF-16 bozuk** + push trigger → workflow fail
3. **supabase-v2-deploy.yml** → SUPABASE_ACCESS_TOKEN yok, her push fail
4. **@rollup/rollup-linux-x64-gnu** → Windows lockfile, Linux CI'da eksik
5. **vite-plugin-pwa workbox** → GHA runner'da ~27sn sonra build fail

## Cozumler (commit 80cb3e6+)

- ci.yml: NODE_ENV=development, npm ci --include=dev, adim adim
- vercel.json: npm ci --include=dev, npm run build
- workflows: deploy/supabase sadece workflow_dispatch
- scripts/vite-build-safe.mjs: rollup linux + explicit vite bin
- vite.config: GHA'da PWA kapali, Vercel'de PWA acik

## Yerel kanit

GITHUB_ACTIONS=true simulate → build OK (28s, PWA yok)
