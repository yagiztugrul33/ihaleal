import { Map } from "lucide-react";

type RoadmapBannerProps = {
  /** Ek sınıf (sayfa düzeni için) */
  className?: string;
};

/**
 * K16=B: Üretimde kanıtlanmamış veya henüz devreye alınmamış iddiaların üstünde
 * “hedef / taslak” bağlamı gösterir.
 */
export function RoadmapBanner({ className = "" }: RoadmapBannerProps) {
  return (
    <div
      role="note"
      className={`mb-6 flex gap-3 rounded-[20px] border border-sky-500/25 bg-sky-500/10 px-4 py-3 text-sm text-slate-300 ${className}`}
    >
      <Map className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" aria-hidden />
      <p className="leading-relaxed">
        <span className="font-normal text-sky-200">Hedef / yol haritası (taslak):</span> Bu sayfadaki teknik
        süreler, katmanlar, sertifikalar ve otomasyonlar <strong className="text-slate-100">ürün planı</strong>{" "}
        düzeyindedir; canlı ortamda çalışan altyapı veya hukuken bağlayıcı uyum iddiası değildir. Üretim öncesi
        mimari, sözleşme ve denetim adımlarıyla netleştirilecektir.
      </p>
    </div>
  );
}
