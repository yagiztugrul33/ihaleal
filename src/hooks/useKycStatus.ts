import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type KycStatusValue = "none" | "pending" | "verified" | "rejected" | "in_review" | "unknown";

function normalizeProfileStatus(raw: unknown): KycStatusValue {
  if (raw === "verified") return "verified";
  if (raw === "rejected") return "rejected";
  if (raw === "pending" || raw === "none") return raw;
  if (raw === "in_review") return "in_review";
  return "unknown";
}

function isMissingSchemaError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const code = err.code ?? "";
  const msg = (err.message ?? "").toLowerCase();
  return (
    code === "PGRST205" ||
    code === "42P01" ||
    msg.includes("does not exist") ||
    msg.includes("could not find")
  );
}

export function useKycStatus(userId: string | null) {
  const [profileStatus, setProfileStatus] = useState<KycStatusValue>("none");
  const [latestSubmission, setLatestSubmission] = useState<{ id: string; status: string; createdAt: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!userId || !isSupabaseConfigured()) {
      setProfileStatus("none");
      setLatestSubmission(null);
      return;
    }
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("kyc_status")
        .eq("id", userId)
        .maybeSingle();
      setProfileStatus(normalizeProfileStatus(profile?.kyc_status));

      const { data: rows, error } = await supabase
        .from("kyc_verifications")
        .select("id, status, created_at")
        .eq("submitted_by", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error && isMissingSchemaError(error)) {
        setLatestSubmission(null);
        return;
      }
      const row = rows?.[0];
      if (row) {
        setLatestSubmission({
          id: String(row.id),
          status: String(row.status),
          createdAt: String(row.created_at),
        });
      } else {
        setLatestSubmission(null);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const displayStatus: KycStatusValue =
    latestSubmission?.status === "in_review"
      ? "in_review"
      : profileStatus === "verified"
        ? "verified"
        : profileStatus === "rejected"
          ? "rejected"
          : latestSubmission
            ? "pending"
            : profileStatus;

  return { profileStatus, latestSubmission, displayStatus, loading, reload };
}
