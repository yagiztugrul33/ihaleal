/**
 * Platform rules: UTF-8 JSON in ./anayasa400IhalealRules.json (edit text there).
 * Full Nihai doc: /nihai-anayasa
 */
import rulesJson from "./anayasa400IhalealRules.json" with { type: "json" };

export type RuleSeverity = "K" | "U" | "B";

export interface IhalealPlatformRule {
  id: number;
  sev: RuleSeverity;
  title: string;
  desc: string;
  ref: string;
}

export const IHALEAL_PLATFORM_RULES = rulesJson as IhalealPlatformRule[];