import { MapPin, Share2, Star } from "lucide-react";

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

      <div className="relative mx-auto flex min-h-[32rem] max-w-7xl flex-col justify-end px-5 py-14 lg:min-h-[38rem] lg:px-8 lg:py-20">
        <p className="nbc-eyebrow w-fit rounded-full bg-primary-foreground/15 px-3 py-1 text-nbc-gold backdrop-blur-xs">
          {hotel.personality}
        </p>

        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-primary-foreground sm:text-5xl">
          {hotel.name}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-primary-foreground/85">
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

        <div className="mt-10 grid gap-6 border-t border-primary-foreground/20 pt-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <p className="nbc-eyebrow text-[0.625rem] text-primary-foreground/70">From</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-primary-foreground">
              {formatPrice(hotel.priceFrom, hotel.currency)}
            </p>
            <p className="mt-0.5 text-xs text-primary-foreground/70">per night</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="scarlet" size="xl" onClick={onViewRooms}>
              View Available Rooms
            </Button>
            <Button variant="outlineOnDark" size="xl" className="gap-2" onClick={onShare}>
              <Share2 aria-hidden="true" strokeWidth={1.75} />
              Share Property
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
