# İhaleal — Durum Raporu (Salt-Okunur Denetim)

Tarih: 2026-09-19
Kapsam: Bu oturumdan önce zaten yapılmış olanlar hariç (breadcrumb, bazı JSON-LD şemaları,
Türkçe path düzeltmeleri, /kat-karsiligi-arsa) — kalan denetim maddeleri.

**MUTLAK KURAL uyarınca**: `placeBid`, `payment`, `escrow`, `KYC`, `fees.ts`, `taxConfig` ile
ilgili dosyalara bu denetim sırasında **hiçbir yazma işlemi yapılmadı**. Aşağıdaki bulgular
bu dosyalar için de sadece gözlemdir.

---

## 1. TODO/FIXME/HACK/XXX yorumları

- **Sayı**: 2 gerçek TODO (ilk taramada 25 eşleşme çıktı ama 23'ü yanlış pozitifti — telefon
  numarası placeholder'ları `"+90 212 XXX XX XX"`, `"05XX XXX XX XX"` gibi örnek maskeler ve
  `// KATMAN 4` gibi bölüm yorumlarıydı, TODO değil).
- **En kritik örnekler**:
  - `src/components/property/AfetDisasterHub.tsx:253` — MTA açık veri portalından shapefile→GeoJSON dönüşümü bekleniyor.
  - `src/components/property/AfetDisasterHub.tsx:274` — İBB Açık Veri şehir bazlı entegrasyonu bekleniyor.
  - `.env.example` içinde 4 adet `TODO(anahtar)` notu (PayTR/iyzico/KYC/VAPID secret'ları — **dokunulmadı**, sadece bilgilendirme amaçlı env şablonu).
- **Öncelik**: P2 (ikisi de bilgi katmanı zenginleştirme, blocker değil).

## 2. Yarım kalmış/iskelet fonksiyonlar

- **Sayı**: 0 gerçek iskelet fonksiyon bulundu. `=> {}` / boş gövde taraması yalnızca kasıtlı
  "sessiz hata yutma" (`.catch(() => {})`) desenlerini buldu — bunlar fire-and-forget
  Supabase/analytics çağrıları için standart ve doğru bir pattern.
- **Not**: `src/lib/finance/TakasbankReconciliationService.ts:229-234` içinde açıkça etiketlenmiş
  bir "STUB API CLIENT (Test/Development)" var. Bu dosya ödeme/mutabakat alanına yakın
  olduğundan **MUTLAK KURAL kapsamında değerlendirilip dokunulmadı** — yalnızca raporlanıyor.
- **Öncelik**: P1 (TakasbankReconciliationService.ts'in prod'a hazır olup olmadığı elle teyit edilmeli).

## 3. Kullanılmayan/ölü kod ve çağrılmayan import'lar

- **Sayı**: `@typescript-eslint/no-unused-vars` kuralı proje genelinde **kapalı**
  (`eslint.config.js:51`, sadece `intelligence/engineering/data` klasörlerinde açık). Kural
  geçici olarak tüm `src/` için açılıp tarandığında **159 uyarı, ~35 dosyada** bulundu (çoğu
  kullanılmayan lucide-react icon import'u).
- **En kritik 5 örnek**:
  - `src/pages/Analytics.tsx` — 13 kullanılmayan import + 2 kullanılmayan değişken (`radarData`, `rec`).
  - `src/pages/CityGuide.tsx` — 14 kullanılmayan import (recharts + lucide-react).
  - `src/pages/LiveAuctions.tsx` — 10 kullanılmayan import (`cn` dahil).
  - `src/pages/AuctionDetail.tsx` — 8 kullanılmayan import + `showBuyNowPanel` kullanılmayan state.
  - `src/pages/payment/PaymentStartPage.tsx:5` — `ScrollText` kullanılmıyor (**bu dosya ödeme
    alanında olduğu için MUTLAK KURAL gereği düzeltilmedi**, sadece raporlanıyor).
- **Öncelik**: P2 — davranış değiştirmeyen, güvenli temizlik adayı (bkz. Bölüm C).

## 4. `tsc --noEmit` + `any` tipiyle geçiştirilen yerler

- **`tsc --noEmit -p tsconfig.app.json`**: **0 hata**, temiz geçti.
- **`any` kullanımı**: proje genelinde yalnızca **3 örnek** (test dosyaları hariç):
  - `src/pages/Analytics.tsx:440` — `(d as any)[col.key]`
  - `src/pages/legal/LegalHubPage.tsx:138` — `tone: "slate" as any`
  - `src/sections/Auctions.tsx:116` — `useState<any>(null)`
- **Öncelik**: P2 (çok düşük hacim, tip güvenliği zaten iyi durumda).

## 5. `process.env`/`import.meta.env` kullanımı ama `.env.example`'da karşılığı olmayan

- **Sayı**: 2
  - `VITE_TCMB_PROXY_URL` — `src/contexts/CurrencyContext.tsx:165` içinde kullanılıyor, `.env.example`/`env.local.SABLON`'da yok.
  - `VITE_SENTRY_DSN` — `src/lib/observability/initObservability.ts:11` içinde kullanılıyor, şablonlarda yok.
- **Öncelik**: P1 — yeni bir geliştirici bu iki değişkenin var olduğunu şablondan öğrenemez; prod'da sessizce boş kalıp özelliğin çalışmaması riski var.

## 6. Test coverage — placeBid/payment/escrow/KYC/fees.ts/taxConfig (sadece raporlanıyor, test YAZILMADI)

| Modül | Test dosyası var mı |
|---|---|
| `src/lib/placeBid.ts` | ✅ `src/lib/__tests__/placeBid.test.ts` |
| `src/lib/fees.ts` | ✅ `src/lib/__tests__/fees.test.ts` |
| `src/lib/payment/capabilities.ts` | ✅ `src/lib/payment/capabilities.test.ts` |
| `src/lib/tax/TaxSimulatorService.ts` | ✅ `src/lib/tax/TaxSimulatorService.test.ts` |
| `src/lib/calculators/propertyTaxEngine.ts` | ✅ `propertyTaxEngine.test.ts` |
| `src/lib/realtor/realtorPayoutPolicy.ts` (escrow-benzeri hak ediş mantığı) | ✅ `realtorPayoutPolicy.test.ts` |
| `src/lib/payment.ts` (üst seviye payment client) | ❌ test yok |
| `src/lib/payments/paymentClient.ts` | ❌ test yok |
| `src/lib/kyc/kycSubmitClient.ts` | ❌ test yok |
| `src/hooks/useKycStatus.ts` | ❌ test yok |
| Ayrı bir "escrow" modülü | Bulunamadı — escrow yalnızca metin/içerik (docs, UI kopyası) olarak geçiyor, ayrı bir kod modülü yok. |

- **Öncelik**: P0 — `payment.ts`, `paymentClient.ts`, `kycSubmitClient.ts` test edilmeden prod'da
  para/kimlik akışı riskli. **Bu dosyalara MUTLAK KURAL gereği dokunulmadı; test eklenmesi ayrı,
  onaylı bir görev olmalı.**

## 7. `npm run build` — derleme hatası veren rota var mı

- **Sonuç**: **Temiz.** `npm run build` sıfır hata/uyarı ile tamamlandı (315 PWA precache girişi,
  tüm rotalar chunk'landı, `KatKarsiligiArsaOwnerPage` dahil önceki oturumun sayfası da dahil).
- **Öncelik**: — (sorun yok).

## 8. Supabase migration'ları ile şema arasındaki fark / eksik RLS

- **Sayı**: 58 migration dosyası tarandı. `initial_schema.sql` içindeki 6 temel tablonun
  tamamı için sonraki migration'larda `ENABLE ROW LEVEL SECURITY` bulundu — **RLS'siz tablo
  tespit edilmedi**.
- `docs/RLS_TEST_MATRIX.md` üreteci (`scripts/generate-rls-matrix.mjs`) çalıştırılıp
  incelendi (rapor sonrası **değişiklik geri alındı**, commit edilmedi). 4 migration dosyasında
  policy/fonksiyon adı tespit edilemedi (`—`): `20260528150000_rb1_rb2_rls_hardening.sql`,
  `20260528170000_grants_restore_systemic.sql`, `20260604120000_listing_offers_sealed_view.sql`
  (view oluşturuyor, tablo değil), `20260606199000_drop_legacy_payments.sql` (DROP migration'ı,
  policy beklenmez). İlk ikisi GRANT/ALTER komutları kullanıyor olabilir — script'in regex'i
  bunları yakalamıyor olabilir, elle göz atılması önerilir.
- **Öncelik**: P2 — kritik bir RLS boşluğu bulunamadı, ama `rb1_rb2_rls_hardening` ve
  `grants_restore_systemic` dosyalarının elle bir kez daha okunması önerilir (P1'e yakın, çünkü
  isimleri "hardening" — güvenlik amaçlı; script'in onları göstermemesi false-negative olabilir).

## 9. Deprecated/eski API çağrıları

- **Sayı**: 0. `componentWillMount`, `componentWillReceiveProps`, `findDOMNode`, `new Buffer()`,
  global `escape()/unescape()` gibi klasik deprecated pattern'lerin hiçbiri bulunamadı.
- **Öncelik**: — (sorun yok).

## 10. `npm audit` sonucu

- **Sonuç**: **7 moderate, 0 high, 0 critical.**
  - `@vitest/mocker` (path traversal, GHSA-82fw-gwwq-j7x9) — sadece **devDependency** (test altyapısı), prod bundle'a girmiyor.
  - `uuid <11.1.1` → `xcode` → `@capacitor/cli` zinciri (buffer bounds check) — sadece **devDependency** (mobil build CLI'ı), `npm audit fix --force` breaking change gerektiriyor (Capacitor CLI major sürüm atlaması).
- **Öncelik**: P2 — prod runtime'ı etkilemiyor; Capacitor CLI'ın majör güncellemesi ayrı, test edilmiş bir görev olarak ele alınmalı (otomatik `--force` çalıştırılmadı).

## 11. i18n — TR/EN/RU/AR çeviri key paritesi

- `src/i18n/messages.ts:1099` — `export const messages: Record<"en" | "tr", Messages>`.
  **TR ve EN arasındaki key paritesi TypeScript tip sistemi tarafından derleme zamanında garanti
  ediliyor** (`tsc --noEmit` temiz geçti → eksik/fazla key yok).
  RU ve AR bu `messages` objesinde **hiç yok** — dosya başındaki yorum bunun kasıtlı olduğunu
  belirtiyor: *"RU/AR FAZ 0: SADECE altyapı. Çoğu metin TR fallback."* (`LOCALE_DIRECTION` ve dil
  seçici UI'da RU/AR var, ama içerik çevirisi bilinçli olarak ertelenmiş bir sonraki faz işi.)
- **Öncelik**: P2 — bug değil, dokümante edilmiş kapsam kararı. RU/AR tam çevirisi ayrı bir proje kapsamı.

## 12. Git geçmişinde "wip"/"temp"/"geçici" içeren commit'ler

- **Sayı**: 3 — `78c127c wip(security): sistemik grants restore…`, `94e4df6 wip(security): Faz 4 deploy…`, `c81de0d wip(security): RB1+RB2 RLS hardening…`.
- Bunlar eski (main'e zaten merge olmuş) commit'ler; "wip" burada bir commit-mesajı önekiymiş gibi
  kullanılmış, çalışma ağacında bu commit'lere ait yarım kalmış bir değişiklik yok (`git status`
  temiz). Madde 8'deki RLS notuyla aynı 2 dosyaya işaret ediyorlar — çapraz doğrulama olarak faydalı.
- **Öncelik**: P2 — kod hijyeni sorunu değil, sadece madde 8'in elle gözden geçirme önerisini güçlendiriyor.

---

## Yönetici Özeti

İhaleal, önceki oturumlarda yapılan yoğun SEO/performans çalışmasıyla (breadcrumb+JSON-LD,
Core Web Vitals→GA4, self-host font + render-block olmayan yükleme, kapsamlı noindex/canonical/
sitemap hijyeni, RLS'siz tablo yok) **production'a teknik olarak oldukça yakın**; build ve
typecheck sıfır hatayla geçiyor, kritik/yüksek güvenlik açığı yok. En riskli 3 alan: **(1)**
`payment.ts`/`paymentClient.ts`/`kycSubmitClient.ts` gibi para ve kimlik doğrulama akışına
doğrudan bağlı üç dosyanın hiç testi yok (madde 6); **(2)** `VITE_SENTRY_DSN` ve
`VITE_TCMB_PROXY_URL` env şablonlarda belgelenmemiş, bu da hata izleme ve döviz proxy'sinin
prod'da sessizce devre dışı kalma riski taşıyor (madde 5); **(3)** "RLS hardening"/"grants
restore" adlı iki migration dosyası otomatik taramada policy tespiti vermedi ve elle bir kez
daha doğrulanmalı (madde 8/12). Bunların dışında kalan bulgular (kullanılmayan import'lar, 2
TODO, 3 `any`) kozmetik düzeyde ve P2.
