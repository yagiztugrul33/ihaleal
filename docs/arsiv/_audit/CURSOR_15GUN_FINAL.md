# Cursor 15 gün final raporu (M0–M14)

**Tarih:** 2026-06-01 · **Dal:** `main` · **Son commit:** `9a5e2a3`

---

## Özet sayılar

| Metrik | Değer |
|--------|--------|
| M2–M14 sprint commit (push) | **18** (M10–M14 bu oturum: 6) |
| Mock → gerçek / gizle | **4** canlı bağlantı + **2** prod gizleme (rapor: `_audit/MOCK_TEMIZLIK_RAPORU.md`) |
| Yeni özellik paketleri | M6 detay, M7 offers, M10 saved search, M11 SEO breadcrumb, M13 onboarding |
| `npm run verify` | **PASS** (typecheck + encoding + test:run 195/197 + build) |
| `npm run smoke` | **36/36 PASS** (18 rota × desktop + iPhone 13) |

---

## M0–M14 durum tablosu

| Komut | Durum | Commit(ler) | Kanıt dosya:satır |
|-------|--------|-------------|-------------------|
| M0 storage + borsa migration | ✅ | `12d6711` | `supabase/migrations/20260601140000_storage_buckets.sql`, `20260601150000_borsa_index.sql` |
| M1 (M0 ile birlikte) | ✅ | `12d6711` | aynı |
| M2 güven (yorum/KYC/mesaj) | ✅ | `35c0cc6` | `supabase/migrations/20260601160000_listing_reviews.sql` |
| M3 harita liste/harita | ✅ | `77cf037` | `src/pages/Auctions.tsx` Leaflet toggle |
| M4 doping + view_count | ✅ | `8b9bc69` | `supabase/migrations/20260601170000_listing_doping_analytics.sql` |
| M5 AVM + Benim İçin Bul | ✅ | `3bbb21e` | `src/components/listing/AvmEstimateSection.tsx` |
| M6 ilan detay zenginlik | ✅ | `396a480` | POI, benzer ilan, kredi widget |
| M7 teklif/pazarlık offers | ✅ | `0691ede` | `supabase/migrations/20260601180000_listing_offers.sql`, `src/lib/offers/*` |
| M8 verify + testler | ✅ | `16325f1` | `Navbar.test.tsx`, `Home.test.tsx`, `uploadFile.test.ts`, `useFavorites.test.ts` |
| M9 mobil + PWA notu | ✅ | `765ff93`, `279ae75`, `2509aa6` | `_audit/PWA_NOTU.md` |
| M10 favori + kayıtlı arama | ✅ | `a4615b5` | `20260601190000_saved_searches.sql`, `InvestorDashboard.tsx:39-58` |
| M11 SEO derinlik | ✅ | `585b61c` | `PageBreadcrumbs.tsx`, `seo.ts:211-230`, `AuctionDetail.tsx` breadcrumb |
| M12 mock temizlik | ✅ | `c318b41` | `NotificationBell.tsx`, `_audit/MOCK_TEMIZLIK_RAPORU.md` |
| M13 lansman parlatma | ✅ | `9a5e2a3` | `NotFound.tsx`, `ErrorPage.tsx`, `OnboardingTip.tsx` |
| M14 final rapor | ✅ | *(bu commit)* | `_audit/CURSOR_15GUN_FINAL.md` |

---

## CC-apply bekleyen migration’lar (Master Claude Code — TEK tur sıra)

| Sıra | Dosya | İçerik |
|------|--------|--------|
| 1 | `supabase/migrations/20260601140000_storage_buckets.sql` | Storage bucket RLS |
| 2 | `supabase/migrations/20260601150000_borsa_index.sql` | Borsa index tabloları |
| 3 | `supabase/migrations/20260601160000_listing_reviews.sql` | Rating / listing_reviews |
| 4 | `supabase/migrations/20260601170000_listing_doping_analytics.sql` | `is_featured`, `view_count` |
| 5 | `supabase/migrations/20260601180000_listing_offers.sql` | Teklif/pazarlık `listing_offers` |
| 6 | `supabase/migrations/20260601190000_saved_searches.sql` | Kayıtlı arama + `notif_owner_insert` |

**Not:** `Register.tsx` + `20260530200000_register_contractor_org_rpc.sql` ve core RLS (`place-bid`, kyc, listings-auctions) dokunulmadı.

---

## Verify kanıtı (2026-06-01)

```
npm run verify → exit 0
  typecheck: PASS
  precheck:encoding: 625 dosya OK
  test:run: 47 files, 195 passed, 2 skipped
  build: PASS (~30s)
```

Smoke (son M13 kapısı): **SMOKE PASS (36/36)** — `scripts/smoke.mjs`, BASE=`https://www.ihaleal.com`

---

## Lansman go/no-go (`docs/LAUNCH_CHECKLIST.md`)

| Madde | Durum | Not |
|-------|--------|-----|
| `npm run verify:ci` yeşil | 🟡 | `verify` yeşil; `verify:ci` (+ coverage + bundle budget) ayrı CI adımı |
| Supabase migration uzak uygulama | 🟡 | 6 migration CC-apply bekliyor |
| Vercel env `VITE_*` | 🟡 | Yerel placeholder uyarısı (validate:env) |
| Ödeme / iyzico | ❌ | Bilinçli kapalı — ürün kararı |
| Avukat / TKHK metin onayı | ❌ | Manuel |
| PWA / SW açılışı | ❌ | Kill-switch aktif — `_audit/PWA_NOTU.md` Faz A–D planı |
| Teknik smoke 36 rota | ✅ | Crash yok |
| Demo mock kullanıcıya görünür | ✅ | M12 temizlik; katalog fallback bilinçli |

**Go/no-go:** **Yumuşak lansman (demo/soft)** — teknik SPA + smoke hazır; **tam ürün lansmanı** için CC-apply + ödeme/hukuk fazı gerekli.

---

## M10–M14 commit hash’leri (bu oturum)

```
a4615b5 feat(M10): watchlist favoriler ve kayitli arama alarmi
585b61c feat(M11): breadcrumb JSON-LD meta ve ic linkleme
c318b41 chore(M12): mock temizlik bildirim canli ve dev-only demo gizleme
9a5e2a3 fix(M13): 404-500 marka sayfalari ve onboarding ipucu
```

---

## Master manuel adımlar (kod dışı)

- OpenAI / AI billing prod limitleri
- Iyzico veya PSP seçimi + sandbox → prod
- EİDS / e-Devlet gerçek entegrasyon (mock rota kalır)
- Avukat: TKHK, mesafeli satış, acentelik
- Şirket / MASAK süreçleri
- Supabase CC-apply: yukarıdaki 6 migration sırayla
- Vercel deploy yeni build (chunk hash — smoke stale chunk riski deploy gecikmesinde)
- OG sosyal bot prerender (Claude Code / Vercel middleware — **dokunulmadı**)

---

## Claude Code devir listesi

1. `supabase db push` veya SQL Editor ile migration 1→6
2. `notifications` insert policy doğrulama (saved search alarm)
3. Edge fonksiyonları canlı env doğrulama (chat, kyc — önceki sprint)
4. Production smoke deploy sonrası tekrar
5. M10–M14 soft launch PR review
