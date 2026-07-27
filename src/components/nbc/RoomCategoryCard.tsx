import { BedDouble, Check, Croissant, Info, Maximize2, Minus, Plus, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { amenityMeta } from "@/lib/nbc-amenities";
import { formatPrice } from "@/lib/nbc-discovery-filters";
import {
  chargedNights,
  type OccupancyCheck,
  type RoomCategory,
} from "@/lib/nbc-room-selection";
import { cn } from "@/lib/utils";

interface RoomCategoryCardProps {
  room: RoomCategory;
  currency: string;
  nights: number;
  /** Availability is only exposed once the guest has supplied dates. */
  hasDates: boolean;
  occupancy: OccupancyCheck;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  className?: string;
}

function AvailabilityBadge({ room }: { room: RoomCategory }) {
  if (room.roomsLeft <= 2) {
    return (
      <span className="rounded-full bg-nbc-scarlet/10 px-3 py-1 text-xs font-semibold text-nbc-scarlet">
        Only {room.roomsLeft} room{room.roomsLeft === 1 ? "" : "s"} left
      </span>
    );
  }
  if (room.highDemand) {
    return (
      <span className="rounded-full bg-nbc-gold/20 px-3 py-1 text-xs font-semibold text-foreground">
        High demand
      </span>
    );
  }
  return (
    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-nbc-royal">
      Available
    </span>
  );
}

/** Comparison-focused room category card with occupancy validation and selection. */
export function RoomCategoryCard({
  room,
  currency,
  nights,
  hasDates,
  occupancy,
  quantity,
  onAdd,
  onRemove,
  className,
}: RoomCategoryCardProps) {
  const effectiveNights = Math.max(nights, 1);
  const billableNights = chargedNights(room, effectiveNights);
  const discountedRate = room.promotion?.percentOff
    ? Math.round(room.nightlyRate * (1 - room.promotion.percentOff / 100))
    : room.nightlyRate;
  const hasRateDiscount = discountedRate !== room.nightlyRate;
  const stayTotal = discountedRate * billableNights;

  return (
    <article
      className={cn(
        "group grid overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-all duration-500 ease-out hover:shadow-elevated lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]",
        !occupancy.fits && "opacity-95",
        className,
      )}
    >
      <div className="relative overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          width={1200}
          height={900}
          loading="lazy"
          className="aspect-4/3 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] lg:aspect-auto"
        />
        {room.promotion && (
          <span className="absolute left-4 top-4 rounded-full bg-nbc-scarlet px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-elevated">
            {room.promotion.label}
          </span>
        )}
      </div>

      <div className="grid content-start gap-6 p-6 lg:p-8">
        {/* Room information */}
        <div className="grid gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">{room.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Room category · physical room assigned at check-in
              </p>
            </div>
            {hasDates && <AvailabilityBadge room={room} />}
          </div>

          <ul className="grid gap-2.5 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex items-center gap-2">
              <Maximize2 aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
              {room.sizeSqm} sqm
            </li>
            <li className="flex items-center gap-2">
              <BedDouble aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
              {room.bedType}
            </li>
            <li className="flex items-center gap-2">
              <Users aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
              Max {room.maxAdults} adults
              {room.maxChildren > 0 ? ` · ${room.maxChildren} children` : ""}
            </li>
            <li className="flex items-center gap-2">
              <Croissant aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
              {room.breakfast}
            </li>
          </ul>
        </div>

        {/* Included benefits */}
        <div className="grid gap-3 border-t border-border/60 pt-5">
          <p className="nbc-eyebrow text-[0.5625rem] text-muted-foreground">Included Benefits</p>
          <ul className="flex flex-wrap gap-2" aria-label={`${room.name} amenities`}>
            {room.amenities.map((key) => {
              const { label, icon: Icon } = amenityMeta[key];
              return (
                <li
                  key={key}
                  className="flex min-w-0 items-center gap-1.5 rounded-full border border-border/70 bg-secondary/40 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  <Icon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{label}</span>
                </li>
              );
            })}
          </ul>
          <p className="flex items-start gap-2 text-sm text-nbc-emerald">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
            {room.cancellation}
          </p>
        </div>

        {/* Promotion */}
        {room.promotion && (
          <div className="grid gap-3 border-t border-border/60 pt-5">
            <p className="nbc-eyebrow text-[0.5625rem] text-muted-foreground">Promotion</p>
            <p className="flex items-start gap-2 rounded-xl bg-secondary/50 px-4 py-3 text-sm text-foreground">
              <Check
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-nbc-scarlet"
                strokeWidth={2}
              />
              <span>
                <span className="font-semibold">{room.promotion.label}:</span>{" "}
                {room.promotion.detail}
              </span>
            </p>
          </div>
        )}

        {!occupancy.fits && (
          <p
            role="note"
            className="flex items-start gap-2 rounded-xl border border-nbc-scarlet/30 bg-nbc-scarlet/5 px-4 py-3 text-sm text-nbc-scarlet"
          >
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
            {occupancy.reason}
          </p>
        )}

        {/* Pricing + primary action */}
        <div className="grid gap-4 rounded-xl bg-secondary/30 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">

          <div>
            <p className="nbc-eyebrow text-[0.625rem] text-muted-foreground">From</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {formatPrice(discountedRate, currency)}
              </span>
              {hasRateDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(room.nightlyRate, currency)}
                </span>
              )}
              <span className="text-sm text-muted-foreground">per night</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatPrice(stayTotal, currency)} for {billableNights}{" "}
              {billableNights === 1 ? "night" : "nights"}
              {billableNights < effectiveNights ? " (promotion applied)" : ""} · excludes taxes and fees
            </p>
          </div>

          {quantity > 0 ? (
            <div className="flex items-center gap-3 sm:justify-self-end">
              <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRemove}
                  aria-label={`Remove one ${room.name}`}
                >
                  <Minus aria-hidden="true" />
                </Button>
                <span className="min-w-8 text-center text-sm font-semibold text-foreground">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAdd}
                  disabled={!occupancy.fits}
                  aria-label={`Add one ${room.name}`}
                >
                  <Plus aria-hidden="true" />
                </Button>
              </div>
              <span className="text-sm font-medium text-nbc-emerald">Added</span>
            </div>
          ) : (
            <Button
              variant="scarlet"
              size="lg"
              onClick={onAdd}
              disabled={!occupancy.fits}
              className="sm:justify-self-end"
            >
              Book Now
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
