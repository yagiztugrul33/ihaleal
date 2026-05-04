/**
 * Kiralik / devren kiralik — hizmet bedeli matrahi: 1 aylik kira + KDV (Madde 41-46).
 * Devir bedeli uzerinden komisyon kesilmez (Madde 66-67). E-provizyon ayri (Madde 81-83, 68).
 */

export const RENTAL_COMMISSION_VAT_RATE = 0.2;

export type RentalSplitScenario = 'c2c' | 'single_realtor' | 'dual_realtor' | 'b2c_cross';

export interface RentalMatrahSplitInput {
  oneMonthlyRentTryBeforeVat: number;
  scenario: RentalSplitScenario;
}

export interface RentalMatrahSplitResult {
  ihalealMatrahTry: number;
  listingRealtorMatrahTry?: number;
  buyerRealtorMatrahTry?: number;
  lawRef: string;
}

function roundTry(n: number): number {
  return Math.round(n * 100) / 100;
}

export function commissionMatrahOneMonthRentTry(rentTryBeforeVat: number): number {
  if (!Number.isFinite(rentTryBeforeVat) || rentTryBeforeVat <= 0) {
    throw new RangeError('oneMonthlyRentTryBeforeVat must be positive finite');
  }
  return roundTry(rentTryBeforeVat);
}

export function kdvOnCommissionMatrah(matrahTry: number): number {
  if (!Number.isFinite(matrahTry) || matrahTry < 0) throw new RangeError('matrah');
  return roundTry(matrahTry * RENTAL_COMMISSION_VAT_RATE);
}

export function splitRentalCommissionMatrah(input: RentalMatrahSplitInput): RentalMatrahSplitResult {
  const base = commissionMatrahOneMonthRentTry(input.oneMonthlyRentTryBeforeVat);
  switch (input.scenario) {
    case 'c2c':
      return { ihalealMatrahTry: base, lawRef: 'Madde 41-43 (Bireysel / C2C)' };
    case 'single_realtor': {
      const half = roundTry(base * 0.5);
      return {
        ihalealMatrahTry: half,
        listingRealtorMatrahTry: roundTry(base - half),
        lawRef: 'Madde 41-44 (Tek emlakci)',
      };
    }
    case 'dual_realtor': {
      const p = roundTry(base * 0.25);
      const side = roundTry(base * 0.375);
      const buyer = roundTry(base - p - side);
      return {
        ihalealMatrahTry: p,
        listingRealtorMatrahTry: side,
        buyerRealtorMatrahTry: buyer,
        lawRef: 'Madde 41-45 (Cift emlakci)',
      };
    }
    case 'b2c_cross': {
      const half = roundTry(base * 0.5);
      return {
        ihalealMatrahTry: half,
        buyerRealtorMatrahTry: roundTry(base - half),
        lawRef: 'Madde 41-46 (B2C capraz)',
      };
    }
  }
}

export const commissionSplitterRentMatrah = splitRentalCommissionMatrah;

export type EProvisionKind = 'normal_rent' | 'devren';

export function eProvisyon1PercentTry(params: {
  kind: EProvisionKind;
  monthlyRentTry: number;
  transferFeeTry?: number;
}): number {
  const r = params.monthlyRentTry;
  if (!Number.isFinite(r) || r <= 0) throw new RangeError('monthlyRentTry');
  if (params.kind === 'normal_rent') {
    return roundTry(r * 0.01);
  }
  const t = params.transferFeeTry ?? 0;
  if (!Number.isFinite(t) || t < 0) throw new RangeError('transferFeeTry');
  return roundTry((r + t) * 0.01);
}