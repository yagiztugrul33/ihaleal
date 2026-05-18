import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function write(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
  console.log("wrote", rel);
}

write(
  "supabase/migrations/20260518120000_ibuyer_trade_in.sql",
  `-- iBuyer & Trade-In module
create type public.instant_offer_status as enum (
  'PENDING',
  'LEGAL_REVIEW',
  'OFFER_GENERATED',
  'REJECTED',
  'EXPIRED',
  'ACCEPTED'
);

create type public.ibuyer_target_option as enum (
  'CASH_ONLY',
  'TRADE_IN',
  'BOTH'
);

create table if not exists public.property_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  city text not null,
  district text,
  address text,
  parcel_no text,
  gross_m2 numeric not null check (gross_m2 > 0),
  market_value_try numeric not null check (market_value_try > 0),
  property_type text not null default 'konut',
  contact_phone text,
  contact_email text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.property_risk_assessments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.property_submissions (id) on delete cascade,
  risk_flags jsonb not null default '{}',
  risk_score integer not null default 0 check (risk_score >= 0),
  risk_breakdown jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists public.instant_offer_requests (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.property_submissions (id) on delete cascade,
  risk_assessment_id uuid not null references public.property_risk_assessments (id) on delete cascade,
  status public.instant_offer_status not null default 'PENDING',
  offer_amount_try numeric,
  market_value_try numeric not null,
  risk_score integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.trade_in_details (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.property_submissions (id) on delete cascade,
  target_option public.ibuyer_target_option not null default 'CASH_ONLY',
  desired_city text,
  desired_district text,
  desired_budget_try numeric,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists property_submissions_user_id_idx
  on public.property_submissions (user_id);

create index if not exists instant_offer_requests_submission_idx
  on public.instant_offer_requests (submission_id, created_at desc);

alter table public.property_submissions enable row level security;
alter table public.property_risk_assessments enable row level security;
alter table public.instant_offer_requests enable row level security;
alter table public.trade_in_details enable row level security;

create policy "property_submissions_select_own"
  on public.property_submissions for select
  using (auth.uid() = user_id);

create policy "property_submissions_insert_own"
  on public.property_submissions for insert
  with check (auth.uid() = user_id);

create policy "property_risk_assessments_select_own"
  on public.property_risk_assessments for select
  using (
    exists (
      select 1 from public.property_submissions ps
      where ps.id = submission_id and ps.user_id = auth.uid()
    )
  );

create policy "property_risk_assessments_insert_own"
  on public.property_risk_assessments for insert
  with check (
    exists (
      select 1 from public.property_submissions ps
      where ps.id = submission_id and ps.user_id = auth.uid()
    )
  );

create policy "instant_offer_requests_select_own"
  on public.instant_offer_requests for select
  using (
    exists (
      select 1 from public.property_submissions ps
      where ps.id = submission_id and ps.user_id = auth.uid()
    )
  );

create policy "instant_offer_requests_insert_own"
  on public.instant_offer_requests for insert
  with check (
    exists (
      select 1 from public.property_submissions ps
      where ps.id = submission_id and ps.user_id = auth.uid()
    )
  );

create policy "trade_in_details_select_own"
  on public.trade_in_details for select
  using (
    exists (
      select 1 from public.property_submissions ps
      where ps.id = submission_id and ps.user_id = auth.uid()
    )
  );

create policy "trade_in_details_insert_own"
  on public.trade_in_details for insert
  with check (
    exists (
      select 1 from public.property_submissions ps
      where ps.id = submission_id and ps.user_id = auth.uid()
    )
  );

create or replace function public.ibuyer_calculate_risk_score(flags jsonb)
returns integer
language plpgsql
immutable
as $$
declare
  score integer := 0;
begin
  if coalesce((flags->>'inheritance')::boolean, false) then score := score + 40; end if;
  if coalesce((flags->>'concordat')::boolean, false) then score := score + 35; end if;
  if coalesce((flags->>'lien')::boolean, false) then score := score + 25; end if;
  if coalesce((flags->>'urban')::boolean, false) then score := score + 15; end if;
  if coalesce((flags->>'arsaPayi')::boolean, false) then score := score + 20; end if;
  if coalesce((flags->>'familySherh')::boolean, false) then score := score + 15; end if;
  if coalesce((flags->>'veraset')::boolean, false) then score := score + 30; end if;
  if coalesce((flags->>'imar')::boolean, false) then score := score + 20; end if;
  if coalesce((flags->>'katMismatch')::boolean, false) then score := score + 15; end if;
  return score;
end;
$$;

create or replace function public.ibuyer_determine_status(
  flags jsonb,
  risk_score integer
)
returns public.instant_offer_status
language plpgsql
immutable
as $$
declare
  has_inheritance boolean := coalesce((flags->>'inheritance')::boolean, false);
  has_concordat boolean := coalesce((flags->>'concordat')::boolean, false);
begin
  if has_inheritance and has_concordat then
    return 'REJECTED'::public.instant_offer_status;
  end if;
  if has_inheritance or has_concordat then
    return 'LEGAL_REVIEW'::public.instant_offer_status;
  end if;
  if risk_score >= 70 then
    return 'REJECTED'::public.instant_offer_status;
  end if;
  if risk_score >= 30 then
    return 'LEGAL_REVIEW'::public.instant_offer_status;
  end if;
  return 'OFFER_GENERATED'::public.instant_offer_status;
end;
$$;

create or replace function public.ibuyer_calculate_offer(market_value numeric, risk_score integer)
returns numeric
language sql
immutable
as $$
  select round(
    market_value * 0.82 - market_value * (risk_score::numeric / 100.0) * 0.15,
    2
  );
$$;

create or replace function public.submit_ibuyer_application(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_submission_id uuid;
  v_assessment_id uuid;
  v_offer_id uuid;
  v_trade_id uuid;
  v_flags jsonb := coalesce(payload->'legalFlags', '{}'::jsonb);
  v_risk_score integer;
  v_status public.instant_offer_status;
  v_market numeric := (payload->>'marketValueTry')::numeric;
  v_offer_amount numeric;
  v_breakdown jsonb := '[]'::jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;
  if v_market is null or v_market <= 0 then
    raise exception 'marketValueTry must be positive';
  end if;

  v_risk_score := public.ibuyer_calculate_risk_score(v_flags);
  v_status := public.ibuyer_determine_status(v_flags, v_risk_score);

  v_breakdown := jsonb_build_array(
    jsonb_build_object('key', 'inheritance', 'points', case when coalesce((v_flags->>'inheritance')::boolean, false) then 40 else 0 end),
    jsonb_build_object('key', 'concordat', 'points', case when coalesce((v_flags->>'concordat')::boolean, false) then 35 else 0 end),
    jsonb_build_object('key', 'lien', 'points', case when coalesce((v_flags->>'lien')::boolean, false) then 25 else 0 end),
    jsonb_build_object('key', 'urban', 'points', case when coalesce((v_flags->>'urban')::boolean, false) then 15 else 0 end),
    jsonb_build_object('key', 'arsaPayi', 'points', case when coalesce((v_flags->>'arsaPayi')::boolean, false) then 20 else 0 end),
    jsonb_build_object('key', 'familySherh', 'points', case when coalesce((v_flags->>'familySherh')::boolean, false) then 15 else 0 end),
    jsonb_build_object('key', 'veraset', 'points', case when coalesce((v_flags->>'veraset')::boolean, false) then 30 else 0 end),
    jsonb_build_object('key', 'imar', 'points', case when coalesce((v_flags->>'imar')::boolean, false) then 20 else 0 end),
    jsonb_build_object('key', 'katMismatch', 'points', case when coalesce((v_flags->>'katMismatch')::boolean, false) then 15 else 0 end)
  );

  insert into public.property_submissions (
    user_id, city, district, address, parcel_no, gross_m2, market_value_try,
    property_type, contact_phone, contact_email, metadata
  ) values (
    v_user_id,
    coalesce(payload->>'city', ''),
    payload->>'district',
    payload->>'address',
    payload->>'parcelNo',
    (payload->>'grossM2')::numeric,
    v_market,
    coalesce(payload->>'propertyType', 'konut'),
    payload->>'contactPhone',
    payload->>'contactEmail',
    coalesce(payload->'metadata', '{}'::jsonb)
  )
  returning id into v_submission_id;

  insert into public.property_risk_assessments (submission_id, risk_flags, risk_score, risk_breakdown)
  values (v_submission_id, v_flags, v_risk_score, v_breakdown)
  returning id into v_assessment_id;

  if v_status = 'OFFER_GENERATED' then
    v_offer_amount := public.ibuyer_calculate_offer(v_market, v_risk_score);
  else
    v_offer_amount := null;
  end if;

  insert into public.instant_offer_requests (
    submission_id, risk_assessment_id, status, offer_amount_try,
    market_value_try, risk_score, expires_at
  ) values (
    v_submission_id,
    v_assessment_id,
    v_status,
    v_offer_amount,
    v_market,
    v_risk_score,
    case when v_status = 'OFFER_GENERATED' then now() + interval '72 hours' else null end
  )
  returning id into v_offer_id;

  if coalesce(payload->>'targetOption', '') <> '' then
    insert into public.trade_in_details (
      submission_id, target_option, desired_city, desired_district, desired_budget_try, notes
    ) values (
      v_submission_id,
      (payload->>'targetOption')::public.ibuyer_target_option,
      payload->>'desiredCity',
      payload->>'desiredDistrict',
      nullif(payload->>'desiredBudgetTry', '')::numeric,
      payload->>'tradeInNotes'
    )
    returning id into v_trade_id;
  end if;

  return jsonb_build_object(
    'submissionId', v_submission_id,
    'riskAssessmentId', v_assessment_id,
    'offerRequestId', v_offer_id,
    'tradeInId', v_trade_id,
    'status', v_status::text,
    'riskScore', v_risk_score,
    'offerAmountTry', v_offer_amount,
    'marketValueTry', v_market,
    'expiresAt', case when v_status = 'OFFER_GENERATED' then (now() + interval '72 hours') else null end,
    'riskBreakdown', v_breakdown
  );
end;
$$;

revoke all on function public.submit_ibuyer_application(jsonb) from public;
grant execute on function public.submit_ibuyer_application(jsonb) to authenticated;
`,
);

write(
  "src/constants/routes.ts",
  `/** Intelligence & platform route constants (single source of truth) */
export const ROUTES = {
  HOME: "/",
  INTELLIGENCE_HUB: "/arastirma",
  GES_ANALYSIS: "/arastirma/ges",
  PARCEL_INTELLIGENCE: "/arastirma/parsel",
  LAND_INVESTMENT: "/arastirma/yatirim",
  WAR_ROOM: "/arastirma/war-room",
  GIS_INTELLIGENCE: "/arastirma/harita",
  KKA_HUB: "/kat-karsiligi",
  KKA_STUDIO: "/kat-karsiligi/studio",
  IBUYER: "/aninda-teklif",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export const INTELLIGENCE_ROUTES = [
  ROUTES.INTELLIGENCE_HUB,
  ROUTES.GES_ANALYSIS,
  ROUTES.PARCEL_INTELLIGENCE,
  ROUTES.LAND_INVESTMENT,
  ROUTES.WAR_ROOM,
] as const;
`,
);

write(
  "src/lib/ibuyerHub.ts",
  `import { ROUTES } from "@/constants/routes";

export const IBUYER_PATH = ROUTES.IBUYER;
export const ibuyerNavLabel = "Anında Teklif";
export const ibuyerSubtitle = "Nakit teklif ve takas (trade-in) başvurusu";
`,
);

write(
  "src/lib/ibuyer/types.ts",
  `export type InstantOfferStatus =
  | "PENDING"
  | "LEGAL_REVIEW"
  | "OFFER_GENERATED"
  | "REJECTED"
  | "EXPIRED"
  | "ACCEPTED";

export type IBuyerTargetOption = "CASH_ONLY" | "TRADE_IN" | "BOTH";

export type LegalRiskFlagKey =
  | "inheritance"
  | "concordat"
  | "lien"
  | "urban"
  | "arsaPayi"
  | "familySherh"
  | "veraset"
  | "imar"
  | "katMismatch";

export type LegalRiskFlags = Record<LegalRiskFlagKey, boolean>;

export const LEGAL_RISK_FLAG_LABELS: Record<LegalRiskFlagKey, string> = {
  inheritance: "Veraset / intikal süreci",
  concordat: "Konkordato",
  lien: "İpotek / haciz",
  urban: "Kentsel dönüşüm alanı",
  arsaPayi: "Arsa payı uyuşmazlığı",
  familySherh: "Aile şerhi",
  veraset: "Veraset belgesi eksik",
  imar: "İmar planı sorunu",
  katMismatch: "Kat mülkiyeti uyumsuzluğu",
};

export const RISK_POINTS: Record<LegalRiskFlagKey, number> = {
  inheritance: 40,
  concordat: 35,
  lien: 25,
  urban: 15,
  arsaPayi: 20,
  familySherh: 15,
  veraset: 30,
  imar: 20,
  katMismatch: 15,
};

export type RiskBreakdownItem = {
  key: LegalRiskFlagKey;
  points: number;
};

export type PropertySubmissionInput = {
  city: string;
  district?: string;
  address?: string;
  parcelNo?: string;
  grossM2: number;
  marketValueTry: number;
  propertyType?: string;
  contactPhone?: string;
  contactEmail?: string;
};

export type TradeInInput = {
  targetOption: IBuyerTargetOption;
  desiredCity?: string;
  desiredDistrict?: string;
  desiredBudgetTry?: number;
  tradeInNotes?: string;
};

export type IBuyerApplicationPayload = PropertySubmissionInput & {
  legalFlags: LegalRiskFlags;
  targetOption?: IBuyerTargetOption;
  desiredCity?: string;
  desiredDistrict?: string;
  desiredBudgetTry?: number;
  tradeInNotes?: string;
};

export type OfferDetermination = {
  status: InstantOfferStatus;
  riskScore: number;
  breakdown: RiskBreakdownItem[];
};

export type InstantOfferResult = OfferDetermination & {
  submissionId?: string;
  offerRequestId?: string;
  offerAmountTry: number | null;
  marketValueTry: number;
  expiresAt: string | null;
  demoMode?: boolean;
};
`,
);

write(
  "src/lib/ibuyer/riskAssessment.ts",
  `import {
  LEGAL_RISK_FLAG_LABELS,
  RISK_POINTS,
  type InstantOfferStatus,
  type LegalRiskFlagKey,
  type LegalRiskFlags,
  type OfferDetermination,
  type RiskBreakdownItem,
} from "./types";

export { LEGAL_RISK_FLAG_LABELS, RISK_POINTS };

export function calculateLegalRiskScore(flags: LegalRiskFlags): {
  score: number;
  breakdown: RiskBreakdownItem[];
} {
  const breakdown: RiskBreakdownItem[] = (Object.keys(RISK_POINTS) as LegalRiskFlagKey[]).map(
    (key) => ({
      key,
      points: flags[key] ? RISK_POINTS[key] : 0,
    }),
  );
  const score = breakdown.reduce((sum, item) => sum + item.points, 0);
  return { score, breakdown };
}

/** Mirrors SQL ibuyer_determine_status + inheritance/concordat overrides */
export function determineOfferStatus(
  flags: LegalRiskFlags,
  riskScore: number,
): InstantOfferStatus {
  if (flags.inheritance && flags.concordat) return "REJECTED";
  if (flags.inheritance || flags.concordat) return "LEGAL_REVIEW";
  if (riskScore >= 70) return "REJECTED";
  if (riskScore >= 30) return "LEGAL_REVIEW";
  return "OFFER_GENERATED";
}

export function assessLegalRisk(flags: LegalRiskFlags): OfferDetermination {
  const { score, breakdown } = calculateLegalRiskScore(flags);
  const status = determineOfferStatus(flags, score);
  return { status, riskScore: score, breakdown };
}
`,
);

write(
  "src/lib/ibuyer/offerEngine.ts",
  `/** Automated offer: market * 0.82 - market * (score/100) * 0.15 */
export function calculateAutomatedOfferAmount(
  marketValueTry: number,
  riskScore: number,
): number {
  const raw =
    marketValueTry * 0.82 - marketValueTry * (riskScore / 100) * 0.15;
  return Math.round(raw * 100) / 100;
}

export function offerExpiresAtIso(fromDate: Date = new Date()): string {
  const expires = new Date(fromDate.getTime() + 72 * 60 * 60 * 1000);
  return expires.toISOString();
}
`,
);

write(
  "src/lib/ibuyer/submitInstantOffer.ts",
  `import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { calculateAutomatedOfferAmount, offerExpiresAtIso } from "./offerEngine";
import { assessLegalRisk } from "./riskAssessment";
import type { IBuyerApplicationPayload, InstantOfferResult } from "./types";

function toRpcPayload(payload: IBuyerApplicationPayload) {
  return {
    city: payload.city,
    district: payload.district ?? null,
    address: payload.address ?? null,
    parcelNo: payload.parcelNo ?? null,
    grossM2: payload.grossM2,
    marketValueTry: payload.marketValueTry,
    propertyType: payload.propertyType ?? "konut",
    contactPhone: payload.contactPhone ?? null,
    contactEmail: payload.contactEmail ?? null,
    legalFlags: payload.legalFlags,
    targetOption: payload.targetOption ?? null,
    desiredCity: payload.desiredCity ?? null,
    desiredDistrict: payload.desiredDistrict ?? null,
    desiredBudgetTry: payload.desiredBudgetTry ?? null,
    tradeInNotes: payload.tradeInNotes ?? null,
  };
}

function localDemoSubmit(payload: IBuyerApplicationPayload): InstantOfferResult {
  const assessment = assessLegalRisk(payload.legalFlags);
  const offerAmountTry =
    assessment.status === "OFFER_GENERATED"
      ? calculateAutomatedOfferAmount(payload.marketValueTry, assessment.riskScore)
      : null;
  const expiresAt =
    assessment.status === "OFFER_GENERATED" ? offerExpiresAtIso() : null;

  return {
    ...assessment,
    submissionId: \`demo-\${Date.now()}\`,
    offerRequestId: \`demo-offer-\${Date.now()}\`,
    offerAmountTry,
    marketValueTry: payload.marketValueTry,
    expiresAt,
    demoMode: true,
  };
}

export async function submitInstantOffer(
  payload: IBuyerApplicationPayload,
): Promise<InstantOfferResult> {
  if (!isSupabaseConfigured()) {
    return localDemoSubmit(payload);
  }

  const { data, error } = await supabase.rpc("submit_ibuyer_application", {
    payload: toRpcPayload(payload),
  });

  if (error) {
    console.warn("[ibuyer] RPC failed, falling back to local demo:", error.message);
    return localDemoSubmit(payload);
  }

  const row = data as Record<string, unknown> | null;
  if (!row) {
    return localDemoSubmit(payload);
  }

  return {
    status: String(row.status ?? "PENDING") as InstantOfferResult["status"],
    riskScore: Number(row.riskScore ?? 0),
    breakdown: Array.isArray(row.riskBreakdown)
      ? (row.riskBreakdown as InstantOfferResult["breakdown"])
      : assessLegalRisk(payload.legalFlags).breakdown,
    submissionId: row.submissionId ? String(row.submissionId) : undefined,
    offerRequestId: row.offerRequestId ? String(row.offerRequestId) : undefined,
    offerAmountTry:
      row.offerAmountTry != null ? Number(row.offerAmountTry) : null,
    marketValueTry: Number(row.marketValueTry ?? payload.marketValueTry),
    expiresAt: row.expiresAt ? String(row.expiresAt) : null,
    demoMode: false,
  };
}
`,
);

write(
  "src/lib/ibuyer/index.ts",
  `export * from "./types";
export * from "./riskAssessment";
export * from "./offerEngine";
export { submitInstantOffer } from "./submitInstantOffer";
`,
);

write(
  "src/components/ibuyer/SubmissionForm.tsx",
  `import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LEGAL_RISK_FLAG_LABELS,
  assessLegalRisk,
  submitInstantOffer,
  type IBuyerApplicationPayload,
  type IBuyerTargetOption,
  type InstantOfferResult,
  type LegalRiskFlagKey,
  type LegalRiskFlags,
} from "@/lib/ibuyer";

const EMPTY_FLAGS: LegalRiskFlags = {
  inheritance: false,
  concordat: false,
  lien: false,
  urban: false,
  arsaPayi: false,
  familySherh: false,
  veraset: false,
  imar: false,
  katMismatch: false,
};

const FLAG_KEYS = Object.keys(EMPTY_FLAGS) as LegalRiskFlagKey[];

type Step = 1 | 2 | 3;

function formatTry(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusLabel(status: InstantOfferResult["status"]): string {
  switch (status) {
    case "OFFER_GENERATED":
      return "Anında teklif üretildi";
    case "LEGAL_REVIEW":
      return "Hukuk incelemesi gerekli";
    case "REJECTED":
      return "Başvuru uygun değil";
    default:
      return status;
  }
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Süre doldu");
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setRemaining(\`\${h}sa \${m}dk \${s}sn\`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  return (
    <p className="inline-flex items-center gap-2 text-cyan-200 text-sm">
      <Clock className="h-4 w-4" />
      Teklif geçerlilik: {remaining}
    </p>
  );
}

export function SubmissionForm() {
  const [step, setStep] = useState<Step>(1);
  const [flags, setFlags] = useState<LegalRiskFlags>(EMPTY_FLAGS);
  const [targetOption, setTargetOption] = useState<IBuyerTargetOption>("CASH_ONLY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<InstantOfferResult | null>(null);
  const [form, setForm] = useState({
    city: "İstanbul",
    district: "",
    address: "",
    parcelNo: "",
    grossM2: 120,
    marketValueTry: 5_000_000,
    propertyType: "konut",
    contactPhone: "",
    contactEmail: "",
    desiredCity: "",
    desiredDistrict: "",
    desiredBudgetTry: 0,
    tradeInNotes: "",
  });

  const preview = useMemo(() => assessLegalRisk(flags), [flags]);

  const toggleFlag = (key: LegalRiskFlagKey, checked: boolean) => {
    setFlags((prev) => ({ ...prev, [key]: checked }));
  };

  const buildPayload = (): IBuyerApplicationPayload => ({
    city: form.city,
    district: form.district || undefined,
    address: form.address || undefined,
    parcelNo: form.parcelNo || undefined,
    grossM2: form.grossM2,
    marketValueTry: form.marketValueTry,
    propertyType: form.propertyType,
    contactPhone: form.contactPhone || undefined,
    contactEmail: form.contactEmail || undefined,
    legalFlags: flags,
    targetOption,
    desiredCity: form.desiredCity || undefined,
    desiredDistrict: form.desiredDistrict || undefined,
    desiredBudgetTry: form.desiredBudgetTry > 0 ? form.desiredBudgetTry : undefined,
    tradeInNotes: form.tradeInNotes || undefined,
  });

  const onSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await submitInstantOffer(buildPayload());
      setResult(res);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Başvuru gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
      <div className="mb-6 flex gap-2 text-xs text-slate-400">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={\`rounded-full px-3 py-1 border \${
              step === n ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-100" : "border-white/10"
            }\`}
          >
            Adım {n}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Mülk bilgileri</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              İl
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              İlçe
              <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm text-slate-300 sm:col-span-2">
              Adres
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              Brüt m²
              <Input
                type="number"
                min={10}
                value={form.grossM2}
                onChange={(e) => setForm({ ...form, grossM2: Number(e.target.value) })}
              />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              Piyasa değeri (TRY)
              <Input
                type="number"
                min={100_000}
                value={form.marketValueTry}
                onChange={(e) => setForm({ ...form, marketValueTry: Number(e.target.value) })}
              />
            </label>
          </div>
          <Button type="button" onClick={() => setStep(2)} className="mt-2">
            Devam <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Hukuki kontrol listesi</h2>
          <p className="text-sm text-slate-400">
            Risk skoru: <span className="text-cyan-200 font-medium">{preview.riskScore}</span> — ön durum:{" "}
            {statusLabel(preview.status)}
          </p>
          <ul className="space-y-3">
            {FLAG_KEYS.map((key) => (
              <li key={key} className="flex items-start gap-3 rounded-lg border border-white/10 p-3">
                <Checkbox
                  id={key}
                  checked={flags[key]}
                  onCheckedChange={(v) => toggleFlag(key, v === true)}
                />
                <label htmlFor={key} className="text-sm text-slate-200 cursor-pointer">
                  {LEGAL_RISK_FLAG_LABELS[key]}
                  <span className="block text-xs text-slate-500">+{preview.breakdown.find((b) => b.key === key)?.points ?? 0} puan</span>
                </label>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-white/10 p-4 space-y-3">
            <p className="text-sm font-medium text-white">Takas tercihi</p>
            <div className="flex flex-wrap gap-2">
              {(["CASH_ONLY", "TRADE_IN", "BOTH"] as IBuyerTargetOption[]).map((opt) => (
                <Button
                  key={opt}
                  type="button"
                  size="sm"
                  variant={targetOption === opt ? "default" : "outline"}
                  onClick={() => setTargetOption(opt)}
                >
                  {opt === "CASH_ONLY" ? "Nakit" : opt === "TRADE_IN" ? "Takas" : "Nakit + Takas"}
                </Button>
              ))}
            </div>
            {(targetOption === "TRADE_IN" || targetOption === "BOTH") && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Hedef il"
                  value={form.desiredCity}
                  onChange={(e) => setForm({ ...form, desiredCity: e.target.value })}
                />
                <Input
                  placeholder="Hedef ilçe"
                  value={form.desiredDistrict}
                  onChange={(e) => setForm({ ...form, desiredDistrict: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4" /> Geri
            </Button>
            <Button type="button" disabled={loading} onClick={onSubmit}>
              {loading ? "Hesaplanıyor…" : "Teklifi hesapla"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      )}

      {step === 3 && result && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">{statusLabel(result.status)}</h2>
          {result.demoMode && (
            <p className="text-xs text-amber-200/90 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2">
              Demo modu: Supabase yapılandırılmadı veya RPC kullanılamadı; sonuç yerel motorla üretildi.
            </p>
          )}
          {result.status === "OFFER_GENERATED" && result.offerAmountTry != null && (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
              <p className="text-emerald-100 text-2xl font-bold">{formatTry(result.offerAmountTry)}</p>
              <p className="text-sm text-emerald-200/80 mt-1">
                Piyasa: {formatTry(result.marketValueTry)} · Risk skoru: {result.riskScore}
              </p>
              {result.expiresAt && <Countdown expiresAt={result.expiresAt} />}
            </div>
          )}
          {result.status === "LEGAL_REVIEW" && (
            <p className="flex items-center gap-2 text-amber-200 text-sm">
              <ShieldAlert className="h-4 w-4" />
              Hukuk ekibimiz 1–2 iş günü içinde sizinle iletişime geçecek.
            </p>
          )}
          {result.status === "REJECTED" && (
            <p className="text-sm text-slate-400">
              Mevcut hukuki profil otomatik nakit teklif için uygun değil; danışmanlık kanalı açılabilir.
            </p>
          )}
          <ul className="text-xs text-slate-500 space-y-1">
            {result.breakdown
              .filter((b) => b.points > 0)
              .map((b) => (
                <li key={b.key}>
                  {LEGAL_RISK_FLAG_LABELS[b.key]}: +{b.points}
                </li>
              ))}
          </ul>
          <Button type="button" variant="outline" onClick={() => { setStep(1); setResult(null); }}>
            <CheckCircle2 className="h-4 w-4" /> Yeni başvuru
          </Button>
        </div>
      )}
    </div>
  );
}
`,
);

// --- appended writes below ---

write(
  "src/pages/ibuyer/IBuyerPage.tsx",
  `import { Banknote, RefreshCw } from "lucide-react";
import { SubmissionForm } from "@/components/ibuyer/SubmissionForm";
import { ibuyerSubtitle } from "@/lib/ibuyerHub";

export default function IBuyerPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 text-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            <Banknote className="h-3.5 w-3.5" /> iBuyer
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold">Aninda Nakit Teklif</h1>
          <p className="mt-2 text-slate-400 max-w-2xl">{ibuyerSubtitle}</p>
        </div>
        <p className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <RefreshCw className="h-4 w-4" />
          Hukuki risk matrisi ile 72 saat gecerli teklif
        </p>
        <SubmissionForm />
      </section>
    </main>
  );
}
`,
);

write(
  "tests/ibuyer/riskAssessment.test.ts",
  `import { describe, expect, it } from "vitest";
import { calculateAutomatedOfferAmount } from "@/lib/ibuyer/offerEngine";
import {
  assessLegalRisk,
  calculateLegalRiskScore,
  determineOfferStatus,
} from "@/lib/ibuyer/riskAssessment";
import type { LegalRiskFlags } from "@/lib/ibuyer/types";

const clean: LegalRiskFlags = {
  inheritance: false,
  concordat: false,
  lien: false,
  urban: false,
  arsaPayi: false,
  familySherh: false,
  veraset: false,
  imar: false,
  katMismatch: false,
};

describe("calculateLegalRiskScore", () => {
  it("sums flag weights", () => {
    const { score } = calculateLegalRiskScore({
      ...clean,
      lien: true,
      urban: true,
    });
    expect(score).toBe(40);
  });

  it("caps at sum of all flags", () => {
    const allTrue = Object.fromEntries(
      Object.keys(clean).map((k) => [k, true]),
    ) as LegalRiskFlags;
    const { score } = calculateLegalRiskScore(allTrue);
    expect(score).toBe(215);
  });
});

describe("determineOfferStatus", () => {
  it("rejects when inheritance and concordat", () => {
    expect(
      determineOfferStatus({ ...clean, inheritance: true, concordat: true }, 0),
    ).toBe("REJECTED");
  });

  it("legal review for inheritance only", () => {
    expect(determineOfferStatus({ ...clean, inheritance: true }, 0)).toBe("LEGAL_REVIEW");
  });

  it("rejects at score >= 70", () => {
    expect(determineOfferStatus(clean, 70)).toBe("REJECTED");
  });

  it("legal review at score >= 30", () => {
    expect(determineOfferStatus(clean, 30)).toBe("LEGAL_REVIEW");
  });

  it("offer generated below 30 without inheritance flags", () => {
    expect(determineOfferStatus(clean, 25)).toBe("OFFER_GENERATED");
  });
});

describe("assessLegalRisk + offer engine", () => {
  it("generates offer amount for clean profile", () => {
    const a = assessLegalRisk(clean);
    expect(a.status).toBe("OFFER_GENERATED");
    const offer = calculateAutomatedOfferAmount(1_000_000, a.riskScore);
    expect(offer).toBe(820_000);
  });

  it("reduces offer as risk increases", () => {
    const a = assessLegalRisk({ ...clean, lien: true });
    const offer = calculateAutomatedOfferAmount(1_000_000, a.riskScore);
    expect(offer).toBeLessThan(820_000);
  });
});
`,
);

const appPath = path.join(root, "src/App.tsx");
let app = fs.readFileSync(appPath, "utf8");

if (!app.includes("IBUYER_PATH")) {
  app = app.replace(
    'import { PLATFORM_FRAMEWORK_PATH } from "@/constants/platformFramework";',
    `import { PLATFORM_FRAMEWORK_PATH } from "@/constants/platformFramework";
import { IBUYER_PATH } from "@/lib/ibuyerHub";`,
  );
}

if (!app.includes("IBuyerPage")) {
  app = app.replace(
    'const NotFound             = lazy(() => import("@/pages/NotFound"));',
    `const IBuyerPage           = lazy(() => import("@/pages/ibuyer/IBuyerPage"));
const NotFound             = lazy(() => import("@/pages/NotFound"));`,
  );
}

if (!app.includes("path={IBUYER_PATH}")) {
  app = app.replace(
    '            <Route path="*" element={<NotFound />} />',
    `            <Route
              path={IBUYER_PATH}
              element={
                <Suspense fallback={<PageLoader label="Aninda teklif yukleniyor…" />}>
                  <IBuyerPage />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />`,
  );
}

fs.writeFileSync(appPath, app, "utf8");
console.log("patched", "src/App.tsx");

const vitestPath = path.join(root, "vitest.config.ts");
let vitest = fs.readFileSync(vitestPath, "utf8");
if (!vitest.includes("tests/ibuyer")) {
  vitest = vitest.replace(
    '"tests/engineering/**/*.{test,spec}.{ts,tsx}",',
    `"tests/engineering/**/*.{test,spec}.{ts,tsx}",
      "tests/ibuyer/**/*.{test,spec}.{ts,tsx}",`,
  );
  fs.writeFileSync(vitestPath, vitest, "utf8");
  console.log("patched", "vitest.config.ts");
}

console.log("iBuyer module write complete.");
