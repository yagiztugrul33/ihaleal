import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, TrendingUp, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBidBondPercent } from "@/lib/fees";

const AI_RESPONSES: Record<string, string> = {
  "merhaba": "Merhaba! Ben İhaleal.com AI Asistanı. Size gayrimenkul ihaleleri, yatırım analizleri ve kredi hesaplamaları konusunda yardımcı olabilirim. Nasıl yardımcı olabilirim?",
  "fiyat": "İlan fiyatlarını karşılaştırmak için detay sayfasındaki grafikleri inceleyebilirsiniz. AI tahminlerimiz %85-90 doğruluk oranına sahiptir.",
  "kredi": "Mortgage hesaplayıcı sayfamızdan aylık taksit ve toplam maliyeti hesaplayabilirsiniz. Peşinat oranı, vade ve faiz oranını ayarlayarak size özel plan oluşturabilirsiniz.",
  "teklif": "Teklif vermek için ilan detay sayfasındaki Teklif Ver butonuna tıklayın. Hızlı artış butonları (10K, 50K, 100K, 250K, 500K) ile kolayca teklif verebilirsiniz.",
  "bodrum": "Bodrum Yalıkavak'taki villamız şu anda en yüksek yatırım potansiyeline sahip ilanımız. Yıllık %28 değer artışı ve %8.2 kira getirisi öngörülüyor.",
  "istanbul": "İstanbul Levent'teki plaza katımız kurumsal kiracılı ve %7.2 kira getirisiyle stabil bir yatırım fırsatı sunuyor.",
  "getiri": "Kira getirisi, bölge ortalamalarına göre değişir. Antalya ve Muğla turizm bölgelerinde %7-8 getiri potansiyeli yüksekken, İstanbul büyükşehirde %5-6 bandındadır.",
  "yatırım": "AI Yatırım Fırsatları sayfamızda en iyi yatırım skoruna sahip ilanları görebilirsiniz. Skor 85+ olanlar 'Güçlü Al', 70-84 arası 'Al' olarak işaretlenmiştir.",
  "güvenli": `Tüm teklifler şifreli iletimle korunur. Kazanan teklif sahibinden ${formatBidBondPercent()} kapora alınır (fees.ts) ve ödemeler escrow hesap üzerinden güvenle gerçekleşir.`,
  "default": "Anladım! Daha fazla detay için ilan detay sayfasındaki AI Analiz sekmesini veya Analytics sayfasını inceleyebilirsiniz. Başka bir konuda yardımcı olabilir miyim?"
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, value] of Object.entries(AI_RESPONSES)) {
    if (lower.includes(key)) return value;
  }
  return AI_RESPONSES["default"];
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{role: "user" | "ai"; text: string}[]>([
    { role: "ai", text: AI_RESPONSES["merhaba"] }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

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
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-110 transition-all flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[500px] bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-teal-400/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Kimi Agent</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Reports, slides, sites, sheets... consider it done.
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === "ai" ? "bg-blue-500/20" : "bg-white/10"}`}>
                  {msg.role === "ai" ? <Bot className="w-4 h-4 text-blue-400" /> : <User className="w-4 h-4 text-slate-400" />}
                </div>
                <div className={`p-2.5 rounded-xl text-sm leading-relaxed max-w-[260px] ${msg.role === "ai" ? "bg-white/[0.03] text-slate-300 border border-white/5" : "bg-blue-500/15 text-white border border-blue-500/20"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          {messages.length < 3 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {["Fiyat analizi", "Kredi hesapla", "Bodrum villası", "İstanbul fırsatları"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Reports, slides, sites, sheets... consider it done."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <Button size="sm" onClick={sendMessage} className="bg-blue-500 hover:bg-blue-400 text-white px-3 h-9">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
