import { useParams } from "react-router-dom";
import { isPropertyDetailId } from "@/lib/demo-data";
import AuctionDetail from "@/pages/AuctionDetail";
import IlanDetayPage from "@/pages/ilan/IlanDetayPage";

/**
 * /ilan/:id
 * - prop-xxx gibi katalog id'leri -> ilan detay bileşeni
 * - diğer id'ler -> ihale detay akışı
 */
export default function IlanDetailRouter() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <AuctionDetail />;
  if (isPropertyDetailId(id)) {
    return <IlanDetayPage id={id} />;
  }
  return <AuctionDetail />;
}
