import { useCallback, useEffect, useState } from "react";

import { discoveryHotels, type DiscoveryHotel } from "@/lib/nbc-discovery";

/**
 * Favourite store — demo persistence for the Favourite module.
 *
 * Entries are namespaced by kind so future favourite types (destinations,
 * packages, experiences, collections) can reuse the same store without a
 * migration. Only "hotel" is implemented in this sprint.
 */
export type FavouriteKind = "hotel" | "destination" | "package" | "experience" | "collection";

export interface FavouriteEntry {
  id: string;
  kind: FavouriteKind;
  /** ISO timestamp used by the "Recently Saved" sort and the Date Saved label. */
  savedAt: string;
}

const STORAGE_KEY = "nbc-favourite-hotels";
const EVENT = "nbc-favourites-change";

/** Demo seed so a fresh account still shows a populated Favourite module. */
const seedFavourites: FavouriteEntry[] = [
  { id: "kizingo-beach", kind: "hotel", savedAt: "2026-07-28T09:15:00.000Z" },
  { id: "harbour-house", kind: "hotel", savedAt: "2026-07-21T18:40:00.000Z" },
  { id: "meru-highlands", kind: "hotel", savedAt: "2026-07-09T07:05:00.000Z" },
  { id: "nungwi-sands", kind: "hotel", savedAt: "2026-06-30T12:00:00.000Z" },
];

function normalise(raw: unknown): FavouriteEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item): FavouriteEntry[] => {
    // Legacy format: a bare array of hotel ids.
    if (typeof item === "string") {
      return [{ id: item, kind: "hotel", savedAt: new Date().toISOString() }];
    }
    if (item && typeof item === "object" && typeof (item as FavouriteEntry).id === "string") {
      const entry = item as FavouriteEntry;
      return [
        {
          id: entry.id,
          kind: entry.kind ?? "hotel",
          savedAt: entry.savedAt ?? new Date().toISOString(),
        },
      ];
    }
    return [];
  });
}

export function readFavourites(): FavouriteEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedFavourites));
      return seedFavourites;
    }
    return normalise(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeFavourites(entries: FavouriteEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* storage unavailable — in-session state still applies */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function isFavourite(id: string, kind: FavouriteKind = "hotel") {
  return readFavourites().some((entry) => entry.id === id && entry.kind === kind);
}

export function addFavourite(id: string, kind: FavouriteKind = "hotel") {
  const next = readFavourites().filter((entry) => !(entry.id === id && entry.kind === kind));
  next.push({ id, kind, savedAt: new Date().toISOString() });
  writeFavourites(next);
}

export function removeFavourite(id: string, kind: FavouriteKind = "hotel") {
  writeFavourites(readFavourites().filter((entry) => !(entry.id === id && entry.kind === kind)));
}

export function toggleFavourite(id: string, kind: FavouriteKind = "hotel"): boolean {
  const next = !isFavourite(id, kind);
  if (next) addFavourite(id, kind);
  else removeFavourite(id, kind);
  return next;
}

/** Subscribes a component to the favourite store (hydration-safe). */
export function useFavourites(kind: FavouriteKind = "hotel") {
  const [entries, setEntries] = useState<FavouriteEntry[]>([]);

  const sync = useCallback(() => {
    setEntries(readFavourites().filter((entry) => entry.kind === kind));
  }, [kind]);

  useEffect(() => {
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  return entries;
}

export function hotelById(id: string): DiscoveryHotel | undefined {
  return discoveryHotels.find((hotel) => hotel.id === id);
}

/** Favourite hotels resolved against the discovery inventory. */
export interface FavouriteHotel {
  hotel: DiscoveryHotel;
  savedAt: string;
}

export function resolveFavouriteHotels(entries: FavouriteEntry[]): FavouriteHotel[] {
  return entries.flatMap((entry) => {
    const hotel = hotelById(entry.id);
    return hotel ? [{ hotel, savedAt: entry.savedAt }] : [];
  });
}

export function formatSavedDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/* -------------------------------------------------------------------------- */
/* Demo discovery data for the Favourite module carousels                      */
/* -------------------------------------------------------------------------- */

export const recentlyViewedIds = [
  "oyster-bay-suites",
  "stone-town-house",
  "serengeti-view",
  "peninsula-tower",
  "capital-court",
  "paje-breeze",
];

export const recommendedIds = [
  "seacliff-residence",
  "victoria-shores",
  "kilimanjaro-gate",
  "dodoma-vineyard",
  "bagamoyo-lodge",
  "msasani-apartments",
];

export interface ExploreCollection {
  key: string;
  title: string;
  description: string;
  hotelIds: string[];
}

export const exploreCollections: ExploreCollection[] = [
  {
    key: "zanzibar",
    title: "Popular in Zanzibar",
    description: "Island stays guests return to season after season.",
    hotelIds: ["kizingo-beach", "nungwi-sands", "stone-town-house", "paje-breeze"],
  },
  {
    key: "luxury",
    title: "Luxury Escapes",
    description: "Five-star addresses with signature service.",
    hotelIds: ["harbour-house", "oyster-bay-suites", "seacliff-residence", "serengeti-view"],
  },
  {
    key: "weekend",
    title: "Weekend Getaways",
    description: "Short stays within easy reach of the city.",
    hotelIds: ["bagamoyo-lodge", "msasani-apartments", "capital-court", "peninsula-tower"],
  },
  {
    key: "new",
    title: "Recently Added",
    description: "Newly verified properties on the NBC network.",
    hotelIds: ["dodoma-vineyard", "lake-zone-suites", "rock-city-hotel", "kilimanjaro-gate"],
  },
  {
    key: "trending",
    title: "Trending Hotels",
    description: "Most viewed across Tanzania this week.",
    hotelIds: ["harbour-house", "victoria-shores", "meru-highlands", "nungwi-sands"],
  },
];

export function hotelsByIds(ids: string[]): DiscoveryHotel[] {
  return ids.flatMap((id) => {
    const hotel = hotelById(id);
    return hotel ? [hotel] : [];
  });
}

/** Demo summary counters for the Favourite page header. */
export const favouriteSummaryDemo = {
  recentlyViewed: recentlyViewedIds.length,
  upcomingTrips: 2,
};
