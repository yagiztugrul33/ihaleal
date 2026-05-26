import { parseNumericInput } from "./formatters";

export type CommissionForm = {
  saleAmountTry: string;
  membershipOffsetTry: string;
  serviceOffsetTry: string;
  agentRatePct: string;
};

export function getDefaultCommissionForm(): CommissionForm {
  return {
    saleAmountTry: "5.000.000",
    membershipOffsetTry: "5.000",
    serviceOffsetTry: "0",
    agentRatePct: "2",
  };
}

export function validateCommissionForm(form: CommissionForm): string | null {
  const sale = parseNumericInput(form.saleAmountTry);
  const membership = parseNumericInput(form.membershipOffsetTry);
  const service = parseNumericInput(form.serviceOffsetTry);
  const agentRate = parseNumericInput(form.agentRatePct);

  if (!Number.isFinite(sale) || sale <= 0) return "Satış/işlem tutarı 0'dan büyük olmalı.";
  if (!Number.isFinite(membership) || membership < 0) return "Üyelik mahsubu negatif olamaz.";
  if (!Number.isFinite(service) || service < 0) return "Hizmet mahsubu negatif olamaz.";
  if (!Number.isFinite(agentRate) || agentRate < 0 || agentRate > 100) return "B2B oranı %0-100 arasında olmalı.";

  return null;
}
