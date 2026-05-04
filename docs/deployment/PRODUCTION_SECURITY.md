# Uretim guvenligi (hosting / TLS haric)

Statik on uc + Supabase. Domain ve sertifika panelde kalir.

## Uygulananlar

- Vite preview/dev: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP.
- public/hash-redirect.js: HashRouter inline olmadan.
- public/_headers: Netlify CSP + basliklar.
- vercel.json: Vercel basliklari.
- Supabase istemci: 28s fetch timeout.
- ErrorPage: productionda ham Error.message yok.

## CSP genisletme

Yeni API ekleyince _headers ve vercel.json CSP guncellenmeli.

## Supabase

RLS migrations; ai_qa uretimde JWT + rate limit. Service role sadece sunucu.

## Manuel

HSTS, WAF, yedek cron.

npm run verify