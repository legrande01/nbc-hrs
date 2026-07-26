import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { amenityMeta, filterableAmenities } from "@/lib/nbc-amenities";
import {
  discoveryCities,
  priceBounds,
  propertyTypeLabels,
  propertyTypeOptions,
  type PropertyType,
} from "@/lib/nbc-discovery";
import { formatPrice, type DiscoverySearch } from "@/lib/nbc-discovery-filters";
import type { AmenityKey } from "@/lib/nbc-content";
import { cn } from "@/lib/utils";

interface HotelFiltersProps {
  value: DiscoverySearch;
  onChange: (patch: Partial<DiscoverySearch>) => void;
  className?: string;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <h3 className="nbc-eyebrow text-[0.625rem] text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function CheckRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Checkbox id={id} checked={checked} onCheckedChange={(state) => onCheckedChange(state === true)} />
      <Label htmlFor={id} className="min-w-0 cursor-pointer truncate text-sm font-normal text-foreground">
        {label}
      </Label>
    </div>
  );
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item];
}

/**
 * Filter panel shared by the desktop sidebar and the mobile bottom sheet.
 * Every change is emitted immediately — results update without a Search press.
 */
export function HotelFilters({ value, onChange, className }: HotelFiltersProps) {
  return (
    <div className={cn("grid gap-8", className)}>
      <FilterGroup title="Price Range">
        <div className="grid gap-4">
          <Slider
            value={[value.minPrice, value.maxPrice]}
            min={priceBounds.min}
            max={priceBounds.max}
            step={priceBounds.step}
            minStepsBetweenThumbs={1}
            onValueChange={([min, max]) => onChange({ minPrice: min, maxPrice: max })}
            aria-label="Price range per night"
            className="pointer-events-auto"
          />
          <p className="text-sm text-muted-foreground">
            {formatPrice(value.minPrice)} – {formatPrice(value.maxPrice)}
            <span className="ml-1 text-xs">per night</span>
          </p>
        </div>
      </FilterGroup>

      <Separator />

      <FilterGroup title="Star Rating">
        <div className="grid gap-3">
          {[5, 4, 3].map((star) => (
            <CheckRow
              key={star}
              id={`star-${star}`}
              label={`${star} Star`}
              checked={value.stars.includes(star)}
              onCheckedChange={() => onChange({ stars: toggle(value.stars, star) })}
            />
          ))}
        </div>
      </FilterGroup>

      <Separator />

      <FilterGroup title="Property Type">
        <div className="grid gap-3">
          {propertyTypeOptions.map((type: PropertyType) => (
            <CheckRow
              key={type}
              id={`type-${type}`}
              label={propertyTypeLabels[type]}
              checked={value.types.includes(type)}
              onCheckedChange={() => onChange({ types: toggle(value.types, type) })}
            />
          ))}
        </div>
      </FilterGroup>

      <Separator />

      <FilterGroup title="Amenities">
        <div className="grid gap-3">
          {filterableAmenities.map((amenity: AmenityKey) => (
            <CheckRow
              key={amenity}
              id={`amenity-${amenity}`}
              label={amenityMeta[amenity].label}
              checked={value.amenities.includes(amenity)}
              onCheckedChange={() => onChange({ amenities: toggle(value.amenities, amenity) })}
            />
          ))}
        </div>
      </FilterGroup>

      <Separator />

      <FilterGroup title="Location">
        <div className="grid gap-3">
          {discoveryCities.map((city) => (
            <CheckRow
              key={city}
              id={`city-${city}`}
              label={city}
              checked={value.cities.includes(city)}
              onCheckedChange={() => onChange({ cities: toggle(value.cities, city) })}
            />
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}
