# ihaleal.com — Durum Tespiti ve "Nerede Kaldık" Raporu

**Rapor tarihi:** 2026-08-23
**Hazırlayan:** Claude Code (otomatik durum tespiti)
**Kapsam:** Proje haritası, git durumu, tamamlanan/eksik işler, sağlık kontrolü (typecheck/lint/build/test/audit)

---

## 1. Projenin Özeti

**İhaleal**, gayrimenkul ilanı, açık artırma (ihale/mezat) ve kurumsal "intelligence" (yatırım analizi) hizmeti veren bir Türkiye pazaryeri platformu. Ana modüller:

- **Pazaryeri:** İlan listeleme, ihale/açık artırma akışı (teklif + %5 teminat, anti-sniping, komisyon hesaplama), harita, karşılaştırma, favoriler, değerleme aracı.
- **Kurumsal:** Büyük emlak ofisleri için landing + demo talep formu + org paneli iskeleti.
- **Intelligence:** Araştırma hub'ı, "War Room" komuta merkezi, GES (güneş enerjisi) analizi, parsel istihbaratı.
- **Kat karşılığı (KKA):** Arsa/kat karşılığı hub ve imar stüdyosu.
- **Risk/deprem modülleri:** Deprem risk haritası, bina risk sorgusu, güçlendirme rehberi (Türkiye'ye özgü afet/deprem odaklı özellikler).
- **Mobil:** Capacitor ile Android + iOS sarmalayıcı (native platform klasörleri repoda mevcut).

**Teknoloji yığını:**

| Katman | Teknoloji |
|---|---|
| Frontend | Vite 6, React 19, TypeScript 5.8, Tailwind 3.4, Radix UI, Framer Motion |
| Backend / veri | Supabase (Postgres + Auth + Edge Functions — 20 fonksiyon, 57 migration) |
| Mobil | Capacitor 8 (Android + iOS proje klasörleri) |
| Test | Vitest (unit), Playwright (smoke/e2e) |
| i18n | i18next — TR/EN/AR/RU (audit klasörlerinden görülüyor) |
| Diğer servisler | Sentry (hata izleme), Vercel Analytics, jsPDF/html2canvas (PDF/rapor üretimi), TCMB EVDS (döviz/enflasyon), PVGIS (güneş verisi, demo/heuristic), iyzico & PayTR (ödeme, iskelet) |
| Deploy | Vercel (prebuilt deploy önerilen yöntem) |
| Şema referansı | `docs/kimi/prisma-schema.prisma` — dokümantasyon/referans amaçlı duruyor, aktif kullanımda olup olmadığı **kontrol edilmeli** (canlı veri katmanı Supabase migration'ları üzerinden yürüyor) |

---

## 2. Git Durumu

- **Aktif branch:** `claude/ihaleal-status-report-t5dtai` (bu oturum için), uzak takip: `main`.
- **Çalışma ağacı:** temiz, commit edilmemiş değişiklik yok.
- **Toplam commit sayısı:** 50 — tamamı **2026-08-05 04:31** ile **2026-08-06 01:42** arasında, yani ~1 gün içinde atılmış.
- **Son commit:** `c08a387` — "Görsel kanıtın gösterdiği üç kusur giderildi" (2026-08-06 01:42, +03:00) → bugüne göre **~17 gün önce**.
- **Son çalışma teması (son ~15 commit):** açık/minimal tema geçişi (koyu panel sayısını 364'ten 0'a indiren tasarım denetimi), Tailwind paleti tokenlara bağlama, performans turu (LCP preload düzeltmeleri, vendor bundle ayrıştırma — supabase/zod/leaflet ayrı chunk), fontların self-host edilmesi (Google Fonts yerine `public/fonts/*.woff2`), Navbar test bataryasının 204/207'den 207/207'ye çıkarılması, mobilde Capacitor'ün açık temaya taşınması ve iOS platformunun eklenmesi.

> ⚠️ **Tutarsızlık — kontrol edilmeli:** Repodaki çok sayıda tarihli rapor dosyası (`NEREDEYDIK.md` son güncelleme 2026-05-17, `_audit/` altında Nisan-Mayıs 2026 tarihli onlarca denetim raporu) projenin aylardır sürdüğünü gösteriyor; ancak bu klonun git geçmişi yalnızca 1 günlük ve 50 commit'ten ibaret. Bu, ya geçmişin bir noktada sıkıştırıldığını (squash) ya da bu oturumun gerçek GitHub reposunun tam tarihçesine sahip olmayan bir kopya/kırpılmış görünüm üzerinde çalıştığını gösteriyor. Gerçek proje tarihçesi için GitHub'daki `main` dalının tam log'una bakılmalı.

---

## 3. Tamamlanan vs Eksik İşler

### Kod içi TODO/FIXME/HACK/XXX taraması

`src/` altında gerçek bir teknik borç yorumu (TODO/FIXME/HACK/XXX) **neredeyse yok** — eşleşen 25 satırın tamamı, telefon numarası placeholder'ı olarak kullanılan `XXX` karakter dizileridir (ör. `+90 212 XXX XX XX`, `05XX XXX XX XX` gibi form/rehber örnek verileri), gerçek "yapılacak iş" notu değil. Bu, kod tabanının bilinçli TODO bırakmama disipliniyle yazıldığını gösteriyor.

### Bilinen yarım kalmış / mock özellikler (mevcut `_audit/FEATURE_INVENTORY.md`, `NEREDEYDIK.md`, `docs/SECURITY_STATUS.md` dosyalarından teyitli)

| Özellik | Durum |
|---|---|
| Mesajlar (`/mesajlar`) | UI canlı; `post_chat_message` Edge Function 404 dönüyor |
| Canlı deprem takibi | UI canlı; `earthquakes_latest` Edge Function 404 → istemci tarafı fallback'e düşüyor |
| PVGIS güneş verisi (GES analizi) | Gerçek API anahtarı yok, heuristik/demo veriyle çalışıyor |
| AFAD / tapu entegrasyonu | Gerçek API bağlantısı yok |
| KYC | Simülasyon; gerçek kullanıcı doğrulama (production identity verify) bekleniyor |
| PDF rapor motoru | Yok; markdown export ile idare ediliyor |
| War Room görsel tasarımı | Bloomberg/Palantir seviyesinde hedeflenen redesign yapılmamış, işlevsel ama görsel olarak sade |
| Ödeme (iyzico/PayTR) | Edge Functions iskelet halinde; production'da mock ödeme bilinçli olarak kapalı (`VITE_PAYMENT_MODE`) |
| Demo seed verisi | Sınırlı (`/ilan/demo-1` gibi tek örnek ilanlar) |

### Çalışan özellikler

`_audit/FEATURE_INVENTORY.md` (2026-05-30 tarihli, canlı kodla bire bir kontrol edilmedi ama route yapısı bu oturumda doğrulanan `src/App.tsx`/`src/pages` ile örtüşüyor) ~78 canlı özellik, ~14 kısmi/mock özellik, ~18 açık madde sayıyor. Bu oturumda ayrıca doğrulandı: **build başarılı**, **tüm route'lar derleniyor**, **unit testler yeşil** (bkz. Bölüm 4) — yani iskelet sağlam, üstteki tablodaki maddeler dışında bilinen büyük bir kırıklık yok.

---

## 4. Sağlık Kontrolü (bu oturumda gerçek komutlarla çalıştırıldı)

| Kontrol | Komut | Sonuç |
|---|---|---|
| Kurulum | `npm install` | ✅ 1184 paket, hatasız |
| Tip kontrolü | `npm run typecheck` (`tsc --noEmit`) | ✅ **0 hata** |
| Lint | `npm run lint` (`eslint . --max-warnings 0`) | ⚠️ **2 hata + 1 uyarı** (aşağıda) |
| Build | `npm run build` | ✅ Başarılı, `dist/` üretildi, PWA precache 314 dosya (~6.85 MB) |
| Unit testler | `npm run test:run` (Vitest) | ✅ **207 geçti, 2 atlandı** (52 dosyadan 51'i geçti, 1 atlandı) |
| Güvenlik taraması | `npm audit --audit-level=high` | ⚠️ **23 zafiyet** (1 kritik, 16 yüksek, 4 orta, 2 düşük) |
| Güncellik | `npm outdated` | Bazı paketlerde majör versiyon farkı var (aşağıda) |

### Lint hataları (detay)
1. `.claude/skills/version-bump/scripts/generate_changelog.js:8` — parse hatası ("Unterminated string constant"). Bu proje kodu değil, Claude Code skill scripti; yine de repoda duruyorsa düzeltilmeli veya lint kapsamı dışına alınmalı.
2. `scripts/tasarim-olcum.mjs:82` — boş blok (`no-empty`).
3. `src/components/SearchModal.tsx:65` — `react-hooks/exhaustive-deps` uyarısı (useMemo bağımlılığı).

Bu üç madde, geçmiş denetimlerdeki (`_audit/final/lint_errors.txt`, 178 sorun) durumla kıyaslandığında **büyük bir iyileşmeyi** gösteriyor — full-repo lint borcu neredeyse kapanmış.

### npm audit detayı
23 zafiyetin tamamı **devDependency zincirinde**: `tar` (→ `@capacitor/cli`, `supabase` CLI üzerinden), `undici`, `vite` dev sunucusu (`server.fs.deny` bypass, Windows'a özel), `ws`, `uuid` (→ `xcode` paketi üzerinden, iOS build tooling). Bunlar **tarayıcıya giden production bundle'a girmiyor** (build/geliştirme araçları), ancak CI/geliştirme makinesi güvenliği açısından not edilmeli. `npm audit fix` ile büyük kısmı otomatik düzeltilebilir — **denenmedi, kontrol edilmeli** (major sürüm sıçraması yapabilir, dikkatli çalıştırılmalı).

### Güncel olmayan paketler (majör fark olanlar)
`typescript` 5.9→7.0, `vite` 6.4→8.2, `tailwindcss` 3.4→4.3, `zod` 3.25→4.4, `i18next`/`react-i18next`, `recharts` 2→3, `lucide-react` 0→1. Plansız toplu major upgrade önerilmez (özellikle Tailwind 4 ve Vite 8 kırıcı değişiklik içerir) ama izleme listesine alınmalı.

### Gizli anahtar taraması
`.env.example` ve `.env.production.example` yalnızca placeholder değer içeriyor; repo genelinde hızlı regex taramasında (`sk_live`, `AKIA...`, uzun literal secret/api_key atamaları) gerçek bir sızıntı **bulunamadı**. Bu, %100 garanti değildir — daha derin bir secret-scanning taraması (ör. `gitleaks`/GitHub secret scanning) ile **kontrol edilmeli**.

### Repo hijyeni (risk olarak not edildi, sağlık kontrolü değil ama ilgili)
Kök dizinde **60+** `.md/.txt/.bat` durum-raporu/komut dosyası, `_audit/` altında **641** dosya (çoğu ekran görüntüsü + json + tek kullanımlık script), `docs/` altında **143** dosya var. Bu, çalışma günlüğü olarak değerlidir ama repoyu ciddi şekilde şişiriyor ve "hangi rapor güncel" karmaşasına yol açıyor.

---

## 5. Bilinen Hatalar / Riskler (öncelik sırasıyla)

1. **Git geçmişi tutarsızlığı** — yukarıda Bölüm 2'de detaylandırıldı; gerçek proje tarihçesi bu klonda tam görünmüyor olabilir, GitHub'daki asıl repo doğrulanmalı.
2. **Ödeme altyapısı production'a hazır değil** — gelir modeli bu olmadan çalışmaz; iyzico/PayTR Edge Functions iskelet halinde.
3. **İki Edge Function 404 veriyor** (`post_chat_message`, `earthquakes_latest`) — production deploy eksikliği ya da yapılandırma sorunu olabilir, **kontrol edilmeli**.
4. **npm audit: 1 kritik + 16 yüksek zafiyet** — devDependency kaynaklı, ama yine de kapatılmalı (`npm audit fix` denenmeli).
5. **Gerçek veri kaynağı eksikleri** — PVGIS, AFAD/tapu entegrasyonları demo/heuristic veriyle çalışıyor; "gerçek zamanlı doğru veri" iddiası bu haliyle zayıf.
6. **KYC simülasyon düzeyinde** — gerçek kimlik doğrulama olmadan üretim/hukuki güvenilirlik sınırlı (`docs/SECURITY_STATUS.md` bunu zaten "kritik kalan" olarak işaretlemiş).
7. **Repo hijyeni** — aşırı sayıda kök-dizin rapor dosyası ve `_audit/` klasörü; yeni katılan bir geliştirici için kafa karıştırıcı, temizlik/arşivleme gerekiyor.
8. **Bağımlılık güncelliği** — birkaç paket bir majör sürüm geride; plansız topluca değil, kontrollü şekilde ele alınmalı.

---

## 6. Önerilen Sonraki Adımlar (öncelik sırasıyla)

### Kısa vade (birkaç gün)
1. `npm audit fix` çalıştırıp sonucu doğrula (typecheck+test+build tekrar koş).
2. 3 lint hatasını düzelt (`generate_changelog.js` parse hatası, `tasarim-olcum.mjs` boş blok, `SearchModal.tsx` hook bağımlılığı).
3. `post_chat_message` ve `earthquakes_latest` Edge Function'larının neden 404 döndüğünü teşhis et (deploy edilmiş mi, route/isim uyuşmazlığı mı) ve düzelt ya da fallback'i belgele.
4. GitHub'daki asıl `main` dalının commit geçmişini kontrol ederek Bölüm 2'deki tutarsızlığı netleştir.

### Orta vade (birkaç hafta)
1. Ödeme altyapısını (iyzico/PayTR) gerçek PSP entegrasyonu ve denetimiyle production'a hazırla.
2. PVGIS için gerçek API anahtarı al, AFAD/tapu için gerçek entegrasyon değerlendirmesi yap.
3. KYC akışını gerçek kimlik doğrulama sağlayıcısına bağla.
4. Kök dizindeki eski rapor dosyalarını (`SONUC*.md`, `FIX*_SONUC.md`, `*.bat` vb.) bir arşiv klasörüne taşı veya sil; `_audit/` içindeki eski/tek seferlik denetim klasörlerini temizle.

### Uzun vade (aylar)
1. War Room ve genel intelligence modüllerinde hedeflenen görsel redesign.
2. PDF rapor motoru (Puppeteer/ReportLab tarzı sunucu taraflı üretim).
3. Bağımlılıkları kontrollü biçimde major sürümlere taşı (Tailwind 4, Vite 8, TypeScript 7) — her biri ayrı PR'da, regresyon testiyle.
4. Mobil (Capacitor Android/iOS) için mağaza yayın hazırlığını tamamla (mevcut `mobile/store/` içinde taslak metinler var).

---

*Bu rapor, kod ve komutlar üzerinden bu oturumda doğrudan çalıştırılan kontrollerle (typecheck, lint, build, test, audit) ve repodaki mevcut denetim/rapor dosyalarının (özellikle `NEREDEYDIK.md`, `_audit/FEATURE_INVENTORY.md`, `docs/SECURITY_STATUS.md`) çapraz okunmasıyla hazırlanmıştır. "Kontrol edilmeli" olarak işaretlenen maddeler, bu oturumda doğrulanamayan veya varsayıma dayanmaması gereken noktalardır.*
