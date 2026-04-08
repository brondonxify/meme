/**
 * Format the input amount string into a currency format (XAF).
 * @param  amount - The amount to be formatted as a string.
 * @returns The formatted amount in XAF currency format.
 */
export const formatAmount = (amount: string | number): string => {
  const amountInNumber =
    typeof amount === "string" ? parseFloat(amount) : amount;

  const formatted = new Intl.NumberFormat("fr-CM", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInNumber);

  return `${formatted} XAF`;
};
