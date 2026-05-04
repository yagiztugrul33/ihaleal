import type { FraudLitigationPillar } from "./fraudDefenseFramework";

/**
 * Gayrimenkul ekosisteminde sik dava ve dolandiricilik hatlari (TASLAK atlas).
 * Mahkeme icin madde numarasi yerine avukat dosyasinda netlestirilir.
 */
export const REAL_ESTATE_RISK_ATLAS: FraudLitigationPillar[] = [
  {
    id: "RE1",
    title: "Miras, payli mulkiyet ve satisa elverislilik",
    threats: [
      "Mirascilar arasi uyusmazlik; satisa yetkili olmayan mirasçinin imzasi.",
      "Payli tapuda diger paydaslarin onayi olmadan devir; gizli hissedar sonradan iptal davasi.",
    ],
    legalAnchors: ["TMK (miras, payli mulkiyet, yonetim)", "HMK delil ve bilirkisi"],
    controls: [
      "Noter / miras sirküleri ve tum mirascilarin muvafakati zinciri (yuksek riskli KKA icin bloklayici).",
      "Tapu senedi + veraset ilami / sulhnamesi OCR + insan onayi; pay orani ile uyum kontrolu.",
    ],
    evidenceArtifacts: ["miras belgesi hash", "onay zinciri logu", "bilirkisi raporu talebi"],
  },
  {
    id: "RE2",
    title: "Vasiyetname, iptal ve tenkis",
    threats: ["Vasiyetname sonrasi satis; tenkis talebi ile islem sarsilir.", "Elbirligi hissesinde yetki sahteciligi."],
    legalAnchors: ["TMK vasiyet ve tenkis", "Sahtecilik suc unsurlari (somut olayda CMK)"],
    controls: ["Vasiyetname var/yok bayrak; tenkis riski icin avukat on onay sarti.", "Hisse senedi / sirket arsasi ise TTK genel kurul zinciri."],
    evidenceArtifacts: ["vasiyet tespit belgesi", "paydas imza listesi"],
  },
  {
    id: "RE3",
    title: "Imar, ruhsat ve plan disi kullanim",
    threats: ["Imar barisi yok iddiasi; yikim / idari para cezasi riskinin aliciya yansimasi.", "Ruhsat alinmadan satis vaadi."],
    legalAnchors: ["3194 sayili Imar Kanunu (plan notu, ruhsat)", "Belediye mevzuati"],
    controls: ["Imar durumu yazisi + KAKS/TAKS veri kutuplari; KKA stüdyosu demo, resmi kayit bloklayici.", "Ruhsat yoksa 'insaat hakkı vaadi' dilinden kaçın; ürün metninde feragat."],
    evidenceArtifacts: ["imar PDF versiyonu", "parsel geometri TKGM", "moderasyon onay"],
  },
  {
    id: "RE4",
    title: "Kentsel donusum ve kamulastirma",
    threats: ["Proje alani kamulastirmada; satis sonrasi bedel ihtilafi.", "Donusum alani beyani yanlis / gecikmis."],
    legalAnchors: ["6306 KDOP", "2942 kamulastirma"],
    controls: ["Kentsel donusum / rezerv alan bayraklari; resmi karar ozeti zorunlu adim.", "Fiyat referansinda kamulastirma indirimi notu."],
    evidenceArtifacts: ["belediye karar ozeti", "alan etiketi"],
  },
  {
    id: "RE5",
    title: "Ipotek, haciz, serh ve feragat",
    threats: ["Satistan sonra cikan gizli ipotek; haciz yoluyla tasfiye.", "Serhli satis ve alicinin iyi niyeti tartismasi."],
    legalAnchors: ["İİK", "MK tapu sicili"],
    controls: ["Guncel tapu kaydi + ipotek / haciz sorgusu; serh varsa escrow sartlari.", "KKA'da feragat ve kat irtifaki asamasinda blokaj."],
    evidenceArtifacts: ["tapu cikti tarihi", "ipotek borclusu beyani"],
  },
  {
    id: "RE6",
    title: "Ayirtma, on alim ve TBK edimleri",
    threats: ["Cift ayirtma; kapora alip satmama.", "Ön alım sözleşmesi ile platform komisyonunun karışması."],
    legalAnchors: ["TBK ayirtma, on alim, cezai sart sinirlari"],
    controls: ["Ayirtma tutari PSP blokeli; cift rezervasyonu RPC ile engelle (hedef).", "Komisyon matrahini fees.ts tek kaynaktan goster; kampanya ayri politika."],
    evidenceArtifacts: ["rezervasyon RPC", "odeme bloke ref"],
  },
  {
    id: "RE7",
    title: "Ticari aracilik, yetki belgesi ve TTK",
    threats: ["Yetkisiz emlakci; sirket yetki exceed.", "Komisyon bolusme ihtilafi (B2B)."],
    legalAnchors: ["TTK temsil", "6563 araci hizmet (siniflandirma avukatca)"],
    controls: ["TTBS / yetki belgesi dogrulama yolu; emlakci profili zorunlu alanlar.", "Komisyon payi kod: AGENT_SHARE_RATES + sozlesme."],
    evidenceArtifacts: ["yetki belgesi no", "ticaret sicil gazetesi"],
  },
  {
    id: "RE8",
    title: "Muteahhit iflasi, konkordato ve KKA durmasi",
    threats: ["Insaat durunca arsa sahibi magdur; alacaklilar platforma yonelir.", "Konkordato ile odeme plani degisimi."],
    legalAnchors: ["İİK iflas", "Konkordato komiserligi"],
    controls: ["KKA sozlesmesinde iflas halinde durdurma / teminat cagrisi maddeleri (avukat).", "Yuvarlanan hakedis blokesi (kod: kkaRollingHakedisEngine)."],
    evidenceArtifacts: ["hakedis onay logu", "konkordato bildirimi"],
  },
  {
    id: "RE9",
    title: "Yabanci gercek / tuzel kisi edinimi",
    threats: ["Askeri yasak / istisna ihlali; idari iptal.", "Para transferi MASAK yuksek risk."],
    legalAnchors: ["Yabancilarin edinimi mevzuati", "5549 MKKK"],
    controls: ["Uyruk ve sermaye bayraklari; yasakli bolge kontrolu (manuel onay).", "Swift / doviz yolu STR esikleri."],
    evidenceArtifacts: ["uyruk KYC", "bolge kontrol sonucu"],
  },
  {
    id: "RE10",
    title: "Sahte vekalet, imza ve e-imza",
    threats: ["Vekaletnamesiz veya sahte vekille tapu basvurusu.", "E-imza zinciri zayif ise delil curutulur."],
    legalAnchors: ["SK m.76 (vekalet)", "Elektronik imza kanunu"],
    controls: ["e-Devlet vekalet sorgusu hedef entegrasyon; kritik imza adiminda MFA.", "Vekalet PDF hash + zaman damgasi."],
    evidenceArtifacts: ["vekalet dogrulama ref", "MFA log"],
  },
  {
    id: "RE11",
    title: "Tüketici, mesafeli satis ve reklam hukuku",
    threats: ["Yaniltici getiri vaadi; SPK disi yatirim tavsiyesi iddiasi.", "Mesafeli cayma ihtilafi."],
    legalAnchors: ["6502", "Reklam hukuku"],
    controls: ["Yatirim tavsiyesi degildir banner; AI skor feragati.", "Mesafeli sozlesme ve iade politikasi linkleri zorunlu footer."],
    evidenceArtifacts: ["on bilgilendirme versiyon", "banner kabul logu"],
  },
  {
    id: "RE12",
    title: "Vergi, stopaj ve fatura uyumsuzlugu",
    threats: ["Matrah oyunu; KDV iade riski; YMM raporu olmadan kesilen fatura.", "KKA rayic matrahinin eksik beyani."],
    legalAnchors: ["VUK", "KDV mevzuati"],
    controls: ["InvoiceComposer + Teknokent / fatura politikasi; KKA icin ayri gelir kodu.", "YMM onayi olmadan uretim faturasi kesilmez (UI uyari mevcut)."],
    evidenceArtifacts: ["fatura JSON log", "matrah kaynak fees.ts"],
  },
  {
    id: "RE13",
    title: "Lansman on-satisi, teknik sartname ile ilan uyumu ve platform baypasi",
    threats: [
      "Ilan metninde vaat edilen teslimat, brut-net veya kat irtifaki ile teknik sartname / proje dosyasi arasinda celiski; alici sonradan ayip veya iptal davasi acar.",
      "Muteahhit veya alici, WhatsApp veya sahsi IBAN ile kapora talep ederek Ihaleal KYC, teminat ve komisyon zincirini baypas eder.",
      "Lansmana ozel fiyat veya indirim sozunun sozlesmeye ve imzali ek protokole yansimamasi.",
    ],
    legalAnchors: ["TBK (ayip, iyiniyet, ifa)", "6502 mesafeli satis ve GM istisna sinirlari (avukat netligi)", "5549 MKKK (supheli odeme kanali)"],
    controls: [
      "Teknik sartname + imar + ruhsat + ornek plan: zorunlu yukleme, versiyon hash; ilan snapshot ile eslestirme (hedef).",
      "Rezervasyon ve kapora yalniz blokeli PSP veya emanet; sahsi hesap yasagi + mesaj NLP sinyali ile admin kuyrugu (ComplianceNlpService).",
      "Sozlesmesel bypass cezai sarti ve delil paketi (teklif / rezervasyon RPC, KYC snapshot) — penaltyEngine + avukat metni.",
    ],
    evidenceArtifacts: ["sartname PDF hash", "ilan snapshot", "rezervasyon RPC", "KYC seviyesi", "moderasyon karar logu"],
  },
];

export function assertRealEstateAtlasComplete(): void {
  if (REAL_ESTATE_RISK_ATLAS.length < 13) throw new Error("REAL_ESTATE_RISK_ATLAS incomplete");
}
