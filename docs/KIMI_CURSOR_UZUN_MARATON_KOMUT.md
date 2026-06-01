# KİMİ + CURSOR — UZUN MARATON TEK KOMUT (ihaleal.com)

**Kullanım:** Bu dosyanın **tamamını** aynı anda hem **Kimi**ye hem **Cursor**a yapıştırın. İkisi de **aynı metinden** çalışır; birbirinize varsayım ve dosya yolu yazarak eşlik edersiniz. **Patrona soru sormayın**; blokörde `varsayım:` etiketi kullanın.

**Geri dönüşüm:** `docs/GERI_DONUSUM_NOTU_2026-04-27_0437.md` + `docs/SOZLESMESONRASI_TEK_KOMUT.md` ile durumu eşleştirin.

**Faz 2 (K36–K50 / X1–X20 bittikten sonra — daha geniş görevler, çakışma kuralları):** `docs/KIMI_CURSOR_FAZ2_SON_HAL_GENIS_KOMUT.md`

**MASTER (Kimi raporu + repo doğrulama tablosu):** `docs/KIMI_CURSOR_MASTER_KANITLI_KOMUT.md`

**SENKRON (STATE + inbox + rubrik + 3 tur limiti):** `docs/SENKRON_TEK_KOMUT.md`

**Kimi + Cursor tek yapıştırma (birleşik özet — tekrar yok):** `docs/TEK_YAPISTIR_IKILI_KIMI_CURSOR.md`

---

## 0) Telif ve PDF (CamScanner — Downloads)

- Örnek sözleşme PDF’si **üçüncü taraf telifidir**. Kimi veya Cursor **PDF içeriğini kelimesi kelimesine aktaramaz**, OCR ile transkribe etmez, "üçüncü taraf sözleşmesi şu madde diyor ki…" diye **alıntı yapmaz**.
- Yapılacak iş: `docs/hukuk/YETKI_VE_ARACILIK_TASLAK_CERCEVE.md` ile **avukat sürecinde** madde eşlemesi; ürün metni **ihaleal orijinal** dille.
- Otomatik araçlarla PDF okunduğunda metin çıkmıyorsa: **“metin çıkmadı”** deyin; uydurma yasak.

---

## 1) Roller ve yasaklar

| Rol | Yapar | Yasak |
|-----|--------|--------|
| **Kimi** | Metin, SSS, e-posta, video storyboard, sayfa metinleri, **TSX taslak önerisi** (küçük blok) | Repo dosyası yazmak; secret; kanıtsız “build OK”; rakip sözleşme kopyası |
| **Cursor** | `grep`, patch, `npm run typecheck` + `build` + `test:run`, Kimi çıktısını **dosyada doğrulama** | Onaysız büyük refactor; patron §A’ya ters düşen “vitrin ücreti” vaadi |

---

## 2) Kuzey yıldızı (özet — detay `SOZLESMESONRASI_TEK_KOMUT.md` §A)

1. Marka: **Yapay zeka destekli gayrimenkul platformu**.  
2. Satılık + kiralık; üç mod: **sadece ilan**, **teklif al**, **ihale**.  
3. İlanda **taraf telefonu yok**; muhatap **ihaleal.com** (büyük emlak ağı kartındaki danışman adı benzeri).  
4. Teklifler **platformdan** malike/kiraya verene; anonimlik ilanda.  
5. **Piyasa raporu** (üçüncü taraf PDF, izinli kanallar) + **İhaleal Endeksi / AI analiz** butonu; hukuki ekspertiz değil.  
6. **SPK ekspertiz** zorunluluk çizgisi; **şerh / ipotek / haciz** raporda; evrakta **AI ön tarama + insan onayı**.  
7. **Taahhüt alt/üst limit**; üst limite gelince işlem yükümlülüğü + cezai şart **sözleşmede**; alıcı/kiracı simetrisi.  
8. **Resmi belgeler** (imar, belediye, kararlar) ayrı buton; tapu sürprizi yok hedefi.  
9. Gelir hedefi: **yalnızca başarılı işlem komisyonu**; komisyon **anlaşılan tutar** üzerinden.  
10. Kira: **kiraya verenden 1 aylık kira + KDV**; kiracıdan ilan ücreti yok.  
11. İlan listeleme / doping / kullanıcıya reklam satışı **yok** (hedef).  
12. Demo gerçeği gizlenmez; `test:run` + typecheck yeşil.

---

## 3) Ürün envanteri — kullanıcı istekleri (hiçbirini atlama)

Aşağıdaki her satır için ya **Kimi metni** ya da **Cursor kodu** üretilmiş olmalı; ikisi birlikte kontrol eder.

- [ ] İlan **altında** (kart + arama sonucu + yakında biten): **piyasa raporu**, **ekspertiz**, **resmi belge**, **taahhüt** durumu görünür (`ListingDocumentFooter` veya eşdeğeri).  
- [ ] İlan **detay**: “İhaleal Endeksi — piyasa raporu analizi” + “Resmi belgeler” **butonları** + diyaloglar; Genel Bakış’ta taahhüt + ekspertiz kartları.  
- [ ] İlan **oluştur**: piyasa PDF adı, ekspertiz PDF + zorunluluk, resmi belge beyanı, taahhüt limitleri + onay; doğrulama kuralları.  
- [ ] `listingPolicy` / `businessModel` / `fees.ts` ile **çelişki yok**.  
- [ ] Kiralık + satılık; mortgage metni kiralıkta uygun.  
- [ ] Hukuk: `docs/hukuk/` taslağı + §0 eşleme tablosu (avukat dolacak).  
- [ ] SEO, Footer, Navbar ölü link yok.  
- [ ] K36–K50 ve X1–X20 (aşağıda) **sırayla veya paralel planlı** tamamlanır.

---

## 4) KİMİ — maraton görevleri (K36–K50)

**Format her K için zorunlu:** `### K{n}` + madde madde + satır sonu **Kaynak:** gözlem | varsayım | kullanıcı + **Varsayım:** tek satır.

- **K36** — **Yetki sözleşmesi kullanıcı özeti** (800–1200 kelime): tek muhatap, dolaşım yasağı **fikri** (hukuki dil değil), komisyon matrahı, kira 1 aylık kira; “avukat onayı gerekir” uyarısı.  
- **K37** — **Taahhüt + cezai şart** kullanıcı SSS 10 soru–cevap (iddiasız, “hedef/sözleşme” dili).  
- **K38** — **Ekspertiz paketi** sayfa metni: şerh, ipotek, haciz checklist; sahte evrak riski; AI+insan.  
- **K39** — **Resmi belgeler butonu** açıklaması (imar, belediye) — tek sayfa broşür metni.  
- **K40** — **Piyasa raporu / analiz** kullanıcı metni: üçüncü taraf PDF “örnek kaynak”; asıl dil **İhaleal Endeksi** ve bölge fiyat raporu.  
- **K41** — **Alıcı yolculuğu** güncellenmiş (rapor butonları + belge şeridi).  
- **K42** — **Satıcı yolculuğu** güncellenmiş (CreateAuction alanlarıyla uyumlu).  
- **K43** — **Kiracı / kiraya veren** bir sayfa; 1 aylık kira ücreti vurgusu.  
- **K44** — **E-posta şablonu** 2: “ekspertiz eksik uyarısı” + “resmi belge yayınlandı” (taslak).  
- **K45** — **Moderasyon** metnine sahte teklif + sahte evrak cümlesi ekle.  
- **K46** — **Risk register** +10 satır (rapor telif, limit ihlali, veri gizliliği).  
- **K47** — **İngilizce kısa** “data room” pitch (1 paragraf, yatırımcı).  
- **K48** — **Video senaryosu** 1 adet (90 sn): belge şeridi + platform muhatap.  
- **K49** — **K10 güncelle** — repo route listesi: `grep` ile `App.tsx` doğrula (Kimi iddia ederse Cursor teyit eder).  
- **K50** — **Kimi bitiş raporu:** `Özet: K36–K50 tamam | varsayım satır sayısı: N | Cursor’a iletilecek dosya listesi: …`

---

## 5) CURSOR — maraton görevleri (X1–X20)

Her X sonunda ilgili dosyayı listele; bitişte `npm run typecheck && npm run build && npm run test:run` yeşil.

- **X1** — `ListingDocumentFooter`: **Compare**, **MapPage**, **CityGuide**, **Favorites** kartlarında da gerekliyse **aynı şerit** veya “detayda gör” tek satırı ekle; tutarlılık.  
- **X2** — `AuctionDetail`: Genel Bakış’ta belge şeridini **fiyat kartlarının hemen altına** taşı veya **çift gösterim** yoksa birleştir (UX).  
- **X3** — `CreateAuction`: “Ekspertiz zorunlu” varsayılanı **ilk kez kullanıcı** için açıklayıcı tooltip; hata mesajı Türkçe net.  
- **X4** — `fees.ts` + UI: komisyon matrahı metni **taahhüt/kapanış** ile uyumlu tek cümle.  
- **X5** — `Hero` / `BusinessModel`: §2 ile çelişen kelime `grep` + düzeltme.  
- **X6** — `seo.ts` + `index.html`: yeni sayfa yoksa atla; varsa meta.  
- **X7** — `SellerHub` / `sat-basla`: rapor + ekspertiz adımları **checklist** ile uyum.  
- **X8** — `DataStrategy` (`/veri-ve-endeks`): ilan detay “analiz” butonu ile **aynı hikâye** (metin uyumu).  
- **X9** — `userFlows.ts`: expertise adımı CreateAuction ile **çelişmiyor** mu kontrol.  
- **X10** — Yerel `ihaleal_auctions` ile seed birleşimi: `getAllAuctionsForSearch` yeni alanları **gösteriyor** mu manuel test.  
- **X11** — Erişilebilirlik: belge chip’lerinde `aria` / title tutarlılığı.  
- **X12** — `docs/SOZLESMESONRASI_TEK_KOMUT.md` §0 tablosuna **“ürün karşılığı”** sütunu için Cursor **kod dosyası yolu** önerisi doldur (kısa).  
- **X13** — `docs/hukuk/README.md`: Downloads PDF yolu örneği **not** (telif uyarısı koru).  
- **X14** — Ölü `navigate` / typo: `EndingSoon` Türkçe karakter düzeltmesi (isteğe bağlı tek patch).  
- **X15** — `grep` “vitrin ücreti|ilan ücreti|doping” kullanıcıya dönük; `/reklam` hariç temiz.  
- **X16** — `Compare` seçici kartlarına **isteğe bağlı** mini belge ikonu (footer sığmazsa atlanabilir — `varsayım:` yaz).  
- **X17** — `README` veya `KONTROL_KOMUTU.txt` varsa: maraton komut dosyasına **link**.  
- **X18** — Yeni bileşen için **birim test yoksa** en azından `test:run` kırmadan bırak veya mevcut teste dokunma.  
- **X19** — Performans: büyük liste render’da gereksiz re-render yok mu (isteğe bağlı).  
- **X20** — **Maraton bitiş:** çıktı `MARATON_CURSOR_RAPORU.md` oluştur `docs/` altında: tamamlanan X, komut çıktısı özeti, test komutları sonucu, **bilinçli bırakılan iş** (varsa).

---

## 6) Paralel çalışma kuralları

- Kimi **K36** bitirmeden Cursor X12–X13 dışında hukuk dosyasına dokunmasın (çakışma önleme).  
- Cursor patch atarken Kimi aynı TSX dosyasında **eşzamanlı** büyük blok göndermesin.  
- Çelişki çıkarsa: **§A kazanır**; metin yumuşatılır.

---

## 7) Bitiş tanımı (Done)

- [ ] K36–K50 Kimi çıktıları dosyalanmış veya yapıştırılmış (`docs/icerik/` önerilir).  
- [ ] X1–X20 tamam veya `varsayım:` ile kayıtlı feragat.  
- [ ] `typecheck` + `build` + `test:run` yeşil (Cursor kanıtı MARATON raporunda).  
- [ ] Kullanıcı envanter §3 tüm kutular işaretlenebilir.

---

## 8) Tek cümle (her iki ajan)

**Telifli PDF’yi kopyalamadan, patron §A’ya sadık kalarak, ilan kartı + detay + form üçlüsünde belge hikâyesini eksiksiz ve kanıtlı teslim edin.**

---

*Dosya: `c:\Users\yagiz\Desktop\ihaleal.com\docs\KIMI_CURSOR_UZUN_MARATON_KOMUT.md`*
