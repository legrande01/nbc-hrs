import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Gem,
  HandHeart,
  Landmark,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import destDar from "@/assets/dest-dar.jpg";
import destZanzibar from "@/assets/dest-zanzibar.jpg";
import destArusha from "@/assets/dest-arusha.jpg";
import destDodoma from "@/assets/dest-dodoma.jpg";
import destMwanza from "@/assets/dest-mwanza.jpg";
import hotel1 from "@/assets/hotel-1.jpg";
import hotel2 from "@/assets/hotel-2.jpg";
import hotel3 from "@/assets/hotel-3.jpg";

/**
 * Placeholder content for the Home Experience.
 * Shapes mirror the future API contracts so components stay unchanged
 * when live data is introduced.
 */

export interface NavItem {
  label: string;
  /** Route path once the module exists; undefined means "not yet released". */
  to?: "/" | "/hotels";
}

export const navigationItems: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Destinations" },
  { label: "Hotels", to: "/hotels" },
  { label: "Offers" },
  { label: "For Hotels" },
  { label: "Support" },
];

export const languages = ["ENG", "SWA"] as const;

export interface Destination {
  id: string;
  name: string;
  region: string;
  propertyCount: number;
  image: string;
  blurb: string;
  /** Short inspirational line shown on the destination card. */
  tagline: string;
}

export const featuredDestinations: Destination[] = [
  {
    id: "dar-es-salaam",
    tagline: "Where business meets coastal luxury.",
    name: "Dar es Salaam",
    region: "Coastal Tanzania",
    propertyCount: 48,
    image: destDar,
    blurb: "Harbour views, business districts and Indian Ocean evenings.",
  },
  {
    id: "zanzibar",
    tagline: "White sand beaches and unforgettable sunsets.",
    name: "Zanzibar",
    region: "Zanzibar Archipelago",
    propertyCount: 36,
    image: destZanzibar,
    blurb: "Turquoise water, dhow sails and Swahili heritage.",
  },
  {
    id: "arusha",
    tagline: "Gateway to Tanzania\'s iconic safari adventures.",
    name: "Arusha",
    region: "Northern Highlands",
    propertyCount: 24,
    image: destArusha,
    blurb: "The gateway to the northern safari circuit.",
  },
  {
    id: "dodoma",
    tagline: "Experience Tanzania\'s growing capital city.",
    name: "Dodoma",
    region: "Central Tanzania",
    propertyCount: 12,
    image: destDodoma,
    blurb: "The capital, its vineyards and open highland skies.",
  },
  {
    id: "mwanza",
    tagline: "Discover breathtaking lakeside experiences.",
    name: "Mwanza",
    region: "Lake Zone",
    propertyCount: 18,
    image: destMwanza,
    blurb: "Granite shores and calm sunsets over Lake Victoria.",
  },
];

export interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  currency: string;
  description: string;
  /** Compact amenity keys rendered as chips on the hotel card. */
  amenities: AmenityKey[];
  image: string;
}

export type AmenityKey =
  | "wifi"
  | "breakfast"
  | "pool"
  | "ocean-view"
  | "shuttle"
  | "parking"
  | "restaurant"
  | "fitness"
  | "spa"
  | "safari";

export const featuredHotels: Hotel[] = [
  {
    id: "harbour-house",
    name: "The Harbour House",
    location: "Masaki, Dar es Salaam",
    rating: 4.8,
    reviewCount: 412,
    priceFrom: 285000,
    currency: "TZS",
    description:
      "A calm city retreat above the harbour, minutes from the business district.",
    amenities: ["wifi", "breakfast", "parking", "fitness"],
    image: hotel1,
  },
  {
    id: "kizingo-beach",
    name: "Kizingo Beach Residence",
    location: "Michamvi, Zanzibar",
    rating: 4.9,
    reviewCount: 268,
    priceFrom: 410000,
    currency: "TZS",
    description:
      "Swahili arches, private terraces and an unbroken view of the reef.",
    amenities: ["ocean-view", "pool", "breakfast", "spa"],
    image: hotel2,
  },
  {
    id: "meru-highlands",
    name: "Meru Highlands Lodge",
    location: "Usa River, Arusha",
    rating: 4.7,
    reviewCount: 193,
    priceFrom: 330000,
    currency: "TZS",
    description:
      "Stone and timber suites overlooking the plains, built for slow evenings.",
    amenities: ["safari", "restaurant", "wifi", "shuttle"],
    image: hotel3,
  },
];

export interface ValueProposition {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const valuePropositions: ValueProposition[] = [
  {
    id: "verified",
    title: "Verified Hotels",
    description:
      "Every property is reviewed and accredited before it joins the NBC Hospitality network.",
    icon: ShieldCheck,
  },
  {
    id: "payments",
    title: "Secure Payments",
    description:
      "Stays are settled through NBC's protected payment infrastructure, end to end.",
    icon: LockKeyhole,
  },
  {
    id: "premium",
    title: "Premium Hospitality",
    description:
      "A curated standard of service, consistent from the coast to the highlands.",
    icon: Gem,
  },
  {
    id: "trust",
    title: "Trusted by NBC",
    description:
      "Backed by the National Bank of Commerce and a century of Tanzanian trust.",
    icon: Landmark,
  },
];

export const searchTrustIndicators = [
  { id: "partners", label: "Verified NBC Hotel Partners", icon: BadgeCheck },
  { id: "payments", label: "Secure NBC Payments", icon: ShieldCheck },
  { id: "network", label: "Trusted Hospitality Network", icon: HandHeart },
];

export interface FooterGroup {
  title: string;
  links: string[];
}

export const footerGroups: FooterGroup[] = [
  {
    title: "Hotels",
    links: ["Find Your Stay", "Featured Hotels", "New Openings", "Offers & Packages", "Gift Stays"],
  },
  {
    title: "Destinations",
    links: ["Dar es Salaam", "Zanzibar", "Arusha", "Dodoma", "Mwanza"],
  },
  {
    title: "Support",
    links: ["Contact Us", "Manage Booking", "Payment Methods", "Cancellations", "Help Centre"],
  },
  {
    title: "For Hotels",
    links: ["Become a Partner", "Partner Standards", "Partner Support", "Partner Login"],
  },
  {
    title: "Company",
    links: ["About NBC Hospitality", "Newsroom", "Careers", "Sustainability"],
  },
];

export const legalLinks = [
  "Data Privacy Statement",
  "Terms & Conditions",
  "Website Terms of Use",
];
