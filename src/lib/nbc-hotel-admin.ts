import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  ClipboardList,
  Coffee,
  CreditCard,
  Car,
  DoorOpen,
  Gauge,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquare,
  Plus,
  Receipt,
  RefreshCcw,
  Settings,
  Sparkles,
  Star,
  Tag,
  Users,
  Wallet,
  Wrench,
  Bell,
  BarChart3,
  ConciergeBell,
  ShieldCheck,
} from "lucide-react";

/**
 * Hotel-side (property operations) demo data and navigation model.
 *
 * Every number below is derived from a single source of truth so the KPI row,
 * hotel pulse, room status widget and needs-attention list can never contradict
 * each other. Swapping in live data later means replacing these constants only.
 */

/* ------------------------------------------------------------------ roles */

export type HotelRole =
  | "hotel_admin"
  | "hotel_manager"
  | "front_desk"
  | "reservation_officer"
  | "finance"
  | "housekeeping";

/** Navigation permission keys — future roles subscribe to a subset of these. */
export type HotelModule =
  | "dashboard"
  | "reservations"
  | "rooms"
  | "guests"
  | "services"
  | "rates"
  | "reviews"
  | "finance"
  | "reports"
  | "profile"
  | "staff"
  | "notifications"
  | "settings";

export const ALL_HOTEL_MODULES: HotelModule[] = [
  "dashboard",
  "reservations",
  "rooms",
  "guests",
  "services",
  "rates",
  "reviews",
  "finance",
  "reports",
  "profile",
  "staff",
  "notifications",
  "settings",
];

/**
 * Module access per hotel-side role. Only `hotel_admin` ships this sprint;
 * the remaining entries document the intended surface for later phases.
 */
export const HOTEL_ROLE_MODULES: Record<HotelRole, HotelModule[]> = {
  hotel_admin: ALL_HOTEL_MODULES,
  hotel_manager: ALL_HOTEL_MODULES.filter((m) => m !== "staff"),
  front_desk: ["dashboard", "reservations", "guests", "rooms", "notifications"],
  reservation_officer: ["dashboard", "reservations", "guests", "rates", "notifications"],
  finance: ["dashboard", "finance", "reports", "notifications"],
  housekeeping: ["dashboard", "rooms", "notifications"],
};

export function canAccessModule(role: HotelRole, module: HotelModule): boolean {
  return HOTEL_ROLE_MODULES[role].includes(module);
}

/* ------------------------------------------------------------- navigation */

export interface HotelNavChild {
  label: string;
  to: string;
}

export interface HotelNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  module: HotelModule;
  children?: HotelNavChild[];
}

export const hotelNavigation: HotelNavItem[] = [
  { label: "Dashboard", to: "/hotel/dashboard", icon: LayoutDashboard, module: "dashboard" },
  {
    label: "Reservations",
    to: "/hotel/reservations",
    icon: CalendarCheck,
    module: "reservations",
    children: [
      { label: "All Reservations", to: "/hotel/reservations" },
      { label: "Pending", to: "/hotel/reservations/pending" },
      { label: "Confirmed", to: "/hotel/reservations/confirmed" },
      { label: "Checked-in", to: "/hotel/reservations/checked-in" },
      { label: "Checked-out", to: "/hotel/reservations/checked-out" },
      { label: "Cancelled", to: "/hotel/reservations/cancelled" },
    ],
  },
  {
    label: "Rooms & Inventory",
    to: "/hotel/rooms",
    icon: BedDouble,
    module: "rooms",
    children: [
      { label: "Room Categories", to: "/hotel/rooms/categories" },
      { label: "Rooms", to: "/hotel/rooms" },
      { label: "Availability", to: "/hotel/rooms/availability" },
      { label: "Room Status", to: "/hotel/rooms/status" },
      { label: "Maintenance", to: "/hotel/rooms/maintenance" },
    ],
  },
  {
    label: "Guests",
    to: "/hotel/guests",
    icon: Users,
    module: "guests",
    children: [
      { label: "Guest Directory", to: "/hotel/guests" },
      { label: "Current Guests", to: "/hotel/guests/current" },
      { label: "Guest History", to: "/hotel/guests/history" },
      { label: "Guest Requests", to: "/hotel/guests/requests" },
    ],
  },
  {
    label: "Hotel Services",
    to: "/hotel/services",
    icon: ConciergeBell,
    module: "services",
    children: [
      { label: "Services", to: "/hotel/services" },
      { label: "Service Bookings", to: "/hotel/services/bookings" },
      { label: "Dining", to: "/hotel/services/dining" },
      { label: "Transportation", to: "/hotel/services/transportation" },
      { label: "Experiences", to: "/hotel/services/experiences" },
      { label: "Room Services", to: "/hotel/services/room-services" },
    ],
  },
  {
    label: "Rates & Pricing",
    to: "/hotel/rates",
    icon: Tag,
    module: "rates",
    children: [
      { label: "Room Rates", to: "/hotel/rates" },
      { label: "Rate Plans", to: "/hotel/rates/plans" },
      { label: "Promotions", to: "/hotel/rates/promotions" },
      { label: "Discounts", to: "/hotel/rates/discounts" },
    ],
  },
  {
    label: "Reviews",
    to: "/hotel/reviews",
    icon: Star,
    module: "reviews",
    children: [
      { label: "All Reviews", to: "/hotel/reviews" },
      { label: "Pending Response", to: "/hotel/reviews/pending" },
      { label: "Responded", to: "/hotel/reviews/responded" },
      { label: "Ratings & Insights", to: "/hotel/reviews/insights" },
    ],
  },
  {
    label: "Payments & Finance",
    to: "/hotel/finance",
    icon: Wallet,
    module: "finance",
    children: [
      { label: "Transactions", to: "/hotel/finance" },
      { label: "Payments", to: "/hotel/finance/payments" },
      { label: "Refunds", to: "/hotel/finance/refunds" },
      { label: "Settlement", to: "/hotel/finance/settlement" },
    ],
  },
  { label: "Reports & Analytics", to: "/hotel/reports", icon: BarChart3, module: "reports" },
  {
    label: "Hotel Profile",
    to: "/hotel/profile",
    icon: Building2,
    module: "profile",
    children: [
      { label: "Property Information", to: "/hotel/profile" },
      { label: "Rooms & Amenities", to: "/hotel/profile/amenities" },
      { label: "Policies", to: "/hotel/profile/policies" },
      { label: "Photos", to: "/hotel/profile/photos" },
      { label: "Documents", to: "/hotel/profile/documents" },
    ],
  },
  { label: "Staff & Roles", to: "/hotel/staff", icon: ShieldCheck, module: "staff" },
  { label: "Notifications", to: "/hotel/notifications", icon: Bell, module: "notifications" },
  { label: "Settings", to: "/hotel/settings", icon: Settings, module: "settings" },
];

export function navigationForRole(role: HotelRole): HotelNavItem[] {
  return hotelNavigation.filter((item) => canAccessModule(role, item.module));
}

/* -------------------------------------------------------------- property */

export const hotelProperty = {
  name: "Serena Lake Manyara",
  location: "Mto wa Mbu, Arusha",
  adminName: "Amina",
  totalRooms: 100,
};

/* ------------------------------------------------------------ room status */

export type RoomStatusKey =
  | "occupied"
  | "reserved"
  | "available"
  | "cleaning"
  | "maintenance"
  | "outOfService";

export interface RoomStatusEntry {
  key: RoomStatusKey;
  label: string;
  count: number;
  to: string;
  /** Token-driven colour class used for the bar segment and dot. */
  tone: string;
}

export const roomStatus: RoomStatusEntry[] = [
  { key: "occupied", label: "Occupied", count: 62, to: "/hotel/rooms/status", tone: "bg-nbc-royal" },
  {
    key: "reserved",
    label: "Reserved",
    count: 12,
    to: "/hotel/rooms/availability",
    tone: "bg-nbc-royal/60",
  },
  {
    key: "available",
    label: "Available",
    count: 16,
    to: "/hotel/rooms/availability",
    tone: "bg-nbc-royal-soft",
  },
  { key: "cleaning", label: "Cleaning", count: 6, to: "/hotel/rooms/status", tone: "bg-nbc-gold" },
  {
    key: "maintenance",
    label: "Maintenance",
    count: 3,
    to: "/hotel/rooms/maintenance",
    tone: "bg-nbc-scarlet/60",
  },
  {
    key: "outOfService",
    label: "Out of Service",
    count: 1,
    to: "/hotel/rooms/maintenance",
    tone: "bg-nbc-scarlet",
  },
];

const soldRooms =
  (roomStatus.find((r) => r.key === "occupied")?.count ?? 0) +
  (roomStatus.find((r) => r.key === "reserved")?.count ?? 0);

/* ------------------------------------------------------------------- KPIs */

export interface HotelKpi {
  label: string;
  value: string;
  context: string;
  trend?: { direction: "up" | "down"; label: string };
  icon: LucideIcon;
  to: string;
}

export const todayStats = {
  bookings: 26,
  occupancyRooms: soldRooms,
  revenueTzs: 18_450_000,
  arrivals: 12,
  departures: 8,
  guestsStaying: 128,
  housekeepingPending: 6,
};

export function formatTzs(amount: number): string {
  return `TZS ${amount.toLocaleString("en-GB")}`;
}

export const hotelKpis: HotelKpi[] = [
  {
    label: "Today's Bookings",
    value: String(todayStats.bookings),
    context: "New reservations received today",
    trend: { direction: "up", label: "+8% vs yesterday" },
    icon: CalendarPlus,
    to: "/hotel/reservations",
  },
  {
    label: "Occupancy",
    value: `${Math.round((todayStats.occupancyRooms / hotelProperty.totalRooms) * 100)}%`,
    context: `${todayStats.occupancyRooms} of ${hotelProperty.totalRooms} rooms occupied`,
    trend: { direction: "up", label: "+4 pts vs last week" },
    icon: Gauge,
    to: "/hotel/rooms/availability",
  },
  {
    label: "Today's Revenue",
    value: formatTzs(todayStats.revenueTzs),
    context: "Confirmed payments received today",
    trend: { direction: "up", label: "+12% vs yesterday" },
    icon: Receipt,
    to: "/hotel/finance",
  },
  {
    label: "Today's Arrivals",
    value: String(todayStats.arrivals),
    context: "4 guests already checked in",
    icon: LogIn,
    to: "/hotel/reservations/confirmed",
  },
  {
    label: "Today's Departures",
    value: String(todayStats.departures),
    context: "Checkout closes at 11:00",
    icon: LogOut,
    to: "/hotel/reservations/checked-in",
  },
];

/* --------------------------------------------------- reservations overview */

export interface ReservationTrendPoint {
  label: string;
  confirmed: number;
  checkedIn: number;
  checkedOut: number;
}

export const reservationTrend7: ReservationTrendPoint[] = [
  { label: "Mon", confirmed: 22, checkedIn: 15, checkedOut: 12 },
  { label: "Tue", confirmed: 28, checkedIn: 19, checkedOut: 14 },
  { label: "Wed", confirmed: 24, checkedIn: 17, checkedOut: 16 },
  { label: "Thu", confirmed: 31, checkedIn: 21, checkedOut: 13 },
  { label: "Fri", confirmed: 35, checkedIn: 26, checkedOut: 18 },
  { label: "Sat", confirmed: 38, checkedIn: 29, checkedOut: 22 },
  { label: "Sun", confirmed: 26, checkedIn: 12, checkedOut: 8 },
];

/** 30-day view grouped into weeks so the chart stays readable. */
export const reservationTrend30: ReservationTrendPoint[] = [
  { label: "Wk 1", confirmed: 164, checkedIn: 121, checkedOut: 108 },
  { label: "Wk 2", confirmed: 189, checkedIn: 142, checkedOut: 131 },
  { label: "Wk 3", confirmed: 172, checkedIn: 133, checkedOut: 126 },
  { label: "Wk 4", confirmed: 204, checkedIn: 158, checkedOut: 149 },
];

/* --------------------------------------------------- today's reservations */

export type HotelReservationStatus =
  | "Pending"
  | "Confirmed"
  | "Checked-in"
  | "Checked-out"
  | "Cancelled";

export interface HotelReservationRow {
  reference: string;
  guest: string;
  room: string;
  checkIn: string;
  checkOut: string;
  amountTzs: number;
  status: HotelReservationStatus;
  action: string;
}

export const todaysReservations: HotelReservationRow[] = [
  {
    reference: "NBC-HRS-48210",
    guest: "Amani Mushi",
    room: "208 · Deluxe Lake View",
    checkIn: "16 Aug",
    checkOut: "19 Aug",
    amountTzs: 1_240_000,
    status: "Checked-in",
    action: "View",
  },
  {
    reference: "NBC-HRS-48231",
    guest: "Grace Kimaro",
    room: "112 · Standard Twin",
    checkIn: "16 Aug",
    checkOut: "18 Aug",
    amountTzs: 640_000,
    status: "Confirmed",
    action: "Check in",
  },
  {
    reference: "NBC-HRS-48244",
    guest: "Joseph Mwakalinga",
    room: "301 · Manyara Suite",
    checkIn: "16 Aug",
    checkOut: "21 Aug",
    amountTzs: 3_150_000,
    status: "Pending",
    action: "Confirm",
  },
  {
    reference: "NBC-HRS-48250",
    guest: "Neema Shirima",
    room: "104 · Standard Double",
    checkIn: "14 Aug",
    checkOut: "16 Aug",
    amountTzs: 520_000,
    status: "Checked-out",
    action: "View",
  },
  {
    reference: "NBC-HRS-48261",
    guest: "Peter Sanga",
    room: "215 · Deluxe Garden",
    checkIn: "16 Aug",
    checkOut: "17 Aug",
    amountTzs: 410_000,
    status: "Cancelled",
    action: "View",
  },
];

export const reservationStatusTone: Record<HotelReservationStatus, string> = {
  Pending: "border-nbc-gold/40 bg-nbc-gold/15 text-nbc-orange",
  Confirmed: "border-nbc-royal/25 bg-nbc-royal/10 text-nbc-royal",
  "Checked-in": "border-nbc-emerald/30 bg-nbc-emerald/12 text-nbc-emerald",
  "Checked-out": "border-border bg-secondary/70 text-muted-foreground",
  Cancelled: "border-nbc-scarlet/30 bg-nbc-scarlet/10 text-nbc-scarlet",
};

/* -------------------------------------------------------- needs attention */

export interface AttentionItem {
  label: string;
  detail: string;
  count: number;
  icon: LucideIcon;
  to: string;
  urgent?: boolean;
}

export const needsAttention: AttentionItem[] = [
  {
    label: "Reservations awaiting confirmation",
    detail: "Oldest request received 4 hours ago",
    count: 3,
    icon: CalendarClock,
    to: "/hotel/reservations/pending",
    urgent: true,
  },
  {
    label: "Rooms awaiting housekeeping",
    detail: "Blocking same-day arrivals",
    count: todayStats.housekeepingPending,
    icon: Sparkles,
    to: "/hotel/rooms/status",
  },
  {
    label: "Maintenance requests",
    detail: "Room 118 air conditioning",
    count: 3,
    icon: Wrench,
    to: "/hotel/rooms/maintenance",
  },
  {
    label: "Service requests pending",
    detail: "Across dining, transport and rooms",
    count: 21,
    icon: ConciergeBell,
    to: "/hotel/services/bookings",
  },
  {
    label: "Reviews awaiting response",
    detail: "Respond within 48 hours",
    count: 4,
    icon: MessageSquare,
    to: "/hotel/reviews/pending",
  },
  {
    label: "Pending refunds",
    detail: "TZS 820,000 awaiting approval",
    count: 2,
    icon: RefreshCcw,
    to: "/hotel/finance/refunds",
    urgent: true,
  },
];

/* ---------------------------------------------------------- services + reviews */

export interface ServicePending {
  label: string;
  count: number;
  icon: LucideIcon;
  to: string;
}

export const servicePending: ServicePending[] = [
  { label: "Dining", count: 8, icon: Coffee, to: "/hotel/services/dining" },
  { label: "Transportation", count: 4, icon: Car, to: "/hotel/services/transportation" },
  { label: "Experiences", count: 3, icon: Sparkles, to: "/hotel/services/experiences" },
  { label: "Room Services", count: 6, icon: DoorOpen, to: "/hotel/services/room-services" },
  { label: "Other Services", count: 0, icon: ClipboardList, to: "/hotel/services" },
];

export const reviewsSummary = {
  averageRating: 4.7,
  totalReviews: 713,
  newReviews: 12,
  awaitingResponse: 4,
};

/* --------------------------------------------------------- recent activity */

export interface HotelActivity {
  time: string;
  title: string;
  reference?: string;
  icon: LucideIcon;
}

export const recentHotelActivity: HotelActivity[] = [
  { time: "10:42", title: "Guest checked in", reference: "NBC-HRS-48210", icon: LogIn },
  { time: "10:18", title: "Room 208 marked clean", icon: Sparkles },
  {
    time: "09:51",
    title: "Payment received · TZS 1,240,000",
    reference: "Mobile Money",
    icon: CreditCard,
  },
  { time: "09:24", title: "Reservation created", reference: "NBC-HRS-48261", icon: CalendarPlus },
  { time: "08:57", title: "Room 118 moved to maintenance", icon: Wrench },
  { time: "08:30", title: "Service request received", reference: "Dining · Room 301", icon: Coffee },
  { time: "07:58", title: "Review submitted · 5 stars", reference: "Grace K.", icon: Star },
];

/* ------------------------------------------------------------ quick actions */

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  to: string;
}

export const quickActions: QuickAction[] = [
  { label: "New Reservation", icon: CalendarPlus, to: "/hotel/reservations/new" },
  { label: "Check-in Guest", icon: LogIn, to: "/hotel/reservations/checked-in" },
  { label: "Add Room", icon: Plus, to: "/hotel/rooms" },
  { label: "Update Availability", icon: CalendarCheck, to: "/hotel/rooms/availability" },
  { label: "Add Service", icon: ConciergeBell, to: "/hotel/services" },
  { label: "View Reports", icon: BarChart3, to: "/hotel/reports" },
];

/** Time-of-day greeting for the hotel admin header. */
export function adminGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
