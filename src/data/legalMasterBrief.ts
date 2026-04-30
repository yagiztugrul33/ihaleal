/** Tapubid / ihaleal — hukuki master özet (bilgilendirme; avukat görüşü değildir). */

export const LEGAL_MASTER_PAGE_DISCLAIMER =
  "Bu sayfa ve depodaki hukuki dokümanlar çalışma taslağıdır; bağlayıcı hukuki danışmanlık, mahkeme veya düzenleyici görüş yerine geçmez. İmzalı sözleşme ve şartnameler için Türkiye Barosu’na bağlı avukat ile müzakere edilmelidir.";

export type LegalMasterSection = {
  id: string;
  title: string;
  body: string[];
  bullets?: string[];
};

/** Site özet içeriği — tam metin: `docs/hukuk/IHALEAL_TAM_HUKUK_VE_IS_PLANI.md` (birleşik); özet: `TAPUBID_IHALLEGAL_MASTER_PLAN.md`. */
export const LEGAL_MASTER_SECTIONS: LegalMasterSection[] = [
  {
    id: "1",
    title: "1. Hukuki çerçeve",
    body: [
      "Özel hukuka ilişkin online gayrimenkul satım süreci tek başına ‘otomatik yasa dışı’ değildir; rol tanımı (aracılık, yayın, teminat, ödeme havuzu), sıfat ve beyanlar risk oluşturur.",
      "Terim olarak kamu ihale mevzuatıyla karışmaması için ‘açık artırma / müzayede süreci’ dili; devlet ihalesi çağrışımı üretmemek üzerine kontrol edilir.",
    ],
    bullets: [
      "Başlıca referans başlıkları: TBK, TTK, 6563 ve mesafeli düzen, KVKK, MKKK/AML, ödeme çerçevesi (6493 ve ikincil düzenlemeler).",
      "Taşınmaz ticareti yetki belgesi ile şirket faaliyet konusunun uyumu somut olayda değerlendirilir.",
    ],
  },
  {
    id: "2",
    title: "2. Belgeler ve şirket yapısı",
    body: [
      "Şirket türü (çoğunlukla Limited veya AŞ), ticaret sicili faaliyet kodları ve yetki belgesi kapsamı birlikte bakılır.",
      "E-ticaret ön bilgilendirme, iletişim ve şikâyet kanalı yükümlülükleri gözden geçirilir.",
    ],
  },
  {
    id: "3",
    title: "3. Para akışı ve regülasyon",
    body: [
      "Teminat ve ödemelerin platform işleteninin serbest hesabında birikmesi düzenleyici ve ticari risk oluşturabilir; blokeli hesap veya ödeme kuruluşu/banka üçgeni sıklıkla değerlendirilir.",
      "Kart saklama yerine yönlendirme (ör. 3DS) ile PCI yükü daraltılır.",
    ],
  },
  {
    id: "4",
    title: "4. Platform hukuki yapısı",
    body: [
      "‘Sadece platformuz’ ifadesi tek başına koruma sağlamaz; sözleşme maddeleri, süreç tasarımı, şeffaf şartname ve log/disiplin politikası birlikte düşünülür.",
      "Tapu öncesi kesin sonuç taahhüdü verilmemesi ürün dilinde tutarlılık gerektirir.",
    ],
  },
  {
    id: "5",
    title: "5. Riskler ve sistem önlemleri",
    body: ["Başlıca riskler: dolandırıcılık, sahte ilan, satıcı/alıcı cayması, ödeme ve icra ihtilafı."],
    bullets: [
      "KYC/evrak, moderasyon kuyruğu, rezerv fiyat ve teminat kuralları, şüpheli işlem prosedürü.",
      "Kayıtlı denetim izi (audit) ve saklama süreleri.",
    ],
  },
  {
    id: "6",
    title: "6. Sözleşme paketi (taslak iskelet)",
    body: [
      "Tam hukuki ve iş planı çerçevesi: `docs/hukuk/IHALEAL_TAM_HUKUK_VE_IS_PLANI.md`. Sözleşme paketi: `docs/hukuk/EK_SOZLESME_TASLAK_PAKETI.md` (iskelet + genişletilmiş taslak paragraflar).",
      "İmzalı metin yalnızca avukat revizyonundan sonra yayınlanmalıdır.",
    ],
  },
  {
    id: "7",
    title: "7. Ürün iş modeli ile uyum",
    body: [
      "Komisyon ve ücret tek kaynak kod dosyasından okunur: `src/lib/fees.ts` (satıcı işlem komisyonu %4 + KDV hedefi; ortak B2B %2 + KDV; alıcı işlem komisyonu sıfır — kod gerçeği).",
      "Üyelik ve hizmet mahsup mantığı üretim faturası politikasıyla yazışmalıdır.",
    ],
  },
  {
    id: "8",
    title: "8. Teknik mimari ilkeler",
    body: [
      "Tekliflerin sunucu tarafında sıralı ve atomik işlenmesi; zaman kaynağı olarak sunucu saati; gerçek zamanlı güncelleme (Realtime/WebSocket).",
      "RLS ve audit tablosu ile kritik işlem kaydı.",
    ],
  },
  {
    id: "9",
    title: "9. Marka: Tapubid ve ihaleal.com",
    body: [
      "Tapubid: tapu ve müzayede çağrışımı; ihaleal.com: mevcut ürün kodu ve domain ile uyumlu.",
      "Tek ana marka stratejisi ve marka araştırması avukat ile yapılmalıdır.",
    ],
  },
  {
    id: "10",
    title: "10. Sonuç ve yol haritası",
    body: [
      "Ölçek için önce hukuki ve ödeme çerçevesinin kilitlenmesi; ardından MVP (sınırlı ilan, manuel onay, kontrollü şehir).",
      "En büyük üç risk alanı: ödeme/teminat düzeni, taşınmaz ticareti sıfatı, KVKK/tüketici şeffaflığı.",
    ],
  },
];
