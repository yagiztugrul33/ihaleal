import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentUploader } from "@/components/DocumentUploader";
import {
  FLOW_LABELS,
  type UserFlow,
  mergedRequirements,
  readUserFlowsFromStorage,
  writeUserFlowsToStorage,
} from "@/lib/userFlows";
import { isDemoData } from "@/lib/dataStrategy";
import { DemoDataCornerBadge } from "@/components/DemoDataCornerBadge";

const ALL_FLOWS: UserFlow[] = ["browser_only", "listing_only", "auction_seller", "auction_bidder"];

function initialFlowSet(): Set<UserFlow> {
  const saved = readUserFlowsFromStorage();
  if (saved.length > 0) return new Set(saved);
  return new Set<UserFlow>(["browser_only"]);
}

export default function FlowSelector() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<UserFlow>>(initialFlowSet);

  const toggle = (f: UserFlow) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(f)) {
        if (f === "browser_only" && n.size === 1) return n;
        n.delete(f);
        if (n.size === 0) n.add("browser_only");
      } else {
        n.add(f);
      }
      return n;
    });
  };

  const flows = useMemo(() => Array.from(selected), [selected]);
  const docs = useMemo(() => mergedRequirements(flows), [flows]);
  const needsEdevlet = flows.includes("auction_seller");

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative" data-demo="true">
      {isDemoData("flowOnboarding") ? <DemoDataCornerBadge /> : null}
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2">
          <ArrowLeft className="w-4 h-4" /> Ana sayfa
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-teal-400" />
            Kullanıcı akışı seçimi
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Bir veya birden fazla akış işaretleyin; evrak listesi birleşir. Backend yok — ürün taslağı (§D-K3).
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {ALL_FLOWS.map((f) => {
            const on = selected.has(f);
            const L = FLOW_LABELS[f];
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggle(f)}
                className={`text-left rounded-xl border p-4 transition-colors ${
                  on ? "border-teal-500/40 bg-teal-500/10" : "border-white/10 bg-slate-900/40 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-white text-sm">{L.title}</div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{L.description}</p>
                  </div>
                  {on ? <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" /> : null}
                </div>
              </button>
            );
          })}
        </div>

        <Card className="bg-slate-900/50 border-white/5">
          <CardContent className="p-5 space-y-3">
            <h2 className="text-sm font-semibold text-white">Birleşik evrak listesi</h2>
            <ul className="space-y-2 text-sm text-slate-300">
              {docs.map((d) => (
                <li key={d.id} className="flex gap-2">
                  <span className={d.required ? "text-amber-400" : "text-slate-600"}>{d.required ? "*" : "○"}</span>
                  <span>
                    {d.label}
                    {d.hint ? <span className="block text-xs text-slate-500 mt-0.5">{d.hint}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
            {needsEdevlet ? (
              <Button type="button" variant="outline" className="w-full border-teal-500/30 text-teal-200" onClick={() => navigate("/auth/edevis-mock")}>
                e-Devlet yetki (DEMO) — Akış B
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <DocumentUploader label="Örnek evrak yükleme (seçtiğiniz akışa göre)" requirements={docs} />

        <Button
          type="button"
          className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold"
          onClick={() => {
            writeUserFlowsToStorage(flows);
            navigate("/dashboard");
          }}
        >
          Kaydet ve panele git
        </Button>

        <p className="text-[10px] text-slate-600">
          Kaynak: <code className="text-slate-500">src/lib/userFlows.ts</code> — CLOUD şeması ile uyum için genişletilebilir.
        </p>
      </div>
    </div>
  );
}
