# SEO: Yandex

Google için zaten var olan altyapı (sitemap.xml / sitemap-index.xml / sitemap-programmatic.xml,
robots.txt, canonical, OG/Twitter meta, JSON-LD) motor bağımsız — Yandex de bunlardan
otomatik faydalanıyor. Bu doküman Yandex'e özgü olarak eklenenleri ve tamamlanması için
gereken tek seferlik manuel adımı listeler.

## Kod tarafında eklenenler

1. **`public/robots.txt`** — `User-agent: *` bloğuyla birebir aynı kurallar
   `User-agent: Yandex` altında ayrıca tekrarlandı. Yandex Webmaster tanılaması bazen
   joker (`*`) satırını atlayıp motora özel blok arıyor; ikisi de aynı sitemap'lere işaret
   ediyor.
2. **IndexNow protokolü** (`scripts/submit-indexnow.mjs`) — Yandex ve Bing'in desteklediği,
   Google'ın desteklemediği bir push kanalı: sitemap'lerdeki tüm URL'leri
   `https://api.indexnow.org/indexnow`'a POST eder, bu da katılımcı motorlara (Yandex dahil)
   dağıtılır. Google zaten Search Console + kendi crawl hızıyla geliyor; asıl sorun olan
   "Yandex botu tekrar uğrayıp güncel hali görene kadar haftalar geçmesi" bunu ortadan
   kaldırır — bot pasif taramayı beklemek yerine anında haberdar edilir.
   - Doğrulama dosyası: `public/9b15c3989629ed9c227f6cc3521288c5.txt` (IndexNow
     spesifikasyonu anahtarın `https://ihaleal.com/<key>.txt` adresinde barınmasını
     zorunlu kılar).
   - Manuel çalıştırma: `npm run seo:indexnow`.
   - Otomatik: `.github/workflows/deploy-vercel.yml` her production deploy'undan sonra
     bu script'i çalıştırır (`continue-on-error: true` — IndexNow başarısız olsa da
     deploy'u kırmaz).

## Tek seferlik manuel adım (yalnızca hesap sahibi yapabilir)

Kod tarafı otomatik ama Yandex'in siteyi "sahiplenilmiş" olarak görüp indexleme
önceliğini yükseltmesi için **Yandex Webmaster**'da doğrulama şart, bunu Claude/CI
yapamaz (hesap kimlik doğrulaması gerektirir):

1. https://webmaster.yandex.com/ → "Site ekle" → `ihaleal.com`.
2. Doğrulama yöntemi olarak **HTML dosyası** veya **meta etiket**i seç (DNS de olur).
   Meta etiket seçilirse üretilen `<meta name="yandex-verification" content="...">`
   satırını `index.html`'in `<head>`'ine eklet — bana kodu iletirsen tek satırlık
   PR'ı ben açarım.
3. Doğrulandıktan sonra **"Индексирование → Файлы Sitemap"** altında üç sitemap'i
   (`/sitemap.xml`, `/sitemap-index.xml`, `/sitemap-programmatic.xml`) manuel ekle.
4. **"Индексирование → Переобход страниц"** ile `/ilanlar` (veya güncellenmeyen
   spesifik URL) için tek seferlik yeniden tarama talep et — IndexNow devreye girene
   kadar en hızlı çözüm budur.

## Bilinen sınırlama

Site BrowserRouter tabanlı bir SPA (`src/App.tsx`); her rota için `<title>`/canonical/OG
gerçek değerleri yalnızca React yüklendikten sonra `SeoSync` (`src/lib/seo.ts`) ile
JS üzerinden yazılıyor — ilk HTML yalnızca ana sayfa (`/`) için build-time'da doğru
üretiliyor (`vite.config.ts` → `homePageMetaHtmlPlugin`). Yandex botu JS'i Google kadar
güvenilir çalıştırmadığından, diğer rotalarda (`/ilanlar` dahil) botun gördüğü ham HTML
başlık/açıklaması ana sayfayla aynı kalabilir. Kalıcı çözüm önemli rotalar için statik
prerender/SSR'dır (`docs/SEO_HASH_CANONICAL.md` "orta vade" notu) — bu, mevcut SPA
mimarisini değiştiren ayrı ve daha büyük bir iş, bu PR'ın kapsamı dışında tutuldu.
