# ihaleal.com — tam hukuk ve iş planı (entegre çalışma metni)

**Belge:** Tapubid / ihaleal birleşik brief · **avukatlık hizmeti değildir; mahkeme veya düzenleyici önünde tek başına delil olarak kullanılamaz.**  
**Son güncelleme:** 29.04.2026 · **Zorunlu:** Türkiye Barosu’na bağlı avukat + vergi danışmanı ile şirket özelinde müzakere ve imza.

**İlgili teknik kaynak:** `src/lib/fees.ts` · **Site özeti:** `#/hukuk-strateji-master`

---

## 0. Rol ve sınırlar

Bu metin “iş kurma talimatı” formatında yapılandırılmıştır; ancak **nihai hukuki sonuç somut olguya ve sicile bağlıdır.** Özellikle ödeme/teminat ve taşınmaz ticareti yetki çerçevesi için **erken dönem hukuk–muhasebe oturumu** şarttır.

---

## 1. Hukuki analiz

### 1.1 Bu iş modeli Türkiye’de yasal mı?

**Sonuç (çerçeve):** Özel hukuka tabi **ticari gayrimenkul satımına dijital organizasyon ve müzayede benzeri teklif süreci** tek başına “kanunen yasak” kategorisinde değerlendirilmez. Yasallık; **sıfat (aracılık / yayın / ödeme havuzu), ödeme kullanımı, taahhüt düzeyi ve yetki belgesi uyumu** ile belirlenir.

**Risk:** Yanlış sıfat + kullanıcı parasını hukuka aykırı tutma + eksik bilgilendirme → idari/cezai ve ticari dava riski.

**Çözüm:** Taşınmaz ticareti yetki belgesi ile uyumlu faaliyet tanımı; para akışında banka/ÖHS/escrow üçgeni; sözleşmelerde taraf rollerinin netliği.

### 1.2 Hangi kanunlar (özet liste)?

| Küme | Örnek |
|------|--------|
| Borçlar | TBK (ön sözleşme, temerrüt, ayıp, cezai şart sınırları) |
| Şirket | TTK (yönetim, temsil, iç işleyiş) |
| E-ticaret / bilgilendirme | 6563, Mesafeli Sözleşmeler Yönetmeliği (uygulanabilirlik gayrimenkul hizmet bileşeninde tartışmalı — avukat) |
| Kişisel veri | KVKK ve ikincil düzenlemeler |
| AML | 5549 MKKK |
| Ödeme | 6493 çerçevesi ve BDDK düzenlemeleri |
| Taşınmaz ticareti | Yetki belgesi rejimi ve ilgili mevzuat |

Bu liste örnektir; proje özelinde ek başlıklar eklenebilir.

### 1.3 “İhale” dil riski ve **ihaleal.com** markası

| Risk | Açıklama | Çözüm |
|------|-----------|--------|
| Kamu İhale Kanunu çağrışımı | “İhale” kelimesi 4734 ile bağdaştırılırsa yanlış beklenti | Pazarlama + şartname dilinde **“açık artırma / müzayede süreci”** netliği |
| Marka | Üçüncü şahıs hakları ve benzer markalar | **Marka araştırması + tescil stratejisi** (avukat/partner) |
| İsim–işlev uyumu | Alan adı ile gerçekten sunulan hizmet uyumu | Şirket ilanı ve ön bilgilendirme metinleri ile örtüşme |

**Net karar:** Marka kullanılabilir; ancak **şartname ve ön bilgilendirme** “kamu ihalesi” izlenimi vermeyecek şekilde düzenlenmelidir.

### 1.4 Taşınmaz ticareti yetki belgesi yeterli mi?

**Tek cümlede hayır/şartlı evet değildir.** Yetki belgesi **belirli faaliyetleri** kapsar; platform ürününün (ilan + müzayede + komisyon + ödeme) bileşenleri tek tek sicil ve izin çerçevesiyle **eşleştirilir.**

---

## 2. Yetki ve şirket yapısı

| Soru | Çalışma cevabı |
|------|----------------|
| Ltd mi AŞ mi? | Büyük ölçek ve kurumsal yatırım için **AŞ** sık tercih edilir; vergi ve yönetim için Ltd de mümkün — **muhasebe + hukuk** kararı. |
| Platform statüsü | Tipik hedef: **aracılık/yazılım organizasyonu** + sözleşmeyle sınırlı müşavirlik değil taşınmazın mülkiyetine taraf olmama. |
| Ek lisans? | Ödeme ve para saklama modeline göre **banka/ÖHS** sözleşmeleri ve iç prosedürler; “platform cüzdanı” modeli ayrıca **6493 analizi** gerektirir. |

---

## 3. Para akışı ve üç ödeme modeli

### Model A — Banka blokeli / escrow hesabı (çift imza veya prosedür)

- **Artı:** Para platform işleteninin serbest hesabında değil.
- **Eksi:** Banka süreçleri ve süreler; sözleşme üçgeni gerekir.

### Model B — Ödeme kuruluşu (ÖHS) ile tahsilat/koruma

- **Artı:** Ödeme altyapısı düzenlemeye daha yakın.
- **Eksi:** Ürün tasarımının ÖHS ürün kurallarıyla uyumu.

### Model C — Platform yalnızca talimat / yönlendirme (para üzerinde mülkiyet iddiası yok)

- **Artı:** Düzenleyici yük azaltılabilir (somut olguya bağlı).
- **Eksi:** Kullanıcı deneyimi ve banka entegrasyon karmaşıklığı.

**Önerilen ilk güvenli hat (MVP):** **Model A veya B + mutlaka avukat yazımı** ile teminatın hukuka uygun havuzu; platform hesabında birikimden kaçınma.

### Para akışı (mantıksal sıra)

```
Teklif → Kazanan belirleme (sunucu zamanı) → Ön sözleşme/kapora veya teminat prosedürü
→ Blokeli/ÖHS kanalı → Tapu öncesi koşullar → Ödeme tamamlama → Komisyon faturası (mahsup ile)
```

---

## 4. Platform sorumluluğu (nerede başlar/biter?)

| Alan | Platform rolü | Tipik sınır |
|------|----------------|-------------|
| İlan içeriği | Yayın organizasyonu | İçeriğin doğruluğu için satıcı beyanı + moderasyon |
| Teklif kaydı | Teknik kayıt tutma | Manipülasyon önleme algoritması + log |
| Ödeme | Yönlendirme / havuz ortağı ile | Paranın mülkiyetinde taraf olmama (modele bağlı) |
| Tapu | Süreç bilgilendirme | Tapu sonucuna garanti vermeme |

**“Sadece platformum” koruması:** Yazılı taahhüt + süreç tasarımı + şikâyet hattı + log; tek başına slogan yetmez.

---

## 5. Risk senaryoları (gerçek hayat)

| Senaryo | Hukuki risk | Finansal risk | Mekanizma |
|---------|-------------|----------------|-----------|
| Satıcı satmaktan vazgeçer | TBK/şartname ihlali tartışması | Teminat ve itibar kaybı | Rezerv fiyat, cayma bedeli üst sınırı (avukat), teknik kilitleme |
| Alıcı ödemez | Temerrüt | Süreç uzaması | Ön sözleşme süresi, sıradaki teklif politikası (ürün kararı) |
| Teklif manipülasyonu | Haksız rekabet / dolandırıcılık şüphesi | İtibar | Rate limit, kimlik seviyesi, şüpheli işlem prosedürü |
| Sahte ilan | TBK/KVKK/Tüketici | Operasyonel maliyet | Manuel onay, evrak zorunluluğu, kullanıcı şikâyetı |
| Taraflar arası dava | Platform üçüncü taraf olarak davaya çekilir mi? | Savunma maliyeti | Yetkili mahkeme, delil log saklama, sorumluluk sınırı maddeleri |

---

## 6. Sözleşmeler

**Genişletilmiş taslak metinler:** `docs/hukuk/EK_SOZLESME_TASLAK_PAKETI.md`  
İmza öncesi mutlaka **tam hukuki revizyon.**

---

## 7. Gelir modeli — üç senaryo ve ürün kararı

Ürün kodu **`src/lib/fees.ts`** ile hizalı **seçili model (Şirket kararı — bu repo):**

| Kalem | Hedef |
|-------|--------|
| İşlem komisyonu | Satıcıdan matrah **%4 + KDV** |
| Ortak emlakçı | **B2B %2 + KDV** |
| Alıcı işlem komisyonu | İşlem üzerinden **0** |
| Üyelik | Satıcı **5.000 TL/yıl**, alıcı **1.000 TL/yıl** (sınırsız ilan/teklif hedefi) |
| Ek gelir | Opsiyonel **hizmet kalemleri** (fotoğraf, ekspertiz vb.) — `SERVICE_FEES` |

**Alternatif senaryo A (sadece çerçeve — kodda değil):** Daha düşük komisyon + daha yüksek üyelik (avukat ve birim ekonomisi ile).

**Alternatif senaryo B:** Kurumsal satıcılar için ayrı komisyon çizelgesi (B2B fatura disiplini).

**Alternatif senaryo C:** Şehir bazlı pilot ücret — duyuru ve ön bilgilendirme zorunlu.

**MVP planı (0 → lansman):**

1. Hukuk + ödeme ortağı kilidi (6–10 hafta paralel hedef).  
2. Tek şehir / sınırlı envanter / **manuel onaylı** müzayede.  
3. Gerçek zamanlı teklif + audit log + üretim RLS.  
4. Ölçek: otomasyon ve kurumsal satıcılar.

---

## 8. Teknik sistem mimarisi

| Katman | Öneri (ihaleal.com ile uyumlu) |
|--------|--------------------------------|
| Ön uç | React (Vite), TypeScript |
| Arka uç / veri | Supabase Postgres + Auth + RLS; kritik işlevler için Edge Functions |
| Gerçek zamanlı | Realtime veya WebSocket; **sunucu zamanı tek kaynak** |
| Teklif | Atomik işlem; minimum artış; anti-sniping kuralları kodda |
| Güvenlik | RLS, audit_log, rate limiting, şüpheli işlem bayrakları |

**Teklif algoritması (basit akış):** İstemci teklif gönderir → sunucu fiyatı doğrular → zaman damgası kaydı → sıralama güncellenir → yayın → uzatma koşulu tetiklenmiş mi kontrol.

---

## 9. Marka ve strateji (ihaleal.com)

| Konu | Öneri |
|------|--------|
| Güven | Şeffaf şartname, demo etiketi (şu anki sürüm), ileride noter/evrak entegrasyonu yol haritası |
| Konumlandırma | “Lisanslı emlak organizasyonu + dijital müzayede süreci” (somut yetkiye uygun dille) |
| Global | Alan adı ve İngilizce ürün adı ikinci faz; önce TR hukuki çekirdek |

---

## 10. Sonuç ve stratejik yol haritası

### Bu iş yapılır mı?

**Evet**, hukuki–teknik–ticari çekirdek birlikte kurulursa; **hayır**, tek başına yazılım veya tek başına marka yeterli değildir.

### En büyük üç risk

1. Ödeme/teminat düzeninin düzenlemeye aykırılığı.  
2. Taşınmaz ticareti sıfatı ile sicil uyumsuzluğu.  
3. Ön bilgilendirme ve log eksikliğinden doğan tüketici/KVKK sürtüşmesi.

### 0’dan lansmana (özet)

| Faz | İçerik |
|-----|--------|
| F0 | Avukat + muhasebe + ödeme ortağı seçimi |
| F1 | Taslak sözleşmeler ve şartname kilidi |
| F2 | MVP ürün (sınırlı coğrafya, manuel onay) |
| F3 | Ölçek ve kurumsal satıcı |

---

**Çapraz referans:** Önceki özet dosya `TAPUBID_IHALLEGAL_MASTER_PLAN.md` ile çelişki olursa **bu dosya güncel çerçeve** olarak ele alınır.
