# ihaleal.com — Durum Tespiti ve "Nerede Kaldık" Raporu

**Rapor tarihi:** 2026-08-23
**Hazırlayan:** Claude Code (otomatik, komutlar gerçekten çalıştırılarak hazırlandı)
**Not:** Bu, aynı tarihli önceki raporun yerini alan, daha derin ve doğrulanmış bir sürümdür (edge function kaynak kodu incelendi, bağımlılık zincirleri izlendi, npm audit JSON'u ayrıştırıldı).

---

## Yönetici Özeti

- **İskelet sağlam:** Typecheck 0 hata, build başarılı, unit testler 207/207 geçiyor, lint'te sadece 3 küçük sorun kaldı.
- **npm audit'teki 23 zafiyetin tamamı devDependency zincirinde** (Capacitor CLI, jsdom, happy-dom, Vite dev sunucusu) — bağımlılık ağacı izlenerek doğrulandı, **hiçbiri production/tarayıcı bundle'ına girmiyor**.
- **Eski dokümantasyon güncel değil:** Kod incelendiğinde PVGIS ve AFAD entegrasyonlarının gerçek dış API'lere bağlı olduğu görüldü (önceki raporlar bunları "mock/heuristic" olarak işaretlemişti) — ama **canlı ortamda gerçekten çalıştıkları bu oturumdan doğrulanamadı** (ağ erişimi engelli, aşağıda açıklanıyor).
- **PayTR ödeme entegrasyonu kod içinde açıkça "skeleton"/`not_implemented` (HTTP 501)** olarak işaretli — bu tek madde, dokümantasyon iddiası değil, doğrudan kaynak koddan doğrulanmış bir eksik.
- **Git geçmişi ile repo içeriği arasında ciddi bir tutarsızlık var** — 51 commit'in tamamı yalnızca 18 saatlik bir pencerede (5-6 Ağustos 2026), ama repodaki tarihli raporlar Nisan-Ağustos 2026 arasına yayılan aylar süren bir çalışmaya işaret ediyor.
- **Bu oturumda dışa açık ağ erişimi (Vercel, Supabase) proxy tarafından engellendi** — Edge Function'lar ve canlı site bu ortamdan test edilemedi; bulgular kaynak kod incelemesine dayanıyor, canlı doğrulama ayrı bir ortamda yapılmalı.

---

## Proje Künyesi

**Ne yapıyor:** Gayrimenkul ilanı/ihale (açık artırma), kurumsal emlak ofisi paneli, yatırım "intelligence" (deprem risk, GES/güneş enerjisi, parsel istihbaratı) ve kat karşılığı modüllerini bir arada sunan bir Vite + React + TypeScript + Supabase platformu.

| Metrik | Değer |
|---|---|
| Kaynak dosyası (`src/`) | 735 |
| Supabase Edge Function | 18 (+ `_shared` ortak kod klasörü) |
| Supabase migration | 57 (+ 4 arşiv migration, `migrations_archive_pre_tur9`) |
| `dependencies` (production) | 66 |
| `devDependencies` | 30 |
| Kök dizin rapor/komut dosyası (`.md/.txt/.bat`) | 61 |
| `_audit/` dosya sayısı / boyutu | 641 dosya / **127 MB** |
| `docs/` dosya sayısı / boyutu | 143 dosya / 1.2 MB |

**Teknoloji yığını:**

| Katman | Teknoloji |
|---|---|
| Frontend | Vite 6, React 19, TypeScript 5.8, Tailwind 3.4, Radix UI, Framer Motion |
| Backend/veri | Supabase (Postgres + Auth + 18 Edge Function, 57 migration) |
| Mobil | Capacitor 8 (Android + iOS native proje klasörleri) |
| Test | Vitest (unit), Playwright (smoke/e2e) |
| Diğer servisler | Sentry, Vercel Analytics, jsPDF/html2canvas, TCMB EVDS, PVGIS (JRC), AFAD API, iyzico/PayTR |
| Deploy | Vercel |

**Script'ler (`package.json`, öne çıkanlar):** `dev`, `build` (özel `vite-build-safe.mjs` sarmalayıcı), `typecheck`, `lint` / `lint:ci` (kısıtlı yol seti), `test` / `test:run` / `test:coverage`, `test:smoke` (Playwright), `test:rls` / `test:rls:live` (RLS politika testleri), `security:audit` (`npm audit --audit-level=high`), `verify` ve `verify:ci` (hepsini zincirleyen tam doğrulama komutları).

**Supabase yapılandırması:** `supabase/config.toml` içinde `project_id = "ihaleal.com"`, yerel API portu 54321, DB portu 54322. Gerçek proje referansı `package.json`'daki `supabase:link` script'inden görülüyor: `wsjifesrdaeorrdzbvmk`. Edge Function'lar: `ai-price-estimate`, `ai_qa`, `borsa_etl`, `bulk-listing-ingest`, `earthquakes_latest`, `kyc-submit`, `matching-fanout`, `nearby-poi`, `payments-iyzico`, `payments-paytr`, `place-bid`, `place_bid` (iki farklı isimlendirme — **kontrol edilmeli**, muhtemelen biri eski/duplicate), `post_chat_message`, `push-notifier`, `pvgis_solar`, `report-notifier`, `tcmb_evds`, `tcmb_yiufe` (bu ikisi de TCMB için — **kontrol edilmeli**, duplicate olabilir).

---

## Sağlık Kontrolü Sonuçları

Tüm kontroller bu oturumda `npm install` (1184 paket, hatasız) sonrası gerçekten çalıştırıldı.

| Kontrol | Komut | Sonuç | Detay |
|---|---|---|---|
| Typecheck | `npm run typecheck` | ✅ **0 hata** | 39.7 saniye |
| Unit testler | `npm run test:run` | ✅ **207 geçti, 2 atlandı** (52 dosyadan 51'i) | 13.5 saniye. Testler sırasında bazı dış API çağrıları (open-meteo, PVGIS/JRC, open-elevation) jsdom ortamında CORS/403 ile engellendi — bunlar test ortamı kısıtı, gerçek hata değil (fetch'ler mock'lanmış senaryolarda zaten bekleniyor) |
| Build | `npm run build` | ✅ Başarılı | 1 dakika 22 saniye. `dist/` üretildi, PWA precache 314 dosya (~6.85 MB). En büyük chunk `vendor-charts` (455 KB) ve ana `index` bundle (454 KB) — izlenmeli |
| Lint | `npm run lint` (`eslint . --max-warnings 0`) | ⚠️ **2 hata + 1 uyarı** | (1) `.claude/skills/version-bump/scripts/generate_changelog.js:8` parse hatası (proje kodu değil, Claude Code skill scripti); (2) `scripts/tasarim-olcum.mjs:82` boş blok; (3) `src/components/SearchModal.tsx:65` `react-hooks/exhaustive-deps` uyarısı |
| `npm audit --audit-level=high` | JSON çıktısı ayrıştırıldı | ⚠️ **23 zafiyet** (1 kritik, 16 yüksek, 4 orta, 2 düşük) | **Tamamı devDependency zincirinde — production'a girmiyor** (aşağıda detaylı) |

### npm audit — dev vs production ayrımı (bağımlılık zinciri izlenerek doğrulandı)

`npm ls <paket> --all` ile her kök zafiyetli paketin nereden geldiği izlendi:

| Kök paket | Zafiyet nereden geliyor | Dev mi Prod mu |
|---|---|---|
| `tar` | `@capacitor/assets → @capacitor/cli` (5.7.8) ve doğrudan `@capacitor/cli` (8.5.0) | **DEV** (build/mobil tooling) |
| `undici` | `jsdom` (test ortamı) | **DEV** (yalnızca test) |
| `vite` | doğrudan `devDependencies` | **DEV** |
| `ws` | `happy-dom` (test ortamı) | **DEV** (yalnızca test) |
| `uuid` | `@capacitor/cli → xcode` | **DEV** (mobil tooling) |

**Sonuç: 23 zafiyetin 23'ü de devDependency kaynaklı — tarayıcıya giden production bundle'ında hiçbiri yok.** `dependencies` (66 paket, production) içinde doğrudan hiçbir zafiyet bulunamadı. Yine de CI/geliştirme makinesi ve mobil build zinciri (`@capacitor/cli`, `supabase` CLI) için risk taşıyor; `npm audit fix` denenmeli (major sürüm sıçratabilir, dikkatli test edilmeli — bu oturumda çalıştırılmadı).

---

## Git Durumu ve Tutarsızlık Notu

- **Aktif branch:** `claude/ihaleal-status-report-t5dtai`; ayrıca `main` ve uzak eşleri mevcut.
- **Çalışma ağacı:** temiz (bu rapor dosyası hariç, commit edilmeye hazır).
- **Toplam commit:** 51 (bu rapor commit'i dahil; öncesi 50).
- **Tarih aralığı:** İlk commit **2026-08-05 04:31:14 +0300**, son "gerçek" iş commit'i **2026-08-06 01:42:13 +0300** — yani tüm proje geçmişi **~18 saatlik bir pencerede** işlenmiş.

### ⚠️ Tutarsızlık — açıkça belirtiliyor

Repodaki çok sayıda tarihli rapor/denetim dosyası bambaşka bir zaman çizelgesine işaret ediyor:
- `NEREDEYDIK.md` → "Son güncelleme: 2026-05-17"
- `_audit/final/01_canli.md` → "Tarih: 17.05.2026"
- `docs/SECURITY_STATUS.md` → "Updated: 2026-05-16"
- `_audit/FEATURE_INVENTORY.md` → "(2026-05-30)"
- `_audit/` altında Nisan-Mayıs 2026 arasına tarihlenen onlarca denetim klasörü (`dil-faz0` … `dil-faz1n`, `hukuk-blok1` … `hukuk-mobil-b4`, `fiyat-blok1` … `fiyat-blok6` vb.)

Yani **repo içeriği (735 kaynak dosyası, 641 audit dosyası, 143 doc dosyası, olgunlaşmış özellik seti) aylar süren bir geliştirme sürecinin ürünü gibi görünüyor, ama git log bunun sadece 18 saatte yazıldığını söylüyor.** Bu iki şeyden biri anlamına gelir:

1. **Geçmiş sıfırlanmış/squash edilmiş:** Proje muhtemelen aylarca farklı bir git geçmişiyle (belki yerel, belki başka bir uzak repo, belki Cursor/Kimi gibi araçlarla çalışılan farklı bir ortamda) geliştirildi, sonra tek bir temiz geçmişle (`main`'den itibaren 51 commit) bu repoya "yeniden yazıldı" ya da bu klon o noktadan başlatıldı.
2. **Bu session'ın gördüğü klon, GitHub'daki gerçek `main` dalının tam tarihçesini yansıtmıyor olabilir** — sığ (shallow) bir görünüm ya da farklı bir dal/fork üzerinden geliyor olabilir.

**Kontrol edilmeli:** GitHub'da `yagiztugrul33/ihaleal` reposunun web arayüzünden (veya `git log --all` ile derin bir klon üzerinden) gerçek commit sayısı ve tarih aralığı doğrulanmalı. Bu raporun yazarı (Claude Code) bu ortamdan yalnızca tek bir klonu görebiliyor.

### Son iş teması (git log'dan)
Açık/minimal tema geçişi (koyu panel sayısı 364→0), Tailwind paletinin tokenlara bağlanması, performans turu (LCP, vendor bundle ayrıştırma), Google Fonts'un self-host edilmesi, Navbar test bataryasının 207/207'ye çıkarılması, Capacitor'ün açık temaya taşınması ve iOS platformunun eklenmesi.

---

## Çalışan Özellikler

Build ve test sonuçları, route yapısının derlenebilir ve testlerin yeşil olduğunu doğruluyor. Kod incelemesiyle doğrulanan somut örnekler:

- **İlan/ihale akışı:** teklif verme, teminat, anti-sniping, komisyon hesaplama — `src/lib/fees.ts` ve ilgili sayfalar derleniyor, testler geçiyor.
- **Deprem risk modülleri:** `earthquakes_latest` Edge Function **gerçekten** `https://deprem.afad.gov.tr/apiv2/event/filter` adresine istek atıyor, veriyi normalize ediyor (kod seviyesinde doğrulandı — bkz. aşağıdaki "Eksik İşler" bölümünde nüans).
- **GES/güneş enerjisi analizi:** `pvgis_solar` Edge Function **gerçekten** Avrupa Komisyonu'nun resmi PVGIS API'sine (`https://re.jrc.ec.europa.eu/api/v5_2/seriescalc`) istek atıyor, yanıtı parse ediyor, hata durumunda anlamlı `502`/`pvgis_fetch_failed` dönüyor. Bu, API anahtarı gerektirmeyen açık bir kamu API'si.
- **KYC gönderim akışı:** `kyc-submit` Edge Function, auth kontrolü + zod validasyonu + `kyc_verifications` tablosuna `in_review` statüsüyle kayıt atıyor — gerçek bir gönderim/kuyruklama akışı (aşağıda nüans var).
- **Uyum (compliance) chat taraması:** `post_chat_message` Edge Function, platformu bypass etme girişimlerini (komisyonsuz anlaşma, whatsapp'a yönlendirme, tapuda düşük gösterme vb.) 23 anahtar kelime kuralıyla ağırlıklandırarak puanlayan gerçek bir NLP-benzeri motor içeriyor (187 satır, iskelet değil).
- **iyzico ödeme entegrasyonu:** 489 satırlık gerçek bir implementasyon — secret yoksa sandbox simülasyonuna düşüyor, secret varsa gerçek iyzico REST API'sini çağırıyor; sunucu taraflı tutar doğrulaması ve idempotency key mantığı var.

---

## Eksik / Yarım Kalan İşler

### Yüksek öncelik

1. **PayTR ödeme entegrasyonu — kanıtlanmış eksik.** `supabase/functions/payments-paytr/index.ts` içinde dosya başlığında açıkça "PayTR payment **skeleton**" yazıyor; secret'lar mevcut olsa bile POST isteğine `{ ok: false, error: "not_implemented", message: "PayTR flow not wired yet; secrets are present." }` ile HTTP **501** dönüyor. Bu, varsayım değil — doğrudan kaynak koddan okunmuş bir gerçek.
2. **Edge Function isim/duplikasyon belirsizliği:** `place-bid` / `place_bid` ve `tcmb_evds` / `tcmb_yiufe` çifti — hangisinin güncel/canlıda kullanılan olduğu **kontrol edilmeli** (kod içinde ikisi de duruyor, ölü kod riski).
3. **Canlı doğrulama yapılamadı — ağ erişimi engelli.** Bu oturumun ağ politikası `ihaleal.vercel.app` ve `*.supabase.co` gibi hostlara giden bağlantıları proxy seviyesinde 403 ile reddediyor (`$HTTPS_PROXY/__agentproxy/status` çıktısındaki `recentRelayFailures` ile doğrulandı: `connect_rejected — gateway answered 403 to CONNECT`). Bu yüzden:
   - Hiçbir Edge Function gerçekten çağrılıp HTTP kodu ölçülemedi.
   - Canlı sitenin ayakta olup olmadığı doğrulanamadı.
   - **Önceki denetim dosyalarındaki "post_chat_message 404 dönüyor", "earthquakes_latest 404 dönüyor" iddiaları bu oturumda ne doğrulanabildi ne de çürütülebildi.** Kod incelemesi bu iki fonksiyonun da düzgün yazılmış olduğunu gösteriyor; 404 iddiası muhtemelen "deploy edilmemiş" durumuna işaret ediyor olabilir (kod var ama Supabase projesine push edilmemiş) — **bu, ayrı ve ağ erişimi olan bir ortamda (yerel makine veya CI) `supabase functions deploy` durumu ve `curl` ile kontrol edilmeli.**

### Orta öncelik

4. **i18n altyapısı yarım/çelişkili:** `package.json`'da `i18next` ve `react-i18next` bağımlılık olarak var, ama `src/` içinde hiçbir yerde `useTranslation` veya bu kütüphanelerden import **bulunamadı**. Gerçek çeviri sistemi, `src/i18n/messages.ts` içinde elle yazılmış özel bir `Locale`/mesaj sözlüğü yapısı. Dosyanın kendi yorumu şunu itiraf ediyor: *"RU/AR FAZ 0: SADECE altyapı. Çoğu metin TR fallback. Tam çeviri sonraki fazlarda (sayfa sayfa)."* → **RU/AR dilleri için tam çeviri tamamlanmamış**, sadece nav öğeleri çevrilmiş, geri kalanı Türkçe'ye düşüyor.
5. **AFAD toplanma alanı verisi mock:** `src/components/property/AfetDisasterHub.tsx` doğrudan `/data/afad-assembly-mock.json` dosyasından okuyor — bu özellik için gerçek AFAD API bağlantısı yok (deprem olay verisi için `earthquakes_latest` gerçek API kullanıyor ama toplanma alanları için mock kullanılıyor — ayrım önemli).
6. **KYC gerçek kimlik doğrulama yok:** `kyc-submit` fonksiyonu belgeleri kabul edip veritabanına "in_review" olarak yazıyor, ama bu bir insan/manuel inceleme kuyruğu — otomatik kimlik doğrulama sağlayıcısı (e-Devlet, üçüncü parti eIDV vb.) entegrasyonu **bulunamadı**.
7. **War Room görsel redesign** (önceki `NEREDEYDIK.md`'de belirtilen hedef) yapılmamış — işlevsel ama görsel sadelik hâlâ geçerli, bu oturumda kodda değişiklik gözlenmedi.
8. **PDF rapor motoru yok** — `jspdf`/`html2canvas` client-side kullanılıyor, sunucu taraflı profesyonel rapor üretimi yok.

### Düşük öncelik

9. Kod içinde gerçek bir TODO/FIXME/HACK/XXX yorumu **bulunamadı** — 25 eşleşmenin tamamı telefon numarası placeholder'ı (`+90 212 XXX XX XX` vb.) veya bölüm başlığı yorumu (`{/* KATMAN 4 */}`), teknik borç notu değil. Bu iyi bir disiplin göstergesi.
10. Bundle boyutu — `vendor-charts` (455 KB) ve ana `index` (454 KB) chunk'ları büyük; kod bölme (code-splitting) için gözden geçirilebilir.

---

## Güvenlik & Risk Bulguları

- **Sızıntı taraması:** `.env.example`/`.env.production.example` yalnızca placeholder değer içeriyor; genişletilmiş regex taramasında (gerçek görünümlü Stripe/AWS anahtarları, PEM private key blokları, gerçek JWT formatı) repo genelinde **hiçbir eşleşme bulunamadı**. Git geçmişinde de gerçek bir `.env` dosyasının hiç eklenmediği doğrulandı (`git log --diff-filter=A` ile). `.gitignore` env dosyalarını doğru şekilde dışlıyor.
- **npm audit riski** yukarıda detaylandırıldığı gibi tamamen devDependency/tooling katmanında — ama `@capacitor/cli` ve `supabase` CLI üzerinden geldiği için mobil build ve CI makinelerinde önemsenmeli.
- **PayTR "secrets present ama not_implemented" davranışı** aslında güvenli bir tasarım: yanlışlıkla yarım bir ödeme akışının canlıya çıkması engellenmiş durumda (bilinçli guard).
- **Ağ erişimi kısıtı** (bu oturuma özel) canlı güvenlik testini (CORS, rate-limit, RLS canlı davranışı) engelliyor — bu maddeler yalnızca kod incelemesiyle değerlendirilebildi, canlı doğrulama **ayrı bir ortamda yapılmalı**.

---

## Repo Hijyeni Önerileri

- **Kök dizin:** 61 adet `.md/.txt/.bat` rapor/komut dosyası birikmiş (`SONUC*.md`, `FIX*_SONUC.md`, `*.bat` çalıştırma script'leri vb.). Öneri: bir `archive/` klasörüne taşı ya da bir "aktif" seti (README, NEREDEYDIK, en güncel durum raporu) dışındakileri sil.
- **`_audit/`:** 641 dosya, **127 MB** — repoyu ciddi şekilde şişiriyor (git clone/checkout süresini uzatıyor). Çoğu tek seferlik ekran görüntüsü/denetim script'i. Öneri: bu klasörü tamamen git'ten çıkarıp harici bir depoya (ör. ayrı bir "audit-history" reposu veya obje depolama) taşı, ya da en azından Git LFS'e geçir.
- **`docs/`:** 143 dosya, 1.2 MB — boyut sorun değil ama içerik dağınık (Kimi/Cursor'a özel komut dosyaları, aynı konuda birden fazla taslak). Öneri: aktif mimari/güvenlik dokümanlarını (`ARCHITECTURE.md`, `SECURITY_STATUS.md` vb.) ayrı bir "canonical" klasörde topla, geçmiş taslakları arşivle.
- **Potansiyel ölü bağımlılıklar:** `i18next` ve `react-i18next` — `src/` içinde hiçbir kullanım bulunamadı (gerçek i18n özel kod ile yapılıyor). **Kontrol edilmeli** ve kullanılmıyorsa kaldırılmalı (bundle boyutuna küçük bir katkısı olabilir).
- **Duplicate Edge Function isimleri:** `place-bid`/`place_bid`, `tcmb_evds`/`tcmb_yiufe` — hangisi aktif kullanılıyor tespit edilip diğeri silinmeli.

---

## Önerilen Sonraki Adımlar (öncelik sırasıyla)

1. **Ağ erişimi olan bir ortamda (yerel makine/CI) Edge Function'ların gerçek deploy ve HTTP durumunu doğrula** — özellikle `post_chat_message`, `earthquakes_latest`, `place-bid` vs `place_bid`. Bu raporun tek gerçek boşluğu bu.
2. **PayTR entegrasyonunu tamamla veya bilinçli olarak "iyzico yeterli" kararı al** — şu an `not_implemented` durumda net biçimde işaretli, kararsızlık yok, sadece iş kalmış.
3. **GitHub'da gerçek commit geçmişini doğrula** — Bölüm "Git Durumu ve Tutarsızlık Notu"ndaki soruyu netleştir (squash mu, farklı görünüm mü).
4. **`npm audit fix` dene** (izole bir branch'te, sonra typecheck+test+build ile doğrula) — devDependency riskini kapat.
5. **i18next/react-i18next'i kaldır ya da gerçekten kullan** — şu an ikisi de yarım: bağımlılık var ama kod yok; RU/AR çevirisi de yarım. İkisinden birine karar ver.
6. **RU/AR tam çevirisini tamamla** (sayfa sayfa, `src/i18n/messages.ts` yorumunda planlandığı gibi).
7. **KYC'ye gerçek kimlik doğrulama sağlayıcısı bağla** (e-Devlet veya üçüncü parti eIDV).
8. **Repo hijyenini temizle** — `_audit/` klasörünü git'ten çıkar/arşivle (127 MB), kök dizindeki eski rapor dosyalarını topla.
9. **AFAD toplanma alanı verisini** mock'tan gerçek kaynağa taşı (deprem olay verisi zaten gerçek API'ye bağlı, bu son mock nokta).
10. **War Room görsel redesign ve sunucu taraflı PDF rapor motoru** — orta/uzun vadeli ürün hedefleri, aciliyeti düşük.

---

*Bu rapor; `npm install/typecheck/lint/build/test:run`'ın gerçekten çalıştırılması, `npm audit --json` çıktısının ayrıştırılıp `npm ls --all` ile bağımlılık zincirlerinin izlenmesi, ilgili Edge Function kaynak dosyalarının (`payments-iyzico`, `payments-paytr`, `kyc-submit`, `pvgis_solar`, `earthquakes_latest`, `post_chat_message`) satır satır okunması, `src/i18n/messages.ts` ve `AfetDisasterHub.tsx` gibi dosyaların incelenmesi ve genişletilmiş bir secret-regex taramasıyla hazırlanmıştır. Ağ erişimi bu oturumda `ihaleal.vercel.app` ve `*.supabase.co` için proxy tarafından engellendiği için (`connect_rejected`, HTTP 403) canlı/production doğrulaması yapılamamıştır — bu, "kontrol edilmeli" olarak işaretlenen tüm maddelerin ortak nedenidir.*
