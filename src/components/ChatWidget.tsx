import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBidBondPercent } from "@/lib/fees";

const AI_RESPONSES: Record<string, string> = {
  merhaba:
    "Merhaba! Ben Kimi Agent — ihaleal.com için gayrimenkul ihaleleri, analiz ve mortgage konularında yardımcı olabilirim.",
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

  useEffect(() => () => {
    if (peekTimer.current) clearTimeout(peekTimer.current);
  }, []);

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
            <div className="w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-cyan-400/25 bg-[#0c1629]/95 backdrop-blur-xl shadow-2xl shadow-cyan-900/30 p-4 animate-scale-in">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-lg">K</span>
                <div>
                  <div className="text-sm font-bold text-white">Kimi Agent</div>
                  <div className="text-[11px] text-cyan-200/90">Çevrimiçi</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">Reports, slides, sites, sheets... consider it done.</p>
              <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-semibold" onClick={() => { hidePeek(); setOpen(true); }}>
                Sohbeti aç
              </Button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600/95 to-cyan-500/95 pl-2 pr-4 sm:pr-5 py-2 border border-white/15 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] transition-all text-white"
            aria-label="Kimi Agent sohbet"
          >
            <span className="w-11 h-11 rounded-full bg-black/20 flex items-center justify-center font-bold text-lg ring-2 ring-white/25">K</span>
            <span className="hidden sm:inline font-bold text-sm tracking-tight">Kimi Agent</span>
            <MessageCircle className="w-5 h-5 opacity-90 sm:hidden" aria-hidden />
          </button>
        </div>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[500px] bg-[#0c1629]/98 backdrop-blur-xl border border-cyan-400/20 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden animate-scale-in">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-600/15 to-cyan-500/15">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg">K</div>
              <div>
                <div className="text-sm font-bold text-white">Kimi Agent</div>
                <div className="text-xs text-cyan-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Çevrimiçi
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === "ai" ? "bg-blue-500/25" : "bg-white/10"}`}>
                  {msg.role === "ai" ? <Bot className="w-4 h-4 text-cyan-300" /> : <User className="w-4 h-4 text-slate-400" />}
                </div>
                <div className={`p-2.5 rounded-xl text-sm leading-relaxed max-w-[260px] ${msg.role === "ai" ? "bg-white/[0.05] text-slate-200 border border-white/10" : "bg-blue-500/15 text-white border border-blue-500/25"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/25 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                </div>
                <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {messages.length < 3 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {["Fiyat analizi", "Kredi hesapla", "İstanbul", "Yatırım skoru"].map((s) => (
                <button key={s} type="button" onClick={() => setInput(s)} className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Reports, slides, sites, sheets... consider it done."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500/35"
            />
            <Button size="sm" onClick={sendMessage} className="bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white px-3 h-9 shadow-lg shadow-cyan-900/40">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
