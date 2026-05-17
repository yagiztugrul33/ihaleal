import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INTELLIGENCE_HUB_PATH, GES_ANALYSIS_PATH, PARCEL_INTELLIGENCE_PATH } from "@/lib/intelligenceHub";

export default function LandInvestmentPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-6 text-slate-400">
        <Link to={INTELLIGENCE_HUB_PATH}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Arastirma
        </Link>
      </Button>
      <h1 className="text-2xl font-bold text-white">Yatirim terminali</h1>
      <p className="text-slate-400 mt-3 leading-relaxed">
        Bolge karsilastirma, portfoy skorlari ve kurumsal rapor paketleri bir sonraki surumde
        aktiflestirilecektir.Simdilik GES ve ada parsel modullerini kullanabilirsiniz.
      </p>
      <div className="flex flex-wrap gap-3 mt-8">
        <Button asChild className="btn-primary">
          <Link to={GES_ANALYSIS_PATH}>GES analizi</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={PARCEL_INTELLIGENCE_PATH}>Parsel istihbarat</Link>
        </Button>
      </div>
    </div>
  );
}
