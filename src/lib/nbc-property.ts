import type { LucideIcon } from "lucide-react";
import {
  Baby,
  BedDouble,
  Ban,
  CalendarX2,
  CigaretteOff,
  Clock,
  Dog,
  LogOut,
} from "lucide-react";

import type { AmenityKey } from "@/lib/nbc-content";
import { discoveryHotels, type DiscoveryHotel } from "@/lib/nbc-discovery";

import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import roomFamily from "@/assets/room-family.jpg";
import propLobby from "@/assets/prop-lobby.jpg";
import propRestaurant from "@/assets/prop-restaurant.jpg";
import propFacilities from "@/assets/prop-facilities.jpg";

/**
 * Placeholder property-detail content.
 * Shapes mirror the future property API so presentation components stay
 * unchanged when live data is introduced.
 */

export type GalleryCategory =
  | "Exterior"
  | "Lobby"
  | "Rooms"
  | "Restaurant"
  | "Pool"
  | "Facilities";

export interface GalleryImage {
  id: string;
  category: GalleryCategory;
  src: string;
  alt: string;
}

export interface RoomTypePreview {
  id: string;
  name: string;
  image: string;
  occupancy: string;
  bedType: string;
  amenities: AmenityKey[];
  priceFrom: number;
}

export interface NearbyPlace {
  id: string;
  label: string;
  distance: string;
  kind: "Landmark" | "Attraction" | "Airport" | "Business District";
}

export interface PolicyItem {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
}

export interface GuestReview {
  id: string;
  guest: string;
  origin: string;
  stayedOn: string;
  rating: number;
  title: string;
  body: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PropertyDetail {
  hotel: DiscoveryHotel;
  /** Short positioning line, e.g. "Luxury beachfront escape". */
  positioning: string;
  overview: string[];
  highlights: string[];
  serviceAmenities: AmenityKey[];
  extraServices: string[];
  gallery: GalleryImage[];
  rooms: RoomTypePreview[];
  address: string;
  nearby: NearbyPlace[];
  reviews: GuestReview[];
  policies: PolicyItem[];
  faqs: FaqItem[];
}

const positioningByPersonality: Record<string, string> = {
  "Luxury Beach Escape": "Luxury beachfront escape",
  "Business Traveller's Choice": "Business-friendly city hotel",
  "Safari Gateway": "Safari gateway lodge",
  "Romantic Escape": "Boutique heritage experience",
  "Family Favourite": "Family resort",
  "Conference Friendly": "Conference and events hotel",
  "City Centre Stay": "Modern city centre stay",
};

const extraServicesByPersonality: Record<string, string[]> = {
  "Luxury Beach Escape": ["Room Service", "Laundry Service", "Concierge Desk"],
  "Business Traveller's Choice": ["Conference Facilities", "Room Service", "Laundry Service"],
  "Safari Gateway": ["Safari Desk", "Laundry Service", "Packed Breakfast"],
  "Romantic Escape": ["Room Service", "Private Dining", "Laundry Service"],
  "Family Favourite": ["Family Rooms", "Laundry Service", "Room Service"],
  "Conference Friendly": ["Conference Facilities", "Business Centre", "Laundry Service"],
  "City Centre Stay": ["Room Service", "Laundry Service", "Concierge Desk"],
};

function buildGallery(hotel: DiscoveryHotel): GalleryImage[] {
  return [
    {
      id: "exterior-1",
      category: "Exterior",
      src: hotel.image,
      alt: `Exterior of ${hotel.name}`,
    },
    { id: "lobby-1", category: "Lobby", src: propLobby, alt: `Lobby lounge at ${hotel.name}` },
    { id: "rooms-1", category: "Rooms", src: roomDeluxe, alt: `Deluxe room at ${hotel.name}` },
    { id: "rooms-2", category: "Rooms", src: roomSuite, alt: `Executive suite at ${hotel.name}` },
    { id: "rooms-3", category: "Rooms", src: roomFamily, alt: `Family room at ${hotel.name}` },
    {
      id: "restaurant-1",
      category: "Restaurant",
      src: propRestaurant,
      alt: `Restaurant at ${hotel.name}`,
    },
    {
      id: "pool-1",
      category: "Pool",
      src: hotel.image,
      alt: `Pool terrace at ${hotel.name}`,
    },
    {
      id: "facilities-1",
      category: "Facilities",
      src: propFacilities,
      alt: `Spa and fitness facilities at ${hotel.name}`,
    },
  ];
}

function buildRooms(hotel: DiscoveryHotel): RoomTypePreview[] {
  const base = hotel.priceFrom;
  return [
    {
      id: "deluxe",
      name: "Deluxe Room",
      image: roomDeluxe,
      occupancy: "2 Guests",
      bedType: "1 King Bed",
      amenities: hotel.amenities.slice(0, 3),
      priceFrom: base,
    },
    {
      id: "executive-suite",
      name: "Executive Suite",
      image: roomSuite,
      occupancy: "2 Guests · 1 Child",
      bedType: "1 King Bed · Living Area",
      amenities: hotel.amenities.slice(0, 4),
      priceFrom: Math.round((base * 1.45) / 1000) * 1000,
    },
    {
      id: "family-room",
      name: "Family Room",
      image: roomFamily,
      occupancy: "4 Guests",
      bedType: "2 Queen Beds",
      amenities: hotel.amenities.slice(1, 4),
      priceFrom: Math.round((base * 1.2) / 1000) * 1000,
    },
  ];
}

const nearbyByCity: Record<string, NearbyPlace[]> = {
  "Dar es Salaam": [
    { id: "n1", label: "Coco Beach", distance: "1.8 km", kind: "Attraction" },
    { id: "n2", label: "National Museum", distance: "5.2 km", kind: "Landmark" },
    { id: "n3", label: "Julius Nyerere International Airport", distance: "14 km", kind: "Airport" },
    { id: "n4", label: "Posta Central Business District", distance: "6.4 km", kind: "Business District" },
  ],
  Zanzibar: [
    { id: "n1", label: "Stone Town Old Fort", distance: "2.1 km", kind: "Landmark" },
    { id: "n2", label: "Spice Farms", distance: "12 km", kind: "Attraction" },
    { id: "n3", label: "Abeid Amani Karume Airport", distance: "9 km", kind: "Airport" },
    { id: "n4", label: "Forodhani Gardens", distance: "2.4 km", kind: "Attraction" },
  ],
  Arusha: [
    { id: "n1", label: "Arusha National Park Gate", distance: "18 km", kind: "Attraction" },
    { id: "n2", label: "Clock Tower", distance: "7.5 km", kind: "Landmark" },
    { id: "n3", label: "Kilimanjaro International Airport", distance: "42 km", kind: "Airport" },
    { id: "n4", label: "Arusha Business Centre", distance: "8 km", kind: "Business District" },
  ],
  Dodoma: [
    { id: "n1", label: "Bunge Parliament Building", distance: "3.6 km", kind: "Landmark" },
    { id: "n2", label: "Nyerere Square", distance: "2.9 km", kind: "Attraction" },
    { id: "n3", label: "Dodoma Airport", distance: "5 km", kind: "Airport" },
    { id: "n4", label: "Dodoma CBD", distance: "2.5 km", kind: "Business District" },
  ],
  Mwanza: [
    { id: "n1", label: "Bismarck Rock", distance: "2.2 km", kind: "Landmark" },
    { id: "n2", label: "Saanane Island National Park", distance: "4.1 km", kind: "Attraction" },
    { id: "n3", label: "Mwanza Airport", distance: "11 km", kind: "Airport" },
    { id: "n4", label: "Nyamagana Business District", distance: "3.3 km", kind: "Business District" },
  ],
};

const reviewSeed: Omit<GuestReview, "id" | "rating">[] = [
  {
    guest: "Amina H.",
    origin: "Dar es Salaam, Tanzania",
    stayedOn: "June 2026",
    title: "Faultless from arrival to check-out",
    body: "The team remembered our names from the first evening. Rooms were immaculate and the breakfast was genuinely excellent.",
  },
  {
    guest: "James O.",
    origin: "Nairobi, Kenya",
    stayedOn: "May 2026",
    title: "Ideal for a working week",
    body: "Fast Wi-Fi, quiet rooms and a very comfortable workspace. Everything I needed for four nights of meetings.",
  },
  {
    guest: "Claire M.",
    origin: "London, United Kingdom",
    stayedOn: "April 2026",
    title: "Beautiful setting, warm service",
    body: "Every space feels considered. We spent our evenings on the terrace and never wanted to leave.",
  },
];

function buildPolicies(hotel: DiscoveryHotel): PolicyItem[] {
  return [
    { id: "check-in", label: "Check-in", value: "From 14:00", icon: Clock },
    { id: "check-out", label: "Check-out", value: "Until 11:00", icon: LogOut },
    {
      id: "children",
      label: "Children",
      value: "Children of all ages are welcome. Under 6s stay free with existing bedding.",
      icon: Baby,
    },
    {
      id: "smoking",
      label: "Smoking",
      value: "Non-smoking property. Designated outdoor areas available.",
      icon: CigaretteOff,
    },
    {
      id: "pets",
      label: "Pets",
      value:
        hotel.propertyType === "lodge"
          ? "Assistance animals only."
          : "Pets are not permitted, except assistance animals.",
      icon: Dog,
    },
    {
      id: "cancellation",
      label: "Cancellation",
      value: "Free cancellation up to 48 hours before check-in on flexible rates.",
      icon: CalendarX2,
    },
    {
      id: "extra-beds",
      label: "Extra Beds",
      value: "One extra bed available per room on request, charged per night.",
      icon: BedDouble,
    },
    {
      id: "damage",
      label: "House Rules",
      value: "Quiet hours from 22:00. Valid ID required at check-in.",
      icon: Ban,
    },
  ];
}

function buildFaqs(hotel: DiscoveryHotel): FaqItem[] {
  return [
    {
      id: "arrival",
      question: "What time can I check in and check out?",
      answer:
        "Check-in opens at 14:00 and check-out is until 11:00. Early arrival and late departure can be arranged with the front desk, subject to availability.",
    },
    {
      id: "breakfast",
      question: "Is breakfast included in the rate?",
      answer: hotel.amenities.includes("breakfast")
        ? "Yes. A full breakfast is included with every room type shown on this property."
        : "Breakfast is available each morning and can be added to your stay at the room selection step.",
    },
    {
      id: "airport",
      question: "Do you offer airport transfers?",
      answer: hotel.amenities.includes("shuttle")
        ? "Yes. A scheduled airport shuttle operates daily and can be requested when you arrive at the property."
        : "The property can arrange a private transfer on request. Share your flight details with the front desk after booking.",
    },
    {
      id: "parking",
      question: "Is parking available on site?",
      answer: hotel.amenities.includes("parking")
        ? "Yes, complimentary secure parking is available for in-house guests."
        : "Secure parking is available nearby and can be arranged through the concierge.",
    },
    {
      id: "payment",
      question: "How do I pay for my stay?",
      answer:
        "All stays are settled through NBC's protected payment infrastructure. Card, mobile money and NBC account payments are supported.",
    },
    {
      id: "cancellation",
      question: "Can I cancel or change my booking?",
      answer:
        "Flexible rates can be cancelled free of charge up to 48 hours before check-in. Rate-specific rules are shown before you confirm.",
    },
  ];
}

export function getPropertyDetail(hotelId: string): PropertyDetail | undefined {
  const hotel = discoveryHotels.find((item) => item.id === hotelId);
  if (!hotel) return undefined;

  const positioning = positioningByPersonality[hotel.personality] ?? "Signature Tanzanian stay";

  return {
    hotel,
    positioning,
    overview: [
      `${hotel.name} sits in ${hotel.area}, ${hotel.city}, a short journey from everything that brings guests to the region. The property is built around calm, generous spaces and a standard of service that stays consistent from arrival to departure.`,
      `Interiors pair Tanzanian craft with quiet contemporary comfort. Whether you are here for a week of meetings or a long weekend away, the team shapes the stay around how you travel.`,
    ],
    highlights: [
      positioning,
      `${hotel.stars}-star classification`,
      `${hotel.rating.toFixed(1)} guest rating from ${hotel.reviewCount} reviews`,
      "Verified NBC Hospitality partner",
    ],
    serviceAmenities: hotel.amenities,
    extraServices: extraServicesByPersonality[hotel.personality] ?? ["Room Service", "Laundry Service"],
    gallery: buildGallery(hotel),
    rooms: buildRooms(hotel),
    address: `${hotel.area}, ${hotel.city}, Tanzania`,
    nearby: nearbyByCity[hotel.city] ?? [],
    reviews: reviewSeed.map((review, index) => ({
      ...review,
      id: `review-${index + 1}`,
      rating: Math.min(5, Math.max(4, Math.round((hotel.rating - index * 0.1) * 10) / 10)),
    })),
    policies: buildPolicies(hotel),
    faqs: buildFaqs(hotel),
  };
}
