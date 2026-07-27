import { Check, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/nbc-payments";

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  eligible: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}

/** Selectable payment method with an inline panel for its own fields. */
export function PaymentMethodCard({
  method,
  selected,
  eligible,
  onSelect,
  children,
}: PaymentMethodCardProps) {
  const Icon = method.icon;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border transition-shadow",
        selected ? "border-primary shadow-card" : "border-border/70",
        !eligible && "bg-secondary/30",
      )}
    >
      <button
        type="button"
        onClick={eligible ? onSelect : undefined}
        disabled={!eligible}
        aria-pressed={selected}
        className={cn(
          "flex w-full items-start gap-4 p-5 text-left transition-colors",
          eligible ? "hover:bg-secondary/40" : "cursor-default",
        )}
      >
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            selected ? "bg-primary text-primary-foreground" : "bg-secondary text-nbc-royal",
          )}
        >
          <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-base font-semibold text-foreground">{method.name}</span>
            {!eligible ? (
              <Lock aria-hidden="true" className="size-3.5 text-muted-foreground" />
            ) : null}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {eligible ? method.tagline : method.benefit || method.tagline}
          </span>
        </span>

        <span
          aria-hidden="true"
          className={cn(
            "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border",
            selected ? "border-transparent bg-primary text-primary-foreground" : "border-border",
          )}
        >
          {selected ? <Check className="size-3" strokeWidth={3} /> : null}
        </span>
      </button>

      {selected && children ? (
        <div className="border-t border-border bg-secondary/25 p-5">{children}</div>
      ) : null}
    </div>
  );
}
