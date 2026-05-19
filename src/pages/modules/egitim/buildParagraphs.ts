export function buildLessonParagraphs(topic: string): string[] {
  const sections = [
    "Giriş ve kavramsal çerçeve",
    "Mevzuat ve sorumluluklar",
    "Saha gözlemi ve belgelendirme",
    "Aile ve kurum koordinasyonu",
    "Sigorta ve mali planlama",
    "Güçlendirme karar süreçleri",
    "Tahliye ve toplanma alanları",
    "İletişim ve kriz yönetimi",
    "Çocuklar ve kırılgan gruplar",
    "Kurumsal süreklilik",
    "Veri ve dijital yedekleme",
    "Gönüllü ağları",
    "Psikososyal destek",
    "Şehir planlama bağlantısı",
    "Ölçme ve değerlendirme",
    "Tatbikat tasarımı",
    "Uzun vadeli direnç",
    "Özet ve eylem planı",
  ];

  return sections.map(
    (section, index) =>
      `${topic} — ${section}: Türkiye'de deprem hazırlığı, yalnızca teknik bir mühendislik meselesi değildir; planlama, sigorta, hukuk ve toplumsal örgütlenmeyi birlikte ele alır. ` +
      `Bu bölümde ${index + 1}. adımda, yapısal dayanıklılık ile zemin davranışını, yönetmelik uyumunu ve saha gözlemlerini birlikte okumayı hedefliyoruz. ` +
      `Konut sahipleri için uygulanabilir kontrol listeleri; site yöneticileri ve işverenler için atanmış sorumluluklar; belediye ve kamu kurumları için koordinasyon hatları netleştirilir. ` +
      `Örnek senaryolar, gerçek olaylardan türetilmiş öğrenme noktalarını içerir; sayısal ifadeler ön bilgilendirme amaçlıdır ve resmi raporların yerine geçmez. ` +
      `Karar verirken lisanslı mühendis, eksper ve yetkili idare görüşü esastır; bu metin yatırım veya hukuki tavsiye değildir.`,
  );
}
