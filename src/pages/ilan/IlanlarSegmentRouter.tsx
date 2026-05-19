import { useParams } from "react-router-dom";
import { isPropertyDetailId } from "@/lib/demo-data";
import CategoryLandingPage from "@/pages/ilan/CategoryLandingPage";
import IlanDetayPage from "@/pages/ilan/IlanDetayPage";

/**
 * /ilanlar/:kategori/:alt/:tip — prop-XXX → detay; aksi halde kategori landing.
 */
export default function IlanlarSegmentRouter() {
  const { kategori, alt, tip } = useParams<{
    kategori?: string;
    alt?: string;
    tip?: string;
  }>();

  if (kategori && isPropertyDetailId(kategori)) {
    return <IlanDetayPage id={kategori} />;
  }

  return (
    <CategoryLandingPage
      category={kategori}
      sub={alt}
      type={tip}
    />
  );
}
