import { Check, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/nbc-payments";

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  eligible: boolean;
  onSelect: () => void;
}

/**
 * Compact selectable payment method.
 * Method-specific fields live in the shared Payment Details panel, never here.
 */
export function PaymentMethodCard({
  method,
  selected,
  eligible,
  onSelect,
}: PaymentMethodCardProps) {
  const Icon = method.icon;

  return (
    <button
      type="button"
      onClick={eligible ? onSelect : undefined}
      disabled={!eligible}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-shadow",
        selected ? "border-primary shadow-card" : "border-border/70",
        eligible ? "hover:bg-secondary/40" : "cursor-default bg-secondary/30",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          selected ? "bg-primary text-primary-foreground" : "bg-secondary text-nbc-royal",
        )}
      >
        <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{method.name}</span>
          {!eligible ? (
            <Lock aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
          ) : null}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
          {eligible ? method.tagline : method.benefit || method.tagline}
        </span>
      </span>

      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-transparent bg-primary text-primary-foreground" : "border-border",
        )}
      >
        {selected ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}
