import { useMemo, useState } from "react";
import { BadgeCheck, Gift, History, Medal, PlusCircle } from "lucide-react";
import {
  buildTransactionPoints,
  DEMO_REWARDS_NOTE,
  REWARD_ACTIONS,
  REWARD_CATALOG,
  type RewardLedgerItem,
} from "@/lib/gamification/loyalty";

const LEDGER_KEY = "ihaleal_rewards_ledger";
const BALANCE_KEY = "ihaleal_rewards_balance";

function loadLedger(): RewardLedgerItem[] {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RewardLedgerItem[]) : [];
  } catch {
    return [];
  }
}

function loadBalance(): number {
  try {
    const raw = localStorage.getItem(BALANCE_KEY);
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export default function LoyaltyProgramPage() {
  const [balance, setBalance] = useState<number>(() => loadBalance());
  const [ledger, setLedger] = useState<RewardLedgerItem[]>(() => loadLedger());
  const [transactionAmount, setTransactionAmount] = useState("500000");

  const progressRatio = useMemo(() => {
    const target = 1500;
    return Math.min(100, Math.round((balance / target) * 100));
  }, [balance]);

  const persist = (nextBalance: number, nextLedger: RewardLedgerItem[]) => {
    setBalance(nextBalance);
    setLedger(nextLedger);
    localStorage.setItem(BALANCE_KEY, String(nextBalance));
    localStorage.setItem(LEDGER_KEY, JSON.stringify(nextLedger));
  };

  const addPoints = (actionLabel: string, points: number, note?: string) => {
    if (points <= 0) return;
    const item: RewardLedgerItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      action: actionLabel,
      points,
      createdAt: new Date().toISOString(),
      note,
    };
    const nextLedger = [item, ...ledger].slice(0, 80);
    const nextBalance = balance + points;
    persist(nextBalance, nextLedger);
  };

  const redeemReward = (cost: number, title: string) => {
    if (balance < cost) return;
    const item: RewardLedgerItem = {
      id: `redeem-${Date.now()}`,
      action: `Ödül kullanımı: ${title}`,
      points: -cost,
      createdAt: new Date().toISOString(),
      note: "Demo kullanım kaydı",
    };
    const nextLedger = [item, ...ledger].slice(0, 80);
    const nextBalance = balance - cost;
    persist(nextBalance, nextLedger);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-16 pt-24 text-slate-100 lg:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-cyan-300">İhaleal Rewards</p>
          <h1 className="mt-1 text-3xl font-black">Puanlarım</h1>
          <p className="mt-2 text-sm text-slate-300">{DEMO_REWARDS_NOTE}</p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Puan bakiyesi</p>
            <strong className="mt-2 block text-3xl font-black text-cyan-200">{balance.toLocaleString("tr-TR")}</strong>
          </article>
          <article className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">İlerleme</p>
            <strong className="mt-2 block text-xl font-bold text-white">%{progressRatio} hedefe yakın</strong>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${progressRatio}%` }} />
            </div>
          </article>
          <article className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">İşlem bazlı puan</p>
            <label className="mt-2 block text-xs text-slate-300">
              İşlem tutarı (TRY)
              <input
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </label>
            <button
              type="button"
              onClick={() =>
                addPoints(
                  "İşlem tamamlandı",
                  120 + buildTransactionPoints(Number(transactionAmount)),
                  `${transactionAmount} TRY işlem`,
                )
              }
              className="mt-3 inline-flex items-center gap-1 rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100"
            >
              <PlusCircle className="h-4 w-4" /> İşlem puanını işle
            </button>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
            <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-bold text-white">
              <Medal className="h-5 w-5 text-cyan-300" />
              Puan Kazanma Aksiyonları
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {REWARD_ACTIONS.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => addPoints(action.label, action.basePoints, action.description)}
                  className="rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-left transition hover:border-cyan-400/40"
                >
                  <p className="text-sm font-semibold text-white">{action.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{action.description}</p>
                  <p className="mt-2 text-xs font-bold text-emerald-300">+{action.basePoints} puan</p>
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
            <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-bold text-white">
              <Gift className="h-5 w-5 text-amber-300" />
              Ödül Kataloğu
            </h2>
            <div className="space-y-2">
              {REWARD_CATALOG.map((reward) => (
                <div key={reward.id} className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                  <p className="text-sm font-semibold text-white">{reward.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{reward.detail}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-200">{reward.cost} puan</span>
                    <button
                      type="button"
                      onClick={() => redeemReward(reward.cost, reward.title)}
                      disabled={balance < reward.cost}
                      className="rounded-md border border-amber-400/50 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Kullan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
          <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-bold text-white">
            <History className="h-5 w-5 text-violet-300" />
            Puan Geçmişi
          </h2>
          <div className="space-y-2">
            {ledger.length === 0 ? (
              <p className="rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-400">Henüz puan hareketi yok.</p>
            ) : (
              ledger.slice(0, 18).map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.action}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleString("tr-TR")} {item.note ? `· ${item.note}` : ""}
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${item.points >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                    {item.points >= 0 ? "+" : ""}
                    {item.points}
                  </span>
                </div>
              ))
            )}
          </div>
          <p className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-200">
            <BadgeCheck className="h-4 w-4" />
            İşlem bazlı ödül puanları temsili/demo akışıdır.
          </p>
        </section>
      </div>
    </div>
  );
}
