import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clientLogError } from "@/lib/clientLog";

type Props = {
  label?: string;
  onExport: () => Promise<void>;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  disabled?: boolean;
};

export function PdfExportButton({
  label = "PDF İndir",
  onExport,
  variant = "outline",
  size = "sm",
  className,
  disabled = false,
}: Props) {
  const [busy, setBusy] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={busy || disabled}
      onClick={() => {
        setBusy(true);
        void onExport()
          .catch((e) => clientLogError("pdf-export", e))
          .finally(() => setBusy(false));
      }}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : <Download className="h-4 w-4 me-1" />}
      {label}
    </Button>
  );
}
