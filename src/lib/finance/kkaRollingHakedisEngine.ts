/**
 * Kat karsiligi: rolling hakedis retention (yuvarlanan blokaj).
 * Draft only; binding wording needs counsel.
 */

export type KkaRollingHakedisRow = {
  trancheIndex: number;
  accrualTriggerTr: string;
  retentionUntilTr: string;
  becomesPayableWhenTr: string;
};

export function buildKkaRollingHakedisRows(trancheCount: number): KkaRollingHakedisRow[] {
  if (!Number.isInteger(trancheCount) || trancheCount < 2 || trancheCount > 24) {
    throw new RangeError("trancheCount must be an integer between 2 and 24");
  }
  const rows: KkaRollingHakedisRow[] = [];
  for (let i = 1; i <= trancheCount; i++) {
    const isLast = i === trancheCount;
    rows.push({
      trancheIndex: i,
      accrualTriggerTr: `Hakedis ${i} tutari, bu dilime tekabul eden imalatin kismi kabultusu veya muteahhit hakedis raporunun Taraflarca onaylanmasi ile kesinlesir; tutar kesif ve metraj ile netlestirilir.`,
      retentionUntilTr: isLast
        ? `Son dilim (Hakedis ${i}) tutari, kesin kabul veya tapu / kat mulkiyeti zinciri tamamlanincaya kadar emanet hesabinda bloke kalir.`
        : `Hakedis ${i} odemesi, Hakedis ${i + 1} raporunun onaylanmasina kadar bloke edilir.`,
      becomesPayableWhenTr: isLast
        ? `Kesin kabul sonrasi son dilim odenir; dilim ${i - 1} bu son raporun onayi ile odenebilir olur.`
        : i === 1
          ? `Hakedis 2 raporu onaylaninca Hakedis 1 odenebilir (ilk dilim sonrakine kadar icinde).`
          : `Hakedis ${i + 1} raporu onaylaninca Hakedis ${i} odenebilir.`,
    });
  }
  return rows;
}

export function formatKkaRollingHakedisScheduleLines(trancheCount: number): string[] {
  return buildKkaRollingHakedisRows(trancheCount).map(
    (r) => `Dilim ${r.trancheIndex}: ${r.retentionUntilTr} => ${r.becomesPayableWhenTr}`,
  );
}

export function formatKkaRollingHakedisContractBlock(trancheCount: number): string {
  const rows = buildKkaRollingHakedisRows(trancheCount);
  const bullets = rows
    .map(
      (r) =>
        `- Hakedis ${r.trancheIndex}: ${r.accrualTriggerTr} ${r.retentionUntilTr} Odeme kosulu: ${r.becomesPayableWhenTr}`,
    )
    .join("\n");

  return [
    "MADDE 10/A - Yuvarlanan hakedis blokesi (ornek iskelet)",
    "",
    "10/A.1 Taraflar, muteahhit lehine dogan hakedis alacaklarinin bir kisminin sonraki kismi kabul / hakedis raporu onaylanincaya kadar emanet veya bloke hesapta tutulmasinda mutabiktirlar.",
    "Bu duzen cezai sart niteligi tasimaz; TBK md.2, md.5 ve md.18 ile orantilik ve iyiniyet ilkesine uygun gecici odeme guvencesi olarak yorumlanir.",
    "",
    `10/A.2 Bu kabataslakta ${trancheCount} hakedis dilimi ongorulmustur.`,
    "",
    "10/A.3 Odeme zinciri:",
    bullets,
    "",
    "10/A.4 Stopaj, KDV, fatura ve mahsuplasma ek protokol ve YMM taslagina tabidir.",
    "",
    "10/A.5 Feragat: avukat onayi olmadan baglayici sayilmaz.",
  ].join("\n");
}

export function kkaRollingHakedisLegalPrinciplesNoteTr(): string {
  return "TBK iyiniyet (md.2), borclunun korunmasi (md.5), ifa ile odeme (md.18); BKIl cercevesinde cezai sart sinirlari.";
}
