import { MapPin, Share2, Star } from "lucide-react";

import { FavouriteButton } from "@/components/nbc/FavouriteButton";
import { Button } from "@/components/ui/button";

import { formatPrice } from "@/lib/nbc-discovery-filters";
import { propertyTypeLabels, type DiscoveryHotel } from "@/lib/nbc-discovery";
import { cn } from "@/lib/utils";

interface PropertyHeroProps {
  hotel: DiscoveryHotel;
  onViewRooms: () => void;
  onShare: () => void;
  className?: string;
}

/** Immersive property header: identity, credibility and the primary CTA. */
export function PropertyHero({ hotel, onViewRooms, onShare, className }: PropertyHeroProps) {
  return (
    <section className={cn("relative isolate overflow-hidden", className)}>
      <img
        src={hotel.image}
        alt={`${hotel.name} in ${hotel.area}, ${hotel.city}`}
        width={1600}
        height={900}
        className="absolute inset-0 size-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 nbc-veil" />

      <div className="relative mx-auto flex min-h-[16rem] max-w-7xl flex-col justify-end px-5 py-7 lg:min-h-[19rem] lg:px-8 lg:py-10">
        <div className="flex items-start justify-between gap-4">
          <p className="nbc-eyebrow w-fit rounded-full bg-primary-foreground/15 px-3 py-1 text-nbc-gold backdrop-blur-xs">
            {hotel.personality}
          </p>
          <FavouriteButton hotelId={hotel.id} hotelName={hotel.name} tone="onSurface" />
        </div>

        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-primary-foreground sm:text-4xl">
          {hotel.name}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-primary-foreground/85">
          <span className="flex items-center gap-1" aria-label={`${hotel.stars} star property`}>
            {Array.from({ length: hotel.stars }).map((_, index) => (
              <Star key={index} aria-hidden="true" className="size-4 fill-nbc-gold text-nbc-gold" />
            ))}
          </span>
          <span className="flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 font-semibold text-primary-foreground backdrop-blur-xs">
            <Star aria-hidden="true" className="size-3.5 fill-nbc-gold text-nbc-gold" />
            {hotel.rating.toFixed(1)}
            <span aria-hidden="true" className="opacity-60">
              ·
            </span>
            <span className="font-medium opacity-85">{hotel.reviewCount} Reviews</span>
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin aria-hidden="true" className="size-4" strokeWidth={1.75} />
            {hotel.area}, {hotel.city}
          </span>
          <span aria-hidden="true" className="opacity-50">
            ·
          </span>
          <span>{propertyTypeLabels[hotel.propertyType]}</span>
        </div>

        <div className="mt-5 grid gap-4 border-t border-primary-foreground/20 pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <p className="nbc-eyebrow text-[0.625rem] text-primary-foreground/70">From</p>
            <p className="mt-0.5 text-2xl font-semibold tracking-tight text-primary-foreground">
              {formatPrice(hotel.priceFrom, hotel.currency)}
              <span className="ml-2 text-xs font-medium text-primary-foreground/70">per night</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="scarlet" size="lg" onClick={onViewRooms}>
              Book Now
            </Button>
            <Button variant="outlineOnDark" size="lg" className="gap-2" onClick={onShare}>
              <Share2 aria-hidden="true" strokeWidth={1.75} />
              Share Property
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
