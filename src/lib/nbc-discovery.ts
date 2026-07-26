import type { AmenityKey } from "@/lib/nbc-content";

import destDar from "@/assets/dest-dar.jpg";
import destZanzibar from "@/assets/dest-zanzibar.jpg";
import destArusha from "@/assets/dest-arusha.jpg";
import destDodoma from "@/assets/dest-dodoma.jpg";
import destMwanza from "@/assets/dest-mwanza.jpg";
import hotel1 from "@/assets/hotel-1.jpg";
import hotel2 from "@/assets/hotel-2.jpg";
import hotel3 from "@/assets/hotel-3.jpg";

/**
 * Placeholder discovery inventory.
 * The shape mirrors the future search API contract so the presentation
 * components stay unchanged when live data is introduced.
 */

export type PropertyType = "hotel" | "resort" | "apartment" | "lodge" | "guest-house";

export const propertyTypeLabels: Record<PropertyType, string> = {
  hotel: "Hotel",
  resort: "Resort",
  apartment: "Apartment",
  lodge: "Lodge",
  "guest-house": "Guest House",
};

export const propertyTypeOptions = Object.keys(propertyTypeLabels) as PropertyType[];

export type SortKey = "recommended" | "price-asc" | "price-desc" | "rating" | "newest";

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price (Low → High)" },
  { value: "price-desc", label: "Price (High → Low)" },
  { value: "rating", label: "Guest Rating" },
  { value: "newest", label: "Newest" },
];

export interface DiscoveryHotel {
  id: string;
  name: string;
  /** City used by the location filter. */
  city: string;
  /** Area / neighbourhood shown on the card. */
  area: string;
  propertyType: PropertyType;
  /** Official star classification, 3–5. */
  stars: number;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  currency: string;
  /** Short hospitality positioning line, e.g. "Luxury Beach Escape". */
  personality: string;
  amenities: AmenityKey[];
  image: string;
  /** Recency ranking used by the "Newest" sort. */
  addedOn: string;
  /** Editorial ranking used by the "Recommended" sort. */
  recommendedRank: number;
}

export const discoveryCities = [
  "Dar es Salaam",
  "Zanzibar",
  "Arusha",
  "Dodoma",
  "Mwanza",
] as const;

export const discoveryHotels: DiscoveryHotel[] = [
  {
    id: "harbour-house",
    name: "The Harbour House",
    city: "Dar es Salaam",
    area: "Masaki",
    propertyType: "hotel",
    stars: 5,
    rating: 4.8,
    reviewCount: 412,
    priceFrom: 285000,
    currency: "TZS",
    personality: "Business Traveller's Choice",
    amenities: ["wifi", "breakfast", "parking", "fitness"],
    image: hotel1,
    addedOn: "2025-11-04",
    recommendedRank: 1,
  },
  {
    id: "kizingo-beach",
    name: "Kizingo Beach Residence",
    city: "Zanzibar",
    area: "Michamvi",
    propertyType: "resort",
    stars: 5,
    rating: 4.9,
    reviewCount: 268,
    priceFrom: 410000,
    currency: "TZS",
    personality: "Luxury Beach Escape",
    amenities: ["ocean-view", "pool", "breakfast", "spa"],
    image: hotel2,
    addedOn: "2026-01-18",
    recommendedRank: 2,
  },
  {
    id: "meru-highlands",
    name: "Meru Highlands Lodge",
    city: "Arusha",
    area: "Usa River",
    propertyType: "lodge",
    stars: 4,
    rating: 4.7,
    reviewCount: 193,
    priceFrom: 330000,
    currency: "TZS",
    personality: "Safari Gateway",
    amenities: ["safari", "restaurant", "wifi", "shuttle"],
    image: hotel3,
    addedOn: "2025-08-22",
    recommendedRank: 3,
  },
  {
    id: "oyster-bay-suites",
    name: "Oyster Bay Suites",
    city: "Dar es Salaam",
    area: "Oyster Bay",
    propertyType: "apartment",
    stars: 4,
    rating: 4.6,
    reviewCount: 341,
    priceFrom: 215000,
    currency: "TZS",
    personality: "City Centre Stay",
    amenities: ["wifi", "parking", "fitness", "restaurant"],
    image: destDar,
    addedOn: "2025-06-11",
    recommendedRank: 4,
  },
  {
    id: "stone-town-house",
    name: "Stone Town Heritage House",
    city: "Zanzibar",
    area: "Stone Town",
    propertyType: "guest-house",
    stars: 3,
    rating: 4.5,
    reviewCount: 158,
    priceFrom: 145000,
    currency: "TZS",
    personality: "Romantic Escape",
    amenities: ["breakfast", "wifi", "ocean-view"],
    image: destZanzibar,
    addedOn: "2025-03-02",
    recommendedRank: 5,
  },
  {
    id: "serengeti-view",
    name: "Serengeti View Lodge",
    city: "Arusha",
    area: "Ngaramtoni",
    propertyType: "lodge",
    stars: 5,
    rating: 4.8,
    reviewCount: 224,
    priceFrom: 470000,
    currency: "TZS",
    personality: "Safari Gateway",
    amenities: ["safari", "pool", "restaurant", "shuttle"],
    image: destArusha,
    addedOn: "2026-02-09",
    recommendedRank: 6,
  },
  {
    id: "capital-court",
    name: "Capital Court Dodoma",
    city: "Dodoma",
    area: "Central Business District",
    propertyType: "hotel",
    stars: 4,
    rating: 4.3,
    reviewCount: 129,
    priceFrom: 165000,
    currency: "TZS",
    personality: "Conference Friendly",
    amenities: ["wifi", "restaurant", "parking", "fitness"],
    image: destDodoma,
    addedOn: "2025-09-30",
    recommendedRank: 7,
  },
  {
    id: "victoria-shores",
    name: "Victoria Shores Resort",
    city: "Mwanza",
    area: "Capri Point",
    propertyType: "resort",
    stars: 4,
    rating: 4.6,
    reviewCount: 187,
    priceFrom: 255000,
    currency: "TZS",
    personality: "Family Favourite",
    amenities: ["pool", "breakfast", "restaurant", "parking"],
    image: destMwanza,
    addedOn: "2025-12-14",
    recommendedRank: 8,
  },
  {
    id: "peninsula-tower",
    name: "Peninsula Tower Hotel",
    city: "Dar es Salaam",
    area: "Upanga",
    propertyType: "hotel",
    stars: 4,
    rating: 4.4,
    reviewCount: 502,
    priceFrom: 198000,
    currency: "TZS",
    personality: "Business Traveller's Choice",
    amenities: ["wifi", "fitness", "shuttle", "restaurant"],
    image: hotel1,
    addedOn: "2025-05-19",
    recommendedRank: 9,
  },
  {
    id: "nungwi-sands",
    name: "Nungwi Sands Resort",
    city: "Zanzibar",
    area: "Nungwi",
    propertyType: "resort",
    stars: 5,
    rating: 4.9,
    reviewCount: 389,
    priceFrom: 520000,
    currency: "TZS",
    personality: "Luxury Beach Escape",
    amenities: ["ocean-view", "pool", "spa", "breakfast"],
    image: hotel2,
    addedOn: "2026-03-05",
    recommendedRank: 10,
  },
  {
    id: "kilimanjaro-gate",
    name: "Kilimanjaro Gate Lodge",
    city: "Arusha",
    area: "Moshi Road",
    propertyType: "lodge",
    stars: 3,
    rating: 4.2,
    reviewCount: 96,
    priceFrom: 132000,
    currency: "TZS",
    personality: "Safari Gateway",
    amenities: ["safari", "wifi", "breakfast"],
    image: hotel3,
    addedOn: "2025-02-08",
    recommendedRank: 11,
  },
  {
    id: "msasani-apartments",
    name: "Msasani Garden Apartments",
    city: "Dar es Salaam",
    area: "Msasani",
    propertyType: "apartment",
    stars: 3,
    rating: 4.1,
    reviewCount: 74,
    priceFrom: 118000,
    currency: "TZS",
    personality: "Family Favourite",
    amenities: ["wifi", "parking", "pool"],
    image: destDar,
    addedOn: "2025-01-21",
    recommendedRank: 12,
  },
  {
    id: "paje-breeze",
    name: "Paje Breeze Guest House",
    city: "Zanzibar",
    area: "Paje",
    propertyType: "guest-house",
    stars: 3,
    rating: 4.4,
    reviewCount: 142,
    priceFrom: 96000,
    currency: "TZS",
    personality: "Romantic Escape",
    amenities: ["ocean-view", "breakfast", "wifi"],
    image: destZanzibar,
    addedOn: "2025-07-07",
    recommendedRank: 13,
  },
  {
    id: "dodoma-vineyard",
    name: "Dodoma Vineyard Retreat",
    city: "Dodoma",
    area: "Hombolo Road",
    propertyType: "lodge",
    stars: 4,
    rating: 4.5,
    reviewCount: 88,
    priceFrom: 175000,
    currency: "TZS",
    personality: "Romantic Escape",
    amenities: ["restaurant", "pool", "wifi", "parking"],
    image: destDodoma,
    addedOn: "2026-04-12",
    recommendedRank: 14,
  },
  {
    id: "rock-city-hotel",
    name: "Rock City Hotel",
    city: "Mwanza",
    area: "Nyamagana",
    propertyType: "hotel",
    stars: 4,
    rating: 4.2,
    reviewCount: 211,
    priceFrom: 152000,
    currency: "TZS",
    personality: "Conference Friendly",
    amenities: ["wifi", "restaurant", "fitness", "parking"],
    image: destMwanza,
    addedOn: "2025-04-03",
    recommendedRank: 15,
  },
  {
    id: "seacliff-residence",
    name: "Seacliff Residence",
    city: "Dar es Salaam",
    area: "Kawe",
    propertyType: "resort",
    stars: 5,
    rating: 4.7,
    reviewCount: 356,
    priceFrom: 395000,
    currency: "TZS",
    personality: "Luxury Beach Escape",
    amenities: ["ocean-view", "spa", "pool", "restaurant"],
    image: hotel2,
    addedOn: "2025-10-27",
    recommendedRank: 16,
  },
  {
    id: "bagamoyo-lodge",
    name: "Bagamoyo Coast Lodge",
    city: "Dar es Salaam",
    area: "Bagamoyo Road",
    propertyType: "lodge",
    stars: 3,
    rating: 4.0,
    reviewCount: 63,
    priceFrom: 108000,
    currency: "TZS",
    personality: "Family Favourite",
    amenities: ["breakfast", "parking", "wifi"],
    image: hotel3,
    addedOn: "2024-12-15",
    recommendedRank: 17,
  },
  {
    id: "lake-zone-suites",
    name: "Lake Zone Executive Suites",
    city: "Mwanza",
    area: "Isamilo",
    propertyType: "apartment",
    stars: 4,
    rating: 4.3,
    reviewCount: 117,
    priceFrom: 138000,
    currency: "TZS",
    personality: "Business Traveller's Choice",
    amenities: ["wifi", "fitness", "parking", "shuttle"],
    image: hotel1,
    addedOn: "2026-05-20",
    recommendedRank: 18,
  },
];

export const priceBounds = { min: 90000, max: 550000, step: 10000 };
