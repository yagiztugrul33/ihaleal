import { ZodSchema } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { corsHeaders, handleOptions } from "./cors.ts";

const MAX_JSON_BODY_BYTES = 64 * 1024;

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cache-Control": "no-store",
} as const;

function withHeaders(req: Request, initHeaders: HeadersInit = {}): Headers {
  const h = new Headers(initHeaders);
  const cors = corsHeaders(req);
  for (const [k, v] of Object.entries(cors)) h.set(k, v);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) h.set(k, v);
  return h;
}

export const json = (req: Request, body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: withHeaders(req, { "content-type": "application/json", ...(init.headers ?? {}) }),
  });

export const fail = (req: Request, code: number, error: string, extra: Record<string, unknown> = {}) =>
  json(req, { ok: false, error, ...extra }, { status: code });

export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  const lenRaw = req.headers.get("content-length");
  const len = lenRaw ? Number(lenRaw) : 0;
  if (Number.isFinite(len) && len > MAX_JSON_BODY_BYTES) {
    throw json(req, { ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let text = "";
  try {
    text = await req.text();
  } catch {
    throw json(req, { ok: false, error: "invalid_body" }, { status: 400 });
  }
  if (text.length > MAX_JSON_BODY_BYTES) {
    throw json(req, { ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw json(req, { ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw json(req, { ok: false, error: "validation_error", issues: parsed.error.issues }, { status: 422 });
  }
  return parsed.data;
}

export function preflight(req: Request): Response | null {
  if (req.method === "OPTIONS") return handleOptions(req);
  return null;
}
