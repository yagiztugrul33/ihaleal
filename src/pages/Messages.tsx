import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Paperclip,
  Building2,
  User,
  Home,
  Shield,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { ChatMessage } from "@/data/messagesDemo";
import { getParticipant } from "@/data/messagesDemo";
import { complianceNlpService } from "@/lib/compliance/ComplianceNlpService";
import { isSupabaseConfigured } from "@/lib/supabase";
import { isUuid } from "@/lib/chat/isUuid";
import { postChatMessageViaEdge } from "@/lib/chat/postChatMessageClient";
import { useAuth } from "@/contexts/AuthContext";
import { useChatThreads } from "@/hooks/useChatThreads";
import { LoadingState } from "@/components/async";

function roleBadge(role: string) {
  switch (role) {
    case "emlakçı":
      return { Icon: Building2, label: "Emlakçı", className: "bg-violet-500/20 text-violet-300 border-violet-500/30" };
    case "alici":
      return { Icon: User, label: "Alıcı", className: "bg-sky-500/20 text-sky-300 border-sky-500/30" };
    case "satici":
      return { Icon: Home, label: "Satıcı", className: "bg-amber-500/20 text-amber-200 border-amber-500/30" };
    default:
      return { Icon: Shield, label: "Platform", className: "bg-slate-600/40 text-slate-300 border-slate-200" };
  }
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get("listing");
  const listingTitle = searchParams.get("title");
  const threadParam = searchParams.get("thread");
  const { user } = useAuth();
  const {
    threads,
    setThreads,
    activeId,
    setActiveId,
    loading: threadsLoading,
    remoteReady,
    loadMessagesForThread,
  } = useChatThreads({
    userId: user?.id ?? null,
    listingId,
    listingTitle,
    preferredThreadId: threadParam,
  });
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const hasAuthSession = Boolean(user);

  const active = useMemo(() => threads.find((t) => t.id === activeId), [threads, activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, activeId]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !active || sendingRef.current) return;
    sendingRef.current = true;
    const clientMsgId =
      typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function"
        ? globalThis.crypto.randomUUID()
        : `cm-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
    const localMsgId = `local-${Date.now()}`;

    const pushLocal = (
      id: string,
      scan: { severity: "low" | "medium" | "high"; flaggedKeywords: string[]; modelScore: number },
      source: "edge" | "local",
    ) => {
      const msg: ChatMessage = {
        id,
        threadId: active.id,
        authorId: "p2",
        body: text,
        sentAt: new Date().toISOString(),
        complianceScan: {
          severity: scan.severity,
          flaggedKeywords: scan.flaggedKeywords,
          modelScore: scan.modelScore,
        },
        remoteSource: source,
      };
      setThreads((prev) => prev.map((t) => (t.id === active.id ? { ...t, messages: [...t.messages, msg] } : t)));
      setDraft("");
      const flagged = scan.flaggedKeywords.length > 0;
      window.dispatchEvent(
        new CustomEvent("ihaleal:add-toast", {
          detail: {
            message: flagged
              ? `Mesaj kaydedildi. Uyum tarayıcısı şüpheli ifadeler bildirdi: ${scan.flaggedKeywords.slice(0, 3).join(", ")}${scan.flaggedKeywords.length > 3 ? "…" : ""}.`
              : source === "edge"
                ? "Mesaj sunucuya iletildi (Edge post_chat_message)."
                : "Mesajınız demo olarak kaydedildi (simülasyon).",
            type: flagged ? "warning" : "success",
          },
        }),
      );
    };

    try {
      const tryEdge = isSupabaseConfigured() && hasAuthSession && isUuid(active.id);
      if (tryEdge) {
        const edge = await postChatMessageViaEdge({
          threadId: active.id,
          text,
          clientMsgId,
        });
        if (edge.ok) {
          if (remoteReady) {
            await loadMessagesForThread(active.id);
            setDraft("");
          } else {
            pushLocal(edge.messageId, edge.compliance, "edge");
          }
          return;
        }
        window.dispatchEvent(
          new CustomEvent("ihaleal:add-toast", {
            detail: {
              message: `Edge gönderimi başarısız (${edge.code}). Yerel demo ile devam edildi.${edge.detail ? ` · ${edge.detail}` : ""}`,
              type: "warning",
            },
          }),
        );
      }

      const signal = await complianceNlpService.scoreChatMessage(text, {
        messageId: localMsgId,
        threadId: active.id,
        senderId: "p2",
      });
      pushLocal(
        localMsgId,
        {
          severity: signal.severity,
          flaggedKeywords: signal.flaggedKeywords,
          modelScore: signal.modelScore,
        },
        "local",
      );
    } finally {
      sendingRef.current = false;
    }
  };

  const attachDemo = () => {
    if (!active) return;
    const msg: ChatMessage = {
      id: `att-${Date.now()}`,
      threadId: active.id,
      authorId: "p2",
      body: "Dosya eklendi (simülasyon).",
      attachmentName: `dosya-${Date.now()}.pdf`,
      sentAt: new Date().toISOString(),
    };
    setThreads((prev) =>
      prev.map((t) => (t.id === active.id ? { ...t, messages: [...t.messages, msg] } : t))
    );
    window.dispatchEvent(
      new CustomEvent("ihaleal:add-toast", {
        detail: { message: "Dosya gönderimi demo ortamında yerelde saklanır.", type: "info" },
      })
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 gap-2 w-fit">
            <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
          </Button>
          <p className="text-xs text-slate-500 max-w-xl">
            Üçlü sohbet: ortak emlakçı, alıcı ve satıcı kanalı (demo). Gerçek hukuki bağlayıcılık için kayıtlı süreç ve sözleşme çizgisine bakınız.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-12rem)] rounded-2xl border border-slate-200 bg-slate-900/40 overflow-hidden shadow-xl">
          {/* Sol — konuşmalar */}
          <aside className="lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-e border-slate-200 max-h-52 lg:max-h-none overflow-y-auto lg:overflow-visible">
            <div className="p-4 border-b border-slate-200/80 flex items-center gap-2 text-white font-semibold">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Konuşmalar
            </div>
            <div className="p-2 space-y-1">
              {threadsLoading ? (
                <LoadingState compact label="Konuşmalar yükleniyor…" className="py-6" />
              ) : null}
              {threads.map((t) => {
                const last = t.messages[t.messages.length - 1];
                const unread = 0;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveId(t.id)}
                    className={`w-full text-start rounded-xl px-3 py-2.5 transition-colors ${
                      t.id === activeId ? "bg-blue-500/15 border border-blue-500/30" : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="text-sm font-medium text-white line-clamp-1">{t.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{t.listingSnippet}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5 flex justify-between gap-2">
                      <span className="truncate">{last?.body.slice(0, 36)}…</span>
                      {unread > 0 && (
                        <span className="shrink-0 rounded-full bg-violet-500 text-[10px] px-1.5 text-white">{unread}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Sağ — mesajlar */}
          <div className="flex-1 flex flex-col min-h-[420px]">
            {active ? (
              <>
                <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap gap-2 items-center">
                  <h1 className="text-lg font-bold text-white flex-1 min-w-[200px]">{active.title}</h1>
                  {isSupabaseConfigured() && hasAuthSession && isUuid(active.id) ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200/95">
                      <Server className="h-3 w-3" aria-hidden />
                      {remoteReady ? "Canlı sohbet" : "Edge gönderim"}
                    </span>
                  ) : isSupabaseConfigured() && hasAuthSession ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-600/60 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-slate-400">
                      Demo konu (UUID değil) — yerel kayıt
                    </span>
                  ) : isSupabaseConfigured() ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-200/90">
                      Oturum yok — yerel demo
                    </span>
                  ) : null}
                  <div className="flex flex-wrap gap-1.5">
                    {active.participants.map((p) => {
                      const b = roleBadge(p.role);
                      return (
                        <span
                          key={p.id}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] ${b.className}`}
                        >
                          <b.Icon className="w-3 h-3" />
                          {p.displayName}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#070b14]/80">
                  {active.messages.map((m) => {
                    const author = getParticipant(threads, m.authorId);
                    const self = m.authorId === "p2";
                    const b = author ? roleBadge(author.role) : roleBadge("platform");
                    return (
                      <div key={m.id} className={`flex ${self ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm border ${
                            self
                              ? "bg-gradient-to-br from-blue-600/90 to-teal-600/80 border-slate-200 text-white rounded-br-md"
                              : "bg-slate-800/90 border-slate-200 text-slate-100 rounded-bl-md"
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-1 text-[10px] opacity-90">
                            <b.Icon className="w-3.5 h-3.5" />
                            <span>{author?.displayName ?? "Katılımcı"}</span>
                            {m.remoteSource === "edge" ? (
                              <span className="rounded bg-emerald-500/20 px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-emerald-200">
                                Edge
                              </span>
                            ) : null}
                            <span className="text-slate-500">
                              {new Date(m.sentAt).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                          {m.attachmentName && (
                            <div className="mt-2 flex items-center gap-2 rounded-lg bg-black/20 px-2 py-1.5 text-xs">
                              <Paperclip className="w-3.5 h-3.5 shrink-0 opacity-80" />
                              <span className="truncate">{m.attachmentName}</span>
                              <span className="text-slate-500">(demo)</span>
                            </div>
                          )}
                          {m.complianceScan && m.complianceScan.flaggedKeywords.length > 0 && (
                            <div
                              className={`mt-2 rounded-lg border px-2 py-1.5 text-[10px] leading-snug ${
                                m.complianceScan.severity === "high"
                                  ? "border-rose-500/40 bg-rose-950/40 text-rose-100"
                                  : m.complianceScan.severity === "medium"
                                    ? "border-amber-500/35 bg-amber-950/30 text-amber-100"
                                    : "border-slate-200 bg-black/25 text-slate-300"
                              }`}
                            >
                              <span className="font-medium">
                                Uyum taraması{m.remoteSource === "edge" ? " (Edge + RPC)" : " (demo)"}:
                              </span>{" "}
                              eşleşen ifadeler —{" "}
                              {m.complianceScan.flaggedKeywords.join(", ")}. Otomatik engel yok; üretimde kayıt altına alınır.{" "}
                              <Link to="/yasal/dolandiricilik-savunmasi" className="underline underline-offset-2 text-teal-300">
                                Savunma mimarisi
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <div className="p-3 border-t border-slate-200 bg-slate-950/60 flex flex-col sm:flex-row gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Mesajınızı yazın…"
                    className="flex-1 bg-slate-950 border-slate-200 text-white"
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                  />
                  <div className="flex gap-2 shrink-0">
                    <Button type="button" variant="outline" size="icon" className="border-white/15" onClick={attachDemo} title="Dosya ekle (demo)">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button type="button" className="bg-gradient-to-r from-blue-500 to-teal-400 text-white gap-2 px-6" onClick={send}>
                      <Send className="rtl:-scale-x-100 w-4 h-4" /> Gönder
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">Konuşma seçin.</div>
            )}
          </div>
        </div>

        <Card className="mt-6 border-slate-200 bg-slate-900/30 p-4 space-y-2">
          <p className="text-xs text-slate-500">
            İletişim tek kayıt altında tutulma hedefiyle platform kanalından yürür; doğrudan telefon paylaşımı varsayılan olarak kapalıdır.{" "}
            <Link to="/ihaleler" className="text-teal-400 hover:underline">
              İhalelere göz at
            </Link>
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Gönderdiğiniz metinler önce <strong className="text-slate-400">ComplianceNlpService</strong> ile taranır. Supabase oturumu açık ve
            konu başlığı UUID ise aynı kurallar Edge üzerinden <code className="text-slate-500">post_chat_message</code> ile RPC ve isteğe bağlı{" "}
            <code className="text-slate-500">compliance_review_queue</code> kaydına yansır (migration uygulanmış olmalı). Otomatik hesap cezası
            yoktur. Laboratuvar:{" "}
            <Link to="/araclar/finans-uyumluluk" className="text-teal-400 hover:underline">
              Fin / uyum playground
            </Link>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}
