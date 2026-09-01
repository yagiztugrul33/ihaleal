import { useNavigate } from "react-router-dom";
import { Lock, Sparkles, ArrowUpRight } from "lucide-react";
import { useMembershipTier } from "@/hooks/useMembershipTier";
import { PRICING_TIERS, type TierId } from "@/lib/pricingTiers";

interface PremiumGateProps {
  /** Bu özellik için minimum gereken tier — örn. "yatirimci" */
  requiredTier?: TierId;
  /** Özellik label (pricingTiers.features içindeki label ile eşleşmeli) */
  featureLabel?: string;
  /** Üst başlık (CTA kartı) */
  title: string;
  /** Açıklama */
  description: string;
  /** Bypass / fallback: kullanıcı premium ise içerik göster, değilse kart göster */
  children?: React.ReactNode;
  /** Tier önerisi UI'da hangi paket önerilsin? */
  recommendTier?: TierId;
  /** Kompakt mod (chip / küçük kart) */
  compact?: boolean;
}

/**
 * PremiumGate — premium kilitli içerikleri sarmalar.
 *
 * Davranış:
 *  - Kullanıcı yeterli tier'a sahipse `children` direkt render edilir.
 *  - Değilse "Yükselt" CTA kartı görünür; tıklayınca /fiyatlandirma'ya gider.
 *
 * Anayasa: server-side enforcement DEĞİL — bu UI hint. Gerçek enforcement
 * Supabase RLS + Edge function tarafında olmalı (BLOK 6 raporda kayıtlı).
 */
export function PremiumGate({
  requiredTier,
  featureLabel,
  title,
  description,
  children,
  recommendTier = "emlak_baslangic",
  compact = false,
}: PremiumGateProps) {
  const navigate = useNavigate();
  const { tierId, hasFeature, isPremium } = useMembershipTier();

  // Karar: kullanıcı bu içeriği görebilir mi?
  let unlocked = false;
  if (requiredTier) {
    const tierOrder: TierId[] = ["free", "emlak_baslangic", "emlak_pro", "kurumsal"];
    const userIdx = tierOrder.indexOf(tierId);
    const requiredIdx = tierOrder.indexOf(requiredTier);
    unlocked = userIdx >= requiredIdx;
  } else if (featureLabel) {
    unlocked = hasFeature(featureLabel);
  } else {
    unlocked = isPremium;
  }

  if (unlocked) {
    return <>{children}</>;
  }

  const rec = PRICING_TIERS.find((t) => t.id === recommendTier);

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => navigate(`/fiyatlandirma?onerilen=${recommendTier}`)}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-1 text-xs text-[var(--metin-ikincil)] hover:bg-white/5 transition-colors"
        aria-label={`${title} — premium özellik, yükselt`}
      >
        <Lock className="h-3 w-3" />
        <span>{title} — Premium</span>
        <ArrowUpRight className="h-3 w-3" />
      </button>
    );
  }

  return (
    <div className="relative rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-6 overflow-hidden">
      {/* Lock badge */}
      <div className="absolute top-3 end-3 inline-flex items-center gap-1 rounded-full border border-[var(--cizgi)] bg-[var(--zemin)] px-2 py-1 text-[10px] font-normal text-[var(--metin-ikincil)]">
        <Lock className="h-3 w-3" /> Premium
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div className="rounded-full bg-[var(--zemin)] p-2">
          <Sparkles className="h-5 w-5 text-[var(--metin-ikincil)]" />
        </div>
        <div className="flex-1 pe-16">
          <h3 className="text-lg font-normal text-white mb-1">{title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
        </div>
      </div>

      {rec && (
        <div className="rounded-[10px] border border-[var(--cizgi)] bg-slate-900/40 p-3 mb-4">
          <p className="text-xs text-slate-400 mb-1">Önerilen paket</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-normal text-white">{rec.name}</p>
              <p className="text-xs text-slate-400">{rec.tagline}</p>
            </div>
            <div className="text-end">
              <p className="text-xl font-normal text-white">₺{rec.monthlyTry.toLocaleString("tr-TR")}</p>
              <p className="text-[10px] text-slate-400">/ay</p>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate(`/fiyatlandirma?onerilen=${recommendTier}`)}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[var(--metin)] hover:bg-white text-[var(--zemin)] text-sm font-normal"
      >
        <Sparkles className="h-4 w-4" />
        Paketleri Gör ve Yükselt
      </button>

      <p className="text-[10px] text-slate-500 text-center mt-2">
        14 gün ücretsiz iade · İstediğin zaman iptal
      </p>
    </div>
  );
}

/**
 * PremiumChip — küçük inline rozet ("Pro" / "Yatırımcı" gibi) gösterir.
 * İçerikte değil; sadece "şu özellik premium" sinyali.
 */
export function PremiumChip({ tier: tierProp = "emlak_baslangic" }: { tier?: TierId }) {
  const navigate = useNavigate();
  const t = PRICING_TIERS.find((x) => x.id === tierProp);
  if (!t) return null;

  return (
    <button
      type="button"
      onClick={() => navigate(`/fiyatlandirma?onerilen=${tierProp}`)}
      className="inline-flex items-center gap-1 rounded-full border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)] px-2 py-0.5 text-[10px] font-normal hover:opacity-80"
      aria-label={`${t.name} paketinde mevcut — yükselt`}
    >
      <Sparkles className="h-2.5 w-2.5" />
      {t.name}
    </button>
  );
}
