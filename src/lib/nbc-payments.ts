import { CreditCard, Gift, Hash, Smartphone, type LucideIcon } from "lucide-react";

import type { NbcCustomerProfile } from "@/lib/nbc-profile";

/**
 * Placeholder payment contract.
 * Shapes mirror the future payments API so presentation components stay
 * unchanged when live processing is introduced.
 */

export type PaymentMethodId =
  | "loyalty-points"
  | "mobile-money"
  | "card"
  | "control-number";

export type PaymentGroup = "nbc-exclusive" | "everyone";

export type PaymentStatus = "paid" | "financed" | "pending";

export interface PaymentMethod {
  id: PaymentMethodId;
  group: PaymentGroup;
  name: string;
  tagline: string;
  /** Why linking an NBC account is worth it — shown when not eligible. */
  benefit: string;
  icon: LucideIcon;
  cta: string;
  status: PaymentStatus;
}

/** Ordered catalogue. Order is intentional and drives the Payment screen. */
export const paymentMethods: PaymentMethod[] = [
  {
    id: "loyalty-points",
    group: "nbc-exclusive",
    name: "Loyalty Points",
    tagline: "Redeem NBC Hospitality points against your stay.",
    benefit: "Turn your NBC points into free nights across the network.",
    icon: Gift,
    cta: "Confirm with Points",
    status: "paid",
  },
  {
    id: "mobile-money",
    group: "everyone",
    name: "Mobile Money",
    tagline: "Approve a USSD push on your phone.",
    benefit: "",
    icon: Smartphone,
    cta: "Send USSD Push",
    status: "paid",
  },
  {
    id: "card",
    group: "everyone",
    name: "Card Payment",
    tagline: "Visa or Mastercard, secured by NBC.",
    benefit: "",
    icon: CreditCard,
    cta: "Confirm & Pay",
    status: "paid",
  },
  {
    id: "control-number",
    group: "everyone",
    name: "Control Number",
    tagline: "Generate a reference and pay at any NBC branch or agent.",
    benefit: "",
    icon: Hash,
    cta: "Generate Control Number",
    status: "pending",
  },
];

export function methodsInGroup(group: PaymentGroup): PaymentMethod[] {
  return paymentMethods.filter((method) => method.group === group);
}

export function getPaymentMethod(id: PaymentMethodId): PaymentMethod {
  return paymentMethods.find((method) => method.id === id) ?? paymentMethods[0];
}

/** Eligibility is a pure function of the profile so it stays truthful later. */
export function isMethodEligible(
  method: PaymentMethod,
  profile: NbcCustomerProfile,
  nbcAccountLinked: boolean,
): boolean {
  if (method.group === "everyone") return true;
  if (!nbcAccountLinked) return false;
  return true;
}

export interface PaymentOutcome {
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  amount: number;
  currency: string;
  paidAt: string;
  /** Method-specific detail rendered on the confirmation screen. */
  loyalty?: { pointsRedeemed: number; pointsRemaining: number };
  controlNumber?: { number: string; dueBy: string };
  phone?: string;
  cardLast4?: string;
}

export const CONFIRMATION_HEADLINES: Record<PaymentMethodId, string> = {
  "mobile-money": "Reservation Confirmed & Paid",
  card: "Reservation Confirmed & Paid",
  "control-number": "Reservation Confirmed — Awaiting Payment",
  "loyalty-points": "Reservation Confirmed — Paid with loyalty points",
};

export const CONFIRMATION_SUBLINES: Record<PaymentMethodId, string> = {
  "mobile-money": "Your mobile money payment was received in full.",
  card: "Your card payment was received in full.",
  "control-number":
    "Your rooms are held. Complete payment with the control number below before the deadline.",
  "loyalty-points": "Your loyalty redemption covers this reservation in full.",
};

/** Human payment status shown on the Booking Confirmation. */
export const CONFIRMATION_STATUS_LABELS: Record<PaymentMethodId, string> = {
  card: "Paid",
  "mobile-money": "Paid",
  "loyalty-points": "Paid with Loyalty Points",
  "control-number": "Reservation Confirmed – Awaiting Payment",
};


function randomDigits(length: number): string {
  let out = "";
  for (let index = 0; index < length; index += 1) {
    out += Math.floor(Math.random() * 10).toString();
  }
  return out;
}

export function generateBookingReference(): string {
  return `NBC-${randomDigits(4)}-${randomDigits(4)}`;
}

export function formatOutcomeDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export interface BuildOutcomeInput {
  method: PaymentMethod;
  amount: number;
  currency: string;
  profile: NbcCustomerProfile;
  phone?: string;
  cardLast4?: string;
}

/** Builds the placeholder payment outcome for the confirmation screen. */
export function buildPaymentOutcome({
  method,
  amount,
  currency,
  profile,
  phone,
  cardLast4,
}: BuildOutcomeInput): PaymentOutcome {
  const now = new Date();
  const outcome: PaymentOutcome = {
    method,
    status: method.status,
    reference: generateBookingReference(),
    amount,
    currency,
    paidAt: now.toISOString(),
  };

  if (method.id === "loyalty-points") {
    const pointsRedeemed = Math.round(amount / profile.loyaltyPointValue);
    outcome.loyalty = {
      pointsRedeemed,
      pointsRemaining: Math.max(profile.loyaltyPoints - pointsRedeemed, 0),
    };
  }

  if (method.id === "control-number") {
    const dueBy = new Date(now);
    dueBy.setDate(dueBy.getDate() + 2);
    outcome.controlNumber = { number: randomDigits(12), dueBy: dueBy.toISOString() };
  }

  if (phone) outcome.phone = phone;
  if (cardLast4) outcome.cardLast4 = cardLast4;

  return outcome;
}
