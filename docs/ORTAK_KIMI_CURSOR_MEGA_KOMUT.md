# ORTAK MEGA KOMUT — Kimi + Cursor (tek yapıştırma; Cloud sabah denetler)

**Güncel patron + sözleşme sonrası tek kaynak:** `docs/SOZLESMESONRASI_TEK_KOMUT.md` (K1–K35, C1–C23, §0 hukuk hizası). Aşağıdaki mega metin disiplin ve eski K1–K20 yoğun liste için **referans** kalır.

**Aynı metin hem Kimi’ye hem Cursor’a gider.** Kimi **repoya yazamaz**; ürettiği her şey **Cursor tarafından doğrulanmadan geçerli sayılmaz.**

---

## 0) Kimlik ve disiplin

| Rol | Görev | Yasak |
|-----|--------|--------|
| **Kimi** | Çok maddeli metin, senaryo, checklist, **orijinal** video storyboard (çalıntı yok), küçük TSX **blok önerisi** | Secret, “build yeşil” iddiası kanıtsız, rakip sitesinden izinsiz asset, **telif ihlali** |
| **Cursor** | Repo, `npm run typecheck`, `build`, `test:run`, grep, tek patch; Kimi kodunu **sadece doğrulandıysa** merge | Halüsinasyonu kabul etme, gereksiz refactor, §A’ya yazma (Cloud) |
| **Cloud (sabah)** | §A + tüm §B/§C/§D okuyup **risk/kurgu** özeti; düşük kota → **kısa** madde | Repo’ya sık dokunma |

**Kimi durmadan çalışır** = K1–K20 sırayı bitirir; her blok sonunda **“varsayım:”** satırı zorunlu.

---

## 1) İş planı — kaç ay? (dürüst tablo)

| Faz | İçerik | Süre (1 Cursor + sen + Kimi metin) | Not |
|-----|--------|-------------------------------------|-----|
| **Faz A** | Demo stabil, buton/akış audit, video script+placeholder, fiyat uyarıları, isimlendirme (marka yok) | **4–8 hafta** | Git + Supabase anahtarları gelince hızlanır |
| **Faz B** | Supabase auth, ilan DB, RLS test, dosya yükleme gerçek, staging deploy | **2–4 ay** | K12/K13 + hukuk |
| **Faz C** | Ödeme (iyzico), KVKK yayın, moderasyon, canlı video pipeline | **3–6 ay** | K14, avukat |

**Prod “tam bitti” toplam:** çoğu ekipte **6–12 ay** (paralel iş yoksa üst band). İki yapay zeka + sen takvimi **sıkıştırır**; **hukuk/ödeme bekleme** yine insanda.

---

## 2) Ürün ilkeleri (Cursor kodda uygular; Kimi metinde uyumlar)

1. **Tanıtım videoları:** Metin/storyboard **orijinal**; görüntü **Runway/Pika/own çekim** — rakip sitesinden **kopya video yok**. Stok kullanılacaksa yalnız **lisanslı** (Pexels vb.) + `README` kaydı.
2. **“Endeksa benzeri” kelimesi ürün arayüzünde yok** — yerine: **“Gayrimenkul analizi”**, **“bölge ve fiyat analizi”**. (Rakip karşılaştırma sayfasında **alan adı** olarak rakip domain yazılabilir; bu hukuki karşılaştırma.)
3. **Fiyat mantığı:** Referans değer / AI bandına göre **aşırı açılış** (ör. 5M mülk 7M açılış) → **uyarı veya blok** (kural oranı `fees.ts` veya ürün politikası).
4. **Güvenlik + sözleşme:** Metinler “taslak/demo”; canlı iddia yok. Şüpheli cümleleri Kimi işaretler, Cursor metni yumuşatır.
5. **Butonlar:** Cursor sayfa sayfa **tıklanabilirlik** ve `navigate` hedefi kontrol eder; kırık varsa issue listesi §B’ye.

---

## 3) KİMİ — yoğun görev listesi (K1–K20, durmadan)

Her cevapta şablon:  
`### K{n}` + madde madde + **Kaynak: gözlem | varsayım | kullanıcı** etiketi + **Çıktı formatı: düz metin veya tam TSX bloğu**

- **K1** — 60 sn “ihaleal.com nedir, kime yarar, nasıl kullanılır” **seslendirme metni** (Türkçe, 3 bölüm).
- **K2** — Aynı konuda **10 YouTube Shorts** metni (8’er sn, sahne sahne).
- **K3** — **10 Reels** (9:16) — sahne, metin, hashtag; rakip fiyat iddiası yok.
- **K4** — **5 “neden bu platform”** maddesi (alıcı / satıcı / emlakçı ayrı).
- **K5** — **Güven**: KVKK, sözleşme, teminat, Findeks (hepsi “hedef/üretimde” dili).
- **K6** — **Sözleşme paketi** hangi PDF’ler (liste, hukuki değil ürün listesi).
- **K7** — **Fiyat analizi ürün özeti** (Endeks **kelimesi** yerine “bölge fiyat bandı” dili).
- **K8** — **Anomali örneği** 5M vs 7M: kullanıcıya gösterilecek **tek paragraf uyarı metni** (yasal iddia yok).
- **K9** — **Chatbot** için 20 SSS + kısa cevap (site demo olduğunu söyleyen).
- **K10** — **Tüm sayfa listesi** (URL + tek cümle amaç) — repo ile çelişen iddia **yasak**; bilinmiyorsa “varsayım: repo okumadım”.
- **K11** — **Buton/CTA audit metni** (hangi sayfada hangi ana çağrı — Cursor tek tek doğrular).
- **K12** — **İngilizce 1 paragraf** pitch (yatırımcı).
- **K13** — **E-posta şablonu** welcome + “ihale hatırlatma” (metin only).
- **K14** — **Moderasyon akışı** (şikayet → inceleme → kaldırma) metin.
- **K15** — **SEO anahtar kelime** listesi (marka dışı rakip ismi hashtag’te yok).
- **K16** — **Risk register** 15 satır (olasılık/etki: varsayım etiketli).
- **K17** — **iyzico Pazaryeri** için kullanıcı checklist (ürün, hukuk değil).
- **K18** — **Supabase tabloları** için insan dilinde açıklama (SQL yazma; Cursor SQL’e bakar).
- **K19** — **Video prodüksiyon takvimi** (hafta hafta, Runway/Pika).
- **K20** — **“Sabah Cloud’a 5 soru”** listesi (kısa, hukuk/öncelik).

**Kimi bitiş cümlesi:** `Özet: tamamlanan K… | varsayım içeren satırlar: …`

---

## 4) CURSOR — kontrol ve tamamlama (C1–C12)

- **C1** Kimi K10’u `App.tsx` / `seo.ts` ile **grep**; çelişki varsa §B’ye yaz, Kimi’ye geri bildirim.
- **C2** Kimi K3/K2/K1 metinlerini `docs/icerik/` altına **dosyala** (yeni klasör) — telif Kimi’den.
- **C3** Buton audit: `Footer`, `Navbar`, kritik sayfalar — ölü `navigate` yok.
- **C4** `npm run typecheck && npm run build && npm run test:run` her gece sonu.
- **C5** Fiyat anomalisi: `fees.ts` kuralı + **İhale Aç** formunda referans değer alanı (Kimi K8 metniyle uyumlu uyarı).
- **C6** Ürün metinlerinde **rakip marka** temizliği (karşılaştırma sayfası hariç bilerek).
- **C7** `ChatWidget` — boş cevap / sonsuz döngü var mı kontrol.
- **C8** `public/videos/` — dosya yoksa `VideoWithFallback` veya README (Kimi TSX verdiyse ve geçtiyse uygula).
- **C9** `AGENT_RAPORU.md` §B — tur özeti + Kimi doğrulama notu.
- **C10** Halüsinasyon avı: Kimi “şu dosyada X var” → **dosyada yoksa** reddet.
- **C11** Tek PR mantığı: aynı dosyada çakışan iki Kimi önerisini birleştirme.
- **C12** Sabah Cloud için **5 satırlık özet** (risk + öneri).

---

## 5) CLOUD (sabah — kısa)

- §A: tarih + “Cursor+Kimi tur özeti okundu” + **K14/K15** birer cümle.
- §C: en fazla **3** yeni soru (S25+).
- Kod dokunma: **gerekmedikçe yok**.

---

## 6) Tek cümle hatırlatma

**Hız = Kimi’nin çok üretmesi + Cursor’un her şeyi kanıtlaması; mükemmellik = test + dürüst varsayım etiketi + telif disiplini.**
