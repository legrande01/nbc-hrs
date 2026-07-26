import type { LucideIcon } from "lucide-react";
import {
  Binoculars,
  Car,
  CircleParking,
  Croissant,
  Dumbbell,
  Flower2,
  MapPin,
  Star,
  UtensilsCrossed,
  Waves,
  Wifi,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AmenityKey, Hotel } from "@/lib/nbc-content";
import { cn } from "@/lib/utils";

interface HotelCardProps {
  hotel: Hotel;
  className?: string;
}

const amenityMeta: Record<AmenityKey, { label: string; icon: LucideIcon }> = {
  wifi: { label: "Free Wi-Fi", icon: Wifi },
  breakfast: { label: "Breakfast Included", icon: Croissant },
  pool: { label: "Swimming Pool", icon: Waves },
  "ocean-view": { label: "Ocean View", icon: Waves },
  shuttle: { label: "Airport Shuttle", icon: Car },
  parking: { label: "Free Parking", icon: CircleParking },
  restaurant: { label: "Restaurant", icon: UtensilsCrossed },
  fitness: { label: "Fitness Centre", icon: Dumbbell },
  spa: { label: "Spa", icon: Flower2 },
  safari: { label: "Safari Desk", icon: Binoculars },
};

function formatPrice(amount: number, currency: string) {
  return `${currency} ${new Intl.NumberFormat("en-US").format(amount)}`;
}

/**
 * Reusable premium hotel card used across home, listings and future search results.
 */
export function HotelCard({ hotel, className }: HotelCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-card transition-shadow hover:shadow-elevated",
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <img
          src={hotel.image}
          alt={`${hotel.name} in ${hotel.location}`}
          width={1200}
          height={900}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-5 p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-foreground">{hotel.name}</h3>
            <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{hotel.location}</span>
            </p>
          </div>
          <p className="flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-sm font-semibold text-secondary-foreground">
            <Star aria-hidden="true" className="size-3.5 fill-nbc-gold text-nbc-gold" />
            {hotel.rating.toFixed(1)}
            <span className="sr-only">out of 5, {hotel.reviewCount} reviews</span>
          </p>
        </div>

        <ul className="flex flex-wrap gap-2" aria-label={`${hotel.name} amenities`}>
          {hotel.amenities.map((key) => {
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

        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-t border-border pt-5">
          <div className="min-w-0">
            <p className="nbc-eyebrow text-[0.625rem] text-muted-foreground">From</p>
            <p className="mt-1 truncate text-2xl font-semibold tracking-tight text-foreground">
              {formatPrice(hotel.priceFrom, hotel.currency)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">per night</p>
          </div>
          <Button variant="default" className="shrink-0">
            Find Your Stay
          </Button>
        </div>
      </div>
    </article>
  );
}
