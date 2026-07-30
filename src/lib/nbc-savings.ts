/**
 * Demo savings engine: coupon codes and NBC Loyalty redemption.
 * Values are placeholders; the shapes match what the pricing service will return.
 */

export const LOYALTY_POINT_VALUE = 20; // TZS per point
export const LOYALTY_BALANCE = 12_500; // demo member balance
/** Loyalty may never cover more than this share of the room subtotal. */
export const LOYALTY_MAX_SHARE = 0.3;

interface CouponRule {
  code: string;
  label: string;
  percentOff?: number;
  amountOff?: number;
  minSubtotal?: number;
}

const coupons: CouponRule[] = [
  { code: "NBC10", label: "NBC Welcome — 10% off", percentOff: 10 },
  { code: "STAY2026", label: "Stay 2026 — TZS 50,000 off", amountOff: 50_000, minSubtotal: 250_000 },
  { code: "NBCGOLD", label: "NBC Gold Cardholder — 15% off", percentOff: 15, minSubtotal: 400_000 },
];

export interface CouponResult {
  status: "valid" | "invalid" | "ineligible";
  discount: number;
  label: string;
  message: string;
}

/** Validates a coupon code against the current subtotal. */
export function applyCoupon(rawCode: string, subtotal: number): CouponResult {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { status: "invalid", discount: 0, label: "", message: "Enter a discount code." };
  }

  const rule = coupons.find((coupon) => coupon.code === code);
  if (!rule) {
    return {
      status: "invalid",
      discount: 0,
      label: "",
      message: "That code isn't recognised. Check the spelling and try again.",
    };
  }

  if (rule.minSubtotal && subtotal < rule.minSubtotal) {
    return {
      status: "ineligible",
      discount: 0,
      label: rule.label,
      message: `This code applies to stays from TZS ${rule.minSubtotal.toLocaleString("en-US")}.`,
    };
  }

  const discount = rule.percentOff
    ? Math.round((subtotal * rule.percentOff) / 100)
    : Math.min(rule.amountOff ?? 0, subtotal);

  return {
    status: "valid",
    discount,
    label: rule.label,
    message: `${rule.label} applied to your stay.`,
  };
}

/** Highest number of points that may be redeemed against this subtotal. */
export function maxRedeemablePoints(subtotal: number): number {
  const cap = Math.floor((subtotal * LOYALTY_MAX_SHARE) / LOYALTY_POINT_VALUE);
  return Math.max(0, Math.min(LOYALTY_BALANCE, cap));
}

/** Cash value of redeemed points. */
export function loyaltyValue(points: number): number {
  return Math.max(0, Math.round(points)) * LOYALTY_POINT_VALUE;
}
