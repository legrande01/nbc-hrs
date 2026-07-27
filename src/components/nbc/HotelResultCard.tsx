import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { amenityMeta } from "@/lib/nbc-amenities";
import { formatPrice } from "@/lib/nbc-discovery-filters";
import type { DiscoveryHotel } from "@/lib/nbc-discovery";
import { propertyTypeLabels } from "@/lib/nbc-discovery";
import { cn } from "@/lib/utils";

interface HotelResultCardProps {
  hotel: DiscoveryHotel;
  /** Stay context carried forward into Hotel Details so the CTA can skip the modal. */
  stay?: { checkIn: string; checkOut: string; adults: number; children: number; rooms: number };
  className?: string;
}

/**
 * Standard horizontal search-result card used across the platform.
 * Optimised for side-by-side comparison rather than storytelling.
 */
export function HotelResultCard({ hotel, stay, className }: HotelResultCardProps) {

  return (
    <article
      className={cn(
        "group grid overflow-hidden rounded-xl border border-border/70 bg-card shadow-card transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-elevated md:grid-cols-[18rem_minmax(0,1fr)] lg:grid-cols-[22rem_minmax(0,1fr)]",
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden md:aspect-auto md:h-full">
        <img
          src={hotel.image}
          alt={`${hotel.name} in ${hotel.area}, ${hotel.city}`}
          width={1200}
          height={900}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-6 p-6 lg:p-7">
        <div className="grid min-w-0 gap-2.5">
          <p className="nbc-eyebrow w-fit rounded-full bg-secondary/60 px-2.5 py-1 text-[0.625rem] text-nbc-royal">
            {hotel.personality}
          </p>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <h3 className="min-w-0 truncate text-2xl font-semibold tracking-tight text-foreground">
              {hotel.name}
            </h3>
            <p className="flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
              <Star aria-hidden="true" className="size-3.5 fill-nbc-gold text-nbc-gold" />
              {hotel.rating.toFixed(1)}
              <span aria-hidden="true" className="text-muted-foreground">
                ·
              </span>
              <span className="font-medium text-muted-foreground">
                {hotel.reviewCount} Reviews
              </span>
              <span className="sr-only">out of 5</span>
            </p>
          </div>

          <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span
              className="flex shrink-0 items-center gap-0.5"
              aria-label={`${hotel.stars} star property`}
            >
              {Array.from({ length: hotel.stars }).map((_, index) => (
                <Star
                  key={index}
                  aria-hidden="true"
                  className="size-3.5 fill-nbc-gold text-nbc-gold"
                />
              ))}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">
              {hotel.area}, {hotel.city}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{propertyTypeLabels[hotel.propertyType]}</span>
          </p>
        </div>

        <ul className="flex flex-wrap gap-2" aria-label={`${hotel.name} amenities`}>
          {hotel.amenities.slice(0, 4).map((key) => {
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

        <div className="mt-auto grid gap-4 border-t border-border pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <p className="nbc-eyebrow text-[0.625rem] text-muted-foreground">From</p>
            <p className="mt-1 truncate text-2xl font-semibold tracking-tight text-foreground">
              {formatPrice(hotel.priceFrom, hotel.currency)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">per night</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button variant="default" asChild>
              <Link to="/hotels/$hotelId" params={{ hotelId: hotel.id }}>
                View Details
              </Link>
            </Button>
            <Button variant="outline">Find Your Stay</Button>
          </div>
        </div>
      </div>
    </article>
  );
}
