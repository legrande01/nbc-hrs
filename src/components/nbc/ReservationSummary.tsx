import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/nbc-discovery-filters";
import { chargedNights, TAX_RATE, type SelectionTotals } from "@/lib/nbc-room-selection";
import { cn } from "@/lib/utils";

interface ReservationSummaryProps {
  totals: SelectionTotals;
  currency: string;
  nights: number;
  onIncrement: (roomId: string) => void;
  onDecrement: (roomId: string) => void;
  onClear: (roomId: string) => void;
  onContinue: () => void;
  className?: string;
}

/** Live reservation summary with per-category quantities and a grand total. */
export function ReservationSummary({
  totals,
  currency,
  nights,
  onIncrement,
  onDecrement,
  onClear,
  onContinue,
  className,
}: ReservationSummaryProps) {
  const effectiveNights = Math.max(nights, 1);
  const empty = totals.lines.length === 0;

  return (
    <aside
      className={cn(
        "grid content-start gap-6 rounded-2xl border border-border/70 bg-card p-6 shadow-card",
        className,
      )}
    >
      <div>
        <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Your Reservation</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          Booking summary
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {effectiveNights} {effectiveNights === 1 ? "night" : "nights"} ·{" "}
          {totals.roomCount} {totals.roomCount === 1 ? "room" : "rooms"} selected
        </p>
      </div>

      {empty ? (
        <p className="rounded-xl bg-secondary/50 px-4 py-5 text-sm leading-relaxed text-muted-foreground">
          No rooms selected yet. Choose a room category to build your reservation — you can mix
          different categories in one booking.
        </p>
      ) : (
        <ul className="grid gap-4">
          {totals.lines.map((line) => {
            const billable = chargedNights(line.room, effectiveNights);
            return (
              <li key={line.room.id} className="grid gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{line.room.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {billable} {billable === 1 ? "night" : "nights"} charged ·{" "}
                      {formatPrice(line.room.nightlyRate, currency)} per night
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onClear(line.room.id)}
                    aria-label={`Remove ${line.room.name} from your reservation`}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDecrement(line.room.id)}
                      aria-label={`Decrease ${line.room.name} quantity`}
                    >
                      <Minus aria-hidden="true" />
                    </Button>
                    <span className="min-w-8 text-center text-sm font-semibold text-foreground">
                      {line.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onIncrement(line.room.id)}
                      aria-label={`Increase ${line.room.name} quantity`}
                    >
                      <Plus aria-hidden="true" />
                    </Button>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatPrice(line.subtotal, currency)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <dl className="grid gap-3 border-t border-border pt-5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Rooms subtotal</dt>
          <dd className="font-medium text-foreground">{formatPrice(totals.subtotal, currency)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">
            Estimated taxes &amp; fees ({Math.round(TAX_RATE * 100)}%)
          </dt>
          <dd className="font-medium text-foreground">{formatPrice(totals.taxes, currency)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <dt className="text-base font-semibold text-foreground">Grand Total</dt>
          <dd className="text-xl font-semibold tracking-tight text-foreground">
            {formatPrice(totals.total, currency)}
          </dd>
        </div>
      </dl>

      <Button size="xl" disabled={empty} onClick={onContinue}>
        Continue Reservation
      </Button>
      <p className="text-xs leading-relaxed text-muted-foreground">
        You are reserving room categories. Physical room numbers are assigned by the hotel at
        check-in.
      </p>
    </aside>
  );
}
