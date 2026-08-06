import { Download, MapPin, Phone, Receipt, Star } from "lucide-react";

import { AccountCard } from "@/components/nbc/AccountLayout";
import { PaymentStatusBadge, ReservationStatusBadge } from "@/components/nbc/ReservationBadges";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { discoveryHotels } from "@/lib/nbc-discovery";
import {
  formatDate,
  formatMoney,
  nightsBetween,
  type Reservation,
} from "@/lib/nbc-reservations";

function Row({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

function SectionGroup({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-2.5">{children}</div>;
}

/**
 * Unified "digital reservation pass" summarising stay, room and payment.
 * Presentation only — all data comes from the reservation record.
 */
export function StaySummary({
  reservation,
  onDownloadConfirmation,
  onDownloadReceipt,
}: {
  reservation: Reservation;
  onDownloadConfirmation: () => void;
  onDownloadReceipt: () => void;
}) {
  const hotel = discoveryHotels.find((item) => item.id === reservation.hotelId);
  const nights = nightsBetween(reservation.checkIn, reservation.checkOut);
  const balance = Math.max(0, reservation.total - reservation.amountPaid);

  return (
    <AccountCard className="overflow-hidden p-0">
      <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        {/* Left — property identity */}
        <div className="relative">
          <img
            src={reservation.image}
            alt={reservation.hotelName}
            loading="lazy"
            className="h-56 w-full object-cover sm:h-64 lg:h-full lg:min-h-[19rem]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-nbc-royal/90 via-nbc-royal/60 to-transparent p-5">
            <ReservationStatusBadge status={reservation.status} className="bg-background/90" />
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-primary-foreground">
              {reservation.hotelName}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-primary-foreground/85">
              {hotel ? (
                <span className="inline-flex items-center gap-1">
                  <Star
                    aria-hidden="true"
                    className="size-3.5 fill-nbc-gold text-nbc-gold"
                    strokeWidth={1.75}
                  />
                  {hotel.rating.toFixed(1)} ({hotel.reviewCount} reviews)
                </span>
              ) : null}
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
                {reservation.destination}
              </span>
            </p>
            <p className="mt-1 text-xs text-primary-foreground/75">{reservation.address}</p>
          </div>
        </div>

        {/* Center — stay */}
        <div className="grid content-start gap-3 border-border/70 p-6 sm:p-7 lg:border-l">
          <ColumnHeading>Your stay</ColumnHeading>
          <dl className="grid gap-3">
            <Row label="Check-in" value={formatDate(reservation.checkIn)} />
            <Row label="Check-out" value={formatDate(reservation.checkOut)} />
            <Row label="Length of stay" value={`${nights} night${nights === 1 ? "" : "s"}`} />
            <Row
              label="Guests"
              value={`${reservation.guests} guest${reservation.guests === 1 ? "" : "s"} · ${reservation.rooms} room${reservation.rooms === 1 ? "" : "s"}`}
            />
            <Row label="Room category" value={reservation.roomCategory} />
            {reservation.roomNumber ? (
              <Row label="Assigned room" value={reservation.roomNumber} />
            ) : null}
          </dl>
        </div>

        {/* Right — payment */}
        <div className="grid content-start gap-3 border-t border-border/70 p-6 sm:p-7 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between gap-3">
            <ColumnHeading>Payment</ColumnHeading>
            <PaymentStatusBadge status={reservation.paymentStatus} />
          </div>
          <dl className="grid gap-3">
            <Row label="Reservation total" value={formatMoney(reservation.total)} />
            <Row label="Amount paid" value={formatMoney(reservation.amountPaid)} />
            <Row
              label="Remaining balance"
              value={balance > 0 ? formatMoney(balance) : "Settled"}
            />
            <Row label="Payment method" value={reservation.paymentMethod} />
            <Row label="Booking reference" value={reservation.reference} />
            <Row label="Transaction reference" value={reservation.transactionReference} />
          </dl>
        </div>
      </div>

      {/* Action bar */}
      <div className="grid gap-3 border-t border-border/70 bg-secondary/30 p-5 sm:grid-flow-col sm:auto-cols-max sm:justify-start">
        <Button variant="outline" className="w-full sm:w-auto" onClick={onDownloadConfirmation}>
          <Download aria-hidden="true" className="size-4" strokeWidth={1.75} />
          Download Confirmation
        </Button>
        <Button variant="outline" className="w-full sm:w-auto" onClick={onDownloadReceipt}>
          <Receipt aria-hidden="true" className="size-4" strokeWidth={1.75} />
          Download Receipt
        </Button>
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <a href={`tel:${reservation.contact.reception}`}>
            <Phone aria-hidden="true" className="size-4" strokeWidth={1.75} />
            Contact Hotel
          </a>
        </Button>
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(reservation.mapsQuery)}`}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin aria-hidden="true" className="size-4" strokeWidth={1.75} />
            Get Directions
          </a>
        </Button>
      </div>
    </AccountCard>
  );
}
