import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";

import { AvailabilityBadge } from "@/components/nbc/AvailabilityBadge";
import { FavouriteButton } from "@/components/nbc/FavouriteButton";
import { ImageCarousel } from "@/components/nbc/ImageCarousel";
import { Button } from "@/components/ui/button";
import type { DiscoveryHotel } from "@/lib/nbc-discovery";
import { formatPrice } from "@/lib/nbc-discovery-filters";
import { hotelAvailability, hotelDistanceKm, hotelImages } from "@/lib/nbc-media";
import { cn } from "@/lib/utils";

interface HotelTileCardProps {
  hotel: DiscoveryHotel;
  className?: string;
}

/**
 * Compact vertical variant of the hotel listing card used inside the
 * horizontal discovery carousels. Same primitives, same tokens.
 */
export function HotelTileCard({ hotel, className }: HotelTileCardProps) {
  const images = useMemo(() => hotelImages(hotel), [hotel]);
  const availability = hotelAvailability(hotel);
  const distance = hotelDistanceKm(hotel);
  const soldOut = availability === "sold-out";

  return (
    <article
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-card transition-shadow duration-500 ease-out hover:shadow-elevated",
        className,
      )}
    >
      <ImageCarousel
        images={images}
        aspectClassName="aspect-4/3"
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

      <div className="flex min-w-0 flex-1 flex-col gap-4 p-5">
        <div className="grid min-w-0 gap-2">
          <h3 className="min-w-0 truncate text-lg font-semibold tracking-tight text-foreground">
            {hotel.name}
          </h3>
          <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="flex shrink-0 items-center gap-1">
              <Star aria-hidden="true" className="size-3.5 fill-nbc-gold text-nbc-gold" />
              <span className="font-semibold text-foreground">{hotel.rating.toFixed(1)}</span>
              <span>({hotel.reviewCount})</span>
            </span>
            <span aria-hidden="true">|</span>
            <span className="flex min-w-0 items-center gap-1 truncate">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.75} />
              {hotel.area}, {hotel.city}
            </span>
            <span aria-hidden="true">|</span>
            <span className="shrink-0">{distance} km</span>
          </p>
        </div>

        <div className="mt-auto grid gap-3 border-t border-border pt-4">
          <div className="min-w-0">
            <p className="nbc-eyebrow text-[0.625rem] text-muted-foreground">From</p>
            <p className="mt-1 truncate text-xl font-semibold tracking-tight text-foreground">
              {formatPrice(hotel.priceFrom, hotel.currency)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/hotels/$hotelId" params={{ hotelId: hotel.id }} search={{}}>
                View Details
              </Link>
            </Button>
            {soldOut ? (
              <Button size="sm" disabled title="No rooms available">
                Book Now
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link
                  to="/hotels/$hotelId"
                  params={{ hotelId: hotel.id }}
                  search={{}}
                  hash="rooms"
                >
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
