import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { PaymentStatusBadge, ReservationStatusBadge } from "@/components/nbc/ReservationBadges";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney, type Reservation } from "@/lib/nbc-reservations";

/**
 * Summary card for a single reservation in the My Reservations list.
 * Mirrors the layout language of the hotel result cards.
 */
export function ReservationCard({ reservation }: { reservation: Reservation }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
      <div className="grid md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <div className="relative h-44 md:h-full">
          <img
            src={reservation.image}
            alt={reservation.hotelName}
            loading="lazy"
            className="size-full object-cover"
          />
          <ReservationStatusBadge
            status={reservation.status}
            className="absolute right-3 top-3 shadow-sm"
          />
        </div>

        <div className="grid gap-4 p-5 lg:p-6">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold tracking-tight text-foreground">
              {reservation.hotelName}
            </h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{reservation.reference}</span>
              <span aria-hidden="true">|</span>
              <span className="inline-flex items-center gap-1">
                <MapPin aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
                {reservation.destination}
              </span>
            </p>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Check-in</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {formatDate(reservation.checkIn)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Check-out</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {formatDate(reservation.checkOut)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Guests</dt>
              <dd className="mt-0.5 inline-flex items-center gap-1 font-medium text-foreground">
                <Users aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
                {reservation.guests} guest{reservation.guests === 1 ? "" : "s"}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Room category</dt>
              <dd className="mt-0.5 truncate font-medium text-foreground">
                {reservation.roomCategory}
              </dd>
            </div>
          </dl>

          <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="min-w-0">
              <PaymentStatusBadge status={reservation.paymentStatus} />
              <p className="mt-2 text-xs text-muted-foreground">Amount paid</p>
              <p className="text-xl font-semibold tracking-tight text-foreground">
                {formatMoney(reservation.amountPaid)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link
                  to="/account/reservations/$reference"
                  params={{ reference: reservation.reference }}
                >
                  View Reservation
                </Link>
              </Button>
            </div>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
            Booked on {formatDate(reservation.bookedOn)}
          </p>
        </div>
      </div>
    </article>
  );
}
