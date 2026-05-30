# DERİN KILCAL ANALİZ — ihaleal.com

**Tarih:** 2026-05-30  
**Mod:** Salt okunur (src/ değiştirilmedi)  
**Kapsam:** `src/`, `supabase/`, `vite.config.ts`, `vercel.json`  
**Typecheck:** `npm run typecheck` → exit 0 (2026-05-30 çalıştırma)

---

## 🔴 KRİTİK BULGULAR

| # | Severity | Bulgu | Kanıt |
|---|----------|-------|-------|
| 1 | **P0** | Müteahhit kayıt `organizations` INSERT şema uyumsuz: `name`, `owner_user_id` kullanılıyor; tabloda `legal_name`, `display_name`, `slug` zorunlu, `owner_user_id` kolonu **yok** | `src/pages/auth/Register.tsx:88-97` vs `supabase/migrations/20260516120100_v2_multi_tenant.sql:8-14` |
| 2 | **P0** | Müteahhit paneli org sorgusu var olmayan `organizations.owner_user_id` ile filtreliyor | `src/pages/portals/MuteahhitPanelPage.tsx:68-73` — migration’larda `organizations` için `owner_user_id` **tespit edilemedi** (grep: yalnızca `developer_projects`) |
| 3 | **P1** | Çift oturum modeli: Supabase `AuthContext` ile `localStorage ihaleal_user` paralel; `/profil` ve `/dashboard` Supabase oturumunu doğrulamıyor | `src/pages/Profile.tsx:11-17,29-38` vs `src/contexts/AuthContext.tsx:38-99` |
| 4 | **P1** | Route guard yalnızca `/admin` (`AdminGuard`) ve `/emlakci-giris` (`LocalAuthGate`); `/ihale-ac`, `/profil`, `/muteahhit/panel`, `/kurumsal/dashboard` URL ile doğrudan açılır — koruma çoğunlukla sayfa içi UI | `src/App.tsx:213-215,258,355-364,437` + `src/pages/CreateAuction.tsx:362-373` |
| 5 | **P1** | `publishUnitAsListing` birim→listing (Anayasa I-1) uygular ama **sunucu tarafı sahiplik/ruhsat** kontrolü yok; RLS `listings_insert_kyc` verified KYC ister | `src/hooks/useDeveloperProjects.ts:191-232` + `supabase/migrations/20260428120100_rls_policies.sql:24-32` |
| 6 | **P2** | Teklif yolu çift: istemci hem `supabase.rpc('place_bid')` hem Edge `place-bid` fetch kullanıyor — tutarsızlık / çift bakım riski | `src/lib/placeBid.ts:58` vs `src/features/auctions/hooks/useAuctionState.ts:108-116` |
| 7 | **P2** | 7/14 Edge Function frontend’den **hiç çağrılmıyor** (ödeme, KYC, bulk ingest, matching, ai-price-estimate, place_bid edge) | `supabase/functions/*` (14 adet) vs `src` grep `functions/v1|functions.invoke` — eşleşme: 7 fonksiyon |
| 8 | **P2** | Müteahhit panel giriş linki HashRouter dışı `/login` (404 riski) | `src/pages/portals/MuteahhitPanelPage.tsx:148` — doğru rota `/giris` (`App.tsx:211`) |
| 9 | **P2** | Anon’a açık SELECT: `listings`, `auctions` + doğrulanmış proje/birim + public bid view’lar — kasıtlı vitrin ama veri sızıntısı yüzeyi geniş | `supabase/migrations/20260528170000_grants_restore_systemic.sql:108-109`, `20260530140000_r14_developer_projects.sql:122-177` |
| 10 | **P3** | `src/` içinde `service_role` / `VITE_*SERVICE*` sızıntısı **yok**; yalnızca anon + placeholder | `src/lib/supabase.ts:4-5,27-29` — grep `service_role|SERVICE_KEY` → **0 eşleşme** `src/` |

---

## 1. MİMARİ

### 1.1 Provider zinciri

```
main.tsx:20-23  → StrictMode → App
App.tsx:184-185 → LocaleProvider → AuthProvider
App.tsx:186     → BrowserRouter
App.tsx:187-188 → ErrorBoundary → Suspense → Routes
App.tsx:501     → WebAnalytics (BrowserRouter içi, Layout dışı)
Layout.tsx:22+  → Navbar, Footer, ChatWidget, CookieConsent, Outlet (sayfa)
```

**Kanıt:** `src/main.tsx:20-23`, `src/App.tsx:182-188,501`, `src/components/Layout.tsx:22-40`

### 1.2 Route ağacı (sayılar)

| Metrik | Değer | Kanıt |
|--------|-------|-------|
| `lazy(() => import(...))` | **100** | `grep lazy(() => import src/App.tsx` → count **100** |
| Statik sayfa import (lazy değil) | **1** (`Home`) | `src/App.tsx:9` |
| `<Route path=` | **100** | `grep <Route path= src/App.tsx` → count **100** |
| `<Navigate replace>` redirect | **12** | `src/App.tsx:202-203,205,227-228,247-248,255-256,264,373-374` |
| SEO dinamik landing | **5** | `src/data/seoLandings.ts:13-58` (5 `path:` girişi) |
| Layout dışı rota | **1** (`GES_LAND_PATH`) | `src/App.tsx:490-497` |
| Borsa nested child | **6** | `src/App.tsx:384-431` (index + 5 alt path) |
| Route guard sarmalayıcı | **2** | `AdminGuard` `/admin` (`App.tsx:355-364`); `LocalAuthGate` `/emlakci-giris` (`App.tsx:250`) |

**Router tipi:** `BrowserRouter` (`App.tsx:186`) — hash değil; Vite `server.open: "/#/"` (`vite.config.ts:69`) yerel açılış kolaylığı.

### 1.3 Tipik veri akışı (örnek: ihale detay)

```
/ilan/:id (App.tsx:206)
  → AuctionDetail.tsx
    → useParams id
    → useAuth() → AuthContext → supabase.auth + profiles SELECT (AuthContext.tsx:83-87)
    → supabase.from("auctions") (AuctionDetail.tsx:174, features/auctions/hooks/useAuctionState.ts:49)
    → supabase.from("listings") (AuctionDetail.tsx:184)
    → placeBid: supabase.rpc("place_bid") (placeBid.ts:58) VE/VEYA Edge place-bid (useAuctionState.ts:108)
    → Demo fallback: demoAuctionCatalog / auctionsSource (AuctionDetail.tsx içinde — demo eşleşme sayısı yüksek)
```

**Kanıt:** `src/App.tsx:206`, `src/pages/AuctionDetail.tsx:34,114,174,184`, `src/lib/placeBid.ts:58`, `src/features/auctions/hooks/useAuctionState.ts:49,108`

---

## 2. SUPABASE KATMANI (istemci)

### 2.1 `supabase.from(...)` envanteri

**Toplam `.from("...")` çağrısı:** 47 satır eşleşme (`grep .from(" src` — tekrarlı satırlar dahil)

| Tablo | İşlem | Dosya(lar) | Oturum beklentisi |
|-------|--------|------------|-------------------|
| `organizations` | INSERT, SELECT | `Register.tsx:88`, `MuteahhitPanelPage.tsx:69`, `useActiveOrg.ts:35` | authenticated |
| `profiles` | SELECT, UPDATE | `AuthContext.tsx:84`, `Register.tsx:106`, `AdminDashboard.tsx:84`, `MuteahhitPanelPage.tsx:67`, `depositRegister.ts:94`, `buyNow.ts:96`, `CreateAuction` (dolaylı) | authenticated |
| `listings` | INSERT, UPDATE, SELECT | `useDeveloperProjects.ts:206`, `CreateAuction.tsx:219,314`, `OrganizationDashboard.tsx:41`, `AdminDashboard.tsx:51`, `AuctionDetail.tsx:184`, `aiAnalysis.ts:184` | authenticated (+ anon SELECT RLS) |
| `auctions` | SELECT, INSERT | `AuctionDetail.tsx:174`, `CreateAuction.tsx:264`, `AdminDashboard.tsx:63`, `useAuctionRealtime.ts:21`, `useAuctionState.ts:49`, `supabaseAuctionsFetch.ts:12` | anon+auth SELECT |
| `bids` | — | **Doğrudan `.from("bids")` yok** | RPC/Edge |
| `developer_projects` | CRUD SELECT/INSERT/UPDATE | `useDeveloperProjects.ts:90,112,146,184` | authenticated |
| `project_units` | INSERT, SELECT, UPDATE | `useDeveloperProjects.ts:147,179,228`, `MuteahhitPanelPage.tsx:103` | authenticated |
| `memberships` | INSERT, SELECT | `YillikUyelik.tsx:32`, `CreateAuction.tsx:201` | authenticated |
| `authorizations` | INSERT | `CreateAuction.tsx:246` | authenticated |
| `pre_launch_signups` | INSERT | `PreLaunch.tsx:22` | anon INSERT grant |
| `corporate_leads` | INSERT | `CorporateContact.tsx:24` | anon INSERT |
| `service_fees` | INSERT | `HizmetBedelleri.tsx:33` | authenticated |
| `property_analysis_reports` | INSERT, SELECT | `aiAnalysis.ts:174,207` | authenticated |
| `report_approvals` | INSERT, SELECT | `aiAnalysis.ts:195,220` | authenticated |
| `engineering_analysis_runs` | INSERT, SELECT | `lib/engineering/persistence/analysisRuns.ts:61,80` | authenticated |
| `organization_members` | SELECT | `useOrgPermissions.ts:39` | authenticated |
| `audit_log` | SELECT | `AdminDashboard.tsx:74` | admin (UI guard) |

### 2.2 `supabase.rpc(...)` envanteri

| RPC | Dosya | Satır |
|-----|-------|-------|
| `place_bid` | `src/lib/placeBid.ts` | 58 |
| `execute_buy_now` | `src/lib/buyNow.ts` | 114 |
| `set_active_org` | `src/hooks/useActiveOrg.ts` | 57 |
| `admin_approve_listing` | `src/pages/admin/AdminDashboard.tsx` | 106 |
| `register_bid_deposit` | `src/lib/depositRegister.ts` | 112 |
| `org_dashboard_stats` | `src/features/organizations/OrganizationDashboard.tsx` | 37 |
| `submit_ibuyer_application` | `src/lib/ibuyer/submitInstantOffer.ts` | 58 |
| `submit_ges_land_evaluation` | `src/lib/ges-land/submitGesProject.ts` | 64 |

**Toplam:** 8 RPC çağrı noktası.

### 2.3 Edge / Functions çağrıları

| Yöntem | Fonksiyon | Dosya | Satır |
|--------|-----------|-------|-------|
| `functions.invoke` | `tcmb_yiufe` | `src/lib/tax/tcmbYiUfeClient.ts` | 26 |
| `functions.invoke` | `ai_qa` | `src/lib/systemQaClient.ts` | 21 |
| `functions.invoke` | `post_chat_message` | `src/lib/chat/postChatMessageClient.ts` | 62 |
| `functions.invoke` | `nearby-poi` | `src/hooks/useNearbyPOI.ts` | 73 |
| `fetch .../functions/v1/` | `earthquakes_latest` | `src/components/home/LiveEarthquakeTicker.tsx` | 149 |
| `fetch .../functions/v1/` | `place-bid` | `src/features/auctions/hooks/useAuctionState.ts` | 108 |
| `fetch .../functions/v1/` | `pvgis_solar` | `src/lib/data/pvgisClient.ts` | 37 |

**Frontend’de çağrılmayan Edge Functions (7+):**  
`payments-iyzico`, `payments-paytr`, `kyc-submit`, `bulk-listing-ingest`, `matching-fanout`, `ai-price-estimate`, `place_bid` (edge `supabase/functions/place_bid/index.ts`) — `src/` içinde isim eşleşmesi **0** (`grep payments-iyzico|payments-paytr|kyc-submit|bulk-listing|matching-fanout|ai-price-estimate`).

---

## 3. GÜVENLİK

### 3a) Gizli anahtar sızıntısı (istemci)

| Arama | `src/` sonuç |
|-------|----------------|
| `service_role`, `SERVICE_KEY`, `SERVICE_ROLE` | **0 eşleşme** |
| `VITE_.*SERVICE` | **0 eşleşme** |
| `secret` (case-insensitive) | **3 dosya**, yalnızca kullanıcı metni / dokümantasyon (`ChatWidget.tsx:240`, `DataStrategy.tsx:115`, `TaxSimulatorPage.tsx:98`) |

**İstemci yalnızca:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (`src/lib/supabase.ts:4-5`).

**Repo dışı:** `.env.example:11` → `SUPABASE_SERVICE_ROLE_KEY` placeholder (commit edilebilir şablon; gerçek değer repoda **tespit edilemedi**).

### 3b) Route guard ↔ RLS tutarlılığı

| Rota | Route-level guard | Sayfa içi koruma | RLS son katman |
|------|-------------------|------------------|----------------|
| `/admin` | **AdminGuard** — `authIsAdmin(profile)` | — | Admin RPC + policies |
| `/emlakci-giris` | **LocalAuthGate** — `localAuthEnabled` | — | Demo local auth |
| `/giris`, `/kayit` | Yok (public) | — | Supabase Auth |
| `/ihale-ac` | Yok | `!user` → giriş CTA (`CreateAuction.tsx:362-373`) | `listings_insert_kyc` verified |
| `/profil` | Yok | `localStorage ihaleal_user` (`Profile.tsx:29-38`) | profiles RLS self |
| `/dashboard` | Yok | `localStorage` redirect (`dashboard/index.tsx:37-41`) | — |
| `/muteahhit/panel` | Yok | `!user` UI + role check (`MuteahhitPanelPage.tsx:143-172`) | developer_projects owner RLS |
| `/kurumsal/dashboard` | Yok | **Tespit edilemedi** (OrganizationDashboard auth kontrolü dosya içi incelenmedi — route guard yok: `App.tsx:258`) | org member RLS |

**Sonuç:** Admin hariç tüm “koruma” **istemci UI**; URL bilgisi olan kullanıcı API’ye doğrudan istek atabilir (RLS tek gerçek bariyer).

**AdminGuard kanıt:** `src/components/admin/AdminGuard.tsx:11-24,33-35` — `profile.isAdmin` / role kontrolü.

### 3c) Anon’a açık veri (migration kanıtı)

| Kaynak | Anon erişim | Policy / Grant |
|--------|-------------|----------------|
| `listings` | SELECT (active/closed) | RLS `listings_select_active` (`20260428120100_rls_policies.sql:20-22`) + GRANT (`20260528170000:108`) |
| `auctions` | SELECT (non-draft) | `auctions_select_public` (`20260428120100:38-40`) + GRANT (`20260528170000:109`) |
| `auction_bid_public_summary`, `auction_bid_public_tape` | SELECT view | `20260521221500:57-58` |
| `developer_projects` | SELECT yalnızca `ruhsat_status='verified'` | `20260530140000:122-126` |
| `project_units` | SELECT available/reserved + verified proje | `20260530140000:169-177` |
| `nearby_poi_cache` | SELECT | `20260530120000:30,42` |
| `pre_launch_signups` | INSERT | `20260430140000_pre_launch_signups.sql:30` |
| `corporate_leads` | INSERT (SELECT admin-only RB1 sonrası) | `20260528150000:55-71` |
| `bids` (ham tablo) | Eski `using (true)` **kaldırıldı** | `20260521221500:5-8` → bidder veya listing owner |

**Not:** Eski `bids_select_public using (true)` (`20260428120100:42-44`) production’da migration uygulanmadıysa hâlâ risk — uzak DB durumu **bu analizde doğrulanmadı**.

---

## 4. TİP GERÇEĞİ (`tsc --noEmit` = 0)

| Metrik | Toplam (`src/**/*.ts,tsx`) | Not |
|--------|---------------------------|-----|
| `\bany\b` | **6** | 6 dosyada |
| `as any` | **2** | `Analytics.tsx`, `TaxSimulatorService.test.ts` |
| `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck` | **0** | grep |
| Non-null assertion `!` (heuristic `![.)],;`) | **24** | node taraması |
| `as Type` cast (heuristic) | **294** | node taraması |

### En yoğun 10 dosya (cast skoru: any×1 + asAny×2 + tsIgnore×3 + `!` + asCast)

| # | Dosya | Skor |
|---|-------|------|
| 1 | `src/pages/modules/index.ts` | 37 |
| 2 | `src/lib/demo-data/properties/generate.ts` | 11 |
| 3 | `src/components/search/EarthquakeFilters.tsx` | 8 |
| 4 | `src/components/ui/sidebar.tsx` | 6 |
| 5 | `src/components/valuation/ValuationWorkbench.tsx` | 6 |
| 6 | `src/lib/data/pvgisTypes.ts` | 6 |
| 7 | `src/lib/valuation/advancedValuation.ts` | 6 |
| 8 | `src/pages/Analytics.tsx` | 6 |
| 9 | `src/pages/BorsaDataAnalysisPage.tsx` | 5 |
| 10 | `src/pages/BorsaPage.tsx` | 5 |

**Maske yorumu:** Düşük `any` sayısı strict mode ile uyumlu; asıl gevşeklik **294 `as` cast** ve shadcn/ui primitiflerinde tip assertion.

---

## 5. ÖLÜ KOD / BORÇ

| Kalıp | Toplam eşleşme (`src/`, PowerShell `\b` word boundary) |
|-------|--------------------------------------------------------|
| `demo` | **517** |
| `mock` | **115** |
| `dummy` | **0** |
| `TODO` \| `FIXME` \| `HACK` | **7** (6 dosya: `RouteSeo.tsx`, `SeoSync.tsx`, `DegerlemeModulPage.tsx`, `GesAnaliziModulPage.tsx`, `gesFeasibilityReport.ts`, `seo.ts`) |
| `console.log|warn|error|debug(` | **7** |

**Kullanılmayan export envanteri:** Otomatik dead-export analizi **yapılmadı** (kapsam dışı araç yok) → **tespit edilemedi**.

**Örnek borç:** `src/pages/modules/index.ts` — 37 cast; modül lazy re-export hub.

---

## 6. i18n SAĞLIĞI

### Mimari

- Tek kaynak: `src/i18n/messages.ts` — `Record<Locale, Messages>` (`messages.ts:78-327`)
- API: `useLocale().t` → **obje** (fonksiyon değil) (`LocaleContext.tsx:18-22,55`)
- Kullanan bileşenler: `Navbar`, `Hero`, `HowItWorks`, `LiveAuctionsShowcase`, `TrustStrip`, `PremiumCinematicHome`, `HomeTarget` — grep `useLocale` / `t.home` / `t.nav`

### `home.investor.heading` (prod 500 geçmişi)

| Locale | Tanımlı mı? | Satır |
|--------|-------------|-------|
| `en` | Evet | `messages.ts:198-199` |
| `tr` | Evet | `messages.ts:322-323` |

**Runtime kullanım:** `PremiumCinematicHome.tsx:178` → `const home = t.home;` → `:496` → `{home.investor.heading}` — **ReferenceError riski giderilmiş** (alias var).

### Eksik key listesi

i18n **tip-güvenli** (`Messages` / `HomeMessages`); `t('string')` kalıbı **0 eşleşme** `src/`.

**Derleme kanıtı:** `npm run typecheck` exit 0 → en/tr aynı şekil.

**EKSİK key (runtime):** **Liste boş** — bilinen eksik key **tespit edilemedi**. (Geçmiş 500, tanımsız değişken veya deploy öncesi eski bundle kaynaklı olabilir; mevcut kaynakta kanıt yok.)

---

## 7. EDGE FUNCTIONS

### Envanter (14)

`supabase/functions/*/index.ts`:  
`ai_qa`, `ai-price-estimate`, `bulk-listing-ingest`, `earthquakes_latest`, `kyc-submit`, `matching-fanout`, `nearby-poi`, `payments-iyzico`, `payments-paytr`, `place_bid`, `place-bid`, `post_chat_message`, `pvgis_solar`, `tcmb_yiufe`

### Frontend eşleşmesi

| Edge | Frontend | Error handling |
|------|----------|----------------|
| `ai_qa` | `systemQaClient.ts` → `ChatWidget.tsx:371` | invoke error + `data.error` (`systemQaClient.ts:25-33`) |
| `post_chat_message` | `postChatMessageClient.ts:62` | invoke + test dosyası |
| `tcmb_yiufe` | `tcmbYiUfeClient.ts:26` | invoke error |
| `nearby-poi` | `useNearbyPOI.ts:73` | invoke error |
| `earthquakes_latest` | `LiveEarthquakeTicker.tsx:149` | fetch (ayrı kontrol gerekli) |
| `place-bid` | `useAuctionState.ts:108-122` | `!res.ok` + body.error |
| `pvgis_solar` | `pvgisClient.ts:37` | fetch |
| Diğer 7 | **Çağrı yok** | — |

### `ai_qa` — 502 kod-seviyesi inceleme

**Edge (`supabase/functions/ai_qa/index.ts`):**

| Kontrol | Durum | Satır |
|---------|-------|-------|
| OpenAI `fetch` await | **Var** | 86-93 |
| `!r.ok` → 502 + detail | **Var** | 95-100 |
| try/catch genel sarmalayıcı | **Yok** (yalnızca JSON parse try) | 55-61 |
| `verify_jwt` | `config.toml` içinde `[functions.*]` **tespit edilemedi** — varsayılan CLI davranışına bağlı |
| `OPENAI_API_KEY` yok | 503 `openai_not_configured` | 46-51 |

**502 olası kök nedenler (kod):** OpenAI HTTP hata gövdesi (`openai_http`), boş completion (`empty_completion`). **Await edilmemiş promise** veya **non-200 handle yok** iddiası **mevcut kodda geçersiz** (95-100 satırı mevcut).

**İstemci:** `invokeSystemQa` Edge 502 gövdesini `error.message` ile sınırlı aktarır; `detail` alanı kullanıcıya filtrelenmeli (`systemQaClient.ts:25-33`).

---

## 8. ANAYASA I-1 — “Proje altı unit → ayrı listing”

### Kod izi

| Adım | Uygulama | Kanıt |
|------|----------|-------|
| UI tetikleyici | Müteahhit proje detay “Yayınla” | `MuteahhitProjeDetayPage.tsx:57-78` |
| Ruhsat UI gate | `isVerified` kontrolü | `:54-60` |
| Helper | `publishUnitAsListing` | `useDeveloperProjects.ts:191-232` |
| listings INSERT | `project_id`, `unit_id`, `is_lansman: true`, ayrı `title` | `:205-220` |
| unit geri bağlantı | `project_units.listing_id` + status `reserved` | `:227-230` |

**Sonuç:** I-1 **istemci kodunda uygulanıyor** — her birim için **ayrı listing** satırı.

**Eksikler:**

1. Helper içinde **proje sahibi / ruhsat** doğrulaması yok (yalnızca UI `:54-60`).
2. RLS `listings_insert_kyc` verified KYC şartı (`20260428120100:24-32`) — müteahhit pending KYC ile INSERT **reddedilebilir**.
3. Owner-only yayın butonu UI’da `isOwner` (`MuteahhitProjeDetayPage.tsx:54,126`) — API bypass mümkün.

---

## 9. VERİ MODELİ — listings ext

### Migration (R14)

```sql
-- 20260530140000_r14_developer_projects.sql:86-88
project_id UUID REFERENCES developer_projects ON DELETE SET NULL
unit_id UUID REFERENCES project_units ON DELETE SET NULL
is_lansman BOOLEAN DEFAULT FALSE
```

**FK döngüsü:** `project_units.listing_id` → `listings.id` ON DELETE SET NULL (`:91-95`).

### Tutarlılık

| Senaryo | Davranış | Risk |
|---------|----------|------|
| Unit publish | listing + unit.listing_id set | OK |
| Listing silinirse | unit.listing_id SET NULL (FK) | Orphan unit “reserved” kalabilir |
| Project silinirse | listing.project_id SET NULL | Lansman ilanı projeden kopar |
| Unit silinirse | listing.unit_id SET NULL | Listing birimsiz kalır |

**Register ↔ organizations:** INSERT alanları migration şemasıyla **uyumsuz** (Kritik #1).

**Muteahhit org lookup:** `owner_user_id` kolonu organizations’da **yok** — `organization_members` üzerinden owner eşlemesi beklenir (`20260516120100:26-33`) ama panel kodu farklı (`MuteahhitPanelPage.tsx:68-73`).

---

## 10. BUNDLE

### Vite chunk config

`vite.config.ts:89-117` — `manualChunks`:

| Chunk | Koşul |
|-------|--------|
| `vendor-react` | react, react-dom, react-router |
| `vendor-charts` | `node_modules/recharts` |
| `vendor-leaflet` | leaflet |
| `vendor-ui` | lucide-react |
| `vendor-motion` | framer-motion |
| `vendor-supabase` | @supabase |
| `vendor-zod` | zod |

**CI vs local:** `esbuild.drop: ["console","debugger"]` yalnızca non-CI (`vite.config.ts:57-60,84`).

### vendor-charts içeriği

**recharts import eden dosya sayısı:** **23** (`grep from "recharts" src`).

Örnekler: `AuctionDetail.tsx`, `Compare.tsx`, `Analytics.tsx`, `BorsaPage.tsx`, `components/ui/chart.tsx` (shadcn chart primitive — recharts re-export).

### Paylaşılan chunk / ağır import

Son build (`npm run build` 2026-05-30 oturumu):

| Chunk | Boyut (minified) |
|-------|------------------|
| `vendor-charts-*.js` | **455.89 kB** |
| `index-*.js` (ana app) | **311.05 kB** |
| `vendor-react-*.js` | 232.76 kB |
| `vendor-supabase-*.js` | 204.38 kB |
| `jspdf*.js` | 390.27 kB (lazy route’a bağlı) |

**Risk:** `components/ui/chart.tsx` recharts’ı ui kit’e bağlar — chart kullanan sayfa olmasa bile ui import zinciri **tespit edilemedi** (tree-shake bağımlı).

**Layout statik import:** `ChatWidget` → `invokeSystemQa` → tüm oturumlarda ai_qa client kodu Layout’ta (`Layout.tsx:6`, `ChatWidget.tsx:31`).

---

## ÖNERİLEN AKSİYON SIRASI

*(En yüksek etki / en düşük risk üstte — yalnızca öneri, bu raporda kod değişikliği yok)*

1. **P0 — Register `organizations` INSERT’i migration şemasına hizala** (`legal_name`, `display_name`, `slug`, `organization_members` owner satırı); `owner_user_id` kullanımını kaldır.  
   *Etki: R14 müteahhit kayıt akışı; risk: düşük (dar SQL+form).*

2. **P0 — MuteahhitPanel org sorgusunu `organization_members` join’e çevir**; `/login` → `/giris` link düzeltmesi.  
   *Etki: panel ruhsat banner; risk: çok düşük.*

3. **P1 — Oturum tek kaynak:** `Profile` / `dashboard` → `useAuth()`; `ihaleal_user` legacy migrasyon planı.  
   *Etki: güvenlik + UX; risk: orta (oturum birleştirme).*

4. **P1 — `publishUnitAsListing` için RPC veya RLS WITH CHECK:** owner + verified ruhsat + KYC politikası netleştir.  
   *Etki: I-1 bütünlüğü; risk: orta (DB migration gerekebilir).*

5. **P1 — Teklif yolu standardizasyonu:** `place_bid` RPC **veya** Edge `place-bid` — ikisini birleştir.  
   *Etki: ihale güvenilirliği; risk: orta.*

6. **P2 — Route guard bileşeni:** `/ihale-ac`, `/muteahhit/*`, `/kurumsal/dashboard` için ortak `AuthGuard` (RLS’yi tamamlayıcı).  
   *Etki: derin link sızıntısı azaltır; risk: düşük.*

7. **P2 — Edge Functions envanteri:** kullanılmayan 7 fonksiyon için deploy kaldır veya frontend bağla (ödeme/KYC).  
   *Etki: operasyonel netlik; risk: düşük (dokümantasyon).*

8. **P2 — ai_qa prod checklist:** `OPENAI_API_KEY` secret, rate limit, `verify_jwt` explicit config.  
   *Etki: 502 azaltma; risk: düşük.*

9. **P3 — Demo/mock borç:** 517+115 eşleşme; prod bayrakları (`runtimeFlags`) ile ayrıştırma planı.  
   *Etki: güven kullanıcı algısı; risk: düşük.*

10. **P3 — Test drift:** `Home.test.tsx` h1 beklentisi vs `PremiumCinematicHome` Türkçe slogan — CI kırığı.  
    *Etki: verify yeşil; risk: çok düşük.*

---

## ÇAKIŞMA / COMMIT NOTU

- Bu dosya **yalnızca** `_audit/DERIN_ANALIZ_2026_05_30.md` olarak oluşturuldu.  
- **Git commit/push yapılmadı** (talimat).  
- Önerilen commit (Master):  
  `git add _audit/DERIN_ANALIZ_2026_05_30.md && git commit -m "audit: R14 derin kılcal analiz"`

---

*Rapor salt okunur tarama ile üretildi; uzak Supabase/Vercel runtime durumu (migration uygulanmış mı, Edge secret dolu mu) canlı ortamda doğrulanmadı.*
