import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/nbc-discovery-filters";
import type { NbcCustomerProfile } from "@/lib/nbc-profile";
import type { PaymentMethod } from "@/lib/nbc-payments";
import { cn } from "@/lib/utils";

export interface PaymentDetailsState {
  phone: string;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvc: string;
  instalments: number;
  carrier: string;
}

const carriers = ["M-Pesa", "Tigo Pesa", "Airtel Money", "Halopesa"];

interface PaymentDetailsPanelProps {
  method?: PaymentMethod;
  profile: NbcCustomerProfile;
  total: number;
  currency: string;
  value: PaymentDetailsState;
  onChange: <K extends keyof PaymentDetailsState>(key: K, value: PaymentDetailsState[K]) => void;
  className?: string;
}

/**
 * One shared Payment Details panel.
 * Its body is driven entirely by the selected method, so payment cards stay compact.
 */
export function PaymentDetailsPanel({
  method,
  profile,
  total,
  currency,
  value,
  onChange,
  className,
}: PaymentDetailsPanelProps) {
  return (
    <div
      className={cn(
        "grid gap-5 rounded-2xl border border-border/70 bg-card p-6 shadow-card",
        className,
      )}
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Payment Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {method
            ? `Complete the details for ${method.name}.`
            : "Choose a payment method above to continue."}
        </p>
      </div>

      {!method ? (
        <p className="rounded-xl bg-secondary/50 px-4 py-5 text-sm leading-relaxed text-muted-foreground">
          No payment method selected yet. Your reservation is still held while you decide.
        </p>
      ) : null}

      {method?.id === "mobile-money" ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="momo-carrier">Mobile network</Label>
            <select
              id="momo-carrier"
              value={value.carrier}
              onChange={(event) => onChange("carrier", event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              {carriers.map((carrier) => (
                <option key={carrier} value={carrier}>
                  {carrier}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="momo-phone">Mobile money number</Label>
            <Input
              id="momo-phone"
              type="tel"
              placeholder="+255 700 000 000"
              value={value.phone}
              onChange={(event) => onChange("phone", event.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            You will receive a USSD push on this number to approve{" "}
            {formatPrice(total, currency)}.
          </p>
        </div>
      ) : null}

      {method?.id === "card" ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="card-name">Name on card</Label>
            <Input
              id="card-name"
              value={value.cardName}
              autoComplete="cc-name"
              onChange={(event) => onChange("cardName", event.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="card-number">Card number</Label>
            <Input
              id="card-number"
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              value={value.cardNumber}
              onChange={(event) => onChange("cardNumber", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="card-expiry">Expiry</Label>
            <Input
              id="card-expiry"
              placeholder="MM/YY"
              value={value.cardExpiry}
              onChange={(event) => onChange("cardExpiry", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="card-cvc">CVC</Label>
            <Input
              id="card-cvc"
              inputMode="numeric"
              placeholder="123"
              value={value.cardCvc}
              onChange={(event) => onChange("cardCvc", event.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Visa and Mastercard, secured and processed by NBC.
          </p>
        </div>
      ) : null}

      {method?.id === "control-number" ? (
        <div className="grid gap-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            We will generate a unique NBC control number for {formatPrice(total, currency)} and
            hold your rooms for 48 hours.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Pay at any NBC branch, agent, ATM or through the NBC mobile app using that number. Your
            reservation confirms automatically once payment is received.
          </p>
        </div>
      ) : null}

      {method?.id === "bnpl" ? (
        <div className="grid gap-3">
          <Label htmlFor="instalments">Instalment plan</Label>
          <div className="flex flex-wrap gap-2">
            {[3, 6, 12].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => onChange("instalments", count)}
                aria-pressed={value.instalments === count}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  value.instalments === count
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-secondary",
                )}
              >
                {count} months
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatPrice(Math.round(total / value.instalments), currency)} per month · first
            payment due next month · financed by NBC.
          </p>
        </div>
      ) : null}

      {method?.id === "save-to-buy" && profile.savingsGoal ? (
        <div className="grid gap-1.5">
          <p className="text-sm font-medium text-foreground">{profile.savingsGoal.name}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {formatPrice(profile.savingsGoal.saved, currency)} saved of{" "}
            {formatPrice(profile.savingsGoal.target, currency)}. This reservation draws{" "}
            {formatPrice(total, currency)}, leaving{" "}
            {formatPrice(Math.max(profile.savingsGoal.saved - total, 0), currency)} in your goal.
          </p>
        </div>
      ) : null}

      {method?.id === "loyalty-points" ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          You have {profile.loyaltyPoints.toLocaleString("en-GB")} points. This reservation redeems{" "}
          {Math.round(total / profile.loyaltyPointValue).toLocaleString("en-GB")} points, covering{" "}
          {formatPrice(total, currency)} in full.
        </p>
      ) : null}
    </div>
  );
}
