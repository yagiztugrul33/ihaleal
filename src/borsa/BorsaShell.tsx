import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

type BorsaTabKey = "piyasa" | "portfoy" | "izleme" | "veri";

const TAB_ITEMS: Array<{ key: BorsaTabKey; label: string; to: string }> = [
  { key: "piyasa", label: "Piyasa", to: ROUTES.BORSA },
  { key: "portfoy", label: "Portföy", to: `${ROUTES.BORSA}/portfoy` },
  { key: "izleme", label: "İzleme", to: `${ROUTES.BORSA}/izleme` },
  { key: "veri", label: "Veri", to: `${ROUTES.BORSA}/veri` },
];

export function BorsaShell({
  activeTab,
  children,
  title = "Terminal",
  subtitle = "ihaleal.com terminal",
}: {
  activeTab: BorsaTabKey;
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="borsa-root text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-700/60 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <Logo size="lg" />
            <div className="leading-tight">
              <p className="text-sm font-black tracking-[0.08em] text-[#E9C56A]">GAYRİMENKUL BORSASI</p>
              <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild type="button" variant="outline" className="border-slate-600 bg-slate-900/70 text-slate-200">
              <Link to="/panel">
                <BriefcaseBusiness className="mr-1.5 h-4 w-4" /> Portföy kısayolu
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-600 bg-slate-900/70 text-slate-200">
              <Link to="/">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Ana Site
              </Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-2 px-4 pb-3 lg:px-6">
          <div className="flex items-center gap-2">
            {TAB_ITEMS.map((tab) => (
              <Link
                key={tab.key}
                to={tab.to}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]",
                  activeTab === tab.key
                    ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-200"
                    : "border-slate-700 bg-slate-900/70 text-slate-400 hover:text-slate-200",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">{title}</p>
        </div>
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-2 px-4 pb-3 text-[11px] text-slate-400 lg:px-6">
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-200">Seffaf islem bandi</span>
          <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-200">Anti-manipulasyon sinyali</span>
          <span className="rounded border border-slate-700 bg-slate-900/70 px-2 py-0.5">Mock veri · Uretim baglantisi kapali</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1600px] space-y-4 px-4 py-4 lg:px-6">{children}</main>
    </div>
  );
}
