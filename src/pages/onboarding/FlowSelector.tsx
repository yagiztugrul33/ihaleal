import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, FilePlus2, Gavel, ArrowLeft } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

/**
 * Onboarding — "Nereden başlamak istersin?"
 *
 * Liderlerin deseni: önce değer gör, sürtünmeyi ihtiyaç anına ertele.
 *
 * 3 kart → gerçek rotalara yönlendirir; KYC/evrak/teminat sormaz.
 * Görsel disiplin: 60/30/10 (nötr zemin + lacivert gövde + amber vurgu).
 * i18n: TR/EN/RU/AR (FAZ 1-A). RTL-hazır: Tailwind logical CSS
 * (ms-/me-/ps-/pe-/text-start). AR'da yön oku rtl:rotate-180 ile aynalanır.
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

export default function FlowSelector() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const ob = t.onboarding;

  const choices: readonly StartChoice[] = useMemo(
    () => [
      {
        emoji: "🔍",
        iconBg: "bg-[var(--zemin-yumusak)]",
        iconColor: "text-[var(--metin-ikincil)]",
        title: ob.discover.title,
        subtitle: ob.discover.subtitle,
        cta: ob.discover.cta,
        path: "/ihaleler",
        Icon: Search,
      },
      {
        emoji: "📋",
        iconBg: "bg-[var(--zemin-yumusak)]",
        iconColor: "text-[var(--metin-ikincil)]",
        title: ob.sell.title,
        subtitle: ob.sell.subtitle,
        cta: ob.sell.cta,
        path: "/ihale-ac",
        Icon: FilePlus2,
      },
      {
        emoji: "🏷️",
        iconBg: "bg-[var(--zemin-yumusak)]",
        iconColor: "text-[var(--metin-ikincil)]",
        title: ob.buy.title,
        subtitle: ob.buy.subtitle,
        cta: ob.buy.cta,
        path: "/ihaleler",
        Icon: Gavel,
      },
    ],
    [ob],
  );

  useEffect(() => {
    document.title = `${ob.title} — ihaleal.com`;
  }, [ob.title]);

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
    <main className="min-h-screen pt-24 pb-16 px-4 text-white bg-slate-950">
      <div className="mx-auto max-w-4xl">
        {/* Geri — logical (RTL'de sağa geçer) */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 rounded-[3px] px-2 py-1 text-sm text-slate-300 hover:text-white"
          aria-label={ob.back}
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          <span>{ob.back}</span>
        </button>

        {/* Başlık — sade, jargonsuz */}
        <header className="mt-6 mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-normal tracking-tight">
            {ob.title}
          </h1>
          <p className="mt-3 text-base md:text-lg text-slate-300">
            {ob.subtitle}
          </p>
        </header>

        {/* 3 kart — eşit, dokunmatik dostu */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {choices.map((c) => (
            <button
              key={c.title}
              type="button"
              onClick={() => choose(c.path)}
              className="group flex flex-col rounded-[20px] border border-slate-700/60 bg-slate-900/40 p-6 text-start transition-all hover:border-[var(--cizgi)] hover:bg-slate-900/60 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cizgi)]"
              aria-label={`${c.title}: ${c.subtitle}`}
            >
              {/* İkon kutusu — text-start ile RTL'de sağa geçer */}
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[20px] ${c.iconBg}`}>
                <c.Icon className={`h-6 w-6 ${c.iconColor}`} aria-hidden="true" />
              </div>

              <h2 className="text-xl font-normal text-white">
                <span className="me-2" aria-hidden="true">{c.emoji}</span>
                {c.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {c.subtitle}
              </p>

              {/* CTA — amber vurgu sadece hover'da (60/30/10) */}
              <div className="mt-auto pt-6 inline-flex items-center gap-2 text-sm font-normal text-slate-200 group-hover:text-[var(--metin-ikincil)]">
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
            {ob.skip}
          </button>
          <p className="text-xs text-slate-500">
            {ob.skipNote}
          </p>
        </div>
      </div>
    </main>
  );
}
