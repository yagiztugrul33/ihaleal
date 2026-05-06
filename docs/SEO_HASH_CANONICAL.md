# SEO: HashRouter, canonical ve OG

## Tek cümle politika (ürün seçimi: **hibrit**)

**HashRouter demo (hibrit): kanonik her zaman kök URL; og:url ve twitter:url ilgili rotanın tam hash adresidir.**

Kod: `SEO_CANONICAL_POLICY_TR` (`src/lib/seo.ts`). URL üretimi: `getCanonicalHref()` ve `getShareUrlForPath()` (`src/data/siteOrigin.ts`) — `applySeoToDocument` içinde ikisi de buradan.

## Kısa vade (demo) — detay

- `<link rel="canonical">` her zaman kök: `CANONICAL_ROOT_HREF` (`https://ihaleal.com/`).
- `og:url` ve `twitter:url` rotaya göre tam hash URL (`…/#/rota?sorgu`).
- İlk GET: `index.html` içi Vite `transformIndexHtml` + `src/data/homeSeo.ts` / `siteOrigin`; ikinci faz için ayrı `index` üretim scripti gerekmez (Vite yeterli).
- JS çalıştırmayan istemciler kabuğu görür; JS’li önizleyiciler route sonrası güncellenmiş OG görür — Hash SPA için bilinen trade-off.

## Orta vade (ürün kararı)

Önemli landing’ler için statik HTML, prerender veya path tabanlı yayın; hash dışı URL ile canonical ve OG tek gerçeklikte hizalanır.
