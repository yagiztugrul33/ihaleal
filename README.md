# ihaleal.com

**İhaleal** — gayrimenkul ilanı, ihale ve kurumsal intelligence platformu (Vite + React + TypeScript).

| | |
|---|---|
| **Canlı** | https://ihaleal.vercel.app |
| **Repo** | https://github.com/yagiztugrul33/ihaleal |
| **Neredeydik?** | [NEREDEYDIK.md](NEREDEYDIK.md) — yarın döndüğünde buradan başla |
| **Canlı audit** | [_audit/final/01_canli.md](_audit/final/01_canli.md) |

## Hızlı başlangıç

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck
npm run build
npm run test         # unit
npm run test:smoke   # Playwright (yerel veya AUDIT_BASE)
```

`.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` ve diğer `VITE_*` değişkenleri.

## Modüller

| Modül | Route örnekleri |
|-------|-----------------|
| Pazaryeri | `/`, `/ilanlar`, `/ihaleler`, `/harita`, `/degerleme` |
| Kurumsal | `/kurumsal`, `/kurumsal/iletisim`, `/kurumsal/dashboard` |
| Intelligence | `/arastirma`, `/arastirma/ges`, `/arastirma/parsel`, `/arastirma/war-room` |
| Kat karşılığı | `/kat-karsiligi`, `/kat-karsiligi/studio` |

`/arastirma/yatirim` → `/arastirma` hub’a yönlendirir.

## Deploy (Vercel)

1. `npm run build` → `dist/`
2. Prebuilt deploy (lockfile sorunlarında güvenilir): bkz. [docs/DEPLOYMENT_FINAL.md](docs/DEPLOYMENT_FINAL.md)
3. SPA: `vercel.json` `rewrites` — BrowserRouter, hash (`/#/`) gerekmez

**Environment:** Supabase URL + anon key (Production).

## Mimari ve hukuk

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/hukuk/](docs/hukuk/) — sözleşme çerçevesi; örnek referans PDF yerel `docs/hukuk/kaynak/`

## Canlı sayfa testi

```bash
node scripts/final-live-audit.mjs
# AUDIT_BASE=https://ihaleal.vercel.app (varsayılan)
```

Çıktı: `_audit/final/01_canli.md`

## Sonraki adımlar

Öncelik listesi ve pilot notları → **[NEREDEYDIK.md](NEREDEYDIK.md)**

---

*Vite şablon notları aşağıda tutuldu (geliştirici referansı).*

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

See [Vite documentation](https://vite.dev/) for build configuration.
