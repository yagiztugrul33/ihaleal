/**
 * Dolandiricilik, uc kagit ve dava risklerine karsi urun + hukuk cercevesi (TASLAK).
 * Baglayici gorus degildir; avukat ve uyum (MASAK, KVKK, odeme kurulusu) ile dosyaya uyarlanir.
 */

export const FRAUD_DEFENSE_PAGE_DISCLAIMER =
  "Bu modul bilgilendirme ve ic urun mimarisidir. Mahkeme, idare veya duzenleyici merci onunde tek basina savunma olusturmaz; imzali sozlesme, STR/KYC politikasi ve delil zinciri avukatca tamamlanmalidir.";

export type FraudLitigationPillar = {
  id: string;
  title: string;
  threats: string[];
  /** Ogretim amacli kanun basliklari — yorum hukuk danismanligina birakilir */
  legalAnchors: string[];
  /** Urun / teknik / operasyon onlemleri (hedef) */
  controls: string[];
  /** Davada veya denetimde dayanak olusturan kayit turleri */
  evidenceArtifacts: string[];
};

export const FRAUD_LITIGATION_PILLARS: FraudLitigationPillar[] = [
  {
    id: "P1",
    title: "Sahte ilan ve on odeme (advance-fee) dolandiriciligi",
    threats: [
      "Gercekte mulku olmayan veya yetkisiz kisinin ilan acmasi; kapora talebi ile kacma.",
      "Baskasina ait fotograf / tapu bilgisini calarak guven suistimali.",
    ],
    legalAnchors: ["TCK (sahtecilik / dolandiricilik unsurlari — somut olayda CMK usulu)", "TBK iyiniyet (md.2)"],
    controls: [
      "KYC seviyeleri: birey / tacir / emlakci ayri; yuksek riskli ilanlarda manuel onay kuyrugu.",
      "Tapu / yetki belgesi hash + insan moderasyonu; SPK uzmani raporu cizgisi (ilan turune gore).",
      "Kapora yalniz blokeli PSP veya emanet hesap; isletici serbest hesaba aktarim yok (hedef).",
    ],
    evidenceArtifacts: ["KYC snapshot", "ilan onay logu", "belge yukleme versiyonlari", "STR kaydi"],
  },
  {
    id: "P2",
    title: "Teklif oyunlari: self-dealing, shill, yikama",
    threats: [
      "Satici veya emlakcinin kontrol ettigi hesaplarla fiyat suni yukseltme.",
      "Teklif iptal dongusu ile piyasa manipulasyonu.",
    ],
    legalAnchors: ["Haksiz rekabet (TTK ilgili basliklar)", "TBK genel hukumler (ifa, iyiniyet, kusur)"],
    controls: [
      "Cihaz parmak izi, IP, odeme araci ve MERNIS korelasyonu; supheli graf analizi (hedef).",
      "Teklif atomik RPC + sunucu zamani; anti-sniping kurali (mevcut migration cizgisi).",
      "Teminat / bid bond ve kotuye kullanim politikasinin sozlesmede netligi.",
    ],
    evidenceArtifacts: ["teklif RPC cevabi", "idempotency key", "teminat durumu"],
  },
  {
    id: "P3",
    title: "Para birligi (commingling) ve odeme kurulusu riski",
    threats: [
      "Kullanici parasinin sirket cari hesabinda birikmesi; batikta ivtial talepleri.",
      "6493 kapsami disi faaliyet iddiasi ile idari durdurma.",
    ],
    legalAnchors: ["6493 ve ikincil duzenlemeler", "MKKK 5549 (supheli islem)"],
    controls: [
      "Blokeli hesap veya lisansli odeme kurulusu / banka ucgeni; cari hesapta biriktirmeme politikasi.",
      "Gunluk mutabakat ve reconciliation servisleri (kodda iskelet: TakasbankReconciliationService).",
    ],
    evidenceArtifacts: ["PSP dekont", "mutabakat batch", "kullanici ekstre exportu"],
  },
  {
    id: "P4",
    title: "MASAK / AML ve 'bilerek goz yumma' iddiasi",
    threats: [
      "Supheli tutar veya hizli cevrim kanali; STR gecikmesi.",
      "PEP / yaptirim listesi bos gecme.",
    ],
    legalAnchors: ["5549 MKKK", "MASAK genelgeleri (ic politika ile)"],
    controls: [
      "Tutar esikleri, ulke riski, islem hizi kurallari; manuel inceleme kuyrugu.",
      "Egitimli uyum gorevlisi; yasakli silent delete (finans tablolari soft-delete + audit).",
    ],
    evidenceArtifacts: ["STR formu", "KYC karar logu", "risk skoru"],
  },
  {
    id: "P5",
    title: "KVKK, acik riza ve veri minimizasyonu",
    threats: [
      "Asiri veri toplama; riza metninin hizmetle baglantisiz olmasi.",
      "Veri ihlali ve toplu dava riski.",
    ],
    legalAnchors: ["KVKK md.4, md.5, md.12", "Aydinlatma yukumlulugu"],
    controls: [
      "Amaç sinirlama, saklama suresi tablosu, silme / anonimlestirme proseduru.",
      "Acik riza JSON (IP, UA, timestamp) — rentalConstitution / checkbox cizgisi ile uyum.",
    ],
    evidenceArtifacts: ["riza kaydi", "silme talebi logu", "DPA vendor listesi"],
  },
  {
    id: "P6",
    title: "Tüketici ve mesafeli satis (6502)",
    threats: [
      "On bilgilendirme eksigi; cayma hakkina aykiri tasarim.",
      "Gayrimenkul istisna sinirlarinin yanlis pazarlanmasi.",
    ],
    legalAnchors: ["6502", "Mesafeli Sozlesmeler Yonetmeligi"],
    controls: [
      "Mesafeli / ihale kosullari sayfalari; fiyat ve komisyonun tek kaynak (fees.ts) ile tutarliligi.",
      "Gayrimenkul istisnasinin avukatca netlestirilmesi; urun dilinde 'tapu taahhudu yok' tutarliligi.",
    ],
    evidenceArtifacts: ["on bilgilendirme metni versiyonu", "siparis / teklif akis logu"],
  },
  {
    id: "P7",
    title: "Haksiz rekabet ve platformu kotuleme",
    threats: [
      "Rakip veya kullanici tarafindan 'guvenilmez platform' kampanyasi; asilsiz iddia.",
      "Ic veri sizintisi (insider).",
    ],
    legalAnchors: ["TTK haksiz rekabet", "HMK delil"],
    controls: [
      "SLA ve seffaflik raporu; duzeltme blogu (Changelog).",
      "Minimum ayricalikli erisim (RBAC), audit log admin islemleri.",
    ],
    evidenceArtifacts: ["SLA export", "admin audit append-only"],
  },
  {
    id: "P8",
    title: "Sureklilik: duzenleyici emir, dava tedbiri, BCP",
    threats: [
      "Hesap dondurma veya erisim engeli ile hizmetin durmasi; kullanici zarari iddiasi.",
      "Veri merkezi kesintisi.",
    ],
    legalAnchors: ["TBK ifa imkansizligi", "BCP / felaket kurtarma sozlesmeleri"],
    controls: [
      "Veri ihraci ve musteri bildirimi SLA (DisasterRecovery sayfasi ile uyumlu hedef).",
      "Cok bolge yedek, RPO/RTO tanimi; hukuk + IT ortak play book.",
    ],
    evidenceArtifacts: ["incident raporu", "musteri bildirim zaman damgasi"],
  },
  {
    id: "P9",
    title: "Delil ve zamanaşımı: elektronik kayit",
    threats: ["Karsi taraf loglari inkar; delil supheli sayilir.", "HMK 219+ elektronik delil duzeni"],
    legalAnchors: ["HMK elektronik delil", "elektronik imza kanunu (ilgili hükümler)"],
    controls: [
      "UTC zaman damgasi, hash zinciri veya dis zaman damgasi servisi (hedef).",
      "Kullanici sozlesmesinde elektronik kayitlarin delil sozlesmesi.",
    ],
    evidenceArtifacts: ["imzali log export", "hash manifest"],
  },
  {
    id: "P10",
    title: "Ic hukuk ve disiplin: platformun kapanmamasi",
    threats: [
      "Ic bilmeyerek ihlal; teknik borc nedeniyle guven kaybi.",
      "Hukuk / uyum ile urun arasinda kopukluk.",
    ],
    legalAnchors: ["Sirket ic compliance charter (taslak)"],
    controls: [
      "Yasal degisiklikte feature flag ve kill-switch; avukat onayi olmadan finansal metin deploy edilmez.",
      "Bu sayfa + master brief + agency_contract senkronu; PR checklist.",
    ],
    evidenceArtifacts: ["PR review kaydi", "compliance onay etiketi"],
  },
  {
    id: "P11",
    title: "Aradan cikma, lansman on-satisi ve teknik sozlesme uyumu (muteahhit / alici)",
    threats: [
      "Ihale / listeleme sonrasi WhatsApp veya sahsi hesapta kapora; platform ve KYC disi kapanis.",
      "Lansmana ozel konut satislari: sozlesmede yazmayan teslimat, brut-net, kat irtifaki, tapu senaryosu ile alici yaniltma.",
      "Muteahhit veya alicinin Ihaleal disi mutabakat ile komisyon ve teminat cizgisini baypas etmesi.",
      "Teknik sartname / proje dosyasi ile ilan metni arasinda celiski; revizyonun izlenmemesi.",
    ],
    legalAnchors: [
      "TBK (ayiptan dogan sorumluluk, ayip bildirimi, iyiniyet — somut olayda avukat yorumu)",
      "Mesafeli satis ve gayrimenkul istisna sinirlari (6502 + yonetmelik; avukat netligi)",
      "MKKK 5549 (odeme kanali ve supheli islem)",
    ],
    controls: [
      "Sozlesme ve ilan: tek kaynakli fiyat / komisyon (fees + commission engine); muteahhit modulunde MODULE4 taahhutleri.",
      "Teknik sartname + imar durumu + insaat ruhsati + ornek mesken plani: yukleme zorunlulugu ve versiyon hash; ilan metnine hash referansi.",
      "Lansman / on-satis: rezervasyon ve kapora yalniz blokeli odeme veya emanet; sahsi IBAN yasagi (operasyon politikasi + UI uyari).",
      "Bypass (penaltyEngine): sozlesmede cari cezai sart ve delil paketi (teklif RPC, KYC snapshot, mesaj metadata).",
      "Alim satim mesajlasmasinda dis iletisim / kapora yonlendirmesi icin ComplianceNlpService + moderasyon kuyrugu (hedef).",
    ],
    evidenceArtifacts: [
      "sartname PDF versiyonu ve hash",
      "ilan snapshot",
      "teklif / rezervasyon RPC logu",
      "KYC seviyesi",
      "STR veya manuel inceleme kaydi",
    ],
  },
];

/** INTEGRITY_RULES_SUMMARY ile birlestirilir — tekrar etmeyen ek satirlar */
export const FRAUD_DEFENSE_PRODUCT_RULES: string[] = [
  "Coklu hesap, self-dealing ve sahte musteri: cihaz / IP / odeme araci korelasyonu + manuel uyum incelemesi (hedef); suphede STR.",
  "Yargi veya idare talebinde: teklif RPC ciktisi, KYC snapshot hash, STR ve admin kararinin imzasiz degistirilemez logu (append-only audit).",
  "Kullanici parasi: blokeli PSP veya emanet; isletici serbest hesapta biriktirmeme — 6493 / MKKK riskine karsi mimari hedef.",
  "Hizmet durdurma / duzenleyici emir: veri ihraci ve bildirim SLA (Felaket Kurtarma ve operasyon play book).",
  "Sozlesmelerde delil sozlesmesi, yetkili mahkeme / tahkim ve elektronik islem kaydinin hukuki degeri (avukat metni).",
  "Yasal metin ve komisyon: yalnizca onayli PR ile canliya; finansal metin icin YMM + avukat cift kontrol (InvoiceComposer cizgisi).",
  "Muteahhit lansman satislari: ilan metni + teknik sartname + tapu/irtifak senaryosu uclemesi; revizyonlarin immutable versiyonu ve alici on bilgilendirme kaydi.",
  "Alici ve satici: platform disi mutabakat ve kapora yasagi; ihlalde sozlesmesel bypass cezasi ve uyum incelemesi (penaltyEngine + avukat metni).",
];

export function assertFraudDefensePillarsComplete(): void {
  if (FRAUD_LITIGATION_PILLARS.length < 11) throw new Error("FRAUD_LITIGATION_PILLARS incomplete");
  for (const p of FRAUD_LITIGATION_PILLARS) {
    if (!p.controls.length || !p.threats.length) throw new Error(`Pillar ${p.id} incomplete`);
  }
}
