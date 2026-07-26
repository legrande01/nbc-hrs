import type { AmenityKey } from "@/lib/nbc-content";
import {
  discoveryHotels,
  priceBounds,
  propertyTypeOptions,
  type DiscoveryHotel,
  type PropertyType,
  type SortKey,
} from "@/lib/nbc-discovery";

/** Fully-resolved discovery URL state. */
export interface DiscoverySearch {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  minPrice: number;
  maxPrice: number;
  stars: number[];
  types: PropertyType[];
  amenities: AmenityKey[];
  cities: string[];
  sort: SortKey;
  page: number;
}

const sortKeys: SortKey[] = ["recommended", "price-asc", "price-desc", "rating", "newest"];
const amenityKeys: AmenityKey[] = [
  "wifi",
  "breakfast",
  "pool",
  "ocean-view",
  "shuttle",
  "parking",
  "restaurant",
  "fitness",
  "spa",
  "safari",
];

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.length > 0) return value.split(",");
  return [];
}

/** Parses raw URL search into a typed, always-complete discovery state. */
export function parseDiscoverySearch(search: Record<string, unknown>): DiscoverySearch {
  return {
    destination: toString(search.destination),
    checkIn: toString(search.checkIn),
    checkOut: toString(search.checkOut),
    guests: toNumber(search.guests, 2),
    rooms: toNumber(search.rooms, 1),
    minPrice: toNumber(search.minPrice, priceBounds.min),
    maxPrice: toNumber(search.maxPrice, priceBounds.max),
    stars: toList(search.stars)
      .map((value) => Number(value))
      .filter((value) => value >= 3 && value <= 5),
    types: toList(search.types).filter((value): value is PropertyType =>
      (propertyTypeOptions as string[]).includes(value),
    ),
    amenities: toList(search.amenities).filter((value): value is AmenityKey =>
      (amenityKeys as string[]).includes(value),
    ),
    cities: toList(search.cities),
    sort: sortKeys.includes(search.sort as SortKey) ? (search.sort as SortKey) : "recommended",
    page: Math.max(1, toNumber(search.page, 1)),
  };
}

export const emptyFilters = {
  minPrice: priceBounds.min,
  maxPrice: priceBounds.max,
  stars: [] as number[],
  types: [] as PropertyType[],
  amenities: [] as AmenityKey[],
  cities: [] as string[],
};

export function hasActiveFilters(search: DiscoverySearch): boolean {
  return (
    search.minPrice !== priceBounds.min ||
    search.maxPrice !== priceBounds.max ||
    search.stars.length > 0 ||
    search.types.length > 0 ||
    search.amenities.length > 0 ||
    search.cities.length > 0
  );
}

/** Applies destination, filters and sorting to the placeholder inventory. */
export function selectHotels(search: DiscoverySearch): DiscoveryHotel[] {
  const destination = search.destination.trim().toLowerCase();

  const results = discoveryHotels.filter((hotel) => {
    if (destination) {
      const haystack = `${hotel.name} ${hotel.city} ${hotel.area}`.toLowerCase();
      if (!haystack.includes(destination)) return false;
    }
    if (hotel.priceFrom < search.minPrice || hotel.priceFrom > search.maxPrice) return false;
    if (search.stars.length > 0 && !search.stars.includes(hotel.stars)) return false;
    if (search.types.length > 0 && !search.types.includes(hotel.propertyType)) return false;
    if (search.cities.length > 0 && !search.cities.includes(hotel.city)) return false;
    if (
      search.amenities.length > 0 &&
      !search.amenities.every((amenity) => hotel.amenities.includes(amenity))
    ) {
      return false;
    }
    return true;
  });

  const sorted = [...results];
  switch (search.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.priceFrom - b.priceFrom);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.priceFrom - a.priceFrom);
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      sorted.sort((a, b) => b.addedOn.localeCompare(a.addedOn));
      break;
    default:
      sorted.sort((a, b) => a.recommendedRank - b.recommendedRank);
  }

  return sorted;
}

export function formatPrice(amount: number, currency = "TZS") {
  return `${currency} ${new Intl.NumberFormat("en-US").format(amount)}`;
}
