import type { TapuAiConsentState } from "./types";

export function canSendToAi(consent: TapuAiConsentState): boolean {
  return consent.illuminationAccepted && consent.explicitConsentAccepted;
}

export function maskTckn(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) {
    return "***";
  }
  return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

export function maskOwnerName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Bilinmiyor";
  }

  return trimmed
    .split(/\s+/)
    .map((part) => {
      if (part.length <= 2) {
        return `${part.charAt(0)}*`;
      }
      return `${part.charAt(0)}${"*".repeat(part.length - 2)}${part.charAt(
        part.length - 1,
      )}`;
    })
    .join(" ");
}

export function maskParcel(value: string): string {
  const cleaned = value.trim();
  if (!cleaned) {
    return "Ada/Parsel yok";
  }
  return cleaned.replace(/[A-Za-z0-9]/g, (char, index) =>
    index % 2 === 0 ? char : "*",
  );
}
