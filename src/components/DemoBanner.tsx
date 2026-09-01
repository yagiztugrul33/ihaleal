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
      className="relative border-b border-amber-600/50 bg-amber-100 text-center text-[11px] leading-relaxed text-amber-950 px-3 py-2 sm:text-xs"
    >
      {isDemoData("demoBanner") ? <DemoDataCornerBadge /> : null}
      <span className="font-normal text-amber-950">Demo</span>
      {" — "}
      Bu site <strong>demo sürümdedir</strong>. İlanlar, teklifler ve fiyat tahminleri örnek amaçlıdır;{" "}
      <strong>gerçek satış işlemi yapılmaz</strong>. Canlı ödeme, banka, Findeks, e-Devlet ve harici endeks API’si yok.
      <button type="button" onClick={() => navigate("/komisyon-modeli")} className="mx-1 underline font-normal text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
        Gelir modeli (komisyon)
      </button>
    </div>
  );
}
