import { useMemo, useState } from "react";
import { BadgeCheck, Gamepad2, Gift, History, Medal, PlusCircle, Trophy } from "lucide-react";
import { getAllProperties } from "@/lib/demo-data";
import { getPropertyPrice, getPropertyTitle } from "@/types/property";
import {
  BADGE_DEFINITIONS,
  buildTransactionPoints,
  DEMO_LEADERBOARD,
  DEMO_REWARDS_NOTE,
  GAMIFICATION_NOTE,
  MISSIONS,
  REWARD_ACTIONS,
  REWARD_CATALOG,
  VIP_TIERS,
  type RewardLedgerItem,
} from "@/lib/gamification/loyalty";

const LEDGER_KEY = "ihaleal_rewards_ledger";
const BALANCE_KEY = "ihaleal_rewards_balance";
const MISSION_KEY = "ihaleal_rewards_missions";
const REFERRAL_KEY = "ihaleal_referral_count";
const VOLUME_KEY = "ihaleal_vip_volume";
type TabKey = "points" | "game" | "vip";

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
  const [activeTab, setActiveTab] = useState<TabKey>("points");
  const [balance, setBalance] = useState<number>(() => loadBalance());
  const [ledger, setLedger] = useState<RewardLedgerItem[]>(() => loadLedger());
  const [transactionAmount, setTransactionAmount] = useState("500000");
  const [missionsDone, setMissionsDone] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(MISSION_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [predictionValue, setPredictionValue] = useState("");
  const [predictionResult, setPredictionResult] = useState<string>("");
  const [referralCount, setReferralCount] = useState<number>(() => {
    const raw = localStorage.getItem(REFERRAL_KEY);
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) ? value : 0;
  });
  const [vipVolumeTry, setVipVolumeTry] = useState<number>(() => {
    const raw = localStorage.getItem(VOLUME_KEY);
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) ? value : 0;
  });
  const [volumeInput, setVolumeInput] = useState("");

  const predictionAsset = useMemo(() => {
    const pool = getAllProperties().filter((p) => getPropertyPrice(p));
    return pool[Math.floor(Date.now() / 1000) % Math.max(1, pool.length)] ?? null;
  }, []);

  const progressRatio = useMemo(() => {
    const target = 1500;
    return Math.min(100, Math.round((balance / target) * 100));
  }, [balance]);

  const badges = useMemo(() => {
    const joinCount = ledger.filter((item) => item.action.includes("İhaleye katılma")).length;
    return BADGE_DEFINITIONS.map((badge) => {
      const unlocked =
        (badge.id === "first_bid" && joinCount >= 1) ||
        (badge.id === "five_auctions" && joinCount >= 5) ||
        (badge.id === "region_expert" && missionsDone.includes("first_share")) ||
        (badge.id === "early_user" && ledger.length >= 3);
      return { ...badge, unlocked };
    });
  }, [ledger, missionsDone]);

  const vipTier = useMemo(() => {
    const reversed = [...VIP_TIERS].reverse();
    return reversed.find((tier) => balance >= tier.minPoints && vipVolumeTry >= tier.minVolumeTry) ?? VIP_TIERS[0];
  }, [balance, vipVolumeTry]);

  const referralLink = useMemo(() => {
    const seed = "IH" + Math.abs(Math.round((balance + referralCount * 17) * 1.37)).toString(36).toUpperCase();
    return `${window.location.origin}/kayit?ref=${seed}`;
  }, [balance, referralCount]);

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

  const completeMission = (id: string) => {
    if (missionsDone.includes(id)) return;
    const mission = MISSIONS.find((item) => item.id === id);
    if (!mission) return;
    const next = [...missionsDone, id];
    setMissionsDone(next);
    localStorage.setItem(MISSION_KEY, JSON.stringify(next));
    addPoints(`Görev tamamlandı: ${mission.title}`, mission.points, "Gamification görev bonusu");
  };

  const submitPrediction = () => {
    if (!predictionAsset) return;
    const estimate = Number(predictionValue);
    const actual = getPropertyPrice(predictionAsset) ?? 0;
    if (!Number.isFinite(estimate) || estimate <= 0 || actual <= 0) return;
    const diffRatio = Math.abs(actual - estimate) / actual;
    const points = diffRatio <= 0.05 ? 80 : diffRatio <= 0.1 ? 45 : diffRatio <= 0.2 ? 25 : 10;
    const title = diffRatio <= 0.05 ? "Tahminin çok yakın!" : "Tahmin oyunu tamamlandı";
    setPredictionResult(
      `${title} Gerçek: ${actual.toLocaleString("tr-TR")} TRY, Tahmin: ${estimate.toLocaleString("tr-TR")} TRY.`,
    );
    addPoints("İhaleal Tahmin Oyunu", points, `${Math.round(diffRatio * 100)}% sapma`);
    setPredictionValue("");
  };

  const recordReferral = () => {
    const next = referralCount + 1;
    setReferralCount(next);
    localStorage.setItem(REFERRAL_KEY, String(next));
    addPoints("Davet ile yeni kullanıcı", 60, "Davet et, ikiniz kazanın (demo)");
  };

  const addVipVolume = () => {
    const amount = Number(volumeInput);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const next = vipVolumeTry + amount;
    setVipVolumeTry(next);
    localStorage.setItem(VOLUME_KEY, String(next));
    setVolumeInput("");
    addPoints("VIP işlem hacmi", Math.max(10, Math.round(amount / 90_000)), `${amount.toLocaleString("tr-TR")} TRY işlem`);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-16 pt-24 text-slate-100 lg:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-cyan-300">İhaleal Rewards</p>
          <h1 className="mt-1 text-3xl font-black">Puanlarım</h1>
          <p className="mt-2 text-sm text-slate-300">{DEMO_REWARDS_NOTE}</p>
          <div className="mt-4 inline-flex rounded-lg border border-slate-600/70 bg-slate-950/70 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("points")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${activeTab === "points" ? "bg-cyan-500/20 text-cyan-100" : "text-slate-300"}`}
            >
              Ödül & Puan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("game")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${activeTab === "game" ? "bg-cyan-500/20 text-cyan-100" : "text-slate-300"}`}
            >
              Oyunlaştırma
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("vip")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${activeTab === "vip" ? "bg-cyan-500/20 text-cyan-100" : "text-slate-300"}`}
            >
              Davet & VIP
            </button>
          </div>
        </section>

        {activeTab === "points" ? (
          <>
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
          </>
        ) : activeTab === "game" ? (
          <>
            <section className="rounded-2xl border border-violet-400/20 bg-slate-900/70 p-4">
              <p className="text-sm text-violet-200">{GAMIFICATION_NOTE}</p>
            </section>
            <section className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
              <article className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
                <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-bold">
                  <Trophy className="h-5 w-5 text-amber-300" /> Rozetler & Başarımlar
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {badges.map((badge) => (
                    <div key={badge.id} className={`rounded-lg border p-3 ${badge.unlocked ? "border-amber-400/40 bg-amber-500/10" : "border-slate-700 bg-slate-950/70"}`}>
                      <p className="text-lg">{badge.icon}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{badge.title}</p>
                      <p className="text-xs text-slate-400">{badge.rule}</p>
                      <p className={`mt-2 text-[11px] font-bold ${badge.unlocked ? "text-emerald-300" : "text-slate-500"}`}>
                        {badge.unlocked ? "Kazanıldı" : "Kilitli"}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
              <article className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
                <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-bold">
                  <Medal className="h-5 w-5 text-cyan-300" /> Liderlik Tablosu
                </h2>
                <div className="space-y-2">
                  {DEMO_LEADERBOARD.map((row, idx) => (
                    <div key={row.alias} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2">
                      <span className="text-sm text-slate-200">#{idx + 1} {row.alias}</span>
                      <strong className="text-sm text-cyan-200">{row.score.toLocaleString("tr-TR")} puan</strong>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-400">Takma ad/anonim leaderboard demo verisiyle oluşturulur.</p>
              </article>
            </section>
            <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
              <article className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
                <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-bold">
                  <Gamepad2 className="h-5 w-5 text-cyan-300" /> İHALEAL Tahmin Oyunu
                </h2>
                <p className="text-sm text-slate-300">
                  Zestimate uyarlaması (demo): mülk fiyatını tahmin et, yaklaştıkça puan kazan.
                </p>
                {predictionAsset ? (
                  <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                    <p className="text-sm font-semibold text-white">{getPropertyTitle(predictionAsset)}</p>
                    <label className="mt-2 block text-xs text-slate-300">
                      Tahmin fiyatı (TRY)
                      <input
                        value={predictionValue}
                        onChange={(e) => setPredictionValue(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={submitPrediction}
                      className="mt-3 rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100"
                    >
                      Tahmini gönder
                    </button>
                    {predictionResult ? <p className="mt-3 text-xs text-emerald-300">{predictionResult}</p> : null}
                  </div>
                ) : null}
              </article>
              <article className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
                <h2 className="mb-3 text-lg font-bold text-white">Görevler</h2>
                <div className="space-y-2">
                  {MISSIONS.map((mission) => {
                    const done = missionsDone.includes(mission.id);
                    return (
                      <div key={mission.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{mission.title}</p>
                          <p className="text-xs text-slate-400">+{mission.points} puan</p>
                        </div>
                        <button
                          type="button"
                          disabled={done}
                          onClick={() => completeMission(mission.id)}
                          className="rounded-md border border-emerald-400/50 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-100 disabled:opacity-40"
                        >
                          {done ? "Tamamlandı" : "Tamamla"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </article>
            </section>
          </>
        ) : (
          <>
            <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
              <article className="rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-4">
                <h2 className="text-lg font-bold text-white">Davet Programı</h2>
                <p className="mt-1 text-sm text-slate-300">Kişiye özel linkle davet et, ikiniz de puan kazan (demo/temsili).</p>
                <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                  <p className="text-xs text-slate-400">Davet linkin</p>
                  <p className="mt-1 break-all text-sm font-semibold text-cyan-200">{referralLink}</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(referralLink);
                    }}
                    className="rounded-md border border-cyan-400/50 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100"
                  >
                    Linki kopyala
                  </button>
                  <button
                    type="button"
                    onClick={recordReferral}
                    className="rounded-md border border-emerald-400/50 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100"
                  >
                    Davet dönüşümü simüle et
                  </button>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Toplam başarılı davet: <strong className="text-cyan-200">{referralCount}</strong>
                </p>
              </article>
              <article className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
                <h2 className="text-lg font-bold text-white">VIP Kademe Profili</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Aktif kademe: <strong className="text-amber-200">{vipTier.title}</strong>
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Puan: {balance.toLocaleString("tr-TR")} · Hacim: {vipVolumeTry.toLocaleString("tr-TR")} TRY
                </p>
                <label className="mt-3 block text-xs text-slate-300">
                  Yeni işlem hacmi (TRY)
                  <input
                    value={volumeInput}
                    onChange={(e) => setVolumeInput(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={addVipVolume}
                  className="mt-3 rounded-md border border-amber-400/50 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-100"
                >
                  Hacim ekle
                </button>
              </article>
            </section>
            <section className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4">
              <h3 className="mb-3 text-lg font-bold text-white">Kademe Ayrıcalıkları</h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {VIP_TIERS.map((tier) => (
                  <article
                    key={tier.id}
                    className={`rounded-xl border p-3 ${tier.id === vipTier.id ? "border-amber-400/60 bg-amber-500/10" : "border-slate-700 bg-slate-950/70"}`}
                  >
                    <p className="text-sm font-bold text-white">{tier.title}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Min {tier.minPoints} puan · {tier.minVolumeTry.toLocaleString("tr-TR")} TRY
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-slate-300">
                      {tier.perks.map((perk) => (
                        <li key={perk}>• {perk}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              <p className="mt-3 text-xs text-cyan-200">
                VIP kademe, ayrıcalık ve davet akışı demo/temsili modeldir.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
