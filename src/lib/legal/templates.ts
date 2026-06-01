/**
 * Sözleşme + belge şablonları — örnektir, avukat onayı şart.
 *
 * Şablonlar TEK kaynak: bu dosya. UI'dan görüntüleme/indirme + PDF üretim ileride.
 * Avukatlık Kanunu 1136 m. 35: ihaleal danışmanlık VERMEZ.
 */

export type TemplateCategory =
  | "ihale"
  | "satis"
  | "kaparo"
  | "muvafakat"
  | "vekalet"
  | "bagis"
  | "saglik";

export interface TemplateMeta {
  id: string;
  baslik: string;
  kategori: TemplateCategory;
  ozet: string;
  /** Ne zaman gerekir */
  neZaman: string;
  /** Hangi mevzuat referans */
  mevzuat: string;
  /** Tahmini hazırlık süresi */
  sure: string;
  /** Gerekli ekler */
  ekler: string[];
  /** Şablonun TR markdown gövdesi */
  govde: string;
  /** "Yeni" / "Popüler" rozet */
  badge?: string;
}

const TEMPLATES: TemplateMeta[] = [
  // 1. İhale Katılım Sözleşmesi
  {
    id: "ihale_katilim",
    baslik: "İhale Katılım Sözleşmesi",
    kategori: "ihale",
    ozet: "Açık artırma ihalesine katılım taahhüdü + teminat + anti-snipe + kazanan yükümlülüğü.",
    neZaman: "Her ihaleye teklif öncesi — platform otomatik onaya sunar.",
    mevzuat: "TBK 6098 m. 274+ (açık artırma) · İhaleal Kullanım Koşulları",
    sure: "Elektronik onay 30 saniye",
    ekler: ["Kimlik fotokopisi", "Vergi numarası", "IBAN bilgisi"],
    badge: "Popüler",
    govde: `İHALE KATILIM SÖZLEŞMESİ

1. TARAFLAR
   1.1. KATILIMCI: [ad, soyad, T.C., adres, e-posta, telefon]
   1.2. ARACI: ihaleal.com (platformun yasal sahibi)

2. KONU
   Katılımcı, ihaleal.com üzerinde [İlan No: ____] kaydı bulunan gayrimenkul ihalesine
   katılma iradesini elektronik onay ile bildirmektedir.

3. TEMİNAT (PROVİZYON)
   3.1. Katılımcı, teklif vermeden önce gayrimenkul muhammen değerinin %5'i tutarında
        kredi kartı PROVİZYONu (banka blokajı) verir; nakit çekim yapılmaz.
   3.2. İhale kazanılırsa teminat satım bedelinden mahsup edilir.
        Kaybedilirse 24 saat içinde banka blokajı kaldırılır.

4. TEKLİF KURALLARI
   4.1. Verilen teklifler BAĞLAYICIDIR; geri çekilmesi mümkün değildir.
   4.2. Anti-sniping: ihale bitimine 3 dakikadan az kalmış teklifler kapanışı +3 dk uzatır.
   4.3. Sahte teklif, bot kullanımı, çoklu hesap MASAK + ihale hilesi suçları kapsamındadır.

5. KAZANAN YÜKÜMLÜLÜĞÜ
   5.1. En yüksek teklifi veren KATILIMCI kazanır.
   5.2. Kazanan, 5 iş günü içinde tapu randevusuna gelmelidir.
   5.3. Bedel, anlaşmalı bankaya emanet (escrow) yatırılır; tapu devri sonrası satıcıya geçer.

6. CEZA KOŞULU
   6.1. Kazanan tapuya gelmezse teminat irat (kayıp) — satıcıya tazminat olarak ödenir.
   6.2. Satıcı tapuya gelmezse alıcıya ödediği teminat çift olarak iade edilir (TBK 178).

7. KVKK
   Katılımcı verileri KVKK çerçevesinde işlenir; detaylı bilgi: ihaleal.com/kvkk

8. UYUŞMAZLIK
   Ankara Mahkemeleri ve İcra Daireleri yetkilidir; arabuluculuk ön şarttır (7036).

[Katılımcı imza/elektronik onay]      [Tarih: __/__/____]

⚠️ Bu metin örnek niteliktedir. Yasal yayın öncesi baroya kayıtlı avukat onayı şarttır.
`,
  },

  // 2. Satış Vaadi Sözleşmesi
  {
    id: "satis_vaadi",
    baslik: "Gayrimenkul Satış Vaadi Sözleşmesi",
    kategori: "satis",
    ozet: "Tapu devri ileriki tarihte yapılacak ise — taraflar arası ön bağlayıcı vaad.",
    neZaman: "Tapu randevusu/kredi onayı bekleyenler için; max 1 yıl içinde gerçekleşmeli.",
    mevzuat: "TBK 6098 m. 29; TMK 4721 m. 1009 (şerh)",
    sure: "Noter düzenlemesi 1-2 saat",
    ekler: ["Mülk tapu fotokopisi", "İmar durum belgesi", "Tapuya şerh dilekçesi"],
    govde: `GAYRİMENKUL SATIŞ VAADİ SÖZLEŞMESİ

1. TARAFLAR
   1.1. SATICI VAATÇİSİ: [ad, soyad, T.C., adres]
   1.2. ALICI VAATÇİSİ: [ad, soyad, T.C., adres]

2. KONU
   Tarafların ileride gerçekleştirmeyi taahhüt ettikleri gayrimenkul satışı.
   Mülk: [İl/İlçe/Mahalle, Ada/Parsel, Bağımsız Bölüm No, m²]

3. BEDEL
   3.1. Toplam satım bedeli: [yazı ile ve rakam ile]
   3.2. Kaparo: bedelin %10'u — sözleşme imzasında banka transferi ile ödenir.
   3.3. Kalan bedel: tapu devri sırasında havale/EFT/çek ile ödenir.

4. DEVİR TARİHİ
   En geç [tarih] gününe kadar tapu devri yapılacaktır.
   Süre uzatma: taraflar yazılı mutabakat ile 60 güne kadar uzatabilir.

5. TAPU ŞERHİ (TMK 1009)
   Bu sözleşme tarihinden itibaren 7 gün içinde tapuya şerh edilmesini taraflar
   karşılıklı taahhüt eder; şerh masrafı eşit paylaşılır.

6. TEMERRÜT VE FESİH
   6.1. Satıcı vaatçisi tapuya gelmezse kaparo ÇİFT olarak iade + cezai şart 50.000 TL.
   6.2. Alıcı vaatçisi tapuya gelmezse kaparo SATICIYA kalır + cezai şart 50.000 TL.

7. EK YÜKÜMLÜLÜK
   Mülk üzerinde mevcut ipotek/haciz/şerh varsa devir tarihinden önce satıcı vaatçisi
   bunları kaldırmakla yükümlüdür (ilişik kesme, fek belgesi).

8. UYUŞMAZLIK
   Mülk Mahkemeleri yetkilidir; arabuluculuk ön şart.

[Satıcı vaatçisi imza]    [Alıcı vaatçisi imza]    [Noter imza+kaşe]
                                                    [Tarih: __/__/____]

⚠️ Bu metin örnektir. Resmi şekil zorunluluğu — NOTER düzenlemesi şart.
`,
  },

  // 3. Kaparo / Ön Protokol
  {
    id: "kaparo_protokol",
    baslik: "Kaparo / Ön Protokol",
    kategori: "kaparo",
    ozet: "Tapu devri öncesi taraflar arası bağlayıcı niyet beyanı + kaparo ödemesi.",
    neZaman: "Satış vaadi kadar resmi değil; küçük tutarlı/kısa vadeli işlemler için.",
    mevzuat: "TBK 6098 m. 178 (kapora=pey akçesi)",
    sure: "Yazılı 30 dakika; noter şart değil ama önerilir",
    ekler: ["Taraflar kimlik", "Mülk bilgileri", "Banka dekont"],
    govde: `KAPARO / ÖN PROTOKOL

Taraflar:
- Mülk Sahibi: [ad, T.C.]
- Aday Alıcı: [ad, T.C.]

Mülk: [adres, m², tapu bilgisi]
Anlaşılan satım bedeli: [tutar]

KAPARO: [bedelin %5-10'u] TL — bugün banka transferi ile ödendi.
Banka: [banka adı, IBAN, dekont no]

KOŞULLAR:
1. Taraflar [tarih] gününe kadar tapu devri için anlaşacaklarını taahhüt ederler.
2. Alıcı vaadinden cayarsa KAPARO MAHSUP edilir (satıcıda kalır).
3. Satıcı vaadinden cayarsa KAPARO ÇİFT olarak iade edilir (TBK 178).
4. Mücbir sebep (deprem, sel, hastalık) durumunda kapora iade.

[İmza Satıcı]    [İmza Alıcı]    [Tarih]

⚠️ Bu metin örnektir; tutarlar yüksekse satış vaadi sözleşmesi (noter onaylı) önerilir.
`,
  },

  // 4. Mirasçı Muvafakatname
  {
    id: "mirasci_muvafakat",
    baslik: "Mirasçı Muvafakatname (örnek)",
    kategori: "muvafakat",
    ozet: "Elbirliği mülkiyetindeki miras mülkün satışında tüm mirasçıların onayı.",
    neZaman: "Miras yoluyla geçen mülk satılırken — istemeyen mirasçıyı izale-i şuyu'a iter.",
    mevzuat: "TMK 4721 m. 599, 676",
    sure: "Noter onaylı 30 dakika her mirasçı için",
    ekler: ["Veraset ilamı", "Mirasçı T.C.", "Mülk tapu"],
    govde: `MUVAFAKATNAME (Miras Mülkü Satışı)

Veraset belgesi tarih: __/__/____  No: ____

Aşağıda imzası bulunan ben, [ad, soyad, T.C.],
muris [ad soyad, T.C.]'nin mirasçısı sıfatıyla,
müteveffadan intikal eden;

İl: ____ İlçe: ____ Mahalle: ____
Ada: ____ Parsel: ____ B.B. No: ____

şeklinde tapuda kayıtlı taşınmazın diğer mirasçılar
[mirasçı 2 ad soyad, T.C.],
[mirasçı 3 ad soyad, T.C.] tarafından
[alıcı ad soyad, T.C.]'ye satılmasına;

bedelin paylaşımının veraset belgesindeki paylara göre yapılmasına;
ve tapu işleminin gerçekleşmesine MUVAFAKAT VERİYORUM.

Bu muvafakatim ileride iptal edilemez; vekalet ve tasarruf yetkisini
mirasçılardan [mirasçı X]'a veriyorum.

İmza: ____________________
Tarih: __/__/____
Noter onayı + tasdik

⚠️ Resmi geçerlilik için her mirasçı için ayrı noter muvafakatname şart.
`,
  },

  // 5. Vekaletname Kontrol Listesi
  {
    id: "vekalet_kontrol",
    baslik: "Vekaletname Kontrol Listesi",
    kategori: "vekalet",
    ozet: "Tapu işlemi için gelen vekaletnamenin SAHTE/eksik olup olmadığını kontrol et.",
    neZaman: "Vekille satım yapıyorsan ön kontrol — sahte vekalet riski yüksek.",
    mevzuat: "TBK 6098 m. 504; Noterlik Kanunu 1512",
    sure: "5-10 dakika",
    ekler: ["Vekaletname aslı", "Asilın kimlik fotokopisi"],
    govde: `VEKALETNAME KONTROL LİSTESİ

□ 1. Vekaletname NOTER düzenlemesi mi? (özel/genel vekalet farkı)
□ 2. ÖZEL VEKALET — gayrimenkul satışı için açık yetki var mı?
   Örnek doğru ifade: "[ada/parsel/BB no]'lu taşınmazı [bedel asgari/azami]
   ile [alıcıya] satmaya yetkilidir"

□ 3. Vekil eden kişi (asil) hayatta mı?
   Asil ölmüşse vekalet düşer (TBK 513).
   Bireysel kayıt sorgu: NVI nüfus + ölüm kayıt.

□ 4. Asil ile DOĞRUDAN iletişim kuruldu mu?
   - Telefon görüşmesi
   - Video görüşmesi
   - Eğer mümkünse yüz yüze

□ 5. Noter teyidi alındı mı?
   Vekaletnameyi düzenleyen NOTERe telefonla teyit edebilirsin.

□ 6. Vekaletname tarihi ne kadar eski?
   6 aydan eski vekalet için yeni vekalet alınması güvenlidir.

□ 7. Vekil kim?
   Avukat mı, aile üyesi mi, profesyonel emlakçı mı?
   Vekil ile asilin ilişkisi belli mi?

□ 8. Bedel akışı banka mı, nakit mi?
   Banka transferi şart — kâğıt iz.

□ 9. Vekaletname kopya değil ASLI mı?
   Sadece asıl ile tapu işlemi yapılır.

□ 10. Vekaletnamede kısıtlama var mı? (azami bedel, kefil şartı, vb.)

⚠️ Bu liste eksik olabilir; avukat danışmanlığı zorunlu.
`,
  },

  // 6. Bağış Bilgi Notu
  {
    id: "bagis_bilgi",
    baslik: "Bağışlama Sözleşmesi (Bilgi Notu)",
    kategori: "bagis",
    ozet: "Aile içi veya 3. kişiye gayrimenkul bağışlama — noter şart, vergi yükü ağır.",
    neZaman: "Para yerine mülk verme; 1. derece akraba için muvazaa yerine BAĞIŞ önerilir.",
    mevzuat: "TBK 6098 m. 288-295; VİV 7338",
    sure: "Noter 1 saat",
    ekler: ["Tapu", "Bağışlayan+bağışlanan kimlik"],
    govde: `BAĞIŞLAMA SÖZLEŞMESİ — BİLGİ NOTU

NEDİR:
Bağışlayan kendi mülkünü karşılıksız olarak bağışlanan kişiye verir (TBK 285).

GEÇERLİLİK ŞARTI:
- Taşınmaz bağışlamada NOTER düzenlemesi şart (TBK 288).
- Tapu devri sırasında bağışlama açıkça belirtilmeli.

VERGİ YÜKÜ:
- VERASET VE İNTİKAL VERGİSİ (7338 sayılı kanun):
  * 1. derece akraba (eş, çocuk, ebeveyn): %10–30 artan oranlı (2024 tarifesi).
  * 1. derece dışı (kardeş, vb.): %15–40.
  * Yabancılar: %30–40.
- TAPU HARCI: bedelsiz olduğu için "intikal" muamelesi.

BAĞIŞIN GERİ ALINMASI (TBK 295):
- Bağışlanan ağır kusur işlerse (bağışlayana karşı suç vb.)
- Bağışlanan yükümlülüklere uymazsa (yükümlü bağış)
- Yoksulluğa düşen bağışlayan iade isteyebilir (sınırlı)

VURGULANACAK NOKTA:
1. derece akraba arası "satım" olarak gösterilen işlem MUVAZAA riski taşır.
BAĞIŞ olarak yapılması — vergi yüksek olsa da hukuki risk düşük.

GÜVENLİ ADIMLAR:
1. Avukat + mali müşavir görüşmesi (vergi karşılığı)
2. Noter onaylı bağışlama sözleşmesi
3. Veraset ve İntikal Vergisi beyanı (1 ay içinde)
4. Saklı paylı mirasçılarla muvafakatname (tenkis önler)
5. Tapu Müdürlüğünde resmi devir

⚠️ Bağış sonrası saklı paylı mirasçılar tenkis davası açabilir (TMK 560+).
`,
  },

  // 7. Fiil Ehliyeti / Sağlık Raporu Bilgi Notu
  {
    id: "saglik_raporu_yasli",
    baslik: "Fiil Ehliyeti / Sağlık Kurulu Raporu (Yaşlı Satışı)",
    kategori: "saglik",
    ozet: "65+ satıcının fiil ehliyetini ispat eden sağlık raporu — tapuda istenebilir.",
    neZaman: "Satıcı 65 yaş üstü ise her tapu işleminden önce.",
    mevzuat: "TMK 4721 m. 13-16; Tapu Sicili Tüzüğü md. 19",
    sure: "Hastane randevusu 1-2 hafta; rapor düzenleme 1 gün",
    ekler: ["Hastane randevu (MHRS)", "Kimlik", "Sevk belgesi"],
    badge: "Yeni",
    govde: `FİİL EHLİYETİ / SAĞLIK KURULU RAPORU — BİLGİ NOTU

NEDEN GEREKLİ:
65 yaş üstü satıcı için Tapu Müdürlüğü "fiil ehliyeti tam" raporu isteyebilir.
Demans, Alzheimer, ağır psikiyatrik tablo varsa tapu devri yapılamaz —
vasi atama + Sulh Hukuk Mahkemesi izni gerekir (TMK 462).

RAPOR İÇERİĞİ:
- "Sözleşme yapma + tasarruf ehliyetine sahiptir" ibaresi
- Tarih: tapu randevusuna en yakın gün (geçerlilik ~24 saat)
- Heyet: aile hekimi + nöroloji + psikiyatri (3 imza)
- Hastane mührü + kurum başkanı imzası

NEREDEN ALINIR:
- Tam teşekküllü Devlet/Eğitim Hastanesi (genelde Sağlık Kurulu var)
- Özel hastane Sağlık Kurulu (anlaşmalı)
- ASLA — kayıt dışı muayene veya internet üzerinden alınamaz

NASIL ALINIR (adım adım):
1. Aile hekimine başvur — durumu açıkla, sevk al
2. MHRS (Merkezi Hekim Randevu Sistemi) ile hastane randevusu — 1-2 hafta sürebilir
3. Hastane Sağlık Kurulu muayene gününde kimlik + sevk ile gel
4. 3 hekim ayrı muayene yapar (10-15 dk her biri)
5. Heyet ortak karar — "Fiil ehliyet tamdır / kısıtlıdır / yoktur"
6. Rapor hazırlanır (genelde aynı gün veya 1 iş günü)
7. Rapor ASLI ile tapu randevusuna git

REDDEDİLİRSE NE OLUR:
- Vasi atama davası (Sulh Hukuk Mahkemesi) — 1-3 ay sürebilir
- Vasi adına gayrimenkul satışı için ayrı izin kararı şart

DOĞAL TEHLİKE:
Rapor yenilenirse veya sahte ise tapu işlemi yapılır ama
SONRADAN İPTAL DAVASI mümkün (3 yıl içinde).

⚠️ Bu not bilgi amaçlıdır. Tıbbi rapor için resmi hastane prosedürü zorunlu.
`,
  },
];

export function listTemplates(): TemplateMeta[] {
  return TEMPLATES;
}

export function getTemplate(id: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export const CATEGORY_LABELS: Record<TemplateCategory | "tum", string> = {
  tum: "Tümü",
  ihale: "İhale",
  satis: "Satış Vaadi",
  kaparo: "Kaparo",
  muvafakat: "Muvafakat",
  vekalet: "Vekalet",
  bagis: "Bağış",
  saglik: "Sağlık Raporu",
};
