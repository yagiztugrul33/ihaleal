import { useState, useRef, useEffect, type ComponentType } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  LineChart,
  Landmark,
  MapPin,
  Crosshair,
  Shield,
  Percent,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiAssistantAvatar } from "@/components/AiAssistantAvatar";
import { formatBidBondPercent } from "@/lib/fees";

const ASSISTANT_NAME = "İhaleAI Asistan";

const AI_DEFAULT =
  "Endeks (/analiz), ilan detayı veya mortgage sayfasından devam edebilirsiniz. Anahtar kelimeyle tekrar sorabilirsiniz.";

const AI_RULES: { keys: string[]; reply: string }[] = [
  {
    keys: ["merhaba", "selam", "hey", "günaydın"],
    reply: `Merhaba. Ben ${ASSISTANT_NAME} — ihale akışı, piyasa endeksi ve mortgage tarafında yönlendirme yaparım (demo yanıtlar).`,
  },
  {
    keys: ["analiz", "endeks", "analytics", "grafik", "rapor"],
    reply:
      "Piyasa özeti için /analiz sayfasındaki şehir kartları ve sekmeleri kullanın; skorlar demo veridir, hukuki kesinlik için ekspertiz gerekir.",
  },
  {
    keys: ["harita", "konum", "bölge"],
    reply: "/harita üzerinden ilan yoğunluğu ve bölge seçimi yapılabilir; detaylı kıyas için /karsilastir.",
  },
  {
    keys: ["karşılaştır", "kıyas", "compare"],
    reply: "İki ilanı yan yana görmek için /karsilastir — fiyat bandı ve m² metrikleri demo katalogdan gelir.",
  },
  {
    keys: ["fiyat", "m2", "metrekare", "tahmin"],
    reply: "İlan kartında m² fiyatı ve AI tahmin bandı (varsa) gösterilir; teklif öncesi resmi değerleme önerilir.",
  },
  {
    keys: ["kredi", "mortgage", "taksit", "faiz"],
    reply: "/mortgage ile aylık taksit ve toplam maliyet simülasyonu yapılabilir; banka onayı ayrıdır.",
  },
  {
    keys: ["teklif", "ihale", "bodrum", "muğla", "istanbul", "ankara"],
    reply: "Teklif için ilan detayındaki akışı kullanın; şehir bazlı örnek ilanlar listede filtrelenir.",
  },
  {
    keys: ["getiri", "kira", "yield"],
    reply: "Kira getirisi şehir ve segmente göre değişir; /analiz içinde getiri sekmesi ve simülatör bölümüne bakın.",
  },
  {
    keys: ["yatırım", "skor", "fırsat"],
    reply: "Yatırım skoru yüksek örnekler /analiz → Yatırım Fırsatları sekmesinde sıralanır; risk profilinize göre filtreleyin.",
  },
  {
    keys: ["komisyon", "ücret", "bedel"],
    reply: "/komisyon-hesaplayici ve /hizmet-bedelleri sayfalarında matrah ve hizmet kalemleri özetlenir (demo).",
  },
  {
    keys: ["vergi", "tapu", "simülatör"],
    reply: "/araclar/vergi-simulator — Yİ-ÜFE için isteğe bağlı TCMB EVDS (Supabase Edge tcmb_yiufe); bilgilendirme, resmi hesap için YMM ve tapu sicil şarttır.",
  },
  {
    keys: ["kvkk", "gizlilik", "cerez"],
    reply: "/kvkk ve /gizlilik metinleri yasal çerçevedir; hesap ayarları /ayarlar altında yönetilir.",
  },
  {
    keys: ["anayasa", "400 madde", "400", "hukuk", "4734", "kik", "kanun maddesi"],
    reply:
      "400 maddelik özet çerçeve: /anayasa-400 (Anayasa + Kamu İhale Kanunu hatırlatıcıları, aranabilir). Sistem kuralları: /nihai-anayasa. Yasal taslak başlıkları: /yasal-cerceve. Bilgilendirme amaçlıdır; bağlayıcı hukuki görüş değildir.",
  },
  {
    keys: ["güvenlik", "şifre", "hesap"],
    reply: `Güvenlik merkezi: /guvenlik. Oturum Supabase Auth ile; teminat referansı demo: ${formatBidBondPercent()}.`,
  },
];

function getAIResponse(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const rule of AI_RULES) {
    if (rule.keys.some((k) => lower.includes(k))) return rule.reply;
  }
  return AI_DEFAULT;
}

const QUICK_PROMPTS: { label: string; fill: string; Icon: ComponentType<{ className?: string }> }[] = [
  { label: "Endeks", fill: "analiz özeti", Icon: LineChart },
  { label: "Mortgage", fill: "kredi taksiti", Icon: Landmark },
  { label: "Harita", fill: "harita yoğunluğu", Icon: MapPin },
  { label: "Kıyas", fill: "ilan karşılaştır", Icon: Crosshair },
  { label: "Komisyon", fill: "komisyon hesapla", Icon: Percent },
  { label: "Güven", fill: "güvenlik merkezi", Icon: Shield },
];

export function ChatWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: AI_RULES[0].reply },
  ]);
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

  useEffect(() => {
    if (peekTimer.current) clearTimeout(peekTimer.current);
    setPeek(false);
    setOpen(false);
  }, [location.pathname, location.search]);

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
            <div className="chat-widget-pop w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-cyan-500/25 bg-[#0b1426]/95 backdrop-blur-xl shadow-2xl shadow-black/50 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-3 mb-3">
                <AiAssistantAvatar size="sm" />
                <div>
                  <div className="text-sm font-bold text-white">{ASSISTANT_NAME}</div>
                  <div className="text-[11px] text-cyan-200/90 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
                    Çevrimiçi · demo yönlendirme
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Endeks, kredi ve ilan kıyası için kısa komutlar; aşağıdan paneli açıp detaylı sorabilirsiniz.
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
            className="flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600/95 via-blue-600/95 to-cyan-500/95 pl-2 pr-4 sm:pr-5 py-2 border border-white/20 shadow-xl shadow-black/40 hover:shadow-cyan-900/25 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 text-white motion-reduce:hover:scale-100 ring-1 ring-white/15 hover:ring-cyan-400/25"
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
        <div className="fixed bottom-6 right-6 z-50 w-[min(380px,calc(100vw-1.5rem))] max-h-[min(520px,85vh)] bg-[#0b1426]/98 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden ring-1 ring-white/10 chat-widget-pop">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-900/90 via-[#0d1830]/95 to-slate-900/90">
            <div className="flex items-center gap-3">
              <AiAssistantAvatar size="md" />
              <div>
                <div className="text-sm font-bold text-white">{ASSISTANT_NAME}</div>
                <div className="text-xs text-cyan-200/90 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/25" />
                  Hazır
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
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-sm bg-cyan-400/70 motion-safe:animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-sm bg-cyan-400/50 motion-safe:animate-pulse [animation-delay:120ms]" />
                    <span className="w-1.5 h-1.5 rounded-sm bg-cyan-400/35 motion-safe:animate-pulse [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {messages.length < 6 && (
            <div className="px-3 pb-2 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 px-1">Hızlı ifade</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map(({ label, fill, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setInput(fill)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] text-[11px] text-slate-300 hover:bg-cyan-500/10 hover:text-white border border-white/8 hover:border-cyan-500/25 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-400/90 shrink-0" aria-hidden />
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5 mt-2">
                <Link
                  to="/analiz"
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-300/90 hover:text-cyan-200 px-1 py-0.5"
                  onClick={() => setOpen(false)}
                >
                  <LayoutGrid className="w-3 h-3" aria-hidden />
                  Endeks
                  <ChevronRight className="w-3 h-3 opacity-70" aria-hidden />
                </Link>
                <Link
                  to="/harita"
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-300/90 hover:text-cyan-200 px-1 py-0.5"
                  onClick={() => setOpen(false)}
                >
                  <MapPin className="w-3 h-3" aria-hidden />
                  Harita
                  <ChevronRight className="w-3 h-3 opacity-70" aria-hidden />
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-300/90 hover:text-cyan-200 px-1 py-0.5"
                  onClick={() => {
                    setOpen(false);
                    navigate("/mortgage");
                  }}
                >
                  <Landmark className="w-3 h-3" aria-hidden />
                  Mortgage
                  <ChevronRight className="w-3 h-3 opacity-70" aria-hidden />
                </button>
                <Link
                  to="/anayasa-400"
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-300/90 hover:text-cyan-200 px-1 py-0.5"
                  onClick={() => setOpen(false)}
                >
                  <Shield className="w-3 h-3" aria-hidden />
                  400 madde
                  <ChevronRight className="w-3 h-3 opacity-70" aria-hidden />
                </Link>
              </div>
            </div>
          )}

          <div className="p-3 border-t border-white/10 flex gap-2 bg-black/25">
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
