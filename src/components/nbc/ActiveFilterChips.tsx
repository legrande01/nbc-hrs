import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { amenityMeta } from "@/lib/nbc-amenities";
import { propertyTypeLabels } from "@/lib/nbc-discovery";
import { formatPrice, type DiscoverySearch } from "@/lib/nbc-discovery-filters";
import { priceBounds } from "@/lib/nbc-discovery";
import { cn } from "@/lib/utils";

export interface ActiveFilterChip {
  id: string;
  label: string;
  /** Patch applied to the discovery state when the chip is removed. */
  remove: Partial<DiscoverySearch>;
}

/** Builds the removable chip list from the current discovery state. */
export function buildActiveFilterChips(search: DiscoverySearch): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (search.minPrice !== priceBounds.min || search.maxPrice !== priceBounds.max) {
    chips.push({
      id: "price",
      label: `${formatPrice(search.minPrice)} – ${formatPrice(search.maxPrice)}`,
      remove: { minPrice: priceBounds.min, maxPrice: priceBounds.max },
    });
  }

  search.stars.forEach((star) => {
    chips.push({
      id: `star-${star}`,
      label: `${star} Star`,
      remove: { stars: search.stars.filter((value) => value !== star) },
    });
  });

  search.types.forEach((type) => {
    chips.push({
      id: `type-${type}`,
      label: propertyTypeLabels[type],
      remove: { types: search.types.filter((value) => value !== type) },
    });
  });

  search.amenities.forEach((amenity) => {
    chips.push({
      id: `amenity-${amenity}`,
      label: amenityMeta[amenity].label,
      remove: { amenities: search.amenities.filter((value) => value !== amenity) },
    });
  });

  search.cities.forEach((city) => {
    chips.push({
      id: `city-${city}`,
      label: city,
      remove: { cities: search.cities.filter((value) => value !== city) },
    });
  });

  return chips;
}

interface ActiveFilterChipsProps {
  chips: ActiveFilterChip[];
  onRemove: (chip: ActiveFilterChip) => void;
  onClearAll: () => void;
  className?: string;
}

/**
 * Removable summary of every filter currently narrowing the results.
 */
export function ActiveFilterChips({
  chips,
  onRemove,
  onClearAll,
  className,
}: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      <span className="nbc-eyebrow text-[0.625rem] text-muted-foreground">Filters</span>
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onRemove(chip)}
          className="flex min-w-0 items-center gap-1.5 rounded-full border border-nbc-royal/20 bg-nbc-royal/5 px-3 py-1.5 text-xs font-medium text-nbc-royal transition-colors hover:bg-nbc-royal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="truncate">{chip.label}</span>
          <X aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-8 text-xs text-nbc-scarlet hover:text-nbc-scarlet"
      >
        Clear All Filters
      </Button>
    </div>
  );
}
