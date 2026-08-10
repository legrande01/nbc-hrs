import {
  Banknote,
  CreditCard,
  Gift,
  Hash,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

/**
 * Customer Payments module — demo data and a thin service layer.
 *
 * NBC HRS never stores card numbers, CVV, PINs, MNO credentials or any
 * reusable payment credential. Only transaction metadata required for the
 * reservation/payment history is modelled here.
 *
 * The linking service below is a simulation. Its shape mirrors the future NBC
 * account validation + OTP service so the UI stays unchanged when the real
 * service is introduced.
 */

/* ------------------------------------------------------------------ */
/* Payment history                                                     */
/* ------------------------------------------------------------------ */

export type PaymentChannel =
  | "card"
  | "mobile-money"
  | "control-number"
  | "nbc-account"
  | "loyalty-points";

export const paymentChannelLabels: Record<PaymentChannel, string> = {
  card: "Card",
  "mobile-money": "Mobile Money / USSD Push",
  "control-number": "Control Number",
  "nbc-account": "NBC Account",
  "loyalty-points": "Loyalty Points",
};

export const paymentChannelIcons: Record<PaymentChannel, LucideIcon> = {
  card: CreditCard,
  "mobile-money": Smartphone,
  "control-number": Hash,
  "nbc-account": Banknote,
  "loyalty-points": Gift,
};

export type PaymentRecordStatus = "paid" | "pending" | "refunded" | "failed";

export const paymentStatusLabels: Record<PaymentRecordStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  refunded: "Refunded",
  failed: "Failed",
};

/** Token classes only — no hardcoded colours. */
export const paymentStatusClasses: Record<PaymentRecordStatus, string> = {
  paid: "border-nbc-royal/25 bg-nbc-royal/10 text-nbc-royal",
  pending: "border-nbc-gold/40 bg-nbc-gold/15 text-foreground",
  refunded: "border-border bg-secondary text-muted-foreground",
  failed: "border-nbc-scarlet/30 bg-nbc-scarlet/10 text-nbc-scarlet",
};

export interface PaymentRecord {
  id: string;
  paidOn: string;
  hotelName: string;
  reservationReference: string;
  channel: PaymentChannel;
  /** Non-sensitive channel detail, e.g. "M-Pesa •••• 7412". */
  channelDetail: string;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  transactionReference: string;
  note?: string;
}

export const paymentHistory: PaymentRecord[] = [
  {
    id: "pay-1",
    paidOn: "2026-07-24",
    hotelName: "The Harbour House",
    reservationReference: "NBC-HRS-48210",
    channel: "mobile-money",
    channelDetail: "M-Pesa •••• 7412",
    amount: 1_240_000,
    currency: "TZS",
    status: "paid",
    transactionReference: "MPESA-9F42XK118",
  },
  {
    id: "pay-2",
    paidOn: "2026-07-19",
    hotelName: "Zanzibar Pearl Resort",
    reservationReference: "NBC-HRS-47155",
    channel: "control-number",
    channelDetail: "Control Number 991 204 887 314",
    amount: 2_180_000,
    currency: "TZS",
    status: "pending",
    transactionReference: "CN-991204887314",
    note: "Pay at any NBC branch or agent before check-in.",
  },
  {
    id: "pay-3",
    paidOn: "2026-07-02",
    hotelName: "Kilimanjaro View Lodge",
    reservationReference: "NBC-HRS-46022",
    channel: "card",
    channelDetail: "Visa •••• 4021",
    amount: 1_560_000,
    currency: "TZS",
    status: "paid",
    transactionReference: "VISA-7742LQ09",
  },
  {
    id: "pay-4",
    paidOn: "2026-06-28",
    hotelName: "Serena Lake Manyara",
    reservationReference: "NBC-HRS-44980",
    channel: "nbc-account",
    channelDetail: "NBC Account •••• 4821",
    amount: 1_980_000,
    currency: "TZS",
    status: "refunded",
    transactionReference: "NBC-5521PP74",
    note: "Refunded in full after a cancelled stay.",
  },
  {
    id: "pay-5",
    paidOn: "2026-05-30",
    hotelName: "Dodoma Capital Hotel",
    reservationReference: "NBC-HRS-43117",
    channel: "card",
    channelDetail: "Mastercard •••• 8890",
    amount: 480_000,
    currency: "TZS",
    status: "paid",
    transactionReference: "MC-3320RF55",
  },
  {
    id: "pay-6",
    paidOn: "2026-05-11",
    hotelName: "Zanzibar Pearl Resort",
    reservationReference: "NBC-HRS-42088",
    channel: "loyalty-points",
    channelDetail: "184,500 points redeemed",
    amount: 620_000,
    currency: "TZS",
    status: "paid",
    transactionReference: "LOYALTY-88210KQ",
  },
  {
    id: "pay-7",
    paidOn: "2026-04-27",
    hotelName: "The Harbour House",
    reservationReference: "NBC-HRS-41720",
    channel: "mobile-money",
    channelDetail: "Airtel Money •••• 3388",
    amount: 310_000,
    currency: "TZS",
    status: "failed",
    transactionReference: "AIRTEL-1180QW3",
    note: "USSD push expired before approval. The reservation was paid again by card.",
  },
];

export function formatPaymentMoney(amount: number, currency = "TZS"): string {
  return `${currency} ${new Intl.NumberFormat("en-US").format(amount)}`;
}

export function formatPaymentDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export interface PaymentSummary {
  total: number;
  completed: number;
  refunded: number;
  completedAmount: number;
  refundedAmount: number;
}

export function summarisePayments(records: PaymentRecord[]): PaymentSummary {
  return records.reduce<PaymentSummary>(
    (acc, record) => {
      acc.total += 1;
      if (record.status === "paid") {
        acc.completed += 1;
        acc.completedAmount += record.amount;
      }
      if (record.status === "refunded") {
        acc.refunded += 1;
        acc.refundedAmount += record.amount;
      }
      return acc;
    },
    { total: 0, completed: 0, refunded: 0, completedAmount: 0, refundedAmount: 0 },
  );
}

/* ------------------------------------------------------------------ */
/* NBC account linking                                                 */
/* ------------------------------------------------------------------ */

export interface LinkedNbcAccount {
  id: string;
  /** Masked only — full account numbers are never stored or displayed. */
  maskedNumber: string;
  accountName: string;
  branch: string;
  linkedOn: string;
  /** Masked phone registered to the NBC account, used for OTP delivery. */
  maskedPhone: string;
  primary: boolean;
}

export const nbcAccountBenefits = [
  "Pay directly from your NBC Account during checkout",
  "Use eligible Loyalty Points against your stay",
  "A faster, more seamless payment experience",
  "Access to eligible NBC member benefits and offers",
];

export const linkingSteps = [
  "Enter your NBC Account details",
  "We validate the account",
  "An OTP is sent to the phone number registered to that NBC Account",
  "Enter the OTP",
  "Account is verified and linked",
];

export const paymentSecurityPoints = [
  "Full card numbers",
  "CVV",
  "Card PINs",
  "MNO PINs",
  "Reusable payment credentials",
];

export function maskAccountNumber(accountNumber: string): string {
  const digits = accountNumber.replace(/\D/g, "");
  return `•••• •••• ${digits.slice(-4).padStart(4, "•")}`;
}

export interface ValidatedNbcAccount {
  accountName: string;
  branch: string;
  maskedNumber: string;
  /** Phone registered to the NBC account — the only valid OTP destination. */
  maskedPhone: string;
}

export const OTP_RESEND_SECONDS = 45;

/**
 * Simulated NBC account validation.
 * Replace the body with the real NBC core-banking lookup; the contract stays.
 */
export async function validateNbcAccount(
  accountNumber: string,
  linkedMaskedNumbers: string[] = [],
): Promise<ValidatedNbcAccount> {
  await delay(700);
  const digits = accountNumber.replace(/\D/g, "");
  if (digits.length < 10) {
    throw new Error("Enter a valid NBC account number (at least 10 digits).");
  }
  const masked = maskAccountNumber(digits);
  if (linkedMaskedNumbers.includes(masked)) {
    throw new Error("This NBC Account is already linked to your profile.");
  }
  const tail = digits.slice(-4);
  return {
    accountName: "NBC Current Account",
    branch: "Masaki Branch",
    maskedNumber: masked,
    // Derived from the account record — never from the NBC HRS profile phone.
    maskedPhone: `+255 *** *** ${tail}`,
  };
}

/**
 * Simulated OTP dispatch to the phone registered against the NBC Account.
 * Returns the destination so the UI can show it in masked form.
 */
export async function sendNbcAccountOtp(
  account: ValidatedNbcAccount,
): Promise<{ maskedPhone: string; expiresInSeconds: number }> {
  await delay(600);
  return { maskedPhone: account.maskedPhone, expiresInSeconds: 300 };
}

/** Simulated OTP verification. Demo code: 123456. */
export async function verifyNbcAccountOtp(code: string): Promise<boolean> {
  await delay(600);
  if (!/^\d{6}$/.test(code)) throw new Error("Enter the 6-digit code.");
  if (code !== "123456") throw new Error("That code is incorrect. Please try again.");
  return true;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
