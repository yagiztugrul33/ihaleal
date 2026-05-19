import { Link } from "react-router-dom";
import { AlertTriangle, HeartHandshake, Map, Radio, Shield } from "lucide-react";

export function EmergencyActionBand() {
  return (
    <aside className="emergency-action-band" aria-label="Deprem acil eylem kısayolları">
      <div className="emergency-action-band__inner">
        <div className="emergency-action-band__title">
          <AlertTriangle className="h-5 w-5 text-amber-300" aria-hidden />
          <span>Acil eylem: deprem hazırlığı</span>
        </div>
        <nav className="emergency-action-band__nav" aria-label="Modül bağlantıları">
          <Link to="/modul/bina-risk-sorgu" className="emergency-action-band__link">
            <Radio className="h-4 w-4" aria-hidden />
            Bina risk
          </Link>
          <Link to="/modul/deprem-risk-haritasi" className="emergency-action-band__link">
            <Map className="h-4 w-4" aria-hidden />
            Risk haritası
          </Link>
          <Link to="/modul/canli-deprem-takip" className="emergency-action-band__link">
            <AlertTriangle className="h-4 w-4" aria-hidden />
            Canlı takip
          </Link>
          <Link to="/modul/aile-acil-plan" className="emergency-action-band__link">
            <HeartHandshake className="h-4 w-4" aria-hidden />
            Aile planı
          </Link>
          <Link to="/modul/guclendirme-rehberi" className="emergency-action-band__link">
            <Shield className="h-4 w-4" aria-hidden />
            Güçlendirme
          </Link>
        </nav>
      </div>
    </aside>
  );
}
