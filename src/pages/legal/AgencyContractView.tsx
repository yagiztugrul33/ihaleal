import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ShieldCheck } from "lucide-react";

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
        <h2 key={idx} className="text-xl font-semibold text-teal-200 mt-6 border-b border-slate-200 pb-2 scroll-mt-24">
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
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-900 mb-6 inline-block">
        Ana sayfa
      </Link>
      <h1 className="text-2xl font-bold text-white mb-2">agency_contract.md</h1>
      <p className="text-sm text-slate-500 mb-6">
        Kaynak: <code className="text-teal-400">public/legal/agency_contract.md</code> (taslak, demo)
      </p>
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-xs text-slate-300">
          <p className="font-semibold text-cyan-200">Sablon amaci</p>
          <p className="mt-1">Emlakci-platform-satici iliskisinde rol, komisyon ve sorumluluk sinirlarini netlestirmek.</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-slate-300">
          <p className="font-semibold text-amber-200 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Durust sinir
          </p>
          <p className="mt-1">Nihai imza metni avukat onayi olmadan kullanilmamalidir; bu sayfa yalnizca taslak gorunumu sunar.</p>
        </div>
      </div>
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">Nedir?</p>
          <p className="mt-1">Agency contract; emlakçı, platform ve taraflar arasındaki temsil, yetki ve komisyon sınırlarını tanımlar.</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">Neden?</p>
          <p className="mt-1">Yetki karmaşasını önler, ihtilaf anında sorumluluk ve delil zincirini netleştirir.</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">Kime göre</p>
          <p className="mt-1">Emlak ofisi, platform operasyonu ve mülk sahibinin ortak çalışma zemini için hazırlanır.</p>
        </article>
      </div>
      {err ? <p className="text-red-400 text-sm mb-4">{err}</p> : null}
      <article className="rounded-2xl border border-slate-200 bg-slate-950/40 p-6 space-y-1 text-sm">
        {body ? renderMarkdownLines(body) : <p className="text-slate-500">Yukleniyor...</p>}
      </article>
      <p className="mt-4 text-xs text-emerald-200 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4" /> Onerilen akis: taslak -&gt; hukuk revizyonu -&gt; taraf mutabakati -&gt; imza.
      </p>
      <div className="mt-4 rounded-xl border border-blue-500/25 bg-blue-500/10 p-4 text-xs text-slate-200">
        <p className="font-semibold text-blue-100">CTA</p>
        <p className="mt-1">
          Şablonu dosya verileriyle eşleştirin, revizyon notlarını tutun ve yalnızca hukuk onayından sonra taraflara imzaya açın.
        </p>
      </div>
      <div className="mt-4 rounded-xl border border-slate-200/80 bg-white/[0.03] p-4 text-xs text-slate-300">
        <p className="font-semibold text-slate-100">Ek kontrol</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Komisyon oranı, ödeme tarihi ve fesih maddeleri somut dosyaya göre güncellenir.</li>
          <li>Yetki kapsamı ve temsil sınırları açık şekilde yazılır.</li>
          <li>İmza öncesi son sürüm numarası taraflara yazılı teyit ettirilir.</li>
        </ul>
      </div>
      <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-xs text-slate-200">
        <p className="font-semibold text-emerald-100">Yürütme notu</p>
        <p className="mt-1">
          Agency sözleşmesi; evrak, ekspertiz ve işlem kayıtlarıyla birlikte dosyalanmalı, revizyon geçmişi kapanışa kadar korunmalıdır.
        </p>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Son adım: taraf temsil yetkileri, komisyon oranı ve fesih şartlarının nihai sürümde avukat tarafından teyit edilmesi.
      </p>
    </div>
  );
}
