export type KkaContractSection = {
  id: string;
  title: string;
  body: string;
};

export function fillKkaContractPlaceholders(template: string, ctx: Record<string, string>): string {
  let out = template;
  for (const [k, v] of Object.entries(ctx)) {
    out = out.split(`{{${k}}}`).join(v);
  }
  return out;
}

const SHARED_HEADER = `TASLAK METIN — HUKUKI DANISMANLIK DEGILDIR
Versiyon: ihaleal KKA Stüdyosu 1.0
{{IL}} / {{ILCE}} — Ada {{ADA}} Parsel {{PARSEL}} — Arsa alani (giris): {{LAND_M2}} m2

Bu paket bilgilendirme ve sozlesme iskeleti hazirligi icindir. Baglayici imar, ruhsat ve tapu islemleri resmi kurum kayitlarina tabidir.
`;

export const KKA_STUDIO_CONTRACT_SECTIONS: KkaContractSection[] = [
  {
    id: "on-bilgilendirme",
    title: "1. On bilgilendirme ve feragat",
    body:
      SHARED_HEADER +
      `
Madde 1 — Amaç
Taraflar, kat karsiligi / arsa karsiligi is birligi cercevesinde on mutabakat ve finansal / teknik kabataslak olusturmak icin bu metni incelemektedir.

Madde 2 — Feragat
Kullanici, bu arayuzde yer alan emsal (KAKS), TAKS, kat adedi ve insaat hakkı tahminlerinin ({{EMSAL}}, {{TAKS}}, plan ust kat {{MAX_KAT}}) resmi imar durumu yerine gecmedigini; TKGM / belediye / ilgili idare kayitlarinin esas alinacagini kabul eder.

Madde 3 — Profesyonel destek
Imar ve ruhsat projeleri mimar ve harita muhendisi; sozlesme ve riskler icin avukat; vergi ve muhasebe icin YMM ile calisilmasi onerilir.
`,
  },
  {
    id: "imar-epikri",
    title: "2. Imar ve teknik epikri (ozet)",
    body: `
Madde 4 — Parsel tanimi
Yer: {{IL}} ili, {{ILCE}} ilcesi, {{KOY}} koyu (varsa), {{MAHALLE}} mahallesi, Ada {{ADA}}, Parsel {{PARSEL}}.

Madde 5 — Parametreler (demo / kullanici girdisi)
- Emsal (KAKS) referansi: {{EMSAL}}
- TAKS referansi: {{TAKS}}
- Plan ile sinirli ust kat: {{MAX_KAT}}
- Emsal/Taks bileşiminden gelen teorik kat: {{KAT_TEORIK}}; uygulanan ust sinir: {{KAT_UYGULANAN}}
- Yaklasik brut insaat hakki ust siniri: {{INSAAT_BRUT}} m2 (arsa x emsal kabullu basitlestirme)

Madde 6 — Sinirlar
Bodrum, siginak, merdiven ve ortak alan ayrimi ile net satilabilir alan ayrı hesaplanir. Cephe geri cekme ve komşu haklari ayrica projelendirilir.
`,
  },
  {
    id: "paylasim",
    title: "3. Kat karsiligi paylasim kabulleri (ornek)",
    body: `
Madde 7 — Satilabilir insaat payi
Taraflar, toplam satilabilir insaat alanina iliskin arsa sahibi payini %{{OWNER_PAY}} olarak kabataslak kabul ettiklerini beyan ederler (nihai oran noter sozlesmesi ile tespit edilir).

Madde 8 — Yaklasik metrekare dagilimi (brut kabullu)
- Arsa sahibi tahmini satilabilir brut: {{OWNER_M2}} m2
- Muteahhit tahmini satilabilir brut: {{DEV_M2}} m2
- Varsayilan net konut birimi ({{E_UNIT}} m2) ile arsa sahibi birim esdegeri: {{OWNER_UNITS}} adet (yaklasik)

Madde 9 — Fiyatlandirma
Birim satis fiyatlari piyasa rayici ve satis zamanina gore belirlenir; bu metin fiyat taahhudu icermez.
`,
  },
  {
    id: "muteahhit-yukumluluk",
    title: "4. Muteahhit yukumlulukleri (iskelet)",
    body: `
Madde 10 — Ruhsat ve insaat
Muteahhit, tum ruhsat ve insaat sureclerini mevzuata uygun yurutmeyi; arsa sahibini makul surelerde bilgilendirmeyi ustlenir.

Madde 11 — Finansman ve termin
Teminat ve odeme takvimi ayri ekte duzenlenir; cezai sartlar TBK ve BKIl cercevesinde sinirlandirilir. Kismi kabuller ve hakedis odeme sirasi icin asagidaki 10/A ve 4 bis bolumleri esas alinir.

Madde 12 — Kalite ve eksik is
Is programi, malzeme sinifi ve kabul komisyonu usulu sozlesmede tanimlanir.
`,
  },
  {
    id: "hakedis-rolling-detail",
    title: "4 bis. Kismi kabuller ve yuvarlanan hakedis detay",
    body: `
Asagidaki blok, Madde 11 ile birlikte okunur. Dilim sayisi: {{HAKEDIS_TRANCHE_COUNT}}.

{{HAKEDIS_ROLLING_BLOCK}}

Hukuki ilkeler ozet: {{HAKEDIS_LEGAL_NOTE}}
`,
  },
  {
    id: "arsa-sahibi",
    title: "5. Arsa sahibi yukumlulukleri (iskelet)",
    body: `
Madde 13 — Tasinmazin temizligi
Arsa sahibi, ipotek, haciz, dava ve imar barisi olmamasi icin gerekli beyan ve belgeleri temin eder.

Madde 14 — Devir ve isbirligi
Kat irtifaki / kat mulkiyeti asamasinda gerekli muvafakat ve imzalar zamaninda verilir.
`,
  },
  {
    id: "anlasmazlik",
    title: "6. Anlasmazlik ve yetkili merci",
    body: `
Madde 15 — Uzlasi
Taraflar once iyi niyetli muzakere yoluyla cozum arar.

Madde 16 — Yetkili mahkeme
Taraflarca serbestce belirlenecek yetkili mahkeme veya tahkim (ayri protokolle) duzenlenir; burada zorunlu yonlendirme yapilmaz.
`,
  },
  {
    id: "ekler",
    title: "7. Ekler listesi (kontrol)",
    body: `
- Imar durumu yazisi (belediye / sistem)
- Parsel bazinda TKGM guncel harita / geometri
- Ekspertiz ve rayic raporu
- Banka / finansman on bilgilendirmesi (varsa)
- Kentsel donusum / plan notu varsa ilgili karar ozeti

Eslestirme anahtari (demo): {{MATCH_KEY}}
`,
  },
];
