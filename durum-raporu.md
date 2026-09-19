# İhaleal — Durum Raporu

Tarih: 2026-09-19 (güncel tur — önceki denetim raporunun üzerine yazıldı)
Yöntem: kod + git geçmişi + canlı Supabase/GitHub kontrolleri. Bu turda uygulama koduna yazma yapılmadı.

**MUTLAK KURAL uyarınca**: `placeBid`, `payment`, `escrow`, `KYC`, `fees.ts`, `taxConfig` ile ilgili
dosyalara **hiçbir yazma işlemi yapılmadı**; aşağıdaki bulgular bu alanlar için yalnızca gözlemdir.

---

## 0. Bugüne kadar yapılanlar (git geçmişinden)

- **SEO/GA4**: GA4 entegrasyonu, Core Web Vitals → GA4, IndexNow, canonical/sitemap/robots hizası,
  FAQPage/BreadcrumbList/BlogPosting/Organization/WebSite JSON-LD, hreflang, noindex kapsamı,
  /kat-karsiligi ve /kat-karsiligi-arsa sayfaları, /sss + /konum-risk-sorgu meta.
- **Performans/temizlik**: `Favorites` lazy görsel, 43 dosyada kullanılmayan import/değişken temizliği.
- **P0 güvenlik (bu gün)**: sealed teklif tutarı satıcıya API'den okunabiliyordu → kapatıldı (bkz. §1).
- **CI**: `Supabase v2 Deploy` yeniden yeşil (bkz. §9).

## 1. P0 — sealed teklif tutarı sızıntısı: KAPATILDI

- **Kök neden**: `listing_offers` üzerinde `authenticated` için tablo-geneli SELECT
  (`20260528170000_grants_restore_systemic.sql`) + satıcı RLS politikası tüm kolonları açıyordu;
  `listing_offers_safe` view'i vardı ama `security_invoker=true` idi ve istemci onu hiç okumuyordu.
- **Uygulanan**: `20260919100000_listing_offers_amount_lockdown.sql` — `amount_try` /
  `counter_amount_try` kolonlarında SELECT kaldırıldı, UPDATE yalnız `status`+`counter_amount_try`,
  view `security_invoker=false` + kendi satır filtresi (tek okuma yolu). İstemci 3 okumayı
  view'e taşıdı, `amount_try` artık `number | null`, panelde görünmeyen teklif için Kabul/Red
  butonları gizlendi.
- **Canlı doğrulama (SQL, CI sonrası yeniden)**: `amount_select=false`, `counter_select=false`,
  `amount_update=false`, `status_update=true`, `view_select=true`, `anon_view=false`,
  `view_options={security_invoker=false}`.
- **Kalan**: gerçek kullanıcı (satıcı/alıcı JWT) akışı **canlıda test edilmedi**. Canlı test hazır:
  `tests/rls/listing-offers.live.test.ts` (`RUN_RLS_INTEGRATION=1` + test hesapları + ilan id).
  Yetki tarafı SQL ile doğrulandı; panel görünümü elle bir kez doğrulanmalı. **P1**.
- **Tekrar riski**: `grants_restore_systemic` yeniden çalıştırılırsa kilit açılır (migration
  başlığında uyarı var).

## 2. Önceden "düşük riskli, dokunulmadı" denen UI uyarıları (4 madde) — DOKUNULMADI

| Madde | Güncel durum | Gerçek sorun mu? | Öneri |
|---|---|---|---|
| `AuctionDetail.tsx:482` `showBuyNowPanel` | Hesaplanıyor, hiçbir yerde kullanılmıyor. Asıl "Hemen Al" düğmesi (`:1540`) daha gevşek bir koşulla çiziliyor: `!isListingOnly && dealType !== "rent" && effectiveBuyNowTry != null`. `showBuyNowPanel`'deki `status === "live"`, `isAuctionMode`, `!auctionEndedVisual` koşulları düğmeye uygulanmıyor (biten ilan `buyNowDisabled` ile pasif, ama `live` olmayan/yaklaşan ilanda düğme görünür). | **Evet, olası mantık boşluğu** (satın alma akışına yakın). Sunucu tarafı `execute_buy_now` doğrulaması bu durumu engelliyor olabilir, teyit edilmedi. | Niyet neyse gate'i tek yerde birleştir; **payment-yakını, onayınızla**. **P1** |
| `RiskWarningPanel.tsx:7` `severityColor` | İçe aktarılmış, kullanılmıyor. Ayrıca `severityCls` üç önem düzeyi (info/uyari/kritik) için **birebir aynı** token'ları veriyor (tema sadeleşmesinde renk ayrımı kaybolmuş). Ayrım yalnızca ikon + "Bilgi/Uyarı/Kritik" etiketi. | **Evet, küçük UX/erişilebilirlik sorunu**: kritik hukuki uyarı görsel olarak bilgi notuyla aynı. | Kritik için ayrışan bir vurgu (kenarlık/ikon rengi) ekle; import'u sil. **P2** |
| `Layout.tsx:24` `authMinimal` | Hesaplanıyor, render'da kullanılmıyor. `AUTH_MINIMAL_PATHS` içindeki `"/emlakçı-giris"` (ç ile) gerçek rota `/emlakci-giris` ile uyuşmuyor. | Hayır, kullanıcıyı etkilemiyor (muhtemelen tema değişikliğinden kalan bir kalıntı; kaynağını doğrulamadım). | Kalıntıyı sil veya davranışı geri getir; yol yazımını düzelt. **P2** |
| `ChatWidget.tsx:251` `detail` | `buildQaFailureReply(userMsg, code, detail)` içinde `detail` kullanılmıyor; kullanıcıya yalnız `Hata kodu: <code>` gösteriliyor. | **Kasıtlı görünüyor** (ham sunucu hata metni kullanıcıya sızdırılmıyor). | Olduğu gibi bırak, parametreyi `_detail` yap. **P2** |

## 3. `escapeForJson()` ve prompt injection

- **`escapeForJson`** (`src/lib/security/aiSanitize.ts:42`): dışa aktarılmıyor, hiçbir yerden
  çağrılmıyor (yazan: `d5c767b`, 2026-06-01, "CEPHE 3"). JSON breakout gerçek bir risk değil:
  istemci `functions.invoke(..., {body})`, Edge `ai_qa` `JSON.stringify` kullanıyor; bu fonksiyonu
  uygulamak çift kaçırmaya yol açardı. **Öneri: sil** (ölü kod + yanıltıcı yorum). **Silinmedi**:
  talimat "silme kararını uygulama" dedi; tek satırlık, geri alınabilir bir değişiklik, onayınızı bekliyor. **P3**
- **Prompt injection filtresi eksik** (`sanitizeAiPrompt`/`buildSafeQaMessages` yalnız
  `endeksRaporu.ts:130` ve `gesEndeksPdf.ts:98`'de, ikisinde de prompt kodun kendi ürettiği metin):
  - `src/components/ChatWidget.tsx:408` — kullanıcı sohbeti doğrudan gidiyor.
  - `src/components/cinematic/TerminalHero.tsx:34` — arama kutusu metni doğrudan gidiyor.
  - `src/pages/AuctionDetail.tsx:1337` — satıcı kontrollü `auction.title` (80 karaktere kesilmiş)
    prompt'a gömülüyor (dolaylı injection).
  - Sunucu: `supabase/functions/ai_qa/index.ts:120-124` yalnız rol/tip kontrolü + `slice(0,4000)`;
    istemci `assistant` rollü sahte geçmiş de gönderebiliyor; `config.toml` `verify_jwt=false`
    (yalnız IP rate limit).
  - **Etki gerçekten düşük**: bot yalnızca metin döndürüyor, araç/yazma yetkisi yok. Risk: sistem
    prompt ifşası / marka dışına çıkarma. **P2**, yeni güvenlik kodu olduğu için onayınızı bekliyor.

## 4. `npm audit`

- **7 moderate, 0 high, 0 critical** (önceki turla aynı; yeni kritik/major advisory yok).
- Hepsi **devDependency**: `vitest` / `@vitest/ui` / `@vitest/coverage-v8` / `@vitest/mocker`
  (`npm audit fix` ile major olmayan düzeltme var) ve `@capacitor/cli` → `uuid` → `xcode`
  (düzeltme `@capacitor/cli@8.4.3` = **MAJOR**). Prod paketini etkilemiyor. **P2**, uygulanmadı.

## 5. i18n

- TR/EN key paritesi tip sistemiyle garanti (`Record<"en"|"tr", Messages>`, `tsc` temiz).
- RU/AR yalnız `nav.*` "kanıt çevirisi", gerisi TR fallback — dokümante edilmiş kapsam kararı,
  **değişmedi**. **P2**.

## 6. Test kapsamı (bugün eklenen `listing_offers` testleri hariç)

- Testli: `placeBid` (`src/lib/__tests__/placeBid.test.ts`), `fees`, `payment/capabilities`,
  `TaxSimulatorService`, `propertyTaxEngine`.
- **Hâlâ testsiz** (teyit edildi, hiçbir test bu modülleri import etmiyor): `src/lib/payment.ts`,
  `src/lib/payments/paymentClient.ts`, `src/lib/kyc/kycSubmitClient.ts`, `src/hooks/useKycStatus.ts`,
  `src/lib/buyNow.ts`, `src/lib/depositRegister.ts`. Ayrı bir "escrow" kod modülü yok.
- Toplam 63 test dosyası; yerelde 278 test geçti, 9'u canlı entegrasyon (varsayılan atlanır).
- **P0/P1**: para ve kimlik akışında test yok. Bu dosyalara dokunulmadı; test eklemek ayrı, onaylı görev.

## 7. TODO / FIXME / HACK

- `src/`: **2** gerçek TODO (`AfetDisasterHub.tsx:253`, `:274`) — önceki turla aynı.
- `supabase/functions/*`: 9 satır TODO/`TODO(anahtar)` (kyc-submit, payments-iyzico, payments-paytr,
  push-notifier, report-notifier) — sağlayıcı anahtarı bekleyen bilinçli işaretler.
- `.env.example`: 5 satır `TODO(anahtar)` (önceki turda 4 denmişti). Toplam 17 eşleşme (yanlış
  pozitifler elendi). **P2**.

## 8. Kod sağlığı

- `tsc --noEmit`: **0 hata**. `eslint . --max-warnings 0`: **temiz**. `npm run build`: **temiz**.
- `no-unused-vars` (proje genelinde kapalı, geçici açıp tarandı): **8** kalıntı (önceki turda 159):
  `App.tsx:56 Changelog` (route kasıtlı kaldırılmış, yorumla belgeli), `ChatWidget:251 detail`,
  `Layout:24 authMinimal`, `RiskWarningPanel:7 severityColor`, `listingOffers.ts:20 viewerIsSeller`,
  `aiSanitize.ts:42 escapeForJson`, `AuctionDetail:482 showBuyNowPanel`,
  `payment/PaymentStartPage.tsx:5 ScrollText` (ödeme alanı, **dokunulmadı**).
- **Bölüm B sonucu**: güvenle otomatik silinebilecek ölü kod **yok**: `Changelog` kasıtlı,
  `escapeForJson` için karar sizde, geri kalanlar ya UI davranışı ya ödeme alanı ya da yeni
  imza değişikliği. Yeni lint/tip hatası yok. Repoda `docs/ui-snapshots-old/*.bak` ve
  `docs/arsiv/**/tmp_*.sql` gibi arşiv kalıntıları var ama bilinçli arşiv, silinmedi.
- Hâlâ açık (önceki turdan): `TakasbankReconciliationService.ts:229` "STUB API CLIENT" — ödeme
  yakını, prod'a hazırlığı elle teyit edilmeli (**P1**); `VITE_SENTRY_DSN`
  (`initObservability.ts:11`) ve `VITE_TCMB_PROXY_URL` (`CurrencyContext.tsx:165`) hâlâ
  `.env.example`/`env.local.SABLON`'da yok (**P1**, sessiz devre dışı kalma riski).

## 9. Altyapı / CI

- **`Supabase v2 Deploy` (`supabase/**` push'unda `db push --include-all` + edge function deploy)**:
  bugün `Unauthorized` → boş secret → biçim hatası zincirinin ardından yeşil (run #35440206212).
  `db push` yalnız `20260919100000_listing_offers_amount_lockdown.sql`'i uyguladı; migration
  geçmişi senkron. **Dikkat**: bu workflow her tetiklendiğinde edge function'ları (place-bid,
  payments-iyzico, payments-paytr, kyc-submit …) da yeniden yayınlar.
- **`SUPABASE_ACCESS_TOKEN` secret'ı hâlâ tam yetkili kişisel bir token**
  (`cli_user@DESKTOP-…` adıyla Supabase CLI girişinden üretildi, son güncelleme 2026-09-19T11:28Z).
  **P1**: Dashboard'dan ayrı, adı belli yeni token üretin, secret'ı değiştirin, eskisini iptal edin.
  Tek komut için hazır betik: `scripts/rotate-supabase-ci-token.ps1` (token'ı panodan okur,
  biçimini doğrular, yazdırmaz; `-Trigger` ile CI'ı da çalıştırıp izler).
- **`deploy-vercel.yml` "no jobs" hatası — kök neden bulundu**: iş seviyesindeki
  `if: ${{ secrets.VERCEL_TOKEN != '' }}` geçersiz (`secrets` bağlamı iş-seviyesi `if`'te
  kullanılamaz), GitHub dosyayı hiç iş oluşturmadan kırmızı işaretliyordu. Ayrıca `VERCEL_TOKEN`,
  `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VITE_SUPABASE_*` secret'ları depoda **tanımlı değil**;
  production zaten Vercel'in GitHub entegrasyonuyla (`vercel[bot]`) deploy ediliyor.
  **Düzeltme** (yalnız workflow dosyası): token varlığı küçük bir `check` işinde okunuyor,
  `deploy` işi çıktıya göre koşullanıyor → token yoksa atlanır, run artık kırmızı olmaz.
  Token tanımlanırsa iş eskiden amaçlandığı gibi devreye girer (çift deploy riski: Vercel
  entegrasyonu + Actions — ikisini birden istemiyorsanız birini kapatın).
- **`CI` workflow'u**: son 4 run yeşil (#501–#504).

## 10. Karar bekleyen maddeler (öncelik sırasıyla)

1. **P1** — `SUPABASE_ACCESS_TOKEN`'ı sınırlı, adlı bir token ile değiştir (Dashboard işlemi sizde;
   sonrası `scripts/rotate-supabase-ci-token.ps1`).
2. **P1** — Canlı sitede satıcı/alıcı hesabıyla sealed teklif akışını bir kez elle doğrula (ya da
   `listing-offers.live.test.ts`'i test hesaplarıyla çalıştır).
3. **P1** — `AuctionDetail` "Hemen Al" düğmesinin görünürlük koşulu (`showBuyNowPanel` kullanılmıyor)
   ve `execute_buy_now` sunucu doğrulaması: payment-yakını, onayınızla.
4. **P1** — `payment.ts`, `paymentClient.ts`, `kycSubmitClient.ts`, `useKycStatus.ts`, `buyNow.ts`,
   `depositRegister.ts` için test eklenmesi (ayrı onaylı görev).
5. **P1** — `TakasbankReconciliationService.ts` "STUB API CLIENT" prod hazırlığı; `VITE_SENTRY_DSN`
   / `VITE_TCMB_PROXY_URL` şablonlara eklensin.
6. **P1** — `grants_restore_systemic` (tablo-geneli SELECT) P0'ın kök nedeniydi: benzer "hassas
   kolon + satıcı/alıcı asimetrisi" deseni başka tabloda var mı diye tarama.
7. **P2** — prompt injection filtresi (yeni güvenlik kodu, onayınızla); `escapeForJson` silinsin mi;
   `RiskWarningPanel` kritik vurgu; `authMinimal`/`detail` kalıntıları.
8. **P2** — `@capacitor/cli` major güncellemesi + `vitest` ailesi (`npm audit fix`, non-major).
9. **P3** — RU/AR çevirileri, 2 TODO (`AfetDisasterHub`), `Changelog` lazy import kalıntısı.


---

# Faz 2 Özellik Denetimi (2026-09-19)

Kapsam: `App.tsx` yönlendiricisindeki ~180 rota + 84 ayrık modül. Yöntem: rota tablosu ↔ tüm iç
bağlantılar (`navigate`/`to`/`href`/`path:`) karşılaştırması, kullanılmayan tanım taraması (proje
genelinde `no-unused-vars`), yetim dosya taraması, "demo/yakında" işaretleri, gönder-butonu ↔ ağ
çağrısı heuristiği, sitemap ↔ rota karşılaştırması. **Bu bir heuristik tarama**: her sayfanın her
koşulu tek tek okunmadı. Ödeme/teklif/KYC alanında yalnızca UI okundu, hiçbir şey değiştirilmedi.

## Modül envanteri (router'dan)

| Kategori | Rotalar (örnekler) |
|---|---|
| Pazaryeri / ihale / ilan | `/ihaleler`, `/ilan/:id`, `/ihale/:id`, `/ihale/:auctionId/hemen-al`, `/arama`, `/satilik/:il…`, `/kiralik/:il…`, `/favoriler`, `/karsilastir` |
| Harita / değerleme / endeks | `/harita`, `/degerleme`, `/valuation`, `/veri-ve-endeks`, `/sehirler`, `/sehir/:cityName`, `/borsa`, `/borsa/{varliklar,izleme,veri,portfoy,varlik/:id,sehir/:il}` |
| Kat karşılığı / kentsel dönüşüm | `/kat-karsiligi`, `/kat-karsiligi/studio`, `/kat-karsiligi-arsa`, `/kentsel-donusum`, `/modul/kentsel-donusum`, 30+ `/modul/*` (deprem/afet/parsel/imar/sigorta/kredi…) |
| Kurumsal / B2B / partner | `/kurumsal`→`/services`, `/kurumsal/iletisim`, `/kurumsal/dashboard`, `/emlakci-ortaklik`, `/emlakci`, `/emlakci-giris`, `/emlakci/panel`, `/emlakciler`, `/emlakci/:slug`, `/muteahhit/*`, `/proje/:projectId` |
| Auth / KYC / panel | `/giris`, `/kayit`, `/sifremi-unuttum`, `/kyc`, `/profil`, `/panel`, `/panel/:tabId`, `/mesajlar`, `/belgeler`, `/ayarlar`, `/dashboard`, `/uyelik*`, `/fiyatlandirma` |
| Teklif / ödeme / deposit (yalnız UI) | `AuctionDetail`, `/ihale/:auctionId/hemen-al`, `/odeme/baslat`, `/odeme/basarili`, `/hizmet-bedelleri`, `/komisyon` |
| Rapor / analiz / blog / rehber | `/raporlar`, `/rapor/:id`, `/analiz`, `/blog`, `/blog/:slug`, `/rehber`, `/rehber/:slug`, `/sss` |
| Chat / bildirim | `ChatWidget`, `/bildirimler`, `/panel/bildirimler`, `/mesajlar` |
| Hesaplayıcılar | `/mortgage`, `/konut-kredisi-hesaplayici`, `/komisyon-hesaplayici`, `/araclar/vergi-simulator`, `/araclar/finans-uyumluluk` |

## "Döveç" — ne olduğu

**Repoda ve tüm git geçmişinde (tüm dallar) hiç geçmiyor.** Kod (`src`, `supabase`, `scripts`, `docs`,
`public`, `tests`, `workers`), dosya adları, commit mesajları ve `git log -S` ile "Döveç / döveç / DÖVEÇ /
Doveç / Dovec / dovec / Dövec" tarandı: 0 eşleşme. Yakın adaylar da ilgisiz ("döviz": `CurrencyContext` /
TCMB proxy; entegrasyonlar: iyzico, PayTR, Takasbank, TKGM, Findeks). Bu isim ya kod dışında bir
partner/müşteri adı ya da bir yazım hatası. **Ne yaptığını uydurmuyorum.** Hangi modülden söz edildiğini
(sayfa URL'si ya da ekran görüntüsü) söylerseniz aranır.

## Sayısal özet

- Yeni bulunan sorun: **17** (aşağıda). Düzeltilen: **3** (404 veren bağlantı/rota sabiti).
- Rota↔bağlantı taraması: 182 rota deseni, 1 gerçek 404 kaldı (`EmlakciLanding.tsx:264`, karar gerektiriyor).
  Sitemap: 6.750 URL'nin **hepsi bir rotaya karşılık geliyor** (0 ölü URL).
- Kullanılmayan tanım (proje geneli): 8 (önceki bölümle aynı liste, bkz. §8 üstte).
- Yetim dosya: **84** (≈34 kullanılmayan shadcn `ui/*` primitive'i + ≈50 uygulama modülü).

## Düzeltilenler (davranış değiştirmeyen, ayrı commit)

| Dosya:satır | Sorun | Düzeltme |
|---|---|---|
| `src/pages/Realtors.tsx:86` | "Profili gör" → `/emlakçı/${slug}` (ç harfli); gerçek rota `/emlakci/:slug` → **404** | `/emlakci/${slug}` |
| `src/data/realEstateGuides.ts:171` | "KKA nedir" rehberindeki "KKA stüdyo" bağlantısı `/kka-hub` → rota yok, **404** | `/kat-karsiligi/studio` |
| `src/constants/routes.ts:20` | `ROUTES.KKA_STUDIO = "/kat-karsiligi/istudio"` gerçek rota `/kat-karsiligi/studio` ile çelişiyor (şu an kullanılmıyor, tuzak) | `/kat-karsiligi/studio` |

## P1 — kullanıcıya yanıltıcı ya da yarım çalışan akışlar (otomatik düzeltilmedi)

1. **Ekspertiz talebi hiçbir yere gitmiyor.** `src/pages/Expertise.tsx:44-47` `handleSubmit` yalnızca
   `setSubmitted(true)`; ağ/depolama çağrısı yok. Ekran ise `:57-59` "Talebiniz Alındı! … başarıyla
   kaydedildi. Uzman değerleme ekibimiz size ulaşacaktır." diyor. Talep kaybolur, kullanıcı kaydedildiğine
   inanır (ücretli hizmet: `SERVICE_FEES.expertise`). **Yanıltıcı UI.**
2. **Şifre sıfırlama çalışmıyor.** `src/pages/auth/PasswordReset.tsx:15-27` (`/sifremi-unuttum`): e-posta
   gönderilmiyor; "gerçekte gönderilmez" toast'ı ve "(demo)" düğmesi var. Dürüstçe etiketli ama production'da
   şifresini unutan kullanıcı hesabını kurtaramaz (`supabase.auth.resetPasswordForEmail` çağrısı yok).
3. **Emlakçı ortaklık başvurusu sunucuya gitmiyor.** `src/pages/mega/RealtorPartnership.tsx:88-110`: şirket
   unvanı, vergi no/TC, e-posta, telefon yalnızca ziyaretçinin `localStorage`'ına (`ihaleal_partner_apps`)
   yazılıyor; okuyan/ileten kod yok; kart "Başvurunuz kaydedildi (demo)" (`:201-205`). B2B lead hunisi fiilen
   çalışmıyor; kişisel veri ayrıca tarayıcıda açık depolanıyor.
4. **"Hemen Al" düğmesi görünürlük koşulu.** `AuctionDetail.tsx:482-488` `showBuyNowPanel` hesaplanıyor ama
   kullanılmıyor; düğme (`:1540`) `status==="live"` / `isAuctionMode` / `!auctionEndedVisual` koşullarını
   içermiyor (bkz. üstteki Bölüm 2). Ödeme-yakını, onay gerekir.
5. **Bildirim zili hiçbir yerde render edilmiyor.** `src/components/NotificationBell.tsx` yetim; `Navbar`
   içinde yok. Satıcı teklif bildirimi (`tg_listing_offer_notify`) DB'ye yazılıyor ama kullanıcı yalnızca
   `/bildirimler`'i bilerek açarsa görür; okunmamış rozeti yok.
6. **Premium kilidi UI'da uygulanmıyor.** `src/components/premium/PremiumGate.tsx` yetim (hiçbir yerde
   `<PremiumGate>` yok); `useMembershipTier` yalnızca `BorsaTerminali.tsx:54` ve `MyMembershipPage.tsx`'te.
   "Premium" özellik metinleri (`Analytics.tsx`, `CityGuide.tsx`, `GesAnalysisPage.tsx` …) UI'da kilitli değil;
   sunucu tarafı yaptırım teyit edilmedi.
7. **Yarım entegrasyonlar (stub/TODO).** `TakasbankReconciliationService.ts:229` "STUB API CLIENT";
   `supabase/functions/kyc-submit/index.ts:99` sağlayıcı imza/hash doğrulaması TODO;
   `payments-iyzico/index.ts:485` abonelik API'si ertelenmiş; `report-notifier/index.ts:164` `RESEND_API_KEY`
   yokken e-posta gönderilmiyor (abone/onay akışları etkilenir); `AfetDisasterHub.tsx:253,274` MTA/İBB açık veri.
   Hepsi ödeme/KYC yakını ya da anahtar bekliyor.

## P2

8. **404:** `src/pages/EmlakciLanding.tsx:264` "Detaylı sayfa" → `/emlakci/ozellikler/${slug}`; bu rota yok
   (yalnız `/emlakci/:slug` tek segment). Hangi sayfaya gideceği ürün kararı, otomatik düzeltilmedi.
9. **SEO meta metinlerinde "(demo)".** `src/lib/seo.ts` içinde 18 satır (ör. `:81`, `:131`, `:134`, `:147`,
   `:159`, `:167`, `:175`, `:179`, `:183`, `:271`, `:303`, `:311`, `:371`) ve `src/data/seoLandings.ts:27`:
   arama sonuçlarında "…özeti (demo)" görünür. Marka/tıklama etkisi.
10. **Demo içerik production sayfalarında:** `Realtors.tsx:82` "işlem (demo)", `realtorsDemo.ts:103,111` örnek
    yorumlar "(demo)", `ValuationWorkbench.tsx:393` "Benzer emsaller (demo)", `AfetDisasterHub.tsx:335,377,446`
    temsili/mock harita. Dürüstçe etiketli (iyi) ama gerçek ürün hissini düşürüyor.
11. **84 yetim dosya** (hiçbir yerden import edilmiyor): ≈34 shadcn `components/ui/*` primitive'i (zararsız);
    uygulama modülleri: `sections/{Hero,HomeStats,Features,HowItWorks,Stats,Testimonials,TrustStrip,Newsletter,
    EndingSoon,RecentlyViewed,LiveAuctionsShowcase,PlatformModulesShowcase,HomeCorporateCta}.tsx`,
    `components/{NotificationBell,DemoBanner,DocumentUploader,CorporateBanner,MarketingNavbar,MarkaIsareti,
    KkaRevenueHubStrip}.tsx`, `components/premium/PremiumGate.tsx`, `components/home/DepremTransparencyBand.tsx`,
    `pages/mega/{DigitalContracts,FrequentQuestions,Glossary}.tsx` (rotasız sayfalar), `lib/{savedAuctionSearch,
    auctionCalendar,formValidation}.ts`, `lib/borsa/realtime.ts`, `features/auctions/hooks/useAuctionState.ts` vb.
    Bir kısmı yarım bağlanmış özellik olabilir (ör. `DocumentUploader`, `savedAuctionSearch` ↔ `/aramalarim`).
    **Silinmedi**, karar sizde.
12. **Yinelenen rota tanımı** (zararsız, ilki kazanır): `App.tsx:230/231` (`/ilanlar`), `:258/259`
    (`/nasil-calisir`), `:294/295` (`/kurumsal`), `:432/440` (`/ibuyer` ↔ `IBUYER_PATH`).
13. **`RiskWarningPanel.tsx:25-45`:** üç önem düzeyi (bilgi/uyarı/kritik) birebir aynı stille çiziliyor; "Kritik"
    uyarı görsel olarak "Bilgi" ile aynı (yalnız ikon + etiket ayırıyor).
14. **`Layout.tsx:24` `authMinimal`** + `AUTH_MINIMAL_PATHS` içinde `"/emlakçı-giris"` (ç harfli, gerçek rota
    `/emlakci-giris`): yazım hatası; değişken zaten kullanılmıyor.
15. **Çift kaynaklı yüzde etiketi:** `CommissionCalculator.tsx:455` "%1 e-provizyon" sabit metin (hesap
    `rentalEProv*`). Teminat oranı (`BID_BOND_RATE = %5`) UI'da tutarlı (6 kez %5); kiralık e-provizyon ayrı
    kavram. Çelişki yok, yalnızca sabit metin ile sabit değer çift kaynak.
16. **Kullanılmayan parametreler:** `ChatWidget.tsx:251` `detail` (kasıtlı görünüyor), `listingOffers.ts:20`
    `viewerIsSeller` (P0 düzeltmesinden kalan imza, davranış etkisi yok).
17. **`App.tsx:56` `Changelog`** lazy import kalıntısı (route kasıtlı kaldırılmış, yorumla belgeli).

## Kontrol edilip sorun çıkmayanlar

- Durum mantığı tutarlı: `status: "live" | "upcoming" | "ended"`; "Yakında" yalnız `upcoming`'e düşüyor
  (`PropertyAnalysisReportViewer.tsx:892`, `endeksRaporu.ts:364`); aktif/pasif çelişkisi bulunmadı.
- Sitemap 4 dosya, 6.750 URL: rotasız URL yok. `/how-it-works`, `/ges-analiz-arazi` sabit üzerinden geçerli.
- Şehir SEO sayfaları (`/istanbul-ihaleleri` vb.) `SEO_LANDING_PAGES.map` ile dinamik rota (`App.tsx:312`): geçerli.
- `tsc`, `eslint`, `build`: temiz.
