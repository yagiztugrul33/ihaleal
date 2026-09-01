import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, ShieldAlert, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationPicker, type LocationValue } from "@/components/location/LocationPicker";
import { ZoneRiskCard } from "@/components/location/ZoneRiskCard";
import {
  COVERED_PROVINCES_COUNT,
  COVERED_ISTANBUL_DISTRICTS_COUNT,
} from "@/data/zoneRiskData";

/**
 * Konum Risk Sorgu — LocationPicker + dürüst zemin risk gösterimi.
 *
 * - Kullanıcı il/ilçe seçer + harita pin → ZoneRiskCard'a aktarılır
 * - Veri varsa: kaynak etiketli + çözünürlük + 3 risk katmanı + PGA
 * - Veri yoksa: dürüst "veri yok" + il geneli yönlendirme
 * - UYDURMA YOK doktrini.
 */
export default function LocationRiskQueryPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState<LocationValue>({});

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-white gap-2"
        >
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
        </Button>

        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 mb-3">
            <ShieldAlert className="h-3.5 w-3.5" /> Konum-Bazlı Zemin Risk Sorgu
          </p>
          <h1 className="text-3xl font-normal flex items-center gap-2">
            <MapPin className="h-7 w-7 text-rose-300" />
            Bölge Zemin/Deprem Risk Sorgu
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            İl/ilçe seçin veya harita üzerinde tam konumu pin'le belirleyin. AFAD/İBB
            kamuya açık verilerinden risk bilgisi gösterilir — veri yoksa dürüstçe belirtilir.
          </p>
        </div>

        {/* Kapsam açıklaması */}
        <div className="rounded-[20px] border border-cyan-400/20 bg-slate-900/40 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-cyan-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-normal text-white mb-1">Veri Kapsamı</p>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                <li><strong>{COVERED_PROVINCES_COUNT} il</strong> için AFAD Türkiye Deprem Tehlike Haritası (TDTH 2018) il-bazlı risk grubu + PGA</li>
                <li><strong>{COVERED_ISTANBUL_DISTRICTS_COUNT} İstanbul ilçesi</strong> için İBB Mikrobölgeleme 2009 + JICA mikrobölge verisi</li>
                <li>2023 Kahramanmaraş depremi etkilenen iller için güncel deprem dizisi notu</li>
                <li>Doğu Karadeniz illeri için AFAD Heyelan Envanteri</li>
              </ul>
              <p className="text-[10px] text-slate-500 mt-2 italic">
                Diğer iller/ilçeler için detaylı mahalle bazı veri kamuya henüz açık değil.
                Bu durumda "veri yok" mesajı gösterilir; il geneli kullanılır.
              </p>
            </div>
          </div>
        </div>

        {/* Konum seçici */}
        <div className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-5 space-y-4">
          <h2 className="text-base font-normal text-white">1. Konum seçin</h2>
          <LocationPicker
            value={location}
            onChange={setLocation}
            showMap
            showSearch
          />
        </div>

        {/* Risk gösterimi */}
        <div className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-5 space-y-4">
          <h2 className="text-base font-normal text-white">2. Risk bilgisi</h2>
          <ZoneRiskCard
            province={location.province}
            district={location.district}
          />
        </div>

        {/* Eğitici */}
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-[10px] border border-slate-700 bg-slate-900/40 p-3">
            <h3 className="text-xs font-normal uppercase tracking-wider text-rose-200 mb-1.5">
              Sıvılaşma nedir?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Doygun gevşek kumlu/siltli zeminin, depremde geçici olarak sıvı gibi davranması.
              Bina temelinin oturması, eğilmesi veya batması sonuçları olur. Riskli zeminler:
              kıyı alüvyonu, akarsu yatakları, sazlık alanlar.
            </p>
          </div>
          <div className="rounded-[10px] border border-slate-700 bg-slate-900/40 p-3">
            <h3 className="text-xs font-normal uppercase tracking-wider text-amber-200 mb-1.5">
              Heyelan nedir?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Eğimli arazide toprak/kaya kütlesinin yerçekimi etkisiyle aşağıya kayması.
              Tetikleyiciler: yoğun yağış, deprem, yer kazıları. Doğu Karadeniz + Trabzon-Rize
              riskli; deprem riski düşük olsa da heyelan ölümcül olabilir.
            </p>
          </div>
          <div className="rounded-[10px] border border-slate-700 bg-slate-900/40 p-3">
            <h3 className="text-xs font-normal uppercase tracking-wider text-orange-200 mb-1.5">
              Zemin Büyütme nedir?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Yumuşak zeminin deprem dalgalarını "büyütmesi" (amplifikasyon). Aynı deprem,
              sert kaya üzerindeki binada hafif, alüvyon ova binasında 2-4 katı şiddetinde
              hissedilebilir. Ova kenarları + dolgu alanlar yüksek riskli.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
