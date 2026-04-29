import { writeFileSync } from "fs";

/** id, title, category, city, district, neighborhood, size_m2, rooms|null, start_try, current_try, ends_at, starts_at, bid_count, status, description */
const rows = [
  ["id_001", "Beşiktaş Levent — 3+1 Lüks Daire", "real_estate_residential", "İstanbul", "Beşiktaş", "Levent", 165, "3+1", 8_500_000, 9_200_000, "2026-05-15T20:00:00+03:00", "2026-04-30T10:00:00+03:00", 17, "live", "Levent merkez, metroya yakın."],
  ["id_002", "Kadıköy Moda — 2+1 Deniz Kenarı", "real_estate_residential", "İstanbul", "Kadıköy", "Moda", 92, "2+1", 6_200_000, 6_850_000, "2026-06-01T18:00:00+03:00", "2026-05-05T09:00:00+03:00", 11, "live", "Moda sahilde yenilenmiş daire."],
  ["id_003", "Şişli Mecidiyeköy — 4+2 Dubleks", "real_estate_residential", "İstanbul", "Şişli", "Mecidiyeköy", 210, "4+2", 12_500_000, 13_200_000, "2026-05-22T19:00:00+03:00", "2026-05-01T10:00:00+03:00", 22, "live", "Caddeye yakın dubleks."],
  ["id_004", "Kadıköy Caddebostan — 3+1 Bahçeli", "real_estate_residential", "İstanbul", "Kadıköy", "Caddebostan", 140, "3+1", 9_800_000, 10_400_000, "2026-06-10T20:30:00+03:00", "2026-05-08T11:00:00+03:00", 14, "live", "Bahçe kullanımlı konut."],
  ["id_005", "Çankaya Birlik — 3+1", "real_estate_residential", "Ankara", "Çankaya", "Birlik", 118, "3+1", 5_200_000, 5_450_000, "2026-07-05T17:00:00+03:00", "2026-05-12T09:30:00+03:00", 9, "live", "Merkezi konumda ilan."],
  ["id_006", "Konak Alsancak — 3+1 Yalı Apartmanı", "real_estate_residential", "İzmir", "Konak", "Alsancak", 135, "3+1", 7_800_000, 8_100_000, "2026-06-18T19:00:00+03:00", "2026-05-15T10:00:00+03:00", 13, "live", "Denize nazır cephe."],
  ["id_007", "Nilüfer Görükle — 3+1 Site İçi", "real_estate_residential", "Bursa", "Nilüfer", "Görükle", 125, "3+1", 4_100_000, 4_280_000, "2026-08-01T18:00:00+03:00", "2026-06-01T08:00:00+03:00", 8, "live", "Site havuzu ve güvenlik."],
  ["id_008", "Şişli Bomonti — 2+1 Loft", "real_estate_residential", "İstanbul", "Şişli", "Bomonti", 95, "2+1", 8_900_000, 9_350_000, "2026-05-28T20:00:00+03:00", "2026-05-03T10:00:00+03:00", 19, "live", "Sanayi loft konsepti."],
  ["id_009", "Sarıyer Zekeriyaköy — Müstakil Villa", "real_estate_residential", "İstanbul", "Sarıyer", "Zekeriyaköy", 420, "6+2", 28_500_000, 29_500_000, "2026-06-25T17:00:00+03:00", "2026-05-10T09:00:00+03:00", 31, "live", "Havuzlu bahçeli villa."],
  ["id_010", "Konyaaltı Lara — Villa Deniz Manzaralı", "real_estate_residential", "Antalya", "Konyaaltı", "Lara", 380, "5+3", 18_500_000, 19_200_000, "2026-07-12T18:30:00+03:00", "2026-05-18T11:00:00+03:00", 26, "live", "Akdeniz panoraması."],
  ["id_011", "Bodrum Yalıkavak — Taş Villa", "real_estate_residential", "Muğla", "Bodrum", "Yalıkavak", 310, "5+2", 22_000_000, 23_500_000, "2026-08-05T19:00:00+03:00", "2026-06-05T10:00:00+03:00", 33, "live", "Marina yakını taş yapı."],
  ["id_012", "Çeşme Alaçatı — Villa Havuzlu", "real_estate_residential", "İzmir", "Çeşme", "Alaçatı", 265, "4+2", 15_200_000, 15_900_000, "2026-06-30T20:00:00+03:00", "2026-05-20T09:00:00+03:00", 18, "live", "Rüzgâr sörf bölgesi."],
  ["id_013", "Ayvalık — Villa Denize Sıfır", "real_estate_residential", "Balıkesir", "Ayvalık", "Merkez", 290, "4+2", 12_800_000, 13_450_000, "2026-07-22T18:00:00+03:00", "2026-06-01T09:00:00+03:00", 21, "live", "Adalar manzarası."],
  ["id_014", "Levent Plaza — Ofis Katı", "real_estate_commercial", "İstanbul", "Beşiktaş", "Levent", 280, "Open plan", 18_500_000, 19_000_000, "2026-05-20T17:00:00+03:00", "2026-05-02T08:30:00+03:00", 12, "live", "Ana cadde üstü ticari kat."],
  ["id_015", "Kızılay — Vitrin Mağaza", "real_estate_commercial", "Ankara", "Çankaya", "Kızılay", 145, "Dükkan", 9_200_000, 9_650_000, "2026-06-08T16:00:00+03:00", "2026-05-06T09:00:00+03:00", 15, "live", "Yüksek tirajlı cadde."],
  ["id_016", "Alsancak — Showroom", "real_estate_commercial", "İzmir", "Konak", "Alsancak", 220, "Showroom", 7_400_000, 7_880_000, "2026-07-01T18:00:00+03:00", "2026-05-22T10:00:00+03:00", 10, "live", "Vitrin cepheli showroom."],
  ["id_017", "Çeşme İmarlı Arsa", "real_estate_land", "İzmir", "Çeşme", "Alaçatı", 1250, null, 45_000_000, 44_200_000, "2026-06-14T12:00:00+03:00", "2026-05-01T08:00:00+03:00", 5, "live", "İmar durumu net arsa."],
  ["id_018", "Gelibolu — Tarla İmar", "real_estate_land", "Çanakkale", "Gelibolu", "Merkez", 5200, null, 2_800_000, 2_750_000, "2026-07-18T11:00:00+03:00", "2026-05-25T07:00:00+03:00", 3, "live", "Yol cepheli tarla."],
  ["id_019", "Sapanca Göl Kenarı — Arsa", "real_estate_land", "Sakarya", "Sapanca", "Mahmudiye", 1800, null, 5_200_000, 5_050_000, "2026-08-12T17:00:00+03:00", "2026-06-15T09:00:00+03:00", 7, "live", "Göl manzaralı parsel."],
  ["id_020", "Marmaris İçmeler — Yazlık 2+1", "real_estate_residential", "Muğla", "Marmaris", "İçmeler", 78, "2+1", 3_200_000, 3_480_000, "2026-06-05T19:00:00+03:00", "2026-05-11T10:00:00+03:00", 16, "live", "Denize yürüme mesafesi."],
  ["id_021", "Datça Mesudiye — Yazlık Villa", "real_estate_residential", "Muğla", "Datça", "Mesudiye", 110, "3+1", 5_100_000, 5_350_000, "2026-07-28T18:30:00+03:00", "2026-06-08T09:00:00+03:00", 12, "live", "Rezistans bahçe."],
  ["id_022", "Beyoğlu İstiklal — Dükkan", "real_estate_commercial", "İstanbul", "Beyoğlu", "İstiklal", 85, "Dükkan", 12_400_000, 12_900_000, "2026-05-30T20:00:00+03:00", "2026-05-04T09:00:00+03:00", 28, "live", "Turistik cadde vitrin."],
  ["id_023", "Bahçelievler Şirinevler — Dükkan", "real_estate_commercial", "İstanbul", "Bahçelievler", "Şirinevler", 72, "Dükkan", 2_150_000, 2_290_000, "2026-06-20T17:00:00+03:00", "2026-05-09T08:00:00+03:00", 6, "live", "Otoyol bağlantısı yakın."],
  ["id_024", "Maslak Plaza — A Plus Ofis", "real_estate_commercial", "İstanbul", "Sarıyer", "Maslak", 340, "Open office", 36_500_000, 38_200_000, "2026-08-08T16:00:00+03:00", "2026-06-01T08:00:00+03:00", 27, "live", "Metro üstünde plaza katı."],
];

const out = rows.map((r) => {
  const [
    id,
    title,
    category,
    city,
    district,
    neighborhood,
    size_m2,
    rooms,
    starting_bid_try,
    current_bid_try,
    ends_at,
    starts_at,
    bid_count,
    status,
    description,
  ] = r;
  return {
    id,
    title,
    category,
    city,
    district,
    neighborhood,
    size_m2,
    rooms,
    starting_bid_try,
    current_bid_try,
    ends_at,
    starts_at,
    bid_count,
    status,
    is_demo: true,
    description,
  };
});

writeFileSync(new URL("../src/data/demo-auctions.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(`OK ${out.length} kayıt`);
