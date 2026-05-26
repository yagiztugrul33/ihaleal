import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bot, HelpCircle, MessageCircle, Send, Sparkles, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiAssistantAvatar } from "@/components/AiAssistantAvatar";
import { buildAssistantReply, CHAT_GUIDE_CHIPS } from "@/lib/ai/assistantEngine";
import { type AssistantAction, LIVE_AI_NOTE } from "@/lib/ai/knowledgeBase";
import { invokeSystemQa, type SystemQaTurn } from "@/lib/systemQaClient";

const ASSISTANT_NAME = "İhaleAI";
const QA_MODE_STORAGE = "ihaleal-chat-qa-mode";

type ChatMode = "guide" | "qa";
type ChatMessage = {
  role: "user" | "ai";
  text: string;
  actions?: AssistantAction[];
};

const GUIDE_INTRO = `Ben ${ASSISTANT_NAME} — gayrimenkulün her şeyini bilirim. Borsa, teklif, emsal, imar, değerleme... sor, yönlendireyim.`;
const BORSA_INTRO =
  "İhaleAI — Borsa Uzmanı modunda: emir defteri (order book), alış-satış aralığı (spread), likidite, teklif stratejisi, emsal/imar, komisyon ve hukuki notları tek panelde yönlendiririm.";
const QA_INTRO = [
  `${GUIDE_INTRO}`,
  "",
  "Soru–cevap modunda mümkünse sunucu tarafı yanıtı kullanılır.",
  "Her yanıtta bir sonraki adım aksiyonu sunarım.",
  LIVE_AI_NOTE,
].join("\n");

function readStoredChatMode(): ChatMode {
  try {
    return sessionStorage.getItem(QA_MODE_STORAGE) === "qa" ? "qa" : "guide";
  } catch {
    return "guide";
  }
}

function toQaThread(msgs: ChatMessage[]): SystemQaTurn[] {
  return msgs.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
}

function buildQaFailText(code: string): string {
  if (code === "supabase_not_configured") {
    return "Soru–cevap servisi şu an hazır değil. Kural tabanlı güvenli yanıta geçtim.";
  }
  if (code === "invalid_thread") return "Sohbet geçmişi okunamadı. Kural tabanlı güvenli yanıta geçtim.";
  return `Soru–cevap tamamlanamadı (kod: ${code}). Kural tabanlı güvenli yanıta geçtim.`;
}

export function ChatWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>(() => readStoredChatMode());
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", text: readStoredChatMode() === "qa" ? QA_INTRO : GUIDE_INTRO, actions: [{ label: "İlanlara geç", to: "/ilanlar" }] },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const isBorsaRoute = location.pathname.startsWith("/borsa");
  const liveIntro = isBorsaRoute ? BORSA_INTRO : GUIDE_INTRO;
  const liveQaIntro = [liveIntro, "", "Soru–cevap modunda mümkünse sunucu tarafı yanıtı kullanılır.", "Her yanıtta bir sonraki adım aksiyonu sunarım.", LIVE_AI_NOTE].join(
    "\n",
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  const applyChatMode = (mode: ChatMode) => {
    setChatMode(mode);
    try {
      sessionStorage.setItem(QA_MODE_STORAGE, mode);
    } catch {
      /* ignore */
    }
    setMessages([{ role: "ai", text: mode === "qa" ? liveQaIntro : liveIntro, actions: [{ label: "Borsa terminali", to: "/borsa" }] }]);
  };

  const openPanel = (mode: ChatMode) => {
    applyChatMode(mode);
    setOpen(true);
  };

  const handleAction = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  const sendUserMessage = async (raw: string) => {
    const userMsg = raw.trim();
    if (!userMsg) return;
    const fallback = buildAssistantReply(userMsg);
    const next = [...messages, { role: "user" as const, text: userMsg }];
    setMessages(next);
    setInput("");
    setTyping(true);

    if (chatMode === "qa") {
      const res = await invokeSystemQa(toQaThread(next));
      setTyping(false);
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: `${res.text}\n\nSonraki adım: aşağıdaki aksiyonlardan birini seç.`,
            actions: fallback.actions,
          },
        ]);
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `${buildQaFailText(res.code)}\n\n${fallback.text}`,
          actions: fallback.actions,
        },
      ]);
      return;
    }

    window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: fallback.text, actions: fallback.actions }]);
      setTyping(false);
    }, 350);
  };

  return (
    <>
      {!open ? (
        <div className={`fixed z-[120] flex flex-col items-end ${isBorsaRoute ? "bottom-20 sm:bottom-6" : "bottom-20 sm:bottom-6"} right-4 sm:right-5`}>
          <button
            type="button"
            onClick={() => openPanel("guide")}
            className="group relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/55 bg-slate-950/95 text-cyan-100 shadow-xl shadow-black/45 transition hover:-translate-y-0.5 hover:border-cyan-300/80"
            aria-label={`${ASSISTANT_NAME} sohbet`}
          >
            <span className="pointer-events-none absolute -inset-1.5 rounded-full border border-cyan-400/40 motion-safe:animate-pulse" />
            <AiAssistantAvatar size="md" className="ring-1 ring-black/30 shadow-inner" />
            <MessageCircle className="absolute -right-1 -top-1 h-4 w-4 rounded-full border border-cyan-300/60 bg-slate-900 p-[1px] text-cyan-100" aria-hidden />
          </button>
          <span className="mt-2 hidden rounded-full border border-cyan-500/25 bg-slate-950/90 px-2.5 py-1 text-[11px] font-semibold text-cyan-100 sm:inline-flex">
            {isBorsaRoute ? "İhaleAI Borsa Uzmanı" : "İhaleAI"}
          </span>
        </div>
      ) : (
        <div
          className={`ai-dock-panel chat-widget-pop fixed z-[120] flex max-h-[84vh] w-[min(420px,calc(100vw-1rem))] flex-col overflow-hidden right-2 sm:right-5 ${
            isBorsaRoute ? "bottom-20 sm:bottom-5" : "bottom-20 sm:bottom-5"
          }`}
        >
          <div className="space-y-3 border-b border-white/10 bg-gradient-to-r from-blue-950/85 via-slate-900/95 to-slate-950 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <AiAssistantAvatar size="md" />
                <div>
                  <p className="text-sm font-bold text-white">{isBorsaRoute ? `${ASSISTANT_NAME} — Borsa Uzmanı` : ASSISTANT_NAME}</p>
                  <p className="text-[11px] text-cyan-200">
                    {chatMode === "qa" ? "Soru–cevap + aksiyon" : "Yönlendirme + aksiyon"} · {isBorsaRoute ? "Borsa Derin Mod" : "Platform Mod"}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Kapat">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex rounded-lg border border-slate-700 bg-black/30 p-0.5">
              <button
                type="button"
                onClick={() => applyChatMode("guide")}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold ${chatMode === "guide" ? "bg-cyan-500/25 text-white" : "text-slate-300"}`}
              >
                Yönlendirme
              </button>
              <button
                type="button"
                onClick={() => applyChatMode("qa")}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold ${chatMode === "qa" ? "bg-violet-500/30 text-white" : "text-slate-300"}`}
              >
                Soru–cevap
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-950/40 p-4">
            {messages.map((msg, i) => (
              <div key={`${msg.role}-${i}`} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${msg.role === "ai" ? "bg-cyan-500/20 text-cyan-200" : "bg-white/10 text-slate-300"}`}>
                  {msg.role === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`max-w-[420px] rounded-2xl border p-3 ${msg.role === "ai" ? "border-white/10 bg-white/[0.06] text-slate-100" : "border-blue-400/25 bg-blue-600/30 text-white"}`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                  {msg.role === "ai" && msg.actions?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.actions.map((action) => (
                        <button
                          key={`${i}-${action.to}-${action.label}`}
                          type="button"
                          onClick={() => handleAction(action.to)}
                          className="rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {typing ? (
              <div className="flex gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-200">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-sm text-slate-200">Yanıt hazırlanıyor...</div>
              </div>
            ) : null}
          </div>

          {messages.length < 8 ? (
            <div className="space-y-2 border-t border-slate-800 px-3 pt-3">
              <p className="px-1 text-[10px] uppercase tracking-wider text-slate-400">Hızlı yanıt chip’leri</p>
              <div className="flex flex-wrap gap-1.5 pb-2">
                {CHAT_GUIDE_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => void sendUserMessage(chip.fill)}
                    className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-[11px] text-slate-200 hover:border-cyan-400/30 hover:bg-cyan-500/10"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex gap-2 border-t border-slate-800 bg-black/25 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void sendUserMessage(input);
              }}
              placeholder="Sorunu yaz, aksiyona yönlendireyim…"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-500/20"
            />
            <Button size="sm" onClick={() => void sendUserMessage(input)} className="h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 px-3 text-white">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
