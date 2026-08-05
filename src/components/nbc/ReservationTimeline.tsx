import { Check } from "lucide-react";

import { timelineFor, type Reservation } from "@/lib/nbc-reservations";
import { cn } from "@/lib/utils";

/**
 * Horizontal (desktop) / vertical (mobile) progress of a reservation.
 * Only the stages that apply to the reservation status are rendered.
 */
export function ReservationTimeline({ reservation }: { reservation: Reservation }) {
  const stages = timelineFor(reservation);

  return (
    <ol className="grid gap-4 sm:grid-flow-col sm:auto-cols-fr sm:gap-0">
      {stages.map((stage, index) => {
        const Icon = stage.state === "done" ? Check : stage.icon;
        const active = stage.state !== "todo";
        return (
          <li key={stage.key} className="flex items-start gap-3 sm:block">
            <div className="flex items-center gap-0 sm:gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full border",
                  stage.state === "done" && "border-transparent bg-nbc-royal text-primary-foreground",
                  stage.state === "current" &&
                    "border-nbc-royal bg-nbc-royal/10 text-nbc-royal",
                  stage.state === "todo" && "border-border bg-secondary/50 text-muted-foreground",
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              {index < stages.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "hidden h-px flex-1 sm:block",
                    active ? "bg-nbc-royal/40" : "bg-border",
                  )}
                />
              ) : null}
            </div>
            <p
              className={cn(
                "text-sm font-medium sm:mt-3",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {stage.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
