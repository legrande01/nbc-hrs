import { Compass, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyResultsProps {
  onModifySearch: () => void;
  onClearFilters: () => void;
  onExplore: (destination: string) => void;
  destinations: readonly string[];
  className?: string;
}

/**
 * Premium hospitality empty state — always offers a way forward.
 */
export function EmptyResults({
  onModifySearch,
  onClearFilters,
  onExplore,
  destinations,
  className,
}: EmptyResultsProps) {
  return (
    <div
      className={cn(
        "grid gap-8 rounded-xl border border-border/70 bg-card p-10 text-center shadow-card lg:p-16",
        className,
      )}
    >
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-secondary">
        <SearchX aria-hidden="true" className="size-6 text-nbc-royal" strokeWidth={1.5} />
      </div>

      <div className="mx-auto max-w-xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          We couldn't find any places to stay matching your search.
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Try widening your dates, easing a filter, or letting us suggest somewhere else in
          Tanzania worth waking up in.
        </p>
      </div>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button variant="default" size="lg" onClick={onModifySearch}>
          Modify Search
        </Button>
        <Button variant="outline" size="lg" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>

      <div className="grid gap-4 border-t border-border pt-8">
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Compass aria-hidden="true" className="size-4 text-nbc-gold" strokeWidth={1.75} />
          Explore other destinations
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {destinations.map((destination) => (
            <button
              key={destination}
              type="button"
              onClick={() => onExplore(destination)}
              className="rounded-full border border-border/70 bg-secondary/40 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-nbc-royal/30 hover:bg-nbc-royal/5 hover:text-nbc-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {destination}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
