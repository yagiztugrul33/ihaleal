# ihaleal.com — Genel Site Değerlendirme Raporu

**Tarih:** 19 Mayıs 2026  
**Dal:** `fix/premium-cinematic-uctan-uca`  
**HEAD:** `c455cd0`  
**Metod:** Kod tabanı incelemesi + ölçülmüş audit/test/build kanıtları (iddia değil)

---

## 1. Yönetici özeti

ihaleal.com, **Vite + React 19 + TypeScript + Supabase** ile geliştirilen, gayrimenkul ihale ve yatırım odaklı geniş kapsamlı bir **SPA demo platformu**dur. Ürün yüzeyi olgun (165+ sayfa bileşeni, 167 audit rotası, deprem şeffaflık omurgası, how-it-works rehber ağı); **gerçek ödeme, prod auth ve hukuk onayı** katmanı henüz inşa aşamasındadır.

| Hedef | Tamamlanma (tahmini) | Kanıt |
|-------|----------------------|--------|
| **Demo / vitrin** (gezilebilir site) | **~97%** | Route audit 167/167, smoke 21/21, verify yeşil |
| **Canlı ürün** (para + hukuk + operasyon) | **~32%** | `docs/PROJE_ILERLEME_YUZDE.md`, `VITE_PAYMENT_MODE=mock` |
| **Teknik sağlık** (CI kalitesi) | **Yüksek** | verify + verify:ci geçmiş, 162 unit test |

**Genel not (demo perspektifi):** **8.2 / 10** — kapsam, tutarlılık ve test kanıtı güçlü; locale/SEO hash sınırları ve prod entegrasyon borcu net.

**Genel not (canlı ürün perspektifi):** **4.5 / 10** — arayüz hazır, iş mantığı çoğunlukla mock/demo.

---

## 2. Teknik mimari

| Katman | Değerlendirme | Not |
|--------|---------------|-----|
| Ön uç | ✅ Sağlam | Vite 6, React 19, Tailwind, lazy route split |
| Routing | ✅ Geniş | ~100 `<Route>` tanımı, HashRouter |
| BaaS | ⚠️ Kısmi | Supabase client + RLS tasarımı; prod deploy eksik |
| Ödeme | ❌ Mock | `runtimeFlags`: `VITE_PAYMENT_MODE` default mock |
| Auth | ⚠️ Demo ağırlıklı | `localAuthEnabled` dev/demo; gerçek oturum sınırlı |
| Deploy | ✅ Hazır yapı | `dist` → Vercel, `vercel.json` |

**Güçlü yan:** `src/lib/fees.ts` tek kaynak komisyon matrahı; mimari dokümantasyon (`docs/ARCHITECTURE.md`) repo ile uyumlu.

**Zayıf yan:** Kritik iş kuralları (teklif, teminat, escrow) istemci + mock; üretimde Edge Functions / BFF şart.

---

## 3. UX / UI değerlendirmesi

### 3.1 Ana sayfa (`PremiumCinematicHome`)

| Öğe | Durum |
|-----|--------|
| Hero 3 kolon + canlı ihale kartı | ✅ |
| Deprem şeffaflık bandı | ✅ |
| Canlı deprem ticker (Kandilli mock) | ✅ |
| Platform modülleri vitrin | ✅ |
| Nasıl çalışır 4 adım → detay linkleri | ✅ |
| Kategori bandı (Turizm/GES etiketleri) | ✅ |
| Testimonial + güven sinyalleri | ✅ |
| Hero intro video | ✅ Kaldırıldı (istenen) |

**Layout:** `EmergencyActionBand` global Layout’ta — acil eylem bandı sayfa dışında da görünür.

### 3.2 Navigasyon

| Öğe | Durum |
|-----|--------|
| Logo (Gavel + ihaleal.com) | ✅ Testli, Navbar’da aktif |
| Mega menü (3 kolon) | ✅ |
| 4 giriş + 4 kayıt portal dropdown | ✅ Desktop |
| Mobil portallar | ✅ Üstte, scroll panel (`nav-mobile-menu`) |
| GES menü linki | ✅ Smoke ile doğrulandı |

### 3.3 i18n

| Öğe | Durum |
|-----|--------|
| TR/EN mesaj sözlüğü | ✅ `src/i18n/messages.ts` |
| Varsayılan locale | ⚠️ **EN** (localStorage boşsa) |
| How-it-works sayfaları | ✅ TR zorunlu (`useEnsureLocale`) |
| Türkçe içerik / EN navbar riski | ⚠️ Ana sayfa ve genel akışta devam edebilir |

**Öneri:** Türkiye pazarı için varsayılan `tr` veya path bazlı locale politikası.

### 3.4 Nasıl çalışır ekosistemi

| Rota | İçerik |
|------|--------|
| `/how-it-works` | Hub: video, 4 adım, 5 yolculuk, belgeler |
| `/how-it-works/adim/*` | 4 detay sayfası |
| `/how-it-works/yol/*` | 5 rol yolculuğu |
| `/nasil-calisir` | Redirect |

**Link proof:** 55/55 internal link (`reports/how-it-works-proof.json`).  
**Video:** 7.965.858 B, HTTP 200.

---

## 4. İçerik ve modül derinliği

### 4.1 Sayfa envanteri (ölçülmüş)

| Metrik | Değer |
|--------|-------|
| `src/pages/**/*.tsx` | **~168 dosya** |
| Route audit kapsamı | **167 rota** |
| Deprem/modül sayfaları | **35+** modül route |
| Yasal / kurumsal sayfalar | Geniş (KVKK, sözleşmeler, anayasa vb.) |

### 4.2 Farklılaştırıcı: Deprem omurgası (Dalga 3)

Platformu rakiplerden ayıran en güçlü ürün hikâyesi:

- Deprem şeffaflık bandı, canlı ticker, risk haritası
- Aile acil planı, eğitim LMS (10 ders), yıkılan binalar arşivi
- Komsuluk risk, güçlendirme, sigorta pazaryeri modülleri

**Değerlendirme:** Demo vitrinde **benzersiz ve tutarlı**; veri çoğunlukla mock/seed — canlı veri entegrasyonu ayrı faz.

### 4.3 Gayrimenkul / ihale çekirdeği

- İlan katalog (`/ilanlar/*`), ihale detay, teklif akışı UI
- AI değerleme, GES analizi, parsel zekası, yatırım modülleri
- Emlakçı / müteahhit / yatırımcı portal girişleri

**Değerlendirme:** Yatay kapsam **çok geniş**; derinlik operasyonel entegrasyona bağlı.

---

## 5. Kalite ve test

| Kontrol | Sonuç | Kaynak |
|---------|--------|--------|
| `npm run verify` | EXIT 0 | typecheck + encoding + 162 test + build |
| `npm run verify:ci` | EXIT 0 | + coverage + bundle budget + eslint + audit |
| Vitest | 162 passed, 2 skipped | 36 dosya |
| Playwright smoke | 21/21 | how-it-works + home-navbar-ges |
| RLS policy contract | 8/8 | `tests/rls/` |
| Logo unit | 2/2 | Koruma altında |
| Route audit | **167/167**, 0×404, 0 overflow | `wave3-final-audit.json` |
| Console error (audit) | 0 | audit raporu |

**Smoke kapsamı:** 6 spec dosyası; kritik regresyonlar (home, how-it-works, arastirma, demo-routes, ibuyer) kısmen korunuyor — tam E2E suite değil.

**Test boşluğu:** 168 sayfa vs 21 smoke assertion — **yüzey alanı >> otomatik UI kapsamı**.

---

## 6. Performans ve bundle

| Chunk | Boyut | Değerlendirme |
|-------|-------|---------------|
| `vendor-charts` | 445 kB | Recharts — lazy kullanım iyi, yine ağır |
| `index` (ana) | 287 kB | Kabul edilebilir |
| `vendor-react` | 227 kB | Standart |
| `vendor-supabase` | 200 kB | Supabase client |
| `leaflet` | 150 kB | Harita sayfalarında |
| `vendor-motion` | 123 kB | Framer Motion — ana sayfa |

**Bundle budget:** ✅ En büyük chunk 455.888 B < 819.200 B limit.

**Risk:** İlk yükleme HashRouter SPA; CDN + code-splitting mevcut ama Lighthouse ölçümü bu raporda yok (hosting/CDN bağımlı).

---

## 7. SEO ve keşfedilebilirlik

| Öğe | Durum |
|-----|--------|
| Merkezi SEO | ✅ `src/lib/seo.ts`, `ROUTE_SEO` |
| HashRouter | ⚠️ Canonical/hash politikası `docs/SEO_HASH_CANONICAL.md` |
| SSR/prerender | ❌ Yok (planlı borç) |
| OG/PWA görselleri | ⚠️ `npm run gen:assets` ile üretilebilir |

**Değerlendirme:** Demo SEO yönetilebilir; organik arama için hash SPA sınırlı — bilinçli trade-off.

---

## 8. Güvenlik (gerçekçi)

| Alan | Durum |
|------|--------|
| Anon key istemcide | ✅ Beklenen Supabase modeli |
| Service role bundle’da | ✅ Yok |
| RLS tasarımı | ✅ Dokümante + contract test |
| Ödeme güvencesi iddiası | ✅ Yapılmıyor (mock) |
| npm audit | ⚠️ 2 moderate (brace-expansion, ws) |
| CSP/WAF/rate limit | ⚠️ Hosting katmanı — kodda kısmi |

**Değerlendirme:** Demo için **sorumlu sınırlar** korunmuş; canlı finansal ürün için backend doğrulama şart.

---

## 9. Hukuk ve uyum

| Alan | Durum |
|------|--------|
| KVKK, gizlilik, çerez sayfaları | ✅ Var |
| Sözleşme şablonları | ✅ Demo/taslak |
| Avukat onayı | ❌ Bekliyor |
| MASAK / ödeme uyumu otomasyonu | ❌ Yok |

**Değerlendirme:** Bilgilendirme yüzeyi geniş; **bağlayıcı hukuk iddiası yok** (doğru yaklaşım demo için).

---

## 10. Launch readiness matrisi

| Kapı | Demo vitrin | Canlı ürün |
|------|-------------|------------|
| Build yeşil | ✅ | ✅ |
| 167 rota 404 yok | ✅ | ✅ |
| Smoke regresyon | ✅ | ✅ |
| Supabase prod DB | ⚠️ | ❌ |
| Gerçek auth | ⚠️ | ❌ |
| Ödeme PSP | ❌ | ❌ |
| Hukuk sign-off | ❌ | ❌ |
| Push/deploy son dal | ⚠️ | ⚠️ |

---

## 11. SWOT özeti

### Güçlü yönler
1. **Olağanüstü sayfa kapsamı** — 167 audit rotası, sıfır 404
2. **Deprem şeffaflık omurgası** — ürün farklılaştırıcısı
3. **How-it-works derin rehber** — 55 link proof, video, 9 detay sayfası
4. **Test disiplini** — verify zinciri, smoke, route audit otomasyonu
5. **Tek kaynak fees/SEO/mimari dokümantasyon**
6. **Logo ve marka** — testli, regresyon geçmişi yönetildi

### Zayıf yönler
1. **Mock ağırlıklı backend** — auth, ödeme, teklif
2. **Varsayılan EN locale** — TR ürün için UX sürtünmesi
3. **Hash SPA SEO tavanı**
4. **168 sayfa vs 21 smoke** — regresyon riski geniş yüzeyde
5. **334 audit PNG commit dışı** — görsel kanıt seti parçalı

### Fırsatlar
1. Demo → yatırımcı / kurumsal sunum **hemen kullanılabilir**
2. How-it-works + deprem modülleri **pazarlama hikâyesi** güçlü
3. Turizm/GES slug/etiket hizalaması SEO hazırlığı

### Tehditler
1. Canlıya erken çıkış **hukuki/finansal risk**
2. Geniş mock yüzey **yanlış prod beklentisi** yaratabilir
3. Bundle büyümesi (charts, maps, motion) mobil performans baskısı

---

## 12. Öncelikli öneriler

### P0 — Hemen (teknik)
1. Dalı push + preview deploy (Vercel)
2. Varsayılan locale → `tr` kararı ve uygulama
3. `npm audit fix` (moderate)

### P1 — Bu sprint
4. Smoke kapsamını 21 → 40+ (kritik portal + ihale + ilan detay)
5. Audit PNG’leri ayrı commit veya `.gitignore` politikası netleştir
6. `gen:assets` çalıştır — OG/PWA production

### P2 — Ürün kararı
7. Supabase prod + `place_bid` Edge deploy
8. iyzico sandbox (ürün onayı sonrası)
9. Avukat onaylı sözleşme dondurma

### P3 — Orta vade
10. SSR/prerender veya marketing site ayrımı (SEO)
11. Kimi mega paket içerik bağlama (`docs/kimi-mega-pack/`)

---

## 13. Kanıt dosyaları (tek kaynak)

| Dosya | İçerik |
|-------|--------|
| `reports/wave3-final-audit.json` | 167/167 rota, 0 hata |
| `reports/how-it-works-proof.json` | 55/55 link |
| `reports/acil-eylem-proof.json` | allGreen: true |
| `_audit/ACIL_EYLEM_PLANI_KOMUT.md` | K001–K120 acil plan |
| `docs/PROJE_ILERLEME_YUZDE.md` | Demo %97 / Canlı %32 |
| `docs/LAUNCH_CHECKLIST.md` | A/B faz kapıları |

---

## 14. Sonuç cümlesi

**ihaleal.com bugün güçlü bir gayrimenkul ihale demo platformu:** geniş rota ağı, deprem odaklı diferansiyasyon, olgun ana sayfa ve how-it-works rehberi, ölçülmüş 167/167 audit ve 21/21 smoke ile teknik olarak **demo sunuma hazır**. Gerçek para, gerçek kullanıcı ve hukuki bağlayıcılık katmanı henüz tamamlanmadığı için **canlı ticari ürün olarak değerlendirilmemeli** — bu bilinçli ve dokümante edilmiş bir faz ayrımıdır.

---

*Rapor oluşturan: otomatik kod + audit analizi | Ölçüm tarihi: 2026-05-19*
