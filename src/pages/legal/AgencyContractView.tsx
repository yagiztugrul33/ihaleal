import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

const CONTRACT_URL = `${import.meta.env.BASE}legal/agency_contract.md`;

function renderMarkdownLines(md: string): ReactNode[] {
  return md.split("\n").map((raw, idx) => {
    const line = raw.trimEnd();
    const t = line.trim();
    if (t.startsWith("# ")) {
      return (
        <h1 key={idx} className="text-2xl font-bold text-white mt-8 first:mt-0 scroll-mt-24">
          {t.slice(2)}
        </h1>
      );
    }
    if (t.startsWith("## ")) {
      return (
        <h2 key={idx} className="text-xl font-semibold text-teal-200 mt-6 border-b border-white/10 pb-2 scroll-mt-24">
          {t.slice(3)}
        </h2>
      );
    }
    if (t.startsWith("### ")) {
      return (
        <h3 key={idx} className="text-lg font-medium text-white mt-4 scroll-mt-24">
          {t.slice(4)}
        </h3>
      );
    }
    if (t.startsWith("- ")) {
      return (
        <li key={idx} className="ml-5 list-disc text-slate-300 leading-relaxed">
          {t.slice(2)}
        </li>
      );
    }
    if (!t) {
      return <div key={idx} className="h-2" aria-hidden />;
    }
    return (
      <p key={idx} className="text-slate-300 leading-relaxed">
        {t}
      </p>
    );
  });
}

export default function AgencyContractView() {
  const [body, setBody] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(CONTRACT_URL)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      })
      .then((t) => {
        if (!cancelled) setBody(t);
      })
      .catch(() => {
        if (!cancelled) setErr("Metin yuklenemedi.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 max-w-4xl mx-auto px-4">
      <Link to="/" className="text-sm text-slate-400 hover:text-white mb-6 inline-block">
        Ana sayfa
      </Link>
      <h1 className="text-2xl font-bold text-white mb-2">agency_contract.md</h1>
      <p className="text-sm text-slate-500 mb-6">
        Kaynak: <code className="text-teal-400">public/legal/agency_contract.md</code> (taslak, demo)
      </p>
      {err ? <p className="text-red-400 text-sm mb-4">{err}</p> : null}
      <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-6 space-y-1 text-sm">
        {body ? renderMarkdownLines(body) : <p className="text-slate-500">Yukleniyor...</p>}
      </article>
    </div>
  );
}
