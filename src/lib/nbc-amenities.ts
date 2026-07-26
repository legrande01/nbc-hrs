import type { LucideIcon } from "lucide-react";
import {
  Binoculars,
  Car,
  CircleParking,
  Croissant,
  Dumbbell,
  Flower2,
  UtensilsCrossed,
  Waves,
  Wifi,
} from "lucide-react";

import type { AmenityKey } from "@/lib/nbc-content";

/**
 * Single source of truth for amenity presentation across the platform.
 */
export const amenityMeta: Record<AmenityKey, { label: string; icon: LucideIcon }> = {
  wifi: { label: "Free Wi-Fi", icon: Wifi },
  breakfast: { label: "Breakfast Included", icon: Croissant },
  pool: { label: "Swimming Pool", icon: Waves },
  "ocean-view": { label: "Ocean View", icon: Waves },
  shuttle: { label: "Airport Shuttle", icon: Car },
  parking: { label: "Free Parking", icon: CircleParking },
  restaurant: { label: "Restaurant", icon: UtensilsCrossed },
  fitness: { label: "Fitness Centre", icon: Dumbbell },
  spa: { label: "Spa", icon: Flower2 },
  safari: { label: "Safari Desk", icon: Binoculars },
};

/** Amenities offered as filters on the Hotel Discovery experience. */
export const filterableAmenities: AmenityKey[] = [
  "wifi",
  "breakfast",
  "pool",
  "restaurant",
  "fitness",
  "shuttle",
  "parking",
  "spa",
];
