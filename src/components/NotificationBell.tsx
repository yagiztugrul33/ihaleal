import { useMemo, useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { DEMO_NOTIFICATIONS, type DemoNotification } from "@/data/notificationsDemo";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "ihaleal_notifications_demo";

function loadNotifications(): DemoNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEMO_NOTIFICATIONS.map((n) => ({ ...n }));
    const parsed = JSON.parse(raw) as DemoNotification[];
    return parsed.length ? parsed : DEMO_NOTIFICATIONS.map((n) => ({ ...n }));
  } catch {
    return DEMO_NOTIFICATIONS.map((n) => ({ ...n }));
  }
}

function saveNotifications(rows: DemoNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<DemoNotification[]>(() => loadNotifications());

  const unread = useMemo(() => items.filter((i) => !i.read).length, [items]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, []);

  const markAllRead = () => {
    const next = items.map((i) => ({ ...i, read: true }));
    setItems(next);
    saveNotifications(next);
  };

  const clearAll = () => {
    setItems([]);
    saveNotifications([]);
  };

  const markOne = (id: string) => {
    const next = items.map((i) => (i.id === id ? { ...i, read: true } : i));
    setItems(next);
    saveNotifications(next);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/10 transition-colors"
        aria-expanded={open}
        aria-label="Bildirimler"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-violet-500 text-[10px] font-bold text-white flex items-center justify-center border border-slate-200">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-slate-200 bg-white shadow-2xl z-[80] overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200/80">
            <span className="text-sm font-semibold text-white">Bildirimler</span>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-400" onClick={markAllRead}>
                <CheckCheck className="w-3.5 h-3.5 mr-1" /> Okundu
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-400" onClick={clearAll}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">Bildirim yok.</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markOne(n.id)}
                  className={`w-full text-left px-3 py-2.5 border-b border-slate-200/80 hover:bg-white/[0.04] transition-colors ${n.read ? "opacity-70" : "bg-blue-500/5"}`}
                >
                  <div className="text-xs font-semibold text-white">{n.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.body}</div>
                  <div className="text-[10px] text-slate-600 mt-1">{new Date(n.createdAt).toLocaleString("tr-TR")}</div>
                </button>
              ))
            )}
          </div>
          <p className="text-[10px] text-slate-600 px-3 py-2 border-t border-slate-200/80">Demo bildirimler — gerçek zamanlı kanal bağlı değildir.</p>
        </div>
      )}
    </div>
  );
}
