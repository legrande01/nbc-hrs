import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  CalendarPlus,
  CheckCircle2,
  ConciergeBell,
  CreditCard,
  LogIn,
  LogOut,
  XCircle,
} from "lucide-react";

import { hotelProperty, type HotelReservationStatus } from "@/lib/nbc-hotel-admin";

/**
 * Hotel-side reservation model.
 *
 * This is the single operational reservation source for the hotel admin area.
 * It intentionally reuses the same identifiers, statuses, currency and payment
 * channels as the customer reservation experience (`nbc-reservations.ts`) so
 * both sides describe the same booking.
 */

export type HotelPaymentStatus = "Paid" | "Partially Paid" | "Pending" | "Refunded" | "Failed";

export type PaymentChannel =
  | "Mobile Money"
  | "Card"
  | "Control Number"
  | "NBC Account"
  | "Loyalty Points";

export type ServiceStatus = "Requested" | "Confirmed" | "In Progress" | "Completed" | "Cancelled";

export type RequestStatus = "Pending" | "Acknowledged" | "Completed" | "Rejected";

export interface ReservationService {
  id: string;
  name: string;
  category: string;
  date: string;
  time?: string;
  quantity: number;
  price: number;
  status: ServiceStatus;
}

export interface GuestRequest {
  id: string;
  label: string;
  detail: string;
  status: RequestStatus;
}

export interface InternalNote {
  id: string;
  body: string;
  author: string;
  at: string;
}

export interface PaymentActivityEntry {
  id: string;
  date: string;
  amount: number;
  channel: PaymentChannel;
  detail: string;
  reference: string;
  status: HotelPaymentStatus;
}

export interface ReservationEvent {
  id: string;
  label: string;
  at: string;
  actor?: string;
  icon: LucideIcon;
}

export interface HotelGuest {
  id: string;
  name: string;
  phone: string;
  email: string;
  nationality: string;
  membership: string | null;
  previousStays: number;
}

export interface HotelReservation {
  reference: string;
  hotelName: string;
  guest: HotelGuest;
  bookedOn: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  rooms: number;
  roomCategory: string;
  bedType: string;
  maxOccupancy: number;
  assignedRoom: string | null;
  nightlyRate: number;
  total: number;
  amountPaid: number;
  paymentStatus: HotelPaymentStatus;
  paymentChannel: PaymentChannel;
  paymentDetail: string;
  transactionReference: string | null;
  status: HotelReservationStatus;
  source: string;
  roomRequirements: string | null;
  services: ReservationService[];
  requests: GuestRequest[];
  notes: InternalNote[];
  payments: PaymentActivityEntry[];
  activity: ReservationEvent[];
}

/* ----------------------------------------------------------------- helpers */

export const reservationStatuses: HotelReservationStatus[] = [
  "Pending",
  "Confirmed",
  "Checked-in",
  "Checked-out",
  "Cancelled",
];

export const paymentStatuses: HotelPaymentStatus[] = [
  "Paid",
  "Partially Paid",
  "Pending",
  "Refunded",
  "Failed",
];

export const paymentStatusTone: Record<HotelPaymentStatus, string> = {
  Paid: "border-nbc-emerald/30 bg-nbc-emerald/12 text-nbc-emerald",
  "Partially Paid": "border-nbc-gold/40 bg-nbc-gold/15 text-nbc-orange",
  Pending: "border-border bg-secondary/70 text-muted-foreground",
  Refunded: "border-nbc-royal/25 bg-nbc-royal/10 text-nbc-royal",
  Failed: "border-nbc-scarlet/30 bg-nbc-scarlet/10 text-nbc-scarlet",
};

export const serviceStatusTone: Record<ServiceStatus, string> = {
  Requested: "border-nbc-gold/40 bg-nbc-gold/15 text-nbc-orange",
  Confirmed: "border-nbc-royal/25 bg-nbc-royal/10 text-nbc-royal",
  "In Progress": "border-nbc-royal/25 bg-nbc-royal/10 text-nbc-royal",
  Completed: "border-nbc-emerald/30 bg-nbc-emerald/12 text-nbc-emerald",
  Cancelled: "border-nbc-scarlet/30 bg-nbc-scarlet/10 text-nbc-scarlet",
};

export const requestStatusTone: Record<RequestStatus, string> = {
  Pending: "border-nbc-gold/40 bg-nbc-gold/15 text-nbc-orange",
  Acknowledged: "border-nbc-royal/25 bg-nbc-royal/10 text-nbc-royal",
  Completed: "border-nbc-emerald/30 bg-nbc-emerald/12 text-nbc-emerald",
  Rejected: "border-nbc-scarlet/30 bg-nbc-scarlet/10 text-nbc-scarlet",
};

export function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* -------------------------------------------------------------- demo data */

const today = "2026-08-17";

function makeGuest(
  id: string,
  name: string,
  phone: string,
  email: string,
  nationality: string,
  membership: string | null,
  previousStays: number,
): HotelGuest {
  return { id, name, phone, email, nationality, membership, previousStays };
}

interface Seed {
  reference: string;
  guest: HotelGuest;
  bookedOn: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  rooms?: number;
  roomCategory: string;
  bedType: string;
  maxOccupancy: number;
  assignedRoom: string | null;
  nightlyRate: number;
  status: HotelReservationStatus;
  paymentStatus: HotelPaymentStatus;
  paymentChannel: PaymentChannel;
  paymentDetail: string;
  transactionReference: string | null;
  paidRatio?: number;
  source?: string;
  roomRequirements?: string | null;
  services?: ReservationService[];
  requests?: GuestRequest[];
  notes?: InternalNote[];
}

const seeds: Seed[] = [
  {
    reference: "NBC-HRS-48210",
    guest: makeGuest(
      "g-amani",
      "Amani Mushi",
      "+255 754 118 220",
      "amani.mushi@example.co.tz",
      "Tanzanian",
      "NBC Bonvoy · Gold",
      6,
    ),
    bookedOn: "2026-07-24",
    checkIn: "2026-08-16",
    checkOut: "2026-08-19",
    adults: 2,
    roomCategory: "Deluxe Lake View",
    bedType: "King bed",
    maxOccupancy: 3,
    assignedRoom: "208",
    nightlyRate: 413_333,
    status: "Checked-in",
    paymentStatus: "Paid",
    paymentChannel: "Mobile Money",
    paymentDetail: "Mobile Money — M-Pesa",
    transactionReference: "MPESA-9F42XK118",
    roomRequirements: "High floor, away from the lift",
    services: [
      {
        id: "svc-48210-1",
        name: "Airport Pickup",
        category: "Transportation",
        date: "2026-08-16",
        time: "21:30",
        quantity: 1,
        price: 85_000,
        status: "Completed",
      },
      {
        id: "svc-48210-2",
        name: "Breakfast",
        category: "Dining",
        date: "2026-08-17",
        time: "07:30",
        quantity: 2,
        price: 60_000,
        status: "In Progress",
      },
      {
        id: "svc-48210-3",
        name: "Signature Spa Treatment",
        category: "Spa",
        date: "2026-08-18",
        time: "16:00",
        quantity: 1,
        price: 145_000,
        status: "Confirmed",
      },
    ],
    requests: [
      {
        id: "req-48210-1",
        label: "High floor",
        detail: "Guest prefers a lake-facing room above level 2.",
        status: "Completed",
      },
      {
        id: "req-48210-2",
        label: "Late check-out",
        detail: "Requested 14:00 departure on 19 Aug.",
        status: "Pending",
      },
    ],
    notes: [
      {
        id: "note-48210-1",
        body: "VIP guest — coordinate welcome amenity with front desk.",
        author: "Amina J. · Hotel Admin",
        at: "2026-08-16 18:12",
      },
      {
        id: "note-48210-2",
        body: "Airport pickup confirmed with driver Josephat.",
        author: "Front Desk",
        at: "2026-08-16 20:05",
      },
    ],
  },
  {
    reference: "NBC-HRS-48231",
    guest: makeGuest(
      "g-grace",
      "Grace Kimaro",
      "+255 767 400 118",
      "grace.kimaro@example.co.tz",
      "Tanzanian",
      "NBC Bonvoy · Silver",
      2,
    ),
    bookedOn: "2026-08-02",
    checkIn: "2026-08-17",
    checkOut: "2026-08-19",
    adults: 2,
    roomCategory: "Standard Twin",
    bedType: "Two twin beds",
    maxOccupancy: 2,
    assignedRoom: "112",
    nightlyRate: 320_000,
    status: "Confirmed",
    paymentStatus: "Partially Paid",
    paymentChannel: "Control Number",
    paymentDetail: "Control Number — NBC Collection",
    transactionReference: "CN-991204887314",
    paidRatio: 0.4,
    requests: [
      {
        id: "req-48231-1",
        label: "Early check-in",
        detail: "Arriving on the 09:40 flight from Dar.",
        status: "Acknowledged",
      },
    ],
  },
  {
    reference: "NBC-HRS-48244",
    guest: makeGuest(
      "g-joseph",
      "Joseph Mwakalinga",
      "+255 715 902 341",
      "j.mwakalinga@example.co.tz",
      "Tanzanian",
      null,
      0,
    ),
    bookedOn: "2026-08-15",
    checkIn: "2026-08-17",
    checkOut: "2026-08-22",
    adults: 2,
    children: 1,
    roomCategory: "Manyara Suite",
    bedType: "King bed + sofa bed",
    maxOccupancy: 4,
    assignedRoom: null,
    nightlyRate: 630_000,
    status: "Pending",
    paymentStatus: "Pending",
    paymentChannel: "Control Number",
    paymentDetail: "Control Number — awaiting payment",
    transactionReference: null,
    paidRatio: 0,
    source: "NBC HRS Web",
    roomRequirements: "Baby cot required",
    requests: [
      {
        id: "req-48244-1",
        label: "Baby cot",
        detail: "One cot for an 11 month old.",
        status: "Pending",
      },
      {
        id: "req-48244-2",
        label: "Anniversary",
        detail: "Celebrating a 10th wedding anniversary.",
        status: "Pending",
      },
    ],
  },
  {
    reference: "NBC-HRS-48250",
    guest: makeGuest(
      "g-neema",
      "Neema Shirima",
      "+255 784 221 909",
      "neema.shirima@example.co.tz",
      "Tanzanian",
      "NBC Bonvoy · Silver",
      3,
    ),
    bookedOn: "2026-07-30",
    checkIn: "2026-08-14",
    checkOut: "2026-08-16",
    adults: 1,
    roomCategory: "Standard Double",
    bedType: "Queen bed",
    maxOccupancy: 2,
    assignedRoom: "104",
    nightlyRate: 260_000,
    status: "Checked-out",
    paymentStatus: "Paid",
    paymentChannel: "Card",
    paymentDetail: "Card — Visa ending 4021",
    transactionReference: "VISA-7742LQ09",
    services: [
      {
        id: "svc-48250-1",
        name: "Dinner — Lake Terrace",
        category: "Dining",
        date: "2026-08-15",
        time: "19:30",
        quantity: 1,
        price: 78_000,
        status: "Completed",
      },
    ],
  },
  {
    reference: "NBC-HRS-48261",
    guest: makeGuest(
      "g-peter",
      "Peter Sanga",
      "+255 786 550 114",
      "peter.sanga@example.co.tz",
      "Tanzanian",
      null,
      1,
    ),
    bookedOn: "2026-08-11",
    checkIn: "2026-08-17",
    checkOut: "2026-08-18",
    adults: 2,
    roomCategory: "Deluxe Garden",
    bedType: "King bed",
    maxOccupancy: 2,
    assignedRoom: null,
    nightlyRate: 410_000,
    status: "Cancelled",
    paymentStatus: "Refunded",
    paymentChannel: "Mobile Money",
    paymentDetail: "Mobile Money — Tigo Pesa",
    transactionReference: "TIGO-5521PP74",
    paidRatio: 0,
  },
  {
    reference: "NBC-HRS-48277",
    guest: makeGuest(
      "g-fatma",
      "Fatma Ally",
      "+255 713 664 202",
      "fatma.ally@example.co.tz",
      "Tanzanian",
      "NBC Bonvoy · Platinum",
      12,
    ),
    bookedOn: "2026-08-05",
    checkIn: "2026-08-17",
    checkOut: "2026-08-21",
    adults: 2,
    roomCategory: "Manyara Suite",
    bedType: "King bed",
    maxOccupancy: 3,
    assignedRoom: "302",
    nightlyRate: 630_000,
    status: "Confirmed",
    paymentStatus: "Paid",
    paymentChannel: "NBC Account",
    paymentDetail: "NBC Account — •••• 8841",
    transactionReference: "NBC-AC-118420",
    services: [
      {
        id: "svc-48277-1",
        name: "Airport Pickup",
        category: "Transportation",
        date: "2026-08-17",
        time: "13:15",
        quantity: 1,
        price: 85_000,
        status: "Confirmed",
      },
    ],
  },
  {
    reference: "NBC-HRS-48288",
    guest: makeGuest(
      "g-daniel",
      "Daniel Massawe",
      "+255 755 330 771",
      "daniel.massawe@example.co.tz",
      "Tanzanian",
      null,
      0,
    ),
    bookedOn: "2026-08-16",
    checkIn: "2026-08-18",
    checkOut: "2026-08-20",
    adults: 1,
    roomCategory: "Standard Double",
    bedType: "Queen bed",
    maxOccupancy: 2,
    assignedRoom: null,
    nightlyRate: 260_000,
    status: "Pending",
    paymentStatus: "Failed",
    paymentChannel: "Card",
    paymentDetail: "Card — authorisation declined",
    transactionReference: "VISA-5510FF31",
    paidRatio: 0,
  },
  {
    reference: "NBC-HRS-48294",
    guest: makeGuest(
      "g-lucy",
      "Lucy Mrema",
      "+255 762 118 004",
      "lucy.mrema@example.co.tz",
      "Tanzanian",
      "NBC Bonvoy · Gold",
      5,
    ),
    bookedOn: "2026-08-09",
    checkIn: "2026-08-15",
    checkOut: "2026-08-19",
    adults: 2,
    children: 2,
    rooms: 2,
    roomCategory: "Family Lake Suite",
    bedType: "King bed + two singles",
    maxOccupancy: 5,
    assignedRoom: "215 & 216",
    nightlyRate: 540_000,
    status: "Checked-in",
    paymentStatus: "Paid",
    paymentChannel: "Mobile Money",
    paymentDetail: "Mobile Money — Airtel Money",
    transactionReference: "AIRTEL-77120CQ",
    services: [
      {
        id: "svc-48294-1",
        name: "Room Service",
        category: "Room Services",
        date: "2026-08-16",
        time: "21:00",
        quantity: 2,
        price: 54_000,
        status: "Completed",
      },
      {
        id: "svc-48294-2",
        name: "Lake Manyara Game Drive",
        category: "Experiences",
        date: "2026-08-18",
        time: "06:00",
        quantity: 4,
        price: 640_000,
        status: "Requested",
      },
    ],
    requests: [
      {
        id: "req-48294-1",
        label: "Dietary request",
        detail: "One child is lactose intolerant.",
        status: "Acknowledged",
      },
    ],
  },
  {
    reference: "NBC-HRS-48301",
    guest: makeGuest(
      "g-hassan",
      "Hassan Juma",
      "+255 719 445 610",
      "hassan.juma@example.co.tz",
      "Tanzanian",
      null,
      1,
    ),
    bookedOn: "2026-08-12",
    checkIn: "2026-08-19",
    checkOut: "2026-08-22",
    adults: 1,
    roomCategory: "Deluxe Garden",
    bedType: "King bed",
    maxOccupancy: 2,
    assignedRoom: null,
    nightlyRate: 410_000,
    status: "Confirmed",
    paymentStatus: "Partially Paid",
    paymentChannel: "Mobile Money",
    paymentDetail: "Mobile Money — Halopesa",
    transactionReference: "HALO-4412RT88",
    paidRatio: 0.5,
  },
  {
    reference: "NBC-HRS-48315",
    guest: makeGuest(
      "g-sophia",
      "Sophia Meyer",
      "+49 151 2233 908",
      "sophia.meyer@example.de",
      "German",
      null,
      0,
    ),
    bookedOn: "2026-08-14",
    checkIn: "2026-08-20",
    checkOut: "2026-08-26",
    adults: 2,
    roomCategory: "Deluxe Lake View",
    bedType: "King bed",
    maxOccupancy: 3,
    assignedRoom: null,
    nightlyRate: 413_333,
    status: "Pending",
    paymentStatus: "Pending",
    paymentChannel: "Card",
    paymentDetail: "Card — pending 3-D Secure",
    transactionReference: null,
    paidRatio: 0,
    source: "NBC HRS Web",
    requests: [
      {
        id: "req-48315-1",
        label: "Accessibility requirement",
        detail: "Step-free access to room and restaurant.",
        status: "Pending",
      },
    ],
  },
  {
    reference: "NBC-HRS-48322",
    guest: makeGuest(
      "g-emmanuel",
      "Emmanuel Kessy",
      "+255 745 990 122",
      "e.kessy@example.co.tz",
      "Tanzanian",
      "NBC Bonvoy · Silver",
      4,
    ),
    bookedOn: "2026-07-18",
    checkIn: "2026-08-10",
    checkOut: "2026-08-13",
    adults: 2,
    roomCategory: "Standard Twin",
    bedType: "Two twin beds",
    maxOccupancy: 2,
    assignedRoom: "118",
    nightlyRate: 320_000,
    status: "Checked-out",
    paymentStatus: "Paid",
    paymentChannel: "Loyalty Points",
    paymentDetail: "Loyalty Points — 96,000 points redeemed",
    transactionReference: "LOY-2026-77410",
  },
  {
    reference: "NBC-HRS-48338",
    guest: makeGuest(
      "g-rehema",
      "Rehema Nyerere",
      "+255 788 221 340",
      "rehema.n@example.co.tz",
      "Tanzanian",
      null,
      2,
    ),
    bookedOn: "2026-08-06",
    checkIn: "2026-08-12",
    checkOut: "2026-08-14",
    adults: 1,
    roomCategory: "Standard Double",
    bedType: "Queen bed",
    maxOccupancy: 2,
    assignedRoom: null,
    nightlyRate: 260_000,
    status: "Cancelled",
    paymentStatus: "Refunded",
    paymentChannel: "NBC Account",
    paymentDetail: "NBC Account — refund settled",
    transactionReference: "NBC-AC-110992",
    paidRatio: 0,
  },
  {
    reference: "NBC-HRS-48347",
    guest: makeGuest(
      "g-baraka",
      "Baraka Lyimo",
      "+255 752 771 006",
      "baraka.lyimo@example.co.tz",
      "Tanzanian",
      "NBC Bonvoy · Gold",
      7,
    ),
    bookedOn: "2026-08-16",
    checkIn: "2026-08-17",
    checkOut: "2026-08-18",
    adults: 1,
    roomCategory: "Deluxe Garden",
    bedType: "King bed",
    maxOccupancy: 2,
    assignedRoom: "221",
    nightlyRate: 410_000,
    status: "Confirmed",
    paymentStatus: "Paid",
    paymentChannel: "Mobile Money",
    paymentDetail: "Mobile Money — M-Pesa",
    transactionReference: "MPESA-6621LK004",
  },
  {
    reference: "NBC-HRS-48359",
    guest: makeGuest(
      "g-zawadi",
      "Zawadi Komba",
      "+255 713 004 552",
      "zawadi.komba@example.co.tz",
      "Tanzanian",
      null,
      0,
    ),
    bookedOn: "2026-08-16",
    checkIn: "2026-08-21",
    checkOut: "2026-08-24",
    adults: 2,
    roomCategory: "Deluxe Lake View",
    bedType: "King bed",
    maxOccupancy: 3,
    assignedRoom: null,
    nightlyRate: 413_333,
    status: "Pending",
    paymentStatus: "Pending",
    paymentChannel: "Control Number",
    paymentDetail: "Control Number — issued, unpaid",
    transactionReference: "CN-771200448120",
    paidRatio: 0,
  },
  {
    reference: "NBC-HRS-48364",
    guest: makeGuest(
      "g-john",
      "John Kileo",
      "+255 758 220 887",
      "john.kileo@example.co.tz",
      "Tanzanian",
      "NBC Bonvoy · Platinum",
      15,
    ),
    bookedOn: "2026-08-01",
    checkIn: "2026-08-16",
    checkOut: "2026-08-20",
    adults: 2,
    roomCategory: "Manyara Suite",
    bedType: "King bed",
    maxOccupancy: 3,
    assignedRoom: "301",
    nightlyRate: 630_000,
    status: "Checked-in",
    paymentStatus: "Partially Paid",
    paymentChannel: "NBC Account",
    paymentDetail: "NBC Account — balance on departure",
    transactionReference: "NBC-AC-120774",
    paidRatio: 0.6,
    services: [
      {
        id: "svc-48364-1",
        name: "Private Dining",
        category: "Dining",
        date: "2026-08-18",
        time: "20:00",
        quantity: 2,
        price: 320_000,
        status: "Confirmed",
      },
    ],
    notes: [
      {
        id: "note-48364-1",
        body: "Guest arriving late from Arusha — hold room until 23:00.",
        author: "Front Desk",
        at: "2026-08-16 15:40",
      },
    ],
  },
  {
    reference: "NBC-HRS-48371",
    guest: makeGuest(
      "g-mariam",
      "Mariam Said",
      "+255 786 112 447",
      "mariam.said@example.co.tz",
      "Tanzanian",
      null,
      1,
    ),
    bookedOn: "2026-08-13",
    checkIn: "2026-08-23",
    checkOut: "2026-08-27",
    adults: 2,
    children: 1,
    roomCategory: "Family Lake Suite",
    bedType: "King bed + single",
    maxOccupancy: 4,
    assignedRoom: null,
    nightlyRate: 540_000,
    status: "Confirmed",
    paymentStatus: "Partially Paid",
    paymentChannel: "Mobile Money",
    paymentDetail: "Mobile Money — Tigo Pesa",
    transactionReference: "TIGO-9021BB40",
    paidRatio: 0.3,
  },
  {
    reference: "NBC-HRS-48380",
    guest: makeGuest(
      "g-elias",
      "Elias Ndosi",
      "+255 767 330 010",
      "elias.ndosi@example.co.tz",
      "Tanzanian",
      null,
      3,
    ),
    bookedOn: "2026-07-28",
    checkIn: "2026-08-08",
    checkOut: "2026-08-11",
    adults: 1,
    roomCategory: "Standard Twin",
    bedType: "Two twin beds",
    maxOccupancy: 2,
    assignedRoom: "109",
    nightlyRate: 320_000,
    status: "Checked-out",
    paymentStatus: "Paid",
    paymentChannel: "Card",
    paymentDetail: "Card — Mastercard ending 7719",
    transactionReference: "MC-3391VV22",
  },
  {
    reference: "NBC-HRS-48392",
    guest: makeGuest(
      "g-aisha",
      "Aisha Mohamed",
      "+255 719 887 331",
      "aisha.mohamed@example.co.tz",
      "Tanzanian",
      "NBC Bonvoy · Silver",
      2,
    ),
    bookedOn: "2026-08-17",
    checkIn: "2026-08-25",
    checkOut: "2026-08-28",
    adults: 2,
    roomCategory: "Deluxe Garden",
    bedType: "King bed",
    maxOccupancy: 2,
    assignedRoom: null,
    nightlyRate: 410_000,
    status: "Pending",
    paymentStatus: "Pending",
    paymentChannel: "Mobile Money",
    paymentDetail: "Mobile Money — USSD push sent",
    transactionReference: null,
    paidRatio: 0,
  },
];

function buildPayments(
  reference: string,
  seed: Seed,
  total: number,
  paid: number,
): PaymentActivityEntry[] {
  if (paid <= 0) {
    if (seed.paymentStatus === "Refunded") {
      return [
        {
          id: `${reference}-p1`,
          date: seed.bookedOn,
          amount: Math.round(total * 0.3),
          channel: seed.paymentChannel,
          detail: seed.paymentDetail,
          reference: seed.transactionReference ?? "—",
          status: "Paid",
        },
        {
          id: `${reference}-p2`,
          date: seed.checkIn,
          amount: Math.round(total * 0.3),
          channel: seed.paymentChannel,
          detail: "Cancellation refund",
          reference: `${seed.transactionReference ?? "REF"}-RF`,
          status: "Refunded",
        },
      ];
    }
    return [
      {
        id: `${reference}-p1`,
        date: seed.bookedOn,
        amount: total,
        channel: seed.paymentChannel,
        detail: seed.paymentDetail,
        reference: seed.transactionReference ?? "—",
        status: seed.paymentStatus,
      },
    ];
  }

  return [
    {
      id: `${reference}-p1`,
      date: seed.bookedOn,
      amount: paid,
      channel: seed.paymentChannel,
      detail: seed.paymentDetail,
      reference: seed.transactionReference ?? "—",
      status: seed.paymentStatus === "Paid" ? "Paid" : "Partially Paid",
    },
  ];
}

function buildActivity(seed: Seed, reference: string): ReservationEvent[] {
  const events: ReservationEvent[] = [
    {
      id: `${reference}-a1`,
      label: "Reservation created",
      at: `${formatFullDate(seed.bookedOn)} · 09:12`,
      actor: "NBC HRS Web",
      icon: CalendarPlus,
    },
  ];

  if (seed.status !== "Pending" && seed.status !== "Cancelled") {
    events.push({
      id: `${reference}-a2`,
      label: "Reservation confirmed",
      at: `${formatFullDate(seed.bookedOn)} · 09:40`,
      actor: "Reservations Desk",
      icon: CheckCircle2,
    });
  }

  if (seed.paidRatio === undefined || seed.paidRatio > 0) {
    events.push({
      id: `${reference}-a3`,
      label: "Payment received",
      at: `${formatFullDate(seed.bookedOn)} · 10:02`,
      actor: seed.paymentDetail,
      icon: CreditCard,
    });
  }

  if (seed.assignedRoom) {
    events.push({
      id: `${reference}-a4`,
      label: `Room ${seed.assignedRoom} assigned`,
      at: `${formatFullDate(seed.checkIn)} · 11:15`,
      actor: "Front Desk",
      icon: BedDouble,
    });
  }

  (seed.services ?? []).forEach((service, index) => {
    events.push({
      id: `${reference}-s${index}`,
      label: `${service.name} ${service.status.toLowerCase()}`,
      at: `${formatFullDate(service.date)}${service.time ? ` · ${service.time}` : ""}`,
      actor: service.category,
      icon: ConciergeBell,
    });
  });

  if (seed.status === "Checked-in" || seed.status === "Checked-out") {
    events.push({
      id: `${reference}-a5`,
      label: "Guest checked in",
      at: `${formatFullDate(seed.checkIn)} · 14:20`,
      actor: "Front Desk",
      icon: LogIn,
    });
  }

  if (seed.status === "Checked-out") {
    events.push({
      id: `${reference}-a6`,
      label: "Guest checked out",
      at: `${formatFullDate(seed.checkOut)} · 10:35`,
      actor: "Front Desk",
      icon: LogOut,
    });
  }

  if (seed.status === "Cancelled") {
    events.push({
      id: `${reference}-a7`,
      label: "Reservation cancelled",
      at: `${formatFullDate(seed.checkIn)} · 08:05`,
      actor: "Reservations Desk",
      icon: XCircle,
    });
  }

  return events;
}

export const hotelReservations: HotelReservation[] = seeds.map((seed) => {
  const nights = nightsBetween(seed.checkIn, seed.checkOut);
  const rooms = seed.rooms ?? 1;
  const total = seed.nightlyRate * nights * rooms;
  const ratio = seed.paidRatio ?? (seed.paymentStatus === "Paid" ? 1 : 0);
  const amountPaid = Math.round(total * ratio);

  return {
    reference: seed.reference,
    hotelName: hotelProperty.name,
    guest: seed.guest,
    bookedOn: seed.bookedOn,
    checkIn: seed.checkIn,
    checkOut: seed.checkOut,
    nights,
    adults: seed.adults,
    children: seed.children ?? 0,
    rooms,
    roomCategory: seed.roomCategory,
    bedType: seed.bedType,
    maxOccupancy: seed.maxOccupancy,
    assignedRoom: seed.assignedRoom,
    nightlyRate: seed.nightlyRate,
    total,
    amountPaid,
    paymentStatus: seed.paymentStatus,
    paymentChannel: seed.paymentChannel,
    paymentDetail: seed.paymentDetail,
    transactionReference: seed.transactionReference,
    status: seed.status,
    source: seed.source ?? "NBC HRS Web",
    roomRequirements: seed.roomRequirements ?? null,
    services: seed.services ?? [],
    requests: seed.requests ?? [],
    notes: seed.notes ?? [],
    payments: buildPayments(seed.reference, seed, total, amountPaid),
    activity: buildActivity(seed, seed.reference),
  } satisfies HotelReservation;
});

export function findHotelReservation(reference: string): HotelReservation | undefined {
  return hotelReservations.find((reservation) => reservation.reference === reference);
}

export const roomCategories = Array.from(
  new Set(hotelReservations.map((reservation) => reservation.roomCategory)),
).sort();

export const bookingSources = Array.from(
  new Set(hotelReservations.map((reservation) => reservation.source)),
).sort();

/* ------------------------------------------------------------ state model */

export interface ReservationAction {
  label: string;
  intent: "primary" | "secondary";
}

/** State-aware operational actions — invalid transitions are never offered. */
export function actionsFor(reservation: HotelReservation): ReservationAction[] {
  switch (reservation.status) {
    case "Pending":
      return [
        { label: "Confirm Reservation", intent: "primary" },
        { label: "Modify", intent: "secondary" },
        { label: "Cancel", intent: "secondary" },
      ];
    case "Confirmed":
      return [
        { label: "Check In", intent: "primary" },
        ...(reservation.assignedRoom
          ? []
          : [{ label: "Assign Room", intent: "secondary" as const }]),
        { label: "Modify", intent: "secondary" },
        { label: "Add Service", intent: "secondary" },
        { label: "Cancel", intent: "secondary" },
      ];
    case "Checked-in":
      return [
        { label: "Check Out", intent: "primary" },
        { label: "Add Service", intent: "secondary" },
        { label: "Record Payment", intent: "secondary" },
        { label: "Contact Guest", intent: "secondary" },
      ];
    case "Checked-out":
      return [
        { label: "Download Receipt", intent: "secondary" },
        { label: "View Guest", intent: "secondary" },
      ];
    case "Cancelled":
    default:
      return [];
  }
}

/** Compact row action shown in the reservations table. */
export function primaryRowAction(reservation: HotelReservation): string | null {
  switch (reservation.status) {
    case "Pending":
      return "Confirm";
    case "Confirmed":
      return reservation.assignedRoom ? "Check In" : "Assign Room";
    case "Checked-in":
      return "Check Out";
    default:
      return null;
  }
}

export type JourneyState = "done" | "current" | "todo" | "cancelled";

export interface JourneyStage {
  key: string;
  label: string;
  state: JourneyState;
}

/** Booked → Confirmed → Checked-in → Checked-out, with a cancelled variant. */
export function journeyFor(reservation: HotelReservation): JourneyStage[] {
  const order: HotelReservationStatus[] = ["Pending", "Confirmed", "Checked-in", "Checked-out"];
  const labels = ["Booked", "Confirmed", "Checked-in", "Checked-out"];

  if (reservation.status === "Cancelled") {
    return [
      { key: "booked", label: "Booked", state: "done" },
      { key: "cancelled", label: "Cancelled", state: "cancelled" },
    ];
  }

  const index = order.indexOf(reservation.status);
  return order.map((key, position) => ({
    key,
    label: labels[position],
    state: position < index ? "done" : position === index ? "current" : "todo",
  }));
}

export const todayIso = today;

/** Default search state for the reservations list — used by links into the module. */
export const defaultReservationsSearch = {
  q: "",
  status: "All",
  payment: "All",
  room: "All",
  source: "All",
  from: "",
  to: "",
  sort: "newest",
  page: 1,
};
