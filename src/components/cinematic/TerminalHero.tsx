import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { useTypewriter } from "@/hooks/useTypewriter";
import { invokeSystemQa } from "@/lib/systemQaClient";
import { ROUTES } from "@/constants/routes";
import { useLocale } from "@/contexts/LocaleContext";

export function TerminalHero() {
  const { t } = useLocale();
  const terminal = t.home.terminal;
  const navigate = useNavigate();
  const { text: typed, done } = useTypewriter(terminal.prompt, 38);
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

  return (
    <div className="terminal-hero" data-testid="terminal-hero">
      <p className="terminal-hero__eyebrow">{terminal.eyebrow}</p>
      <h1 id="premium-hero-title" className="terminal-hero__prompt">
        <span className="terminal-hero__prefix">&gt;</span> {typed}
        {done ? <span className="terminal-hero__cursor" aria-hidden="true" /> : null}
      </h1>
      <nav className="terminal-hero__nav" aria-label="Hızlı yönlendirme">
        {options.map((opt) => (
          <Link key={opt.label} to={opt.href} className="terminal-hero__link">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            {opt.label}
          </Link>
        ))}
      </nav>
      <form
        className="terminal-hero__ask"
        onSubmit={(e) => {
          e.preventDefault();
          void askAi();
        }}
      >
        <label htmlFor="terminal-ask" className="sr-only">
          {terminal.askPlaceholder}
        </label>
        <span className="terminal-hero__ask-prefix">&gt;</span>
        <input
          id="terminal-ask"
          value={query}
          onChange={(e) => setQuery(e.target.value.replace(/<[^>]*>/g, "").slice(0, 500))}
          placeholder={terminal.askPlaceholder}
          className="terminal-hero__input"
          autoComplete="off"
        />
        <button type="submit" disabled={aiBusy || !query.trim()} className="terminal-hero__submit">
          {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : terminal.askSubmit}
        </button>
      </form>
      {aiReply ? (
        <div className="terminal-hero__reply" role="status">
          {aiReply}
        </div>
      ) : (
        <ul className="terminal-hero__hints">
          {terminal.hints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="terminal-hero__borsa-cta"
        onClick={() => navigate(ROUTES.BORSA)}
      >
        {terminal.borsaCta}
      </button>
    </div>
  );
}
