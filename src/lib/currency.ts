/**
 * Multi-currency support.
 * Base currency is QAR (Qatari Riyal) — all prices in the DB are stored in QAR.
 * QAR is pegged to USD at 3.64; EUR rate is an indicative mid-market rate.
 */
export type Currency = "QAR" | "USD" | "EUR";

export const CURRENCIES: Record<
  Currency,
  { name: string; symbol: string; perQAR: number }
> = {
  QAR: { name: "ريال قطري", symbol: "ر.ق", perQAR: 1 },
  USD: { name: "دولار أمريكي", symbol: "$", perQAR: 1 / 3.64 },
  EUR: { name: "يورو", symbol: "€", perQAR: 1 / 4.18 },
};

/** Format a QAR amount in the selected currency and language */
export function formatMoney(
  amountQAR: number,
  c: Currency,
  lang: "ar" | "en"
): string {
  const { amount, unit } = splitMoney(amountQAR, c, lang);
  return unit === "ر.ق" || unit === "QAR" ? `${amount} ${unit}` : `${unit}${amount}`;
}

/** Split amount and unit for styled price rendering */
export function splitMoney(
  amountQAR: number,
  c: Currency,
  lang: "ar" | "en"
): { amount: string; unit: string } {
  const v = amountQAR * CURRENCIES[c].perQAR;
  if (c === "QAR") {
    return {
      amount: Math.round(v).toLocaleString("en-US"),
      unit: lang === "ar" ? "ر.ق" : "QAR",
    };
  }
  return { amount: v.toFixed(2), unit: CURRENCIES[c].symbol };
}
