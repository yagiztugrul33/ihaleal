import { AlertCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

export function DemoUyarisi() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("demo-uyarisi-kapali");
    if (dismissed === "true") setVisible(false);
  }, []);

  const dismiss = () => {
    localStorage.setItem("demo-uyarisi-kapali", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative z-50 border-b border-amber-500/30 bg-amber-500/10 text-amber-100">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="truncate sm:whitespace-normal">
            <strong>Pilot Ortam Bildirimi:</strong> Bu sürüm yatırımcı ve kurumsal ekipler için kontrollü gösterim
            ortamıdır. Finansal taahhüt doğuran adımlar canlıya alınmadan önce resmi entegrasyon, hukuk ve uyum
            kontrolleriyle doğrulanır.
          </span>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Demo uyarısını kapat"
          className="flex-shrink-0 rounded p-1 transition-colors hover:bg-amber-500/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
