export {
  estimatePropertyValue,
  formatTry,
} from '@/lib/valuation/valuationEngine';
export type {
  ValuationInput,
  ValuationResult,
  HeatingType,
  LocationTier,
  PropertyCondition,
} from '@/lib/valuation/valuationEngine';

export { runAdvancedValuation } from '@/lib/valuation/advancedValuation';
export type { ComparableSale, ContributionRow } from '@/lib/valuation/advancedValuation';

export { getCityByKey, REGIONAL_PRICE_DATA } from '@/lib/valuation/regionalPriceData';
export type { CityKey, CityPrice, DistrictPrice, TransactionType } from '@/lib/valuation/regionalPriceData';
