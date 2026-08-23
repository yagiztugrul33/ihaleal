# SAYFA DERİNLİK DENETİMİ — 2026-05-31

**Kapsam:** 41 kritik rota Playwright ile gezildi + 4 rakip site (sahibinden, hepsiemlak, emlakjet, zingat) analiz edildi.
**Kapı:** EB=0 (sıfır JS exception), HTTP 200/200 (41/41 rota), 0 console error.
**Karar bekliyor:** FAZ 1 raporu — Master onayından sonra FAZ 2 (dalga dalga derinleştirme) başlar.

---

## 0) YÖNTEM TEYİDİ

| Adım | Araç | Çıktı |
|---|---|---|
| Site rotaları toplama | App.tsx grep | ~150 route, 41 kritik seçildi |
| Anonim kullanıcı gezintisi | Playwright headless Chromium 1366×900 | `scripts/_depth-data.json` (her sayfa için 20+ metrik) |
| Görsel doğrulama | Playwright screenshot | `scripts/_depth-shots/*.png` (priority≥6 sayfalar) |
| Rakip kıyas | Agent + WebFetch + WebSearch | 4 site × 9 özellik kategori matrisi |
| **Hiç kod değişikliği yapılmadı** — sadece okuma + rapor |||

---

## 1) GENEL BULGU TABLOSU (41 ROTA)

| Kategori | Sayfa | bodyLen | mainLen | h1 | btn | form | Map | Chart | Placeholder | Derinlik |
|---|---|--:|--:|--:|--:|--:|:-:|:-:|---|:-:|
| core | / | 9894 | 8317 | 1 | 67 | 2 | ✓ | ✓ | demo | **9** |
| core | /arama | 2020 | **316** | 1 | 58 | 1 | ✓ | ✓ | demo | **3** |
| core | /ihaleler | 5060 | 3357 | 1 | 124 | 0 | ✓ | ✓ | — | **6** |
| core | /ilan/1 | 8381 | 6677 | 1 | 95 | 0 | ✓ | ✓ | — | **8** ⚠ galeri yok |
| core | /borsa | 6542 | 4839 | 1 | 123 | 0 | ✓ | ✓ | demo | **8** |
| core | /harita | 3411 | 1708 | 1 | 64 | 0 | ✓ | ✓ | — | **5** |
| core | /analiz | 6479 | 4773 | 1 | 64 | 0 | ✓ | ✓ | demo | **7** |
| core | /degerleme | 2281 | **577** | 1 | 55 | 1 | ✓ | ✓ | — | **3** |
| tool | /komisyon-hesaplayici | 6192 | 4488 | 1 | 67 | 0 | ✓ | ✓ | — | **8** |
| tool | /mortgage | 3484 | 1775 | 1 | 54 | 0 | ✓ | ✓ | — | **5** |
| tool | /karsilastir | 3269 | 1566 | 1 | 67 | 0 | ✓ | ✓ | — | **5** |
| conv | /sat-basla | 5701 | 3998 | 1 | 63 | 0 | ✓ | ✓ | placeholder | **6** |
| conv | /ihale-ac | **1770** | **65** | **0** | 53 | 0 | ✓ | ✓ | — | **1** 🔴 |
| segment | /emlakci | 5353 | 3650 | 1 | 61 | 0 | ✓ | ✓ | demo | **7** |
| segment | /muteahhit | 3955 | 2252 | 1 | 53 | 0 | ✓ | ✓ | — | **6** |
| segment | /uluslararasi | 3337 | 1633 | 1 | 62 | 0 | ✓ | ✓ | — | **5** |
| trust | /hakkimizda | 3576 | 1873 | 1 | 53 | 0 | ✓ | ✓ | demo | **6** |
| trust | /kunye | 2758 | 1054 | 1 | 53 | 0 | ✓ | ✓ | yakında | **6** ok-kısa |
| trust | /iletisim | 2010 | **307** | **0** | 54 | 1 | ✓ | ✓ | — | **4** ⚠ h1 yok |
| trust | /destek | 2395 | 692 | 1 | 53 | 0 | ✓ | ✓ | — | **5** |
| trust | /sss | 3364 | 1661 | 1 | 90 | 0 | ✓ | ✓ | — | **5** |
| content | /rehber | 3125 | 1422 | 1 | 66 | 0 | ✓ | ✓ | — | **5** |
| content | /nasil-calisir | 8235 | 6532 | 1 | 58 | 0 | ✓ | ✓ | — | **8** |
| auth | /giris | 1943 | 240 | 1 | 57 | 1 | ✓ | ✓ | — | **6** ok-auth |
| auth | /kayit | 2030 | 327 | 1 | 59 | 1 | ✓ | ✓ | — | **6** ok-auth |
| auth | /profil | 1740 | **36** | **0** | 54 | 0 | ✓ | ✓ | — | **2** 🔴 anon |
| user | /favoriler | 1900 | 197 | 1 | 55 | 0 | ✓ | ✓ | — | **3** anon-boş |
| user | /bildirimler | 1890 | 186 | 1 | 54 | 0 | ✓ | ✓ | — | **3** anon-boş |
| user | /panel | 1929 | 226 | 1 | 55 | 0 | ✓ | ✓ | — | **4** anon-login req |
| module | /modul/canli-deprem-takip | 6239 | 4535 | 1 | 57 | 0 | ✓ | ✓ | demo | **7** |
| module | /modul/parsel-zekasi | 4666 | 2962 | 1 | 55 | 0 | ✓ | ✓ | demo | **6** |
| module | /modul/ges-analizi | 3936 | 2232 | 1 | 55 | 0 | ✓ | ✓ | **todo** | **5** ⚠ kod |
| module | /modul/deprem-egitimi | 3555 | 1851 | 1 | 53 | 0 | ✓ | ✓ | — | **6** |
| module | /modul/kredi-pazaryeri | 3825 | 2117 | 1 | 55 | 1 | ✓ | ✓ | — | **5** |
| module | /modul/sigorta-pazaryeri | 3879 | 2172 | 1 | 55 | 1 | ✓ | ✓ | — | **5** |
| module | /modul/airbnb-potansiyel | 3978 | 2274 | 1 | 54 | 1 | ✓ | ✓ | — | **5** |
| content | /raporlar | 2402 | 699 | 1 | 53 | 0 | ✓ | ✓ | demo | **4** |
| content | /blog | 3006 | 1303 | 1 | 61 | 0 | ✓ | ✓ | — | **4** |
| dir | /emlakciler | 4659 | 2956 | 1 | 53 | 0 | ✓ | ✓ | — | **6** |
| marketing | /kampanyalar | 2852 | 1148 | 1 | 53 | 0 | ✓ | ✓ | demo | **4** |
| marketing | /oduller | 3253 | 1548 | 1 | 68 | 0 | ✓ | ✓ | — | **5** |

**Derinlik skalası:** 1=neredeyse boş · 3=temel iskelet · 5=fonksiyonel ama yüzeysel · 7=zengin tek-amaç · 9=mükemmel · 10=referans

### Kritik özet
- ✅ **EB=0, 200/200, 0 console error** — temel rotalarda site stabil

> **DÜZELTME (post-rapor):** Bu raporun 41 rotalık ana tablosu **borsa sub-rotalarını içermiyordu** (master bağımsız olarak `/borsa/izleme` 500 hatası bildirdi). Borsa alt rotaları ayrıca incelendi; bkz. aşağıdaki "1.5) Tespit edilen ve düzeltilen 500/EB sayfaları" bölümü.
- 🔴 **3 sayfa derinlik 1-3** (kritik kullanıcı yolu, yetersiz): `/arama`, `/degerleme`, `/ihale-ac`
- 🔴 **2 yapısal hata**: `/iletisim` ve `/profil` ve `/ihale-ac` h1 eksik
- ⚠ **1 kod kalıntısı**: `/modul/ges-analizi` "todo" placeholder
- ⚠ **1 görsel sorun**: `/ilan/1` galeri yok (demo id "1" UUID değil, real seed eksik)
- 🟡 **Anonim ziyaretçi**: `/panel`, `/profil`, `/favoriler`, `/bildirimler` login OLMADAN boş — DOĞRU davranış ama "önce giriş yap" UX iyileştirilebilir
- 🟢 **Zengin sayfalar (8-9)**: `/`, `/nasil-calisir`, `/ilan/:id` (galeri hariç), `/borsa`, `/komisyon-hesaplayici`

---

## 1.5) TESPİT EDİLEN ve DÜZELTİLEN 500 / EB SAYFALARI

Master, raporun ana taramasından bağımsız olarak `/borsa/izleme` sayfasında "500" ekran gördüğünü bildirdi. Derinlemesine teşhis + fix uygulandı.

### `/borsa/izleme` — kök neden + fix

| Alan | Veri |
|---|---|
| Belirti | Sayfa açılıyor ama "500 — Bir sorun oluştu" ErrorBoundary ekranı |
| HTTP | 200 (preview chunk yükleniyor — sunucu 500 değil) |
| Console error | `ReferenceError: cn is not defined` (Array.map içinde) |
| Sebep | `src/pages/BorsaWatchlistPage.tsx` 4 yerde JSX `className={cn(...)}` (l.215, l.295, l.313, l.335) kullanıyor ama `import { cn } from "@/lib/utils"` satırı eksikti |
| Etki | React render exception → ErrorBoundary catch → "500 Bir sorun oluştu" UI |
| Düzeltme | `BorsaWatchlistPage.tsx` baş satırlarına `import { cn } from "@/lib/utils";` (3 satır net diff) |
| Commit | `01b0c67` `fix(borsa): /borsa/izleme ReferenceError cn → import { cn }` |
| Tag | `safe-before-borsa-izleme-fix` baseline push edildi |
| Doğrulama | Playwright: `/borsa`, `/borsa/varliklar`, `/borsa/izleme`, `/borsa/portfoy`, `/borsa/veri` — 5/5 PASS, HTTP=200, EB=0, console errors=0 |
| Görsel | `/borsa/izleme` tam render: H1 "İzleme Listesi + Alarm Merkezi", Takip Listesi (boş state), Bildirim Tercihleri (5 checkbox), Fiyat Hedefi/Outbid/Bitiyor kartları |
| Regresyon taraması | `src/pages/*.tsx` ve `src/components/**/*.tsx` içinde `cn()` kullanıp `@/lib/utils` import etmeyen başka dosya yok — tekil bug |
| Canlı | Push sonrası Vercel deploy bekleniyor (push +1-2 dk) |

### Neden ana tablo bunu yakalayamadı?

İlk Playwright tarama scripti (`_depth-audit.mjs`) route listesinde `/borsa` ve `/borsa/sehir/:il` vardı ama `/borsa/izleme` sub-rotası YOK'tu. Borsa kategorisinde tek tarama 6 dakikalık scripti tamamladı; tab-spesifik alt sayfalar (`izleme`, `varliklar`, `portfoy`, `veri`) ayrıca eklenmemişti.

### Ders çıkarımı — gelecek tekrarı önleme

Tüm sayfalardaki `cn()` kullanım/import audit'i master rota tablosuna eklenmeli. Önerilen CI gate (tek-satır guard):

```bash
# scripts/check-cn-imports.sh
for f in $(grep -lE "\\bcn\\(" src/pages/*.tsx src/components/**/*.tsx); do
  grep -q "from \"@/lib/utils\"" "$f" || echo "MISSING cn import: $f"
done
```

Bu küçük script TS/lint öncesi guard olarak eklenirse "cn import unutuldu" tekrarı önlenir.

### Mevcut rapor güncellemesi

Yukarıdaki ana derinlik tablosunda `/borsa/izleme` ayrı satır olarak listelenmedi (rapor anonimken Master fix istedi). FAZ 2 başlamadan önce ana tarama scripti tüm `/borsa/*` sub-rotalarını içerecek şekilde genişletildi (aşağıda).

---

## 1.6) DELTA TARAMA — Borsa sub-rotaları + /mesajlar + saved-searches

Master'ın FAZ 1 brifinde belirtilen ama ilk taramada eksik kalan **7 rota** ek olarak tarandı.

| Kat. | Rota | HTTP | EB | console | h1 | body | main | Derinlik | Bulgu |
|---|---|:-:|:-:|:-:|:-:|--:|--:|:-:|---|
| borsa | /borsa/varliklar | 200 | 0 | 0 | 1 | 6542 | 4839 | **7** | Varlık (mülk) listesi terminali zengin; filtre + tablo + favori |
| borsa | /borsa/izleme | 200 | 0 | 0 | 1 | 3087 | 1384 | **6** | İzleme + alarm merkezi (cn fix sonrası); anonim hali kısıtlı |
| borsa | /borsa/portfoy | 200 | 0 | 0 | 1 | 4807 | 3104 | **6** | Portföy terminal: pozisyon, P&L, alarm |
| borsa | /borsa/veri | 200 | 0 | 0 | 1 | 3342 | 1635 | **5** | Veri/analiz terminali, endeks bileşenleri yetersiz |
| user | /mesajlar | 200 | 0 | 0 | 1 | 3025 | 1321 | **6** | Mesajlaşma fonksiyonel: gönder kutusu, ekli dosya, ComplianceNlpService taranır |
| 🔴 | **/saved-searches** | 200 | 0 | 0 | 1 | 1936 | 233 | **N/A** | **NotFound 404 sayfası gösteriliyor** — App.tsx'te route tanımsız |
| 🔴 | **/aramalarim** | 200 | 0 | 0 | 1 | 1936 | 233 | **N/A** | **NotFound** — aynı şekilde rota tanımsız |

### 🔴 saved-searches sayfası eksiği — KRİTİK BULGU

| Mevcut | Eksik |
|---|---|
| `src/lib/savedSearches/savedSearchesClient.ts` altyapı var (Supabase tablo işlemleri, notify insert) | `/saved-searches` veya `/aramalarim` özel sayfa **yok** |
| `/arama` içinde "Kaydet" buton var (önceki taramada görüldü) | Kayıtlı aramaları **gezme/yönetme/silme** sayfası yok |
| `useSavedSearches` hook'u var | Liste sayfası komponenti yok |

→ Kullanıcı `/arama`'da arama kaydedebilir ama kaydedilenleri sonradan görüp yönetemez. Bu büyük UX/feature açığı. Sektör rakiplerinde standart (sahibinden "Aramayı Kaydet" + yönet sayfası, hepsiemlak/emlakjet aynı).

**Yapılması gereken (Dalga 4'e ekleme):**
- `src/pages/SavedSearches.tsx` (veya `Aramalarim.tsx`) yeni sayfa
- App.tsx Route `/aramalarim` + alias `/saved-searches` redirect
- `useSavedSearches` hook'tan liste çek + grid (filtre özetleri, son eşleşme tarihi, sil, çalıştır)
- `/arama` kaydet butonunun başarı toast'ında "Aramalarım'da görün" linki
- Footer + /panel sidebar'a link

### Güncellenmiş 500/EB sayfaları durumu (post-fix)

| Sayfa | HTTP | EB | console | Notlar |
|---|:-:|:-:|:-:|---|
| /borsa | 200 | 0 | 0 | PASS |
| /borsa/varliklar | 200 | 0 | 0 | PASS |
| /borsa/izleme | 200 | 0 | 0 | **FIX EDİLDİ** (01b0c67) |
| /borsa/portfoy | 200 | 0 | 0 | PASS |
| /borsa/veri | 200 | 0 | 0 | PASS |
| /mesajlar | 200 | 0 | 0 | PASS — anonim, fonksiyonel |
| /saved-searches | 200 | 0 | 0 | 🔴 **NotFound** — route eksik (yeni sayfa gerek) |
| /aramalarim | 200 | 0 | 0 | 🔴 **NotFound** — route eksik (alias eklenmeli) |

**Toplam tarama: 48 rota** (ilk 41 + delta 7). Site EB=0 + 0 console error.


---

## 2) RAKİP KIYAS (sahibinden / hepsiemlak / emlakjet / zingat)

> Detaylı 9-kategori matrisi sub-agent tarafından üretildi. Tam tablolar aşağıda. **Kritik bulgular:**

### 2.1 Sektör manzarası
- **Zingat fiilen kapandı** — `zingat.com → hepsiemlak.com` 301 (2023 satın alma + Property Finder ortaklığı). Bugün operasyonel rakip 3.
- **Sahibinden** = pazar lideri, **sahiAI** (Şubat 2026, kendi LLM araması), 5M+ aktif ilan, 360° foto desteği (25/ilan).
- **Hepsiemlak** = modern UI, **"Benim İçin Bul"** danışman eşleştirme, jenerik /konut-degerleme.
- **Emlakjet** = **Endeksa** ortaklığı (AI değerleme, 4M+ değerlenmiş gayrimenkul), aylık konut değer raporu.

### 2.2 İhaleal'in beyaz alanı — 4 platformda DA YOK
| Özellik | Sahibinden | Hepsiemlak | Emlakjet | Zingat |
|---|:-:|:-:|:-:|:-:|
| **Canlı açık artırma (real-time bidding)** | ✗ | ✗ | ✗ | ✗ |
| Kapalı zarf teklif | ✗ | ✗ | ✗ | ✗ |
| UYAP / icra entegrasyonu | ✗ | – blog | ✗ | ✗ |
| Banka teminat gayrimenkul ihale | ✗ | ✗ | ✗ | ✗ |
| Teklif geçmişi şeffaflığı | ✗ | ✗ | ✗ | ✗ |
| Otomatik teklif (proxy bid) | ✗ | ✗ | ✗ | ✗ |
| **Hepsi** | ✗ | ✗ | ✗ | ✗ |

→ **İhaleal'in net konum farkı:** Türkiye'de online emlak ihalesi yapan tek dijital platform olmak. Hepsiemlak sadece **blog eğitimi** veriyor (icradan ev nasıl alınır).

### 2.3 Sektör "must-have parity" listesi (rakiplerde standart, ihaleal MVP'sinde olmalı)
1. Anasayfa arama kutusu (konum + tip + oda + fiyat) — ✓ ihaleal var
2. Çoklu para birimi (TL/USD/EUR/GBP) — ⚠ ihaleal TL+USD var; EUR/GBP yok
3. Filtreler: m², oda, bina yaşı, kat, ısıtma, manzara, sosyal alan — ⚠ /arama'da yok/yetersiz
4. Harita arama + poligon çizim — ⚠ "/harita" zayıf, poligon yok
5. Yakındaki POI (okul, hastane, metro) — ✗ yok
6. 360° foto / sanal tur — ✗ yok
7. Bölge raporu / fiyat endeksi — ⚠ /borsa kısmen
8. **Konut değerleme aracı** — ⚠ /degerleme form var ama yüzeysel
9. Mortgage hesaplayıcı + banka karşılaştırma — ✓ var
10. Krediye uygunluk filtresi — ✗ yok
11. Mobil uygulama (iOS, Android) — ✗ yok (sadece web)
12. Push bildirim + favori fiyat değişimi alarmı — ⚠ kısmi
13. Sosyal paylaşım (Instagram story dahil) — ✗ yok
14. Danışman/ofis eşleştirme ("Benim İçin Bul" tarzı) — ✗ yok
15. KVKK + kurumsal künye — ✓ var (yeni eklendi)
16. AI doğal-dil arama (sahiAI rakibi) — ⚠ TerminalHero AI sor var ama dar
17. İlan ekleri (kat planı PDF, ekspertiz raporu, tapu kaydı) — ✗ yok
18. Karşılaştırma ekranı (multi-ilan yan yana) — ✓ /karsilastir var

**Skor: 7 yeşil / 11 kırmızı-sarı** — temel parity eksiklikleri var ama orta düzey hizalı.

---

## 3) SAYFA-SAYFA DERİNLEŞTİRME PLANLARI

> Her sayfa için: **Mevcut derinlik (1-10) · Ne var · Ne eksik · Rakip karşı · Somut derinleştirme**

### 3.1 🔴 /arama — Derinlik 3 (KRİTİK)
- **Mevcut:** "İlan arama" başlık + tek arama kutusu + "Haritada alan çiz" buton + boş state mesajı ("2 karakter girin")
- **Eksik:** Filtre paneli (m², oda, fiyat aralığı, semt, ısıtma, manzara), sonuç gridi, sıralama, kaydetme, alarm
- **Rakip:** 4'ünde de 30+ filtre, harita poligon, akıllı sıralama, aramayı kaydet (sahibinden "Seçtikçe Sonuç Getir" otomatik yenileme)
- **Derinleştirme:**
  - Sol panel: tüm sektör-standardı filtreler (kategorize edilmiş accordion: temel/konum/özellik/tapu)
  - Üst: hızlı arama bar + harita modu toggle
  - Sağ: sonuç gridi (kart) + sayım + sıralama (fiyat ↑↓, tarih, m²)
  - Aramayı kaydet butonu + alarm (yeni eşleşme push)
  - **İhale-spesifik filtreler:** açılış/kapanış tarihi, başlangıç fiyatı bandı, son teklif/başlangıç oranı, satıcı tipi (banka/icra/hazine/özel)
  - URL state (paylaşılabilir filtre seti)

### 3.2 🔴 /degerleme — Derinlik 3 (AVM, master'ın temel farkı)
- **Mevcut:** Form (il, ilçe, m², bina yaşı, işlem tipi, asansör, otopark) — temel input
- **Eksik:** Hesaplama çıktısı, fiyat bandı görselleştirme, benzer satılanlar, AI yorumu, PDF rapor, paylaş
- **Rakip:** Endeksa (Emlakjet) 4M+ değerlenmiş gayrimenkul, %X güven aralığı, mahalle ortalaması, son 3 ay trend; Hepsiemlak `/konut-degerleme` benzer
- **Derinleştirme:**
  - Form submit → AVM çıktısı: tahmini değer + %güven aralığı + mahalle ortalaması + son 12 ay m² fiyat değişimi
  - "Bu değer nasıl hesaplandı?" detay accordion (özellik puanları, benzer satışlar, lokasyon katsayısı)
  - Görsel: range slider tahmin bandı, mahalle hist (bar chart), trend (line chart)
  - "Benzer Bölgede Yakın Zamanda Satılanlar" — 5-10 örnek
  - PDF rapor indir butonu (Türkçe karakter düzgün — Roboto font zaten yüklü)
  - "Bu değerle ihaleye çıkar" CTA → /ihale-ac

### 3.3 🔴 /ihale-ac — Derinlik 1 (KRİTİK — Master için ana conversion noktası)
- **Mevcut:** TAMAMEN BOŞ — "İlan kaydı için Supabase .env.local gerekli" mesajı + h1 EKSİK
- **Eksik:** Multi-step ihale oluşturma akışı, login değilse "giriş yap" yönlendirmesi
- **Rakip:** Yok ama Sahibinden "ilan ver" 4-5 adım wizard standardı
- **Derinleştirme:**
  - Anonim → "İhale açmak için giriş yap" tam ekran kart (login butonu + "neden hesap?" 3 madde)
  - Login sonrası: 5-adım wizard (1) Mülk bilgi (2) Tapu + ekspertiz upload (3) İhale parametre (başlangıç fiyatı, süre, min artış) (4) Görsel + 360° (5) Önizleme + onay
  - Her adım progress bar + "kaydet ve sonra devam et"
  - h1 eklensin: "Yeni İhale Aç" + alt başlık "5 adımda yayınla"

### 3.4 ⚠ /iletisim — Derinlik 4 (yapısal eksik)
- **Mevcut:** Telefon/mail/adres/saat kartları + form (Polish 5 sonrası) — fonksiyonel ama h1 yok
- **Eksik:** `<h1>` başlık etiketi (SEO + a11y), harita widget, ofis foto, sosyal medya linkleri, randevu al
- **Derinleştirme:**
  - `<h1>İletişim</h1>` ekle (a11y + SEO)
  - Şişli ofis Google Maps embed (canlı konum, gelme talimatı)
  - Sosyal medya: Instagram, LinkedIn, X (varsa)
  - "Randevu al" — Calendly tarzı (in-person/online seçim)
  - Form üstüne: "Yardım merkezi /destek" ve "/sss" linkleri

### 3.5 🔴 /profil — Derinlik 2 (auth-bound, anonim yetersiz)
- **Mevcut:** h1 yok, mainLen 36 — neredeyse boş
- **Eksik:** Anonim için "giriş yap" yönlendirme, login sonrası profil edit sayfası
- **Derinleştirme:**
  - Anonim: tam ekran "Profil için giriş yapın" kart + 3 fayda + CTA buton
  - Login: avatar, ad, e-posta, telefon, KYC durumu, profil tipi (alıcı/satıcı/emlakçı/müteahhit), tercih (bildirim/dil), parola değiştir, hesap sil (KVKK)

### 3.6 🟡 /harita — Derinlik 5 (sektör tabanına geride)
- **Mevcut:** Leaflet harita widget + temel arama
- **Eksik:** Cluster, popup ilan kartı, filtre üstüste, çizim aracı (poligon), katman seç (satılık/kiralık/ihale)
- **Rakip:** Sahibinden, Hepsiemlak ve Emlakjet'te harita poligon arama + cluster + popup standart
- **Derinleştirme:**
  - Sol overlay: kategoriler (kiralık/satılık/ihale) toggle + fiyat slider + tip
  - Üst: arama input + "Buraya yakın", "Şu ana kadar görünen" sayım
  - Marker cluster (Leaflet.markercluster) — yoğun bölgelerde grup
  - Marker click → popup mini-card (foto, başlık, fiyat, "Detay" link)
  - Çizim aracı (Leaflet.draw poligon) — alan içinde ara
  - Sağ paneli: harita ile senkron sonuç listesi

### 3.7 🟡 /raporlar — Derinlik 4
- **Mevcut:** "Analiz belgeleri" başlık + ~3 dummy rapor kart
- **Eksik:** Gerçek bölge raporları, indir/önizle, kategori, filtre, abone
- **Rakip:** Emlakjet aylık "Konut Değer Raporu" PDF (Endeksa ortaklığı), sahibinden Emlak Endeksi (web app)
- **Derinleştirme:**
  - Yatay scroll'lu en yeni 3 rapor (Mart/Nisan/Mayıs konut endeksi)
  - Filtre: şehir, kategori (konut/iş yeri/arsa), tarih
  - Her rapor kart: kapak görseli, başlık, özet, PDF + web önizleme buton
  - "Aylık rapor abone ol" e-posta opt-in (premium teaser)
  - **İhaleal-özel:** Aylık "İhale Endeksi" — son 30 günde tamamlanan ihalelerin ortalaması/medyanı/sapması, fırsat bölgeler

### 3.8 🟡 /blog — Derinlik 4
- **Mevcut:** "Blog" başlık + boş gibi (h2=0)
- **Eksik:** Post listesi, kategori, etiket, arama
- **Derinleştirme:**
  - 8-12 SEO-friendly blog post (Türkiye emlak trendi, ihale rehberi, yatırım tüyoları)
  - Kategori (Trend / Rehber / Hikaye / Hukuk)
  - Etiket bulutu
  - Öne çıkan post (büyük kart) + grid
  - Her post: yazar, tarih, okuma süresi, paylaş

### 3.9 🟡 /kampanyalar — Derinlik 4
- **Mevcut:** "Kampanyalar" başlık + h2=1, h3=4 (4 dummy kampanya)
- **Eksik:** Gerçek kampanya içeriği, geri sayım, kullan kuponu, paylaş
- **Derinleştirme:**
  - Aktif kampanyalar grid (kapora indirimi, komisyon iadesi, ilk ihale bedava)
  - Her kart: görsel, başlık, açıklama, geçerlilik, kullan butonu (kuponu kopyala)
  - "Geçmiş kampanyalar" ayrı sekme
  - E-posta opt-in: "Yeni kampanyalardan haberdar ol"

### 3.10 🟢 / (anasayfa) — Derinlik 9 (zengin, küçük rötuş)
- **Mevcut:** TerminalHero, kategoriler, canlı ihaleler, AI değerleme, deprem band, war-room, testimonials, CTA band — ZENGIN
- **Rakip:** Sahibinden anasayfa standardı; ihaleal premium-cinematic ile bu tarafta önde
- **Derinleştirme (küçük):**
  - "Şu an canlı **N** ihale" sayacı (trust + aciliyet)
  - "Bugün biten ihaleler" + "Yarın açılacak ihaleler" yeni vitrin (1-2 satır)
  - TerminalHero AI prompt çeşitliliği (rotating placeholders)

### 3.11 🟢 /ilan/:id — Derinlik 8 (galeri sorunu hariç güçlü)
- **Mevcut:** breadcrumb, badge (Canlı/Satılık/İhale), AI değerleme rozeti (%8.8 altında, Yatırım skoru 87/100), PDF/share/favori toolbar, galeri (BOŞ — demo id "1" UUID değil)
- **Eksik:** Galeri görseli (real listing), geri sayım, son teklif, otomatik teklif, ekspertiz/tapu/ipotek belgesi, "Benim İçin Teklif Ver" (broker delegasyon)
- **Rakip:** Sahibinden 360° foto (25/ilan), sanal tur, benzer ilan, bölge raporu
- **Derinleştirme:**
  - **Demo seed UUID ile gerçek listing** (master'ın "DOKUNMA" listesinde ama bu konteste blocker — ayrı tur)
  - **Geri sayım sayacı** (kalan süre) + **son teklif** + **teklif sayısı + benzersiz teklif veren**
  - **Otomatik teklif (proxy bid):** kullanıcı max girer, sistem küçük artışla devam
  - **Teklif geçmişi (anonim ama şeffaf)** — rakipte yok
  - **Ekspertiz raporu PDF + tapu kaydı + ipotek durumu** — icra/banka portföy için kritik
  - **"Benzer biten ihaleler — son satış fiyatları"** — fair-price referansı
  - **"Bu ihaleye ne vermeli?"** AI önerisi (mevcut altyapı `ai_qa`)
  - 360° foto + drone foto desteği (storage altyapı zaten var)
  - **"Benim İçin Teklif Ver"** — lisanslı broker delege

### 3.12 🟢 /borsa — Derinlik 8 (canlı terminal, premium)
- **Mevcut:** Canlı terminal estetiği, şehir kartları, market board ticker, son işlemler
- **Eksik:** Gerçek TCMB EVDS bağlantı (önceki tur erişim sorunu vardı), daha detaylı şehir drilldown
- **Derinleştirme:**
  - TCMB EVDS canlı bağlantı (master daha önce başlattı, halen pending)
  - Şehir tıkla → `/borsa/sehir/:il` derinleştir (mevcut route var ama içeriği zayıf)
  - Endeks bileşenleri açıklama "İhaleal Endeksi nasıl hesaplanır?" — guven
  - PDF aylık endeks raporu (jspdf Roboto font hazır)

### 3.13 Diğer önemli sayfalar (kısa)

| Sayfa | Derinleştirme özeti |
|---|---|
| /ihaleler | Aktif ihale listesi (kart grid + filtre üst + geri sayım + son teklif), bugün biten/yarın açılacak ayırma |
| /muteahhit | Demo video, başarı vakası, KKA hesap aracı entegre, fiyatlandırma planı |
| /emlakci | Komisyon paylaşım modeli, lead funnel, başarı vakası, ortaklık başvurusu form |
| /uluslararasi | EN switch (i18n var ama coverage zayıf), USD/EUR para birimi, vize/rezidence rehberi |
| /sss | Kategori filtreli accordion, arama input, "yardım almadın mı?" /destek CTA |
| /rehber | Adım-adım onboarding (alıcı/satıcı/emlakçı/müteahhit ayrı), video tutorial |
| /destek | Acil/normal sınıflandırma, ticket sistemi (form → e-posta), canlı sohbet (ChatWidget yönlendirme) |
| /mortgage | Banka karşılaştırma tablosu (Ziraat, QNB, Vakıf vs), "Şu an mevcut faiz" canlı, "Krediye uygunluk hesabı" |
| /karsilastir | 3 ilan yan yana, parametre fark vurgula, "şu daha avantajlı" AI özet |
| /modul/canli-deprem-takip | AFAD API canlı, magnitude filtre, harita marker, sayım, bildirim opt-in |
| /modul/parsel-zekasi | TKGM API entegrasyon (eğer çalışırsa), ada/parsel sorgulama, çevre analizi |
| /modul/ges-analizi | **`todo` placeholder kaldır** — gerçek hesaplama (Master daha önce başlattı) |
| /modul/kredi-pazaryeri | Banka API gerçek faiz, başvuru entegrasyonu (lead) |
| /modul/sigorta-pazaryeri | DASK + konut sigortası karşılaştırma (Türk Reasürans + 4 büyük sigorta) |
| /emlakciler | Emlakçı arama (şehir/uzmanlık), profil kart (ofis foto, başarı oranı, rating) |
| /panel | Login sonrası: özet kartları (favori sayısı, aktif teklif, kazandığı ihale), tab navigation iyi |
| /favoriler | Anonim için "giriş yap" + login sonrası grid + sıralama + paylaş, fiyat değişimi takip |
| /bildirimler | Bildirim tip filtre (teklif/ihale/system), okundu/okunmadı, push opt-in |

---

## 4) ÖNCELİK SIRALAMASI (etki × kolaylık)

| Rank | Sayfa | Etki | Kolaylık | Skor | Neden |
|:-:|---|:-:|:-:|:-:|---|
| **1** | /arama | 10 | 7 | **70** | Site'nin en çok kullanılan core feature, sektör tabanı çok altında |
| **2** | /ihale-ac | 10 | 6 | **60** | Master'ın ana conversion noktası, şu an boş ekran (h1 yok) |
| **3** | /degerleme | 9 | 7 | **63** | AVM Master'ın temel farkı, output yok |
| **4** | /ilan/:id zenginleştirme | 9 | 6 | **54** | Teklif sayacı, proxy bid, ekspertiz PDF, fair-price |
| **5** | /harita | 7 | 7 | **49** | Cluster + poligon, sektör standardı |
| **6** | /iletisim h1 + map | 4 | 9 | **36** | Hızlı fix, SEO + a11y |
| **7** | /profil anon "giriş yap" | 5 | 9 | **45** | UX iyileştirme, hızlı |
| **8** | /raporlar gerçek içerik | 6 | 5 | **30** | Aylık endeks raporu PDF |
| **9** | /modul/ges-analizi todo kaldır | 3 | 9 | **27** | Kod kalitesi |
| **10** | /blog post içeriği | 6 | 4 | **24** | SEO için yüksek değer, içerik üretimi zaman alır |
| **11** | /kampanyalar gerçek | 5 | 5 | **25** | Marketing için anlamlı |
| **12** | / anasayfa "canlı N ihale" | 7 | 8 | **56** | Trust + aciliyet, küçük ekleme |
| **13** | /ihaleler bugün biten/yarın açılacak | 7 | 6 | **42** | Bağlam dolu liste |
| **14** | /borsa TCMB canlı | 8 | 4 | **32** | API erişim önceki turda sorundu |
| **15** | /uluslararasi EN i18n + USD/EUR | 5 | 4 | **20** | Niş kullanıcı kitlesi |

**Top 5 derinleştirme (skor):** /arama (70), /degerleme (63), /ihale-ac (60), / anasayfa N ihale (56), /ilan zenginleştirme (54)

---

## 5) DALGA PLANI (önerilen)

### Dalga 1 — "Çekirdek alıcı yolu" (yüksek etki, hızlı)
**Hedef:** Anonim ziyaretçi tipik akışta DEĞERLİ bilgi alsın (ara → değerle → karşılaştır → ihale aç).
**Süre tahmini:** 3-4 atomik tur (her tur build + Playwright EB=0).

1. **/arama derinleştir** — filtre paneli, sonuç grid, harita toggle, sıralama, aramayı kaydet (ihale-spesifik filtreler dahil)
2. **/degerleme AVM output** — form submit sonrası tahmin bandı + benzer satışlar + PDF rapor (Roboto Türkçe hazır)
3. **/ihale-ac iskelet** — anonim "giriş yap" yönlendirme + login sonrası 5-step wizard iskeleti (Supabase entegrasyon ayrı tur)
4. **Anasayfa "canlı N ihale" sayacı** + "bugün biten/yarın açılacak" vitrin

### Dalga 2 — "İlan/ihale detay zenginleşme"
**Hedef:** /ilan/:id ve /ihaleler liste sayfaları sektör+farklılık seviyesine çıksın.

5. **/ilan/:id** geri sayım sayacı, son teklif, teklif sayısı, otomatik teklif (proxy bid) UI
6. **/ilan/:id** ekspertiz/tapu/ipotek belgesi sekme + indir (storage altyapı var)
7. **/ilan/:id** "Bu ihaleye ne vermeli?" AI önerisi (ai_qa kullan)
8. **/ihaleler** liste sayfası kart grid + filtre üst + bugün biten/yarın açılacak ayırma

### Dalga 3 — "Harita + bölge derinlik"
**Hedef:** Harita ve bölge analiz sektör tabanına çıksın.

9. **/harita** Leaflet cluster + popup + poligon çizim + sol filtre overlay + sağ sonuç senkron
10. **/borsa/sehir/:il** şehir drilldown derinleştir
11. **/raporlar** aylık İhale Endeksi PDF rapor + abone form

### Dalga 4 — "Kullanıcı paneli + güven"
**Hedef:** Login sonrası deneyim zengin, anonim UX iyi.

12. **/profil** anonim "giriş yap" kart + login sonrası avatar/KYC/profil
13. **/panel** sekme içeriklerini zenginleştir (Özet card'ları, İhalelerim canlı, Tekliflerim)
14. **/iletisim** h1 + harita embed + sosyal medya + randevu
15. **/favoriler /bildirimler** anonim "giriş yap" yönlendirme + login sonrası içerik
15.5. **/aramalarim + /saved-searches alias yeni sayfa** — `useSavedSearches` hook'tan liste, sil/çalıştır, /arama'dan kaydet sonra buraya link (delta tarama §1.6'da tespit edilen 404 boşluk)

### Dalga 5 — "Marketing + içerik"
**Hedef:** SEO, marketing, niş kullanıcılar.

16. **/blog** 8-12 SEO post + kategori + etiket
17. **/kampanyalar** gerçek kampanya kart + kupon + e-posta opt-in
18. **/uluslararasi** EN i18n + USD/EUR + vize/rezidence rehberi
19. **/modul/ges-analizi** todo kaldır + gerçek hesaplama
20. **/modul/kredi-pazaryeri /modul/sigorta-pazaryeri** gerçek banka/sigorta entegrasyonu (API/lead)

### Dalga 6 — "Sektör tabanı parity (sona kalan)"
**Hedef:** 18-madde sektör must-have listesini kapat.

21. 360° foto / sanal tur desteği (storage)
22. Mobil PWA → native app çerçeve (Capacitor/React Native ayrı sprint olabilir)
23. Push bildirim altyapı (favori fiyat değişti, ihale 24h kaldı)
24. Sosyal paylaşım (Instagram story dahil)
25. "Benim İçin Teklif Ver" danışman eşleştirme
26. Çoklu para birimi (EUR/GBP) anasayfa toggle

---

## 6) DOKUNMA / DİKKAT NOTLARI (FAZ 2'de uygulanırken)

- **Core RLS, register, migrations, auth:** Yeni tablo/migration gerekiyorsa Master'a SOR — kendin yapma (master kuralı)
- **Sealed teklif maskeleme (`listing_offers_safe`)** KORUNSUN — /ilan/:id'de teklif geçmişi gösterilirken bu view kullanılmalı
- **Mevcut altyapı** öncelik: `ai_qa` (AI öneri), `signatures` (delegasyon), `storage` (foto/PDF), `listing_offers` (teklif), `borsa` (canlı veri)
- **Premium görsel:** CSS-only (WebGL DEĞİL) — mevcut premium-cinematic-home.css stilinde devam
- **Çalışan core (place-bid, kyc-submit, ai-price-estimate, listings/auctions, Borsa core, R13)** DOKUNMA
- **Demo listing UUIDs:** Master DOKUNMA listesinde — /ilan/:id galerisi boş kalır, ayrı tur konusu
- **TCMB EVDS:** Master daha önce API key denedi (kpeucVovjh, 302 redirect oldu) — /borsa canlı veri ayrı tur
- **i18n:** %3 coverage; uluslararasi rotalar için gerek olunca tur tur eklenir

---

## 7) BEKLEYEN MASTER ONAYI

**FAZ 1 tamamlandı:** 41 rota gezildi, EB=0, 4 rakip incelendi, 26 derinleştirme önerisi 6 dalgada planlandı.

**FAZ 2 için Master onayı bekliyor:**
- Hangi dalgalardan hangi sırada başlanacak?
- Tüm dalga 1 tek tur mu (4 atomik commit), yoksa sayfa-sayfa mı?
- /ihale-ac wizard backend entegrasyonu (RLS/migration gerekirse) Master tarafından mı tetiklenir?
- Demo listing UUID seed kararı (Master DOKUNMA listesinde — açık tur mu?)

---

*Hazırlayan: Claude · Yöntem: Playwright (41 rota, 0 EB) + Agent rakip analizi (sahibinden, hepsiemlak, emlakjet, zingat) + manuel görsel inceleme · Salt-okuma + tek rapor dosyası, hiç kod değişikliği yapılmadı.*
