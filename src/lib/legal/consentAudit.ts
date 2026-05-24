export type ConsentAuditEvent = {
  listingId: string;
  action: "bid" | "buy_now";
  userId: string;
  acceptedAtIso: string;
  acceptedAtLocal: string;
  note: string;
  bidGateVersion?: string;
  taxConfigSignature?: string;
};

export function persistConsentAudit(event: ConsentAuditEvent): void {
  const key = `ihaleal_consent_audit_${event.listingId}_${event.userId}`;
  try {
    const raw = localStorage.getItem(key);
    const rows = raw ? (JSON.parse(raw) as ConsentAuditEvent[]) : [];
    rows.unshift(event);
    localStorage.setItem(key, JSON.stringify(rows.slice(0, 20)));
  } catch {
    // ignore audit persistence failures in demo mode
  }
}

