import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { invokeSystemQa } from "@/lib/systemQaClient";
import { ROUTES } from "@/constants/routes";
import { useLocale } from "@/contexts/LocaleContext";

/**
 * Ana sayfa hero'su (arama-önce). İşlev korunur: hızlı yönlendirme bağlantıları (kiralık/satılık/
 * ihale/lansman), yapay zekâya soru formu (`askAi`), ipucu bağlantıları ve borsa CTA'sı aynen var;
 * üstüne Zillow benzeri tek baskın arama alanı eklendi (`/arama?q=…`).
 * Sınıf adlarında "btn" geçmesi bilinçli: global-acik.css'in düz-metin bağlantı kuralı
 * (`a:not([class*="btn"])…{underline}`) bu bağlantıları hariç tutar.
 */
export function TerminalHero() {
  const { t } = useLocale();
  const terminal = t.home.terminal;
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);

  const options = useMemo(
    () =>
      [
        { label: terminal.options.rent, href: "/arama?q=kiralık" },
        { label: terminal.options.sale, href: "/arama?q=satılık" },
        { label: terminal.options.auction, href: "/ihaleler" },
        { label: terminal.options.launch, href: "/muteahhit/panel" },
      ] as const,
    [terminal.options],
  );

  const askAi = useCallback(async () => {
    const q = query.trim();
    if (!q || aiBusy) return;
    setAiBusy(true);
    setAiReply(null);
    const res = await invokeSystemQa([{ role: "user", content: q }]);
    if (res.ok) {
      setAiReply(res.text.slice(0, 480));
    } else {
      setAiReply(terminal.aiUnavailable);
    }
    setAiBusy(false);
  }, [query, aiBusy, terminal.aiUnavailable]);

  const runSearch = useCallback(() => {
    const q = search.trim();
    navigate(q ? `/arama?q=${encodeURIComponent(q)}` : "/arama");
  }, [search, navigate]);

  return (
    <div className="terminal-hero hv2" data-testid="terminal-hero">
      <div className="hv2__main">
        <p className="hv2__eyebrow">{terminal.eyebrow}</p>
        <h1 id="premium-hero-title" className="hv2__title">
          {terminal.headline}
        </h1>
        <p className="hv2__sub">{terminal.subline}</p>

        <form
          className="hv2__search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch();
          }}
        >
          <label htmlFor="hero-search" className="sr-only">
            {terminal.searchPlaceholder}
          </label>
          <Search className="hv2__search-icon" aria-hidden />
          <input
            id="hero-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value.replace(/<[^>]*>/g, "").slice(0, 200))}
            placeholder={terminal.searchPlaceholder}
            className="hv2__search-input"
            autoComplete="off"
          />
          <button type="submit" className="hv2__search-submit">
            {terminal.searchSubmit}
          </button>
        </form>

        <div className="hv2__pills" role="navigation" aria-label="Hızlı yönlendirme">
          {options.map((opt) => (
            <Link key={opt.label} to={opt.href} className="hv2__btn-pill">
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      <aside className="hv2__ask" aria-label={terminal.prompt}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void askAi();
          }}
        >
          <label htmlFor="terminal-ask" className="hv2__ask-label">
            {terminal.prompt}
          </label>
          <div className="hv2__ask-row">
            <input
              id="terminal-ask"
              value={query}
              onChange={(e) => setQuery(e.target.value.replace(/<[^>]*>/g, "").slice(0, 500))}
              placeholder={terminal.askPlaceholder}
              className="hv2__ask-input"
              autoComplete="off"
            />
            <button type="submit" disabled={aiBusy || !query.trim()} className="hv2__ask-submit">
              {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : terminal.askSubmit}
            </button>
          </div>
        </form>
        {aiReply ? (
          <div className="hv2__reply" role="status">
            {aiReply}
          </div>
        ) : (
          <ul className="hv2__hints">
            {terminal.hints.map((h) => (
              <li key={h.href}>
                <Link to={h.href} className="hv2__btn-hint">
                  {h.label}
                  <ArrowRight className="rtl:rotate-180 h-3.5 w-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="hv2__borsa" onClick={() => navigate(ROUTES.BORSA)}>
          {terminal.borsaCta}
        </button>
      </aside>
    </div>
  );
}
