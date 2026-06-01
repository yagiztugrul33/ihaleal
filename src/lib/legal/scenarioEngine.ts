/**
 * Hukuki Senaryo Çözücü — kural tabanlı motor
 *
 * 10 tipik gayrimenkul işlemi için risk + dava + vergi + güvenli yol haritası.
 *
 * ÖNEMLİ: Bu dosya EĞİTİCİ amaçlıdır. Çıktılar "ön analiz" niteliğindedir;
 * somut karar öncesi avukat + mali müşavir + noter zorunlu (Avukatlık Kanunu 1136 m. 35).
 *
 * Tasarım: pure function — DOM/server bağımlı değil; UI'dan veya gelecekte
 * Supabase function'dan çağrılabilir.
 */

export type ScenarioId =
  | "para_ebeveyn_tapu_cocuk"
  | "miras_paylasimi"
  | "hisseli_izale_i_suyu"
  | "esler_arasi_bosanma"
  | "vekaletle_satis"
  | "yabanciya_satis"
  | "ipotekli_hacizli"
  | "olunceye_kadar_bakma"
  | "kat_karsiligi"
  | "sirket_uzerinden";

export type RiskLevel = "yuksek" | "orta" | "dusuk";

export interface DavaRiski {
  /** Dava adı */
  isim: string;
  /** Hangi mevzuat */
  mevzuat: string;
  /** Risk seviyesi */
  risk: RiskLevel;
  /** Kim açabilir */
  davaci: string;
  /** Açıklama */
  detay: string;
}

export interface VergiYuku {
  /** Vergi adı */
  isim: string;
  /** Oran/tutar (metinsel) */
  oran: string;
  /** Kim öder */
  yukumlu: string;
  /** Hukuki sebep */
  mevzuat: string;
}

export interface GuvenliYol {
  /** Adım numarası */
  step: number;
  /** Eylem */
  eylem: string;
  /** Niye gerekli */
  sebep: string;
  /** Tahmini süre */
  sure?: string;
}

export interface ScenarioInput {
  scenarioId: ScenarioId;
  /** Mülk değeri (TL) — vergi hesabı için */
  propertyValueTry?: number;
  /** Taraflar arası 1.derece yakınlık (anne-baba, çocuk, eş) */
  isFirstDegreeRelative?: boolean;
  /** İşlem kayıtlı belge ile mi (banka transferi, fatura) */
  hasOfficialPaperTrail?: boolean;
  /** Saklı paylı mirasçı sayısı (anne/baba/eş/çocuk) */
  reservedHeirCount?: number;
  /** Mülk durumu özel notları */
  notes?: string;
}

export interface ScenarioAnalysis {
  scenarioId: ScenarioId;
  title: string;
  /** Eğitici bir cümle özet */
  oneLineSummary: string;
  /** Hukuki nitelik (sözleşme tipi, yasal taraflar) */
  hukukiNitelik: string;
  /** 0-100 risk skoru */
  riskScore: number;
  riskLevel: RiskLevel;
  /** Açılabilecek davalar */
  davalar: DavaRiski[];
  /** Vergi yükü kalemleri */
  vergiler: VergiYuku[];
  /** Adım adım güvenli yol */
  guvenliYol: GuvenliYol[];
  /** Saklı pay etkisi (varsa) */
  sakliPayEtkisi?: string;
  /** AI yorum / dikkat çekilecek noktalar */
  aiYorum: string[];
  /** Mevzuat etiketleri (kanun + madde) */
  mevzuat: Array<{ kanun: string; madde?: string }>;
  /** Yargıtay içtihat referansı (örnek) */
  ictihat?: Array<{ daire: string; karar: string; ozet: string }>;
}

interface ScenarioBlueprint {
  id: ScenarioId;
  title: string;
  oneLineSummary: string;
  /** Sabit risk taban (input'ta yok ise) */
  baseRisk: number;
  build: (input: ScenarioInput) => Omit<ScenarioAnalysis, "scenarioId" | "title" | "oneLineSummary">;
}

/* ============================================================
 *  10 SENARYO ŞABLONU
 * ============================================================ */

const SCENARIOS: ScenarioBlueprint[] = [
  // 1. Para baba veriyor, tapu çocuk
  {
    id: "para_ebeveyn_tapu_cocuk",
    title: "Parayı Ebeveyn Veriyor, Tapu Çocuk Adına",
    oneLineSummary:
      "Anne/baba parayı veriyor; tapu çocuk adına alınıyor — muvazaa/bağış/tenkis/vergi riskleri var.",
    baseRisk: 70,
    build: (input) => {
      const sakliHeirs = input.reservedHeirCount ?? 0;
      const hasPaperTrail = input.hasOfficialPaperTrail ?? false;
      const adjustedRisk = Math.min(
        95,
        70 + (sakliHeirs > 0 ? 15 : 0) + (hasPaperTrail ? -5 : +5),
      );
      const value = input.propertyValueTry ?? 0;
      return {
        hukukiNitelik:
          "Görünürde satım sözleşmesi — gerçekte BAĞIŞ olduğu iddia edilebilir (muvazaa). Tapu çocuk adına; bedel ebeveynden çıkmış.",
        riskScore: adjustedRisk,
        riskLevel: adjustedRisk >= 75 ? "yuksek" : adjustedRisk >= 50 ? "orta" : "dusuk",
        davalar: [
          {
            isim: "Muvazaa (Hile/Görünürde İşlem)",
            mevzuat: "TBK 19, TMK 23 (Yargıtay 1. HD)",
            risk: "yuksek",
            davaci: "Saklı paylı mirasçı (eş, çocuk, anne-baba), borçlu/alacaklı, kamu (vergi)",
            detay:
              "Görünüşte satım, gerçekte bağış olduğunu ispatlamak için banka kayıtları + tanık + ipuçları yeterli olabilir; mülk geri istenebilir.",
          },
          {
            isim: "Tenkis Davası",
            mevzuat: "TMK 560-571",
            risk: sakliHeirs > 0 ? "yuksek" : "dusuk",
            davaci: "Saklı paylı mirasçılar (eş 1/4, altsoy + alt sınırlar)",
            detay:
              "Ebeveynin ölümünden sonra saklı paylı mirasçılar 'biz bu bağış ile haklarımıza aykırı şekilde mülkten yoksun bırakıldık' diye dava açabilir. Tenkis ile fazladan verilmiş kısım geri alınır.",
          },
          {
            isim: "İptal Davası (Bağışlamanın geri alınması)",
            mevzuat: "TBK 295",
            risk: "orta",
            davaci: "Bağışlayan ebeveyn (suç işlerse, ağır geçimsizlik vb.)",
            detay:
              "Çocuk anne/babaya karşı ağır kusur işlerse bağış geri alınabilir; tapu iptal kararı + iade.",
          },
        ],
        vergiler: [
          {
            isim: "Veraset ve İntikal Vergisi (BAĞIŞ olarak tespit edilirse)",
            oran: "1.derece akraba: %10–30 artan oranlı (2024 tarifesi); 1. derece dışı: %15–40",
            yukumlu: "Lehine intikal eden çocuk",
            mevzuat: "7338 sayılı Veraset ve İntikal Vergisi Kanunu",
          },
          {
            isim: "Tapu Harcı",
            oran: "alıcı %2 + satıcı %2 (satım gibi gösterilmiş ise — toplam %4)",
            yukumlu: "Taraflar",
            mevzuat: "492 sayılı Harçlar Kanunu",
          },
          ...(value > 0
            ? [{
                isim: "Değer Artış Kazancı (5 yıl içinde elden çıkarılırsa)",
                oran: "Artış üzerinden GVK 80; istisna 2024 ~₺87.000",
                yukumlu: "Sonra satan kişi",
                mevzuat: "193 sayılı GVK m. 80, mük. 80",
              }] : []),
        ],
        guvenliYol: [
          { step: 1, eylem: "Avukat + mali müşavir görüşmesi (BAĞIŞ veya SATIM kararı)", sebep: "Hangi yapının seçileceği belirleyici", sure: "1 hafta" },
          { step: 2, eylem: "BAĞIŞ tercih edilirse — noterde bağışlama sözleşmesi (TBK 288/289)", sebep: "Resmi şekil zorunluluğu; muvazaa iddiası önler", sure: "1 gün" },
          { step: 3, eylem: "Veraset ve İntikal Vergisi beyanı (1 ay içinde)", sebep: "Vergi cezası önlenir; resmi kayıt oluşur", sure: "1 ay" },
          { step: 4, eylem: "Saklı paylı mirasçılar varsa NOTER MUVAFAKATNAMESİ", sebep: "Tenkis davasını dış kapı dışı eder (önemli — geçerlilik için avukat onayı)", sure: "1 hafta" },
          { step: 5, eylem: "Banka transferi ile resmi para akışı + dekont", sebep: "Vergi denetiminde ispat", sure: "Hemen" },
          { step: 6, eylem: "Tapu Müdürlüğünde resmi devir + harç ödeme", sebep: "Yasal mülkiyet aktarımı", sure: "1-3 gün" },
        ],
        sakliPayEtkisi:
          sakliHeirs > 0
            ? `Saklı paylı mirasçı sayısı: ${sakliHeirs}. Tenkis davası açma hakları korunur; bağış değerinden tenkise tabi kısım iade edilir.`
            : "Saklı paylı mirasçı yok — tenkis riski düşük; yine de muvazaa iddiası bağımsız.",
        aiYorum: [
          "1. derece akraba arasında 'satım' gösterilen işlem büyük risk taşır; banka transferi olmaması muvazaa karinesini güçlendirir.",
          "BAĞIŞ yapılacaksa açıkça noterde yapılması daha güvenli (vergi yüksek olsa da hukuki risk düşük).",
          "Saklı paylı mirasçıların onayı varsa, tenkis davası riski büyük ölçüde ortadan kalkar.",
          "Çocuk mülkü 5 yıl içinde satarsa değer artış kazancı vergisi doğar.",
        ],
        mevzuat: [
          { kanun: "TBK 6098", madde: "m. 19 (muvazaa), m. 288-295 (bağış)" },
          { kanun: "TMK 4721", madde: "m. 560-571 (tenkis), m. 23" },
          { kanun: "GVK 193", madde: "m. 80, mük. 80" },
          { kanun: "Veraset İntikal 7338" },
          { kanun: "Harçlar 492" },
        ],
        ictihat: [
          {
            daire: "Yargıtay 1. HD",
            karar: "E.2018/3274 K.2020/1142",
            ozet: "Banka transferi olmadan 'satım' gösterilen 1. derece akraba devri bağış sayılarak tenkise tabi tutuldu.",
          },
        ],
      };
    },
  },

  // 2. Miras paylaşımı
  {
    id: "miras_paylasimi",
    title: "Miras Yoluyla Geçen Gayrimenkulün Paylaşımı",
    oneLineSummary:
      "Ortak mülkün miras yoluyla intikal — elbirliği mülkiyeti, paylaşım anlaşması veya izale-i şuyu.",
    baseRisk: 55,
    build: () => ({
      hukukiNitelik:
        "Ölen kişinin mülkü tüm mirasçılara ELBİRLİĞİ MÜLKİYET olarak intikal eder (TMK 599); paylaşım için ya anlaşma ya da izale-i şuyu davası.",
      riskScore: 55,
      riskLevel: "orta",
      davalar: [
        {
          isim: "İzale-i Şuyu (Ortaklığın Giderilmesi)",
          mevzuat: "TMK 698-699, HMK 384+",
          risk: "yuksek",
          davaci: "Herhangi bir mirasçı (paydaş)",
          detay:
            "Mirasçılar paylaşımda anlaşamazsa Sulh Hukuk Mahkemesinde ortaklığın giderilmesi davası açılır; mülk satışla paylaştırılır.",
        },
        {
          isim: "Miras Sebebiyle İstihkak",
          mevzuat: "TMK 637",
          risk: "orta",
          davaci: "Hak sahibi mirasçı",
          detay:
            "Mirasçı sıfatı dışlanmış kişi (3. kişi veya başka mirasçı) mülkten istihkak talep edebilir.",
        },
      ],
      vergiler: [
        {
          isim: "Veraset ve İntikal Vergisi",
          oran: "Tarife 2024: 1. derece artan oran %1–10 (1. derece akraba); 1. derece dışı %10–30. Mülk üzerinden ekspertiz değeri esas.",
          yukumlu: "Her mirasçı kendi payı için",
          mevzuat: "7338 sayılı VİV Kanunu",
        },
        {
          isim: "Tapu Harcı (intikal)",
          oran: "Veraset intikalde harçtan istisna (492/77)",
          yukumlu: "—",
          mevzuat: "Harçlar Kanunu 492",
        },
      ],
      guvenliYol: [
        { step: 1, eylem: "Mirasçılık belgesi (veraset ilamı) — noter veya sulh hukuk", sebep: "Tüm mirasçılar resmi olarak belirlenir", sure: "1-2 hafta" },
        { step: 2, eylem: "Veraset İntikal Vergisi beyanı (4 ay içinde — yurt dışı 6 ay)", sebep: "Vergi cezası önlenir; ilişik kesme alınır", sure: "1 ay" },
        { step: 3, eylem: "Anlaşmalı paylaşım — noter onaylı paylaşma sözleşmesi (TMK 676)", sebep: "Dava + masraf önlenir; herkes mutabık", sure: "1-3 hafta" },
        { step: 4, eylem: "Anlaşamayanlar için izale-i şuyu davası", sebep: "Mahkeme satış ile paylaştırır (genelde ihale)", sure: "6 ay – 2 yıl" },
        { step: 5, eylem: "Pay devri tapuya tescil + ilişik kesme belgesi", sebep: "Bireysel mülkiyet oluşur", sure: "1 hafta" },
      ],
      aiYorum: [
        "Elbirliği mülkiyetinde TÜM mirasçıların onayı olmadan SATIŞ yapılamaz.",
        "Anlaşmalı paylaşım her zaman izale-i şuyudan ucuz + hızlı.",
        "Veraset İntikal beyanı süresinde verilmezse %50'ye varan ceza.",
      ],
      mevzuat: [
        { kanun: "TMK 4721", madde: "m. 599 (intikal), m. 676 (paylaşma), m. 698-699 (izale)" },
        { kanun: "VİV 7338" },
        { kanun: "HMK 6100", madde: "m. 384+" },
        { kanun: "Harçlar 492", madde: "m. 77 (istisna)" },
      ],
    }),
  },

  // 3. Hisseli / İzale-i Şuyu
  {
    id: "hisseli_izale_i_suyu",
    title: "Hisseli Tapu — İzale-i Şuyu (Ortaklığın Giderilmesi)",
    oneLineSummary:
      "Birden çok kişinin paylı mülkiyetinde — anlaşılamayan paylaşımın MAHKEME SATIŞI ile çözümü.",
    baseRisk: 60,
    build: () => ({
      hukukiNitelik:
        "TMK m. 698-699: Her paydaş istediği zaman ortaklığın giderilmesi davası açabilir. Mahkeme önce aynen taksim mümkün mü bakar; değilse satışa karar verir.",
      riskScore: 60,
      riskLevel: "orta",
      davalar: [
        {
          isim: "İzale-i Şuyu (Aynen Taksim Talebi)",
          mevzuat: "TMK 699, HMK 311-323",
          risk: "yuksek",
          davaci: "Herhangi bir paydaş",
          detay:
            "Önce aynen taksim incelenir (parsel bölünmesi imar uygun mu); mümkün değilse satış yoluyla giderme. Satış genelde icra dairesinde + açık artırma.",
        },
      ],
      vergiler: [
        {
          isim: "Satış halinde Tapu Harcı",
          oran: "Alıcı %2 + Satıcı %2 (toplam %4)",
          yukumlu: "Taraflar",
          mevzuat: "Harçlar 492",
        },
        {
          isim: "Değer Artış Kazancı (5 yıl içinde alınıp satılırsa)",
          oran: "GVK 80",
          yukumlu: "Satıcı paydaş",
          mevzuat: "GVK 193",
        },
      ],
      guvenliYol: [
        { step: 1, eylem: "Önce ANLAŞMALI ÇÖZÜM — paydaşlar arası taksim/satım sözleşmesi", sebep: "Dava 1-2 yıl sürebilir, masraf yüksek", sure: "1-2 ay" },
        { step: 2, eylem: "Anlaşılamazsa Sulh Hukuk Mahkemesinde izale davası", sebep: "Mahkeme zorunlu inceler", sure: "6-18 ay" },
        { step: 3, eylem: "Bilirkişi raporu — aynen taksim mümkün mü", sebep: "Bina ise genelde mümkün değil → satış", sure: "1-3 ay" },
        { step: 4, eylem: "Açık artırma ile satış (icra)", sebep: "En yüksek teklif kazanır; bedel paydaşlara dağıtılır", sure: "1-2 ay" },
        { step: 5, eylem: "Bedel paylaşımı + ilişik kesme", sebep: "Ortaklık sona erer", sure: "1 hafta" },
      ],
      aiYorum: [
        "Açık artırma genelde piyasanın %10-25 altında kapanır (acele satış indirimi).",
        "Anlaşmalı taksim her zaman karlı; dava masrafı + zaman + sürpriz fiyat riski yüksek.",
        "Bir paydaş 'önalım hakkı' kullanarak satıştan öne geçebilir (TMK 732).",
      ],
      mevzuat: [
        { kanun: "TMK 4721", madde: "m. 698-699, 732 (önalım)" },
        { kanun: "HMK 6100", madde: "m. 311-323" },
        { kanun: "Harçlar 492" },
        { kanun: "GVK 193", madde: "m. 80, mük. 80" },
      ],
    }),
  },

  // 4. Eşler arası / Boşanma
  {
    id: "esler_arasi_bosanma",
    title: "Eşler Arası Devir / Boşanmada Mülk Paylaşımı",
    oneLineSummary:
      "Eşler arası gayrimenkul devri (edinilmiş mallara katılma rejimi) — boşanmada katılma alacağı + bağış riski.",
    baseRisk: 60,
    build: () => ({
      hukukiNitelik:
        "Türkiye'de yasal mal rejimi EDİNİLMİŞ MALLARA KATILMA (TMK 218+). Evlilik içinde alınan mülk kural olarak ortak; boşanmada katılma alacağı doğar.",
      riskScore: 60,
      riskLevel: "orta",
      davalar: [
        {
          isim: "Katılma Alacağı Davası (Mal Rejimi)",
          mevzuat: "TMK 231, 236",
          risk: "yuksek",
          davaci: "Boşanan/ölen eş (eski eş)",
          detay:
            "Boşanma kesinleştiğinde evlilik içinde edinilen mülkler üzerinde diğer eş yarı oranında katılma alacağı talep edebilir.",
        },
        {
          isim: "Muvazaa (Eşten Mal Kaçırma)",
          mevzuat: "TBK 19, TMK 23",
          risk: "yuksek",
          davaci: "Eski eş veya alacaklı",
          detay:
            "Boşanma öncesi/sırasında 3. kişiye 'satım' gibi gösterilerek devredilen mülk eşten mal kaçırma sayılıp iptal edilebilir.",
        },
      ],
      vergiler: [
        {
          isim: "Tapu Harcı",
          oran: "Eşler arası devirde 492 m. 59 — istisnalar olabilir; bağış olarak yapıldıysa VİV",
          yukumlu: "Taraflar",
          mevzuat: "Harçlar 492",
        },
      ],
      guvenliYol: [
        { step: 1, eylem: "Avukat görüşmesi — mal rejimi değerlendirmesi", sebep: "Edinilmiş mal mı, kişisel mal mı tespit", sure: "1 hafta" },
        { step: 2, eylem: "Eşler arası anlaşmalı boşanma + mal paylaşımı protokolü", sebep: "Sonradan katılma alacağı davası önlenir", sure: "1-3 ay" },
        { step: 3, eylem: "Protokol mahkemece onaylı + tapu devri sonrası tescil", sebep: "Resmi geçerlilik", sure: "1-2 hafta" },
        { step: 4, eylem: "Evlilik öncesi alımlarda — mal rejimi sözleşmesi (TMK 203)", sebep: "Edinilmiş mallar dışına çıkar", sure: "Noter 1 gün" },
      ],
      aiYorum: [
        "Boşanma anlaşmalı yapılırsa katılma alacağı protokolde çözülür — mahkeme süreci kısalır.",
        "Mal rejimi sözleşmesi NOTERDE yazılı şekil; evlilik öncesi/içinde yapılabilir.",
        "Evlilik öncesi edinilen mülk KİŞİSEL MALdır; sonradan edinilen mülkler edinilmiş mal sayılır.",
      ],
      mevzuat: [
        { kanun: "TMK 4721", madde: "m. 218-236 (mal rejimi), m. 203 (sözleşme)" },
        { kanun: "Harçlar 492", madde: "m. 59" },
        { kanun: "TMK", madde: "m. 23 (muvazaa)" },
      ],
    }),
  },

  // 5. Vekaletle satış
  {
    id: "vekaletle_satis",
    title: "Vekaletname ile Gayrimenkul Satışı",
    oneLineSummary:
      "Tapuda işlem için vekalet — noter onaylı, kapsam net, dolandırıcılık riski yüksek.",
    baseRisk: 65,
    build: () => ({
      hukukiNitelik:
        "Tapu satışında vekalet 'özel vekalet' olmalıdır (TBK 504); kapsamı 'satış için' açıkça belirtilmeli ve NOTERDEN düzenlenmiş.",
      riskScore: 65,
      riskLevel: "orta",
      davalar: [
        {
          isim: "Vekaletin Kötüye Kullanılması",
          mevzuat: "TBK 506-512",
          risk: "yuksek",
          davaci: "Vekil eden (asil)",
          detay:
            "Vekil yetkisi dışına çıkıp düşük bedelle veya 3. kişiye sattıysa iptal davası açılabilir.",
        },
        {
          isim: "Sahte Vekaletname",
          mevzuat: "TCK 207, 212",
          risk: "orta",
          davaci: "Mülk sahibi + savcılık",
          detay:
            "Vekaletname sahteyse satım tamamen geçersiz; tapu iptal edilir + ceza davası.",
        },
      ],
      vergiler: [
        { isim: "Tapu Harcı", oran: "Alıcı + Satıcı %2'şer", yukumlu: "Taraflar", mevzuat: "Harçlar 492" },
        { isim: "Noter Harcı (vekalet)", oran: "Değere göre tarife", yukumlu: "Vekil eden", mevzuat: "Harçlar 492" },
      ],
      guvenliYol: [
        { step: 1, eylem: "Vekaletname NOTER'de düzenlensin — özel yetki (gayrimenkul satışı + bedel + alıcı bilgisi)", sebep: "Sahte/genel vekalet riski azalır", sure: "1 gün" },
        { step: 2, eylem: "Vekaletname geçerlilik kontrolü (notere telefonla teyit)", sebep: "Sahte tespiti", sure: "1 saat" },
        { step: 3, eylem: "Asil ile DOĞRUDAN iletişim (video/yüz yüze)", sebep: "Asıl iradesini teyit", sure: "Hemen" },
        { step: 4, eylem: "Bedel banka transferi ile + dekont", sebep: "Vekil yetkisini aştığında ispat", sure: "Hemen" },
        { step: 5, eylem: "Tapu Müdürlüğünde işlem + vekalet aslı", sebep: "Resmi devir", sure: "1-3 gün" },
      ],
      aiYorum: [
        "Asil ile temas kurulamayan, sadece vekil ile yapılan satım YÜKSEK RİSK.",
        "Vekalet 6 ay geriye doğru notere teyit edilebilir; yeni vekalet tercih edilir.",
        "Vekil eden ölmüşse vekalet düşer (TBK 513) — tapu işlemi geçersiz.",
      ],
      mevzuat: [
        { kanun: "TBK 6098", madde: "m. 502-514 (vekalet)" },
        { kanun: "TCK 5237", madde: "m. 207, 212" },
        { kanun: "Noterlik 1512" },
      ],
    }),
  },

  // 6. Yabancıya satış
  {
    id: "yabanciya_satis",
    title: "Yabancı Uyruklu Kişiye Mülk Satışı",
    oneLineSummary:
      "Yabancıya gayrimenkul devri — 2644 sayılı Tapu Kanunu kısıtları + askeri yasak bölge + ülke esası.",
    baseRisk: 55,
    build: () => ({
      hukukiNitelik:
        "2644 sayılı Tapu Kanunu m. 35: Yabancı uyrukluya gayrimenkul devri Cumhurbaşkanlığı belirlediği ülkeler ve sınırlar içinde mümkündür.",
      riskScore: 55,
      riskLevel: "orta",
      davalar: [
        {
          isim: "Tapu İptali (yasak bölge / kotaaşımı)",
          mevzuat: "Tapu Kanunu 2644 m. 35-36",
          risk: "yuksek",
          davaci: "Hazine, valilik",
          detay:
            "Yabancı yasak bölgede mülk aldıysa Hazine adına tescil + bedel iadesi.",
        },
      ],
      vergiler: [
        { isim: "Tapu Harcı", oran: "Alıcı %2 + Satıcı %2", yukumlu: "Taraflar", mevzuat: "Harçlar 492" },
        { isim: "KDV (yabancıya konut satışında istisna olabilir)", oran: "KDV 3065 — 17/4-r — yabancılara döviz cinsinden 1. el satış istisnası", yukumlu: "Satıcı", mevzuat: "KDV 3065" },
        { isim: "Değer Artış Kazancı", oran: "5 yıl içinde elden çıkarılırsa GVK 80", yukumlu: "Satıcı", mevzuat: "GVK 193" },
      ],
      guvenliYol: [
        { step: 1, eylem: "Tapu Kadastro Genel Müdürlüğünden 'Yabancı Edinim İzni' sorgu", sebep: "Bölge yasak mı kontrol", sure: "1 hafta" },
        { step: 2, eylem: "Askeri yasak bölge raporu (mahalli komutanlık)", sebep: "Yasak bölgede satım geçersiz", sure: "2-4 hafta" },
        { step: 3, eylem: "Yabancı kişinin kotasını kontrol (30 hektar üst sınır)", sebep: "Kota aşımı tapu reddi", sure: "1 hafta" },
        { step: 4, eylem: "Döviz transferi banka aracılığı + DAB", sebep: "MASAK + KDV istisnası şartı", sure: "Hemen" },
        { step: 5, eylem: "Tapu Müdürlüğünde işlem (kayıtlı tercüman + yeminli)", sebep: "Yabancı diliyle sözleşme + tercüme", sure: "1-3 gün" },
      ],
      aiYorum: [
        "Türkiye vatandaşlığa esas mülk edinimi: 400.000 USD eşik (2026 itibariyle güncel oran kontrolü).",
        "Yabancı 1. el konut satışı KDV'den istisna (döviz transferi şartı).",
        "Yasak bölge listesi her yıl güncellenir — Cumhurbaşkanlığı kararnamesi takibi şart.",
      ],
      mevzuat: [
        { kanun: "Tapu 2644", madde: "m. 35, 36" },
        { kanun: "KDV 3065", madde: "m. 17/4-r" },
        { kanun: "GVK 193", madde: "m. 80" },
        { kanun: "MASAK 5549" },
      ],
    }),
  },

  // 7. İpotekli/Hacizli
  {
    id: "ipotekli_hacizli",
    title: "İpotekli veya Hacizli Mülk Satışı",
    oneLineSummary:
      "Tapuda kayıtlı ipotek veya haciz olan mülk — satış öncesi fek belgesi + alacaklı onayı + İcra Müdürlüğü.",
    baseRisk: 75,
    build: () => ({
      hukukiNitelik:
        "İpotek/haciz mülk üzerinde 3. kişi lehine takyitidir. Satış öncesinde fek edilmesi veya alıcının bu yükü kabul etmesi gerekir (TMK 880+).",
      riskScore: 75,
      riskLevel: "yuksek",
      davalar: [
        {
          isim: "Tapu İptali (gizlenmiş takyit)",
          mevzuat: "TMK 1024",
          risk: "yuksek",
          davaci: "İyiniyetli alıcı",
          detay:
            "Satıcı ipotek/haciz bilgisini gizlerse iyiniyetli alıcı tapu iptal + zarar tazmin talep edebilir.",
        },
        {
          isim: "İpotek/Haciz Sahibinin Takip Hakkı",
          mevzuat: "İİK 2004",
          risk: "yuksek",
          davaci: "Alacaklı (banka, vergi, icra)",
          detay:
            "Mülk satıldıktan sonra bile ipotek/haciz devam eder; alacaklı mülke yönelik takip yapabilir.",
        },
      ],
      vergiler: [
        { isim: "Tapu Harcı", oran: "Alıcı %2 + Satıcı %2", yukumlu: "Taraflar", mevzuat: "Harçlar 492" },
        { isim: "İpotek Fek Harcı", oran: "Tutara göre tarife", yukumlu: "Borçlu", mevzuat: "Harçlar 492" },
      ],
      guvenliYol: [
        { step: 1, eylem: "TKGM (Tapu) takyit sorgusu — ipotek/haciz/şerh listesi", sebep: "Mülk üzerindeki tüm yükler ortaya çıkar", sure: "1 gün" },
        { step: 2, eylem: "İpotek varsa bankaya bedel + FEK BELGESİ talebi", sebep: "İpotek kalkmadan satım anlamsız", sure: "1-2 hafta" },
        { step: 3, eylem: "Haciz varsa icra müdürlüğüne ödeme + kaldırma", sebep: "Haciz alacaklıya öder, alacaklı kaldırır", sure: "1-4 hafta" },
        { step: 4, eylem: "Vergi borcu için Vergi Dairesi ilişik kesme belgesi", sebep: "Tapu işlemi için zorunlu", sure: "1-3 gün" },
        { step: 5, eylem: "Temiz tapu + satım (alıcı kabul ediyorsa yük ile satım için NOTER ŞERHİ)", sebep: "Şeffaflık + gelecek dava önleme", sure: "1-3 gün" },
      ],
      aiYorum: [
        "Tapu sicili açık değil — fiziki sorgu (TKGM e-devlet) şart.",
        "İpotek karşılığı satım bedeli banka emanet hesabına aktarılır; banka fek belgesi verir.",
        "Haciz konulan mülk satım engeli yaratmaz ama haciz devam eder — alıcı yükümlülük altına girer.",
        "Eski borçlar için 'ilişik kesme' (vergi + emlak vergisi) belgesi olmadan tapu işlemi yapılmaz.",
      ],
      mevzuat: [
        { kanun: "TMK 4721", madde: "m. 880-902 (ipotek), m. 1024 (iyiniyetli alıcı)" },
        { kanun: "İİK 2004" },
        { kanun: "VUK 213", madde: "ilişik kesme" },
        { kanun: "Harçlar 492" },
      ],
    }),
  },

  // 8. Ölünceye Kadar Bakma
  {
    id: "olunceye_kadar_bakma",
    title: "Ölünceye Kadar Bakma Sözleşmesi",
    oneLineSummary:
      "Mülk karşılığı bakım — mülk sahibi ölene kadar bakım yükümlülüğü; tenkis + iptal riskleri var.",
    baseRisk: 70,
    build: () => ({
      hukukiNitelik:
        "TBK m. 611-619: Bakım borçlusu mülk sahibine ölene kadar bakar; karşılığında mülk (veya gelir) verilir. Resmi şekil ŞART (TBK 612 — noter düzenlemesi).",
      riskScore: 70,
      riskLevel: "yuksek",
      davalar: [
        {
          isim: "Tenkis (Saklı Pay)",
          mevzuat: "TMK 565-571",
          risk: "yuksek",
          davaci: "Saklı paylı mirasçılar",
          detay:
            "Bakım edimi mülk değerine göre çok düşükse saklı pay ihlali sayılır — mirasçılar tenkis dava açar.",
        },
        {
          isim: "Sözleşmenin Feshi",
          mevzuat: "TBK 617-619",
          risk: "orta",
          davaci: "Tarafların biri",
          detay:
            "Bakım borçlusu yükümlülüğünü ihlal ederse veya bakım imkansızlaşırsa fesih + tapu iadesi.",
        },
      ],
      vergiler: [
        { isim: "Tapu Harcı", oran: "Bedelsiz olduğu için intikal gibi muamele edilir", yukumlu: "—", mevzuat: "Harçlar 492" },
        { isim: "Veraset İntikal Vergisi", oran: "Mülk değeri üzerinden 1. derece dışı %15-40", yukumlu: "Bakım borçlusu", mevzuat: "VİV 7338" },
      ],
      guvenliYol: [
        { step: 1, eylem: "Noterde resmi şekilde sözleşme + tapu şerhi", sebep: "Geçerlilik şartı + 3. kişiye karşı koruma", sure: "1-2 gün" },
        { step: 2, eylem: "Bakım niteliği detaylı tanımlanır (ev, beslenme, sağlık, sosyal)", sebep: "İhtilaf önler", sure: "Sözleşmede" },
        { step: 3, eylem: "Sağlık + sosyal durum raporu — mülk sahibinin akli durumu", sebep: "Sonradan ehliyetsizlik iddiası önler", sure: "1 hafta" },
        { step: 4, eylem: "Saklı paylı mirasçılarla muvafakat (tenkis riskini azaltır)", sebep: "Tenkis davası önleme", sure: "1-2 hafta" },
        { step: 5, eylem: "Bakım faaliyeti aylık fatura + makbuz arşivi", sebep: "İfa ispatı", sure: "Sürekli" },
      ],
      aiYorum: [
        "Çok düşük yaşta sağlıklı kişinin mülkünü bakım karşılığı vermesi tenkis için kuvvetli karine.",
        "Bakım edimi paraya çevrilebilir olmalı — mülk değeriyle orantılı.",
        "Mülk sahibi sözleşme imzasından sonra 6 ay içinde ölürse 'son saatte irade' tartışması doğar.",
      ],
      mevzuat: [
        { kanun: "TBK 6098", madde: "m. 611-619" },
        { kanun: "TMK 4721", madde: "m. 565-571 (tenkis)" },
        { kanun: "VİV 7338" },
      ],
    }),
  },

  // 9. Kat karşılığı
  {
    id: "kat_karsiligi",
    title: "Kat Karşılığı İnşaat Sözleşmesi",
    oneLineSummary:
      "Arsa sahibi arsayı verir, müteahhit bina yapar; daire/işyeri ile karşı edim — teminat + hak ediş kritik.",
    baseRisk: 65,
    build: () => ({
      hukukiNitelik:
        "Karşılıklı edim borcu içeren atipik sözleşme. Noter onayı + tapu şerhi şart (TMK 1011). Pratikte 'düz arsa payı' veya 'hak ediş bazlı' yapılır.",
      riskScore: 65,
      riskLevel: "orta",
      davalar: [
        {
          isim: "Müteahhit Temerrüdü (Gecikme)",
          mevzuat: "TBK 117, 125",
          risk: "yuksek",
          davaci: "Arsa sahibi",
          detay:
            "Müteahhit teslim tarihini geçerse cezai şart + fesih + tazminat. Genellikle aylık gecikme cezası sözleşmede belirlenir.",
        },
        {
          isim: "İflasta İade Davası (Müteahhit İflas)",
          mevzuat: "İİK 2004 m. 277+",
          risk: "yuksek",
          davaci: "Arsa sahibi (iflas masasında)",
          detay:
            "Müteahhit iflas ederse arsa sahibi bina bitmemiş ise dairelerini ve arsayı geri alamayabilir; iflas masasına alacaklı olur.",
        },
      ],
      vergiler: [
        {
          isim: "Tapu Harcı (her edim için)",
          oran: "%4 (toplam)",
          yukumlu: "Taraflar",
          mevzuat: "Harçlar 492",
        },
        {
          isim: "KDV (müteahhit faturası)",
          oran: "%8 veya %20 (yapı türüne göre)",
          yukumlu: "Müteahhit",
          mevzuat: "KDV 3065",
        },
      ],
      guvenliYol: [
        { step: 1, eylem: "Noter onaylı kat karşılığı sözleşmesi + tapuya şerh", sebep: "3. kişiye karşı koruma + müteahhit iflasında öncelik", sure: "1 hafta" },
        { step: 2, eylem: "Müteahhit teminat senedi + banka mektubu", sebep: "Temerrüt halinde tahsil garantisi", sure: "Sözleşmede" },
        { step: 3, eylem: "Hak ediş bazlı tapu devri — bitmiş daireler dilim dilim", sebep: "Müteahhit iflas riski azaltılır", sure: "İnşaat boyunca" },
        { step: 4, eylem: "Yapı denetim firması + ruhsat takibi", sebep: "Kalite + ruhsat sorunları önlenir", sure: "Sürekli" },
        { step: 5, eylem: "Son dilim daireler kat irtifakı + kesin kabul sonrası", sebep: "Eksik iş varsa kesinti", sure: "Bitirme sonrası" },
      ],
      aiYorum: [
        "Düz arsa payı (%50/50) İstanbul merkezde tipik; taşrada %35-65 (taşra arsa sahibi aleyhine).",
        "Sözleşmede 'binaya ruhsat alma yükümlülüğü müteahhide ait' yazılmadıysa arsa sahibi geriye sıkışabilir.",
        "Kentsel dönüşüm projelerinde 6306 sayılı kanun ek koruma sağlar.",
      ],
      mevzuat: [
        { kanun: "TBK 6098", madde: "m. 117, 125 (temerrüt)" },
        { kanun: "TMK 4721", madde: "m. 1011 (tapu şerhi)" },
        { kanun: "İmar 3194" },
        { kanun: "Kentsel Dönüşüm 6306" },
        { kanun: "İİK 2004", madde: "m. 277+" },
      ],
    }),
  },

  // 10. Şirket üzerinden
  {
    id: "sirket_uzerinden",
    title: "Mülkün Şirket Üzerinden Alım/Satımı",
    oneLineSummary:
      "Tüzel kişi adına alım — kurumlar vergisi, KDV, şirket içi muvazaa, ortaklar arası anlaşmazlık riskleri.",
    baseRisk: 50,
    build: () => ({
      hukukiNitelik:
        "Şirket tüzel kişi olarak mülk edinir; alım/satımda KURUMLAR VERGİSİ + KDV + tapu harcı + şirket içi karar (yetki belgesi) gerekir.",
      riskScore: 50,
      riskLevel: "orta",
      davalar: [
        {
          isim: "Yetki Aşımı / Şirket İçi Muvazaa",
          mevzuat: "TTK 6102 m. 549-551",
          risk: "orta",
          davaci: "Ortaklar, alacaklılar",
          detay:
            "Şirket müdürü yetkisi olmadan satım yapmışsa veya kasıtlı düşük bedelle 3. kişiye devretmişse iptal + tazmin.",
        },
        {
          isim: "Örtülü Sermaye / Transfer Fiyatlandırması",
          mevzuat: "KVK 5520 m. 12-13",
          risk: "yuksek",
          davaci: "Vergi İdaresi",
          detay:
            "Ortaklara veya ilişkili 3. kişiye piyasa altı satım — örtülü kazanç dağıtımı + vergi cezası.",
        },
      ],
      vergiler: [
        { isim: "Kurumlar Vergisi (kazanç üzerinden)", oran: "%25 (2024)", yukumlu: "Şirket", mevzuat: "KVK 5520" },
        { isim: "KDV (taşınmaz satışı)", oran: "%8 veya %20 (konut türüne göre)", yukumlu: "Satan şirket", mevzuat: "KDV 3065" },
        { isim: "Tapu Harcı", oran: "Alıcı %2 + Satıcı %2", yukumlu: "Taraflar", mevzuat: "Harçlar 492" },
        { isim: "İştirak/aktif istisnası (2 yıl elde tutma)", oran: "Kazancın %50'si vergiden istisna (KVK 5/e)", yukumlu: "Şirket", mevzuat: "KVK 5520 m. 5/e" },
      ],
      guvenliYol: [
        { step: 1, eylem: "Şirket Müdürler Kurulu kararı + imza sirküleri", sebep: "Yetki aşımı önlenir", sure: "1-2 hafta" },
        { step: 2, eylem: "Ortaklar Kurulu kararı (büyük varlık ise — TTK 408)", sebep: "Genel kurul onayı şart", sure: "1 ay" },
        { step: 3, eylem: "SPK lisanslı ekspertiz raporu (transfer fiyat ispatı)", sebep: "Vergi denetiminde gerekli", sure: "1-2 hafta" },
        { step: 4, eylem: "Banka transferi + KDV faturası + tapu işlemi", sebep: "Resmi kayıt", sure: "1 hafta" },
        { step: 5, eylem: "Beyan dönemi sonunda kurumlar vergisi beyannamesi", sebep: "Yasal yükümlülük", sure: "1 ay" },
      ],
      aiYorum: [
        "Şirket aktiflerinde 2 yıldan uzun süre tutulan gayrimenkulün satışında kazancın %50'si vergiden istisna (KVK 5/e).",
        "Şirket ortakları arası satışta 'transfer fiyatlandırması' kuralı — piyasa fiyatı şart.",
        "Tapu işleminde imza sirküleri + yetki belgesi ZORUNLU.",
      ],
      mevzuat: [
        { kanun: "TTK 6102", madde: "m. 408 (ortaklar), 549-551 (sorumluluk)" },
        { kanun: "KVK 5520", madde: "m. 5/e, 12-13" },
        { kanun: "KDV 3065" },
        { kanun: "VUK 213" },
        { kanun: "Harçlar 492" },
      ],
    }),
  },
];

/* ============================================================
 *  API
 * ============================================================ */

export function listScenarios(): Array<{ id: ScenarioId; title: string; oneLineSummary: string }> {
  return SCENARIOS.map((s) => ({
    id: s.id,
    title: s.title,
    oneLineSummary: s.oneLineSummary,
  }));
}

export function analyzeScenario(input: ScenarioInput): ScenarioAnalysis {
  const bp = SCENARIOS.find((s) => s.id === input.scenarioId);
  if (!bp) {
    throw new Error(`Bilinmeyen senaryo: ${input.scenarioId}`);
  }
  const built = bp.build(input);
  return {
    scenarioId: bp.id,
    title: bp.title,
    oneLineSummary: bp.oneLineSummary,
    ...built,
  };
}

/** Çıktı için risk seviyesi renk eşleme */
export function riskColor(level: RiskLevel): "emerald" | "amber" | "rose" {
  return level === "dusuk" ? "emerald" : level === "orta" ? "amber" : "rose";
}

/** Türkçe risk etiketi */
export function riskLabel(level: RiskLevel): string {
  return level === "dusuk" ? "Düşük" : level === "orta" ? "Orta" : "Yüksek";
}

/** Girilen tutar string sanitize — sadece rakam */
export function sanitizeNumberInput(raw: string): number {
  const cleaned = String(raw ?? "").replace(/[^0-9]/g, "");
  return cleaned ? Math.max(0, parseInt(cleaned, 10)) : 0;
}
