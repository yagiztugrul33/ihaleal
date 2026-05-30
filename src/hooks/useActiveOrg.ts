import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type Organization = {
  id: string;
  slug: string;
  display_name: string;
  plan: "free" | "agency" | "gyo" | "enterprise";
  kyc_status: string;
};

export function useActiveOrg() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setOrg(null);
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    let activeOrgId = (session?.user?.app_metadata as Record<string, unknown> | undefined)
      ?.active_org_id as string | undefined;

    // FALLBACK: JWT'de active_org_id YOK ama user'in tek/ilk active membership'i varsa
    // onu sec ve set_active_org ile JWT'yi kalıcı güncelle (login sonrası bos JWT durumu).
    if (!activeOrgId && userId) {
      const { data: mem } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("joined_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      const firstOrgId = (mem as { organization_id?: string } | null)?.organization_id;
      if (firstOrgId) {
        activeOrgId = firstOrgId;
        // Bonus: JWT app_metadata'yi de set et ki sonraki acilislarda fallback gerekmesin
        try {
          await supabase.rpc("set_active_org", { p_org_id: firstOrgId });
          await supabase.auth.refreshSession();
        } catch {
          /* sessiz — sadece bu render icin org'u yakaladik, yeterli */
        }
      }
    }

    if (!activeOrgId) {
      setOrg(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("organizations")
      .select("id, slug, display_name, plan, kyc_status")
      .eq("id", activeOrgId)
      .maybeSingle();

    if (error) {
      setOrg(null);
    } else {
      setOrg((data as Organization) ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void load();
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const switchOrg = useCallback(async (orgId: string | null) => {
    const { error } = await supabase.rpc("set_active_org", { p_org_id: orgId });
    if (error) throw error;
    await supabase.auth.refreshSession();
    await load();
  }, [load]);

  return { org, loading, switchOrg, reload: load };
}
