import { Link } from "@tanstack/react-router";

import { formatPrice } from "@/lib/nbc-discovery-filters";
import { formatStayDate } from "@/lib/nbc-room-selection";
import type { BookingSession } from "@/lib/nbc-booking-flow";
import { cn } from "@/lib/utils";

interface ReservationReviewProps {
  session: BookingSession;
  /** Shows a "Modify" link back to Room Selection. */
  modifiable?: boolean;
  className?: string;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

/** Read-only reservation summary shared by Reservation Details and Payment. */
export function ReservationReview({ session, modifiable, className }: ReservationReviewProps) {
  const { pricing, stay } = session;

  return (
    <aside
      className={cn(
        "grid content-start gap-6 rounded-2xl border border-border/70 bg-card p-6 shadow-card",
        className,
      )}
    >
      <div>
        <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Your Reservation</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          {session.propertyName}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatStayDate(stay.checkIn)} – {formatStayDate(stay.checkOut)} · {session.nights}{" "}
          {session.nights === 1 ? "night" : "nights"}
        </p>
      </div>

      <div className="grid gap-2.5 border-y border-border py-5">
        <Row
          label="Guests"
          value={`${stay.adults} ${stay.adults === 1 ? "adult" : "adults"}${
            stay.children > 0
              ? `, ${stay.children} ${stay.children === 1 ? "child" : "children"}`
              : ""
          }`}
        />
        {session.roomLines.map((line) => (
          <Row
            key={line.roomId}
            label={`${line.quantity} × ${line.roomName}`}
            value={formatPrice(line.subtotal, pricing.currency)}
          />
        ))}
      </div>

      <div className="grid gap-2.5">
        <Row label="Subtotal" value={formatPrice(pricing.subtotal, pricing.currency)} />
        <Row label="Taxes & fees (18%)" value={formatPrice(pricing.taxes, pricing.currency)} />
        <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-border pt-4">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="text-2xl font-semibold tracking-tight text-nbc-royal">
            {formatPrice(pricing.total, pricing.currency)}
          </span>
        </div>
      </div>

      {modifiable ? (
        <Link
          to="/hotels/$hotelId/rooms"
          params={{ hotelId: session.propertyId }}
          search={session.stay}
          className="text-sm font-medium text-nbc-scarlet underline-offset-4 hover:underline"
        >
          Modify room selection
        </Link>
      ) : null}
    </aside>
  );
}
