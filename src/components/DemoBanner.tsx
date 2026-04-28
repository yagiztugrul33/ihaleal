import { useNavigate } from "react-router-dom";
import { DemoDataCornerBadge } from "@/components/DemoDataCornerBadge";
import { isDemoData } from "@/lib/dataStrategy";

/**
 * Kapatılamaz demo şeridi (Cloud tur #2 / mega komut tur #3).
 * Metin: demo kapsamı + gerçek satış yok.
 */
export function DemoBanner() {
  const navigate = useNavigate();

  return (
    <div
      role="status"
      data-demo="true"
      className="relative bg-amber-500/15 border-b border-amber-500/25 text-center text-[11px] sm:text-xs text-amber-100/95 px-3 py-2 leading-relaxed"
    >
      {isDemoData("demoBanner") ? <DemoDataCornerBadge /> : null}
      <span className="font-semibold text-amber-200">Demo</span>
      {" — "}
      Bu site <strong className="text-amber-100">demo sürümdedir</strong>. İlanlar, teklifler ve fiyat tahminleri örnek amaçlıdır;{" "}
      <strong className="text-amber-100">gerçek satış işlemi yapılmaz</strong>. Canlı ödeme, banka, Findeks, e-Devlet ve harici endeks / fiyat API’si yok.
      <button type="button" onClick={() => navigate("/komisyon-modeli")} className="mx-1 underline text-teal-300 hover:text-white">
        Gelir modeli (komisyon)
      </button>
    </div>
  );
}
