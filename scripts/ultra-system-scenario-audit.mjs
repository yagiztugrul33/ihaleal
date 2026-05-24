import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const reportPath = path.join(root, "reports", "ultra-system-scenario-audit.json");

async function readSafe(relPath) {
  try {
    return await fs.readFile(path.join(root, relPath), "utf8");
  } catch {
    return "";
  }
}

function hasAll(haystack, needles) {
  return needles.every((needle) => haystack.includes(needle));
}

async function main() {
  const auctionDetail = await readSafe("src/pages/AuctionDetail.tsx");
  const bidGate = await readSafe("src/legal/bidGateAgreement.ts");
  const fees = await readSafe("src/lib/fees.ts");
  const sessionGuard = await readSafe("src/components/security/SessionSecurityGuard.tsx");
  const taxConfig = await readSafe("src/lib/taxConfig.ts");
  const privacy = await readSafe("src/pages/legal/LegalPrivacy.tsx");
  const iade = await readSafe("src/pages/legal/IadeIptal.tsx");

  const scenarios = [
    {
      id: "buyer-withdrawal-penalty",
      status: hasAll(bidGate, ["%5", "%2", "%3 + KDV"]) && hasAll(fees, ["WITHDRAWAL_PENALTY_RATE", "VICTIM_COMPENSATION_RATE"]) ? "pass" : "warning",
      evidence: "Cayma cezası ve dağılımı sözleşme kutuları + fee sabitleri kontrol edildi.",
    },
    {
      id: "backup-buyer-flow",
      status: hasAll(bidGate, ["Yedek alıcı", "3’er iş günü"]) && auctionDetail.includes("backupBidders") ? "pass" : "warning",
      evidence: "Yedek alıcı metni ve sıralama görünürlüğü kontrol edildi.",
    },
    {
      id: "seller-withdrawal-compensation",
      status: hasAll(auctionDetail, ["Satıcı cayarsa", "tazminat"]) ? "pass" : "warning",
      evidence: "Satıcı cayma tazminat metni kontrol edildi.",
    },
    {
      id: "unauthorized-transaction-prevention",
      status: hasAll(auctionDetail, ["txOtp", "txPassword", "txPin"]) && hasAll(sessionGuard, ["warningOpen", "setCountdown"]) ? "pass" : "warning",
      evidence: "Yetkisiz işlem önleme (şifre/PIN/OTP + oturum uyarısı) kontrol edildi.",
    },
    {
      id: "refund-back-to-source",
      status: hasAll(iade, ["geldiği ödeme aracına", "24-48 saat"]) ? "pass" : "warning",
      evidence: "İade akışında geldiği yoldan geri prensibi kontrol edildi.",
    },
    {
      id: "race-condition-and-anti-sniping",
      status: hasAll(fees, ["ANTI_SNIPING_THRESHOLD_SECONDS", "ANTI_SNIPING_EXTEND_SECONDS"]) ? "pass" : "warning",
      evidence: "Eş zamanlı teklif riskine karşı anti-sniping sabitleri kontrol edildi.",
    },
    {
      id: "escrow-disclaimer",
      status: hasAll(auctionDetail, ["PSP_FLOW_DISCLAIMER"]) && iade.includes("Platform kullanıcı varlıklarını kendi kasasında tutmaz") ? "pass" : "warning",
      evidence: "Escrow ve platform para tutmaz beyanları kontrol edildi.",
    },
    {
      id: "tcmb-multi-currency",
      status: hasAll(taxConfig, ["rentalExemptionTry2026", "revaluationRate2026"]) && auctionDetail.includes("getTaxRuntimeConfig") ? "pass" : "warning",
      evidence: "Parametrik vergi ve çoklu para görünürlük bağlantıları kontrol edildi.",
    },
    {
      id: "privacy-third-party-sharing",
      status: hasAll(privacy, ["3. şahıs", "paylaşılmaz"]) ? "pass" : "warning",
      evidence: "KVKK/gizlilik sayfalarında üçüncü taraf paylaşım sınırları kontrol edildi.",
    },
  ];

  const passCount = scenarios.filter((s) => s.status === "pass").length;
  const warningCount = scenarios.length - passCount;
  const report = {
    at: new Date().toISOString(),
    passCount,
    warningCount,
    scenarios,
  };

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`[ultra-system-scenario-audit] pass=${passCount} warning=${warningCount}`);
  console.log(`[ultra-system-scenario-audit] report=${reportPath}`);
}

await main();

