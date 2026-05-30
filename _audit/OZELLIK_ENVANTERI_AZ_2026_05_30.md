# ihaleal A–Z ÖZELLİK ENVANTERİ

**Tarih:** 2026-05-30  
**Yöntem:** Salt-okuma (`grep`, dosya okuma, `App.tsx` rota envanteri). Kod/git **değiştirilmedi**.  
**Repo:** `C:\Users\yagiz\Documents\GitHub\ihaleal`

---

## SAYISAL ÖZET

| Metrik | Değer |
|--------|------:|
| **`App.tsx` `<Route path=` satırı** | **138** (shell komutu) |
| **Benzersiz hedef rota (redirect/navigate hariç)** | **~112** |
| **✅ ÇALIŞIYOR** (UI + gerçek Supabase akışı birincil) | **~14** |
| **🟡 MOCK/KABUK** (UI var; demo/localStorage/isteğe bağlı backend) | **~94** |
| **❌ YOK / BOŞ / REDIRECT** | **~8** |
| **`src/` içinde `demo\|mock\|dummy\|hardcoded` geçen dosya** | **~150+ dosya** (grep dosya eşleşmesi) |
| **`src/pages/` içinde doğrudan `supabase.from/rpc` geçen dosya** | **9** |
| **Mobil tipi** | **Responsive web SPA** — `src/mobile/` **yok**; Capacitor/RN/Ionic **0**; PWA manifest **yok**; SW **kill-switch (kayıt silme)** |
| **Güvenlik açık / eksik kanıt (kritik+) ** | **8** (Bölüm 4 tablosu) |

---

## 1) TÜM ÖZELLİK ENVANTERİ (3 KOVA)

**Sınıflandırma kuralı (kanıt tabanlı):**
- **✅** — Sayfa/bileşen var **ve** birincil işlev `supabase.from` / `supabase.rpc` / `functions.invoke` ile veri yazıyor/okuyor.
- **🟡** — Sayfa var; veri `AUCTIONS`, `demo*`, `localStorage`, `setTimeout` simülasyonu veya statik JSON; Supabase yalnızca isteğe bağlı/hibrit.
- **❌** — Route var ama içerik boş, yalnızca redirect, veya vaat edilen işlev kodda yok.

### 1.1 Kimlik & oturum

| Rota | Kova | Kanıt |
|------|:----:|-------|
| `/giris` | ✅ | `src/pages/auth/Login.tsx:36-45` — `signIn()` → Supabase Auth |
| `/kayit` | ✅ | `src/pages/auth/Register.tsx:88-126` — `organizations` + `organization_members` + `set_active_org` RPC |
| `/sifremi-unuttum` | 🟡 | `src/pages/auth/PasswordReset.tsx` — Supabase reset **var**; `data-demo="true"` (`Login.tsx:49` benzeri kalıp) |
| `/auth/edevis-mock` | 🟡 | `src/App.tsx:348` — path adında **mock**; simülasyon ekranı |
| `/emlakci-giris` | 🟡 | `LocalAuthGate` + `EmlakciGiris.tsx` — yerel demo auth (`src/components/LocalAuthGate.tsx`) |
| `/kyc` | 🟡 | `src/pages/mega/KycSimulation.tsx` — simülasyon; gerçek KYC tablosu bağlı değil (sayfa adı) |

### 1.2 Pazar yeri / ilan / ihale (çekirdek)

| Rota | Kova | Kanıt |
|------|:----:|-------|
| `/` | 🟡 | `src/pages/Home.tsx` — demo katalog + animasyon; `PremiumCinematicHome` mock feed |
| `/auctions`, `/ilanlar`→redirect | 🟡 | `src/sections/Auctions.tsx:44-51` — `loadAllAuctionsForSearch()` hibrit; fallback demo |
| `/ilan/:id`, `/ihale/:id` | 🟡 | `AuctionDetail.tsx:174-183` Supabase **var**; çoğu alan demo PDF/metin (`:734`, `:1028`) |
| `/ihale/:auctionId/hemen-al` | 🟡 | `BuyNow.tsx` — `lib/buyNow.ts` Supabase hedefli; demo uyarıları |
| `/ihale-ac` | ✅ | `CreateAuction.tsx:218-263` — `listings` + `auctions` INSERT (Supabase yapılandırılınca) |
| `/arama` | 🟡 | `SearchResults.tsx:72` — açıkça **demo veri** metni; `:28-31` remote merge |
| `/ihaleler` | 🟡 | `LiveAuctions.tsx` → `Auctions` bileşeni (hibrit katalog) |
| `/favoriler` | 🟡 | `Favorites.tsx:6-16` — `AUCTIONS` statik + `useFavorites` **localStorage** (`hooks/useFavorites.ts:3-16`) |
| `/harita` | 🟡 | `MapPage.tsx:6-22` — `AUCTIONS` statik; `:75-79` Google Maps **iframe**; geofence **yok** |
| `/karsilastir` | 🟡 | Demo katalog karşılaştırma (Supabase grep yok) |
| `/analiz` | 🟡 | `Analytics.tsx` — demo metrikler |

### 1.3 Kullanıcı paneli & iletişim

| Rota | Kova | Kanıt |
|------|:----:|-------|
| `/panel`, `/panel/:tabId` | 🟡/❌ | `UserPanel.tsx:88-104` — alt sekmeler **“yakında” boş kabuk**; özet demo |
| `/mesajlar` | 🟡 | `Messages.tsx:18-33` — `DEMO_CHAT_THREADS` + localStorage; `:22` edge **opsiyonel** UUID thread |
| `/belgeler` | 🟡 | `Documents.tsx:8-33` — `DEMO_VAULT_DOCUMENTS`; upload **simülasyon** |
| `/ayarlar` | 🟡 | Statik ayar UI; Supabase profil sync sınırlı |
| `/profil` | 🟡 | Karma: AuthContext + eski `localStorage ihaleal_user` kalıntıları (audit notu) |
| `/iletisim` | 🟡 | `Contact.tsx:33-34` — **`setTimeout` simülasyon**; Supabase/email **yok** |
| `/kurumsal/iletisim` | ✅ | `CorporateContact.tsx:24` — `supabase.from("corporate_leads").insert(form)` |
| `/pre-launch`, `/lansman` | ✅ | `PreLaunch.tsx:22` — `pre_launch_signups` INSERT |

### 1.4 Müteahhit (R14)

| Rota | Kova | Kanıt |
|------|:----:|-------|
| `/muteahhit` | 🟡 | `MuteahhitLanding.tsx:4-11` — **hardcoded** `PROJECTS` kartları; pazarlama metni |
| `/muteahhit/panel` | ✅ | `MuteahhitPanelPage.tsx:47-87` — `useActiveOrg` + `organization_members`; `useDeveloperProjects` |
| `/muteahhit/yeni-proje` | ✅ | `useDeveloperProjects.ts:116-123` — `developer_projects` INSERT |
| `/muteahhit/proje/:projectId` | ✅ | `useDeveloperProject` — Supabase SELECT |
| `/muteahhit/onay-bekleniyor` | 🟡 | Statik bekleme ekranı |
| `/proje/:projectId` | 🟡 | Kamu vitrin; verified projeler SELECT (RLS bağlı) |

**RLS notu (repo):** `supabase/migrations/20260530160000_rls_org_insert.sql:14-45` — org INSERT policy **repo'da var**; canlıda uygulanıp uygulanmadığı bu envanter kapsamında **tespit edilemedi**.

### 1.5 Emlakçı, kurumsal, admin

| Rota | Kova | Kanıt |
|------|:----:|-------|
| `/emlakci`, `/emlakci/panel` | 🟡 | Landing + panel; demo portal kalıbı (`EmlakciPanelPage.tsx` grep demo) |
| `/kurumsal/dashboard` | ✅ | `OrganizationDashboard.tsx` — Supabase org verisi |
| `/admin` | ✅ | `AdminGuard.tsx:7-37` + `AdminDashboard.tsx` — admin profil gate + Supabase |
| `/hizmet-bedelleri` | ✅ | `HizmetBedelleri.tsx` — Supabase service_fees (grep) |
| `/uyelik/yillik` | ✅ | `YillikUyelik.tsx` — Supabase memberships |

### 1.6 Borsa modülü (R12.1)

| Rota | Kova | Kanıt |
|------|:----:|-------|
| `/borsa` (+ alt: varliklar, izleme, veri, portfoy, varlik/:id) | 🟡 | `BorsaPage.tsx`, `lib/borsa/marketData.ts`, `orderBook.ts` — **mock/sentetik** veri; Supabase yok |

### 1.7 Modül sayfaları (`/modul/*`) — 34 rota

| Grup | Rota sayısı | Kova | Kanıt |
|------|:-----------:|:----:|-------|
| Deprem/afet harita & risk | 8 | 🟡 | `ModuleShell` + demo JSON/harici API; örn. `DepremSigortasiPage.tsx:90` → `/data/dask-policy-mock.json` |
| Eğitim ders 1–10 | 10 | 🟡 | `egitim/LessonView.tsx` — statik içerik |
| İkincil modüller (kredi, sigorta, ROI, vb.) | 14 | 🟡 | `ModuleShell`; Supabase **0** (`src/pages/modules/` grep supabase → eşleşme yok) |
| Değerleme + GES modül | 2 | 🟡 | Client-side engine; POI edge opsiyonel |

**Örnek satırlar:**

| Rota | Kova | Kanıt |
|------|:----:|-------|
| `/modul/parsel-zekasi` | 🟡 | `locationIntelligenceEngine.ts` — client engine; canlı parsel API **tespit edilemedi** |
| `/modul/kentsel-donusum` | 🟡 | `public/data/kentsel-donusum-bolgeleri.json` + harita |
| `/modul/afet-toplanma-alanlari` | 🟡 | Statik/geojson demo |
| `/modul/degerleme` | 🟡 | Client hesap; DB yazımı yok |

### 1.8 Araştırma / KKA / iBuyer / GES

| Rota | Kova | Kanıt |
|------|:----:|-------|
| `/arastirma` (+ alt yollar) | 🟡 | Intelligence hub — demo senaryolar |
| `/kat-karsiligi`, `/kat-karsiligi/studio` | 🟡 | `KkaParselStudioPage.tsx` — client engine; sözleşme metni demo |
| `/aninda-teklif`, `/ibuyer` | 🟡 | `lib/ibuyer/submitInstantOffer.ts` — Supabase INSERT **var**; UX demo banner |
| `/ges-analiz-arazi` | 🟡 | `submitGesProject.ts` — Supabase; form demo akışı |

### 1.9 Yasal, kurumsal içerik, SEO, blog

| Grup | Rota örnekleri | Kova | Kanıt |
|------|----------------|:----:|-------|
| Yasal metinler | `/kvkk`, `/gizlilik`, `/ihale-kosullari`, … (~15) | 🟡 | Statik JSX/Markdown — backend **yok** |
| Kurumsal bilgi | `/hakkimizda`, `/sss`, `/komisyon-modeli`, … | 🟡 | Statik içerik |
| SEO landing | 5 şehir (`seoLandings.ts:13-58`) | 🟡 | `CityLanding.tsx` — demo katalog filtresi |
| Blog | `/blog`, `/blog/:slug` | 🟡 | `data/mega/blogPosts.ts` — statik |

### 1.10 Redirect / boş / yok

| Rota | Kova | Kanıt |
|------|:----:|-------|
| `/degisiklikler` | ❌ | `App.tsx:264` — `Navigate to="/"`; Changelog **kasıtlı kapatılmış** |
| `/ilanlar`, `/ilanlar/:category` | ❌ | Redirect → `/auctions` (`App.tsx:202-205`) |
| `/panel/bildirimler` vb. alt sekmeler | ❌ | `UserPanel.tsx:94-104` — **boş placeholder** |
| `/notifications` (ayrı rota) | ❌ | `App.tsx` grep — route **yok**; yalnız `NotificationBell` demo |
| Dedicated mobil app | ❌ | `src/mobile/` — **0 dosya** |

---

## 2) SPESİFİK İDDİA DOĞRULAMA

### 2a) PDF indirme

| Soru | Sonuç | Kanıt |
|------|-------|-------|
| PDF generate/download kodu var mı? | **EVET (kısmi)** | `PropertyAnalysisReportViewer.tsx:76-97` — lazy `jspdf` + `html2canvas`; `pdf.save(...)` |
| Hangi sayfalar? | Rapor görüntüleyici; tatbikat “PDF” toast | `PropertyAnalysisReportViewer.tsx:154`; `TatbikatRehberiPage.tsx:95-104` |
| Gerçek mi mock mu? | **🟡 MOCK/KABUK** | Rapor viewer: client-side export (DOM→PDF), DB dosyası değil. Tatbikat: **toast only**, gerçek PDF **yok** (`:95-103`) |
| Demo PDF referansları | Statik | `data/auctions.ts:61-62`; `demo-data/properties/generate.ts:645-655` — `/docs/demo-*.pdf` yolları |

### 2b) PDF/dosya yükleme (Supabase Storage)

| Soru | Sonuç | Kanıt |
|------|-------|-------|
| `storage.from` / `.upload(` | **YOK** | `src/` grep → **0 eşleşme** |
| Bucket tanımı (migration) | **YOK** | `supabase/migrations/` grep `storage`/`create bucket` → **0** |
| UI upload bileşenleri | **Mock** | `DocumentUploader.tsx:15-16` — “Mock yükleme — sunucuya gitmez”; `Documents.tsx:32-43` simülasyon |
| CreateAuction dosya seçimi | **Kabuk** | `CreateAuction.tsx:686-699` — yalnız **dosya adı** state; upload **yok** |

### 2c) Konuma göre kiralık/satılık

| Soru | Sonuç | Kanıt |
|------|-------|-------|
| Konum filtresi | **🟡 VAR (demo)** | `Auctions.tsx:34-67` — `selectedCity`, `searchQuery`; `MapPage.tsx:13-22` — şehir/ilçe text filter |
| Kiralık/satılık ayrımı (liste UI) | **❌ YOK** | `Auctions.tsx` — `dealType`/`Kiralık` filtresi **yok** (grep 0) |
| deal_type modeli | **🟡 Veri katmanı** | `CreateAuction.tsx:51,179` — INSERT `deal_type`; `listingPolicy.ts:77-79` — kategori çıkarımı |
| Harita/geofence | **❌ Gerçek geofence yok** | `MapPage.tsx:75-79` Google iframe; POI: `useNearbyPOI.ts:73` edge invoke — ilan filtresine **bağlı değil** |
| Demo üretim | **🟡** | `demo-data/properties/generate.ts:481-674` — `dealType: sale/rent/transfer` sentetik |

### 2d) Bilgi gönderme / iletişim / bildirim

| Kanal | Nereye gidiyor? | Kova | Kanıt |
|-------|-----------------|:----:|-------|
| `/iletisim` formu | **Hiçbir yere** (setTimeout UI) | 🟡 | `Contact.tsx:33-34` |
| `/kurumsal/iletisim` | `corporate_leads` tablosu | ✅ | `CorporateContact.tsx:24` |
| Pre-launch kayıt | `pre_launch_signups` | ✅ | `PreLaunch.tsx:22` |
| Mesaj gönderme | Demo thread + opsiyonel edge | 🟡 | `postChatMessageClient.ts:62` — `functions.invoke("post_chat_message")` |
| E-posta servisi | **Tespit edilemedi** | ❌ | `src/` grep `sendgrid\|resend\|nodemailer` → 0 |
| İlan bildirimi | **Tespit edilemedi** | ❌ | Ayrı “report listing” Supabase akışı yok |

### 2e) “İhaleal Müteahhit” landing vaatleri

Kaynak metin: `MuteahhitLanding.tsx:28` — *“Yüklenici seçimi, kapalı teklif, kat karşılığı senaryoları ve proje panosu.”*

| Vaat | Durum | Kanıt |
|------|:-----:|-------|
| **Yüklenici seçimi** | 🟡 | Landing `:4-11` hardcoded kart “Yuklenici”; **iş akışı/karşılaştırma modülü yok** (muteahhit pages grep) |
| **Kapalı teklif** | 🟡 | Platform genelinde `AuctionDetail.tsx:977,1118` sealed offer **demo**; müteahhit panelde **yok** |
| **Kat karşılığı senaryoları** | 🟡 | KKA modülü ayrı: `lib/kkaHub.ts`; landing `:73-75` link; **müteahhit panel entegrasyonu yok** |
| **Proje panosu** | ✅ | `MuteahhitPanelPage.tsx` + `developer_projects` — gerçek CRUD (RLS/deploy bağlı) |

**Skor:** 1× ✅, 3× 🟡, 0× ❌ (vaatlerin tamamı kodda **kısmen**; 3’ü pazarlama > uygulama).

---

## 3) MOBİL DURUM

### 3.1 `src/mobile/`

| Soru | Sonuç |
|------|-------|
| Klasör var mı? | **HAYIR** — glob 0 dosya |
| İçerik | **Yok** |

### 3.2 Mobil uygulama tipi

| Teknoloji | grep sonucu |
|-----------|-------------|
| Capacitor | **0** |
| React Native | **0** |
| Ionic | **0** |
| `manifest.json` | **0** (repo kökü) |
| Service worker | `index.html:19` — **`sw-unregister.js`** (SW **silme/kill-switch**, PWA değil) |

**Sonuç:** **Responsive web SPA** (Vite + React). Viewport: `index.html:5` `width=device-width`.

### 3.3 PWA / “Ana ekrana ekle”

| Bileşen | Durum |
|---------|-------|
| Web App Manifest | **❌ YOK** |
| Aktif service worker | **❌ Bilerek devre dışı** (`public/sw-unregister.js:1-7`) |
| “Ana ekrana ekle” | **Tespit edilemedi** — PWA altyapısı yok |

### 3.4 Masaüstü vs mobil özellik farkı (kod)

| Bulgu | Kanıt |
|-------|-------|
| Global `isMobile` UI dalları | `hooks/use-mobile.ts:6-18`; `sidebar.tsx:69-183` — layout sidebar |
| Route bazlı mobil devre dışı | **Tespit edilemedi** — aynı rotalar mobil/desktop |
| Harita modülleri mobil | Leaflet responsive; ayrı mobil route **yok** |
| Canlı mobil 500 | Önceki audit: shell **200-TEMİZ**; client crash curl ile kanıtlanamaz |

### 3.5 K-M6 mobile planı (4 ekran)

Kaynak: `_audit/K_M6_KAPSAM.md` (salt-okuma referans; bu repo **web**).

| Ekran | Web rotası | Kodda var mı? | Backend |
|-------|------------|:-------------:|---------|
| **Favoriler** | `/favoriler` | ✅ UI | 🟡 `localStorage` — `useFavorites.ts:3-16`; `watchlist` tablo **web'de bağlı değil** |
| **Bildirimler** | `/panel/bildirimler` + `NotificationBell` | 🟡 UI | 🟡 `notificationsDemo.ts`; DB tablo migration'da var, UI demo |
| **Belgeler** | `/belgeler` | ✅ UI | 🟡 `documentsVaultDemo.ts`; upload mock |
| **Mesajlar** | `/mesajlar` | ✅ UI | 🟡 demo thread + opsiyonel edge |

**Ayrı mobil repo (`ihaleal-mobile`):** Bu workspace'te **tespit edilemedi** (0 dosya).

---

## 4) GÜVENLİK MEVCUT DURUM

### 4.1 Route guard envanteri

| Koruma | Rotalar | Kanıt |
|--------|---------|-------|
| **AdminGuard** (Supabase admin profil) | `/admin` | `App.tsx:356-363`, `AdminGuard.tsx:17-34` |
| **LocalAuthGate** | `/emlakci-giris` | `App.tsx:250` |
| **Sayfa-içi auth** (redirect/link) | `/muteahhit/panel`, `/giris?next=...` | `MuteahhitPanelPage.tsx:158-164` |
| **RLS-only** (route guard yok) | `/ihale-ac`, `/kayit`, `/kurumsal/iletisim`, çoğu panel | Client-side; anon erişim route açık |

**Not:** `ProtectedRoute` / `AuthGuard` grep → **0** — genel route koruması **yok**.

### 4.2 Anon SELECT yüzeyi (migration kanıtı)

| Tablo / view | Anon SELECT | Kanıt |
|--------------|:-----------:|-------|
| `listings` | **EVET** | `20260528170000_grants_restore_systemic.sql:108` |
| `auctions` | **EVET** | `:109` |
| `developer_projects` (verified) | **EVET** | `20260530140000_r14_developer_projects.sql:184-186` |
| `project_units` (public verified) | **EVET** | `:186` |
| `organizations` | **HAYIR** (member-only) | `20260516120100:68-71`; yorum `grants_restore:117` |
| `profiles` | **HAYIR** | Yorum `:115-116` |

**Hassas sızıntı:** Anon listing/auction SELECT **tasarım gereği**; PII profiller kapalı (migration yorumu).

### 4.3 RLS INSERT/UPDATE — kritik tablolar

| Tablo | INSERT policy (repo) | Dosya:satır |
|-------|:--------------------:|-------------|
| `organizations` | **VAR** (fix migration) | `20260530160000_rls_org_insert.sql:14-16` |
| `organization_members` | **VAR** | `:20-40` |
| `developer_projects` | **VAR** | `20260530140000:128-132` |
| `listings` | **VAR** (KYC/edevlet) | `20260429140000_listings_insert_kyc_edevlet_idempotent.sql:6+` |
| `corporate_leads` | **VAR** (herkese insert) | `20260516120300:67` `with check (true)` |
| `pre_launch_signups` | **VAR** | `20260430140000:18` |

**Canlı DB:** Bu envanter **canlı pg_policies doğrulamaz** (.env.local yok); repo migration ile `organizations` INSERT **artık tanımlı** (`20260530160000`).

### 4.4 Secret / service_role sızıntısı

| grep | Sonuç |
|------|-------|
| `service_role`, `SERVICE_ROLE`, `sb_secret`, `VITE.*SECRET` in `src/` | **0 gerçek eşleşme** (false positive dışlandı) |

### 4.5 Diğer güvenlik izleri

| Konu | Kodda iz var mı? | Kanıt |
|------|:----------------:|-------|
| Rate limiting | **🟡 Kısmi** | `depositRegister.ts:166`; DB `rate_limit_buckets` RLS; Edge/WAF **plan metni** |
| Input validation (Zod) | **🟡 Kısmi** | `Contact.tsx:9-14`; formlar tutarsız |
| CSRF | **❌ Tespit edilemedi** | SPA + Supabase JWT modeli |
| File upload validation | **🟡 Client-only** | `DocumentUploader.tsx:25-31` — boyut/tip; sunucu yok |
| CSP / WAF | **❌ Kodda yok** | Hosting katmanı |

### 4.6 Güvenlik açık sayısı (severity)

| # | Bulgu | Severity |
|---|-------|----------|
| 1 | `/iletisim` formu veri göndermiyor (UX yanıltıcı) | Orta |
| 2 | Dosya upload tamamen mock — Storage yok | Yüksek (ürün vaadi) |
| 3 | Favoriler/bildirimler/belgeler auth-bound değil (localStorage/demo) | Yüksek |
| 4 | Route guard yalnız `/admin` — panel rotaları açık | Orta |
| 5 | `corporate_leads` INSERT `with check (true)` — spam yüzeyi | Orta |
| 6 | Anon listings/auctions SELECT geniş yüzey | Düşük–Orta (tasarım) |
| 7 | Canlı org INSERT migration uygulanması **doğrulanamadı** | Kritik (deploy) |
| 8 | PWA/SW kapalı — offline/cache stratejisi yok | Düşük |

**Toplam listelenen:** **8**

---

## EN BÜYÜK 10 BOŞLUK (severity ↓)

| # | Boşluk | Severity | Kanıt |
|---|--------|----------|-------|
| 1 | **Supabase Storage + gerçek dosya yükleme yok** — PDF/evrak vaadi mock | 🔴 Kritik | `DocumentUploader.tsx:15`; grep storage 0 |
| 2 | **Müteahhit kayıt RLS** — fix migration repo'da; **canlı deploy doğrulanamadı** | 🔴 Kritik | `20260530160000_rls_org_insert.sql` |
| 3 | **K-M6 auth-bound 4 ekran** (favori/bildirim/belge/mesaj) hâlâ demo/localStorage | 🔴 Kritik | `useFavorites.ts:3`; `Documents.tsx:8` |
| 4 | **Mobil native app yok** — yalnız responsive web | 🟠 Yüksek | `src/mobile/` 0; Capacitor/RN 0 |
| 5 | **Kiralık/satılık liste filtresi yok** — yalnız create-time deal_type | 🟠 Yüksek | `Auctions.tsx:63-76` |
| 6 | **İletişim formu sahte gönderim** (setTimeout) | 🟠 Yüksek | `Contact.tsx:33-34` |
| 7 | **Müteahhit landing vaatleri** (yüklenici seçimi, kapalı teklif) **pazarlama > kod** | 🟠 Yüksek | `MuteahhitLanding.tsx:28-49` |
| 8 | **Borsa modülü tamamen mock** — gerçek piyasa verisi yok | 🟡 Orta | `lib/borsa/marketData.ts` |
| 9 | **UserPanel alt sekmeler boş** (`/panel/bildirimler` vb.) | 🟡 Orta | `UserPanel.tsx:94-104` |
| 10 | **Geofence/konum bazlı ilan arama yok** — şehir metin filtresi + demo katalog | 🟡 Orta | `MapPage.tsx:13-22` |

---

*Rapor: salt-okunur envanter — `_audit/OZELLIK_ENVANTERI_AZ_2026_05_30.md`*
