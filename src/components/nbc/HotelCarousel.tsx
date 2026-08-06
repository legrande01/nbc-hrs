import type { ReactNode } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { HotelTileCard } from "@/components/nbc/HotelTileCard";
import type { DiscoveryHotel } from "@/lib/nbc-discovery";

interface HotelCarouselProps {
  title: string;
  description?: string;
  hotels: DiscoveryHotel[];
  action?: ReactNode;
}

/**
 * Swipeable horizontal rail of hotel tiles, reused by every discovery
 * section on the Favourite page.
 */
export function HotelCarousel({ title, description, hotels, action }: HotelCarouselProps) {
  if (hotels.length === 0) return null;

  return (
    <section className="grid gap-4">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <Carousel opts={{ align: "start", dragFree: true }} className="min-w-0">
        <CarouselContent className="-ml-4">
          {hotels.map((hotel) => (
            <CarouselItem
              key={hotel.id}
              className="basis-[85%] pl-4 sm:basis-1/2 xl:basis-1/3 2xl:basis-1/4"
            >
              <HotelTileCard hotel={hotel} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden lg:flex" />
        <CarouselNext className="hidden lg:flex" />
      </Carousel>
    </section>
  );
}
