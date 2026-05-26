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

  const detailIdCandidate = [kategori, alt, tip].find((value) =>
    value ? isPropertyDetailId(value) : false,
  );
  if (detailIdCandidate) {
    return <IlanDetayPage id={detailIdCandidate} />;
  }

  return (
    <CategoryLandingPage
      category={kategori}
      sub={alt}
      type={tip}
    />
  );
}
