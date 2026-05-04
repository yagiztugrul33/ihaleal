import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CONTRACT_URL = `${import.meta.env.BASE}legal/agency_contract.md`;

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
        Kaynak: <code className="text-teal-400">public/legal/agency_contract.md</code>
      </p>
      {err ? <p className="text-red-400 text-sm mb-4">{err}</p> : null}
      <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-6 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
        {body || "Yukleniyor..."}
      </article>
    </div>
  );
}
