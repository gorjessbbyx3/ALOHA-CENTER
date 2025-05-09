
/**
 * Tax calculation utility functions
 */

/**
 * Default tax rate (8%)
 */
export const DEFAULT_TAX_RATE = 0.08;

/**
 * Calculate tax amount based on subtotal and tax rate
 * @param subtotal The subtotal amount
 * @param taxRate The tax rate (default: 8%)
 * @returns The calculated tax amount
 */
export function calculateTax(subtotal: number, taxRate: number = DEFAULT_TAX_RATE): number {
  return subtotal * taxRate;
}

/**
 * Calculate total with tax
 * @param subtotal The subtotal amount
 * @param taxRate The tax rate (default: 8%)
 * @returns The total amount including tax
 */
export function calculateTotalWithTax(subtotal: number, taxRate: number = DEFAULT_TAX_RATE): number {
  return subtotal + calculateTax(subtotal, taxRate);
}

/**
 * Format currency amount to 2 decimal places
 * @param amount The amount to format
 * @returns Formatted amount string with 2 decimal places
 */
export function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Get tax breakdown for receipt/invoice
 * @param subtotal The subtotal amount
 * @param taxRate The tax rate (default: 8%)
 * @returns Object containing subtotal, tax amount and total
 */
export function getTaxBreakdown(subtotal: number, taxRate: number = DEFAULT_TAX_RATE) {
  const taxAmount = calculateTax(subtotal, taxRate);
  const total = subtotal + taxAmount;
  
  return {
    subtotal,
    taxRate,
    taxAmount,
    total,
    formattedSubtotal: formatCurrency(subtotal),
    formattedTaxAmount: formatCurrency(taxAmount),
    formattedTotal: formatCurrency(total)
  };
}
