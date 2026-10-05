/**
 * Referral discount utility — shared by shop, product, cart, and checkout pages.
 * All monetary rounding is done with Math.round() to whole PKR.
 */

/**
 * Compute the effective (discounted) price for a single item given the
 * currently-applied referral code's percentage and eligible categories.
 *
 * Rules:
 *  - No code applied → return original price unchanged.
 *  - Code applies to "All categories" → every item is eligible.
 *  - Otherwise → only items whose category matches one entry in referralCategories.
 *  - Discount is applied to the selling price (never the old/struck-through price).
 *  - Result is always ≥ 0.
 */
export function getDiscountedPrice(
  price: number,
  category: string | undefined,
  referralCode: string | undefined,
  referralPct: number | undefined,
  referralCategories: string[] | undefined
): { discountedPrice: number; hasDiscount: boolean } {
  if (!referralCode || !referralPct || referralPct <= 0) {
    return { discountedPrice: price, hasDiscount: false };
  }

  const cats = referralCategories ?? [];
  const eligible =
    cats.includes("All categories") ||
    (!!category &&
      cats.some((c) => c.toLowerCase() === (category ?? "").toLowerCase()));

  if (!eligible) {
    return { discountedPrice: price, hasDiscount: false };
  }

  return {
    discountedPrice: Math.max(0, Math.round(price * (1 - referralPct / 100))),
    hasDiscount: true,
  };
}
