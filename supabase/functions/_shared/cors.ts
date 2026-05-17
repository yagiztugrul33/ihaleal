/** Shared CORS — wildcard yasak; ALLOWED_ORIGINS virgulle ayrilmis. */
const DEFAULT_ORIGINS = [
  "https://ihaleal.vercel.app",
  "https://ihaleal.com",
  "https://www.ihaleal.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

export function getAllowedOrigins(): string[] {
  const raw = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  const fromEnv = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ORIGINS;
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = getAllowedOrigins();
  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
}

export function handleOptions(req: Request): Response {
  return new Response("ok", { headers: corsHeaders(req) });
}