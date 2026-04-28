/**
 * İhale Al şirket vizyonu — ürün taslağı (hukuki onay ayrı).
 * Gelir: yalnızca başarılı işlem komisyonu. İlan vitrini, doping, öne çıkarma veya kullanıcıya satılan reklam slotu ücreti yok (hedef).
 */

import { FEES } from "@/lib/fees";

const sellerPct = `${(FEES.sellerCommissionRate * 100).toFixed(0)}`;

export const COMMISSION_ONLY_PRINCIPLES = [
  "İlan listeleme, vitrin, doping veya ‘öne çıkarma’ için kullanıcıdan ücret alınmaz (hedef).",
  "Kullanıcılara platform içi reklam alanı satılmaz (hedef). Şirketin kendi marka tanıtım bütçesi ayrı konudur.",
  "Gelir: satışta aracılık komisyonu; kirada yalnızca kiraya verenden bir aylık kira + KDV (hedef; sözleşmede netleşir). Opsiyonel değerleme başarı ücreti ayrı ek.",
  "Güven hattı (hedef): yapay zeka destekli fiyat ve bölge değerlendirmesi, değerleme raporu çizgisi, katılımcılarda Findeks, yetki ve evrak kontrolü, sözleşme paketi — kritik adımlarda insan onayı.",
  "Yapay zeka: arama, eşleştirme, fiyat bandı uyarıları, evrak checklist — hukuki son söz insanda.",
];

/** Üç kanal + platform aracılığı (satış ve kiralama için aynı çerçeve). */
export const THREE_MODES_AND_BROKERAGE_RULES = [
  "Mod 1 — Sadece ilan: Müşteri ilanı girer; satış veya kiralama kartında doğrudan kendi telefonu yok, vitrinde ihaleal.com (RE/MAX’ta ofis kartındaki danışman adı gibi) görünür; muhatap platformdur.",
  "Mod 2 — Teklif al: Kapalı teklif veya süreç içi teklif toplama; teklif verenlerin bilgileri ilanda yer almaz. Teklifler platform tarafından malike / kiraya verene iletilir; kabul sonrası sözleşme ve evrak ihaleal.com hattında (hedef).",
  "Mod 3 — İhale: Hem satış hem kiralık için açık artırma; yine kartta ve iletişimde yetkili ihaleal.com. Teklifler kayıt altında, taraflara kurallı şekilde iletilir (hedef).",
  "Bütün modlarda: sahte veya oyun amaçlı teklif, gerçeğe aykırı fiyat, keyfi ihaleye girme yasaktır; tespitte hesap kısıtı, teminat iradı ve sözleşmedeki cezai şartlar (avukat onaylı metin).",
  "Gerçek satıcı / kiraya veren ve gerçek alıcı / kiracı: tapu veya yetki ve Findeks çizgisi tamamlanmadan son adım açılmaz (hedef).",
  "İlan paketi (hedef): Endeksa veya eşdeğer piyasa raporu + SPK uzmanı ekspertiz (şerh / ipotek / haciz); imar ve belediye özeti ayrı buton; taahhüt alt–üst limit ve limite ulaşıldığında işlem yükümlülüğü sözleşmede; komisyon anlaşılan tutar üzerinden.",
];

/** Satıcı / kiraya veren — geleneksel emlakçı komisyonuna paralel hedef oran aralığı (sözleşmede netleşir) */
export const SELLER_SIDE_RATES = [
  { type: "Satış — ihale ile kapanış", target: `%${sellerPct} + KDV (platform, src/lib/fees.ts)`, note: "Tapu öncesi mahsup; avukat + sözleşme metni." },
  { type: "Satış — aracılıkla kapanış (ihale dışı)", target: `%1,25 – %${sellerPct} + KDV (fees.ts referans)`, note: "İhale kullanılmadıysa ayrı tarife; yine ilan ücreti yok (hedef)." },
  { type: "Kira — aracılık", target: "Yalnızca kiraya verenden 1 aylık kira + KDV (hedef)", note: "Kiracıdan ilan veya reklam ücreti yok (hedef). KDV istisnası muhasebe ile." },
];

/** Alıcı / kiracı */
export const BUYER_SIDE_RATES = [
  { type: "İhaleyi kazanan alıcı", target: "Hizmet / danışmanlık bedeli sözleşmede (ör. sabit ₺ veya %)", note: "TBK + tüketici şartları." },
  { type: "Kiracı", target: "Aracılık bedeli sözleşmede", note: "Kira sözleşmesi eki." },
];

export const AI_ASSISTANT_SCOPE = [
  "Şu an (demo): sabit metin + kural tabanlı yönlendirme. Üretimde: LLM + şirket içi ilan vekili (RAG) + KVKK log.",
  "“Şu özellikte arsa bul”: önce kendi veri tabanınızda vekili arama; harici siteleri izinsiz taramak hukuki değil → veri anlaşması veya kullanıcı yüklemeli rapor.",
  "“İhaleye girmem için ne lazım”: /evraklar + /yasal-cerceve özetini sohbet formatında sunmak (backend prompt).",
  "Tanıtım videoları: /reklam sayfasında oynatma; ileride kişiselleştirilmiş özet videolar (üretim pipeline).",
];

export const SMS_FLOWS = [
  "İhaleye çıkarma onayı: “İhale Al: X gayrimenkulünüz ihaleye alınacak, onaylıyor musunuz? EVET/HAYIR” — OTP ile.",
  "Teklif sonuç: kazanan / kaybeden bilgilendirme.",
  "Kira / satış komisyon faturası hazır SMS.",
];

export const PAYMENT_INTEGRATION = [
  "Hedef: Sahibinden benzeri escrow / blokeli ödeme ortağı banka ile API (anlaşma sizde).",
  "Ön koşul: PCI-DSS kapsamı dışında kart tutmama; 3DS ile yönlendirme.",
  "Platform: komisyon mahsubu için ayrı muhasebe hesabı ve aylık mutabakat.",
];
