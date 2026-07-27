import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type BookingStepId = "reservation" | "payment" | "confirmation";

const steps: { id: BookingStepId; label: string }[] = [
  { id: "reservation", label: "Reservation Details" },
  { id: "payment", label: "Payment" },
  { id: "confirmation", label: "Confirmation" },
];

interface BookingStepperProps {
  current: BookingStepId;
  className?: string;
}

/** Shared progress header across the four booking-flow routes. */
export function BookingStepper({ current, className }: BookingStepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Booking progress" className={cn("w-full", className)}>
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-3">
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={step.id} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  done && "border-transparent bg-nbc-emerald text-primary-foreground",
                  active && "border-transparent bg-primary text-primary-foreground",
                  !done && !active && "border-border bg-background text-muted-foreground",
                )}
                aria-hidden="true"
              >
                {done ? <Check className="size-3.5" strokeWidth={2.5} /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-sm",
                  active ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
                aria-current={active ? "step" : undefined}
              >
                {step.label}
              </span>
              {index < steps.length - 1 ? (
                <span aria-hidden="true" className="hidden h-px w-8 bg-border sm:block" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
