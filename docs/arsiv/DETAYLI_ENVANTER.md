# ihaleal — Detaylı Envanter Raporu

**Tarih:** 2026-05-18 03:32
**Branch:** `fix/verified-intelligence-core`
**Son commit:** `6d36860 feat(ges): land evaluation engineering and legal compliance suite`
**Git durumu:** `## fix/verified-intelligence-core` (+ çok sayıda yerel değişiklik, commit edilmemiş)
**Canlı bundle (prod):** `index-B8quZ-Y0.js` (SPA shell; yerel build farklı olabilir)

> Bu rapor **salt okunur** tarama ile üretilmiştir. Kodda değişiklik yapılmamıştır.

---

## Özet

| Alan | Durum |
|------|--------|
| Frontend sayfa dosyası | **93** adet `.tsx` (`src/pages`) |
| TypeScript/TSX (`src/`) | **399** dosya |
| CSS (`src/`) | **6** dosya |
| Supabase migration | **25** SQL dosyası |
| Edge Function (deployable) | **11** fonksiyon + `_shared` |
| Test dosyası | **32** (vitest + playwright smoke) |
| `npm run test:run` | **140 geçti**, 2 atlandı |
| `npm run typecheck` | **Geçti** |
| `npm run lint` | **Geçti** |
| Production HTTP (test edilen rotalar) | **23/23 → 200** |

**Kritik not:** Çalışma kopyası `fix/verified-intelligence-core` dalında; premium dark theme (`global-dark.css`, `HomeStats`, `HomeCorporateCta`) ve birçok UI değişikliği **henüz commit/push edilmemiş**. Canlı site (`ihaleal.vercel.app`) muhtemelen daha eski bir build sunuyor.

---

## 1. FRONTEND SAYFA ENVANTERİ

### Tüm Page Dosyaları (93)

| Dosya | Satır | Son Git Değişiklik | Not |
|-------|-------|-------------------|-----|
| `src/pages/About.tsx` | 48 | 2026-05-16 |  |
| `src/pages/AdCampaign.tsx` | 183 | 2026-05-16 |  |
| `src/pages/admin/AdminDashboard.tsx` | 246 | 2026-05-17 |  |
| `src/pages/Analytics.tsx` | 949 | 2026-05-17 |  |
| `src/pages/Anayasa400.tsx` | 411 | 2026-05-16 |  |
| `src/pages/auction/BuyNow.tsx` | 138 | 2026-05-16 |  |
| `src/pages/AuctionDetail.tsx` | 1411 | 2026-05-17 |  |
| `src/pages/AuctionListPage.tsx` | 5 | 2026-05-06 | İnce sarmalayıcı / redirect |
| `src/pages/auth/EDevletAuth.tsx` | 54 | 2026-05-16 |  |
| `src/pages/auth/Login.tsx` | 232 | 2026-05-16 |  |
| `src/pages/auth/PasswordReset.tsx` | 63 | 2026-05-16 |  |
| `src/pages/auth/Register.tsx` | 223 | 2026-05-16 |  |
| `src/pages/BusinessModel.tsx` | 340 | 2026-05-16 |  |
| `src/pages/Changelog.tsx` | 196 | 2026-05-16 |  |
| `src/pages/CitiesList.tsx` | 221 | 2026-05-16 |  |
| `src/pages/CityGuide.tsx` | 448 | 2026-05-16 |  |
| `src/pages/CityLanding.tsx` | 114 | 2026-05-17 |  |
| `src/pages/Compare.tsx` | 297 | 2026-05-16 |  |
| `src/pages/CompetitorComparison.tsx` | 313 | 2026-05-16 |  |
| `src/pages/Corporate.tsx` | 252 | 2026-05-17 |  |
| `src/pages/CorporateContact.tsx` | 146 | 2026-05-17 |  |
| `src/pages/CreateAuction.tsx` | 760 | 2026-05-16 |  |
| `src/pages/dashboard/InvestorDashboard.tsx` | 232 | 2026-05-17 |  |
| `src/pages/dashboard/index.tsx` | 200 | 2026-05-17 |  |
| `src/pages/DataStrategy.tsx` | 118 | 2026-05-16 |  |
| `src/pages/DisasterRecovery.tsx` | 204 | 2026-05-16 |  |
| `src/pages/Documents.tsx` | 156 | 2026-05-16 |  |
| `src/pages/DocumentsRequired.tsx` | 205 | 2026-05-16 |  |
| `src/pages/EmlakciGiris.tsx` | 380 | 2026-05-17 |  |
| `src/pages/ErrorPage.tsx` | 41 | 2026-05-16 |  |
| `src/pages/Expertise.tsx` | 214 | 2026-05-16 |  |
| `src/pages/Favorites.tsx` | 173 | 2026-05-16 |  |
| `src/pages/FinCompliancePlayground.tsx` | 159 | 2026-05-05 |  |
| `src/pages/ges/GesLandEvaluationPage.tsx` | 19 | 2026-05-17 | İnce sayfa |
| `src/pages/Guide.tsx` | 134 | 2026-05-16 |  |
| `src/pages/Home.tsx` | 23 | 2026-05-17 |  |
| `src/pages/Iletisim.tsx` | 9 | 2026-05-01 | İnce sarmalayıcı / redirect |
| `src/pages/ibuyer/IBuyerPage.tsx` | 23 | 2026-05-17 |  |
| `src/pages/intelligence/GesAnalysisPage.tsx` | 229 | 2026-05-17 |  |
| `src/pages/intelligence/IntelligenceHub.tsx` | 162 | 2026-05-17 |  |
| `src/pages/intelligence/LandInvestmentPage.tsx` | 5 | 2026-05-17 | İnce sarmalayıcı / redirect |
| `src/pages/intelligence/ParcelIntelligencePage.tsx` | 220 | 2026-05-17 |  |
| `src/pages/intelligence/WarRoomPage.tsx` | 200 | 2026-05-17 |  |
| `src/pages/legal/AgencyContractView.tsx` | 81 | 2026-05-16 |  |
| `src/pages/legal/AydinlatmaMetni.tsx` | 30 | 2026-05-01 |  |
| `src/pages/legal/FraudDefenseArchitecturePage.tsx` | 173 | 2026-05-16 |  |
| `src/pages/legal/IadeIptal.tsx` | 24 | 2026-05-01 |  |
| `src/pages/legal/KullanimKosullari.tsx` | 53 | 2026-05-05 |  |
| `src/pages/legal/MesafeliSatisSozlesmesi.tsx` | 33 | 2026-05-01 |  |
| `src/pages/legal/SupabaseComplianceChecklistPage.tsx` | 88 | 2026-05-16 |  |
| `src/pages/LegalAuctionTerms.tsx` | 191 | 2026-05-16 |  |
| `src/pages/LegalCookies.tsx` | 59 | 2026-05-16 |  |
| `src/pages/LegalFramework.tsx` | 97 | 2026-05-16 |  |
| `src/pages/LegalKVKK.tsx` | 104 | 2026-05-16 |  |
| `src/pages/LegalMasterBrief.tsx` | 133 | 2026-05-16 |  |
| `src/pages/LegalPrivacy.tsx` | 108 | 2026-05-16 |  |
| `src/pages/LiveAuctions.tsx` | 48 | 2026-05-17 |  |
| `src/pages/Login.tsx` | 1 | 2026-04-28 | İnce sarmalayıcı / redirect |
| `src/pages/MapPage.tsx` | 167 | 2026-05-17 |  |
| `src/pages/mega/BlogIndex.tsx` | 89 | 2026-05-16 |  |
| `src/pages/mega/BlogPost.tsx` | 55 | 2026-05-01 |  |
| `src/pages/mega/CommissionCalculator.tsx` | 406 | 2026-05-16 |  |
| `src/pages/mega/DigitalContracts.tsx` | 56 | 2026-05-16 |  |
| `src/pages/mega/FrequentQuestions.tsx` | 69 | 2026-05-16 |  |
| `src/pages/mega/Glossary.tsx` | 32 | 2026-05-16 |  |
| `src/pages/mega/KkaParselStudioPage.tsx` | 426 | 2026-05-16 |  |
| `src/pages/mega/KycSimulation.tsx` | 104 | 2026-05-16 |  |
| `src/pages/mega/LandEquityPage.tsx` | 267 | 2026-05-16 |  |
| `src/pages/mega/RealtorPartnership.tsx` | 248 | 2026-05-16 |  |
| `src/pages/membership/YillikUyelik.tsx` | 117 | 2026-05-16 |  |
| `src/pages/Messages.tsx` | 355 | 2026-05-16 |  |
| `src/pages/Mortgage.tsx` | 255 | 2026-05-16 |  |
| `src/pages/NasilCalisir.tsx` | 305 | 2026-05-16 |  |
| `src/pages/NihaiAnayasa.tsx` | 267 | 2026-05-16 |  |
| `src/pages/NotFound.tsx` | 19 | 2026-05-17 |  |
| `src/pages/onboarding/FlowSelector.tsx` | 119 | 2026-05-16 |  |
| `src/pages/OperationalReadiness.tsx` | 57 | 2026-05-16 |  |
| `src/pages/PreLaunch.tsx` | 96 | 2026-05-16 |  |
| `src/pages/Profile.tsx` | 138 | 2026-05-16 |  |
| `src/pages/RealtorProfile.tsx` | 199 | 2026-05-16 |  |
| `src/pages/Realtors.tsx` | 94 | 2026-05-16 |  |
| `src/pages/Register.tsx` | 1 | 2026-04-28 | İnce sarmalayıcı / redirect |
| `src/pages/ReportDetail.tsx` | 50 | 2026-05-16 |  |
| `src/pages/Reports.tsx` | 63 | 2026-05-16 |  |
| `src/pages/SearchResults.tsx` | 125 | 2026-05-16 |  |
| `src/pages/SecurityCenter.tsx` | 253 | 2026-05-16 |  |
| `src/pages/SellerHub.tsx` | 159 | 2026-05-16 |  |
| `src/pages/services/HizmetBedelleri.tsx` | 63 | 2026-05-16 |  |
| `src/pages/Settings.tsx` | 147 | 2026-05-16 |  |
| `src/pages/SSS.tsx` | 70 | 2026-05-01 |  |
| `src/pages/TaxSimulatorPage.tsx` | 189 | 2026-05-04 |  |
| `src/pages/UserPanel.tsx` | 142 | 2026-05-16 |  |
| `src/pages/ValuationTool.tsx` | 270 | 2026-05-17 |  |

### Önemli Rota Eşlemeleri (`App.tsx`)

| Canlı URL | Bileşen | Durum |
|-----------|---------|--------|
| `/` | Home | Premium dark (yerel, commit dışı olabilir) |
| `/ilanlar` | → /auctions | Redirect |
| `/auctions` | AuctionListPage → Auctions section | Demo katalog |
| `/how-it-works` | NasilCalisir | Koyu tema (yerel) |
| `/nasil-calisir` | → /how-it-works | Redirect |
| `/services` | Corporate | Kurumsal ana |
| `/kurumsal` | → /services | Redirect |
| `/arastirma` | IntelligenceHub | Kurumsal ticker, hub kartları |
| `/arastirma/ges` | GesAnalysisPage | GES motor + fraud |
| `/arastirma/parsel` | ParcelIntelligencePage | Parsel motor |
| `/arastirma/war-room` | WarRoomPage | Harita + site intelligence |
| `/arastirma/yatirim` | LandInvestmentPage | Sadece hub redirect |
| `/aninda-teklif` | IBuyerPage | iBuyer / trade-in |
| `/ibuyer` | → /aninda-teklif | Redirect |
| `/ges-analiz-arazi` | GesLandEvaluationPage | Layout dışı route |
| `/giris` | auth/Login | Supabase Auth |
| `/admin` | AdminDashboard | AdminGuard |
| `/kurumsal/dashboard` | OrganizationDashboard | RPC org_dashboard_stats |

---

## 2. CANLI SAYFA TESTLERİ

**Yöntem:** `GET https://ihaleal.vercel.app{path}` — yalnızca HTML shell (Vite SPA). React render sonrası içerik bu testle görülmez.

| URL | HTTP | Shell İçerik | Tasarım (shell) |
|-----|------|--------------|-----------------|
| `/` | 200 | Mojibake | Beyaz |
| `/ilanlar` | 200 | Mojibake | Beyaz |
| `/auctions` | 200 | Mojibake | Beyaz |
| `/harita` | 200 | Mojibake | Beyaz |
| `/karsilastir` | 200 | Mojibake | Beyaz |
| `/favoriler` | 200 | Mojibake | Beyaz |
| `/degerleme` | 200 | Mojibake | Beyaz |
| `/mortgage` | 200 | Mojibake | Beyaz |
| `/giris` | 200 | Mojibake | Beyaz |
| `/kayit` | 200 | Mojibake | Beyaz |
| `/kurumsal` | 200 | Mojibake | Beyaz |
| `/kurumsal/iletisim` | 200 | Mojibake | Beyaz |
| `/kurumsal/dashboard` | 200 | Mojibake | Beyaz |
| `/arastirma` | 200 | Mojibake | Beyaz |
| `/arastirma/war-room` | 200 | Mojibake | Beyaz |
| `/arastirma/ges` | 200 | Mojibake | Beyaz |
| `/arastirma/parsel` | 200 | Mojibake | Beyaz |
| `/arastirma/yatirim` | 200 | Mojibake | Beyaz |
| `/admin` | 200 | Mojibake | Beyaz |
| `/nasil-calisir` | 200 | Mojibake | Beyaz |
| `/how-it-works` | 200 | Mojibake | Beyaz |
| `/services` | 200 | Mojibake | Beyaz |
| `/aninda-teklif` | 200 | Mojibake | Beyaz |

**Yorum:** Tüm rotalar **200**. `Mojibake` uyarısı muhtemelen **yanlış pozitif** (UTF-8 Türkçe meta/script ile `Ã§` pattern çakışması). `Beyaz` tespiti shell'de `bg-white` class geçmesinden; gerçek tema client-side yüklenir. Dark theme doğrulaması için tarayıcı + güncel deploy gerekir.

---

## 3. SUPABASE BACKEND

### Migration Dosyaları (kod tarafında — 25 adet)

| Dosya | Satır | Özet |
|-------|-------|------|
| `20260428120000_initial_schema.sql` | 108 | İlk şema (listings, profiles, bids…) |
| `20260428120100_rls_policies.sql` | 53 | RLS politikaları |
| `20260428120200_place_bid_function.sql` | 52 | place_bid (eski; sonraki migration ile superseded) |
| `20260429120000_profiles_extra_fields.sql` | 12 | Profil alanları |
| `20260429120100_bid_bonds_and_antisniping.sql` | 116 | Teminat + anti-sniping + place_bid |
| `20260429120200_listings_rls_strict.sql` | 15 | Listings INSERT sıkı RLS |
| `20260429120300_audit_log.sql` | 22 | Audit trail |
| `20260429120400_memberships_service_fees_authorizations.sql` | 143 | Üyelik, komisyon, yetkiler |
| `20260429140000_listings_insert_kyc_edevlet_idempotent.sql` | 13 | KYC / e-Devlet idempotent |
| `20260430120000_write_policies_and_place_bid_v2.sql` | 273 | Write RLS + place_bid v2 |
| `20260430140000_pre_launch_signups.sql` | 25 | Lansman e-posta kayıtları |
| `20260430150000_profiles_role_place_bid_antisniping.sql` | 68 | profiles.role + admin |
| `20260501120000_ai_buynow_deposit.sql` | 420 | AI rapor, hemen al, blokaj |
| `20260502120000_profiles_rls_recursion_service_grants.sql` | 27 | RLS recursion düzeltme |
| `20260504140000_chat_messages_compliance_stub.sql` | 121 | Sohbet + uyum kuyruğu (TASLAK) |
| `20260516120000_admin_listing_security.sql` | 50 | Admin ilan onayı RPC |
| `20260516120000_v2_core_safety_additive.sql` | 56 | v2 core safety |
| `20260516120100_v2_multi_tenant.sql` | 83 | Multi-tenant (organization_id) |
| `20260516120200_v2_liquidity.sql` | 66 | buyer_preferences |
| `20260516120300_v2_kyc_moderation_bulk.sql` | 82 | kyc_verifications |
| `20260516120400_v2_pgmq_matching.sql` | 48 | pgmq + matching cron |
| `20260517140000_land_ges_intelligence.sql` | 23 | Engineering analysis runs |
| `20260517150000_engineering_war_room.sql` | 23 | War room analysis types |
| `20260518120000_ibuyer_trade_in.sql` | 282 | iBuyer & trade-in modülü |
| `20260518140000_ges_land_evaluation.sql` | 346 | GES arazi değerlendirme tabloları |

**Önemli:** Migration dosyaları repoda mevcut; **production Supabase projesine uygulanıp uygulanmadığı** bu raporla doğrulanmadı. `npm run supabase:push` / Dashboard kontrolü gerekir.

### Edge Functions

| Function | Dosya | Son Git | Not |
|----------|-------|---------|-----|
| `ai-price-estimate` | index.ts | 2026-05-16 | AI fiyat tahmini |
| `ai_qa` | config.toml only? | 2026-05-05 | Yapılandırma |
| `bulk-listing-ingest` | index.ts | 2026-05-16 | Toplu ilan |
| `kyc-submit` | index.ts | 2026-05-16 | KYC gönderim |
| `matching-fanout` | index.ts | 2026-05-16 | Eşleştirme |
| `place-bid` | index.ts | 2026-05-16 | Teklif (yeni isim) |
| `place_bid` | index.ts | 2026-05-17 | Teklif (eski isim — çift) |
| `post_chat_message` | index.ts | 2026-05-17 | Sohbet |
| `pvgis_solar` | index.ts | 2026-05-17 | PVGIS proxy |
| `tcmb_yiufe` | index.ts | 2026-05-17 | TCMB endeks |
| `payments-iyzico` | **yalnızca config.toml** | 2026-05-17 | **Kod yok** |
| `payments-paytr` | **yalnızca config.toml** | 2026-05-17 | **Kod yok** |

`_shared/`: auth, cors, env, http, idempotency, logger, permissions, supabase, ihalealKnowledge

### Seed

- `supabase/seed/demo_seed.sql` — Kurumsal emlak ofisi tarzı org + ~7 demo listing (`is_demo=true`); profiles boşsa listing atlanır.

### Prisma (dokümantasyon / codegen — runtime DB değil)

| Model | Amaç |
|-------|------|
| CorporateOffice, CorporateAgent | Kurumsal ofis/ajan (eski Prisma model adı) |
| PropertySubmission | Başvuru |
| LegalRiskAssessment | Hukuki risk |
| GesTechnicalAnalysis, ParcelAnalysis | Mühendislik çıktıları |

Runtime veritabanı: **Supabase PostgreSQL**.

---

## 4. INTELLIGENCE & ENGINEERING MOTORLAR

### `src/lib/engineering` (seçilmiş)

| Modül | Satır | Açıklama |
|-------|-------|----------|
| `ges/gesEngineFeasibility.ts` | 206 | Arazi GES fizibilite + IRR |
| `ges/gesEngine.ts` | 263+ | Legacy TRY GES |
| `parcel/parcelEngineFeasibility.ts` | 88 | Parsel fizibilite |
| `safeCalc.ts` | 184 | Güvenli sarmalayıcılar, ön fizibilite sabitleri |
| `urban/siteIntelligence.ts` | 122 | War Room site skoru |
| `reports/markdownReports.ts` | 72 | Markdown rapor export |
| `reports/institutionalReport.ts` | 66 | Kurumsal site raporu |
| `persistence/analysisRuns.ts` | 75 | Supabase analysis run kayıt |
| `seismic/seismicEngine.ts` | 89 | Sismik |
| `disaster/disasterRisk.ts` | 92 | Afet riski (heuristic) |

### `src/lib/security`

| Dosya | Açıklama |
|-------|----------|
| `fraudEngine.ts` | `auditSubmissionData()` — emsal > 3.5, arazi > 5M m² blok |

### Data adapter'ları (`src/lib/data`)

| Dosya | Rol |
|-------|-----|
| `pvgisClient.ts` | PVGIS API |
| `openMeteoClient.ts` | Hava / iklim |
| `elevationClient.ts` | Rakım |
| `siteEnvironmentalData.ts` | Birleşik çevre verisi |

### UI — Intelligence sayfaları

| Sayfa | Durum |
|-------|--------|
| IntelligenceHub | Hub + Kurumsal ticker, kartlar |
| GesAnalysisPage | Form + motor + PreFeasibilityBanner |
| ParcelIntelligencePage | Parsel analizi |
| WarRoomPage | Harita (lazy), site intelligence, geçmiş run — **işlevsel**; Palantir seviye görsel tasarım değil |
| LandInvestmentPage | **Sadece redirect** → `/arastirma` |
| GesLandEvaluationPage | İnce sayfa (19 satır) |
| IBuyerPage | Trade-in / anında teklif |

---

## 5. TESTLER

**Test dosyası sayısı:** 32

### `npm run test:run` sonucu

```
Test Files  29 passed | 1 skipped (30)
     Tests  140 passed | 2 skipped (142)
  Duration  ~41s
```

Atlanan: muhtemelen canlı PVGIS entegrasyonu (CORS / ağ).

Ek: `tests/core.test.cjs`, Playwright smoke (`tests/smoke/*.spec.ts`), RLS contract testleri.

---

## 6. BUILD & LINT

### TypeScript (`npm run typecheck`)

```
tsc --noEmit → hata yok
```

### Lint (`npm run lint`)

```
eslint . --max-warnings 0 → geçti
```

### Build (`npm run build` — önceki oturumda doğrulandı)

- Vite 6 production build başarılı
- CSS minify uyarısı: `Expected identifier but found "-"` (kritik değil)

---

## 7. PROJE YAPISI ÖZETİ

### `src/` üst dizinler

```
components, constants, contexts, data, emails, features, hooks, legal, lib, pages, sections, styles, test, types
```

### Dosya sayıları

- TypeScript/TSX (`src/`): **399**
- CSS (`src/`): **6**
- Toplam (node_modules, .git, dist hariç): **~1114**

---

## 8. KOD İÇİ TODO / FIXME

**Gerçek `TODO`/`FIXME` yorumu:** kod taramasında **bulunamadı** (yalnızca placeholder metinlerinde "XXX" geçiyor).

---

## 9. STUB / DEMO / YARIM SAYFALAR

### Demo veri stratejisi (`src/lib/dataStrategy.ts`)

`isDemoData()` ile işaretlenen kaynaklar: `aiValuation`, `auctionSeed`, `demoBanner`, `authMock`, `flowOnboarding`, vb.

### Demo içerik dosyaları

- `src/data/demoAuctionCatalog.ts` — ilan listeleri
- `src/data/realtorsDemo.ts`, `reportsDemo.ts`
- `supabase/seed/demo_seed.sql` — DB seed (sınırlı)

### Açıkça demo / yakında ifadeleri

| Konum | İfade |
|-------|--------|
| `SubmissionForm.tsx`, `GesEvaluationForm.tsx` | "Demo modu: Supabase yapılandırılmadı…" |
| `EDevletAuth.tsx` | e-Devlet yetkisi **(DEMO)** |
| `UserPanel.tsx` | Bazı sekmeler "yakında tamamlanacak" |
| `Profile.tsx`, `Settings.tsx` | MFA / telefon doğrulama **Yakında** |
| `CreateAuction.tsx` | "Harita entegrasyonu yakında" |
| `aiAnalysis.ts` | `generateRealReport henüz bağlı değil` |

### Backup dosyaları

```
docs/ui-snapshots-old/App.tsx.bak
docs/ui-snapshots-old/Hero.tsx.bak
docs/ui-snapshots-old/Navbar.tsx.bak
```

---

## 10. DEPLOYMENT & DevOps

### Vercel (`vercel.json`)

- Framework: Vite
- Build: `node scripts/vite-build-safe.mjs`
- SPA rewrite: `/(.*) → /index.html`
- Güvenlik başlıkları: CSP, HSTS, X-Frame-Options
- `DISABLE_PWA=1` build env

### GitHub Actions

| Workflow | Amaç |
|----------|------|
| `ci.yml` | typecheck, encoding, env validate, test, build, lint |
| `deploy-vercel.yml` | Vercel deploy |
| `supabase-v2-deploy.yml` | Supabase migration / edge deploy |

### package.json — önemli scriptler

- `verify` — typecheck + encoding + env + test + build
- `supabase:push` — `supabase db push`
- `test:smoke` — Playwright
- `precheck:encoding` — UTF-16 bozulma kontrolü

---

## 11. ENVIRONMENT VARIABLES

### Frontend (`import.meta.env`)

| Değişken | Kullanım |
|----------|----------|
| `VITE_SUPABASE_URL` | Supabase client |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon |
| `VITE_SENTRY_DSN` | Sentry (opsiyonel) |
| `VITE_PAYMENT_MODE` | Ödeme modu |
| `VITE_ALLOW_LOCAL_AUTH` | Yerel demo auth kapısı |

### Observability

- `@sentry/react` + `initObservability.ts` — DSN varsa prod'da aktif

---

## 12. YAPILANLAR (kanıtlı)

### A. Platform çekirdeği

- [x] Vite 6 + React 19 + React Router 7 + Tailwind
- [x] 90+ sayfa, lazy loading, Layout/Navbar/Footer
- [x] Supabase Auth entegrasyonu (`AuthContext`, Login/Register)
- [x] Admin panel (`AdminGuard`, `/admin`)
- [x] Çok kiracılı kurumsal dashboard iskeleti (`OrganizationDashboard`, RPC)

### B. İhale / ilan

- [x] `AuctionDetail` (~1400 satır): canlı ihale, **kapalı teklif** (`sealed_offers`), hemen al
- [x] `CreateAuction`: mod seçimi (listing / sealed / auction)
- [x] `place_bid` / `place-bid` edge functions + DB fonksiyonları
- [x] Demo ihale kataloğu + `Auctions` section

### C. Intelligence / mühendislik

- [x] `/arastirma` hub + GES + parsel + war room rotaları
- [x] GES/parsel fizibilite motorları + `safeCalc` + ön fizibilite banner
- [x] Fraud engine (emsal / arazi limitleri)
- [x] War Room: harita, site intelligence, markdown rapor, analysis run persistence
- [x] iBuyer / trade-in migration + sayfa
- [x] Prisma modelleri (kurumsal ofis, submission, GES, parcel)

### D. Hukuk / içerik

- [x] KVKK (`/kvkk`), gizlilik, çerez, ihale koşulları
- [x] Kullanım koşulları, mesafeli satış, iade, aydınlatma, **SSS** (`/sss`)
- [x] Hakkımızda (`/hakkimizda`), blog, sözlük, komisyon hesaplayıcı
- [x] Anayasa 400 / nihai anayasa sayfaları

### E. UI (yerel — commit dışı olabilir)

- [x] `global-dark.css` global override
- [x] Ana sayfa premium section'lar: Hero, HomeStats, LiveAuctionsShowcase, HomeCorporateCta
- [x] `NasilCalisir` koyu zemin

### F. Kalite

- [x] 140 unit test geçiyor
- [x] typecheck + lint temiz
- [x] Encoding check script (`precheck:encoding`)

---

## 13. YAPILMAYANLAR / YARIM KALANLAR

### A. UI/UX

| Madde | Kanıt | Öncelik |
|-------|--------|---------|
| Premium dark theme **canlıda** | Yerel commit dışı; prod bundle eski | Yüksek |
| War Room Palantir seviye UI | İşlev var, görsel basit | Orta |
| Profesyonel PDF rapor | Markdown export var | Orta |
| 50–100 demo ilan | Katalog + seed sınırlı (~7–24) | Orta |
| Mobile son rötuş | Kısmi responsive | Orta |
| `/arastirma/yatirim` gerçek sayfa | Yalnızca redirect | Düşük |

### B. Backend / veri

| Madde | Kanıt | Öncelik |
|-------|--------|---------|
| Migration'ların prod'a uygulanması | Doğrulanmadı | **Kritik** |
| Edge function deploy (tümü) | CI workflow var; durum belirsiz | **Kritik** |
| `payments-*` edge | Sadece config.toml | Yüksek |
| `place_bid` vs `place-bid` çifti | İki klasör | Orta |
| PVGIS / AFAD / Tapu resmi API | Client + heuristic | Orta |
| Storage bucket'lar (KYC, bulk) | Kod referansı; bucket doğrulanmadı | Yüksek |

### C. Auth / üyelik

| Madde | Kanıt | Öncelik |
|-------|--------|---------|
| Auth "gerçek" prod akışı | Env + Supabase projesi gerekli | Yüksek |
| KYC tam UI akışı | `kyc-submit` var; `KycSimulation` demo | Yüksek |
| Org switching UI | `useActiveOrg` var; UX eksik olabilir | Orta |
| MFA / telefon | "Yakında" etiketleri | Orta |

### D. İş mantığı

| Madde | Kanıt | Öncelik |
|-------|--------|---------|
| Gerçek ilan hacmi | Demo ağırlıklı | Yüksek |
| Canlı bidding prod testi | Edge + RLS gerekli | Yüksek |
| AI fiyat gerçek model | `ai-price-estimate` + demo fallback | Orta |
| `generateRealReport` | Throw — mock only | Orta |

### E. DevOps

| Madde | Kanıt | Öncelik |
|-------|--------|---------|
| `main` ile feature branch birleşmesi | `fix/verified-intelligence-core` + dirty tree | **Kritik** |
| Custom domain ihaleal.com | Vercel DNS — doğrulanmadı | Orta |
| Sentry prod DSN | Kod hazır; env belirsiz | Orta |
| Analytics (PostHog vb.) | Yok | Düşük |

---

## 14. BİLİNEN RİSKLER

| Risk | Etki | Azaltma |
|------|------|---------|
| **UTF-16 dosya bozulması (Windows)** | Build kırılır (`\x00`) | `precheck:encoding`, PowerShell UTF-8 yazım |
| **Commit edilmemiş büyük diff** | Kayıp / prod uyumsuzluk | Branch merge + deploy disiplini |
| **Migration drift** | Prod DB şema uyumsuz | `supabase db push` + checklist |
| **Demo veri ile canlı karışması** | Yanlış beklenti | `is_demo`, DemoBanner |
| **Çift place_bid function** | Yanlış endpoint deploy | Tek isimde konsolidasyon |
| **CSP / harici API** | PVGIS CORS testte blok | Edge proxy (`pvgis_solar`) |
| **Ödeme edge eksik** | Checkout çalışmaz | payments-* implementasyonu |
| **SPA curl testi yanıltıcı** | Tema/404 shell'de görünmez | Playwright smoke + manuel QA |
| **Gizli token sızıntısı** | Güvenlik | Token rotate; repoya koymama |

---

## 15. ÖNERİLEN ÖNCELİK SIRASI

### Sprint 1 — Temel tamamlama (≈1 hafta)

1. `fix/verified-intelligence-core` → `main` merge + Vercel prod deploy
2. Supabase migrations + edge functions production doğrulama
3. `VITE_*` production env + Sentry DSN
4. Demo seed genişletme (30–50 ilan)
5. Auth/KYC smoke test (gerçek proje)

### Sprint 2 — Kurumsal (≈1 hafta)

1. Organization dashboard veri doldurma
2. Bulk listing ingest
3. KYC UI tam akış
4. Ödeme edge (iyzico/paytr) kod

### Sprint 3 — Intelligence (≈2 hafta)

1. War Room görsel yenileme
2. PDF rapor motoru
3. PVGIS prod entegrasyon testi
4. `/arastirma/yatirim` gerçek terminal

### Sprint 4 — Production hazırlık (≈1 hafta)

1. Custom domain
2. Playwright smoke CI'da zorunlu
3. Performance / bundle budget
4. Load test

---

## Ek: Audit artefaktları

- `_audit/envanter/00.log` — hazırlık log
- `_audit/envanter/pages.json` — sayfa metrikleri
- `_audit/envanter/live.json` — canlı HTTP testleri
- `_audit/envanter/test.log`, `tsc.log`, `lint.log`

---

*Rapor sonu.*
