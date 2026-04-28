/**
 * TUR #12 smoke: signup → POST /rest/v1/listings (anon JWT).
 * Prints HTTP statuses only (no secrets).
 */
import fs from "fs";

function loadEnv(p) {
  const e = {};
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    e[k] = v;
  }
  return e;
}

const env = loadEnv(new URL("../.env.local", import.meta.url));
const url = env.VITE_SUPABASE_URL;
const anon = env.VITE_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.log("SMOKE_SKIP missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  process.exit(0);
}

const email = `test_smoke_${Date.now()}@ihaleal.dev`;
const password = "Test1234!";

let access_token = null;
const signupRes = await fetch(`${url}/auth/v1/signup`, {
  method: "POST",
  headers: { apikey: anon, "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
let signupJ = {};
try {
  signupJ = await signupRes.json();
} catch {
  /* ignore */
}
access_token = signupJ.access_token || signupJ.session?.access_token;

if (!access_token) {
  const loginRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anon, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const lj = await loginRes.json();
  access_token = lj.access_token;
  console.log("LOGIN_HTTP", loginRes.status);
} else {
  console.log("SIGNUP_HTTP", signupRes.status);
}

if (!access_token) {
  console.log("NO_TOKEN abort");
  process.exit(1);
}

const payload = JSON.parse(
  Buffer.from(access_token.split(".")[1], "base64url").toString(),
);
const seller_id = payload.sub;

const listingBody = {
  seller_id,
  title: "Smoke T12",
  body: { description: "smoke", images_count: 1 },
  category: "real_estate_residential",
  city: "İstanbul",
  district: "Şişli",
  start_price_try: 1000000,
  reserve_price_try: null,
  status: "review",
  is_demo: false,
};

const postRes = await fetch(`${url}/rest/v1/listings`, {
  method: "POST",
  headers: {
    apikey: anon,
    Authorization: `Bearer ${access_token}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify(listingBody),
});
const pt = await postRes.text();
console.log("LISTINGS_POST_HTTP", postRes.status);
if (postRes.status >= 400) console.log(pt.slice(0, 400));
