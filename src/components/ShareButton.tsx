import { useState } from "react";
import { Share2, X, Copy, Check, Facebook, Twitter, Linkedin, Mail } from "lucide-react";

interface ShareButtonProps {
  title: string;
  url: string;
  inviteText?: string;
  className?: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl =
    typeof window !== "undefined"
      ? url.startsWith("/")
        ? `${window.location.origin}/#${url}`
        : `${window.location.origin}${url}`
      : url;
  const shareText = `${title} - İhaleal.com'da`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = fullUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLinks = [
    { name: "Facebook", icon: <Facebook className="w-4 h-4" />, color: "bg-blue-600 hover:bg-blue-500", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}` },
    { name: "Twitter", icon: <Twitter className="w-4 h-4" />, color: "bg-sky-500 hover:bg-sky-400", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}` },
    { name: "LinkedIn", icon: <Linkedin className="w-4 h-4" />, color: "bg-blue-700 hover:bg-blue-600", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}` },
    { name: "E-posta", icon: <Mail className="w-4 h-4" />, color: "bg-slate-600 hover:bg-slate-500", href: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(fullUrl)}` },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="İlanı paylaş"
        aria-haspopup="menu"
        aria-expanded={open}
        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-900 transition-all"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
            role="button"
            tabIndex={-1}
            aria-label="Paylaş menüsünü kapat"
          />
          <div className="absolute end-0 top-full mt-2 w-72 p-4 rounded-2xl bg-[#0f1629] border border-slate-200 shadow-2xl z-50 animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">Paylaş</h4>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Paylaş menüsünü kapat"
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${link.color} text-white transition-all`}
                  onClick={() => setOpen(false)}
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
                onClick={handleCopy}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${copied ? "bg-emerald-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
