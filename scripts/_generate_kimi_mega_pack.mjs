/**
 * Tek seferlik: docs/kimi-mega-pack/ altına yapılandırılmış içerik üretir.
 * Çalıştır: node scripts/_generate_kimi_mega_pack.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "docs", "kimi-mega-pack");
fs.mkdirSync(outDir, { recursive: true });

const rnd = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pad = (n) => String(n).padStart(3, "0");
/** Takvim alanları için (YYYY-MM-DD) — ay/gün iki hane */
const pad2 = (n) => String(n).padStart(2, "0");

/** --- Görev 1: 24 ihale --- */
const types = [
  ...Array(8).fill("daire"),
  ...Array(5).fill("villa"),
  ...Array(3).fill("isyeri"),
  ...Array(3).fill("arsa"),
  ...Array(2).fill("yazlik"),
  ...Array(2).fill("dukkan"),
  "ofis_kat",
];
const cities = [
  ["İstanbul", "Kadıköy", "Moda"],
  ["İstanbul", "Beşiktaş", "Levent"],
  ["Ankara", "Çankaya", "Kızılay"],
  ["İzmir", "Konak", "Alsancak"],
  ["Bursa", "Osmangazi", "Çekirge"],
  ["İstanbul", "Sarıyer", "Maslak"],
  ["Antalya", "Muratpaşa", "Lara"],
  ["Muğla", "Bodrum", "Yalıkavak"],
  ["İzmir", "Çeşme", "Alaçatı"],
  ["Balıkesir", "Ayvalık", "Cunda"],
  ["İstanbul", "Beyoğlu", "Galata"],
  ["İstanbul", "Bahçelievler", "Şirinevler"],
  ["Muğla", "Marmaris", "Merkez"],
  ["Muğla", "Datça", "Merkez"],
  ["Çanakkale", "Merkez", "Köy"],
  ["Sakarya", "Adapazarı", "Merkez"],
  ["İzmir", "Çeşme", "Imarli"],
  ["Ankara", "Çankaya", "İşyeri"],
  ["İzmir", "Konak", "İşyeri"],
];
const auctions = [];
let ti = 0;
for (let i = 1; i <= 24; i++) {
  const t = types[i - 1];
  const [city, district, neighborhood] = cities[ti % cities.length];
  ti++;
  const size_m2 = t === "arsa" ? rnd(400, 5000) : t === "villa" ? rnd(180, 450) : t === "isyeri" ? rnd(80, 350) : rnd(55, 195);
  const rooms = t === "arsa" || t === "isyeri" ? "n/a" : String(rnd(1, 5)) + (t === "daire" ? "+1" : "");
  const start = rnd(800_000, 45_000_000);
  const reserve = Math.round(start * (0.85 + Math.random() * 0.1));
  const current = Math.round(start * (0.9 + Math.random() * 0.15));
  const est = Math.round(start * (1.05 + Math.random() * 0.2));
  const m = rnd(5, 8);
  const d = rnd(1, 5);
  const starts_at = `2026-${pad2(m)}-${pad2(d)}T10:00:00+03:00`;
  const ends_at = `2026-${pad2(m)}-${pad2(d + 3)}T18:00:00+03:00`;
  const status = ["live", "scheduled", "ended"][i % 3];
  const seller_type = ["yetkili_emlakçı", "sahibi", "banka"][i % 3];
  auctions.push({
    id: `demo-auct-${pad(i)}`,
    title: `${city} ${district} ${t === "daire" ? "Daire" : t === "villa" ? "Villa" : t === "isyeri" ? "İşyeri" : t === "arsa" ? "Arsa" : t === "yazlik" ? "Yazlık" : t === "dukkan" ? "Dükkan" : "Ofis Katı"} — ${neighborhood}`,
    category: t,
    city,
    district,
    neighborhood,
    size_m2,
    rooms,
    bath_count: t === "arsa" ? 0 : rnd(1, 4),
    floor: t === "arsa" ? 0 : rnd(0, 12),
    total_floors: t === "arsa" ? 0 : rnd(4, 25),
    year_built: t === "arsa" ? 0 : rnd(1998, 2024),
    heating: ["merkezi", "kombi", "yerden_isitma", "yok"][rnd(0, 3)],
    facade: ["kuzey", "guney", "bati", "dogu", "cadde"][rnd(0, 4)],
    parking: ["yok", "acik", "kapali", "2_arac"][rnd(0, 3)],
    elevator: t === "arsa" ? false : Math.random() > 0.3,
    starting_bid_try: start,
    current_bid_try: status === "scheduled" ? null : current,
    reserve_price_try: reserve,
    estimated_value_try: est,
    starts_at,
    ends_at,
    bid_count: status === "scheduled" ? 0 : rnd(3, 42),
    status,
    is_demo: true,
    description:
      "Konum ve metrekare bilgisi demo veridir. Tapu ve imar durumu uzman kontrolü gerektirir. Teklif vermeden önce yerinde inceleme önerilir.",
    features: [
      "Ulaşım hattına yakın",
      "Site içi güvenlik (varsa)",
      "Isı yalıtımı",
      "Deprem yönetmeliğine uygunluk (bilgi için uzman raporu)",
      "Kira potansiyeli (tahmine dayalı değil, bölge ortalaması)",
    ].slice(0, rnd(5, 8)),
    seller_type,
    documents: ["tapu_senedi_ozet", "imar_durumu", "kimlik_fotokopi"].slice(0, rnd(2, 3)),
  });
}
const j1 = JSON.stringify(auctions, null, 2);
fs.writeFileSync(path.join(outDir, "01-auctions.json"), j1, "utf8");

/** --- Görev 2: 50 satıcı — A_02 (iş modeli v2026: yıllık satıcı üyeliği + komisyon; ilan paketi yok) --- */
const firstNames = ["Ayşe", "Mehmet", "Zeynep", "Can", "Elif", "Burak", "Selin", "Emre", "Deniz", "Kerem", "Gizem", "Onur", "Pınar", "Tolga", "Seda", "Barış", "Ceren", "Hakan", "İpek", "Murat"];
const lastNames = ["Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Arslan", "Öztürk", "Aydın", "Doğan", "Kılıç", "Aslan", "Polat", "Erdoğan", "Koç", "Tekin"];
const banks = ["Halkbank", "Ziraat", "Vakıfbank", "İş Bankası", "Garanti"];
const sellers = [];
for (let i = 1; i <= 50; i++) {
  const isBank = i > 45;
  const isCorp = i > 35 && i <= 45;
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[i % lastNames.length];
  const city = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"][i % 5];
  const district = ["Merkez", "Nilüfer", "Kepez", "Bornova", "Kadıköy"][i % 5];
  const mid = String(100 + (i % 900)).padStart(3, "0");
  const phone = `+90 555 ${mid} 12 34`;
  const y = rnd(2024, 2026);
  const mo = rnd(1, 12);
  const day = rnd(1, 28);
  const membershipExpires = `${y + 1}-${pad2(mo)}-${pad2(day)}`;
  sellers.push({
    id: `demo-sell-${pad(i)}`,
    kimi_task: "A_02",
    business_model_version: "2026_membership_commission",
    /** Eski Standart/Vitrin/Doping/Pro paket modeli kullanılmaz */
    pricing_model: "annual_seller_membership_unlimited_listings",
    membership: {
      type: "seller_yearly",
      amount_try: 5000,
      period_days: 365,
      status: i % 7 === 0 ? "expiring_soon" : "active",
      expires_at_demo: `${membershipExpires}T23:59:59+03:00`,
    },
    commission_summary:
      "Komisyon hedefi: satıcıdan %2 + alıcıdan %2 (KDV matrahı ayrı hesaplanır). Üyelik bedeli komisyondan mahsup edilebilir.",
    full_name: isBank ? `${banks[i % 5]} Tasfiye Birimi` : isCorp ? `${fn} Gayrimenkul Ltd. Şti.` : `${fn} ${ln}`,
    city,
    district,
    phone,
    email: `demo.satici.${i}@ornek.local`,
    kyc_status: "verified",
    e_devlet_status_demo: i % 5 === 0 ? "verified" : "pending",
    flows: isCorp ? ["corporate_listing", "auction_host"] : ["individual_sale"],
    member_since: `${y}-${pad2(mo)}-${pad2(day)}`,
    total_sales: rnd(0, 15),
    total_bids_received: rnd(5, 120),
    rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
    bio: "Demo satıcı. Yıllık satıcı üyeliği (sınırsız ilan) + komisyon modeli; paket başına 99/299 TL vb. uygulanmaz.",
    is_demo: true,
    profile_color: ["#0A1F44", "#1E3A5F", "#2563EB", "#0F766E", "#92400E"][i % 5],
  });
}
fs.writeFileSync(path.join(outDir, "02-sellers.json"), JSON.stringify(sellers, null, 2), "utf8");

/** --- Görev 3: 80 alıcı — A_03 (iş modeli v2026: yıllık alıcı üyeliği teklif hakkı; arama ücretsiz vurgusu demo) --- */
const buyers = [];
for (let i = 1; i <= 80; i++) {
  const y = rnd(2024, 2026);
  const mo = rnd(1, 12);
  const day = rnd(1, 28);
  buyers.push({
    id: `demo-buy-${pad(i)}`,
    kimi_task: "A_03",
    business_model_version: "2026_membership_commission",
    pricing_model: "annual_buyer_membership_bid_eligibility",
    membership: {
      type: "buyer_yearly",
      amount_try: 1000,
      period_days: 365,
      status: i % 6 === 0 ? "none" : "active",
      /** Teklif verebilmek için aktif üyelik; arama/listeler ücretsiz (ürün politikası) */
      bid_requires_active_membership_demo: true,
    },
    full_name: `${firstNames[(i * 3) % firstNames.length]} ${lastNames[(i * 7) % lastNames.length]}`,
    city: ["İstanbul", "Ankara", "İzmir", "Adana", "Trabzon"][i % 5],
    district: ["Merkez", "Seyhan", "Ortahisar", "Çankaya", "Konak"][i % 5],
    phone: `+90 532 ${pad(i)} 45 67`,
    email: `demo.alici.${i}@ornek.local`,
    findeks_score: rnd(600, 900),
    flows: i % 3 === 0 ? ["auction_bidder"] : ["browser_only"],
    is_demo: true,
    member_since: `${y}-${pad2(mo)}-${pad2(day)}`,
    saved_searches: rnd(0, 8),
    bids_placed: rnd(0, 24),
    preferred_city: ["İstanbul", "Ankara", "İzmir"][i % 3],
    alerts_email: i % 2 === 0,
    notes_demo:
      "Eski ilan paketi (Standart/Vitrin/Doping/Pro) alıcı tarafında yok; alıcı yıllık üyelik teklif yetkisi için.",
  });
}
fs.writeFileSync(path.join(outDir, "03-buyers.json"), JSON.stringify(buyers, null, 2), "utf8");

/** --- Görev 4: 40 SSS --- */
const cats = [
  ["A) Hesap & KYC", [
    ["Hesap açmak için neler gerekir?", "E-posta ve telefon doğrulaması ile başlarsınız. İhaleye katılmadan önce KYC adımlarında kimlik ve adres bilgisi paylaşımı istenir. Üç ila beş cümlelik açıklama: bilgiler yalnızca yasal zorunluluklar çerçevesinde işlenir. Demo ortamda gerçek belge yüklemeniz gerekmez. Üretim öncesi metin hukuk danışmanıyla netleştirilmelidir."],
    ["KYC ne kadar sürer?", "Başvuru yoğunluğuna göre değişir. Belgeler eksiksiz geldiğinde inceleme süresi kısalır. Red durumunda gerekçe bildirilir ve yeniden yükleme yapılabilir. Platform yalnızca süreç akışını gösterir; resmi onay kurum politikalarına bağlıdır."],
    ["KYC reddedilirse ne olur?", "İhaleye katılım ve ilan yayını kısıtlanabilir. Gerekçeye göre belge güncellenir. Destek kanalından yeniden inceleme talep edilebilir. Demo veride reddetme senaryosu yalnızca eğitim amaçlıdır."],
    ["e-Devlet ile doğrulama zorunlu mu?", "Ürün politikasına göre bazı akışlarda yetkili işlem için e-Devlet onayı hedeflenir. Canlı entegrasyon olmadan bu adım mock olarak gösterilebilir. Kullanıcıya her zaman hangi adımın demo olduğu belirtilmelidir."],
    ["Hesabımı nasıl dondururum?", "Profil ayarlarından talep oluşturma akışı planlanabilir. Dondurma süresince teklif ve ilan işlemleri kapanır. Veri saklama süreleri aydınlatma metninde yazılmalıdır. Şu an metin taslaktır."],
    ["İki ayrı rol (alıcı/satıcı) aynı hesapta olur mu?", "Tek hesap altında farklı izinler tanımlanabilir. Hangi işlemlerin hangi rolle yapılabileceği arayüzde net gösterilmelidir. Yasal açıdan ayrıştırma gerekiyorsa avukat görüşü alınmalıdır."],
    ["Telefon numaramı değiştirebilir miyim?", "Evet; yeni numara doğrulaması sonrası güncelleme yapılır. Eski oturumlar güvenlik için sonlandırılabilir. OTP maliyeti ve SMS sağlayıcısı üretim kararıdır."],
    ["Şirket hesabı ile bireysel hesap farkı nedir?", "Şirket hesabında unvan ve yetkili temsilci bilgileri istenir. Fatura ve sözleşme akışı buna göre şekillenir. Demo veride şirket alanları örnek doldurulur."],
  ]],
  ["B) İhale Sistemi", [
    ["Teklifim geçilirse haber alır mıyım?", "Evet; bildirim kanalları açıksa anlık veya özet uyarı gönderilir. E-posta ve uygulama içi mesaj tercihleri profilden yönetilir. Demo ortamda bildirimler sahte veriyle gösterilebilir."],
    ["Minimum artış tutarı sabit mi?", "İlan bazında kural tanımlanabilir. Örnek senaryoda sabit artış gösterilebilir; ürün kararına göre yüzdeye çevrilebilir. Kullanıcıya teklif ekranında net rakam gösterilmelidir."],
    ["İhale süresi uzatılır mı?", "Son saniye tekliflerinde uzatma kuralı ürün tasarımına bağlıdır. Anti-sniping açıklaması kullanıcıya sade dille anlatılmalıdır. Yasal metinlerde otomatik uzatmanın koşulları yazılmalıdır."],
    ["Yedek teklif verebilir miyim?", "Otomatik teklif özelliği varsa limit ve adım parametreleri kullanıcıdan alınır. Yoksa yalnızca manuel teklif vardır. Demo ekranları hangi modun aktif olduğunu belirtmelidir."],
    ["İhale iptal olursa teminat ne olur?", "İptal nedeni iade veya mahsup kurallarını belirler. Şartlar ön bilgilendirme ve sözleşmede listelenmelidir. Bu metin taslak olup avukat onayı gerektirir."],
    ["Kazanan teklif hangi koşulla kesinleşir?", "Ödeme ve sözleşme adımları tamamlanınca kesinleşme tanımı yapılır. Süreç adımları şeffaf zaman çizelgesiyle gösterilmelidir. Demo akışta süreler kısaltılmış olabilir."],
    ["İlan gizlilik seçeneği var mı?", "Adres maskeleme veya sadece semt gösterme seçenekleri değerlendirilebilir. KVKK açısından gereksiz veri toplanmamalıdır. Ürün kararı ve hukuk görüşü gerekir."],
    ["Teklif geçmişini kim görür?", "Satıcı ve platform yetkilileri denetim için görebilir. Diğer alıcılar yalnızca anonimleştirilmiş özet görür. Politika metninde açıkça yazılmalıdır."],
  ]],
  ["C) Ödeme & Teminat & Komisyon", [
    ["Teminat iade şartları nelerdir?", "İhale sonucuna ve şartnameye göre iade veya mahsup yapılır. Kaybeden ve kazanan için farklı süreler tanımlanabilir. Bu cevap genel bilgilendirme içindir; bağlayıcı metin sözleşmededir."],
    ["Komisyon oranı nereden hesaplanır?", "Komisyon oranları ürün konfigürasyonunda tutulur ve örnek hesap ekranında gösterilir. Tapu harcı ve diğer giderler ayrı satırda listelenmelidir. Oranlar hukuk ve muhasebe onayından geçmelidir."],
    ["KDV komisyona uygulanır mı?", "Hizmet komisyonu için KDV durumu muhasebe politikasına göre belirlenir. Kullanıcıya fatura satırlarıyla açıklanmalıdır. Bu metin taslaktır."],
    ["Ödeme yöntemleri hangileri?", "Kredi kartı, havale veya escrow modeli ürün kararıdır. Her yöntemin risk ve süre tablosu SSS’te kısa tutulmalıdır. Canlı ödeme entegrasyonu yoksa demo etiketi şarttır."],
    ["Tapu harcı kimden kesilir?", "Genel uygulamada alıcı ve satıcı payları ayrı gösterilir. Kesin dağılım tapu işlemi sırasında resmi mercilerce doğrulanır. Platform yalnızca örnek hesap sunabilir."],
    ["Gecikme faizi uygulanır mı?", "Sözleşmede tanımlıysa uygulanır. Aksi halde yasal temerrüt kuralları geçerli olabilir. Avukat onaylı şartname gerekir."],
    ["İade süresi kaç gün?", "Ödeme sağlayıcı ve banka politikasına bağlıdır. Platform SLA’sı ayrıca duyurulmalıdır. Demo veride sabit gün sayısı göstermeyin; gerçek rakam yoksa belirtin."],
    ["Komisyon iadesi olur mu?", "İptal veya hatalı işlem senaryolarında iade politikası tanımlanmalıdır. İş kuralları ürün ve hukuk ekipleriyle yazılmalıdır."],
  ]],
  ["D) Hukuki Çerçeve", [
    ["Bu site hukuki tavsiye verir mi?", "Hayır; genel bilgilendirme sunar. Bağlayıcı işlemler için uzman görüşü alınmalıdır. Metinler taslak niteliğindedir."],
    ["Ön bilgilendirme formu zorunlu mu?", "Mesafeli satış ve tüketici hukuku kapsamında gereklilikler değerlendirilmelidir. Avukat kontrolü olmadan yayınlanmamalıdır."],
    ["Kişisel veriler nerede saklanır?", "Sunucu bölgesi ve süreler aydınlatma metninde yazılmalıdır. Silme ve düzeltme talepleri için kanal tanımlanmalıdır."],
    ["Uyuşmazlıkta yetkili mahkeme neresidir?", "Sözleşmede kararlılıkla gösterilir. Tüketici işlemlerinde kanuni düzenlemeler önceliklidir. Taslak metin örneği avukattan gelmelidir."],
    ["Reklam iddialarında nelere dikkat edilmeli?", "Doğrulanamayan üstün lütuf veya sertifika iddiası kullanılmamalıdır. Rakamlar kaynak gösterilmeden yazılmamalıdır."],
    ["Çerezler hangi amaçla kullanılır?", "Oturum, güvenlik ve istatistik amaçları ayrı ayrı listelenmelidir. Reddetme seçenekleri politika ile uyumlu olmalıdır."],
    ["Üçüncü taraf entegrasyonları kim sorumlu?", "Veri işleyen sıfatıyla aydınlatmada listelenmelidir. Veri aktarım sözleşmeleri imzalanmalıdır."],
    ["Şikayet kanalı nasıl işler?", "Kayıt numarası ve SLA hedefi duyurulur. KVKK başvurusu için ayrı adres verilir."],
  ]],
  ["E) Satıcı / Alıcı Süreçleri", [
    ["İlan önizlemesi nasıl çalışır?", "Yayın öncesi satıcı özet ve fotoğraf sırasını kontrol eder. Yayın sonrası düzenleme kuralları net olmalıdır."],
    ["Alıcı yerinde görebilir mi?", "Randevu ve güvenlik kuralları satıcı onayına bağlanabilir. Sağlık ve güvenlik için kimlik doğrulama istenebilir."],
    ["Teklif öncesi Findeks şartı neden var?", "Risk azaltmak için ürün politikasına bağlıdır. Eşik değeri şeffaf yazılmalıdır. Demo ortamda sabit eşik gösterilebilir."],
    ["Satıcı belgeleri hangi formatta yüklenir?", "PDF ve görüntü formatları yaygındır. Boyut limiti ve virüs taraması teknik gereklilik olarak planlanmalıdır."],
    ["Alıcı vazgeçerse ne olur?", "Teklif iptali kuralları ihalenin aşamasına göre değişir. Teminat etkisi şartnamede anlatılmalıdır."],
    ["Satıcı fiyat güncelleyebilir mi?", "İhale başlamadan önce belirli alanlarda güncelleme mümkün olabilir. Başladıktan sonra kilit politikası uygulanmalıdır."],
    ["Kazanan alıcı tapu randevusunu nasıl alır?", "Takvim entegrasyonu veya manuel koordinasyon ürün kararıdır. Adım adım rehber kullanıcıya gösterilmelidir."],
    ["Satıcı performans puanı nasıl hesaplanır?", "Teslimat süresi, şikayet oranı ve doğrulanabilir metrikler ağırlıklandırılabilir. Algoritma şeffaflığı gerekirse özet açıklama sunulur."],
  ]],
];
let faqMd = "# SSS — 40 soru (taslak)\n\n";
for (const [title, qs] of cats) {
  faqMd += `## ${title}\n\n`;
  for (const [q, a] of qs) {
    faqMd += `### ${q}\n\n${a}\n\n`;
  }
}
fs.writeFileSync(path.join(outDir, "04-faq.md"), faqMd, "utf8");

/** --- Görev 8: 30 push --- */
const pushCats = ["A) İhale başladı", "B) İhale bitiyor", "C) Teklifin geçildi", "D) Yeni ilan", "E) Kazandın", "F) Sistem"];
const pushes = [];
let pi = 0;
for (const cat of pushCats) {
  for (let k = 0; k < 5; k++) {
    pi++;
    const title = cat.includes("A)") ? `İhale #${pi} başladı` : cat.includes("B)") ? `1 saat kaldı: #${pi}` : cat.includes("C)") ? `Teklifin geçildi` : cat.includes("D)") ? `Yeni ilan: ${k + 1}` : cat.includes("E)") ? `Kazandın` : `Hesap güncellendi`;
    const body =
      cat.includes("A)")
        ? `Canlı ihale; teklif vermek için aç.`
        : cat.includes("B)")
          ? `Bitiş yaklaşıyor; maksimumunu gözden geçir.`
          : cat.includes("C)")
            ? `Daha yüksek teklif var; karar ver.`
            : `Favori kategorinde yeni kayıt.`;
    pushes.push({ id: `push-${pad(pi)}`, category: cat, title: title.slice(0, 40), body: body.slice(0, 100) });
  }
}
fs.writeFileSync(path.join(outDir, "08-push-notifications.json"), JSON.stringify(pushes, null, 2), "utf8");

/** --- Görev 9: 40 tooltip --- */
const tt = [];
const dash = ["İstatistik kartı", "Son aktiviteler", "Bildirim zili", "Profil menüsü", "Hızlı arama"];
const ilan = ["Başlık alanı", "Fiyat girişi", "Tarih seçici", "Konum haritası", "Fotoğraf yükleme"];
const det = ["Teklif kutusu", "Geçmiş teklifler", "Kalan süre", "Satıcı notu", "Şikayet bağlantısı"];
const prof = ["Şifre değiştir", "İki adımlı doğrulama", "Bildirim tercihleri", "Hesap silme", "Veri dışa aktarma"];
for (let i = 0; i < 10; i++) {
  tt.push({ element: `Dashboard: ${dash[i % 5]}`, text: "Kısa bilgi: demo veri gösterebilir; üretimde içerik farklı olur.".slice(0, 80) });
}
for (let i = 0; i < 10; i++) {
  tt.push({ element: `İlan: ${ilan[i % 5]}`, text: "Zorunlu alanları doldur; eksikte yayın engellenir.".slice(0, 80) });
}
for (let i = 0; i < 10; i++) {
  tt.push({ element: `İhale detay: ${det[i % 5]}`, text: "Kuralları oku; teklif geri alma politikasına dikkat et.".slice(0, 80) });
}
for (let i = 0; i < 10; i++) {
  tt.push({ element: `Profil: ${prof[i % 5]}`, text: "Güvenlik için düzenli güncelle; OTP gerekebilir.".slice(0, 80) });
}
fs.writeFileSync(path.join(outDir, "09-tooltips.json"), JSON.stringify(tt, null, 2), "utf8");

/** --- Görev 10: 50 hata --- */
const errs = [];
const codes = (prefix, n) => Array.from({ length: n }, (_, i) => `${prefix}_${String(i + 1).padStart(3, "0")}`);
const authMsg = [
  "Oturum süresi doldu; yeniden giriş yapın.",
  "Şifre kuralına uymuyor; 8+ karakter ve rakam ekleyin.",
  "OTP yanlış; yeni kod isteyin.",
  "Hesap kilitli; 15 dk sonra deneyin.",
  "E-posta doğrulanmamış; gelen kutuyu kontrol edin.",
  "Telefon formatı hatalı; 10 haneli girin.",
  "Çok fazla deneme; şifre sıfırlama kullanın.",
  "İki adımlı kod eksik; uygulamadan kodu girin.",
  "Yetkisiz işlem; hesap türünüz uygun değil.",
  "Çıkış yapılmış; devam için giriş yapın.",
];
const formMsg = [
  "Zorunlu alan boş; kırmızı ile işaretli yeri doldurun.",
  "Tarih aralığı geçersiz; bitiş başlangıçtan sonra olmalı.",
  "Dosya boyutu sınırı aşıldı; 10 MB altı yükleyin.",
  "Dosya türü desteklenmiyor; PDF veya JPG seçin.",
  "Sayı formatı hatalı; nokta yerine virgül kullanmayın.",
  "Telefon TR formatında değil.",
  "E-posta biçimi geçersiz.",
  "URL http veya https ile başlamalı.",
  "En az bir fotoğraf ekleyin.",
  "Metin çok kısa; en az 40 karakter girin.",
];
const payMsg = [
  "Ödeme sağlayıcı yanıt vermedi; 2 dk sonra tekrar deneyin.",
  "Kart limiti yetersiz; başka kart deneyin.",
  "3D Secure tamamlanmadı; banka ekranını bitirin.",
  "İade tutarı sıfır; işlem oluşturulamadı.",
  "Para birimi uyumsuz; TL seçili olmalı.",
  "Fatura bilgisi eksik; vergi numarası girin.",
  "Ödeme iptal edildi; sepeti yeniden oluşturun.",
  "Çift ödeme engellendi; işlem zaten kayıtlı.",
  "Minimum tutarın altında; tutarı artırın.",
  "Havale dekontu okunamadı; net PDF yükleyin.",
];
const aucMsg = [
  "İhale aktif değil; teklif kabul edilmiyor.",
  "Teklif artış adımına uymuyor.",
  "Bitiş zamanı geçti; teklif kapalı.",
  "Kendi ilanınıza teklif veremezsiniz.",
  "Findeks eşiğinin altındasınız.",
  "Teminat bloke edilmedi; önce teminat tamamlayın.",
  "İdempotency anahtarı çakıştı; yeni anahtar üretin.",
  "Teklif tutarı boş.",
  "Teklif üst limiti aşıyor.",
  "İhale iptal edildi.",
];
const sysMsg = [
  "Bağlantı kesildi; sayfayı yenileyin.",
  "Sunucu yoğun; 1 dk sonra tekrar deneyin.",
  "Bakım penceresi; kısa süre sonra deneyin.",
  "İstek zaman aşımı; tekrar gönderin.",
  "Tarayıcı önbelleği sorunu; gizli sekmede deneyin.",
  "API anahtarı geçersiz; yapılandırmayı kontrol edin.",
  "Versiyon uyumsuz; uygulamayı güncelleyin.",
  "Konum izni reddedildi; ayarlardan açın.",
  "Depolama dolu; cihazda yer açın.",
  "Bilinmeyen hata; destek kaydı açın.",
];
const all = [...codes("AUTH", 10), ...codes("FORM", 10), ...codes("PAY", 10), ...codes("AUC", 10), ...codes("SYS", 10)];
const pools = [...authMsg, ...formMsg, ...payMsg, ...aucMsg, ...sysMsg];
all.forEach((c, i) => {
  errs.push({
    code: c,
    message: pools[i].slice(0, 100),
    fix: "Mesajdaki maddeyi düzeltin; devam etmezse destek ile paylaşın.",
  });
});
fs.writeFileSync(path.join(outDir, "10-errors.json"), JSON.stringify(errs, null, 2), "utf8");

/** --- Görev 11: 50 testimonial --- */
const roles = ["alıcı", "satıcı", "yatırımcı", "emlakçı"];
const testimonials = [];
for (let i = 1; i <= 50; i++) {
  testimonials.push({
    isim: `${firstNames[i % 20]} ${lastNames[i % 15]}`,
    sehir: ["İstanbul", "Ankara", "İzmir"][i % 3],
    rol: roles[i % 4],
    yorum:
      "Teklif geçmişini ve komisyon satırlarını ekranda gördüm; rakam tutarlıydı. Randevu süreci iki mesajda netleşti. Demo hesapta gerçek ödeme olmadığını bilerek ilerledim.",
    puan: 4 + (i % 2),
    is_demo: true,
  });
}
fs.writeFileSync(path.join(outDir, "11-testimonials.json"), JSON.stringify(testimonials, null, 2), "utf8");

/** --- Görev 17: 60 terim --- */
const terms = [
  ["kapora", "Ön ödeme niteliğinde teminat benzeri tutar.", "Kapora dekontunu ilan dosyasına ekledim."],
  ["teminat", "İhaleye katılım için bloke edilen tutar.", "Teminat iadesi şartnameye göre işlendi."],
  ["takyidat", "Tapu kaydına işlenen hak.", "Takyidat sorgusu için tapu müdürlüğü çıktısı alındı."],
  ["ipotek", "Teminat amaçlı rehin hakkı.", "İpotek kaldırılmadan satış tamamlanamaz."],
  ["ekspertiz", "Değer tespiti raporu.", "Ekspertiz bedeli teklif öncesi ayrı satırda gösterildi."],
  ["açık artırma", "Tekliflerin artırıldığı satış yöntemi.", "Açık artırmada süre uzatma kuralı okundu."],
  ["muhammen bedel", "Asgari satış fiyatı.", "Muhammen altına teklif kabul edilmedi."],
  ["ihale komisyonu", "Hizmet bedeli.", "Komisyon KDV dahil satırda listelendi."],
  ["tapu harcı", "Tapu işlemi vergisi.", "Tapu harcı oranı örnek hesapta iki tarafa bölündü."],
  ["KDV", "Katma değer vergisi.", "KDV oranı hizmet faturasında ayrı gösterildi."],
  ["BSMV", "Banka ve Sigorta Muameleleri Vergisi.", "Kredi ürününde BSMV satırı ayrıldı."],
  ["KKDF", "Kaynak Kullanımı Destekleme Fonu.", "Yabancı para kredilerinde KKDF kontrol edildi."],
  ["escrow", "Koşullu emanet hesap modeli.", "Escrow adımı sözleşmede tanımlandı."],
  ["bid bond", "Teklif teminatı.", "Bid bond iade koşulları okundu."],
  ["anti-sniping", "Bitiş anında süre uzatma kuralı.", "Anti-sniping son 2 dakikada devreye girdi."],
  ["KYC", "Müşterini tanı süreci.", "KYC belgeleri yüklendi."],
  ["AML", "Kara para aklama ile mücadele kontrolleri.", "AML skoru otomatik kontrol edildi."],
  ["yüzölçümü", "Parsel veya yapı alanı.", "Yüzölçümü tapu özetinde doğrulandı."],
  ["kat irtifakı", "Yapılmamış yapıda hak.", "Kat irtifakı devri için plan istendi."],
  ["kat mülkiyeti", "Bağımsız bölüm mülkiyeti.", "Kat mülkiyeti tapusu teslim edildi."],
  ["imar durumu", "Parselin yapılaşma kuralı özeti.", "İmar durumu PDF eklendi."],
  ["e-devlet", "Resmi dijital kapı.", "e-Devlet çıktısı yetki için kullanıldı."],
  ["ipotek fekki", "İpotek kaldırma işlemi.", "Fek tarihi sözleşmeye yazıldı."],
  ["değer tespiti", "Rayiç veya ekspertiz sonucu.", "Değer tespiti başlangıç fiyatına referans oldu."],
  ["rezerv fiyat", "Satıcının kabul ettiği alt sınır.", "Rezerv altı teklif reddedildi."],
  ["şeffaf teklif", "Tekliflerin görünür olması.", "Şeffaf teklif listesi anonimleştirildi."],
  ["otomatik teklif", "Limitli artırım.", "Otomatik teklif üst limiti 1200000 olarak ayarlandı."],
  ["idempotency", "Yinelenen işlemi önleme anahtarı.", "Idempotency anahtarı çakışmayı engelledi."],
  ["JSON", "Veri değişim formatı.", "JSON dosyası demo içerik için kullanıldı."],
  ["demo veri", "Gerçek olmayan örnek.", "Demo veri etiketi arayüzde gösterilmelidir."],
  ["hissedar", "Ortak malik.", "Hissedar onayı tapu öncesi alındı."],
  ["intifa hakkı", "Başkasının malını kullanma hakkı.", "Intifa süresi sözleşmede belirtildi."],
  ["irtifak hakkı", "Üzerinde yapı yapma hakkı.", "İrtifak tapu kaydında görüldü."],
  ["ipotek derecesi", "Öncelik sırası.", "Birinci derece ipotek krediyi güvenceledi."],
  ["tescil", "Resmi kayıt.", "Tescil tarihi bildirimde yer aldı."],
  ["rayiç", "Genel değer düzeyi.", "Rayiç değer vergi matrahına esas olabilir."],
  ["metrekare", "Alan birimi.", "Metrekare brüt ve net ayrı yazıldı."],
  ["brüt alan", "Ortak alanlar dahil alan.", "Brüt alan ilan başlığında belirtildi."],
  ["net alan", "Kullanım alanı.", "Net alan fiyat karşılaştırmasında kullanıldı."],
  ["iskan", "Yapı kullanma izni.", "İskan belgesi eksikse risk uyarısı verildi."],
  ["su yapı ruhsatı", "Belediye ruhsatı.", "Ruhsat tarihi kontrol edildi."],
  ["parsel", "Taşınmaz parçası.", "Parsel numarası sorgulandı."],
  ["ada", "Parsel grubu.", "Ada bilgisi tapu özetinde vardı."],
  ["pafta", "Harita dilimi.", "Pafta bilgisi arşivden alındı."],
  ["satış vaadi", "Önceden sözleşme.", "Satış vaadi noterden düzenlendi."],
  ["önalım", "Önce alma hakkı.", "Önalım süresi doldu."],
  ["şufa", "Ortakın önce alma hakkı.", "Şufa hakkı değerlendirildi."],
  ["ipotek tesis", "İpotek kurulması.", "İpotek tesis işlemi tamamlandı."],
  ["feragat", "Vazgeçme.", "Feragat beyanı imzalandı."],
  ["tescil dışı bina", "Ruhsatsız yapı riski.", "Tescil dışı bina için hukuki uyarı verildi."],
  ["KVKK", "Kişisel verilerin korunması kanunu.", "KVKK başvurusu form doldurularak yapıldı."],
  ["aydınlatma metni", "Veri işleme bilgilendirmesi.", "Aydınlatma metni onaylandı."],
  ["açık rıza", "Belirli işlem için izin.", "Açık rıza kutusu işaretlendi."],
  ["veri silme", "Hak talebi.", "Veri silme talebi kayda alındı."],
  ["çerez", "Tarayıcı çerezi.", "Çerez tercihleri güncellendi."],
  ["oturum", "Giriş durumu.", "Oturum süresi doldu."],
  ["OTP", "Tek kullanımlık şifre.", "OTP SMS ile geldi."],
  ["rate limit", "İstek sınırı.", "Rate limit aşıldı; bir dakika beklendi."],
  ["idari para cezası", "İdari yaptırım.", "İdari para cezası konu dışı bırakıldı."],
  ["tüketici", "Bireysel alıcı statüsü.", "Tüketici hakları bilgilendirmesi eklendi."],
  ["profesyonel alıcı", "Ticari statü.", "Profesyonel alıcı için farklı sözleşme taslağı kullanıldı."],
  ["teminat mektubu", "Banka teminatı.", "Teminat mektubu PDF yüklendi."],
  ["bloke", "Hareketsiz tutma.", "Tutar hesapta bloke edildi."],
  ["mahsup", "Borcun düşülmesi.", "Teminat mahsup edildi."],
];
let glossMd = "# Sözlük — 60 terim\n\n";
for (const [term, def, ex] of terms) {
  glossMd += `## ${term}\n\n**Tanım:** ${def}\n\n**Örnek:** ${ex}\n\n`;
}
fs.writeFileSync(path.join(outDir, "17-glossary.md"), glossMd, "utf8");

/** README */
const readme = `# KIMI MEGA paket — durum

Bu klasör, 30 görevlik paketin **dosyaya taşınabilen** kısmını içerir.

## Tamamlanan dosyalar (sayısal kontrol)

| Dosya | Görev | Kayıt / madde |
|-------|--------|----------------|
| 01-auctions.json | 1 | 24 ihale |
| 02-sellers.json | 2 (**A_02**) | 50 satıcı — **iş modeli v2026** (yıllık satıcı üyeliği 5.000 TL, sınırsız ilan; %2+%2 komisyon özeti; eski paket yok) |
| 03-buyers.json | 3 (**A_03**) | 80 alıcı — **iş modeli v2026** (yıllık alıcı üyeliği 1.000 TL, teklif yetkisi; eski paket modeli yok) |
| 04-faq.md | 4 | 40 soru-cevap |
| 08-push-notifications.json | 8 | 30 push |
| 09-tooltips.json | 9 | 40 tooltip |
| 10-errors.json | 10 | 50 hata |
| 11-testimonials.json | 11 | 50 yorum |
| 17-glossary.md | 17 | 60 terim |

## İş modeli notu (2026)

**A_02 / A_03** kayıtları \"business_model_version\": \"2026_membership_commission\" ile işaretlenir. Satıcı tarafında **yıllık üyelik (5.000 TL, sınırsız ilan)** + komisyon; alıcıda **yıllık üyelik (1.000 TL)** ile teklif yetkisi varsayımı demo metindedir. Eski **Standart/Vitrin/Doping/Pro** ve **99/299/799/2299 TL** paket modeli bu dosyalarda kullanılmaz.

## Tek mesajda üretilemeyen görevler (açık itiraf)

Aşağıdakiler toplam **~50.000+ kelime** ve çoklu HTML uzunluğu gerektirir; tek sohbet çıktısı ve makul token sınırı içinde **eksiksiz ve kalite kontrollü** teslim edilemez. Devam için görev numarasıyla ayrı turlar veya dosya başına bir tur önerilir:

- 5 (12 e-posta × HTML+text)
- 6 (8 × 1000–1500 kelime)
- 7, 12–16, 18–30 (uzun metin, çoklu seri, mağaza metinleri, rehberler)

## Repo içi yol (Cursor’da aç)

\`ihaleal.com/docs/kimi-mega-pack/\`

Üretim scripti (yeniden çalıştırma): \`node scripts/_generate_kimi_mega_pack.mjs\`
`;
fs.writeFileSync(path.join(outDir, "README.md"), readme, "utf8");

console.log("Wrote:", outDir);
console.log("01 chars:", j1.length);
