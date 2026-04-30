import { Auctions } from "@/sections/Auctions";

/** Tam liste: 24 demo ihale, filtre ve sıralama `Auctions` bileşeninde. */
export default function AuctionListPage() {
  return (
    <Auctions
      asSection={false}
      sectionTitle="İhaleler"
      sectionSubtitle="Şehir, tip (gayrimenkul kategorisi), durum ve arama ile demo kayıtları listeleyin; sıralamayı üstten seçin."
    />
  );
}
