# Tapubid / ihaleal.com — hukuki ve operasyonel master plan (taslak)

> **Güncel genişletilmiş tek kaynak:** `IHALEAL_TAM_HUKUK_VE_IS_PLANI.md` — baba brief’i ile birleşik çerçeve (29.04.2026). Aşağıdaki özet korunmuştur.

**Belge türü:** Strateji ve mevzuat hatırlatıcısı · **bağlayıcı hukuki görüş veya avukat yerine geçmez.**  
**Son güncelleme:** 29.04.2026 · **Zorunlu adım:** Türkiye Barosu’na bağlı avukat ile şirket özelinde revizyon, şirket sözleşmesi, kullanıcı sözleşmeleri ve şartnamelerin mühürlenmesi.

---

## 0. Kritik uyarı

Bu metin yatırımcı sunumu veya mahkeme dosyası olarak kullanılmamalıdır. Gayrimenkul müzayede/aracılık modelleri; iş akışı, ödeme modeli, taraf rolleri ve şirket unvanına göre **634 sayılı KHK ve ikincil mevzuat**, **TBK**, **TTK**, **6563**, **6698**, **5549**, **6493** vb. ile çakışma riski taşıyan çok katmanlı bir alandır. Her kritik karar **somut olgu ve kayıtlı hukuki mütalaa** gerektirir.

---

## 1. Hukuki analiz

### 1.1 Türkiye’de model “yasaklı” mıdır?

“Tek başına online gayrimenkul teklif toplama ve en yüksek teklifle satışa giden süreç” kavramı **otomatik olarak yasadışı değildir**; ancak uygulama şekli şunlara bağlı olarak riskleri belirler:

- Taşınmaz satışına **aracılık / ticaret** sıfatı taşıyıp taşımadığınız,
- Para ve teminatın **kimin hesabında** durduğu,
- Platformun **tapu öncesi/sonrası taahhüt** düzeyi,
- Satıcı ile **vekalet / komisyon / şartname** ilişkisinin nasıl kurulduğu.

Bu bileşenler yanlış kurgulanırsa ceza veya idari yaptırım riski **iş modelinden** doğar; “teknik olarak mümkün” olmak tek başına yeterli değildir.

### 1.2 Başlıca mevzuat haritası (özet)

| Alan | Örnek başlık | Not |
|------|----------------|-----|
| Borçlar ve satım | TBK (6098) | Ön sözleşme, temerrüt, ayıp, cayma (profilinize bağlı) |
| Şirket ve ticaret | TTK (6102) | Yönetim, temsil, iç politika |
| E-ticaret / bilgilendirme | 6563, Mesafeli Sözleşmeler Yönetmeliği | Ön bilgilendirme, cayma istisnaları (gayrimenkulde sıkça tartışmalı — avukat değerlendirmesi şart) |
| Kişisel veri | KVKK (6698), ikincil düzenlemeler | Açık rıza, AİD, saklama, Findeks vb. |
| AML | 5549 MKKK | Şüpheli işlem, kimlik tespiti süreçleri |
| Ödeme ve ödeme hizmetleri | 6493 (ödemeye ilişkin düzenlemeler), BDDK rehberleri | **Teminatın mutlaka hukuka uygun havuzlanması** kritik |
| Taşınmaz ticareti / aracılık | İlgili mevzuat ve yetki belgesi rejimi | İş modeliniz “ticaret + komisyon” ise çerçeve daraltılır |

Bu liste tamamlayıcı değildir; “ihale” kelimesi ticari markada kullanılabilir fakat **Kamu İhale Kanunu kapsamıyla karıştırılmamalıdır.**

### 1.3 “İhale” vs “açık artırma / müzayede” dil riskleri

- **Kamu ihalesi** ve **4734** çerçevesi **ticari portal için doğrudan model değildir**.
- Pazarlama dilinde **“açık artırma”, “müzayede süreci”, “şeffaf teklif turu”** gibi ifadeler; yanlış iddia oluşturmadığı sürece daha güvenlidir.
- Kullanıcıya **devlet ihalesi / kamu kesimi izlenimi** verecek görsel ve kelime seçimi risk oluşturur.

### 1.4 “Emlak yetki belgesi yeterli mi?”

Bu sorunun cevabı **tek evet/hayır değildir.** Taşınmaz ticareti yetki belgesi çoğu zaman **belirli faaliyetleri** kapsar; platformun:

- Sadece **ilan yayını** mı yaptığı,
- **Komisyonlu satış organizasyonu** mu kurduğu,
- **Teklif toplama + tapuya kadar süreç** mü yönettiği,

rollerine göre ek iç prosedür veya ek düzenleme ihtiyacı doğabilir. **Ön koşul:** Yetki belgesi kapsamı ile şirket faaliyet konunun uyumu için ticaret sicili ve Ticaret Bakanlığı bilgi hatları üzerinden **somut danışma.**

---

## 2. Gerekli belge ve lisanslar (kontrol listesi)

**Genel hat:** Şirket içi politika + sicil + vergi + KVKK tedbirleri + ödeme ortağı sözleşmeleri.

1. **Taşınmaz ticareti yetki belgesi** (faaliyet kapsamına uygunluk).
2. **Şirket türü:** Çoğu zaman Limited veya Anonim; kurumsal yatırım ve ölçek için AŞ sıklıkla tercih edilir — vergi ve yönetim için muhasebe + hukuk birlikte değerlendirir.
3. **E-ticaret bilgilendirme yükümlülükleri:** Şirket ünvanı, MERSİS, iletişim, cayma/şikâyet kanalı (faaliyete göre).
4. **Mesafeli veya elektronik sözleşme düzeni:** Hizmet bileşenleri (üyelik, komisyon, ilan yayını) ayrı kalemlenmelidir.
5. **Ödeme / teminat için banka veya ödeme kuruluşu** ile çerçeve — platform bakiyesi olarak “havuz” **kanunsuz mevduat** riskine girmeden tasarlanmalıdır.

---

## 3. Fintech ve para akışı

### 3.1 Teminat alınırsa

- Teminat **platform şirketinin serbest hesabında birikmemeli** (ticari model ve kanuni statüye göre “mevduat benzeri” algı riski).
- **Escrow / blokeli hesap / ödeme kuruluşu havuzu** gibi yapılar değerlendirilir; sözleşme üçgeni (alıcı–satıcı–banka/ÖHS) avukatça yazılır.
- Kullanıcıya **“Paranız bizde güvende”** iddiası, düzenleyici gerçeklikle uyumlu değilse KVKK ve Tüketici mevzuatı açısından da risklidir.

### 3.2 BDDK / TCMB çerçevesi

Ödeme ve elektronik para ile temas eden her katman **6493 ve ikincil düzenlemeler** ile izlenebilir. Entegrasyon kararı **banka mı, ÖHS mi, escrow mu** netleştirilmeden yazılım geliştirmek yetersiz kalır.

### 3.3 En güvenli ödeme modeli (ilkeler)

1. Kart bilgisini **platformda saklamama** (PCI-DSS kapsamını dar tutma).
2. Teminat ve ödemelerin **ayrı kanıtlanabilir muhasebe** izi.
3. Komisyon faturalarının **mahsup** mantığı için `src/lib/fees.ts` ile uyumlu muhasebe çizelgesi.

---

## 4. Platform hukuki yapısı

### 4.1 Aracı hizmet sağlayıcı mı?

Çoğu kuruluşta hedeflenen çerçeve: **aracılık / organizasyon + dijital ara yüz**. Ancak:

- Tapu öncesi taahhüt,
- “Satış garantisi” dili,
- Fiyatı manipüle eden beyanlar,

platformu **gani kusurlu taraf** yapabilir. **“Ben sadece platformum”** cümlesi tek başına koruma sağlamaz; **sözleşme maddeleri, süreç tasarımı ve sigorta** birlikte düşünülür.

### 4.2 Sorumluluk sınırı nasıl çizilir?

- Şeffaf **şartname** ve **satıcı beyanı**,
- Moderasyon ve **sahte ilan tespiti** prosedürü,
- Şikâyet ve **uyuşmazlık çözümü** (arabuluculuk maddesi opsiyonel),
- **Force majeure** ve üçüncü taraf (banka, tapu) gecikmeleri.

---

## 5. Risk analizi ve sistem önlemleri

| Risk | Çözüm ilkesi | Sistem önlemi |
|------|----------------|----------------|
| Dolandırıcılık | Kimlik ve mülk doğrulama | KYC adımları, evrak yükleme, şüpheli ilan kilidi |
| Satıcının vazgeçmesi | Sözleşmede cayma ve cezai şart sınırları | Teklif turu kilidi, rezerv fiyat, depozito kuralları |
| Alıcının cayması | Ön sözleşme ve kapora rejimi | Ödeme akışı ve iade kurallarının net kodlanması |
| Sahte ilan | Moderasyon + hukuki başvuru | Manuel onay kuyruğu, kullanıcı raporu |
| Uyuşmazlık | Yetkili mahkeme / İstanbul sık seçilir | Sözleşmede net yetki ve delil (log) saklama |

---

## 6. Sözleşmeler

**Tam metin repoda:** `docs/hukuk/EK_SOZLESME_TASLAK_PAKETI.md`  
Bu paket **iskelet ve madde başlıklarıdır**; imza öncesi mutlaka avukatça şirket özelinde düzenlenir.

---

## 7. İş modeli (ceza riskini düşük tutan ilkeler)

1. Komisyon matrahı **tek kaynak:** `src/lib/fees.ts` (satıcı işlem komisyonu %4 + KDV hedefi; ortak B2B %2 + KDV; alıcı işlem komisyonu işlem üzerinden 0 — kod gerçeği).
2. Üyelik ve hizmet bedelleri **mahsup** mantığı şeffaf yazılır.
3. “Yatırım tavsiyesi” veya “kesin kazanç” dili kullanılmaz (SPK ve Tüketici riski).

---

## 8. Teknik mimari (özet)

- **Frontend:** mevcut React (Vite); gerçek zamanlı teklif için WebSocket veya Supabase Realtime + sunucu doğrulaması.
- **Backend:** idempotent teklif işlemi; **sunucu zamanı** kaynaklı tek doğruluk; anti-sniping kuralları `fees.ts` ile uyumlu.
- **Güvenlik:** JWT/RLS, rate limit, audit log; kritik işlemlerde **iki aşamalı onay**.

---

## 9. Marka: Tapubid vs ihaleal.com

| Ölçüt | Tapubid | ihaleal.com |
|--------|---------|-------------|
| Çağrışım | Tapu + müzayede; kısa | İhale süreci; marka kökü güçlü |
| Global | İngilizce telaffuz kolay | Türkçe köken; domain stratejisi ayrı |
| Risk | Benzer marka tarama gerekir | Mevcut domain ve içerik kod tabanı |

Öneri: **Tek ana marka** seçin; ikinci ad **alt ürün** veya şirket unvanı olarak korunabilir. Avukat ile **marka tescil** araştırması.

---

## 10. Sonuç

### 10.1 Bu iş yapılır mı?

**Evet, ancak** hukuki çerçeve, ödeme mimarisi ve yetki belgesi uyumu **birlikte** kurgulanmadan ölçeklenebilir denemez.

### 10.2 En büyük üç risk

1. **Ödeme ve teminat düzeninin** düzenleyici ve ticari gerçeklikle uyumsuzluğu.  
2. **Taşınmaz ticareti ve aracılık** sıfatının yanlış veya eksik tanımı.  
3. **Tüketici ve KVKK** iddialarına karşı eksik ön bilgilendirme ve log zayıflığı.

### 10.3 Yol haritası (özet)

1. Avukat + muhasebe ile **iş modeli kilidi** (4–8 hafta hedef).  
2. Banka/ÖHS ile **ödeme sandbox** (paralel).  
3. MVP: sınırlı şehir / sınırlı ilan / manuel onaylı müzayede.  
4. Sonra otomasyon ve gerçek zamanlı ölçek.

---

**ihaleal.com** kod tabanı bu plan ile uyumlu bilgi mimarisine bağlanmıştır; canlı hukuki metinler için **EK paketi + baro revizyonu** zorunludur.
