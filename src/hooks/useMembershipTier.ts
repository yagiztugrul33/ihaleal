/**
 * Üyelik tier hook — UI premium-gate için tek nokta.
 *
 * MASTER NOT: Bu hook şimdilik localStorage + (varsa) Supabase `memberships`
 * tablosundan tier okur. Gerçek RLS-bound tier kolonu Supabase migration
 * ile MASTER onayında eklenecek (BLOK 6 raporda yazılı).
 *
 * Doktrin: React + Supabase. Hiçbir core auth/RLS dokunulmadı; bu hook
 * sadece OKUR (yazma + RLS değişimi MASTER onayı bekler).
 */

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { PRICING_TIERS, type TierId, type PricingTier } from "@/lib/pricingTiers";

const LS_KEY = "ihaleal_membership_tier";

interface MembershipState {
  tierId: TierId;
  tier: PricingTier;
  isPremium: boolean;
  loading: boolean;
  /** Anonim/free kullanıcı için "yükselt" CTA göster */
  showUpgradeCta: boolean;
  /** Bir özelliğin bu tier'da açık olup olmadığını kontrol et */
  hasFeature: (label: string) => boolean;
  /** Manuel tier setleme — dev/demo amaçlı; UI'ya bağlı değil */
  setLocalTier: (tierId: TierId) => void;
}

function getTierFromCache(): TierId {
  if (typeof window === "undefined") return "free";
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return "free";
    const valid = PRICING_TIERS.map((t) => t.id);
    if (valid.includes(raw as TierId)) return raw as TierId;
  } catch {
    /* sessiz */
  }
  return "free";
}

export function useMembershipTier(): MembershipState {
  const { user } = useAuth();
  const [tierId, setTierId] = useState<TierId>(() => getTierFromCache());
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let alive = true;
    if (!user) {
      // User yoksa localStorage'taki tier'i koru (dev/demo amaçlı)
      // Production: anonim ziyaretçi free olur — localStorage temizse zaten "free".
      return () => {
        alive = false;
      };
    }
    setLoading(true);
    // Önce mevcut memberships tablosundan oku (uyelik tipi → tier map)
    void supabase
      .from("memberships")
      .select("type, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        if (data?.type) {
          // Map eski membership.type → yeni tier
          const map: Record<string, TierId> = {
            seller_yearly: "emlak_baslangic",
            buyer_yearly: "yatirimci",
            agent_referral: "emlak_baslangic",
            agent_portfolio: "emlak_baslangic",
            agent_full: "emlak_pro",
          };
          const mapped = map[data.type as string];
          if (mapped) {
            setTierId(mapped);
            try {
              localStorage.setItem(LS_KEY, mapped);
            } catch {
              /* sessiz */
            }
          }
        }
        setLoading(false);
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  const setLocalTier = useCallback((newTier: TierId) => {
    setTierId(newTier);
    try {
      localStorage.setItem(LS_KEY, newTier);
    } catch {
      /* sessiz */
    }
  }, []);

  const tier = PRICING_TIERS.find((t) => t.id === tierId) ?? PRICING_TIERS[0];
  const isPremium = tierId !== "free";
  const showUpgradeCta = !isPremium;

  const hasFeature = useCallback(
    (label: string): boolean => {
      const f = tier.features.find((x) => x.label === label);
      return f?.status === "included";
    },
    [tier],
  );

  return { tierId, tier, isPremium, loading, showUpgradeCta, hasFeature, setLocalTier };
}
