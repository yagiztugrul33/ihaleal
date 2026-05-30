// R14 — Müteahhit developer_projects + project_units hooks
// Supabase real-time fetch + CRUD helpers

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveOrgId } from "@/lib/activeOrgId";

export interface DeveloperProject {
  id: string;
  org_id: string | null;
  owner_user_id: string | null;
  project_name: string;
  ruhsat_no: string | null;
  ada_parsel: string | null;
  province: string | null;
  district: string | null;
  neighborhood: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  stage: "planning" | "foundation" | "construction" | "finishing" | "ready" | "delivered";
  total_units: number;
  units_sold: number;
  units_reserved: number;
  progress_pct: number;
  description: string | null;
  ruhsat_document_url: string | null;
  ruhsat_status: "pending" | "verified" | "rejected";
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectUnit {
  id: string;
  project_id: string;
  unit_no: string;
  block: string | null;
  floor: number | null;
  unit_type: string | null;
  m2_brut: number | null;
  m2_net: number | null;
  price_try: number | null;
  status: "available" | "reserved" | "sold" | "cancelled";
  reserved_by: string | null;
  sold_to: string | null;
  listing_id: string | null;
  reserved_at: string | null;
  sold_at: string | null;
  created_at: string;
}

export interface NewProjectInput {
  project_name: string;
  ruhsat_no?: string;
  ada_parsel?: string;
  province?: string;
  district?: string;
  neighborhood?: string;
  address?: string;
  description?: string;
  stage?: DeveloperProject["stage"];
}

export interface NewUnitInput {
  unit_no: string;
  block?: string;
  floor?: number;
  unit_type?: string;
  m2_brut?: number;
  m2_net?: number;
  price_try?: number;
}

export function useDeveloperProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<DeveloperProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const activeOrgId = await getActiveOrgId();
    let query = supabase.from("developer_projects").select("*").order("created_at", { ascending: false });
    if (activeOrgId) {
      query = query.or(`org_id.eq.${activeOrgId},owner_user_id.eq.${user.id}`);
    } else {
      query = query.eq("owner_user_id", user.id);
    }
    const { data, error: err } = await query;
    if (err) {
      setError(err.message);
      setProjects([]);
    } else {
      setProjects((data as DeveloperProject[]) ?? []);
      setError(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(
    async (input: NewProjectInput): Promise<{ data: DeveloperProject | null; error: string | null }> => {
      if (!user) return { data: null, error: "Giriş yapın" };
      const activeOrgId = await getActiveOrgId();
      const { data, error: err } = await supabase
        .from("developer_projects")
        .insert({
          ...input,
          owner_user_id: user.id,
          org_id: activeOrgId ?? null,
          stage: input.stage ?? "planning",
        })
        .select()
        .single();
      if (err) return { data: null, error: err.message };
      await fetchProjects();
      return { data: data as DeveloperProject, error: null };
    },
    [user, fetchProjects],
  );

  return { projects, loading, error, refresh: fetchProjects, createProject };
}

export function useDeveloperProject(projectId: string | undefined) {
  const [project, setProject] = useState<DeveloperProject | null>(null);
  const [units, setUnits] = useState<ProjectUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setProject(null);
      setUnits([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const [{ data: projData, error: projErr }, { data: unitsData, error: unitsErr }] = await Promise.all([
      supabase.from("developer_projects").select("*").eq("id", projectId).single(),
      supabase.from("project_units").select("*").eq("project_id", projectId).order("unit_no", { ascending: true }),
    ]);

    if (projErr) {
      setError(projErr.message);
      setProject(null);
    } else {
      setProject(projData as DeveloperProject);
    }

    if (unitsErr) {
      setUnits([]);
    } else {
      setUnits((unitsData as ProjectUnit[]) ?? []);
    }

    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    void fetchProject();
  }, [fetchProject]);

  return { project, units, loading, error, refresh: fetchProject };
}

export async function bulkInsertUnits(
  projectId: string,
  units: NewUnitInput[],
): Promise<{ count: number; error: string | null }> {
  if (units.length === 0) return { count: 0, error: null };
  const rows = units.map((u) => ({ ...u, project_id: projectId }));
  const { data, error: err } = await supabase.from("project_units").insert(rows).select();
  if (err) return { count: 0, error: err.message };

  // total_units güncelle
  await supabase
    .from("developer_projects")
    .update({ total_units: (data ?? []).length })
    .eq("id", projectId);

  return { count: (data ?? []).length, error: null };
}

export async function publishUnitAsListing(
  unitId: string,
  projectId: string,
  options: {
    title: string;
    price_try: number;
    description?: string;
    marketing_mode?: "listing_only" | "sealed_offers" | "auction" | "hemen_al_lansman";
  },
): Promise<{ listingId: string | null; error: string | null }> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { listingId: null, error: "Giriş yapın" };

  const activeOrgId = await getActiveOrgId();

  // listings INSERT (R14 extension fields)
  const { data: listing, error: listErr } = await supabase
    .from("listings")
    .insert({
      seller_id: user.user.id,
      title: options.title,
      body: {
        deal_type: "sale",
        marketing_mode: options.marketing_mode ?? "hemen_al_lansman",
        description: options.description ?? "",
      },
      organization_id: activeOrgId ?? null,
      project_id: projectId,
      unit_id: unitId,
      is_lansman: true,
      // R14 — listings.start_price_try NOT NULL; lansman hemen-al tek fiyatli
      // -> start_price_try = buy_now_price_try
      start_price_try: options.price_try,
      buy_now_price_try: options.price_try,
      status: "active",
    })
    .select("id")
    .single();

  if (listErr || !listing) return { listingId: null, error: listErr?.message ?? "Listing oluşturulamadı" };

  // project_units UPDATE listing_id
  await supabase
    .from("project_units")
    .update({ listing_id: listing.id, status: "reserved", reserved_at: new Date().toISOString() })
    .eq("id", unitId);

  return { listingId: listing.id, error: null };
}
