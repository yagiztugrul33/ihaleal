/** Tokenize / fractional investment variant details. */

export interface TokenizeDetay {
  totalShares?: number;
  availableShares?: number;
  minInvestmentTry?: number;
  expectedYieldPercent?: number;
  lockupMonths?: number;
  platformName?: string;
  smartContractAddress?: string;
  regulatoryStatus?: string;
}
