// İhaleAL — Finance Core Exports
export {
  InvoiceComposer,
  invoiceComposer,
  checkForbiddenTerms,
  validateTeknokentProjectCode,
  resolveTaxRate,
  FORBIDDEN_TERMS,
} from "./InvoiceComposer";
export type {
  RevenueTemplate,
  TaxProfile,
  CustomerInfo,
  InvoiceLineItem,
  UBLPayload,
  UBLLineItem,
  InvoiceComposeInput,
  ForbiddenCheckResult,
  TeknokentValidationResult,
} from "./InvoiceComposer";
export { InvoiceBlockedError } from "./InvoiceComposer";

export {
  TakasbankReconciliationService,
  TakasbankApiError,
  stubTakasbankClient,
} from "./TakasbankReconciliationService";
export type {
  SettlementRecord,
  ReconcileResult,
  BatchReconcileResult,
  TakasbankApiClient,
} from "./TakasbankReconciliationService";

export {
  computeKkaOwnerHakEdisProjection,
  computeKkaShareByRatio,
} from "./kkaHakEdisEngine";
export type { KkaHakEdisInput, KkaHakEdisResult, KkaScenarioId } from "./kkaHakEdisEngine";

export {
  buildKkaRollingHakedisRows,
  formatKkaRollingHakedisContractBlock,
  formatKkaRollingHakedisScheduleLines,
  kkaRollingHakedisLegalPrinciplesNoteTr,
} from "./kkaRollingHakedisEngine";
export type { KkaRollingHakedisRow } from "./kkaRollingHakedisEngine";
export {
  computeKkaBuildingSummary,
  resolveImarProfile,
  slugifyTr,
} from "./kkaParselImarEngine";
export type {
  KkaBuildingSummary,
  KkaImarProfile,
  KkaImarResolutionSource,
  KkaParselFormInput,
} from "./kkaParselImarEngine";
export { INVOICE_LINE_DESCRIPTION_CANDIDATES, VAT_EXEMPTION_CODE_PLACEHOLDER_TEKNO } from "./billingConfig";
