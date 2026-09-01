import { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { isSupabaseConfigured } from "@/lib/supabase";

export function NotificationBell() {
  const { user } = useAuth();
  const live = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const useLive = Boolean(user) && isSupabaseConfigured();
  const items = useMemo(
    () =>
      useLive
        ? live.items.map((n) => ({
            id: n.id,
            title: n.title,
            body: n.body,
            read: n.read,
            createdAt: n.createdAt,
          }))
        : [],
    [useLive, live.items],
  );

  const unread = useMemo(() => items.filter((i) => !i.read).length, [items]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, []);

  const markAllRead = () => {
    if (!useLive) return;
    for (const n of items.filter((i) => !i.read)) {
      void live.markRead(n.id);
    }
  };

  const markOne = (id: string) => {
    if (useLive) void live.markRead(id);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="relative min-h-11 min-w-11 inline-flex items-center justify-center rounded-[20px] text-slate-500 hover:text-slate-900 hover:bg-white/10 transition-colors"
        aria-expanded={open}
        aria-label="Bildirimler"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--zemin-yumusak)] text-[10px] font-normal text-white flex items-center justify-center border border-slate-200">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-[min(100vw-2rem,22rem)] rounded-[20px] border border-slate-200 bg-slate-950 shadow-2xl z-[80] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200/80">
            <span className="text-sm font-normal text-white">Bildirimler</span>
            {useLive && items.length > 0 ? (
              <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-400" onClick={markAllRead}>
                <CheckCheck className="w-3.5 h-3.5 me-1" /> Okundu
              </Button>
            ) : null}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!user ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                <Link to="/giris" className="text-[var(--metin-ikincil)] underline">
                  Giriş yapın
                </Link>{" "}
                — bildirimler hesabınıza bağlanır.
              </div>
            ) : live.loading ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">Yükleniyor…</div>
            ) : items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">Henüz bildiriminiz yok.</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markOne(n.id)}
                  className={`w-full text-start px-3 py-2.5 border-b border-slate-200/80 hover:bg-white/[0.04] transition-colors ${n.read ? "opacity-70" : "bg-[var(--zemin-yumusak)]"}`}
                >
                  <div className="text-xs font-normal text-white">{n.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.body}</div>
                  <div className="text-[10px] text-slate-600 mt-1">{new Date(n.createdAt).toLocaleString("tr-TR")}</div>
                </button>
              ))
            )}
          </div>
          {user ? (
            <Link to="/panel/bildirimler" className="block text-center text-[11px] text-[var(--metin-ikincil)] py-2 border-t border-slate-200/80">
              Tüm bildirimler
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
