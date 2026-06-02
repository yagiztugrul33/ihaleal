import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, FilePlus2, Gavel, ArrowLeft } from "lucide-react";

/**
 * Onboarding — "Nereden başlamak istersin?"
 *
 * Liderlerin deseni: önce değer gör, sürtünmeyi ihtiyaç anına ertele.
 *
 * 3 kart → gerçek rotalara yönlendirir; KYC/evrak/teminat sormaz.
 * Görsel disiplin: 60/30/10 (nötr zemin + lacivert gövde + amber vurgu).
 * RTL-hazır: Tailwind logical CSS (ms-/me-/ps-/pe-/text-start) — gelecekte
 * Arapça/RTL eklenirse bu sayfa otomatik hazır.
 */

const STORAGE_KEY = "ihaleal_onboarding_seen";

interface StartChoice {
  emoji: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  cta: string;
  path: string;
  Icon: typeof Search;
}

const CHOICES: readonly StartChoice[] = [
  {
    emoji: "🔍",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-300",
    title: "Keşfet",
    subtitle: "İhaleleri, ilanları ve piyasa verisini incele.",
    cta: "İhaleleri gör",
    path: "/ihaleler",
    Icon: Search,
  },
  {
    emoji: "📋",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-300",
    title: "Sat / İlan ver",
    subtitle: "Mülkünü ihaleye ya da satışa çıkar.",
    cta: "İlan oluştur",
    path: "/ihale-ac",
    Icon: FilePlus2,
  },
  {
    emoji: "🏷️",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-300",
    title: "Al / Teklif ver",
    subtitle: "Açık artırmalara katıl, fırsatları yakala.",
    cta: "Aktif ihaleler",
    path: "/auctions",
    Icon: Gavel,
  },
] as const;

export default function FlowSelector() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Hoş geldin — ihaleal.com";
  }, []);

  const choose = (path: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* sessiz */
    }
    navigate(path);
  };

  const skip = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* sessiz */
    }
    navigate("/");
  };

  return (
    <main
      className="min-h-screen pt-24 pb-16 px-4 text-white bg-slate-950"
    >
      <div className="mx-auto max-w-4xl">
        {/* Geri (sol — RTL'de otomatik sağa geçer) */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-slate-300 hover:text-white"
          aria-label="Geri"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          <span>Geri</span>
        </button>

        {/* Başlık — sade, jargonsuz */}
        <header className="mt-6 mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Hoş geldin!
          </h1>
          <p className="mt-3 text-base md:text-lg text-slate-300">
            Nereden başlamak istersin?
          </p>
        </header>

        {/* 3 kart — eşit, dokunmatik dostu */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHOICES.map((c) => (
            <button
              key={c.title}
              type="button"
              onClick={() => choose(c.path)}
              className="group flex flex-col rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 text-start transition-all hover:border-amber-400/40 hover:bg-slate-900/60 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
              aria-label={`${c.title}: ${c.subtitle}`}
            >
              {/* İkon kutusu — text-start ile RTL'de sağa geçer */}
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${c.iconBg}`}>
                <c.Icon className={`h-6 w-6 ${c.iconColor}`} aria-hidden="true" />
              </div>

              <h2 className="text-xl font-semibold text-white">
                <span className="me-2" aria-hidden="true">{c.emoji}</span>
                {c.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {c.subtitle}
              </p>

              {/* CTA — amber vurgu sadece hover'da (60/30/10) */}
              <div className="mt-auto pt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-200 group-hover:text-amber-300">
                <span>{c.cta}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>

        {/* Atla + değiştirilebilir notu */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={skip}
            className="text-sm text-slate-400 underline-offset-4 hover:text-white hover:underline"
          >
            Şimdilik geç →
          </button>
          <p className="text-xs text-slate-500">
            Bunu istediğin zaman değiştirebilirsin.
          </p>
        </div>
      </div>
    </main>
  );
}
