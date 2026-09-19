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
