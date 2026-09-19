# İhaleal — Tasarım Kontrol Listesi

Her "sonra" ekran görüntüsü bu listeye göre 1–5 puanlanır. **4'ün altı = düzeltilir, yeniden çekilir, yeniden puanlanır.**
Kurallar, üst düzey emlak/finans ürünlerinin *prensiplerinden* çıkarıldı (kopyalama yok). Kaynaklar en altta.

Puan ölçeği: 5 = kuralın tamamı sağlanıyor · 4 = küçük sapma, fark edilmez · 3 = fark edilir sapma · 2 = belirgin ihlal · 1 = kural yok sayılmış.

## Marka tokenları (yalnızca 5, açık tema)

| Token | Değer | Rol |
|---|---|---|
| primary | `#12356B` | CTA, link, aktif durum |
| secondary | `#0B1F3A` | başlık/metin, koyu vurgu yüzeyi (yalnız hero bandı gibi TEK bölge) |
| accent | `#D9A441` | küçük vurgular (eyebrow, rozet, tek ikincil CTA) — asla birincil sinyal değil |
| bg | `#F4F6FA` | sayfa zemini |
| text | `#0B1F3A` | gövde/başlık metni |

Durum renkleri (başarı/uyarı/hata) marka tokenı **sayılmaz**; işlevseldir ve yalnızca durum bildirir.

## Puanlanan maddeler

### 1. Tipografi hiyerarşisi
- Tek aile (Inter), hiyerarşi **ağırlık + boyutla** kurulur (ikinci display font yok).
- Başlık, gövdeden **en az 2 ağırlık kademesi** kalın (gövde 400 → başlık ≥ 600–700; alt başlık 600; etiket 500–600).
- Bir ekranda en fazla **4 farklı font boyutu kademesi**; H1 gövdenin ≥ 2,5 katı.
- Başlıklarda negatif harf aralığı ölçülü (≥ −0,03em); gövde satır yüksekliği 1,5–1,6.
- Kaynak ilke: hiyerarşi önce boşluk, ağırlık ve nötr yüzeyle, sonra gölgeyle kurulur (Airbnb).

### 2. Renk disiplini
- Ekranda **≤ 5 marka rengi**; accent yüzeyin **≤ %10**'unda.
- Bir eylem = bir vurgu rengi: birincil CTA primary; accent yalnızca ikincil/rozet.
- Altın "birincil sinyal" olursa lüks değil klişe olur → altın büyük alan/dolgu olarak kullanılmaz.
- Koyu renk yalnızca **tek bir bölgede** (hero bandı) ve `secondary` ile sınırlı; sayfa gövdesi açık.

### 3. Kontrast ve erişilebilirlik
- Metin kontrastı **≥ 4,5:1** (büyük metin ≥ 3:1). Vurgu rengi metnin üstünde de bu eşiği geçer.
- Dokunma hedefi **≥ 44×44 px**; odak halkası görünür.
- Yükseliş/düşüş **yalnız renkle** verilmez: işaret (▲/▼, +/−) eşlik eder.

### 4. Boşluk ve gruplama (8 px ızgara)
- İlgili öğeler **4–8 px**, ayrı nesneler **≥ 24 px**, bölümler **64–96 px** (masaüstü).
- Boşluk gruplamak içindir: kartın meta bilgisi tek birim gibi görünür, kartlar arası nefes vardır.
- Kaydırmasız ilk ekranda içerik sıkışık değil; büyük başlık + bol boşluk (lüks ilkesi).

### 5. Arama-önce yaklaşım (ilk ekran)
- İlk ekranda **tek baskın eylem = arama**; ikincil eylemler onu boğmaz.
- Arama alanı en belirgin etkileşimli öğe; filtreler kademeli açılır (önce konum + tür, gerisi seçeneksiz).
- Birincil CTA ekranda tek ve nettir.

### 6. Kart tasarımı
- Tutarlı köşe ölçeği: kart 14 px · buton 8 px · arama/pill 999 px (bir arada karıştırılmaz).
- Görsel öncelikli (fotoğraf/imge kartın en büyük parçası); fiyat en güçlü metin.
- Gölge minimal (yalnız yükselen/etkileşimli kartlarda); ayırma boşluk ve nötr yüzeyle.

### 7. Sayısal veri
- Tüm fiyat/oran/sayaçta **tabular rakam**, sağa hizalı sütunlar; `₺` ve binlik ayıracı tutarlı (`₺11.360.000`).
- Hero rakam ile destek verisi arasında belirgin boyut farkı.
- Sinyal renkleri (yeşil/kırmızı) yalnızca gerçek artış/azalışta.

### 8. Hareket (ölçülü)
- Süre **200–400 ms**, yükselen öğeler **ease-out**; yalnızca `transform` ve `opacity` animasyonlanır.
- Kaydırmayla beliren öğeler ≤ 12 px yer değiştirir; **`prefers-reduced-motion`'da anında ve görünür** (animasyonsuz ama içerik yerinde).
- Dekoratif hareket yok: her hareket bir yapıyı (grup/sıra) anlatır. 3D/Three.js kullanılacaksa **tek yer**, anlamlı.

### 9. Mobil (390×844)
- Tek sütun, **yatay taşma yok**, ilk ekranda arama görünür.
- Dokunma hedefleri ≥ 44 px, başlık ölçeklenir (taşmaz, kırılmaz), CTA başparmak erişiminde.

### 10. Prestij ve tutarlılık
- Sakin, kısıtlı, süssüz: aynı bileşen aynı yerde aynı görünür (kart, buton, rozet).
- Emoji/klişe stok ikon yığını yok; ikonlar tek çizgi ailesinden.
- "Vasat" hissi testi: 3 saniyede bakan biri neyin satıldığını, neye basacağını ve güvenilir olduğunu anlayabiliyor mu?

### 11. İşlev korunumu (geçti/kaldı — puanlanmaz, kapıdır)
- Ana sayfadaki **hiçbir** link/buton/form/girdi kaybolmaz, gizlenmez, işlevsiz kalmaz.
- Önce/sonra etkileşimli öğe envanteri karşılaştırılır; fark olursa değişiklik düzeltilir.

## Kaynaklar (ilkeler çıkarıldı, birebir alınmadı)
- Airbnb tasarım dili: tek aile, ağırlık-tabanlı hiyerarşi, 24 px kart aralığı / 4–8 px meta aralığı, tutarlı köşe ölçeği — <https://superdesign.dev/blog/airbnb-design-system>, <https://designmd.cc/benchmarks/airbnb>
- Zillow: arama kutusu ana sayfanın tek baskın CTA'sı, filtreler kademeli — <https://www.designrush.com/best-designs/websites/zillow>, <https://www.protopie.io/blog/zillow-design-real-state-future-with-protopie>
- Lüks emlak: kısıtlı renk (NNG: 2 birincil + 2 ikincil), serif+sans en çok 2–3 font, altın ikincil olmalı, bol boşluk — <https://wpresidence.net/how-to-build-luxury-real-estate-website/>, <https://www.propphy.com/blog/real-estate-brand-colors-guide>
- Fintech panoları: tekil vurgu rengi, tabular rakamlar, ≥ 4,5:1 kontrast, yalnız renkle durum verme — <https://adminlte.io/blog/fintech-dashboard-design-examples/>, <https://www.wandr.studio/blog/fintech-dashboard-design>
- Hareket: 200–400 ms, ease-out, yalnız transform/opacity, `prefers-reduced-motion` — <https://socialanimal.dev/blog/micro-interactions-web-design/>, <https://artofstyleframe.com/blog/micro-interactions-ui-when-to-animate/>
