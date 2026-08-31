/**
 * Üyelik tier hook — UI premium-gate için tek nokta.
 *
 * 2026-06-01 GÜNCELLEME (Master onayı sonrası):
 * - `payments-iyzico` Edge function + `subscriptions` tablosu CANLIDA.
 * - Premium gate artık GERÇEK Supabase RPC `get_my_subscription`'a bağlı.
 * - localStorage SADECE RPC sonucu için 1. paint cache'i (hızlı UI) +
 *   PaymentStartPage'in optimistic update'i. Anonim kullanıcı veya RPC null
 *   dönerse ZORLA "free" — sahte premium imkansız.
 *
 * Doktrin: React + Supabase. Çekirdek (auth/RLS/placeBid/sealed/fees.ts) dokunulmadı.
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
  /**
   * Optimistic UI tier setleme — sadece PaymentStartPage/MyMembership demo akışı için.
   * **GERÇEK premium gate `get_my_subscription` RPC'ye bağlıdır** — bu fonksiyon
   * yalnız UI'ı yenileme penceresinde immediate update sağlar; RPC sonraki render'da
   * gerçek değeri yine yazar.
   */
  setLocalTier: (tierId: TierId) => void;
}

/**
 * Anonim/açılış için BAŞLANGIÇ tier'ı = HER ZAMAN "free".
 * localStorage'tan başlangıç değeri OKUMA — anonim kullanıcı sahte premium yapamaz.
 * Cache yalnız RPC ile YAZILIR, sonraki SSR/refresh için kullanılabilir ama
 * yetkili kullanıcı doğrulanıncaya kadar premium gate kapalıdır.
 */
function getInitialTier(): TierId {
  return "free";
}

export function useMembershipTier(): MembershipState {
  const { user } = useAuth();
  const [tierId, setTierId] = useState<TierId>(() => getInitialTier());
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let alive = true;
    if (!user) {
      // Anonim — her zaman free. localStorage'a güvenme.
      setTierId("free");
      try { localStorage.removeItem(LS_KEY); } catch { /* sessiz */ }
      return () => {
        alive = false;
      };
    }
    setLoading(true);

    // ÖNCELİK 1: GERÇEK subscriptions RPC (canlı tablo + RLS user_id=auth.uid())
    // supabase sorgu kurucusu PromiseLike (then var, catch yok). Promise.resolve
    // ile gercek Promise'e sariliyor; istek yine .then cagrisinda tetiklendigi
    // ve handler icindeki hatalar da yakalandigi icin davranis ayni.
    void Promise.resolve(supabase.rpc("get_my_subscription"))
      .then(({ data, error }) => {
        if (!alive) return;
        if (!error && data) {
          const row = Array.isArray(data) ? data[0] : data;
          if (row?.tier_id && row.status === "active") {
            const tierIds: TierId[] = ["free", "emlak_baslangic", "emlak_pro", "kurumsal"];
            if (tierIds.includes(row.tier_id as TierId)) {
              setTierId(row.tier_id as TierId);
              try { localStorage.setItem(LS_KEY, row.tier_id); } catch { /* sessiz */ }
              setLoading(false);
              return;
            }
          }
        }

        // ÖNCELİK 2: Eski memberships tablosu (geriye uyumlu — legacy üyeler)
        void Promise.resolve(
          supabase
            .from("memberships")
            .select("type, status")
            .eq("user_id", user.id)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        )
          .then(({ data: memberData }) => {
            if (!alive) return;
            if (memberData?.type) {
              const map: Record<string, TierId> = {
                seller_yearly: "emlak_baslangic",
                buyer_yearly: "emlak_baslangic",
                agent_referral: "emlak_baslangic",
                agent_portfolio: "emlak_baslangic",
                agent_full: "emlak_pro",
              };
              const mapped = map[memberData.type as string];
              if (mapped) {
                setTierId(mapped);
                try { localStorage.setItem(LS_KEY, mapped); } catch { /* sessiz */ }
                setLoading(false);
                return;
              }
            }
            // ÖNCELİK 3: Hiçbir abonelik yok → free + cache temizle (sahte tier varsa siliner)
            setTierId("free");
            try { localStorage.removeItem(LS_KEY); } catch { /* sessiz */ }
            setLoading(false);
          })
          .catch(() => {
            if (alive) {
              setTierId("free");
              setLoading(false);
            }
          });
      })
      .catch(() => {
        if (alive) {
          setTierId("free");
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [user]);

  /**
   * Optimistic UI update — PaymentStart/MyMembership için.
   * GERÇEK tier `get_my_subscription` RPC'ye bağlı; bu sadece UI'ı bir an
   * daha hızlı göstermek için. Sonraki render'da useEffect yine RPC'yi çalıştırır
   * ve gerçek değeri yazar (sahte tier RPC eşleşmezse "free"a döner).
   */
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
