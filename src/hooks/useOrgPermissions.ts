import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useActiveOrg } from "./useActiveOrg";

type Role = "owner" | "admin" | "manager" | "agent" | "viewer";

const ROLE_RANK: Record<Role, number> = {
  viewer: 1,
  agent: 2,
  manager: 3,
  admin: 4,
  owner: 5,
};

const PERMISSIONS: Record<string, Role> = {
  "listings.create": "agent",
  "listings.bulk_upload": "manager",
  "members.invite": "admin",
  "billing.manage": "admin",
  "org.settings": "admin",
};

export function useOrgPermissions() {
  const { org } = useActiveOrg();
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    if (!org) {
      setRole(null);
      return;
    }
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        return;
      }
      const { data } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", org.id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      setRole((data?.role as Role) ?? null);
    })();
  }, [org]);

  const can = (perm: string): boolean => {
    if (!role) return false;
    const required = PERMISSIONS[perm];
    if (!required) return false;
    return ROLE_RANK[role] >= ROLE_RANK[required];
  };

  return { role, can };
}
