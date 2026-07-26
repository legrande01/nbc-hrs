import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GuestReview } from "@/lib/nbc-property";

interface ReviewCarouselProps {
  reviews: GuestReview[];
  rating: number;
  reviewCount: number;
  className?: string;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Single unified guest-review card: rating summary plus an auto-sliding
 * carousel that shows one review at a time at a constant height.
 */
export function ReviewCarousel({ reviews, rating, reviewCount, className }: ReviewCarouselProps) {
  const autoplay = useRef(
    Autoplay({ delay: 5500, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [autoplay.current]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    if (prefersReducedMotion()) autoplay.current.stop();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div
      className={cn(
        "grid overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]",
        className,
      )}
    >
      {/* Rating summary */}
      <div className="grid h-full content-start gap-3 border-b border-border/70 bg-secondary/30 p-7 lg:border-b-0 lg:border-r">
        <p className="text-5xl font-semibold tracking-tight text-foreground">{rating.toFixed(1)}</p>
        <p className="flex items-center gap-1" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={
                index < Math.round(rating)
                  ? "size-4 fill-nbc-gold text-nbc-gold"
                  : "size-4 text-muted-foreground/40"
              }
            />
          ))}
        </p>
        <p className="text-sm text-muted-foreground">
          Based on {reviewCount} verified guest reviews
        </p>
      </div>

      {/* Review carousel */}
      <div
        className="relative grid content-between gap-6 p-7"
        role="region"
        aria-roledescription="carousel"
        aria-label="Guest reviews"
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {reviews.map((review, index) => (
              <article
                key={review.id}
                className="grid min-w-0 shrink-0 grow-0 basis-full content-start gap-4"
                role="group"
                aria-roledescription="slide"
                aria-label={`Review ${index + 1} of ${reviews.length}`}
              >
                <Quote aria-hidden="true" className="size-6 text-nbc-scarlet" strokeWidth={1.5} />
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Star aria-hidden="true" className="size-3.5 fill-nbc-gold text-nbc-gold" />
                  {review.rating.toFixed(1)}
                </p>
                <h3 className="text-lg font-semibold leading-snug text-foreground">
                  {review.title}
                </h3>
                <p className="min-h-20 text-base leading-relaxed text-muted-foreground">
                  {review.body}
                </p>
                <p className="text-xs text-muted-foreground">
                  {review.guest} · {review.origin} · Stayed {review.stayedOn}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous review"
              onClick={scrollPrev}
            >
              <ChevronLeft className="size-4" strokeWidth={1.75} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next review"
              onClick={scrollNext}
            >
              <ChevronRight className="size-4" strokeWidth={1.75} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {reviews.map((review, index) => (
              <button
                key={review.id}
                type="button"
                aria-label={`Show review ${index + 1}`}
                aria-current={index === selected}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === selected
                    ? "w-6 bg-nbc-scarlet"
                    : "w-1.5 bg-border hover:bg-muted-foreground/50",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
