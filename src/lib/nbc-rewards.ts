import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  Cake,
  CalendarClock,
  Coffee,
  Gift,
  Hotel,
  Megaphone,
  PenLine,
  Plane,
  Sparkles,
  Star,
  Ticket,
  UserRoundCheck,
  Users,
  Waves,
} from "lucide-react";

import hotel1 from "@/assets/hotel-1.jpg";
import hotel3 from "@/assets/hotel-3.jpg";
import propFacilities from "@/assets/prop-facilities.jpg";
import propRestaurant from "@/assets/prop-restaurant.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuite from "@/assets/room-suite.jpg";

/**
 * Demo data for the Rewards & Loyalty module.
 * Shapes mirror the future loyalty API so the presentation layer stays stable.
 */

export type TierName = "Bronze" | "Silver" | "Gold" | "Diamond";

export interface LoyaltyTier {
  name: TierName;
  threshold: number;
  tagline: string;
  benefits: string[];
}

export const loyaltyTiers: LoyaltyTier[] = [
  {
    name: "Bronze",
    threshold: 0,
    tagline: "Your welcome to NBC Hospitality",
    benefits: ["Join for free", "Earn points", "Exclusive offers", "Birthday reward"],
  },
  {
    name: "Silver",
    threshold: 10_000,
    tagline: "For guests who travel often",
    benefits: [
      "Everything in Bronze",
      "Late checkout*",
      "Priority promotions",
      "Faster point earning",
    ],
  },
  {
    name: "Gold",
    threshold: 20_000,
    tagline: "Elevated comfort on every stay",
    benefits: [
      "Everything in Silver",
      "Complimentary breakfast*",
      "Room upgrade*",
      "Priority check-in",
      "Premium customer support",
    ],
  },
  {
    name: "Diamond",
    threshold: 40_000,
    tagline: "Our most rewarding membership",
    benefits: [
      "Everything in Gold",
      "Premium room upgrades",
      "VIP concierge",
      "Airport transfer*",
      "Exclusive experiences",
      "Highest point multiplier",
      "Early access to promotions",
    ],
  },
];

export interface LoyaltyMembership {
  tier: TierName;
  availablePoints: number;
  lifetimePoints: number;
  memberSince: string;
  pointsExpiring: number;
  expiringOn: string;
  nextRewardName: string;
  nextRewardPointsAway: number;
}

export const loyaltyMembership: LoyaltyMembership = {
  tier: "Silver",
  availablePoints: 18_450,
  lifetimePoints: 42_000,
  memberSince: "March 2024",
  pointsExpiring: 1_200,
  expiringOn: "31 December 2026",
  nextRewardName: "Complimentary Breakfast",
  nextRewardPointsAway: 550,
};

export interface EarnMethod {
  icon: LucideIcon;
  title: string;
  description: string;
  points: string;
}

export const earnMethods: EarnMethod[] = [
  {
    icon: Hotel,
    title: "Stay at Participating Hotels",
    description: "Earn points on every night booked across the NBC Hospitality network.",
    points: "Up to 600 points per stay",
  },
  {
    icon: PenLine,
    title: "Write a Verified Review",
    description: "Share your experience after checkout and help other guests choose well.",
    points: "150 points per review",
  },
  {
    icon: UserRoundCheck,
    title: "Complete Your Profile",
    description: "Add your travel preferences so we can tailor every stay to you.",
    points: "200 points once",
  },
  {
    icon: Megaphone,
    title: "Seasonal Promotions",
    description: "Book during festive and holiday campaigns for bonus point multipliers.",
    points: "300 – 900 bonus points",
  },
  {
    icon: Cake,
    title: "Birthday Rewards",
    description: "Enjoy a points gift from us during your birthday month, every year.",
    points: "500 points yearly",
  },
  {
    icon: Sparkles,
    title: "NBC Hospitality Campaigns",
    description: "Take part in member-only activities and partner experiences.",
    points: "Varies by campaign",
  },
];

export interface LoyaltyReward {
  id: string;
  name: string;
  image: string;
  points: number;
  description: string;
}

export const availableRewards: LoyaltyReward[] = [
  {
    id: "late-checkout",
    name: "Late Checkout",
    image: hotel1,
    points: 1_200,
    description: "Stay until 4:00 PM and end your trip without rushing.",
  },
  {
    id: "room-upgrade",
    name: "Room Upgrade",
    image: roomSuite,
    points: 4_500,
    description: "Move up one room category, subject to availability on arrival.",
  },
  {
    id: "breakfast",
    name: "Complimentary Breakfast",
    image: propRestaurant,
    points: 2_000,
    description: "Breakfast for two guests on each morning of your stay.",
  },
  {
    id: "spa",
    name: "Spa Voucher",
    image: propFacilities,
    points: 6_000,
    description: "A 60-minute signature treatment at participating hotel spas.",
  },
  {
    id: "discount",
    name: "Hotel Discount Voucher",
    image: hotel3,
    points: 8_000,
    description: "TZS 150,000 off your next reservation made through NBC Hospitality.",
  },
  {
    id: "free-night",
    name: "Free Night Stay",
    image: roomDeluxe,
    points: 25_000,
    description: "One complimentary night in a standard room at selected properties.",
  },
];

export interface WalletEntry {
  id: string;
  title: string;
  detail: string;
  date: string;
  points: number;
  icon: LucideIcon;
}

export const walletActivity: WalletEntry[] = [
  {
    id: "w1",
    title: "Stayed at Serena Lake Manyara",
    detail: "3 nights · NBC-HRS-48120",
    date: "21 July 2026",
    points: 600,
    icon: Hotel,
  },
  {
    id: "w2",
    title: "Verified Review Submitted",
    detail: "The Harbour House, Dar es Salaam",
    date: "12 July 2026",
    points: 150,
    icon: Star,
  },
  {
    id: "w3",
    title: "Seasonal Promotion",
    detail: "Coastal Escapes campaign bonus",
    date: "02 July 2026",
    points: 300,
    icon: Megaphone,
  },
  {
    id: "w4",
    title: "Room Upgrade Redeemed",
    detail: "Zanzibar Pearl Resort",
    date: "18 June 2026",
    points: -800,
    icon: BedDouble,
  },
  {
    id: "w5",
    title: "Birthday Reward",
    detail: "Annual member gift",
    date: "18 April 2026",
    points: 500,
    icon: Cake,
  },
];

export type RedemptionStatus = "Completed" | "Pending" | "Cancelled";

export interface Redemption {
  id: string;
  reward: string;
  points: number;
  date: string;
  status: RedemptionStatus;
}

export const redemptionHistory: Redemption[] = [
  { id: "r1", reward: "Room Upgrade", points: 800, date: "18 June 2026", status: "Completed" },
  { id: "r2", reward: "Late Checkout", points: 1_200, date: "02 June 2026", status: "Completed" },
  { id: "r3", reward: "Spa Voucher", points: 6_000, date: "28 May 2026", status: "Pending" },
  {
    id: "r4",
    reward: "Complimentary Breakfast",
    points: 2_000,
    date: "11 April 2026",
    status: "Cancelled",
  },
];

export interface NextTierAction {
  icon: LucideIcon;
  title: string;
  description: string;
  points: string;
}

export const nextTierActions: NextTierAction[] = [
  {
    icon: CalendarClock,
    title: "Complete your next stay",
    description: "A three-night stay at any participating hotel moves you up quickly.",
    points: "+600 points",
  },
  {
    icon: PenLine,
    title: "Write a verified review",
    description: "Tell us about your last stay at Serena Lake Manyara.",
    points: "+150 points",
  },
  {
    icon: UserRoundCheck,
    title: "Complete your profile",
    description: "Add your travel preferences and identity details.",
    points: "+200 points",
  },
  {
    icon: Megaphone,
    title: "Join a seasonal campaign",
    description: "Book during the Coastal Escapes campaign for bonus points.",
    points: "+300 points",
  },
];

export interface ComingSoonItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const comingSoonBenefits: ComingSoonItem[] = [
  {
    icon: Gift,
    title: "Link NBC Account",
    description: "Redeem loyalty points directly against your stay at checkout.",
  },
  {
    icon: Ticket,
    title: "Partner Rewards",
    description: "Earn and spend points with airlines, restaurants and retail partners.",
  },
  {
    icon: Waves,
    title: "Travel Experiences",
    description: "Curated safaris, island escapes and cultural tours for members.",
  },
  {
    icon: Users,
    title: "Family Accounts",
    description: "Pool points with the people you travel with most.",
  },
  {
    icon: Plane,
    title: "Referral Rewards",
    description: "Invite friends to NBC Hospitality and earn points on their first stay.",
  },
  {
    icon: Coffee,
    title: "Everyday Perks",
    description: "Member pricing on dining and hotel services between stays.",
  },
];

export const rewardsFaq = [
  {
    question: "How do I earn points?",
    answer:
      "You earn points on every completed stay at a participating NBC Hospitality hotel, and through verified reviews, profile completion, seasonal campaigns and your annual birthday reward.",
  },
  {
    question: "When do my points expire?",
    answer:
      "Points remain valid for 24 months from the date they are earned. Any expiring balance is shown in your rewards summary before it lapses.",
  },
  {
    question: "How do I redeem rewards?",
    answer:
      "Choose a reward from Available Rewards and confirm the redemption. The reward is attached to your membership and applied to your next eligible reservation.",
  },
  {
    question: "How do I move to the next tier?",
    answer:
      "Tiers are based on lifetime points earned. Keep booking, reviewing and taking part in campaigns — your progress is shown in the membership hero.",
  },
  {
    question: "Do points expire if I keep booking?",
    answer:
      "Every qualifying stay refreshes the validity of your balance, so members who travel at least once a year rarely lose points.",
  },
];

/** Tier the member currently sits in, based on lifetime points. */
export function tierForPoints(lifetimePoints: number): LoyaltyTier {
  return (
    [...loyaltyTiers].reverse().find((tier) => lifetimePoints >= tier.threshold) ?? loyaltyTiers[0]
  );
}

/** The tier immediately above the given one, or null at the top. */
export function nextTierAfter(name: TierName): LoyaltyTier | null {
  const index = loyaltyTiers.findIndex((tier) => tier.name === name);
  return loyaltyTiers[index + 1] ?? null;
}

/** Progress percentage between the current tier threshold and the next. */
export function tierProgress(points: number, current: LoyaltyTier, next: LoyaltyTier | null) {
  if (!next) return { percent: 100, remaining: 0 };
  const span = next.threshold - current.threshold;
  const gained = Math.max(0, points - current.threshold);
  return {
    percent: Math.min(100, Math.round((gained / span) * 100)),
    remaining: Math.max(0, next.threshold - points),
  };
}

export function formatPoints(value: number): string {
  return value.toLocaleString("en-US");
}
