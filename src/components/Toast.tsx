import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import type { Toast } from "@/hooks/useToast";

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  const iconColors = {
    success: "var(--durum-basari)",
    error: "var(--durum-hata)",
    info: "var(--metin-ikincil)",
    warning: "var(--durum-uyari)",
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" style={{ color: iconColors.success }} />,
    error: <AlertCircle className="w-5 h-5" style={{ color: iconColors.error }} />,
    info: <Info className="w-5 h-5" style={{ color: iconColors.info }} />,
    warning: <AlertTriangle className="w-5 h-5" style={{ color: iconColors.warning }} />,
  };

  return (
    <div className="fixed top-20 end-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 px-4 py-3 rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] backdrop-blur-xl animate-slide-in-right"
        >
          <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
          <p className="text-sm text-white/90 flex-1">{toast.message}</p>
          <button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
