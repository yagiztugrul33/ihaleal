/**
 * Türkiye İl/İlçe Veri Tabanı — Konum Seçici için statik kaynak.
 *
 * Kapsam:
 *   - 81 il (plaka kodu + adı + il merkezi yaklaşık koordinatları)
 *   - Büyük 10 ilin tam ilçe listesi (İstanbul, Ankara, İzmir, Bursa, Antalya,
 *     Adana, Konya, Gaziantep, Kayseri, Mersin)
 *   - Diğer iller için ilçe listesi şu an boş; kullanıcı il + harita pin
 *     kombinasyonu ile yine de tam konum girebilir.
 *
 * Veri kaynağı: T.C. İçişleri Bakanlığı + e-Devlet kayıtlı il/ilçe listesi
 * (kamuya açık). Koordinatlar il merkezi (Wikipedia coğrafi koordinat).
 *
 * Sahibinden seviyesi UX: kullanıcı il → ilçe seçer; mahalle/sokak yerine
 * harita üzerinde pin atar (kesin koordinat). API bağımlılığı YOK.
 */

export interface Province {
  /** Plaka kodu — 01 - 81 */
  code: string;
  /** İl adı — Türkçe */
  name: string;
  /** İl merkezi enlem (WGS84) */
  lat: number;
  /** İl merkezi boylam (WGS84) */
  lng: number;
  /** İlçe listesi — boş ise il merkezi + harita pin kullanılır */
  districts: readonly string[];
}

export const TR_PROVINCES: readonly Province[] = [
  { code: "01", name: "Adana", lat: 37.000, lng: 35.321,
    districts: ["Aladağ","Ceyhan","Çukurova","Feke","İmamoğlu","Karaisalı","Karataş","Kozan","Pozantı","Saimbeyli","Sarıçam","Seyhan","Tufanbeyli","Yumurtalık","Yüreğir"] },
  { code: "02", name: "Adıyaman", lat: 37.764, lng: 38.276, districts: [] },
  { code: "03", name: "Afyonkarahisar", lat: 38.756, lng: 30.539, districts: [] },
  { code: "04", name: "Ağrı", lat: 39.719, lng: 43.057, districts: [] },
  { code: "05", name: "Amasya", lat: 40.653, lng: 35.833, districts: [] },
  { code: "06", name: "Ankara", lat: 39.9334, lng: 32.8597,
    districts: ["Akyurt","Altındağ","Ayaş","Bala","Beypazarı","Çamlıdere","Çankaya","Çubuk","Elmadağ","Etimesgut","Evren","Gölbaşı","Güdül","Haymana","Kahramankazan","Kalecik","Keçiören","Kızılcahamam","Mamak","Nallıhan","Polatlı","Pursaklar","Sincan","Şereflikoçhisar","Yenimahalle"] },
  { code: "07", name: "Antalya", lat: 36.8969, lng: 30.7133,
    districts: ["Akseki","Aksu","Alanya","Demre","Döşemealtı","Elmalı","Finike","Gazipaşa","Gündoğmuş","İbradı","Kaş","Kemer","Kepez","Konyaaltı","Korkuteli","Kumluca","Manavgat","Muratpaşa","Serik"] },
  { code: "08", name: "Artvin", lat: 41.183, lng: 41.819, districts: [] },
  { code: "09", name: "Aydın", lat: 37.856, lng: 27.842, districts: [] },
  { code: "10", name: "Balıkesir", lat: 39.649, lng: 27.886, districts: [] },
  { code: "11", name: "Bilecik", lat: 40.150, lng: 29.983, districts: [] },
  { code: "12", name: "Bingöl", lat: 38.885, lng: 40.499, districts: [] },
  { code: "13", name: "Bitlis", lat: 38.401, lng: 42.108, districts: [] },
  { code: "14", name: "Bolu", lat: 40.736, lng: 31.606, districts: [] },
  { code: "15", name: "Burdur", lat: 37.720, lng: 30.290, districts: [] },
  { code: "16", name: "Bursa", lat: 40.1885, lng: 29.0610,
    districts: ["Büyükorhan","Gemlik","Gürsu","Harmancık","İnegöl","İznik","Karacabey","Keles","Kestel","Mudanya","Mustafakemalpaşa","Nilüfer","Orhaneli","Orhangazi","Osmangazi","Yenişehir","Yıldırım"] },
  { code: "17", name: "Çanakkale", lat: 40.155, lng: 26.413, districts: [] },
  { code: "18", name: "Çankırı", lat: 40.601, lng: 33.616, districts: [] },
  { code: "19", name: "Çorum", lat: 40.550, lng: 34.957, districts: [] },
  { code: "20", name: "Denizli", lat: 37.778, lng: 29.094, districts: [] },
  { code: "21", name: "Diyarbakır", lat: 37.910, lng: 40.241, districts: [] },
  { code: "22", name: "Edirne", lat: 41.677, lng: 26.555, districts: [] },
  { code: "23", name: "Elazığ", lat: 38.681, lng: 39.227, districts: [] },
  { code: "24", name: "Erzincan", lat: 39.747, lng: 39.490, districts: [] },
  { code: "25", name: "Erzurum", lat: 39.904, lng: 41.267, districts: [] },
  { code: "26", name: "Eskişehir", lat: 39.776, lng: 30.521, districts: [] },
  { code: "27", name: "Gaziantep", lat: 37.0660, lng: 37.3833,
    districts: ["Araban","İslahiye","Karkamış","Nizip","Nurdağı","Oğuzeli","Şahinbey","Şehitkamil","Yavuzeli"] },
  { code: "28", name: "Giresun", lat: 40.917, lng: 38.387, districts: [] },
  { code: "29", name: "Gümüşhane", lat: 40.460, lng: 39.483, districts: [] },
  { code: "30", name: "Hakkari", lat: 37.575, lng: 43.738, districts: [] },
  { code: "31", name: "Hatay", lat: 36.402, lng: 36.349, districts: [] },
  { code: "32", name: "Isparta", lat: 37.764, lng: 30.553, districts: [] },
  { code: "33", name: "Mersin", lat: 36.8000, lng: 34.6333,
    districts: ["Akdeniz","Anamur","Aydıncık","Bozyazı","Çamlıyayla","Erdemli","Gülnar","Mezitli","Mut","Silifke","Tarsus","Toroslar","Yenişehir"] },
  { code: "34", name: "İstanbul", lat: 41.0082, lng: 28.9784,
    districts: ["Adalar","Arnavutköy","Ataşehir","Avcılar","Bağcılar","Bahçelievler","Bakırköy","Başakşehir","Bayrampaşa","Beşiktaş","Beykoz","Beylikdüzü","Beyoğlu","Büyükçekmece","Çatalca","Çekmeköy","Esenler","Esenyurt","Eyüpsultan","Fatih","Gaziosmanpaşa","Güngören","Kadıköy","Kâğıthane","Kartal","Küçükçekmece","Maltepe","Pendik","Sancaktepe","Sarıyer","Silivri","Sultanbeyli","Sultangazi","Şile","Şişli","Tuzla","Ümraniye","Üsküdar","Zeytinburnu"] },
  { code: "35", name: "İzmir", lat: 38.4192, lng: 27.1287,
    districts: ["Aliağa","Balçova","Bayındır","Bayraklı","Bergama","Beydağ","Bornova","Buca","Çeşme","Çiğli","Dikili","Foça","Gaziemir","Güzelbahçe","Karabağlar","Karaburun","Karşıyaka","Kemalpaşa","Kınık","Kiraz","Konak","Menderes","Menemen","Narlıdere","Ödemiş","Seferihisar","Selçuk","Tire","Torbalı","Urla"] },
  { code: "36", name: "Kars", lat: 40.598, lng: 43.083, districts: [] },
  { code: "37", name: "Kastamonu", lat: 41.388, lng: 33.776, districts: [] },
  { code: "38", name: "Kayseri", lat: 38.7322, lng: 35.4853,
    districts: ["Akkışla","Bünyan","Develi","Felahiye","Hacılar","İncesu","Kocasinan","Melikgazi","Özvatan","Pınarbaşı","Sarıoğlan","Sarız","Talas","Tomarza","Yahyalı","Yeşilhisar"] },
  { code: "39", name: "Kırklareli", lat: 41.736, lng: 27.225, districts: [] },
  { code: "40", name: "Kırşehir", lat: 39.146, lng: 34.169, districts: [] },
  { code: "41", name: "Kocaeli", lat: 40.853, lng: 29.882, districts: [] },
  { code: "42", name: "Konya", lat: 37.8746, lng: 32.4932,
    districts: ["Ahırlı","Akören","Akşehir","Altınekin","Beyşehir","Bozkır","Cihanbeyli","Çeltik","Çumra","Derbent","Derebucak","Doğanhisar","Emirgazi","Ereğli","Güneysınır","Hadim","Halkapınar","Hüyük","Ilgın","Kadınhanı","Karapınar","Karatay","Kulu","Meram","Sarayönü","Selçuklu","Seydişehir","Taşkent","Tuzlukçu","Yalıhüyük","Yunak"] },
  { code: "43", name: "Kütahya", lat: 39.422, lng: 29.983, districts: [] },
  { code: "44", name: "Malatya", lat: 38.355, lng: 38.310, districts: [] },
  { code: "45", name: "Manisa", lat: 38.614, lng: 27.429, districts: [] },
  { code: "46", name: "Kahramanmaraş", lat: 37.575, lng: 36.937, districts: [] },
  { code: "47", name: "Mardin", lat: 37.312, lng: 40.735, districts: [] },
  { code: "48", name: "Muğla", lat: 37.215, lng: 28.363, districts: [] },
  { code: "49", name: "Muş", lat: 38.733, lng: 41.491, districts: [] },
  { code: "50", name: "Nevşehir", lat: 38.624, lng: 34.715, districts: [] },
  { code: "51", name: "Niğde", lat: 37.969, lng: 34.679, districts: [] },
  { code: "52", name: "Ordu", lat: 40.984, lng: 37.879, districts: [] },
  { code: "53", name: "Rize", lat: 41.020, lng: 40.523, districts: [] },
  { code: "54", name: "Sakarya", lat: 40.785, lng: 30.402, districts: [] },
  { code: "55", name: "Samsun", lat: 41.286, lng: 36.330, districts: [] },
  { code: "56", name: "Siirt", lat: 37.929, lng: 41.940, districts: [] },
  { code: "57", name: "Sinop", lat: 42.026, lng: 35.155, districts: [] },
  { code: "58", name: "Sivas", lat: 39.747, lng: 37.017, districts: [] },
  { code: "59", name: "Tekirdağ", lat: 40.978, lng: 27.511, districts: [] },
  { code: "60", name: "Tokat", lat: 40.314, lng: 36.554, districts: [] },
  { code: "61", name: "Trabzon", lat: 41.005, lng: 39.726, districts: [] },
  { code: "62", name: "Tunceli", lat: 39.107, lng: 39.547, districts: [] },
  { code: "63", name: "Şanlıurfa", lat: 37.166, lng: 38.793, districts: [] },
  { code: "64", name: "Uşak", lat: 38.674, lng: 29.408, districts: [] },
  { code: "65", name: "Van", lat: 38.494, lng: 43.380, districts: [] },
  { code: "66", name: "Yozgat", lat: 39.820, lng: 34.808, districts: [] },
  { code: "67", name: "Zonguldak", lat: 41.456, lng: 31.797, districts: [] },
  { code: "68", name: "Aksaray", lat: 38.368, lng: 34.037, districts: [] },
  { code: "69", name: "Bayburt", lat: 40.255, lng: 40.225, districts: [] },
  { code: "70", name: "Karaman", lat: 37.181, lng: 33.215, districts: [] },
  { code: "71", name: "Kırıkkale", lat: 39.846, lng: 33.515, districts: [] },
  { code: "72", name: "Batman", lat: 37.881, lng: 41.135, districts: [] },
  { code: "73", name: "Şırnak", lat: 37.518, lng: 42.455, districts: [] },
  { code: "74", name: "Bartın", lat: 41.638, lng: 32.337, districts: [] },
  { code: "75", name: "Ardahan", lat: 41.110, lng: 42.703, districts: [] },
  { code: "76", name: "Iğdır", lat: 39.923, lng: 44.045, districts: [] },
  { code: "77", name: "Yalova", lat: 40.655, lng: 29.276, districts: [] },
  { code: "78", name: "Karabük", lat: 41.205, lng: 32.624, districts: [] },
  { code: "79", name: "Kilis", lat: 36.718, lng: 37.115, districts: [] },
  { code: "80", name: "Osmaniye", lat: 37.075, lng: 36.246, districts: [] },
  { code: "81", name: "Düzce", lat: 40.840, lng: 31.163, districts: [] },
] as const;

/** İl arama — isim eşleşmesi (case-insensitive, normalize). */
export function findProvince(name: string): Province | undefined {
  if (!name) return undefined;
  const lower = name.toLocaleLowerCase("tr-TR").trim();
  return TR_PROVINCES.find((p) => p.name.toLocaleLowerCase("tr-TR") === lower);
}

/** Plaka kodundan il. */
export function findProvinceByCode(code: string): Province | undefined {
  return TR_PROVINCES.find((p) => p.code === code);
}

/** İlçe sayısı dolu olan iller. */
export const PROVINCES_WITH_DISTRICTS = TR_PROVINCES.filter((p) => p.districts.length > 0);
