import { useParams } from "react-router-dom";
import { isPropertyDetailId } from "@/lib/demo-data";
import CategoryLandingPage from "@/pages/ilan/CategoryLandingPage";
import IlanDetayPage from "@/pages/ilan/IlanDetayPage";

/**
 * /ilanlar/* — prop-XXX → detay; aksi halde kategori landing.
 */
export default function IlanlarRouter() {
  const params = useParams();
  const segments = [
    params["*"]?.split("/").filter(Boolean)[0],
    params.kategori,
    params.alt,
    params.tip,
  ].filter((s): s is string => Boolean(s));

  const unique = [...new Set(segments)];
  const first = unique[0];

  if (first && isPropertyDetailId(first)) {
    return <IlanDetayPage id={first} />;
  }

  const category = params.kategori ?? unique[0];
  const alt = params.alt ?? unique[1];
  const tip = params.tip ?? unique[2];

  return <CategoryLandingPage category={category} sub={alt} type={tip} />;
}
