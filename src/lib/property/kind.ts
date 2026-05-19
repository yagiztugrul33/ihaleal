import type { PropertyRecord } from "@/types/property";

/** Canonical kind key e.g. konaklama.otel, endustri.fabrika */
export function getPropertyKind(p: PropertyRecord): string {
  const { category, sub, type } = p.taxonomy;
  return [category, sub, type].filter(Boolean).join(".");
}

export function isKind(p: PropertyRecord, kind: string): boolean {
  return getPropertyKind(p) === kind || getPropertyKind(p).startsWith(`${kind}.`);
}

export type TypeExtraTab =
  | "OTEL"
  | "FABRIKA"
  | "TARIM"
  | "GES"
  | "AVM"
  | "DEVREN";

export function getTypeExtraTab(p: PropertyRecord): TypeExtraTab | null {
  const k = getPropertyKind(p);
  if (p.taxonomy.category === "konaklama" && p.taxonomy.sub === "otel") return "OTEL";
  if (p.taxonomy.category === "endustri" && p.taxonomy.sub === "fabrika") return "FABRIKA";
  if (
    p.taxonomy.category === "arsa" &&
    (p.taxonomy.sub === "tarla" || p.taxonomy.sub === "bahce" || p.taxonomy.type === "kuru")
  ) {
    return "TARIM";
  }
  if (p.taxonomy.category === "altyapi" && (p.taxonomy.sub === "ges" || p.taxonomy.sub === "res")) {
    return "GES";
  }
  if (
    p.taxonomy.category === "ticari" &&
    (p.taxonomy.sub === "magaza" || p.taxonomy.sub === "avm")
  ) {
    return "AVM";
  }
  if (p.taxonomy.category === "devren") return "DEVREN";
  return null;
}
