/**
 * Bilgilendirme çerçevesi — hukuki danışmanlık değildir.
 * Kurumsal ihale şartnameleri ile kıyas için çalışma taslağıdır; yayın öncesi mutlaka avukat onayı.
 */

import { feeBadgeLabel } from "@/lib/fees";

export const LEGAL_DISCLAIMER =
  "Aşağıdaki maddeler genel mevzuat hatırlatması ve ürün gereksinim listesidir. Bağlayıcı sözleşme, şartname ve KVKK metinleri için baroya başvurulmalıdır.";

export const LEGAL_SECTIONS: {
  id: string;
  title: string;
  laws: { code: string; topic: string; note: string }[];
  bullets: string[];
}[] = [
  {
    id: "genel",
    title: "Genel çerçeve",
    laws: [
      { code: "6098 sayılı TBK", topic: "Borçlar hukuku — satım, cayma, temerrüt", note: "Platform kullanıcı sözleşmesi ile ilişkilendirilir." },
      { code: "2004 sayılı İİK", topic: "İcra ve iflas — haciz, teminat", note: "Teminat ve icra takibi maddeleri avukatça netleştirilmeli." },
      { code: "6698 sayılı KVKK", topic: "Kişisel veri", note: "Findeks, kimlik, biyometri süreçleri için açık rıza ve AİD metinleri." },
      { code: "5549 sayılı MKKK", topic: "AML / şüpheli işlem", note: "STR süreçleri ve kayıt saklama süreleri." },
      { code: "4721 sayılı Türk Medeni Kanunu", topic: "Tapu, mülkiyet", note: "Devir öncesi şerh ve ipotek kontrolü." },
    ],
    bullets: [
      "Her ihale türü için (konut, ticari, arsa) ayrı şartname PDF’i.",
      "Satıcı beyanı: mülkün hukuki durumu, kiracı, şerh, ihtar bilgisi.",
      "Alıcı beyanı: finansman kaynağı, yabancı uyruklu ise tapu uygunluk.",
      "Çocuk, vasi, ortaklık satışlarında ek noter belgeleri şablon listesi.",
    ],
  },
  {
    id: "alici",
    title: "Alıcı / teklif veren",
    laws: [
      { code: "TBK", topic: "Satım sözleşmesi, ayıp, teslim", note: "Kazanandan önce ön sözleşme + kapora şartları." },
      { code: "KVKK", topic: "Findeks ve finansal veri", note: "Açık rıza metni ve saklama süresi." },
    ],
    bullets: [
      "Kimlik ve ikamet; 18 yaş üstü.",
      "Findeks raporu (eşik değer avukat + risk ile belirlenir) — entegrasyon üretimde.",
      "SMS OTP + (hedef) e-Devlet ile güçlendirilmiş KYC.",
      "Teklif öncesi teminat / kapora mektubu veya blokeli ödeme akışı (banka anlaşması).",
      "Kara liste: sahte evrak, temerrüt, dolandırıcılık şüphesi — iç prosedür.",
    ],
  },
  {
    id: "satici",
    title: "Satıcı / ilan–ihale açan",
    laws: [
      { code: "TMK / Tapu Kanunu", topic: "Mülkiyet devri", note: "Yetki, vekalet, ortak satış kararları." },
      { code: "VUK / harçlar", topic: "Stopaj, KDV, tapu harcı", note: "Muhasebe danışmanlığı zorunlu." },
    ],
    bullets: [
      "Güncel tapu kaydı, imar durumu, iskan (kategoriye göre).",
      "SPK uyumlu ekspertiz raporu (platform anlaşmalı eksper listesi).",
      "Şirket satışında TTK gereği genel kurul / yetki belgeleri.",
      "Sanal emlakçı modelinde noter vekaletname + KEP — ayrı hukuki paket.",
    ],
  },
  {
    id: "ihale",
    title: "İhale işletimi (kurumsal ihale başlıkları)",
    laws: [
      { code: "Şartname + TBK", topic: "Teklif bağlayıcılığı, iptal", note: "Son teklif, uzatma, rezerv fiyat kuralları yazılı olmalı." },
    ],
    bullets: [
      "Katılım şartları, teminat iadesi, temerrüt, ikinci en yüksek teklif.",
      "Rezerv fiyat altında satış olmaması kuralı.",
      "Teklif süresi uzatımı (anti-sniping) algoritması şeffaf metin.",
      `Platform komisyonu: hedef ${feeBadgeLabel()} (fees.ts) — taraf (alıcı/satıcı) paylaşımı sözleşmede net; şu anki site metni taslaktır.`,
      "Uyuşmazlık: İstanbul (veya seçilen) mahkemeleri ve arabuluculuk maddesi.",
    ],
  },
];
