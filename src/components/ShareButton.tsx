import { useEffect, useState } from "react";
import {
  Share2,
  X,
  Copy,
  Check,
  Facebook,
  Instagram,
  MessageCircle,
  Send,
  QrCode,
  ExternalLink,
} from "lucide-react";

interface ShareButtonProps {
  title: string;
  url: string;
  priceText?: string;
  imageUrl?: string;
  inviteText?: string;
  className?: string;
}

type ShareLink = {
  name: string;
  href: string;
  icon: JSX.Element;
  className: string;
  onClick?: () => void;
};

export function ShareButton({ title, url, priceText, imageUrl, inviteText, className }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (!copiedInvite) return;
    const timer = window.setTimeout(() => setCopiedInvite(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copiedInvite]);

  const fullUrl =
    typeof window !== "undefined"
      ? url.startsWith("/")
        ? `${window.location.origin}/#${url}`
        : `${window.location.origin}${url}`
      : url;
  const shareText = inviteText ?? `Bu ihaleye bak: ${title}${priceText ? ` (${priceText})` : ""} · İhaleal`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(fullUrl);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodedUrl}`;

  const copyText = async (value: string, onDone: () => void) => {
    try {
      await navigator.clipboard.writeText(value);
      onDone();
    } catch {
      const input = document.createElement("input");
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      onDone();
    }
  };

  const handleCopyLink = async () => {
    await copyText(fullUrl, () => setCopied(true));
  };

  const handleInstagram = async () => {
    await copyText(`${shareText}\n${fullUrl}`, () => setCopiedInvite(true));
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title,
        text: shareText,
        url: fullUrl,
      });
      setOpen(false);
    } catch {
      // user canceled native share
    }
  };

  const shareLinks: ShareLink[] = [
    {
      name: "WhatsApp",
      icon: <MessageCircle className="h-4 w-4" />,
      className: "bg-emerald-600 hover:bg-emerald-500",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: "X",
      icon: <ExternalLink className="h-4 w-4" />,
      className: "bg-slate-700 hover:bg-slate-600",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-4 w-4" />,
      className: "bg-blue-600 hover:bg-blue-500",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Telegram",
      icon: <Send className="h-4 w-4" />,
      className: "bg-sky-600 hover:bg-sky-500",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      name: "Instagram",
      icon: <Instagram className="h-4 w-4" />,
      className: "bg-fuchsia-600 hover:bg-fuchsia-500",
      href: "https://www.instagram.com/",
      onClick: () => void handleInstagram(),
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={className ?? "p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"}
        aria-label="Paylaşım seçeneklerini aç"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 p-4 rounded-2xl bg-[#0f1629] border border-slate-200 shadow-2xl z-50 animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">Paylaş</h4>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {(priceText || imageUrl) && (
              <div className="mb-3 rounded-xl border border-slate-200/80 bg-slate-950/50 p-2.5 text-xs text-slate-200">
                <p className="line-clamp-2 font-medium">{title}</p>
                {priceText ? <p className="mt-1 text-cyan-300">{priceText}</p> : null}
                {imageUrl ? <p className="mt-1 truncate text-slate-400">Görsel: {imageUrl}</p> : null}
              </div>
            )}

            {navigator.share ? (
              <button
                type="button"
                onClick={() => void handleNativeShare()}
                className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/25"
              >
                <Share2 className="h-4 w-4" />
                Cihaz paylaşımını aç
              </button>
            ) : null}

            <div className="grid grid-cols-3 gap-2 mb-4">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${link.className} text-white transition-all`}
                  onClick={() => {
                    link.onClick?.();
                    setOpen(false);
                  }}
                >
                  {link.icon}
                  <span className="text-[10px] font-medium">{link.name}</span>
                </a>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={fullUrl}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-200 text-xs text-slate-400 truncate"
              />
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${copied ? "bg-emerald-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
                aria-label="Bağlantıyı kopyala"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setShowQr((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
              >
                <QrCode className="h-3.5 w-3.5" />
                {showQr ? "QR gizle" : "QR göster"}
              </button>
              {copiedInvite ? <span className="text-emerald-300">Instagram için metin kopyalandı</span> : null}
            </div>
            {showQr ? (
              <div className="mt-2 rounded-xl border border-slate-200/80 bg-slate-950/50 p-2">
                <img src={qrSrc} alt="Paylaşım QR kodu" width={180} height={180} className="mx-auto rounded-lg" />
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
