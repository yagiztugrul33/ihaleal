export type YorumRole = "yatirimci" | "emlakci" | "muteahhit";

export type YorumReview = {
  name: string;
  company: string;
  city: string;
  date: string;
  stars: number;
  role: YorumRole;
  text: string;
};

export const YORUM_REVIEWS: YorumReview[] = [
  { name: "Ayşe Korkmaz", company: "Özel portföy", city: "İstanbul", date: "2026-04-12", stars: 5, role: "yatirimci", text: "AI değerleme aralığı ile gerçek teklifim arasında %3 fark vardı; şeffaflık güven verdi." },
  { name: "Mehmet Yıldırım", company: "Yıldırım İnşaat", city: "Ankara", date: "2026-04-08", stars: 5, role: "muteahhit", text: "Ruhsat bazlı stok yönetimi sayesinde lansman öncesi dağıtım karmaşası ortadan kalktı." },
  { name: "Zeynep Arslan", company: "Arslan Gayrimenkul", city: "İzmir", date: "2026-03-28", stars: 4, role: "emlakci", text: "Lead kuyruğu ve ihale zamanlayıcı tek panelde; mobilde de akıcı çalışıyor." },
  { name: "Can Demir", company: "Demir Holding", city: "Bursa", date: "2026-03-20", stars: 5, role: "yatirimci", text: "Afet risk sekmesi ve DASK karşılaştırması yatırım komitemize sunum için hazırdı." },
  { name: "Elif Şahin", company: "Şahin Ofis", city: "Antalya", date: "2026-03-15", stars: 4, role: "emlakci", text: "Kapalı teklif modu müşterilerimiz için gizlilik sağlıyor; KYC akışı net." },
  { name: "Burak Öztürk", company: "Öztürk GYO", city: "İstanbul", date: "2026-03-02", stars: 5, role: "yatirimci", text: "Portföy yönetimi modülünde sat-tut önerileri haftalık brief ile geliyor, pratik." },
  { name: "Selin Aydın", company: "Aydın Proje", city: "Kocaeli", date: "2026-02-22", stars: 5, role: "muteahhit", text: "Kat karşılığı arsa eşleştirmede fizibilite skoru komşu parsel analiziyle birlikte sunuldu." },
  { name: "Hakan Güler", company: "Güler Emlak", city: "Adana", date: "2026-02-18", stars: 4, role: "emlakci", text: "İlan detayındaki 12 sekme müşteri toplantısında çok işe yarıyor; yazdır/PDF çıktısıyla teklif öncesi hızlı özet paylaşabiliyoruz." },
  { name: "Deniz Koç", company: "Koç Yatırım", city: "İstanbul", date: "2026-02-10", stars: 5, role: "yatirimci", text: "GES analiz modülü ile geri ödeme süresi ve IRR projeksiyonu tek oturumda çıktı." },
  { name: "Murat Çelik", company: "Çelik Yapı", city: "Gaziantep", date: "2026-01-30", stars: 4, role: "muteahhit", text: "Tedarikçi listesi ve Gantt demo inşaat takvimimizi toplantıda göstermek için yeterliydi." },
  { name: "Gül Erdoğan", company: "Erdoğan Danışmanlık", city: "Eskişehir", date: "2026-01-22", stars: 5, role: "emlakci", text: "Sahte teklif rozeti ihale sırasında şüpheli davranışları erken işaretledi." },
  { name: "Emre Polat", company: "Polat Capital", city: "İstanbul", date: "2026-01-15", stars: 5, role: "yatirimci", text: "Yatırım önerisi modülü risk profilime göre 5 ilanı gerekçeli listeledi." },
  { name: "Fatma Işık", company: "Işık Turizm", city: "Muğla", date: "2025-12-28", stars: 4, role: "yatirimci", text: "Airbnb potansiyeli sezon dağılımı ile yıllık gelir tahmini net ve anlaşılır." },
  { name: "Kemal Usta", company: "Usta İnşaat", city: "Trabzon", date: "2025-12-20", stars: 5, role: "muteahhit", text: "Müteahhit panelinde proje ilerleme yüzdesi ve satış grafiği yatırımcı sunumuna hazır." },
  { name: "Pınar Ak", company: "Ak Gayrimenkul", city: "Mersin", date: "2025-12-12", stars: 4, role: "emlakci", text: "Cmd+K arama modüllere de gidiyor; eğitim süresini kısalttı." },
  { name: "Serkan Yavuz", company: "Yavuz Endüstri", city: "Kayseri", date: "2025-11-30", stars: 5, role: "muteahhit", text: "Fabrika ilanında üretim sekmesi makine parkuru ve ISO rozetleriyle eksiksiz." },
  { name: "Aslı Tekin", company: "Tekin Aile Fonu", city: "İstanbul", date: "2025-11-22", stars: 5, role: "yatirimci", text: "Renovasyon ROI hesabı 500K yatırım senaryosunu değer artışıyla birlikte verdi." },
  { name: "Oğuz Kaya", company: "Kaya Emlak", city: "Samsun", date: "2025-11-10", stars: 3, role: "emlakci", text: "Filtre sayısı fazla; ilk kullanımda sadeleştirilmiş görünüm seçeneği faydalı olur." },
  { name: "Merve Tunç", company: "Tunç Legal", city: "İstanbul", date: "2025-10-28", stars: 5, role: "yatirimci", text: "Hukuki sekmede şerh ve ipotek rozetleri müvekkil dosyası ön incelemesini hızlandırdı." },
  { name: "Volkan Er", company: "Er Otelcilik", city: "Antalya", date: "2025-10-15", stars: 5, role: "muteahhit", text: "Otel operasyon sekmesinde ADR ve RevPAR kartları yatırım komitesine doğrudan aktarıldı." },
  { name: "Cemre Bulut", company: "Bulut Tarım", city: "Konya", date: "2025-10-02", stars: 4, role: "yatirimci", text: "Tarla ilanında toprak pH ve sulama kaynağı tarım analiz sekmesinde derli toplu." },
  { name: "Alper Dinç", company: "Dinç Sigorta", city: "İzmir", date: "2025-09-20", stars: 4, role: "emlakci", text: "Sigorta pazaryeri mock teklifleri müşteriye karşılaştırmalı tablo olarak sunulabiliyor." },
  { name: "Hande Sarı", company: "Sarı Yatırım", city: "İstanbul", date: "2025-09-08", stars: 5, role: "yatirimci", text: "Takas modülünde denkleştirme hesaplayıcısı iki mülk arası farkı net gösterdi." },
  { name: "Tolga Ateş", company: "Ateş Enerji", city: "Denizli", date: "2025-08-25", stars: 5, role: "muteahhit", text: "GES üretim sekmesi 12 aylık üretim eğrisi ve PR göstergesiyle yatırımcıya ikna edici." },
  { name: "Nazlı Özkan", company: "Özkan Boutique", city: "İstanbul", date: "2025-08-12", stars: 4, role: "emlakci", text: "AVM mağaza sekmesinde vitrin uzunluğu ve trafik verisi kiracı görüşmelerinde kullanıldı." },
  { name: "Rıza Harman", company: "Harman Devren", city: "Ankara", date: "2025-07-30", stars: 5, role: "muteahhit", text: "İşletme devri sekmesi ciro ve marka değeri metriklerini ayrı ayrı gösteriyor, şeffaf." },
  { name: "İpek Yaman", company: "Yaman Aile", city: "İstanbul", date: "2025-07-18", stars: 5, role: "yatirimci", text: "Ekspertiz sekmesinde SPK raporu ve bağımsız ekspertiz talebi tek akışta." },
  { name: "Umut Karaca", company: "Karaca Emlak", city: "Balıkesir", date: "2025-07-05", stars: 4, role: "emlakci", text: "Piyasa raporları sayfası 84 mock PDF ile bölgesel sunumları destekliyor." },
];
