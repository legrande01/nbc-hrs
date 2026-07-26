import { MapPin, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Hotel } from "@/lib/nbc-content";
import { cn } from "@/lib/utils";

interface HotelCardProps {
  hotel: Hotel;
  className?: string;
}

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

      <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-foreground">{hotel.name}</h3>
            <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{hotel.location}</span>
            </p>
          </div>
          <p className="flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-sm font-semibold text-secondary-foreground">
            <Star aria-hidden="true" className="size-3.5 fill-nbc-gold text-nbc-gold" />
            {hotel.rating.toFixed(1)}
            <span className="sr-only">out of 5, {hotel.reviewCount} reviews</span>
          </p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{hotel.description}</p>

        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-t border-border pt-5">
          <div className="min-w-0">
            <p className="nbc-eyebrow text-[0.625rem] text-muted-foreground">Price from</p>
            <p className="mt-1 truncate text-lg font-semibold text-foreground">
              {formatPrice(hotel.priceFrom, hotel.currency)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">/ night</span>
            </p>
          </div>
          <Button variant="default" className="shrink-0">
            Find Your Stay
          </Button>
        </div>
      </div>
    </article>
  );
}
