export type ContractTemplate = {
  slug: string;
  title: string;
  summary: string;
  parties: string[];
  clauses: { heading: string; body: string }[];
};

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    slug: "emlak-aracilik",
    title: "Emlak aracilik sozlesmesi",
    summary: "Ilan yayini, komisyon havuzu ve KVKK yukumlulukleri.",
    parties: ["IhaleAL", "Emlak danismani / ofis", "Mulk sahibi (bilgilendirme)"],
    clauses: [
      { heading: "Konu", body: "Platform uzerinden ilan yayini ve teklif sureclerinin yurutulmesi." },
      { heading: "Komisyon", body: "Rayic matrah uzerinden havuz dagilimi; noter kabulu ayrica belgelenir." },
      { heading: "Gizlilik", body: "Kisisel veriler KVKK ve platform politikalarina uygun islenir." },
    ],
  },
  {
    slug: "kat-karsiligi",
    title: "Kat karsiligi arsa sozlesmesi",
    summary: "Arsa payi, bagimsiz bolum adedi ve hakedis dilimleri.",
    parties: ["Arsa sahibi", "Muteahhit", "Platform (araci kayit)"],
    clauses: [
      { heading: "Arsa payi", body: "Tapu payi ve imar durumu eklerde listelenir." },
      { heading: "Hakedis", body: "Yuvarlanan blokaj ve kismi kabul kosullari noter onayli metinde tanimlanir." },
      { heading: "Sure", body: "Ruhsat ve iskan takvimi muteahhit yukumlulugudur." },
    ],
  },
  {
    slug: "ihale-katilim",
    title: "Ihale katilim sozlesmesi",
    summary: "Teklif baglayiciligi, teminat ve usul kurallari.",
    parties: ["Istekli", "Platform", "Satici / idare (demo)"],
    clauses: [
      { heading: "Teklif", body: "Teklif suresi icinde geri cekilemez; gec teklifler degerlendirilmez." },
      { heading: "Teminat", body: "Gecici ve kesin teminat mevzuata uygun sekilde yatirilir." },
      { heading: "Uyum", body: "MASAK ve KYC kontrolleri tamamlanmadan islem kapatilmaz." },
    ],
  },
  {
    slug: "kapali-teklif",
    title: "Kapali teklif gizlilik sozlesmesi",
    summary: "Tekliflerin acilma anina kadar gizliligi.",
    parties: ["Teklif veren", "Platform"],
    clauses: [
      { heading: "Gizlilik", body: "Teklif tutari ve kimlik bilgisi ucuncu kisilerle paylasilmaz." },
      { heading: "Acilim", body: "Belirlenen tarih ve saatte sistem veya komisyon acilimi yapilir." },
    ],
  },
  {
    slug: "gizlilik-ek",
    title: "Gizlilik ve veri isleme eki",
    summary: "KVKK aydinlatma ve veri saklama sureleri.",
    parties: ["Veri sorumlusu", "Veri isleyen (platform)"],
    clauses: [
      { heading: "Amac", body: "Hizmet sunumu, dolandiricilik onleme ve yasal yukumlulukler." },
      { heading: "Saklama", body: "Islem kayitlari mevzuattaki surelerle saklanir." },
    ],
  },
  {
    slug: "muteahhit-hakedis",
    title: "Muteahhit hakedis protokolu",
    summary: "Odeme emanet hesabi ve dilim onay akisi.",
    parties: ["Muteahhit", "Arsa sahibi", "Emanet bankasi (taslak)"],
    clauses: [
      { heading: "Emanet", body: "Ilk dilim odeme emanet hesabinda bloke edilir." },
      { heading: "Onay", body: "Kismi kabul raporu sonrasi onceki dilim serbest birakilir." },
    ],
  },
];

export function getContractBySlug(slug: string): ContractTemplate | undefined {
  return CONTRACT_TEMPLATES.find((c) => c.slug === slug);
}
