/**
 * Lansman "Hemen Al" (satilik gayrimenkul) — bilgilendirme ve onay metinleri.
 * Baglayici hukuk metni degildir; avukat + odeme kurulusu + MASAK uyum programi ile netlestirilir.
 */

export const HEMEN_AL_GATE_TITLE = "Hemen Al — lansman on kosullari";

export const HEMEN_AL_GATE_INTRO = `Asagidaki maddeler, satilik gayrimenkul "Hemen Al" akisinda bilgilendirme ve riza kaydi icindir. Platform araci hizmet sunar; tapu ve satis sozlesmesi noter / taraflarca tamamlanir.`;

export const HEMEN_AL_MASAK_BLOCK = `5549 sayili Kanun (MKKK) kapsaminda kimlik dogrulama (KYC), kayit saklama ve supheli islem bildirimi (STR) prosedurleri uygulanir. Tutar ve islem profili risk esiklerini asarsa islem durdurulabilir veya ek belge istenebilir.`;

export const HEMEN_AL_CARD_BLOCK = `Tahsilatlar PCI-DSS uyumlu odeme kurulusu (PSP) uzerinden yapilir; kart verisi isletmeci sunucularinda saklanmaz. 3D Secure / guclu musteri dogrulamasi hedeflenir. Bloke (pre-auth) ve capture PSP sozlesmesine tabidir.`;

export const HEMEN_AL_DOCS_BLOCK = `Tapu ozu, kimlik, imar / bagimsiz bolum bilgisi, varsa ipotek ve satici beyanlari lansman paketinde tamamlanmadan odeme sonlandirilmamalidir. Liste: /evraklar`;

export const HEMEN_AL_CONTRACT_LINKS = [
  { href: "/ihale-kosullari", label: "Ihale kosullari ve AML ozeti" },
  { href: "/mesafeli-satis-sozlesmesi", label: "Mesafeli satis sozlesmesi (taslak)" },
  { href: "/yasal-master-brief", label: "Yasal master brief" },
  { href: "/evraklar", label: "Gerekli belgeler (MASAK / KYC)" },
] as const;