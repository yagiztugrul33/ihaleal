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
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 relative z-50">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="truncate sm:whitespace-normal">
            <strong>DEMO MODU:</strong> Bu site şu anda demo modundadır.
            Gerçek ödeme alınmamakta, ihaleler test amaçlıdır.
            Şirketleşme tamamlandıktan sonra gerçek işlem alınacaktır.
          </span>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Demo uyarısını kapat"
          className="flex-shrink-0 p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
