# SOZLEŞME SONRASI TEK KOMUT — ihaleal.com (Kimi + Cursor + Cloud)

**Bu dosya patron “tek yapıştırma” kaynağıdır.** Eski `ORTAK_PATRON_TEK_KOMUT.md` ile aynı iş kurallarını içerir; üzerine **sözleşme hizası**, **hukuk dosya indeksi** ve **Cloud özeti** eklenmiştir.

**Uzun maraton (Kimi + Cursor tek yapıştırma):** [`KIMI_CURSOR_UZUN_MARATON_KOMUT.md`](./KIMI_CURSOR_UZUN_MARATON_KOMUT.md)  
**Geri dönüşüm notu (~04:37):** [`GERI_DONUSUM_NOTU_2026-04-27_0437.md`](./GERI_DONUSUM_NOTU_2026-04-27_0437.md)

**Yedek:** Bu dosyayı ve `docs/hukuk/` altını düzenli **git commit** ile saklayın. RE/MAX PDF taraması telif nedeniyle repoya zorunlu değildir; `docs/hukuk/README.md` talimatına göre `kaynak/` altında tutulabilir.

---

## 0) Sözleşme hizası (avukat + ürün)

| Kaynak | Açıklama |
|--------|----------|
| `docs/hukuk/YETKI_VE_ARACILIK_TASLAK_CERCEVE.md` | ihaleal.com için **orijinal** madde iskeleti (rakip sözleşme kopyası değil). |
| `docs/hukuk/kaynak/*.pdf` | Sizin RE/MAX örnek taramanız — **avukatça** maddeler `YETKI_VE...` ile eşlenir. |
| Aşağıdaki §A | Ürün ve gelir kuralları; sözleşme maddeleri buraya **hizalanmalı**. |

**Örnek sözleşme / ürün eşlemesi (PDF satır numarası avukat doldurur; Cursor ürün karşılığı önerisi):**

| Örnek sözleşme (PDF) maddesi | ihaleal taslak (`YETKI_VE_ARACILIK_TASLAK_CERCEVE.md`) | Ürün / kod karşılığı |
|------------------------------|--------------------------------------------------------|----------------------|
| *(avukat: münhasır yetki)* | §2 Yetkinin kapsamı ve süresi | `CreateAuction` marketingMode + `listingPolicy` |
| *(avukat: komisyon)* | §5 Komisyon ve ödeme | `src/lib/fees.ts` — `FEE_TEXTS.commissionMatrahLine`, `AuctionDetail` komisyon kartı |
| *(avukat: dolaşım)* | §3 Yükümlülükler — dolaşım | `PLATFORM_LISTING_CONTACT`, ilanda taraf telefonu yok |
| *(avukat: evrak)* | §3 Malik + §4 Platform | `CreateAuction` rapor/ekspertiz kartı; `AuctionDetail` butonlar + `ListingDocumentFooter` |
| *(avukat: taahhüt / ceza)* | Taahhüt limitleri (patron §A-12) | `Auction` commitment alanları; `CreateAuction` taahhüt kartı |
| *(avukat: fesih)* | §2 / §10 Yürürlük | Üretimde sözleşme eki — UI’da yasal-cerceve sayfaları |

*CamScanner PDF metin katmanı çıkmadı; satır eşlemesi manuel. Telif: PDF metni kopyalanmaz.*

---

## A) Kuzey yıldızı (değişmez; metin ve kod buna hizalanır)

1. **Marka dili:** Ürün **“Yapay zeka destekli gayrimenkul platformu”** olarak anlatılır; “yapay destekli gayrimenkul analizi” ifadesi kullanılmaz.
2. **Amaç:** Gerçek **alıcı–satıcı** ve kiralıkta **kiracı–kiraya veren** güvenilir eşleşmesi. **Satılık veya kiralık** aynı üç modla yönetilir.
3. **Üç mod (satış ve kiralama):** **(1) Sadece ilan** — müşteri ilanı girer; kartta RE/MAX’taki danışman adı gibi **ihaleal.com** görünür, taraf telefonu yok; muhatap platform. **(2) Teklif al** — kapalı teklif; teklif verenler anonim, teklifler **platform tarafından malike/kiraya verene iletilir**; yalandan veya oyun amaçlı teklif yasak, cezai şartlar sözleşmede. **(3) İhale** — açık artırma; yine kart ve iletişimde yetkili platform; teklifler kayıt altında iletilir; keyfi fiyat / sahte katılım yasak (moderasyon + sözleşme).
4. **Kabul sonrası:** Sözleşme, evrak ve ödeme **ihaleal.com** hattında (üretim hedefi).
5. **Aracılık:** **Yetki sözleşmesi** ile taraflar platformu aradan çıkarmadan sürdürür (hedef; avukat metni).
6. **Fiyat ve değer:** Referans / bölge bandı, değerleme–ekspertiz çizgisi, aşırı açılış uyarıları ürünün kalbidir.
7. **Güven zinciri (hedef):** Findeks, yetki ve evrak, sözleşme paketi; kritik adımlarda insan onayı. Demo gerçeği DemoBanner’da saklanmaz.
8. **Gelir (hedef):** **Yalnızca komisyon** (başarılı işlem). İlan/vitrin/doping/kullanıcıya reklam satışı yok. Komisyon **anlaşılan işlem tutarı** (taahhüt / kapanış matrahı) üzerinden netleşir (sözleşme).
9. **Kira ücreti (hedef):** **Yalnızca kiraya verenden bir aylık kira + KDV**; kiracıdan ilan ücreti yok.
10. **Piyasa raporu + İhaleal Endeksi:** İlanda ayrı buton; kullanıcı PDF’i yükler, platform yapay zeka destekli analiz / tutarlılık özetini sunar (resmi ekspertiz yerine geçmez). Üçüncü taraf rapor telifine uyum kullanıcı yükümlülüğünde.
11. **Ekspertiz zorunluluğu (hedef):** SPK uzmanı ekspertiz raporu ilan paketinin parçası; **şerh, ipotek, haciz** ve benzeri hukuki durumlar bu raporda. Evrakların sahte olmadığına dair süreç: AI destekli ön tarama + kritik adımlarda **insan onayı**; hukuki son söz uzman / avukat.
12. **Taahhüt limitleri + ceza çerçevesi (hedef):** Satıcı ve kiraya veren **alt** ve **üst** limit belirler; piyasa veya süreç **üst limite ulaştığında** işlemi platform çizgisinde tamamlama yükümlülüğü; tamamlanmazsa sözleşmedeki **cezai şart**. **Alıcı** ve **kiracı** için eşdeğer bağlayıcı kurallar (teklif / kabul aşaması) aynı hukuk paketinde tanımlanır — taslak avukat onayı şart.
13. **Resmi şeffaflık butonu:** Belediye yazıları, **imar planı** ve diğer **resmi karar** özeti alıcı veya kiracıya ilanda **ayrı butonla** gösterilir; tapu tesliminde sürpriz kalmaması ürün hedefidir.
14. **İlanda taraf bilgisi yok:** Alıcı / satıcı / kiracı / kiraya veren doğrudan iletişim bilgisi ilanda yer almaz; süreç **RE/MAX benzeri** tek muhatap (ihaleal.com) üzerinden yürür.
15. **Kırılganlık yok:** Küçük patch, `typecheck` + `build` + `test:run` yeşil.

---

## B) Roller

| Kim | Görev | Yasak |
|-----|--------|-------|
| **Patron** | Öncelik, hukuk/ödeme kararı | — |
| **Cursor** | Repo, grep, patch, test; Kimi kodunu kanıtsız merge etme | Patrona onay sorusu; büyük refactor |
| **Kimi** | K1–K35 metin, senaryo, checklist, TSX **taslak** | Repo yazma; secret; telif ihlali; kanıtsız “build OK” |
| **Cloud (sabah)** | Bu dosyanın §A + §Cloud + risk özeti | Gereksiz repo müdahalesi |

**İletişim:** Varsayım + öneri + Cursor’da dosya/komut kanıtı.

---

## C) Kimi — görev sırası (K1–K35)

Şablon: `### K{n}` + maddeler + satır sonu **Kaynak:** gözlem | varsayım | kullanıcı + **Varsayım:** tek satır.

- **K1** — 90 sn seslendirme: alıcı–satıcı buluşturma, analiz, ihale, **komisyon dışı ücret yok** (hedef), kira kuralı (hedef).
- **K2** — 12 Shorts (8 sn).
- **K3** — 12 Reels 9:16.
- **K4** — Alıcı / satıcı / emlakçı: “Neden burada?” (5’er madde).
- **K5** — Güven: Findeks, evrak, sözleşme, KVKK (hedef dili).
- **K6** — PDF listesi (ön sözleşme, şartname, özet — hukuki taslak değil).
- **K7** — **Fiyat güveni** tek sayfa: analiz + referans + uyarı metinleri; rakip marka ürün dilinde yok (karşılaştırma sayfası istisna bilinçli).
- **K8** — 5M / 7M anomali tek paragraf uyarı.
- **K9** — 25 SSS (demo + hedef ayrımı).
- **K10** — Route listesi (repo yoksa varsayım).
- **K11** — CTA / buton envanteri.
- **K12** — İngilizce yatırımcı pitch.
- **K13** — E-posta: hoş geldin + ihale hatırlatma.
- **K14** — Moderasyon akışı metni.
- **K15** — SEO kelimeleri (abartısız).
- **K16** — Risk register 20 satır.
- **K17** — iyzico checklist (ürün).
- **K18** — Supabase insan dili (SQL Cursor’da).
- **K19** — Video prod takvimi (orijinal / lisanslı).
- **K20** — Cloud’a 5 soru.
- **K21** — Alıcı yolculuğu (arama → analiz → teklif).
- **K22** — Satıcı yolculuğu (analiz → referans → ihale → evrak).
- **K23** — Fiyat güvenine 10 özellik fikri.
- **K24** — “En iyi / tek” iddiası yok; ölçülebilir fayda dili.
- **K25** — **Komisyon dışı gelir yok** manifestosu: hangi cümleler kullanıcıda yanlış beklenti yaratır — düzeltme listesi.
- **K26** — **Kira tarafı** tek sayfa: kiraya veren / kiracı rolleri ve ücret (hedef: 1 aylık kira kiraya verenden).
- **K27** — Findeks + yetki doğrulama kullanıcıya nasıl anlatılır (adım adım, hukuki iddia yok).
- **K28** — Rakip karşılaştırma sayfası için not: domain bilerek kalabilir; ürün ana metinde rakip marka slogan gibi kullanılmaz.
- **K29** — Kiralık: **ihale** ve **kapalı teklif** modlarını anlatan 1 sayfalık kullanıcı metni (anonimlik vurgusu).
- **K30** — **Yetki sözleşmesi** ürün özeti: iletişim ihaleal.com; tarafların birbirine doğrudan çıkmadan sürdürmesi (hukuki taslak değil).
- **K31** — “Yapay zeka destekli gayrimenkul platformu” ile uyumlu sosyal / reklam metinleri (K3 ile çakışmazsa birleştir).
- **K32** — İlan detay UX metni: “İhaleal Endeksi — piyasa raporu analizi” butonu + “Resmi belgeler” butonu; demo / üretim ayrımı.
- **K33** — Taahhüt limitleri ve cezai şart: kullanıcıya anlaşılır özet (hukuki metin değil); satıcı–alıcı–kiraya veren–kiracı simetrisi tek paragraf.
- **K34** — Ekspertiz bölümü: şerh / ipotek / haciz checklist; sahte evrak riski ve AI+insan süreci (iddiasız).
- **K35** — Kirada “bir aylık kira” platform ücreti ile satış komisyonunun aynı patron çizgisinde anlatımı.

**Kimi bitiş:** `Özet: K… tamam | varsayım satır sayısı: …`

---

## D) Cursor — C1–C23 (sıra; patrona sorma)

1. **C1** Route: `App.tsx`, `seo.ts`, Kimi K10 — grep.
2. **C2** Kimi K1–K4 → `docs/icerik/`.
3. **C3** Footer, Navbar, ihale/giriş — ölü link yok.
4. **C4** `typecheck` + `build` + `test:run`.
5. **C5** `fees.ts` + CreateAuction referans uyarısı tutarlı.
6. **C6** Ürün metni: “vitrin” vaadi yok; **Hero**, **BusinessModel**, **seo**, **index.html** kuzey yıldızı ile uyumlu.
7. **C7** Chat widget sağlam.
8. **C8** Video fallback / README.
9. **C9** Tur özeti md.
10. **C10** Kimi dosya iddiası doğrulama.
11. **C11** Çakışan patch birleştirme yok.
12. **C12** Cloud 5 satır (veya `CLOUD_SABAH_KOMUT` çıktısına hazır özet).
13. **C13** Alıcı–satıcı akışı UI küçük iyileştirme.
14. **C14** Detay/kartlarda fiyat görünürlüğü + demo etiketi.
15. **C15** Güvenlik grep (secret, plaintext şifre).
16. **C16** Teknik borç notu.
17. **C17** **Gelir modeli metin denetimi:** `grep` ile “ilan ücreti”, “vitrin”, “doping”, “reklam satışı” — hedefle çelişen **kullanıcıya dönük** cümle kalmasın (iç pazarlama `/reklam` sayfası: şirket kampanya planı olduğu açık yazılsın).
18. **C18** `FEE_TEXTS.monetizationPrinciples` veya `businessModel.ts` ile UI özetleri çelişmesin.
19. **C19** **İlan detay (`AuctionDetail`):** Platform iletişim kutusu, anonim teklif uyarısı, kiralıkta mortgage gizleme, `dealType` / `negotiationMode` rozetleri — `listingPolicy.ts` ile tutarlı.
20. **C20** **İlan oluştur (`CreateAuction`):** Kiralık + ihale/kapalı teklif seçimi; kayıtta `contactViaPlatform: true` ve `agent` platform satırı.
21. **C21** **İlan oluştur — belge ve taahhüt:** Piyasa raporu (PDF adı demo), ekspertiz PDF adı + zorunluluk kutusu, resmi belge beyanı, taahhüt alt/üst limit + onay — `Auction` tipi ile uyumlu.
22. **C22** **İlan detay — butonlar:** “İhaleal Endeksi — piyasa raporu analizi” ve “Resmi belgeler” diyalogları; taahhüt / ekspertiz özet kartları; `listingPolicy` bütünlük maddeleri ile aynı hikâye.
23. **C23** Bu dosya (§A) ile ürün metni ve sözleşme taslakları senkron; avukat revizyonu sonrası §0 tablosunu güncelle.

---

## E) Akıl yürütme (her tur)

- **Kimi:** Fiyat güvenine 3 fikir + 2 risk (varsayım).
- **Cursor:** 1–2 küçük kod/metin iyileştirmesi veya C16 gerekçesi; build kırılmaz.

---

## F) İş planı (soru yok)

| Faz | Odak | Süre bandı |
|-----|------|-------------|
| **A** | Demo stabil, vaat-metin hizası, fiyat uyarıları, video script | 4–8 hafta |
| **B** | Auth, DB, RLS, Findeks/evrak entegrasyon yolu, staging | 2–4 ay |
| **C** | Ödeme, KVKK canlı, moderasyon | 3–6 ay |

**Prod tamamlanma:** çoğu ekipte **6–12 ay**.

---

## G) Telif

Orijinal senaryo; görüntü Runway/Pika/own veya lisanslı stok + kayıt. Üçüncü taraf sözleşme örnekleri repoda yalnızca **yetkili kopya** ve telif bilinciyle.

---

## H) Tek cümle

**Doğru vaat + yalnızca komisyon (hedef) + güven zinciri + Kimi üretir + Cursor kanıtlar = güvenilir tempo.**

---

## Cloud (sabah — bu dosyanın parçası; ayrıca `docs/CLOUD_SABAH_KOMUT.md`)

**Amaç:** Repoya dokunmadan veya minimum dokunuşla risk ve öncelik özeti.

1. Dünkü `CLOUD_CIKTI/AGENT_RAPORU.md` veya Cursor tur notunu oku.
2. **5 madde:** (a) blokör var mı, (b) hukuk/ödeme riski, (c) ürün vaadi ile metin uyumu, (d) bir öneri, (e) bugün tek odak ne olsun.
3. Kod yazma; şüphede “varsayım:” etiketle.
4. **Bu dosyanın §0** sözleşme tablosuna işlenecek tek paragraf özet üret (gerekiyorsa).

---

## I) Hukuk dosya indeksi (repo)

| Yol | İçerik |
|-----|--------|
| `docs/hukuk/README.md` | PDF arşiv talimatı |
| `docs/hukuk/YETKI_VE_ARACILIK_TASLAK_CERCEVE.md` | Yetki / aracılık madde iskeleti |
| `docs/hukuk/kaynak/` | Örnek PDF (isteğe bağlı, .gitignore önerilir) |

---

## J) Mega komut ile ilişki

Eski `docs/ORTAK_KIMI_CURSOR_MEGA_KOMUT.md` disiplin ve K1–K20 yoğun liste için referans kalır; **güncel patron ve sözleşme hizası bu dosyadır (K1–K35, C1–C23).**

---

*Birincil komut dosyası: `c:\Users\yagiz\Desktop\ihaleal.com\docs\SOZLESMESONRASI_TEK_KOMUT.md`*
