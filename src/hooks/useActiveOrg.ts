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
    const activeOrgId = (session?.user?.app_metadata as Record<string, unknown> | undefined)
      ?.active_org_id as string | undefined;

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
