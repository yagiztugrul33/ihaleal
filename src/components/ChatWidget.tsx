import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiAssistantAvatar } from "@/components/AiAssistantAvatar";
import { formatBidBondPercent } from "@/lib/fees";

const ASSISTANT_NAME = "İhaleAI Asistan";

const AI_RESPONSES: Record<string, string> = {
  merhaba:
    `Merhaba! Ben ${ASSISTANT_NAME} — ihaleal.com için gayrimenkul ihaleleri, analiz ve mortgage konularında yardımcı olabilirim.`,
  fiyat: "İlan fiyatlarını karşılaştırmak için detay sayfasındaki grafikleri inceleyebilirsiniz. AI tahminleri demo bandında gösterilir.",
  kredi: "Mortgage hesaplayıcı sayfamızdan aylık taksit ve toplam maliyeti hesaplayabilirsiniz.",
  teklif: "Teklif vermek için ilan detayındaki Teklif Ver butonunu kullanın.",
  bodrum: "Bodrum ve Muğla hattında turizm gayrimenkulü için örnek ilanları listeleyebilirim.",
  istanbul: "İstanbul için kurumsal ve konut segmentinde örnek ilanlar listelenir.",
  getiri: "Kira getirisi bölgelere göre değişir; Analytics sayfasında şehir bazlı özet bulunur.",
  yatırım: "Yatırım skoru 85+ örnekleri Analytics → Yatırım Fırsatları sekmesinde sıralanır.",
  güvenli: `Teklifler demo çizgisinde şifreli iletim hedeflenir. Kazanan için ${formatBidBondPercent()} teminat referansı fees.ts üzerinden gösterilir.`,
  default: "Analytics veya ilan detayından devam edebilirsiniz. Başka bir konuda yardım ister misiniz?",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, value] of Object.entries(AI_RESPONSES)) {
    if (lower.includes(key)) return value;
  }
  return AI_RESPONSES.default;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([{ role: "ai", text: AI_RESPONSES.merhaba }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const peekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(
    () => () => {
      if (peekTimer.current) clearTimeout(peekTimer.current);
    },
    []
  );

  const schedulePeek = () => {
    if (open) return;
    if (peekTimer.current) clearTimeout(peekTimer.current);
    peekTimer.current = setTimeout(() => setPeek(true), 120);
  };

  const hidePeek = () => {
    if (peekTimer.current) clearTimeout(peekTimer.current);
    setPeek(false);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: getAIResponse(userMsg) }]);
      setTyping(false);
    }, 800);
  };

  return (
    <>
      {!open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
          onMouseEnter={schedulePeek}
          onMouseLeave={hidePeek}
        >
          {peek && (
            <div className="chat-widget-pop w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-cyan-400/30 bg-[#0c1629]/95 backdrop-blur-xl shadow-2xl shadow-cyan-900/40 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-3 mb-3">
                <AiAssistantAvatar size="sm" />
                <div>
                  <div className="text-sm font-bold text-white">{ASSISTANT_NAME}</div>
                  <div className="text-[11px] text-cyan-200/90 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse motion-reduce:animate-none" />
                    Çevrimiçi · yapay zeka önerileri
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                İhale, analiz ve mortgage hakkında soru sorabilirsiniz; hızlı yanıtlar demo modunda üretilir.
              </p>
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-semibold shadow-lg shadow-cyan-900/50 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 motion-reduce:hover:scale-100"
                onClick={() => {
                  hidePeek();
                  setOpen(true);
                }}
              >
                Sohbeti aç
              </Button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="chat-fab flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600/95 via-blue-600/95 to-cyan-500/95 pl-2 pr-4 sm:pr-5 py-2 border border-white/20 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-400/45 hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 text-white motion-reduce:hover:scale-100 ring-2 ring-white/10 hover:ring-cyan-400/30"
            aria-label={`${ASSISTANT_NAME} sohbet`}
          >
            <AiAssistantAvatar size="md" className="ring-2 ring-black/20 shadow-inner" />
            <span className="hidden sm:inline font-bold text-sm tracking-tight bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
              {ASSISTANT_NAME}
            </span>
            <MessageCircle className="w-5 h-5 opacity-90 sm:hidden" aria-hidden />
          </button>
        </div>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[500px] bg-[#0c1629]/98 backdrop-blur-xl border border-cyan-400/25 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden ring-1 ring-white/10 chat-widget-pop">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-600/20 via-blue-600/15 to-cyan-500/15 relative overflow-hidden">
            <div className="absolute inset-0 bg-[length:200%_100%] bg-[linear-gradient(105deg,transparent_40%,rgba(56,189,248,0.08)_50%,transparent_60%)] animate-shimmer-bg motion-reduce:hidden pointer-events-none opacity-70" />
            <div className="relative flex items-center gap-3">
              <AiAssistantAvatar size="md" />
              <div>
                <div className="text-sm font-bold text-white">{ASSISTANT_NAME}</div>
                <div className="text-xs text-cyan-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse motion-reduce:animate-none shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  Çevrimiçi
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="relative p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-200 hover:rotate-90 motion-reduce:hover:rotate-0"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 animate-fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${msg.role === "ai" ? "bg-gradient-to-br from-blue-600/40 to-cyan-500/25 ring-1 ring-cyan-400/25" : "bg-white/10 ring-1 ring-white/10"}`}
                >
                  {msg.role === "ai" ? <Bot className="w-4 h-4 text-cyan-200" /> : <User className="w-4 h-4 text-slate-400" />}
                </div>
                <div
                  className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[260px] transition-all duration-300 hover:border-opacity-40 ${
                    msg.role === "ai"
                      ? "bg-white/[0.06] text-slate-200 border border-white/10 shadow-inner shadow-black/20"
                      : "bg-gradient-to-br from-blue-600/25 to-indigo-600/20 text-white border border-blue-400/25 shadow-lg shadow-blue-900/20"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2.5 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600/40 to-cyan-500/25 ring-1 ring-cyan-400/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse motion-reduce:animate-none" />
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400/80 animate-bounce motion-reduce:animate-none" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-cyan-400/80 animate-bounce motion-reduce:animate-none" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-cyan-400/80 animate-bounce motion-reduce:animate-none" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {messages.length < 3 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {["Fiyat analizi", "Kredi hesapla", "İstanbul", "Yatırım skoru"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] text-xs text-slate-400 hover:bg-white/12 hover:text-white hover:scale-[1.03] active:scale-[0.98] border border-white/5 hover:border-cyan-400/20 transition-all duration-200 motion-reduce:hover:scale-100"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-white/10 flex gap-2 bg-black/20">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Sorunuzu yazın…"
              className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/30 transition-shadow duration-200"
            />
            <Button
              size="sm"
              onClick={sendMessage}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white px-3 h-10 shadow-lg shadow-cyan-900/40 hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all duration-300 motion-reduce:hover:scale-100"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
