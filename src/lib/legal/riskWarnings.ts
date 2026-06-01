/**
 * Riskli satış uyarı motoru — ilan/işlem adımında otomatik tetiklenen uyarılar.
 *
 * DOKTRİN: İşlemi ENGELLEMEZ; sadece bilgilendirir + belge checklist + hukuki çözücü
 * yönlendirme yapar. Tüm uyarılar "Avukat + noter şart" disclaimer ile sunulur.
 */

export type WarningSeverity = "info" | "uyari" | "kritik";

export interface RiskWarning {
  id: string;
  /** Kısa başlık */
  baslik: string;
  severity: WarningSeverity;
  /** 1-2 cümle açıklama */
  aciklama: string;
  /** Hukuki referans */
  mevzuat: string;
  /** Yapılacaklar checklist */
  checklist: string[];
  /** Çözücüye yönlendirme yapar mı, hangi senaryo */
  cozucuLink?: string;
  /** İlgili belge bağlantısı */
  belgeNotu?: string;
}

export interface ListingContext {
  /** Satıcı doğum yılı */
  sellerBirthYear?: number;
  /** Bugünün yılı (test için override) */
  todayYear?: number;
  /** Vesayet/kısıtlı durum işareti */
  isUnderGuardianship?: boolean;
  /** Mülk miras yoluyla mı geçmiş */
  isInherited?: boolean;
  /** Alıcı satıcı 1. derece akraba mı */
  isFirstDegreeFamilyTransfer?: boolean;
  /** İpotek/haciz/şerh var mı */
  hasMortgageOrLien?: boolean;
  /** İlanda belirtilen ek bayraklar */
  flags?: string[];
}

const TODAY = 2026; // statik — tarih bağımsızlığı (test deterministic)

/** Yaş bazlı fiil ehliyeti uyarısı (Tapu Sicili Tüzüğü md.19) */
function elderly(ctx: ListingContext): RiskWarning | null {
  const year = ctx.sellerBirthYear;
  const today = ctx.todayYear ?? TODAY;
  if (!year) return null;
  const age = today - year;
  if (age < 65) return null;
  const severity: WarningSeverity = age >= 80 ? "kritik" : "uyari";
  return {
    id: "elderly_capacity",
    baslik: `Satıcı yaşı ${age} — Fiil Ehliyeti Sağlık Kurulu Raporu önerilir`,
    severity,
    aciklama:
      "65 yaş üstü mülk sahibinin tapu devri öncesi 'fiil ehliyeti tam' raporu istenebilir (Tapu Sicili Tüzüğü md.19). Rapor genellikle ~24 saat geçerli sayılır; tapu randevusuna en yakın gün alın.",
    mevzuat: "Tapu Sicili Tüzüğü md. 19; TMK 4721 m. 13",
    checklist: [
      "Tam teşekküllü hastaneden sağlık kurulu raporu",
      "MHRS randevusu önceden (kuyruk haftaları sürebilir)",
      "Rapor tarihi tapu randevusuna yakın olsun (~24 saat)",
      "Aile hekimi sevki + nöroloji + psikiyatri muayenesi",
      "Geri dönüşü olmayan demans + Alzheimer durumunda vasi atama",
    ],
    belgeNotu: "Tıbbi rapor + tapu randevu eşleştirilmesi kritik.",
  };
}

/** Vesayet altındaki kişi */
function guardianship(ctx: ListingContext): RiskWarning | null {
  if (!ctx.isUnderGuardianship) return null;
  return {
    id: "guardianship_required",
    baslik: "Satıcı vesayet altında — Sulh Hukuk Mahkemesi izni zorunlu",
    severity: "kritik",
    aciklama:
      "Kısıtlı/vesayet altındaki kişinin gayrimenkulü vasi tarafından + Sulh Hukuk Mahkemesi izni ile satılır (TMK m. 462). İzin alınmadan yapılan satım KESİN HÜKÜMSÜZdür.",
    mevzuat: "TMK 4721 m. 462, 463, 467",
    checklist: [
      "Vesayet kararı (Sulh Hukuk Mahkemesi)",
      "Vasi olarak atanan kişinin atama kararı (güncel)",
      "Sulh Hukuk Mahkemesinden 'gayrimenkul satışı izin kararı' (ayrı dava)",
      "Vesayet makamının (vasi+denetim makamı) onayı",
      "Bedel kısıtlı adına banka emanet hesabına geçer",
    ],
    belgeNotu: "İzin kararı olmadan tapu işlemi reddedilir.",
  };
}

/** Miras mülkü */
function inherited(ctx: ListingContext): RiskWarning | null {
  if (!ctx.isInherited) return null;
  return {
    id: "inherited_property",
    baslik: "Miras yoluyla intikal — TÜM mirasçı onayı + intikal tamamlanmış mı?",
    severity: "uyari",
    aciklama:
      "Miras mülkü elbirliği mülkiyettedir (TMK 599); SATIŞ için TÜM mirasçıların noter onaylı muvafakatı + veraset/intikal vergisi ilişik kesme şart.",
    mevzuat: "TMK 4721 m. 599, 676; VİV 7338",
    checklist: [
      "Veraset ilamı (mirasçılık belgesi) — noter veya sulh hukuk",
      "Veraset İntikal Vergisi beyanı (4 ay içinde — yurt dışı 6 ay)",
      "Vergi Dairesinden ilişik kesme belgesi",
      "TÜM mirasçıların noter onaylı muvafakatname",
      "Tapuda intikal kaydı (miras → tek mirasçı veya paylı)",
      "Yokken hala 'eski' tapu kaydında ise ilk önce intikal işlemi",
    ],
    cozucuLink: "miras_paylasimi",
    belgeNotu: "Mirasçı sayısı belli ve ulaşılır olmalı; yurtdışındakine vekalet.",
  };
}

/** Aile içi devir — muvazaa riski */
function familyTransfer(ctx: ListingContext): RiskWarning | null {
  if (!ctx.isFirstDegreeFamilyTransfer) return null;
  return {
    id: "family_transfer_muvazaa",
    baslik: "1. derece akraba arası devir — muvazaa/saklı pay riski",
    severity: "uyari",
    aciklama:
      "1. derece akraba arası 'satım' gösterilen işlem ileride muvazaa veya saklı pay (tenkis) davası ile iptal edilebilir. BAĞIŞ olarak yapılırsa daha güvenli (noter + VİV).",
    mevzuat: "TBK 6098 m. 19; TMK 4721 m. 560-571",
    checklist: [
      "Avukat + mali müşavir görüşmesi (BAĞIŞ mi SATIM mi)",
      "BAĞIŞ tercih ediyorsa NOTERDE bağışlama sözleşmesi (TBK 288)",
      "Veraset ve İntikal Vergisi beyanı (1 ay içinde)",
      "Saklı paylı mirasçılarla noter muvafakatname (tenkis önler)",
      "Banka transferi ile resmi para akışı + dekont",
      "Tapu Müdürlüğünde resmi devir",
    ],
    cozucuLink: "para_ebeveyn_tapu_cocuk",
    belgeNotu: "Saklı paylı mirasçı sayısı kritik — tenkis riski.",
  };
}

/** İpotek/haciz/şerh */
function mortgageLien(ctx: ListingContext): RiskWarning | null {
  if (!ctx.hasMortgageOrLien) return null;
  return {
    id: "mortgage_lien_active",
    baslik: "Aktif ipotek/haciz/şerh — satış öncesi temizleme zorunlu",
    severity: "kritik",
    aciklama:
      "Tapuda kayıtlı ipotek/haciz/şerh, satış sonrası bile devam eder; iyiniyetli alıcı tapu iptal davası açabilir. TKGM sorgu + fek belgesi + ilişik kesme şart.",
    mevzuat: "TMK 4721 m. 880-902, 1024; İİK 2004",
    checklist: [
      "TKGM e-Devlet 'Tapu Bilgi Sorgu' — tüm takyitleri listele",
      "Banka ipoteği varsa banka teması + fek belgesi (bedel ödendikten sonra)",
      "İcra haciz varsa borç ödeme + icra dairesi kaldırma belgesi",
      "Vergi borcu varsa Vergi Dairesi ilişik kesme belgesi",
      "Şerhli ise (3. kişi alacak hakkı) noter onaylı feragatname",
      "İhale günü temiz tapu — yoksa alıcıya yük açıkça bildir",
    ],
    cozucuLink: "ipotekli_hacizli",
    belgeNotu: "Satıştan ÖNCE fek belgesi alınmalı; banka 1-2 hafta sürebilir.",
  };
}

const DETECTORS = [elderly, guardianship, inherited, familyTransfer, mortgageLien];

export function detectWarnings(ctx: ListingContext): RiskWarning[] {
  return DETECTORS.map((fn) => fn(ctx)).filter((w): w is RiskWarning => !!w);
}

export function severityColor(s: WarningSeverity): "blue" | "amber" | "rose" {
  return s === "info" ? "blue" : s === "uyari" ? "amber" : "rose";
}

export function severityLabel(s: WarningSeverity): string {
  return s === "info" ? "Bilgi" : s === "uyari" ? "Uyarı" : "Kritik";
}
