import { useCallback, useRef, useState } from "react";
import { Eraser, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { saveSignatureRecord, sha256Hex } from "@/lib/signature/signatureClient";
import { downloadStructuredPdf } from "@/lib/pdf/pdfBuilder";

type Props = {
  documentId: string;
  documentType?: string;
  documentTitle: string;
  documentLines: string[];
  onSigned?: () => void;
};

export function SignaturePad({
  documentId,
  documentType = "pdf",
  documentTitle,
  documentLines,
  onSigned,
}: Props) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  const startDraw = (x: number, y: number) => {
    const ctx = getCtx();
    if (!ctx) return;
    drawingRef.current = true;
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (x: number, y: number) => {
    if (!drawingRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    drawingRef.current = false;
  };

  const pointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDone(false);
  };

  const sign = useCallback(async () => {
    if (!user?.id || !canvasRef.current || busy) return;
    setBusy(true);
    try {
      const signatureDataUrl = canvasRef.current.toDataURL("image/png");
      const contentText = [documentTitle, ...documentLines].join("\n");
      const contentHash = await sha256Hex(contentText + signatureDataUrl);

      await saveSignatureRecord({
        userId: user.id,
        documentId,
        documentType,
        signatureDataUrl,
        contentHash,
      });

      await downloadStructuredPdf({
        title: documentTitle,
        subtitle: "Ön onay imzası (MVP)",
        filename: `ihaleal-imzali-${documentId.slice(0, 8)}.pdf`,
        disclaimer:
          "Bu görsel imza yasal nitelikli e-imza değildir; ön onay / iç onay amaçlıdır. Bkz. _audit/EIMZA_NOTU.md",
        sections: [
          { heading: "Belge", lines: documentLines },
          { heading: "İmza", lines: ["Canvas imza eklendi.", `Hash: ${contentHash.slice(0, 16)}…`] },
        ],
      });

      setDone(true);
      onSigned?.();
    } finally {
      setBusy(false);
    }
  }, [busy, documentId, documentLines, documentTitle, documentType, onSigned, user?.id]);

  if (!user) {
    return <p className="text-sm text-slate-400">İmzalamak için giriş yapın.</p>;
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200/80 bg-white/[0.02] p-4">
      <p className="text-xs text-amber-200/90">
        Ön onay imzası (MVP) — yasal e-imza değildir. Parmak veya fare ile imza çizin.
      </p>
      <canvas
        ref={canvasRef}
        width={320}
        height={120}
        className="w-full max-w-md rounded border border-dashed border-slate-500 bg-white touch-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          const { x, y } = pointerPos(e);
          startDraw(x, y);
        }}
        onPointerMove={(e) => {
          const { x, y } = pointerPos(e);
          draw(x, y);
        }}
        onPointerUp={endDraw}
        onPointerLeave={endDraw}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          <Eraser className="h-4 w-4 mr-1" /> Temizle
        </Button>
        <Button type="button" size="sm" disabled={busy || done} onClick={() => void sign()}>
          <PenLine className="h-4 w-4 mr-1" /> {done ? "İmzalandı" : "İmzala ve PDF indir"}
        </Button>
      </div>
    </div>
  );
}
