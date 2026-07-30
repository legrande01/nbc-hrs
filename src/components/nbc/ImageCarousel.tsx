import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { CarouselImage } from "@/lib/nbc-media";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: CarouselImage[];
  /** Aspect utility applied to each slide, e.g. "aspect-4/3". */
  aspectClassName?: string;
  /** Enables click-to-zoom with drag-to-pan. */
  zoomable?: boolean;
  className?: string;
  /** Rendered above the imagery, e.g. a favourite button or promo tag. */
  overlay?: React.ReactNode;
}

/**
 * Manual-swipe image carousel shared by every NBC surface.
 * Deliberately has no autoplay — guests control the pace.
 */
export function ImageCarousel({
  images,
  aspectClassName = "aspect-4/3",
  zoomable = false,
  className,
  overlay,
}: ImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [zoom, setZoom] = useState<{ index: number; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoom(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  const toggleZoom = useCallback(
    (index: number, event: React.MouseEvent<HTMLElement>) => {
      if (!zoomable) return;
      if (zoom?.index === index) {
        setZoom(null);
        return;
      }
      const bounds = event.currentTarget.getBoundingClientRect();
      setZoom({
        index,
        x: ((event.clientX - bounds.left) / bounds.width) * 100,
        y: ((event.clientY - bounds.top) / bounds.height) * 100,
      });
    },
    [zoom, zoomable],
  );

  const trackPan = useCallback(
    (index: number, event: React.MouseEvent<HTMLElement>) => {
      if (!zoomable || zoom?.index !== index) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      setZoom({
        index,
        x: ((event.clientX - bounds.left) / bounds.width) * 100,
        y: ((event.clientY - bounds.top) / bounds.height) * 100,
      });
    },
    [zoom, zoomable],
  );

  if (images.length === 0) return null;

  return (
    <div className={cn("group/carousel relative isolate overflow-hidden", className)}>
      <Carousel setApi={setApi} opts={{ loop: true, watchDrag: !zoom }} className="size-full">
        <CarouselContent className="ml-0 size-full">
          {images.map((image, index) => (
            <CarouselItem key={`${image.src}-${index}`} className="pl-0">
              <div
                className={cn("relative size-full overflow-hidden", aspectClassName)}
                onClick={(event) => toggleZoom(index, event)}
                onMouseMove={(event) => trackPan(index, event)}
                onMouseLeave={() => zoom?.index === index && setZoom(null)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  width={1200}
                  height={900}
                  loading={index === 0 ? "eager" : "lazy"}
                  draggable={false}
                  className={cn(
                    "size-full select-none object-cover transition-transform duration-300 ease-out",
                    zoomable && "cursor-zoom-in",
                    zoom?.index === index && "scale-[2.1] cursor-zoom-out",
                  )}
                  style={
                    zoom?.index === index
                      ? { transformOrigin: `${zoom.x}% ${zoom.y}%` }
                      : undefined
                  }
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {overlay}

      {zoomable && (
        <span className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-nbc-royal/70 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wider text-primary-foreground backdrop-blur-xs">
          <ZoomIn aria-hidden="true" className="size-3" strokeWidth={2} />
          {zoom ? "Click to exit" : "Click to zoom"}
        </span>
      )}

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => api?.scrollPrev()}
            className="absolute left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-card transition-opacity focus-visible:opacity-100 group-hover/carousel:opacity-100 max-md:opacity-100"
          >
            <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => api?.scrollNext()}
            className="absolute right-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-card transition-opacity focus-visible:opacity-100 group-hover/carousel:opacity-100 max-md:opacity-100"
          >
            <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
          </button>

          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
            {images.map((image, index) => (
              <span
                key={`dot-${image.src}-${index}`}
                className={cn(
                  "size-1.5 rounded-full transition-all duration-300",
                  index === current ? "w-4 bg-primary-foreground" : "bg-primary-foreground/50",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
