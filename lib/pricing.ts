/**
 * Pricing logic for dealer orders.
 * Only dealers can order. Price is $28 per unit (stair nose).
 */

export const PRICE_PER_UNIT_CENTS = 2800 // $28.00

/**
 * Calculate order total from quantity (number of stair noses).
 * @param quantity Total number of units (stair noses)
 * @returns Total amount in cents
 */
export function calculateOrderTotalCents(quantity: number): number {
  return Math.max(0, quantity) * PRICE_PER_UNIT_CENTS
}
