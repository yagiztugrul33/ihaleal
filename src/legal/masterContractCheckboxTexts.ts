/**
 * Onay modal metinleri (MASTER v2.3). Avukat onayi olmadan canliya alinmamali.
 */

export const MASTER_LEGAL_DISCLAIMER =
  "Asagidaki moduller taslaktir. 6563, TBK, KVKK, HMK ve ilgili mevzuat ile uyum icin avukat incelemesi zorunludur.";

/** Kiralik / devren ilan sahibi (birey) — satilik komisyon cümleleri bu modulde yok. */
export const MODULE1_INDIVIDUAL_OWNER_FRAME = `
MADDE 1 - HIZMET BEDELI (KIRALIK / DEVREN):
Ihaleal.com uzerinden baslattigim kiralik veya devren kiralama isleminin onaylanmasi halinde hizmet bedelinin 1 (Bir) Aylik Kira Bedeli + KDV (kampanya varsa ilan edilen politika) oldugunu bilir; bu matrah uzerinden odeme yukumlulugunu kabul ederim. Devren islemde devir / key bedeli ile kira ayridir; platform komisyonu yalnizca kira matrahina baglidir (agency_contract).

MADDE 2 - AI FIYAT VE BEYAN:
Sisteme girdigim kira / devir tutarlarinin AI ekspertiz ozetindeki sapma bandi icinde makul oldugunu beyan ederim; resmi degerleme ve sozlesme matrahi noter / taraflarca kesinlesir.

MADDE 3 - CAYMA VE ARADAN CIKMA (KIRALIK / DEVREN):
Ilani eslesme olmadan iptal edersem ilgili bedelin %10u; eslesme sonrasi haksiz vazgeciste 1 Aylik Kira bedeli esasinda cezai sart (avukat taslagina tabi) odenebilecegini kabul ederim. Iptal tarihinden itibaren 1 (Bir) yil icinde, getirilen kiraci veya devralan adayiyla platformu ekarte ederek harici sozlesme yaptigimin tespiti halinde, kacirilan komisyonun 10 (On) katina kadar talep edilebilecek yaptirimlara riza gosteririm.
`.trim();

export const MODULE2_AGENT_PARTNER = `
MADDE 1 - PARA AKISI VE NET-30 BLOKESI:
Ihaleal.com sagladigi hicbir eslesmede kiraci veya kiraci adayindan IBANima veya nakden komisyon tahsil etmeyecegimi kabul ederim. Tum tahsilatlar Ihaleal odeme gecidinden yapilir. Islem onayinda olusacak hak edisimin 30 Gun (Net-30) boyunca sistemde bloke edilecegini, yasal faturam / makbuzumu sisteme yuklemedigim surece bana EFT yapilmayacagini ve iceride daimi olarak 1 Asgari Kira tutarinda Surekli Teminat bulunduracagimi kabul ederim.

MADDE 2 - TEK YETKI VE MUSTERI CALMA CEZASI:
Sisteme ekledigim tum mulklerin Tek Yetkili Sozlesmeli oldugunu beyan ederim. Platformun buldugu musteriyi harici olarak (aradan cikararak) bagladigim tespit edilirse, sozlesmemin feshedilmesini, tum hak edislerime el konulmasini ve komisyon bedelinin 10 kati cezai sart odemeyi kabul ederim.
`.trim();

export const MODULE3_HEMEN_AL_ACCEPTANCE = `
DIKKAT: AGIR IHLAL VE SISTEMI KOTUYE KULLANIM CEZASI (SATILIK HEMEN AL)
Hemen Al islemiyle gayrimenkul teklif ekraninda 15 dakikaligina diger kullanicilara kapattiginizi bilirsiniz. Bu islemi baslatmak icin sistemde gosterilen toplam komisyon / provizyon tutari, PCI-DSS uyumlu odeme kurulusu uzerinden 3D Secure ile kredi kartinizdan bloke edilebilir (pre-authorization); kart bilgisi isletmeci sunucularinda tutulmaz.
5549 (MKKK) kapsaminda KYC ve supheli islem incelemesi yapilabilir; tutar ve profil risk esiklerini asarsa islem durdurulabilir veya ek belge istenebilir.
15 dakika icinde islemi usulune uygun tamamlarsaniz, bloke tutar hizmet bedeli / komisyon mahsubu icin capture edilir (fatura politikasi). Aksi halde blokenin kotuye kullanim politikasina gore iadesiz veya kismen tahsil kurali PSP sozlesmesinde duzenlenir (TBK ve BKIl cercevesinde cezai sart sinirlari). Okudum ve onayliyorum.
`.trim();

export const MODULE4_LAND_SHARE_CONTRACTOR_NDA = `
MADDE 1 - BIRLESTIRILMIS KOMISYON (%4) ODEME TAAHHUDU:
Kat karsiligi ihaleyi kazanmam ve Arsa Sahibi ile Noterde Kat Karsiligi Insaat Sozlesmesi akdetmem halinde, arsanin islem tarihindeki guncel rayic bedeli uzerinden kendi payima dusen %2 ve Arsa Sahibi adina ustendigim %2 olmak uzere TOPLAM %4 + KDV Proje Gelistirme ve Hizmet Bedelini odemeyi kabul ederim.

MADDE 2 - TICARI SIR (NDA):
Veri Odasina girerek elde ettigim Ada, Parsel ve Malik bilgilerinin Ticari Sir oldugunu kabul ederim. Bu bilgileri kullanarak platformu ekarte edip 1 yil icinde harici sozlesme yaparsam, rayic bedel uzerinden tanimlanan cezai sart hukumlerine riza gosteririm (oran avukat onayli sozlesmede netlestirilir).

MADDE 3 - SOZLESMEDEN DONME (CAYMA):
Risk raporlarini bilerek teklif verdigimi; onay sonrasi sigorta / noter gibi kusurumla donersem cezai sart ve provizyon politikalarina riza gosteririm.
`.trim();

export const MODULE5_LAND_OWNER = `
MADDE 1 - SIFIR KOMISYON RISK BEYANI:
Kat karsiligi islemde platform komisyonumun muteahhit tarafindan karsilandigini bilirim. Gizli haciz / ipotek / hissedar uyusmazligi sebebiyle iptal halinde tazmin yukumluluklerim sozlesmede duzenlenir.

MADDE 2 - CAYMA VE ARADAN CIKMA:
Haksiz cayma ve harici islem (aradan cikma) durumlarinda sozlesmede tanimlanan cezai sartlara riza gosteririm.
`.trim();