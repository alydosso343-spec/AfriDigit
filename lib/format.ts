/** Formats prix et liens partagés entre le site public et l'administration. */

/**
 * Formate un prix selon la devise configurée, en français.
 * Exemple : 25000 XOF → « 25 000 F CFA ».
 * Gestion des devises sans centime (FCFA) : pas de décimales.
 */
const CURRENCIES_WITHOUT_DECIMALS = new Set([
  "XOF", "XAF", "CLP", "JPY", "KRW", "CDF", "RWF", "UGX", "KES", "GHS",
]);

export function formatPrice(price: number, currency: string): string {
  const decimals = CURRENCIES_WITHOUT_DECIMALS.has(currency.toUpperCase()) ? 0 : 2;
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(price);
  } catch {
    // Devise non reconnue par Intl : repli simple mais lisible.
    return `${price.toLocaleString("fr-FR")} ${currency}`;
  }
}
