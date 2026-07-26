import { ArrowUpRight } from "lucide-react";
import type { Destination } from "@/lib/nbc-content";
import { cn } from "@/lib/utils";

interface DestinationCardProps {
  destination: Destination;
  className?: string;
}

/**
 * Reusable destination card. Photography led, minimal overlay copy.
 */
export function DestinationCard({ destination, className }: DestinationCardProps) {
  return (
    <article
      className={cn(
        "group relative isolate flex min-h-80 overflow-hidden rounded-xl bg-nbc-royal-deep shadow-card transition-shadow hover:shadow-elevated",
        className,
      )}
    >
      <img
        src={destination.image}
        alt={`${destination.name}, ${destination.region}`}
        width={900}
        height={1200}
        loading="lazy"
        className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div aria-hidden="true" className="nbc-card-veil absolute inset-0" />

      <div className="relative mt-auto flex w-full min-w-0 items-end justify-between gap-4 p-7">
        <div className="min-w-0">
          <p className="nbc-eyebrow text-[0.625rem] text-nbc-gold">{destination.region}</p>
          <h3 className="mt-2.5 truncate text-2xl font-semibold tracking-tight text-primary-foreground">
            {destination.name}
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-primary-foreground/85">
            {destination.tagline}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-primary-foreground/60">
            {destination.propertyCount} verified stays
          </p>
        </div>
        <button
          type="button"
          aria-label={`Explore ${destination.name}`}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-background/15 text-primary-foreground backdrop-blur transition-colors group-hover:bg-nbc-scarlet"
        >
          <ArrowUpRight className="size-4" />
        </button>
      </div>
    </article>
  );
}
