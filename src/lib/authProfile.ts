export type KurumsalProfil = "emlakci" | "muteahhit" | null;

export function parseKurumsalProfil(searchParams: URLSearchParams): KurumsalProfil {
  const raw = (searchParams.get("profil") || "").trim();
  const p = raw.toLocaleLowerCase("tr-TR");
  if (p === "emlakci" || p === "emlakçı") return "emlakci";
  if (p === "muteahhit" || p === "muteahit" || p === "müteahhit") return "muteahhit";
  return null;
}

export function postLoginPathForProfil(profil: KurumsalProfil): string {
  if (profil === "emlakci") return "/sat-basla";
  // R14 — Müteahhit girişi panel'e yönlenir (kayıt sonrası ayrıca onay-bekleniyor sayfası vardır)
  if (profil === "muteahhit") return "/muteahhit/panel";
  return "/dashboard";
}
