# Vercel / GHA 9 Fail - Nihai Duzeltme

**Commit:** (push sonrasi)
**Tarih:** 2026-05-17

## Kok Neden (kanitli)

1. **NODE_ENV=production** → `npm ci` devDependencies kurmuyor → `vite`/`tsc` yok → build 1-3 sn'de exit 1
2. **deploy-vercel.yml UTF-16 bozuk** → GHA workflow parse/ calistirma hatasi
3. **supabase-v2-deploy.yml** her push'ta SUPABASE_ACCESS_TOKEN olmadan fail
4. **CI verify:ci** tek blokta 11 sn'de fail (hangi adim belirsizdi)

## Cozum

| Dosya | Degisiklik |
|-------|------------|
| ci.yml | NODE_ENV=development, npm ci --include=dev, adim adim job |
| vercel.json | npm ci --include=dev |
| deploy-vercel.yml | UTF-8, sadece workflow_dispatch |
| supabase-v2-deploy.yml | sadece workflow_dispatch |
| package.json | engines node>=22, rollup linux optionalDependencies |

## Yerel test

npm run build → OK (vite build)

## Sonraki

Push sonrasi sadece **CI** workflow tetiklenmeli (3 degil 1).
GHA'da hangi adim fail ederse artik ad ismi gorunur.
