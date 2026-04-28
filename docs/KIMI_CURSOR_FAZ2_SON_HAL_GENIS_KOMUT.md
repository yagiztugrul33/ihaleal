# KİMİ + CURSOR — FAZ 2: SON HAL · GENİŞ KONTROL KOMUTU (ihaleal.com)

**Kullanım:** Bu dosyanın **tamamını** aynı anda **Kimi** ve **Cursor**a yapıştırın.

**Önce senkron iskelesi:** `docs/SENKRON_TEK_KOMUT.md` + `docs/sync/STATE.md` (`next_kimi_tasks` / `next_cursor_tasks` buraya K51–K70 ve X21–X40 maddeleriyle yazılır). Önceki maraton bitti sayılır; bu belge **yeni görevleri** tanımlar. **Patrona soru sormayın**; blokörde `varsayım:` kullanın.

**Üst bağlam (değişmez):** `docs/SOZLESMESONRASI_TEK_KOMUT.md` §A + `docs/KIMI_CURSOR_UZUN_MARATON_KOMUT.md` §0–§2 (telif, roller, kuzey yıldızı).

**Faz 1 tamamlandı (tekrar yapılmaz; yalnızca regresyon kontrolü):**

- [x] K36–K48: Yetki özeti, taahhüt SSS, ekspertiz metni, resmi belge, piyasa raporu, yolculuklar, e-posta, moderasyon/risk/pitch/video vb.  
- [x] K49–K50 / X1–X20: Rota doğrulama, kod maratonu, hukuk dokümanları, MARATON raporu, KONTROL komutu.  
- [x] Build + Deploy + ZIP (pipeline bir kez yeşil ise Faz 2’de **sadece kırılırsa** onarılır).

---

## 0) Telif ve hukuki sınır (Faz 2’de de zorunlu)

- Üçüncü taraf **sözleşme / rapor PDF** içeriği **kelimesi kelimesine** aktarılamaz, OCR ile transkribe edilmez, rakip sözleşme **alıntısı** yapılmaz.  
- Ürün metni **ihaleal orijinal** dille; “taslak / demo / avukat onayı” uyarıları korunur.  
- Kimi **repo dosyası yazamaz**; çıktıyı düz metin veya önerilen dosya adıyla verir. Cursor **dosyalar** ve **test kanıtı** ile entegre eder.

---

## 1) Roller ve çakışma önleme (Faz 2)

| Alan | Kimi | Cursor |
|------|------|--------|
| `src/**/*.tsx`, `src/**/*.ts` | Sadece **kısa TSX blok önerisi** (isteğe bağlı); dosyayı iddia etme | Okuma, patch, `typecheck` + `build` + `test:run` |
| `docs/icerik/faz2-kimi/` | **Önerilen** çıktı yolu: buraya yapıştırılacak metinlerin tamamı (K51+ başlıklarıyla) | Klasörü oluşturur; Kimi metnini **doğrular** ve ürüne **gömülü** hale getirir |
| `docs/hukuk/` | Madde taslağı / kullanıcı özeti **metin** | §0 tablo, yol haritası, **kod yolu** sütunu; avukat notlarına dokunma |
| `docs/MARATON_CURSOR_RAPORU.md` | Okuyabilir; yazmaz | Faz 2 sonunda **ek bölüm** veya `docs/MARATON_FAZ2_RAPORU.md` |

**Aynı oturumda çakışma yasağı:** Kimi uzun TSX gönderirken Cursor aynı dosyada patch atmasın. Sıra: **Kimi metin → Cursor entegrasyon → tekrar test.**

---

## 2) Kuzey yıldızı (kısa teyit)

İlan **kartı + liste + detay + oluşturma formu** üçlüsünde: piyasa raporu, ekspertiz, resmi belge, taahhüt hikâyesi **tutarlı**; komisyon dili **matrah / anlaşılan tutar** ile uyumlu; vitrin/doping/reklam **hedef dışı** (§A). Demo gerçeği gizlenmez.

---

## 3) KİMİ — Faz 2 geniş görevler (K51–K70)

**Format (her K için zorunlu):** `### K{n}` + maddeler + satır sonu **Kaynak:** gözlem | varsayım | kullanıcı + ayrı satır **Varsayım:** …

Metinleri mümkünse doğrudan `docs/icerik/faz2-kimi/K{n}-baslik.md` yapısında verilecek şekilde başlık öner (Cursor dosyayı oluşturur).

- **K51** — **Yetki sözleşmesi kullanıcı özeti (tam):** 800–1200 kelime; tek muhatap, dolaşım fikri (hukuki bağlayıcı dil değil), komisyon matrahı, kira 1 aylık kira + KDV; kapanışta avukat uyarısı. (K36 kısaysa **genişlet**, tekrar değil.)  
- **K52** — **Taahhüt + cezai şart:** K37’yi **genişlet** — toplam **20** soru-cevap (ilk 10 mevcut çerçevede kalabilir); iddiasız dil.  
- **K53** — **Form hata mesajları sözlüğü:** CreateAuction / teklif / giriş benzeri alanlar için **kısa TR** mesaj listesi (20+ satır); teknik jargon yok.  
- **K54** — **Boş durum (empty state) metinleri:** favori yok, arama sonuç yok, portföy boş, karşılaştırma 0–1 ilan vb. — her biri başlık + 2 cümle + CTA.  
- **K55** — **Bildirim metinleri (taslak):** push veya in-app için 12 kısa metin (ilan hatırlatma, ekspertiz eksik, teklif geldi — hepsi “üretimde” çerçevesi).  
- **K56** — **KVKK / gizlilik “kullanıcı dostu” özet:** 1 sayfa; hangi veri neden; silme talebi cümlesi (hukuki iddia yok).  
- **K57** — **Karşılaştırma sayfası mikro metin:** tablo satır başlıkları için tek cümlelik açıklama (Rapor/belge şeridi, skorlar); tutarlılık notları.  
- **K58** — **Satıcı kontrol listesi ↔ form alanı eşlemesi:** Markdown tablo: “Satıcı adımı” | “CreateAuction alanı / UI” | “Kullanıcıya not”.  
- **K59** — **Demo vs canlı uyarı paketi:** 10 hazır cümle (banner, footer, ayarlar için); çelişki yok.  
- **K60** — **İngilizce FAQ:** 15 soru-cevap; yatırımcı + son kullanıcı karışık.  
- **K61** — **Basın bülteni taslağı:** ~400 kelime; rakip ismi yok; “AI destekli GM platformu”.  
- **K62** — **Uygulama mağazası listing (gelecek):** kısa açıklama + uzun açıklama + 5 madde özellik (Türkçe).  
- **K63** — **Onboarding / ipucu metinleri:** 15 kısa tooltip (max 120 karakter); hangi ekran için olduğunu etiketle.  
- **K64** — **Moderasyon genişletme:** K45 üzerine şikayet kategorileri + örnek yanıt tonu (3 senaryo).  
- **K65** — **Risk register genişletme:** K46 üzerine **+15** satır (olasınlık/etki tek kelime + not).  
- **K66** — **Satıcı e-postası 3 şablon:** ilan yayında, ekspertiz reddedildi, taahhüt limit güncellendi (konu + gövde iskeleti).  
- **K67** — **Video senaryosu #2 (120 sn):** K48’ten farklı açı (ör. satıcı paneli + belge yükleme akışı).  
- **K68** — **“Veri odası” geniş pitch:** K47 üzerine 3 paragraf (TR veya EN — tutarlı tek dil).  
- **K69** — **Site haritası insan dili:** her ana route için 1 cümle “bu sayfa ne işe yarar” (K10 genişlemesi; repo bilinmiyorsa `varsayım: rotaları görmedim`).  
- **K70** — **Kimi Faz 2 bitiş raporu:** `Özet: K51–K70 tamam | varsayım satır sayısı: N | Cursor’a dosya listesi: … | §A ile çelişen madde: yok/var (açıkla)`  

---

## 4) CURSOR — Faz 2 geniş görevler (X21–X40)

Her X sonunda **dokunulan dosya yolları**; tur sonunda **`npm run typecheck` + `npm run build` + `npm run test:run`** yeşil (Windows’ta `;` ile zincirleme). Sonuç **`docs/MARATON_FAZ2_RAPORU.md`** veya mevcut `MARATON_CURSOR_RAPORU.md` içine **“Faz 2”** bölümü.

- **X21** — `docs/icerik/faz2-kimi/` altında K51+ için şablon dosyalar oluştur; Kimi çıktısını **yapıştırılmış** halde commitlenebilir hale getir (içerik Kimi’den).  
- **X22** — K53 sözlüğü: form validasyon / toast metinlerinde **merkezi veya tutarlı** kullanım; hardcoded dağınıklığı azalt.  
- **X23** — K54 empty state: ilgili sayfalarda metin **eşleştir**; placeholder Türkçe + erişilebilir `aria-live` gerekiyorsa ekle.  
- **X24** — Para birimi denetimi: kullanıcıya dönük **TRY** kalan mı `grep`; **₺** ile hizala (istisna: kod alanı adı `commitmentFloorTRY` gibi — dokunma).  
- **X25** — K57/K58: Compare, SellerHub, CreateAuction’da **başlık veya yardım metni** uyumu (küçük patch).  
- **X26** — İsteğe bağlı: `@radix-ui/react-tooltip` kurulumu + CreateAuction / kritik formlarda K63 metinleri (paket politikasına uygun).  
- **X27** — SEO: `seo.ts` + kritik sayfalar; K69 ile **çelişen route açıklaması** varsa düzelt.  
- **X28** — Ölü link avı: `Footer`, `Navbar`, `App` route’ları; `navigate` hedefleri.  
- **X29** — `ListingDocumentFooter` ve belge diyalogları: **çift gösterim** veya **görünmez** kırılma var mı UX taraması.  
- **X30** — `userFlows.ts`, `DataStrategy`, `businessModel` / `fees.ts`: **aynı hikâye** grep + metin düzeltmesi.  
- **X31** — Erişilebilirlik: odak sırası, `button` vs `div onClick`, eksik `alt` — en az 5 somut iyileştirme veya `varsayım: süre yetmedi`.  
- **X32** — Vitest: en az bir **yeni** küçük test (ör. yardımcı fonksiyon veya pure formatter) veya mevcutları güçlendir; kırmadan.  
- **X33** — `npm audit` (salt okuma): kritik bulgu varsa raporda not; otomatik `--force` yok.  
- **X34** — Deploy/ZIP: script veya README adımı **tekrarlanabilir** mi doğrula; kırıksa düzelt.  
- **X35** — `KONTROL_KOMUTU.txt` güncelle: Faz 2 komut dosyasına **link**.  
- **X36** — K56 metni: `/gizlilik` veya ilgili sayfada **gömülü** gösterim (çok büyükse “özet + detaya link”).  
- **X37** — K59 demo uyarıları: `DemoBanner` / layout ile **çakışma yok** mu.  
- **X38** — Performans: büyük liste (`map`) için `memo` / `useMemo` **gerekli yerde** (abartı yok).  
- **X39** — i18n hazırlığı: tam i18n şart değil; kullanıcıya dönük string envanteri **liste** olarak rapora (gelecek faz).  
- **X40** — **Faz 2 kapanış:** MARATON raporu + “bilinçli bırakılan” + test komut çıktısı özeti.

---

## 5) Paralel çalışma takvimi (saatlerce, çakışmadan)

| Faz | Kimi | Cursor |
|-----|------|--------|
| **A** | K51–K60 ardışık veya paralel (metin) | X21–X24 (altyapı + grep) |
| **B** | K61–K70 | X25–X32 (entegrasyon + test) |
| **C** | K70 raporu + eksik varsa K53 tamamlama | X33–X40 + rapor |

**Birleştirme kuralı:** Aynı UI cümlesi için **tek kaynak**: ya `fees.ts` / sabit dosya ya da `docs/icerik/`; çelişki çıkarsa **§A kazanır**.

---

## 6) Bitiş tanımı (Faz 2 Done)

- [ ] K51–K70 Kimi çıktıları `docs/icerik/faz2-kimi/` veya eşdeğerinde dosalanmış.  
- [ ] X21–X40 tamam veya `varsayım:` ile kayıtlı feragat.  
- [ ] `typecheck` + `build` + `test:run` yeşil (raporda komut ve sonuç).  
- [ ] Regresyon: Faz 1 envanteri (eski maraton §3) **kırılmamış** (manuel smoke listesi raporda 10 madde).

---

## 7) Smoke listesi (Cursor — her büyük tur sonu, hızlı)

1. Ana sayfa açılır.  
2. Arama / liste açılır; kartta belge şeridi görünür.  
3. İlan detay açılır; rapor / resmi belge akışı kırılmaz.  
4. İlan oluştur: zorunlu alanlar hata verir; mesaj TR.  
5. Karşılaştırma: 2+ ilan, tablo + belge satırı.  
6. Dashboard yatırımcı: favori varsa kart + footer.  
7. Footer linkleri.  
8. Demo uyarısı görünür (varsa).  
9. Mobil dar genişlikte taşma yok (kritik sayfa 1).  
10. Konsolda kırmızı hata yok (dev).

---

## 8) Tek cümle (her iki ajan)

**Faz 1’i bozmadan, telif ve §A’ya sadık kalarak, Kimi geniş metni üretir, Cursor kanıtlı şekilde gömer ve testle siteyi son hale yaklaştırır.**

---

*Dosya: `docs/KIMI_CURSOR_FAZ2_SON_HAL_GENIS_KOMUT.md` — Önceki maraton: `docs/KIMI_CURSOR_UZUN_MARATON_KOMUT.md`*
