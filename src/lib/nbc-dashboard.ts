import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarCheck,
  CreditCard,
  Gift,
  Heart,
  LayoutDashboard,
  Mail,
  Receipt,
  Settings,
  Sparkles,
  Wallet,
} from "lucide-react";

import hotel2 from "@/assets/hotel-2.jpg";

/**
 * Demo data for the authenticated customer dashboard.
 * Shapes mirror the future API contracts so the widgets stay unchanged when
 * live reservation, loyalty and payment services are introduced.
 */

export type AccountPath =
  | "/account"
  | "/account/reservations"
  | "/account/favourites"
  | "/account/payments"
  | "/account/rewards"
  | "/account/notifications"
  | "/account/settings"
  | "/account/activity";

export interface AccountNavItem {
  label: string;
  to: AccountPath;
  icon: LucideIcon;
}

export const accountNavigation: AccountNavItem[] = [
  { label: "Dashboard", to: "/account", icon: LayoutDashboard },
  { label: "My Reservations", to: "/account/reservations", icon: CalendarCheck },
  { label: "Favourite", to: "/account/favourites", icon: Heart },
  { label: "Payments", to: "/account/payments", icon: CreditCard },
  { label: "Rewards & Loyalty", to: "/account/rewards", icon: Gift },
  { label: "Notifications", to: "/account/notifications", icon: Bell },
  { label: "Profile & Settings", to: "/account/settings", icon: Settings },
];

export interface DashboardSummary {
  label: string;
  value: number;
  hint: string;
  to: AccountPath;
  icon: LucideIcon;
}

export const dashboardSummaries: DashboardSummary[] = [
  {
    label: "Upcoming Reservations",
    value: 1,
    hint: "Next stay in 12 days",
    to: "/account/reservations",
    icon: CalendarCheck,
  },
  {
    label: "Completed Stays",
    value: 7,
    hint: "Across 4 destinations",
    to: "/account/reservations",
    icon: Sparkles,
  },
  {
    label: "Pending Payments",
    value: 0,
    hint: "Everything is settled",
    to: "/account/payments",
    icon: Receipt,
  },
  {
    label: "Favourite Hotels",
    value: 3,
    hint: "Saved for later",
    to: "/account/favourites",
    icon: Heart,
  },
];

export interface UpcomingStay {
  image: string;
  hotelName: string;
  location: string;
  reference: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "Confirmed" | "Pending" | "Cancelled";
}

export const upcomingStay: UpcomingStay | null = {
  image: hotel2,
  hotelName: "The Harbour House",
  location: "Masaki, Dar es Salaam",
  reference: "NBC-HRS-48210",
  checkIn: "2026-08-16",
  checkOut: "2026-08-19",
  guests: 2,
  status: "Confirmed",
};

export interface RewardsSummary {
  points: number;
  lifetimePoints: number;
  nextMilestone: number;
  lastEarnedLabel: string;
  lastEarnedPoints: number;
}

export const rewardsSummary: RewardsSummary = {
  points: 18_450,
  lifetimePoints: 42_000,
  nextMilestone: 19_000,
  lastEarnedLabel: "Serena Lake Manyara · 21 July 2026",
  lastEarnedPoints: 1_250,
};

export interface PaymentSummary {
  defaultMethod: string | null;
  defaultMethodDetail: string;
  nbcAccountLinked: boolean;
  nbcAccountMasked: string | null;
}

export const paymentSummary: PaymentSummary = {
  defaultMethod: "Mobile Money",
  defaultMethodDetail: "M-Pesa · •••• 7412",
  nbcAccountLinked: false,
  nbcAccountMasked: null,
};

export type ActivityTone = "success" | "info" | "pending";

export interface ActivityEntry {
  title: string;
  detail: string;
  timeAgo: string;
  tone: ActivityTone;
  icon: LucideIcon;
}

export const recentActivity: ActivityEntry[] = [
  {
    title: "Reservation Confirmed",
    detail: "The Harbour House · NBC-HRS-48210",
    timeAgo: "2 days ago",
    tone: "success",
    icon: CalendarCheck,
  },
  {
    title: "Payment Successful",
    detail: "TZS 1,240,000 via Mobile Money",
    timeAgo: "2 days ago",
    tone: "success",
    icon: Wallet,
  },
  {
    title: "Confirmation Email Sent",
    detail: "Sent to your registered email address",
    timeAgo: "2 days ago",
    tone: "info",
    icon: Mail,
  },
  {
    title: "Reminder Scheduled",
    detail: "Check-in reminder for 16 August 2026",
    timeAgo: "1 day ago",
    tone: "pending",
    icon: Bell,
  },
];

/** Initials used by the sidebar avatar fallback. */
export function initialsFor(firstName?: string, lastName?: string, email?: string): string {
  const first = (firstName ?? "").trim();
  const last = (lastName ?? "").trim();
  const combined = `${first.charAt(0)}${last.charAt(0)}`.trim();
  if (combined) return combined.toUpperCase();
  return (email ?? "G").charAt(0).toUpperCase();
}

/** Time-of-day greeting used by the welcome section. */
export function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

/** Whole days between now and the check-in date, never negative. */
export function daysUntil(isoDate: string, from: Date): number {
  const target = new Date(`${isoDate}T14:00:00`).getTime();
  const diff = target - from.getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export function formatStayDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
