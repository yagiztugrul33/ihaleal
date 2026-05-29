import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function readActiveOrgIdFromSession(session: Session | null): string | undefined {
  const raw = (session?.user?.app_metadata as Record<string, unknown> | undefined)?.active_org_id;
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}

export async function getActiveOrgId(): Promise<string | undefined> {
  const { data: { session } } = await supabase.auth.getSession();
  return readActiveOrgIdFromSession(session);
}
