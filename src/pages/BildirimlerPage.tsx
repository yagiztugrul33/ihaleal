import { useState } from "react";
import { Bell, CheckCircle2, Info } from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: typeof Bell;
  unread?: boolean;
};

const ALL: NotificationItem[] = [
  { id: "1", title: "Yeni teklif", body: "Kadıköy 3+1 ilanınıza yeni teklif geldi.", time: "5 dk önce", icon: Bell, unread: true },
  { id: "2", title: "İhale sona erdi", body: "Ankara ticari plaza ihalesi kapandı.", time: "1 saat önce", icon: CheckCircle2 },
  { id: "3", title: "Fiyat düştü", body: "İzlediğiniz ilanda %2,1 fiyat düşüşü var.", time: "Dün", icon: Info },
  { id: "4", title: "KYC onaylandı", body: "Kimlik doğrulamanız tamamlandı.", time: "2 gün önce", icon: CheckCircle2 },
];

const TABS = [
  { id: "all" as const, label: "Tümü", items: ALL },
  { id: "unread" as const, label: "Okunmamış", items: ALL.filter((n) => n.unread) },
  { id: "system" as const, label: "Sistem", items: ALL.filter((n) => n.icon === Info) },
];

export default function BildirimlerPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];
  return (
    <div className="min-h-screen bg-[#050b16] px-4 pb-16 pt-24 text-slate-100">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Bildirimler</h1>
        <div className="mb-6 mt-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={tab === t.id ? "rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" : "rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300"}>
              {t.label} ({t.items.length})
            </button>
          ))}
        </div>
        <ul className="space-y-3">
          {active.items.map((n) => {
            const Icon = n.icon;
            return (
              <li key={n.id} className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400"><Icon className="h-5 w-5" /></div>
                <div><p className="font-semibold text-white">{n.title}</p><p className="text-sm text-slate-400">{n.body}</p><p className="text-xs text-slate-500">{n.time}</p></div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
