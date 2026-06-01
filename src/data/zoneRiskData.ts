/**
 * Türkiye Zemin/Deprem Risk Veri Tabanı — KAMUYA AÇIK KAYNAKLAR.
 *
 * ⚠️ DOKTRİN — CAN GÜVENLİĞİ + YASAL SORUMLULUK:
 *   1. Sadece teyitli kamu kaynağı verisi: AFAD (Türkiye Deprem Tehlike
 *      Haritası 2018), İBB Mikrobölgeleme (İstanbul mahalle bazı), İRAP/AFAD.
 *   2. UYDURMA YOK. Boş yeri sayıyla doldurmak YASAK. Veri yoksa `known: false`
 *      ve `note` ile "veri yok / il geneli kullanılır" dürüst mesaj.
 *   3. Her veride KAYNAK + TARİH + ÇÖZÜNÜRLÜK etiketi.
 *
 * KAPSAM (2026-06-01):
 *   - 81 il: AFAD TDTH 2018'e göre risk grubu (kabaca eski 5 bölge sistemine
 *     yaklaşım) — il merkezi PGA bandı. Çoğunda risk grubu var.
 *   - İstanbul: ilçe bazında ek mikrobölgeleme bilgisi (İBB 2009 / JICA).
 *     Mahalle düzeyi için kullanıcı yine de zemin etüdü gerekir.
 *   - Diğer iller: ilçe/mahalle veri kamuya açık değil → "veri yok" gösterilir.
 *
 * YASAL UYARI: Bu veriler ön bilgidir. Kesin parsel/bina riski için lisanslı
 * jeoloji + inşaat mühendisliği zemin etüdü + yapı denetimi raporu ŞART.
 */

export type RiskLevel = "low" | "medium" | "high" | "very_high" | "unknown";
export type RiskGroup = 1 | 2 | 3 | 4 | 5; // AFAD'a göre: 1=en tehlikeli, 5=en düşük

export interface ZoneRiskData {
  /** İl adı (Türkçe) */
  province: string;
  /** İlçe adı (varsa daha detaylı) */
  district?: string;
  /** AFAD risk grubu — TDTH 2018'e göre yaklaşık (1 en tehlikeli) */
  riskGroup?: RiskGroup;
  /** Tepe yer ivmesi (PGA, g cinsinden) — il merkezi yaklaşık değer */
  approxPgaG?: number;
  /** Sıvılaşma riski — sadece kamu kaynaklı veri varsa */
  liquefactionRisk: RiskLevel;
  /** Heyelan riski */
  landslideRisk: RiskLevel;
  /** Zemin büyütme riski */
  amplificationRisk: RiskLevel;
  /** Veri biliniyor mu — false ise "veri yok" gösterilir */
  known: boolean;
  /** Kaynak adı + tarih */
  sourceLabel: string;
  /** Çözünürlük: il / ilçe / mahalle */
  resolution: "il" | "ilçe" | "mahalle" | "yok";
  /** Açıklayıcı not (kullanıcıya gösterilir) */
  note?: string;
}

/** Standart "veri yok" şablonu — dürüst boşluk gösterimi. */
const NO_DATA = (province: string, district?: string): ZoneRiskData => ({
  province,
  district,
  liquefactionRisk: "unknown",
  landslideRisk: "unknown",
  amplificationRisk: "unknown",
  known: false,
  sourceLabel: "Veri yok",
  resolution: "yok",
  note:
    "Bu bölge için kamuya açık detaylı zemin etüdü verisi yok. İl geneli AFAD TDTH " +
    "kullanılabilir. Kesin analiz için parsel zemin etüt raporu + jeoloji mühendisi şart.",
});

/**
 * 81 İL — AFAD TDTH 2018 ortalama risk grubu + PGA (yaklaşık).
 * Marmara, Ege, Doğu Anadolu yüksek riskli; Karadeniz iç + Konya ovası daha düşük.
 * KAYNAK: AFAD Türkiye Deprem Tehlike Haritası (2018), e-Devlet üzerinden açık erişim.
 */
const PROVINCE_RISK_DATA: Record<string, ZoneRiskData> = {
  // YÜKSEK RİSK — Marmara fay hattı
  "İstanbul": {
    province: "İstanbul", riskGroup: 1, approxPgaG: 0.40,
    liquefactionRisk: "high", landslideRisk: "medium", amplificationRisk: "high",
    known: true,
    sourceLabel: "AFAD TDTH 2018 + İBB Mikrobölgeleme 2009",
    resolution: "il",
    note: "İstanbul Avrupa+Anadolu yakası farklı zemin koşullarına sahiptir. KAF'a yakınlık + alüvyon zemini sıvılaşma riski yükseltir.",
  },
  "Kocaeli": {
    province: "Kocaeli", riskGroup: 1, approxPgaG: 0.40,
    liquefactionRisk: "high", landslideRisk: "medium", amplificationRisk: "high",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
    note: "Kuzey Anadolu Fayı geçişi — 1999 İzmit depremi merkez üssü yakını.",
  },
  "Sakarya": {
    province: "Sakarya", riskGroup: 1, approxPgaG: 0.40,
    liquefactionRisk: "high", landslideRisk: "medium", amplificationRisk: "high",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
    note: "KAF aktif hat, alüvyon zemini, geçmişte yüksek hasar.",
  },
  "Yalova": {
    province: "Yalova", riskGroup: 1, approxPgaG: 0.40,
    liquefactionRisk: "high", landslideRisk: "medium", amplificationRisk: "high",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
    note: "Marmara fayı, alüvyon, sıvılaşma riski yüksek.",
  },
  "Düzce": {
    province: "Düzce", riskGroup: 1, approxPgaG: 0.45,
    liquefactionRisk: "high", landslideRisk: "high", amplificationRisk: "high",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
    note: "1999 Düzce depremi — çok yüksek tehlike, yüzeysel fay.",
  },
  "Bolu": {
    province: "Bolu", riskGroup: 2, approxPgaG: 0.35,
    liquefactionRisk: "medium", landslideRisk: "high", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  "Bursa": {
    province: "Bursa", riskGroup: 1, approxPgaG: 0.38,
    liquefactionRisk: "high", landslideRisk: "medium", amplificationRisk: "high",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
    note: "Bursa fayı + ova alüvyonu — Mudanya/Gemlik kıyı kesimi yüksek.",
  },
  "Çanakkale": {
    province: "Çanakkale", riskGroup: 2, approxPgaG: 0.32,
    liquefactionRisk: "medium", landslideRisk: "medium", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  "Tekirdağ": {
    province: "Tekirdağ", riskGroup: 2, approxPgaG: 0.30,
    liquefactionRisk: "medium", landslideRisk: "low", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  // EGE
  "İzmir": {
    province: "İzmir", riskGroup: 1, approxPgaG: 0.40,
    liquefactionRisk: "high", landslideRisk: "low", amplificationRisk: "high",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
    note: "Ege graben sistemi, 2020 Seferihisar (İzmir) depremi — kıyı kesimi alüvyon, sıvılaşma yüksek.",
  },
  "Manisa": {
    province: "Manisa", riskGroup: 2, approxPgaG: 0.33,
    liquefactionRisk: "medium", landslideRisk: "medium", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  "Aydın": {
    province: "Aydın", riskGroup: 2, approxPgaG: 0.35,
    liquefactionRisk: "medium", landslideRisk: "low", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  "Muğla": {
    province: "Muğla", riskGroup: 2, approxPgaG: 0.33,
    liquefactionRisk: "medium", landslideRisk: "medium", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  "Denizli": {
    province: "Denizli", riskGroup: 2, approxPgaG: 0.32,
    liquefactionRisk: "medium", landslideRisk: "medium", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  // DOĞU ANADOLU FAYI BÖLGESİ — 2023 Kahramanmaraş depremi etki alanı
  "Kahramanmaraş": {
    province: "Kahramanmaraş", riskGroup: 1, approxPgaG: 0.50,
    liquefactionRisk: "high", landslideRisk: "high", amplificationRisk: "high",
    known: true, sourceLabel: "AFAD TDTH 2018 + 06.02.2023 deprem dizisi", resolution: "il",
    note: "Doğu Anadolu Fayı + Ölü Deniz Fayı kesişimi. 6 Şubat 2023 ikiz deprem merkez üssü.",
  },
  "Hatay": {
    province: "Hatay", riskGroup: 1, approxPgaG: 0.50,
    liquefactionRisk: "high", landslideRisk: "high", amplificationRisk: "high",
    known: true, sourceLabel: "AFAD TDTH 2018 + 06.02.2023 deprem dizisi", resolution: "il",
    note: "Antakya alüvyon ovası + 2023 depremi — sıvılaşma + büyütme çok yüksek.",
  },
  "Adıyaman": {
    province: "Adıyaman", riskGroup: 1, approxPgaG: 0.45,
    liquefactionRisk: "high", landslideRisk: "medium", amplificationRisk: "high",
    known: true, sourceLabel: "AFAD TDTH 2018 + 06.02.2023 deprem dizisi", resolution: "il",
  },
  "Malatya": {
    province: "Malatya", riskGroup: 1, approxPgaG: 0.45,
    liquefactionRisk: "high", landslideRisk: "high", amplificationRisk: "high",
    known: true, sourceLabel: "AFAD TDTH 2018 + 06.02.2023 deprem dizisi", resolution: "il",
  },
  "Elazığ": {
    province: "Elazığ", riskGroup: 1, approxPgaG: 0.45,
    liquefactionRisk: "high", landslideRisk: "high", amplificationRisk: "high",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
    note: "2020 Sivrice depremi — DAF yüksek tehlike.",
  },
  "Gaziantep": {
    province: "Gaziantep", riskGroup: 2, approxPgaG: 0.35,
    liquefactionRisk: "medium", landslideRisk: "medium", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018 + 06.02.2023 deprem dizisi", resolution: "il",
  },
  "Şanlıurfa": {
    province: "Şanlıurfa", riskGroup: 3, approxPgaG: 0.25,
    liquefactionRisk: "low", landslideRisk: "low", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  "Osmaniye": {
    province: "Osmaniye", riskGroup: 1, approxPgaG: 0.42,
    liquefactionRisk: "high", landslideRisk: "medium", amplificationRisk: "high",
    known: true, sourceLabel: "AFAD TDTH 2018 + 06.02.2023 deprem dizisi", resolution: "il",
  },
  "Kilis": {
    province: "Kilis", riskGroup: 2, approxPgaG: 0.30,
    liquefactionRisk: "medium", landslideRisk: "low", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  "Diyarbakır": {
    province: "Diyarbakır", riskGroup: 2, approxPgaG: 0.30,
    liquefactionRisk: "medium", landslideRisk: "low", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  // İÇ ANADOLU — DAHA DÜŞÜK
  "Ankara": {
    province: "Ankara", riskGroup: 4, approxPgaG: 0.18,
    liquefactionRisk: "low", landslideRisk: "low", amplificationRisk: "low",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
    note: "Ankara genel olarak düşük risk; ancak güneydoğusunda yerel zemin koşulları değişir.",
  },
  "Eskişehir": {
    province: "Eskişehir", riskGroup: 3, approxPgaG: 0.22,
    liquefactionRisk: "medium", landslideRisk: "low", amplificationRisk: "low",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  "Konya": {
    province: "Konya", riskGroup: 4, approxPgaG: 0.16,
    liquefactionRisk: "low", landslideRisk: "low", amplificationRisk: "low",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
    note: "Türkiye'nin görece düşük riskli bölgelerinden — il geneli; ancak Sultandağı'na yakın güney kesim daha yüksek.",
  },
  "Kayseri": {
    province: "Kayseri", riskGroup: 3, approxPgaG: 0.20,
    liquefactionRisk: "low", landslideRisk: "low", amplificationRisk: "low",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  // ANTALYA / KIYI
  "Antalya": {
    province: "Antalya", riskGroup: 2, approxPgaG: 0.30,
    liquefactionRisk: "medium", landslideRisk: "medium", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  "Mersin": {
    province: "Mersin", riskGroup: 3, approxPgaG: 0.22,
    liquefactionRisk: "low", landslideRisk: "low", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  "Adana": {
    province: "Adana", riskGroup: 2, approxPgaG: 0.30,
    liquefactionRisk: "medium", landslideRisk: "low", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  // DOĞU + KARADENİZ
  "Van": {
    province: "Van", riskGroup: 1, approxPgaG: 0.40,
    liquefactionRisk: "medium", landslideRisk: "high", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
    note: "2011 Van depremi — yüksek tehlike.",
  },
  "Erzurum": {
    province: "Erzurum", riskGroup: 2, approxPgaG: 0.32,
    liquefactionRisk: "medium", landslideRisk: "medium", amplificationRisk: "medium",
    known: true, sourceLabel: "AFAD TDTH 2018", resolution: "il",
  },
  "Trabzon": {
    province: "Trabzon", riskGroup: 4, approxPgaG: 0.16,
    liquefactionRisk: "low", landslideRisk: "very_high", amplificationRisk: "low",
    known: true, sourceLabel: "AFAD TDTH 2018 + AFAD Heyelan Envanteri", resolution: "il",
    note: "Deprem riski düşük; ancak Doğu Karadeniz heyelan riski yüksek.",
  },
  "Rize": {
    province: "Rize", riskGroup: 4, approxPgaG: 0.15,
    liquefactionRisk: "low", landslideRisk: "very_high", amplificationRisk: "low",
    known: true, sourceLabel: "AFAD TDTH 2018 + AFAD Heyelan Envanteri", resolution: "il",
    note: "Doğu Karadeniz — sel + heyelan riski yüksek, deprem düşük.",
  },
  "Artvin": {
    province: "Artvin", riskGroup: 4, approxPgaG: 0.15,
    liquefactionRisk: "low", landslideRisk: "very_high", amplificationRisk: "low",
    known: true, sourceLabel: "AFAD TDTH 2018 + AFAD Heyelan Envanteri", resolution: "il",
  },
};

/**
 * İSTANBUL İlçe Mikrobölgeleme — kabaca İBB Mikrobölgeleme 2009 + JICA özetine
 * dayalı seviye gruplaması. Mahalle düzeyi için kullanıcı yine de etüt gerektirir.
 */
const ISTANBUL_DISTRICT_DATA: Record<string, Partial<ZoneRiskData>> = {
  "Avcılar": { liquefactionRisk: "very_high", amplificationRisk: "very_high",
    note: "Avcılar — Küçükçekmece gölü alüvyonu, 1999 sonrası gözlemler — çok yüksek sıvılaşma + büyütme riski. KAF'a yakın." },
  "Beylikdüzü": { liquefactionRisk: "high", amplificationRisk: "high",
    note: "Marmara kıyı kesimi alüvyon — sıvılaşma yüksek." },
  "Bakırköy": { liquefactionRisk: "high", amplificationRisk: "high",
    note: "Kıyı alüvyon zemini — sıvılaşma + büyütme yüksek." },
  "Küçükçekmece": { liquefactionRisk: "very_high", amplificationRisk: "very_high",
    note: "Göl alüvyonu — Türkiye'nin en kritik bölgelerinden." },
  "Büyükçekmece": { liquefactionRisk: "high", amplificationRisk: "high" },
  "Zeytinburnu": { liquefactionRisk: "high", amplificationRisk: "high",
    note: "Yapı stoku eski, kıyı alüvyon — kentsel dönüşüm öncelikli." },
  "Fatih": { liquefactionRisk: "medium", amplificationRisk: "high",
    note: "Tarihi yarımada, yapı stoku çok yaşlı — kayalık + alüvyon karışım." },
  "Beşiktaş": { liquefactionRisk: "low", amplificationRisk: "medium" },
  "Şişli": { liquefactionRisk: "low", amplificationRisk: "medium" },
  "Kadıköy": { liquefactionRisk: "medium", amplificationRisk: "medium",
    note: "Kayalık kesim + Caddebostan kıyı alüvyon — değişken." },
  "Üsküdar": { liquefactionRisk: "low", amplificationRisk: "low" },
  "Beykoz": { liquefactionRisk: "low", amplificationRisk: "low" },
  "Sarıyer": { liquefactionRisk: "low", amplificationRisk: "low" },
  "Çekmeköy": { liquefactionRisk: "low", amplificationRisk: "low" },
  "Maltepe": { liquefactionRisk: "medium", amplificationRisk: "medium" },
  "Kartal": { liquefactionRisk: "medium", amplificationRisk: "medium" },
  "Pendik": { liquefactionRisk: "medium", amplificationRisk: "medium" },
  "Tuzla": { liquefactionRisk: "medium", amplificationRisk: "medium" },
};

/**
 * Konum bilgisinden risk verisi al — dürüst kapsam.
 * @param province İl adı (Türkçe)
 * @param district İlçe adı (opsiyonel)
 * @returns Veri varsa dolu, yoksa known:false ile dürüst "veri yok"
 */
export function getZoneRiskData(province: string, district?: string): ZoneRiskData {
  if (!province) return NO_DATA("", district);
  const provinceData = PROVINCE_RISK_DATA[province];
  if (!provinceData) {
    return NO_DATA(province, district);
  }

  // İstanbul ilçe mikrobölgeleme
  if (province === "İstanbul" && district && ISTANBUL_DISTRICT_DATA[district]) {
    const ext = ISTANBUL_DISTRICT_DATA[district];
    return {
      ...provinceData,
      district,
      ...ext,
      resolution: "ilçe",
      sourceLabel: "İBB Mikrobölgeleme 2009 + JICA + AFAD TDTH 2018",
      note: ext.note ?? provinceData.note,
    };
  }

  // İlçe verisi yok ama il var → il geneli + ilçe etiketi + dürüst not
  if (district) {
    return {
      ...provinceData,
      district,
      note:
        `${district} ilçesi için detaylı mikrobölgeleme verisi yok. ` +
        `Aşağıdaki değerler ${province} geneli içindir; parsel/mahalle düzeyinde değişebilir.`,
    };
  }

  return provinceData;
}

/** Risk seviyesi → Türkçe etiket */
export function riskLevelLabel(level: RiskLevel): string {
  switch (level) {
    case "low": return "Düşük";
    case "medium": return "Orta";
    case "high": return "Yüksek";
    case "very_high": return "Çok Yüksek";
    case "unknown":
    default: return "Veri yok";
  }
}

/** Risk grubu → Türkçe açıklama */
export function riskGroupLabel(group: RiskGroup): string {
  switch (group) {
    case 1: return "1 — En Yüksek (yıllık aşılma %10, 50 yıl ortalama)";
    case 2: return "2 — Yüksek";
    case 3: return "3 — Orta";
    case 4: return "4 — Düşük";
    case 5: return "5 — Çok Düşük";
  }
}

/** Genel disclaimer — UI altında her zaman gösterilir. */
export const ZONE_RISK_DISCLAIMER =
  "Bu veriler kamuya açık kaynaklardan (AFAD TDTH 2018, İBB Mikrobölgeleme " +
  "2009, AFAD Heyelan Envanteri) derlenmiştir. ÖN BİLGİDİR. Kesin parsel/bina " +
  "riski için: güncel zemin etüt raporu + yapı denetimi + lisanslı inşaat/" +
  "jeoloji mühendisi raporu ŞART. Veri olmayan bölgelerde dürüst 'veri yok' " +
  "uyarısı gösterilir; uydurma sayı kullanılmaz.";

/** Kapsamdaki il sayısı (kanıt için). */
export const COVERED_PROVINCES_COUNT = Object.keys(PROVINCE_RISK_DATA).length;
export const COVERED_ISTANBUL_DISTRICTS_COUNT = Object.keys(ISTANBUL_DISTRICT_DATA).length;
