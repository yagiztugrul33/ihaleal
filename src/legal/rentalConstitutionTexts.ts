/**
 * Checkbox / sozlesme metinleri ve entegrator promptu.
 * Avukat onayi olmadan yayinlanmamalidir.
 */

export const RENTAL_LEGAL_DISCLAIMER_TR =
  'Asagidaki metinler taslaktir; 6563, TBK, KVKK, HMK ve ilgili mevzuat avukat kontrolunden gecmelidir.';

export const AGENCY_CONTRACT_MD = `agency_contract.md

MADDE 1 - ARACI HIZMET SAGLAYICI BEYANI: Ihaleal.com, 6563 sayili Kanun kapsaminda yalnizca teknolojik altyapi sunan bir Araci Hizmet Saglayicidir. Platformda listelenen kiralik veya devren kiralik mulklerin kiralama/devir sozlesmesinin tarafi degildir. Mulkun fiziki kusuru, demirbas uyusmazligi, ruhsat problemi veya yasal eksikliklerinden dogacak her turlu hukuki, idari ve cezai sorumluluk dogrudan gayrimenkulu sisteme ekleyen Emlakciya aittir.

MADDE 2 - KIRALIK HIZMET BEDELI VE NET-30 BLOKESI: Isbu platformda kiralama komisyonu 1 (Bir) Tam Aylik Kira Bedeli + KDV olarak sabitlenmistir. Emlakci, islemi tek basina kapatmasi halinde bu bedelin %50sini almayi; baska bir Emlakcinin getirdigi kiraci ile kapanmasi halinde ise 1 Kira Bedelinin %25i platforma kesildikten sonra kalan tutarin iki Emlakci arasinda esit (%37.5) paylasilacagini kabul eder. Emlakci, hak edislerinin islem onayindan itibaren 30 (Otuz) gun sureyle Ihaleal.com havuzunda Net-30 Guvence Blokesinde tutulacagini ve olasi ihtilaflarda dondurulabilecegini kabul eder. Ayrica iceride daima 1 Asgari Kira Bedeli tutarinda Surekli Teminat bulundurmayi taahhut eder.

MADDE 3 - ARADAN CIKMA CEZASI: Emlakci, platformun eslestirdigi musteriyle harici (elden) sozlesme yaparsa, 1 (Bir) Aylik Kira bedelinin 10 (On) kati tutarinda cezai sarti odemeyi, bu bedelin icerideki blokeli bakiyelerinden tek tarafli mahsup edilmesini kayitsiz sartsiz kabul eder.`;

export const USER_PROVISION_CONTRACT_MD = `user_provision_contract.md

MADDE 1 - %1 E-PROVIZYON VE KOMISYON BEYANI: Kullanici (Kiraci), teklif verdigi veya ihalesine katildigi kiralik mulk icin 1 Aylik Kira Bedelinin %1i (Devren kiralik ise: 1 Aylik Kira + Devir Bedeli toplaminin %1i) tutarinda meblagin e-provizyon (bloke) olarak kredi kartindan cekilmesine acik riza gosterir. Ihalenin kazanilmasi/teklifin kabulu durumunda, Ihaleal.com sistemine 1 (Bir) Tam Aylik Kira Bedeli + KDV tutarinda hizmet komisyonu odemekle yukumludur.

MADDE 2 - CAYMA BEDELLERI (CEZAI SART): Kiraci, teklifinin onaylanmasi sonrasinda mulku kiralamaktan vazgecerse, %1lik provizyonun cayma akcesi olarak tahsil edilecegini ve ek olarak 1 (Bir) Tam Aylik Kira Bedeli tutarinda cezai sartin kredi kartindan/yasal yollarla cekilmesine itiraz etmeyecegini kabul eder. Mulk Sahibi/Emlakci ise mulku eslesme oncesi sistemden cekerse taban fiyatin %10u, eslesme sonrasi kiraya vermekten vazgecerse 1 (Bir) Tam Aylik Kira Bedeli tutarinda cezai sart odemeyi taahhut eder.

MADDE 3 - HUKUKI MUHATAPLIK: Kiralama ve devir islemlerinden dogacak hicbir fiziki, hukuki veya demirbas uyusmazliginda Ihaleal.com taraf degildir, tek muhatap mulk sahibi veya emlakcidir.`;

export const KVKK_MERNIS_CONSENT_MD = `kvkk_mernis_consent.md

Ihaleal.com uzerinden teklif verdigim veya ihaleye katildigim mulklerde, sistemin guvenligini korumak ve komisyon kacaklarini tespit etmek amaciyla; ilgili islemin iptal tarihinden itibaren 6 (Alti) ay boyunca, MERNIS veya e-Devlet entegrasyonlari araciligiyla ikametgah adresimin iptal edilen mulkun adresiyle eslesip eslesmediginin platform tarafindan periyodik olarak sorgulanmasina, islenmesine ve ihlal halinde aleyhime yasal islem baslatilmasina 6698 sayili KVKK kapsaminda hur irademle onay veriyorum.`;

export const AI_AND_TRANSFER_CONSENT_MD = `ai_and_transfer_consent.md

Sisteme girdigim taban kira bedelinin, Ihaleal AI Ekspertiz motorunun belirledigi rayic bedelin maksimum %10 tolerans sinirinda oldugunu kabul ediyorum. Sistem manipule edilirse ilanimin silinecegini anladim. Isbu ilan Devren Kiralik ise; mulk sahibinden hukuki devir/alt kiralama yetkisini yazili olarak aldigimi, yetki eksikliginden dogacak islemin iptalinde tarafima Gec Cayma Bedeli (1 Kira) yansitilacagini beyan ve taahhut ederim.`;

export const CURSOR_RENTAL_INTEGRATION_PROMPT = [
  '# Ihaleal — Kiralik ve devren kiralik (satis bu gorev disinda)',
  '',
  '## Ayrim',
  '- Satilik faturalandirmasi bu promptun disindadir. listing_kind: sale | rental | sublease ayri kolonlar.',
  '- Kiralik hizmet bedeli matrahi: tam 1 aylik kira (KDV matrahi) + KDV. Devir bedeli uzerinden platform komisyonu yok.',
  '',
  '## Kod',
  '- src/lib/rentalCommissionEngine.ts — splitRentalCommissionMatrah, kdvOnCommissionMatrah, eProvisyon1PercentTry',
  '- src/lib/masterFinancialEngine.ts — sadece kat karsiligi %2 havuzu (distributeLandEquityCommission)',
  '- src/legal/rentalConstitutionTexts.ts — checkbox metinleri',
  '',
  '## Senaryolar (matrah = 1 aylik kira)',
  '1. c2c: %100 Ihaleal',
  '2. single_realtor: %50 / %50',
  '3. dual_realtor: %25 + %37.5 + %37.5',
  '4. b2c_cross: %50 Ihaleal + %50 alici emlakcisi',
  '',
  '## Devren',
  '- E-provizyon: (kira+devir)*%1 — eProvisyon1PercentTry({ kind: devren, ... })',
  '',
  '## Yap',
  '1. Checkout akisinda rental/sublease dallanmasi; satis koduna merge etmeyin.',
  '2. Checkboxlari AGENCY_CONTRACT_MD vb. ile doldurun; onay JSON (IP, UA, timestamp).',
  '3. Net-30 payout is kurali.',
  '4. UI: kiralik karti satis komisyonundan ayri.',
  '',
  RENTAL_LEGAL_DISCLAIMER_TR,
].join(String.fromCharCode(10));