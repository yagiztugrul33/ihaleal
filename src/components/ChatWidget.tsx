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
  Banknote,
  MapPin,
  Crosshair,
  Shield,
  Percent,
  BadgePercent,
  LayoutGrid,
  ChevronRight,
  Smartphone,
  HelpCircle,
  Calendar,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiAssistantAvatar } from "@/components/AiAssistantAvatar";
import { formatBidBondPercent } from "@/lib/fees";
import { KKA_HUB_PATH, KKA_STUDIO_PATH } from "@/lib/kkaHub";
import { PLATFORM_FRAMEWORK_PATH } from "@/constants/platformFramework";
import { KKA_SERVICE_POOL_RATE_EX_VAT, KKA_SERVICE_POOL_VAT_RATE } from "@/lib/masterFinancialEngine";
import { invokeSystemQa, type SystemQaTurn } from "@/lib/systemQaClient";

const ASSISTANT_NAME = "İhaleAI Asistan";

const QA_MODE_STORAGE = "ihaleal-chat-qa-mode";

/** Soru–cevap sekmesi: ilk mesaj */
const QA_INTRO = [
  "Soru–cevap modunda sorunuz önce bilgi bankasıyla eşleştirilir; üretim ortamında Supabase Edge işlevi `ai_qa` ve OpenAI ile bağlamlı yanıt üretilir.",
  "",
  "Uç nokta kullanılamıyorsa veya istek tamamlanamazsa, aynı giriş için Hızlı yönlendirme sekmesindeki anahtar kelime motoruyla özdeş yerleşik özet gösterilir; böylece her iki sekmede de aynı özet standardı korunur.",
  "",
  "Kapsam: komisyon, KKA, kiralık ve devren, güvenlik ile sayfa yönlendirmeleri. Hukuki kesinlik için yayımlanan sözleşme ve şartnameler ile uzman görüşü esastır.",
  "",
  "Piyasa bütünlüğü: asistan, platform dışı kapora, şahsi IBAN veya WhatsApp üzerinden aradan kapanma gibi yöntemleri kolaylaştırmaz; lansman ve ön satışta teknik şartname ile ilan metninin uyumu ve resmi akışlar için /ihale-kosullari, /evraklar ve /yasal/dolandiricilik-savunmasi sayfalarına yönlendirir.",
].join("\n");

/** Yönlendirme sekmesi: ilk mesaj (merhaba kuralından ayrı, açıklayıcı) */
const GUIDE_INTRO = [
  `Merhaba, ben ${ASSISTANT_NAME}.`,
  "",
  "Hızlı yönlendirme modunda girdiğiniz ifadeler, önceden tanımlı anahtar kelime kurallarıyla eşleştirilir; kısa yanıt ve rota önerisi sunulur. Bu mod canlı veri veya üretken dil modeli kullanmaz.",
  "",
  "Paragraflı, bağlamlı yanıt için Soru–cevap sekmesine geçebilirsiniz. Sunucu tarafı hazırsa model yanıtı üretilir; aksi halde yine aynı yerleşik özet gösterilir.",
  "",
  "Platform dışı ödeme veya aradan anlaşma taleplerinde yalnızca yasal metinlere yönlendirme yapılır; /yasal/dolandiricilik-savunmasi ve /ihale-kosullari özet çerçevedir.",
].join("\n");

const AI_DEFAULT =
  "Sorunuzu birkaç kelimeyle yeniden ifade edebilir veya /analiz, ilan detayı ve /mortgage sayfalarına yönelebilirsiniz.";

/** Yerel özet — tam AI (`ai_qa`) yokken veya yönlendirme modunda */
const BIDDING_RULES_REPLY = [
  "Teklif verme (hedef platform davranışı; ilan şartnamesi ve sözleşme önceliklidir):",
  "• İlan moduna göre akış: yalnız vitrin, kapalı teklif veya canlı artırma — teklif düğmesi ve formlar ilan detayında.",
  "• Geçerli tutar: ekranda gösterilen minimum artış ve zaman penceresine uygun olmalı; hızlı artış butonları yardımcıdır.",
  "• Onaylanan teklif geri alınamaz; canlı ihalede tipik olarak yalnızca bir öncekinden yüksek teklif verilebilir.",
  "• Son saniyede verilen teklifte süre uzatılıp uzatılmayacağı ilan / ihale koşullarında yazar.",
  "• Teminat, üyelik ve ödeme adımları ilan ile yasal metinlere tabidir (demo ortamda kayıtlar sınırlı olabilir).",
  "• Sahte veya oyun amaçlı teklif yasaktır; tespitte hesap kısıtı ve sözleşmedeki yaptırımlar geçerlidir (hedef).",
  "",
  "Ayrıntılı anlatım: /nasil-calisir?yol=alici — yasal çerçeve: /ihale-kosullari — canlı örnek ilanlar: /ihaleler (şehir filtreleri).",
].join("\n");

const BIDDING_RULE_KEYS = [
  "teklif verme",
  "teklif kurall",
  "teklif kuralı",
  "teklif kurali",
  "teklif nasıl",
  "teklif nasil",
  "teklif vermek",
  "teklif süreci",
  "teklif sureci",
  "minimum artış",
  "minimum artis",
  "bağlayıcı teklif",
  "baglayici teklif",
  "teklif geri",
  "teklif iptal",
  "kapalı teklif",
  "kapali teklif",
  "ihale kurall",
  "teklif bağlayıcılık",
  "teklif baglayicilik",
];

const INTEGRITY_BYPASS_REPLY = [
    "Ihaleal, teklif, rezervasyon ve ödemelerin resmi akışlar üzerinden yürütülmesini hedefler; platformu baypas ederek kapora, şahsi hesap veya dış kanalla kapanış önerilmez.",
    "",
    "Muteahhit lansman ve ön satışlarda ilan metni, teknik şartname ve tapu / irtifak senaryosu birlikte değerlendirilmelidir; çelişki veya eksik dokümanda yasal danışmanlık ve resmi inceleme şarttır.",
    "",
    "Özet mimari ve delil çizgisi: /yasal/dolandiricilik-savunmasi — ihale ve AML çerçeve: /ihale-kosullari — zorunlu evraklar: /evraklar.",
  ].join("\n");

const AI_RULES: { keys: string[]; reply: string }[] = [
  {
    keys: [
      "aradan cik",
      "aradan çık",
      "aradan anlas",
      "aradan anlaş",
      "platform disi",
      "platform dışı",
      "platformdısı",
      "dışı kapora",
      "disi kapora",
      "uc kagit",
      "üç kağıt",
      "sahsi iban",
      "şahsi iban",
      "whatsapp kapora",
      "lansman on satis",
      "lansman ön satış",
      "ihaleal baypas",
      "platformu atla",
    ],
    reply: INTEGRITY_BYPASS_REPLY,
  },
  {
    keys: ["merhaba", "selam", "hey", "günaydın"],
    reply: `Merhaba. Ben ${ASSISTANT_NAME}; ihale akışı, endeks ve mortgage konularında kısa yönlendirme yaparım. Paragraflı yanıt için Soru–cevap sekmesine geçebilirsiniz; sunucu tarafı hazırsa model yanıtı üretilir.`,
  },
  {
    keys: BIDDING_RULE_KEYS,
    reply: BIDDING_RULES_REPLY,
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
    keys: ["gelir modeli", "gelir", "emlakçı payı", "emlakçı payi", "b2b pay", "ortak emlak"],
    reply:
      "Gelir modeli ve emlakçı ağı özeti: /komisyon-modeli (senaryo tablosu, pay kademeleri, mahsup). Canlı rakam için /komisyon-hesaplayici; hizmet kalemleri /hizmet-bedelleri (demo).",
  },
  {
    keys: [
      "kka",
      "kat karşılığı",
      "kat karsiligi",
      "kat karsılığı",
      "arsa karşılığı",
      "arsa karsiligi",
      "rayiç havuz",
      "rayic havuz",
      "imar stüdyosu",
      "imar studyosu",
      "parsel stüdyo",
      "ada parsel",
    ],
    reply: `Kat karşılığı (KKA) demosu ve hak ediş projeksiyonu: ${KKA_HUB_PATH} — ada/parsel ve imar kabataslak stüdyosu: ${KKA_STUDIO_PATH}. Rayıç havuzu (MASTER_RULES, komisyon motoru ile aynı oranlar): %${(KKA_SERVICE_POOL_RATE_EX_VAT * 100).toFixed(0)} + KDV %${(KKA_SERVICE_POOL_VAT_RATE * 100).toFixed(0)}; gelir çizgisi: /komisyon-modeli.`,
  },
  {
    keys: ["komisyon", "ücret", "bedel"],
    reply: "Önce strateji: /komisyon-modeli — ardından /komisyon-hesaplayici (matrah, KDV, kiralık/satılık). Hizmet bedelleri: /hizmet-bedelleri (demo).",
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
    keys: ["anayasa", "400 madde", "400", "hukuk", "4734", "kik", "kanun maddesi", "platform çerçeve", "platform cerceve"],
    reply:
      "Birleşik çerçeve: /platform-cerceve (eski /anayasa-400 yönlendirilir) — ilk blok İhaleAL platform kuralları (Nihai + fees / MASTER_RULES özetleri); 201–400 aralığı 4734 hatırlatıcıları. Tam sistem kuralları: /nihai-anayasa. Yasal taslak: /yasal-cerceve. Bilgilendirme amaçlıdır.",
  },
  {
    keys: ["güvenlik", "şifre", "hesap"],
    reply: `Güvenlik merkezi: /güvenlik. Oturum Supabase Auth ile; teminat referansı demo: ${formatBidBondPercent()}.`,
  },
  {
    keys: ["telefon", "mobil", "lokal", "localhost", "5173", "wifi", "wi-fi", "aynı ağ", "geliştirici"],
    reply:
      "Yerelde telefondan erişim: bilgisayarda `npm run dev` çalışsın (projede Vite `--host` ile LAN erişimi açıktır). Başka bir terminalde `npm run dev:mobile-url` çalıştırın; ekranda `http://192.168.x.x:5173/#/` gibi bir adres görünür. Telefon ile bilgisayarın aynı Wi-Fi ağında olduğundan emin olun. Windows Güvenlik Duvarında 5173 için gelen bağlantı izni gerekebilir.",
  },
];

function getAIResponse(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const rule of AI_RULES) {
    if (rule.keys.some((k) => lower.includes(k))) return rule.reply;
  }
  return AI_DEFAULT;
}

function buildQaFailureReply(userMsg: string, code: string, detail?: string): string {
  const body = getAIResponse(userMsg);

  if (code === "supabase_not_configured") {
    return [
      "Durum: Soru–cevap uç noktasına (Supabase + Edge `ai_qa`) şu an erişilemiyor. Bu genellikle istemci ortam değişkenlerinin eksik olması veya Edge işlevinin dağıtılmamış olmasından kaynaklanır.",
      "",
      "Yerleşik yanıt (Hızlı yönlendirme ile aynı anahtar kelime eşlemesi):",
      "",
      body,
      "",
      "Üretim kontrol listesi: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`; `supabase functions deploy ai_qa`; OpenAI için `OPENAI_API_KEY` (Supabase Dashboard → Edge Functions → Secrets).",
    ].join("\n");
  }

  if (code === "invalid_thread") {
    return [
      "Sohbet geçmişi bu istek için beklenen biçimde değil. Paneli kapatıp yeniden açabilir veya doğrudan yeni bir soru yazabilirsiniz.",
      "",
      "Yerleşik yanıt:",
      "",
      body,
    ].join("\n");
  }

  return [
    "Yapay zeka yanıtı şu an tamamlanamadı.",
    `Hata kodu: ${code}.`,
    "",
    "Yerleşik özet (anahtar kelime eşlemesi):",
    "",
    body,
  ].join("\n");
}

const QUICK_PROMPTS: { label: string; fill: string; Icon: ComponentType<{ className?: string }> }[] = [
  { label: "Endeks", fill: "analiz özeti", Icon: LineChart },
  { label: "Gelir modeli", fill: "gelir modeli emlakçı komisyon", Icon: BadgePercent },
  { label: "Mortgage", fill: "kredi taksiti", Icon: Banknote },
  { label: "Harita", fill: "harita yoğunluğu", Icon: MapPin },
  { label: "Kıyas", fill: "ilan karşılaştır", Icon: Crosshair },
  { label: "Komisyon", fill: "komisyon hesapla", Icon: Percent },
  { label: "Güven", fill: "güvenlik merkezi dolandırıcılık mimarisi", Icon: Shield },
  { label: "Telefon (lokal)", fill: "telefon lokal nasıl bağlanır", Icon: Smartphone },
];

const QA_QUICK: { label: string; fill: string; Icon: ComponentType<{ className?: string }> }[] = [
  { label: "Teklif kuralları", fill: "teklif verme kuralları neler", Icon: Handshake },
  { label: "Neden var?", fill: "ihaleal sistemi neden var ne problemi çözüyor", Icon: HelpCircle },
  { label: "Haftalık ihale", fill: "ihaleler haftada bir mi ne zaman kapanıyor cut-off", Icon: Calendar },
  { label: "Evraklar", fill: "ihaleye katılmak için hangi evraklar zorunlu Findeks tapu ekspertiz", Icon: Shield },
  { label: "Komisyon", fill: "satışta komisyon oranları ve KDV nasıl hesaplanıyor", Icon: Percent },
  { label: "KKA", fill: "kat karşılığı KKA hizmet bedeli ve rayiç", Icon: Landmark },
  { label: "Kiralık", fill: "kiralık ve devren kira komisyonu ve devir bedeli ayrımı", Icon: LineChart },
  { label: "Bütünlük", fill: "platform dışı kapora ve aradan çıkma neden yasak lansman ön satış", Icon: Shield },
];

type ChatMode = "guide" | "qa";

function readStoredChatMode(): ChatMode {
  try {
    const v = sessionStorage.getItem(QA_MODE_STORAGE);
    return v === "qa" ? "qa" : "guide";
  } catch {
    return "guide";
  }
}

function toQaThread(msgs: { role: "user" | "ai"; text: string }[]): SystemQaTurn[] {
  return msgs
    .filter((m) => m.role === "user" || m.role === "ai")
    .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
}

export function ChatWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>(() => readStoredChatMode());
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: readStoredChatMode() === "qa" ? QA_INTRO : GUIDE_INTRO },
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

  const applyChatMode = (mode: ChatMode) => {
    setChatMode(mode);
    try {
      sessionStorage.setItem(QA_MODE_STORAGE, mode);
    } catch {
      /* ignore */
    }
    setMessages([{ role: "ai", text: mode === "qa" ? QA_INTRO : GUIDE_INTRO }]);
  };

  const openPanel = (mode: ChatMode) => {
    applyChatMode(mode);
    hidePeek();
    setOpen(true);
  };

  const sendUserMessage = async (raw: string) => {
    const userMsg = raw.trim();
    if (!userMsg) return;
    const next = [...messages, { role: "user" as const, text: userMsg }];
    setMessages(next);
    setInput("");
    setTyping(true);

    if (chatMode === "qa") {
      const thread = toQaThread(next);
      const res = await invokeSystemQa(thread);
      setTyping(false);
      if (res.ok) {
        setMessages((prev) => [...prev, { role: "ai", text: res.text }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: buildQaFailureReply(userMsg, res.code, res.detail) }]);
      }
      return;
    }

    window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: getAIResponse(userMsg) }]);
      setTyping(false);
    }, 500);
  };

  const sendMessage = () => void sendUserMessage(input);

  return (
    <>
      {!open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
          data-demo="true"
          onMouseEnter={schedulePeek}
          onMouseLeave={hidePeek}
        >
          {peek && (
            <div className="chat-widget-pop w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-cyan-500/25 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-black/50 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-3 mb-3">
                <AiAssistantAvatar size="sm" />
                <div>
                  <div className="text-sm font-bold text-white">{ASSISTANT_NAME}</div>
                  <div className="text-[11px] text-cyan-200/90 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
                    Hazır · yönlendirme ve soru–cevap
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Yönlendirme: anahtar kelimeye göre kısa özet. Soru–cevap: üretimde bilgi bankası ve model; uç nokta kapalıyken yine aynı yerleşik özet gösterilir.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-semibold shadow-lg shadow-violet-900/40 hover:shadow-fuchsia-500/25"
                  onClick={() => openPanel("qa")}
                >
                  <HelpCircle className="w-4 h-4 mr-2 shrink-0" aria-hidden />
                  Soru–cevap modu
                </Button>
              <Button
                size="sm"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-semibold shadow-lg shadow-cyan-900/50 hover:shadow-cyan-500/30"
                  onClick={() => openPanel("guide")}
                >
                  Hızlı yönlendirme
              </Button>
              </div>
            </div>
          )}
          <div className="flex items-end gap-2 rounded-full border border-slate-700/70 bg-slate-950/80 p-1.5 shadow-lg shadow-black/45 backdrop-blur">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openPanel("qa")}
              className="h-9 rounded-full border-slate-600/70 bg-slate-900/80 px-3 py-2 text-slate-200 shadow-none hover:border-violet-300/40 hover:bg-slate-800/90 hover:text-violet-100"
              aria-label="Soru-cevap modu"
            >
              <HelpCircle className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden lg:inline">Soru–cevap</span>
            </Button>
          <button
            type="button"
              onClick={() => openPanel("guide")}
              className="flex h-9 items-center gap-2 rounded-full border border-cyan-400/30 bg-slate-900/95 pl-2 pr-3 text-cyan-100 shadow-none transition-all duration-200 hover:border-cyan-300/60 hover:bg-slate-800/90 hover:text-white"
            aria-label={`${ASSISTANT_NAME} sohbet`}
          >
            <AiAssistantAvatar size="sm" className="ring-1 ring-black/30 shadow-inner" />
            <span className="hidden sm:inline text-xs font-semibold tracking-tight">
              {ASSISTANT_NAME}
            </span>
            <MessageCircle className="h-4 w-4 opacity-90 sm:hidden" aria-hidden />
          </button>
          </div>
        </div>
      )}

      {open && (
        <div className="ai-dock-panel fixed bottom-6 right-6 z-50 flex max-h-[min(520px,85vh)] w-[min(400px,calc(100vw-1.5rem))] flex-col overflow-hidden chat-widget-pop">
          <div className="space-y-3 border-b border-white/10 bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-slate-950/95 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
              <AiAssistantAvatar size="md" />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{ASSISTANT_NAME}</div>
                  <div className="text-[11px] text-cyan-200/90 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/25 shrink-0" />
                    <span className="truncate">
                      {chatMode === "qa"
                        ? "Soru–cevap · model + bilgi bankası; yoksa yerleşik özet"
                        : "Yönlendirme · anahtar kelime özeti"}
                    </span>
                  </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
                className="relative p-2 rounded-xl hover:bg-white/10 text-slate-500 hover:text-slate-900 transition-all duration-200 hover:rotate-90 motion-reduce:hover:rotate-0 shrink-0"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
            </div>
            <div className="flex rounded-lg bg-black/30 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => applyChatMode("guide")}
                className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                  chatMode === "guide" ? "bg-cyan-500/25 text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Yönlendirme
              </button>
              <button
                type="button"
                onClick={() => applyChatMode("qa")}
                className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                  chatMode === "qa" ? "bg-violet-500/30 text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Soru–cevap
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-950/40 p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 animate-fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${msg.role === "ai" ? "bg-gradient-to-br from-blue-600/40 to-cyan-500/25 ring-1 ring-cyan-400/25" : "bg-white/10 ring-1 ring-white/10"}`}
                >
                  {msg.role === "ai" ? <Bot className="w-4 h-4 text-cyan-200" /> : <User className="w-4 h-4 text-slate-400" />}
                </div>
                <div
                  className={`max-w-[260px] whitespace-pre-wrap break-words rounded-2xl border p-3 text-sm leading-relaxed transition-all duration-300 ${
                    msg.role === "ai"
                      ? "border-white/10 bg-white/[0.06] text-slate-200 shadow-inner shadow-black/20"
                      : "border-blue-400/25 bg-gradient-to-br from-blue-600/30 to-blue-500/10 text-white shadow-lg shadow-blue-900/30"
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
                <div className="p-3 rounded-2xl bg-white/[0.06] border border-slate-200">
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
              <p className="text-[10px] uppercase tracking-wider text-slate-500 px-1">
                {chatMode === "qa" ? "Örnek sorular" : "Hızlı ifade"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(chatMode === "qa" ? QA_QUICK : QUICK_PROMPTS).map(({ label, fill, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => void sendUserMessage(fill)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] text-[11px] text-slate-300 hover:bg-cyan-500/10 hover:text-white border border-white/8 hover:border-cyan-500/25 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-400/90 shrink-0" aria-hidden />
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-200/80 mt-2">
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
                  to="/komisyon-modeli"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-300/90 hover:text-emerald-200 px-1 py-0.5"
                  onClick={() => setOpen(false)}
                >
                  <BadgePercent className="w-3 h-3" aria-hidden />
                  Gelir modeli
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
                <Link
                  to={KKA_HUB_PATH}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-300/90 hover:text-emerald-200 px-1 py-0.5"
                  onClick={() => setOpen(false)}
                >
                  <Landmark className="w-3 h-3" aria-hidden />
                  KKA
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
                  <Banknote className="w-3 h-3" aria-hidden />
                  Mortgage
                  <ChevronRight className="w-3 h-3 opacity-70" aria-hidden />
                </button>
                <Link
                  to={PLATFORM_FRAMEWORK_PATH}
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-300/90 hover:text-cyan-200 px-1 py-0.5"
                  onClick={() => setOpen(false)}
                >
                  <Shield className="w-3 h-3" aria-hidden />
                  Platform çerçevesi
                  <ChevronRight className="w-3 h-3 opacity-70" aria-hidden />
                </Link>
              </div>
            </div>
          )}

          <div className="p-3 border-t border-slate-200 flex gap-2 bg-black/25">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void sendMessage();
              }}
              placeholder="Sorunuzu yazın…"
              className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-200 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/30 transition-shadow duration-200"
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
