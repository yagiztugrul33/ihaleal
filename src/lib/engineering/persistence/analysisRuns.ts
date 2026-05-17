import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type AnalysisType =
  | "ges"
  | "parcel"
  | "zoning"
  | "site"
  | "war_room"
  | "seismic"
  | "geotech";

export type SaveAnalysisRunInput = {
  analysisType: AnalysisType;
  inputJson: Record<string, unknown>;
  resultJson: Record<string, unknown>;
  confidence?: string;
  label?: string;
};

export type AnalysisRunRow = {
  id: string;
  analysis_type: string;
  input_json: Record<string, unknown>;
  result_json: Record<string, unknown>;
  confidence: string | null;
  created_at: string;
};

export async function saveAnalysisRun(
  input: SaveAnalysisRunInput,
): Promise<{ id: string } | { error: string }> {
  if (!isSupabaseConfigured()) {
    const id = `local-${Date.now()}`;
    const key = "ihaleal-engineering-runs";
    const prev = JSON.parse(localStorage.getItem(key) ?? "[]") as AnalysisRunRow[];
    prev.unshift({
      id,
      analysis_type: input.analysisType,
      input_json: input.inputJson,
      result_json: input.resultJson,
      confidence: input.confidence ?? null,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(prev.slice(0, 50)));
    return { id };
  }

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { error: "auth_required" };

  const payload = {
    user_id: userId,
    analysis_type: input.analysisType,
    input_json: { ...input.inputJson, label: input.label },
    result_json: input.resultJson,
    confidence: input.confidence ?? "indicative",
  };

  const { data, error } = await supabase
    .from("engineering_analysis_runs")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id as string };
}

export async function listAnalysisRuns(limit = 20): Promise<AnalysisRunRow[]> {
  if (!isSupabaseConfigured()) {
    const key = "ihaleal-engineering-runs";
    return JSON.parse(localStorage.getItem(key) ?? "[]") as AnalysisRunRow[];
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from("engineering_analysis_runs")
    .select("id, analysis_type, input_json, result_json, confidence, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as AnalysisRunRow[];
}
