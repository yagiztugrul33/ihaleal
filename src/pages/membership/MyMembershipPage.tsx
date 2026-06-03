import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Crown, Check, X, CheckCircle2, AlertTriangle, RefreshCw, ChevronUp, ChevronDown,
  Calendar, CreditCard, Receipt, ScrollText, Shield, ArrowUpRight,
} from "lucide-react";
import { useMembershipTier } from "@/hooks/useMembershipTier";
import { PRICING_TIERS, type TierId } from "@/lib/pricingTiers";
import { Button } from "@/components/ui/button";

export default function MyMembershipPage() {
  const navigate = useNavigate();
  const { tierId, tier, isPremium, setLocalTier } = useMembershipTier();

  const tierOrder: TierId[] = ["free", "yatirimci", "emlak_baslangic", "emlak_pro", "kurumsal"];
  const currentIdx = tierOrder.indexOf(tierId);
  const higherTiers = PRICING_TIERS.filter((t) => tierOrder.indexOf(t.id) > currentIdx);
  const lowerTiers = PRICING_TIERS.filter((t) => tierOrder.indexOf(t.id) < currentIdx);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-white gap-2"
        >
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
        </Button>

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="h-7 w-7 text-amber-400" />
            Üyeliğim
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Mevcut paketin, yükseltme seçenekleri, fatura geçmişi ve hesap yönetimi.
          </p>
        </div>

        {/* Mevcut paket kartı */}
        <div className={`rounded-2xl border ${isPremium ? "border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-slate-900/50" : "border-slate-700 bg-slate-900/40"} p-6`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Mevcut paketim</p>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {isPremium ? <Crown className="h-6 w-6 text-amber-400" /> : null}
                {tier.name}
              </h2>
              <p className="text-sm text-slate-400 mt-1">{tier.tagline}</p>
            </div>
            <div className="text-end">
              {tier.monthlyTry === 0 ? (
                <p className="text-3xl font-bold text-white">Ücretsiz</p>
              ) : (
                <>
                  <p className="text-3xl font-bold text-amber-300">₺{tier.monthlyTry.toLocaleString("tr-TR")}</p>
                  <p className="text-xs text-slate-400">/ay</p>
                </>
              )}
            </div>
          </div>

          {/* Mini özet — ilan limit, ekip, popüler özellikler */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-700">
            <div>
              <p className="text-[10px] text-slate-500 uppercase">İlan limiti</p>
              <p className="text-base font-semibold text-white">
                {tier.listingLimit === "unlimited" ? "∞" : `${tier.listingLimit}/yıl`}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Ekip üye</p>
              <p className="text-base font-semibold text-white">
                {tier.teamSeats === "unlimited" ? "∞" : tier.teamSeats}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Borsa Tam</p>
              <p className="text-base font-semibold text-white">
                {tier.features.find((f) => /Borsa terminel TAM/i.test(f.label))?.status === "included" ? "✓" : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Gerçek Kapanış</p>
              <p className="text-base font-semibold text-white">
                {tier.features.find((f) => /Gerçek kapanış/i.test(f.label))?.status === "included" ? "✓" : "—"}
              </p>
            </div>
          </div>

          {!isPremium && (
            <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 flex items-center gap-3">
              <Crown className="h-5 w-5 text-amber-300 flex-shrink-0" />
              <p className="text-xs text-amber-100 flex-1">
                Premium paketler ile borsa terminel + sınırsız rapor + gerçek kapanış verisi açılır.
              </p>
              <Button
                size="sm"
                onClick={() => navigate("/fiyatlandirma")}
                className="bg-amber-600 hover:bg-amber-500 text-white"
              >
                Yükselt
              </Button>
            </div>
          )}
        </div>

        {/* Yükselt / Düşür seçenekleri */}
        {(higherTiers.length > 0 || lowerTiers.length > 0) && (
          <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-cyan-400" />
              Paket Değiştir
            </h3>

            {higherTiers.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-emerald-300 font-semibold mb-2 flex items-center gap-1.5">
                  <ChevronUp className="h-3.5 w-3.5" /> Yükselt
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {higherTiers.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => navigate(`/odeme/baslat?paket=${t.id}&periyot=monthly`)}
                      className="text-start rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800/60 p-3 transition-colors"
                    >
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{t.tagline}</p>
                      <p className="text-xs text-emerald-300 mt-1">₺{t.monthlyTry.toLocaleString("tr-TR")}/ay</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {lowerTiers.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
                  <ChevronDown className="h-3.5 w-3.5" /> Düşür
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {lowerTiers.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => navigate(`/odeme/baslat?paket=${t.id}&periyot=monthly`)}
                      className="text-start rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800/60 p-3 transition-colors"
                    >
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{t.tagline}</p>
                      <p className="text-xs text-slate-300 mt-1">
                        {t.monthlyTry === 0 ? "Ücretsiz" : `₺${t.monthlyTry.toLocaleString("tr-TR")}/ay`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fatura geçmişi (UI iskelet) */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
          <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-cyan-400" />
            Fatura Geçmişi
          </h3>
          {isPremium ? (
            <ul className="divide-y divide-slate-800 text-sm">
              <li className="flex items-center justify-between py-3">
                <div>
                  <p className="text-slate-300">Mayıs 2026 — {tier.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> 01.05.2026 · Kart **** 4242
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-emerald-300 font-semibold">₺{tier.monthlyTry.toLocaleString("tr-TR")}</p>
                  <p className="text-xs text-slate-500">Ödendi</p>
                </div>
              </li>
              <li className="flex items-center justify-between py-3">
                <div>
                  <p className="text-slate-300">Nisan 2026 — {tier.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> 01.04.2026 · Kart **** 4242
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-emerald-300 font-semibold">₺{tier.monthlyTry.toLocaleString("tr-TR")}</p>
                  <p className="text-xs text-slate-500">Ödendi</p>
                </div>
              </li>
            </ul>
          ) : (
            <p className="empty-state text-sm">
              <Receipt className="mx-auto mb-2 h-8 w-8 opacity-50" />
              Henüz faturan yok. Premium pakete geçince burada görünür.
            </p>
          )}
        </div>

        {/* Ödeme yöntemi */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
          <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-cyan-400" />
            Ödeme Yöntemi
          </h3>
          {isPremium ? (
            <div className="flex items-center justify-between rounded-lg bg-slate-900/60 p-3 border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-blue-500/20 px-2 py-1 text-blue-300 text-xs font-bold">VISA</div>
                <div>
                  <p className="text-sm text-slate-200">**** **** **** 4242</p>
                  <p className="text-[10px] text-slate-500">12 / 28</p>
                </div>
              </div>
              <button type="button" className="text-xs text-cyan-300 hover:underline">
                Değiştir
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Henüz kayıtlı kart yok.</p>
          )}
        </div>

        {/* Tier dev/demo toggler (sadece UI test) */}
        <details className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <summary className="cursor-pointer text-xs text-amber-300 font-semibold flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Geliştirici / Demo — Tier Değiştir (UI test amaçlı)
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRICING_TIERS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setLocalTier(t.id)}
                className={`text-xs rounded-md px-3 py-1.5 border ${tierId === t.id ? "bg-amber-500 text-slate-900 border-amber-400" : "border-slate-700 text-slate-300 hover:bg-slate-800"}`}
              >
                {t.name}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Bu seçim sadece tarayıcında saklanır (localStorage). Gerçek tier Supabase'den okunur.
          </p>
        </details>

        {/* İptal + Yasal */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
          <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            Hesap Yönetimi
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-slate-300">Aboneliği iptal et</span>
              <button
                type="button"
                onClick={() => navigate("/abone/iptal")}
                className="text-xs text-rose-300 hover:underline"
              >
                İptal akışı →
              </button>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-slate-300">KVKK + Aydınlatma metni</span>
              <button
                type="button"
                onClick={() => navigate("/kvkk")}
                className="text-xs text-cyan-300 hover:underline"
              >
                Görüntüle →
              </button>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-slate-300">Fiyatlandırma + tüm paketler</span>
              <button
                type="button"
                onClick={() => navigate("/fiyatlandirma")}
                className="text-xs text-cyan-300 hover:underline flex items-center gap-1"
              >
                Görüntüle <ArrowUpRight className="h-3 w-3" />
              </button>
            </li>
          </ul>
        </div>

        <p className="text-[10px] text-slate-500 text-center pt-2">
          Tüm üyelik işlemleri 6098 BK + 6502 TKHK + 6698 KVKK uyumludur. Sorular: <a href="mailto:destek@ihaleal.com" className="text-cyan-300 underline">destek@ihaleal.com</a>
        </p>
      </div>
    </main>
  );
}
