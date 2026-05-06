# SEO: HashRouter, canonical ve OG

## Kisa vade (demo) — secilen kural

**Kok canonical + hash paylasim URL (og:url / twitter:url)**

- `<link rel="canonical">` her zaman kok: `https://ihaleal.com/` (rotadan bagimsiz; sinyalleri tek URLde toplar).
- `og:url` ve `twitter:url` rotaya gore tam hash URL: `https://ihaleal.com/#/...` (paylasim ve JS calisan onizleyiciler icin).
- Ilk GET `index.html` meta etiketleri Vite `transformIndexHtml` ile `src/data/homeSeo.ts` ile senkron; SPA yuklendiginde `applySeoToDocument` title/description ve hash URLyi gunceller.
- JS calistirmayan bot/sosyal tarayici: kabuktaki ana sayfa metni gorur; calisan istemci rotaya gore OG metnini gunceller — bu ikilik Hash SPA icin bilinen trade-off; orta vadede asagidaki strateji ile azaltilir.

## Orta vade (urun karari)

Onemli landingler icin statik HTML, prerender veya alt alan / path tabanli yayin; hash disi URL ile canonical ve OG tek gerceklikte hizalanir.
