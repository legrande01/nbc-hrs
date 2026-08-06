import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  CalendarCheck,
  Gift,
  ShieldCheck,
  Undo2,
  UserRoundCog,
  Wallet,
} from "lucide-react";

/**
 * Demo notification inbox for the customer account.
 * Shapes mirror the future notifications API so the UI stays unchanged when
 * the live service is introduced.
 */

export type NotificationCategory =
  | "reservations"
  | "payments"
  | "rewards"
  | "promotions"
  | "system";

export interface NbcNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  /** ISO timestamp of when the notification was raised. */
  timestamp: string;
  read: boolean;
}

export const notificationCategoryMeta: Record<
  NotificationCategory,
  { label: string; icon: LucideIcon }
> = {
  reservations: { label: "Reservations", icon: CalendarCheck },
  payments: { label: "Payments", icon: Wallet },
  rewards: { label: "Rewards", icon: Gift },
  promotions: { label: "Promotions", icon: BadgePercent },
  system: { label: "System", icon: ShieldCheck },
};

export const notificationIconFor: Record<string, LucideIcon> = {
  refund: Undo2,
  profile: UserRoundCog,
};

export const demoNotifications: NbcNotification[] = [
  {
    id: "ntf-01",
    category: "reservations",
    title: "Reservation Confirmed",
    description: "Your stay at The Harbour House, Masaki is confirmed · NBC-HRS-48210.",
    timestamp: "2026-08-05T09:12:00Z",
    read: false,
  },
  {
    id: "ntf-02",
    category: "reservations",
    title: "Check-in Reminder",
    description: "Check-in opens at 14:00 on 16 August. Your room will be ready and waiting.",
    timestamp: "2026-08-04T17:40:00Z",
    read: false,
  },
  {
    id: "ntf-03",
    category: "payments",
    title: "Payment Successful",
    description: "TZS 1,240,000 received via Mobile Money for reservation NBC-HRS-48210.",
    timestamp: "2026-08-04T08:05:00Z",
    read: false,
  },
  {
    id: "ntf-04",
    category: "payments",
    title: "Refund Processed",
    description: "TZS 320,000 has been returned to your Mobile Money wallet within 3 working days.",
    timestamp: "2026-07-29T11:20:00Z",
    read: true,
  },
  {
    id: "ntf-05",
    category: "rewards",
    title: "Reward Points Earned",
    description: "You earned 1,250 points from your stay at Serena Lake Manyara. Enjoy them soon.",
    timestamp: "2026-07-22T07:15:00Z",
    read: false,
  },
  {
    id: "ntf-06",
    category: "promotions",
    title: "Weekend Hotel Offers",
    description: "Up to 20% off selected coastal escapes when you book before Friday.",
    timestamp: "2026-07-18T06:00:00Z",
    read: true,
  },
  {
    id: "ntf-07",
    category: "system",
    title: "Password Changed",
    description: "Your account password was updated successfully. This was you, we hope.",
    timestamp: "2026-07-11T15:48:00Z",
    read: true,
  },
  {
    id: "ntf-08",
    category: "system",
    title: "Profile Updated",
    description: "Your contact details were updated on your NBC Hospitality profile.",
    timestamp: "2026-07-02T10:02:00Z",
    read: true,
  },
];

export type NotificationSort = "newest" | "oldest" | "unread";

export function formatNotificationTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function sortNotifications(
  items: NbcNotification[],
  sort: NotificationSort,
): NbcNotification[] {
  const copy = [...items];
  if (sort === "unread") {
    return copy.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return Date.parse(b.timestamp) - Date.parse(a.timestamp);
    });
  }
  return copy.sort((a, b) =>
    sort === "oldest"
      ? Date.parse(a.timestamp) - Date.parse(b.timestamp)
      : Date.parse(b.timestamp) - Date.parse(a.timestamp),
  );
}
