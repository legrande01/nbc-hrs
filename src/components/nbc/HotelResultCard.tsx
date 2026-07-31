import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";

import { AvailabilityBadge } from "@/components/nbc/AvailabilityBadge";
import { FavouriteButton } from "@/components/nbc/FavouriteButton";
import { ImageCarousel } from "@/components/nbc/ImageCarousel";
import { OverflowChips, type Chip } from "@/components/nbc/OverflowChips";
import { Button } from "@/components/ui/button";
import { amenityMeta } from "@/lib/nbc-amenities";
import { formatPrice } from "@/lib/nbc-discovery-filters";
import type { DiscoveryHotel } from "@/lib/nbc-discovery";
import { hotelAvailability, hotelDistanceKm, hotelImages } from "@/lib/nbc-media";
import { getPropertyDetail } from "@/lib/nbc-property";
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
  const images = useMemo(() => hotelImages(hotel), [hotel]);
  const availability = hotelAvailability(hotel);
  const distance = hotelDistanceKm(hotel);
  const soldOut = availability === "sold-out";

  const categoryChips: Chip[] = useMemo(() => {
    const rooms = getPropertyDetail(hotel.id)?.rooms ?? [];
    return rooms.map((room) => ({ key: room.id, label: room.name }));
  }, [hotel.id]);

  const amenityChips: Chip[] = hotel.amenities.map((key) => ({
    key,
    label: amenityMeta[key].label,
    icon: amenityMeta[key].icon,
  }));

  return (
    <article
      className={cn(
        "grid overflow-hidden rounded-xl border border-border/70 bg-card shadow-card transition-shadow duration-500 ease-out hover:shadow-elevated md:grid-cols-[18rem_minmax(0,1fr)] lg:grid-cols-[22rem_minmax(0,1fr)]",
        className,
      )}
    >
      <ImageCarousel
        images={images}
        aspectClassName="aspect-4/3 md:aspect-auto md:h-full"
        className="md:h-full"
        overlay={
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
            <div className="pointer-events-auto">
              <FavouriteButton hotelId={hotel.id} hotelName={hotel.name} />
            </div>
            <span className="pointer-events-auto rounded-full bg-card/95 shadow-card">
              <AvailabilityBadge status={availability} />
            </span>
          </div>
        }
      />

      <div className="flex min-w-0 flex-col gap-5 p-6 lg:p-7">
        {/* 1. Identity and credibility */}
        <div className="grid min-w-0 gap-2.5">
          <p className="nbc-eyebrow w-fit rounded-full bg-secondary/60 px-2.5 py-1 text-[0.625rem] text-nbc-royal">
            {hotel.personality}
          </p>

          <h3 className="min-w-0 truncate text-2xl font-semibold tracking-tight text-foreground">{hotel.name}</h3>

          {/* Classification and location */}
          <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="flex shrink-0 items-center gap-1">
              <Star aria-hidden="true" className="size-3.5 fill-nbc-gold text-nbc-gold" />
              <span className="font-semibold text-foreground">{hotel.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({hotel.reviewCount} Reviews)</span>
              <span className="sr-only">out of 5</span>
            </span>
            <span aria-hidden="true">|</span>
            <span className="flex min-w-0 items-center gap-1 truncate">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.75} />
              {hotel.area}, {hotel.city}
            </span>
            <span aria-hidden="true">|</span>
            <span className="shrink-0">{distance} km from centre</span>
          </p>
        </div>

        {/* 4. Room categories */}
        {categoryChips.length > 0 && (
          <div className="grid gap-2">
            <p className="nbc-eyebrow text-[0.625rem] text-muted-foreground">Room Categories</p>
            <OverflowChips chips={categoryChips} limit={3} ariaLabel={`${hotel.name} room categories`} />
          </div>
        )}

        {/* 5. Amenities */}
        <div className="grid gap-2">
          <p className="nbc-eyebrow text-[0.625rem] text-muted-foreground">Amenities</p>
          <OverflowChips chips={amenityChips} limit={3} ariaLabel={`${hotel.name} amenities`} />
        </div>

        {/* 6. Price and actions */}
        <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <p className="nbc-eyebrow text-[0.625rem] text-muted-foreground">From</p>
            <p className="mt-1 truncate text-2xl font-semibold tracking-tight text-foreground">
              {formatPrice(hotel.priceFrom, hotel.currency)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">per night</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button variant="outline" asChild>
              <Link to="/hotels/$hotelId" params={{ hotelId: hotel.id }} search={stay ?? {}}>
                View Details
              </Link>
            </Button>
            {soldOut ? (
              <Button disabled title="No rooms available for these dates">
                Book Now
              </Button>
            ) : (
              <Button asChild>
                <Link to="/hotels/$hotelId" params={{ hotelId: hotel.id }} search={stay ?? {}} hash="rooms">
                  Book Now
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
