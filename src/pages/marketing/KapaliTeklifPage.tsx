import { useMemo, useState } from "react";
import { Lock, EyeOff, Shield, Clock, Users, FileCheck, Scale, Gavel } from "lucide-react";
import { PageShell } from "@/components/marketing/PageShell";

const DEMO_CARDS = [
  { title: "Teklif A", amount: "₺4.850.000", rank: "1.", icon: Gavel },
  { title: "Teklif B", amount: "₺4.720.000", rank: "2.", icon: Scale },
  { title: "Teklif C", amount: "₺4.690.000", rank: "3.", icon: FileCheck },
  { title: "Teklif D", amount: "Gizli", rank: "—", icon: EyeOff },
  { title: "Teklif E", amount: "Gizli", rank: "—", icon: Lock },
  { title: "Teklif F", amount: "Gizli", rank: "—", icon: Shield },
  { title: "Süre", amount: "48 saat", rank: "Aktif", icon: Clock },
  { title: "Katılımcı", amount: "12 firma", rank: "Onaylı", icon: Users },
];

export default function KapaliTeklifPage() {
  const [myBidTry, setMyBidTry] = useState("4850000");
  const [remainingHours, setRemainingHours] = useState("48");
  const [revealMode, setRevealMode] = useState<"sealed" | "revealed">("sealed");

  const rankingPreview = useMemo(() => {
    const base = Number(myBidTry) || 0;
    if (base <= 0) return [];
    const offsets = [0, -120_000, -180_000];
    return offsets.map((offset, index) => ({
      rank: index + 1,
      amount: base + offset,
      label: index === 0 ? "Sizin teklifiniz" : `Rakip ${index}`,
    }));
  }, [myBidTry]);

  return (
    <PageShell
      badge="Kapalı teklif"
      title="Şeffaf kapalı ihale süreci"
      subtitle="Teklifler süre dolana kadar rakiplere açılmaz. Süre sonunda sıralama ve kazanan otomatik belirlenir; tüm adımlar denetim izinde tutulur."
      cta={{ label: "İhalelere git", to: "/ilanlar" }}
    >
      <section className="py-12 grid gap-6 md:grid-cols-2">
        <article className="card-warm">
          <h2 className="text-xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            Nasıl çalışır?
          </h2>
          <ol className="space-y-3 text-sm list-decimal list-inside" style={{ color: "var(--color-text-muted)" }}>
            <li>İlan sahibi kapalı teklif modunu açar ve bitiş süresini belirler.</li>
            <li>Katılımcılar tekliflerini şifreli kanaldan iletir; rakipler tutarı görmez.</li>
            <li>Süre sonunda sistem teklifleri sıralar ve ilan sahibine rapor sunar.</li>
            <li>Kazanan seçildikten sonra sözleşme ve KYC adımları başlatılır.</li>
          </ol>
        </article>
        <article className="card-warm">
          <h2 className="text-xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            Neden kapalı teklif?
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <li>✓ Fiyat savaşını ve son dakika manipülasyonunu azaltır</li>
            <li>✓ Kurumsal satın alma prosedürlerine uygundur</li>
            <li>✓ Denetlenebilir kayıt ve hukuki delil zinciri</li>
            <li>✓ Müteahhit ve GYO ihalelerinde yaygın model</li>
          </ul>
        </article>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "var(--color-text)" }}>
          Demo ihale kartları
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="card-warm transition-all hover:-translate-y-1 hover:border-[rgba(96,165,250,0.35)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                  <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
                    {c.rank}
                  </span>
                </div>
                <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                  {c.title}
                </p>
                <p className="text-lg font-bold mt-1" style={{ color: "var(--color-primary)" }}>
                  {c.amount}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-6 grid gap-6 md:grid-cols-2">
        <article className="card-warm">
          <h2 className="text-xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            Kapalı teklif mekaniği (simülasyon)
          </h2>
          <label className="block text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>
            Sizin teklifiniz (TRY)
            <input
              type="number"
              min={0}
              value={myBidTry}
              onChange={(event) => setMyBidTry(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>
            Kalan süre (saat)
            <input
              type="number"
              min={1}
              value={remainingHours}
              onChange={(event) => setRemainingHours(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRevealMode("sealed")}
              className={`rounded-lg px-3 py-2 text-xs ${revealMode === "sealed" ? "bg-cyan-500/20 text-cyan-200" : "bg-white/5 text-slate-300"}`}
            >
              Süre devam ediyor
            </button>
            <button
              type="button"
              onClick={() => setRevealMode("revealed")}
              className={`rounded-lg px-3 py-2 text-xs ${revealMode === "revealed" ? "bg-emerald-500/20 text-emerald-200" : "bg-white/5 text-slate-300"}`}
            >
              Süre doldu (aç)
            </button>
          </div>
          <p className="mt-3 text-xs" style={{ color: "var(--color-text-light)" }}>
            Canlıda teklif tutarları süre bitene kadar gizlenir. Süre dolunca sıralama raporu ilan sahibine açılır.
          </p>
        </article>

        <article className="card-warm">
          <h2 className="text-xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            Sonuç paneli
          </h2>
          <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>
            Durum: {revealMode === "sealed" ? "Teklifler gizli" : "Teklifler açıldı"} · Kalan süre: {remainingHours} saat
          </p>
          {revealMode === "sealed" ? (
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Sıralama gizli. Katılımcılar yalnızca başvurunun alındığını görür.
            </div>
          ) : (
            <ul className="space-y-2">
              {rankingPreview.map((row) => (
                <li key={row.rank} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
                  <span style={{ color: "var(--color-text)" }}>
                    {row.rank}. {row.label}
                  </span>
                  <strong style={{ color: "var(--color-primary)" }}>
                    ₺{row.amount.toLocaleString("tr-TR")}
                  </strong>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </PageShell>
  );
}
