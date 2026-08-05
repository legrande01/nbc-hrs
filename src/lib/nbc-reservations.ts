import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck,
  ClipboardCheck,
  DoorOpen,
  Flag,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  Car,
  Flower2,
  Compass,
  BedDouble,
  PartyPopper,
} from "lucide-react";

import destArusha from "@/assets/dest-arusha.jpg";
import destDar from "@/assets/dest-dar.jpg";
import destZanzibar from "@/assets/dest-zanzibar.jpg";
import hotel1 from "@/assets/hotel-1.jpg";
import hotel2 from "@/assets/hotel-2.jpg";
import hotel3 from "@/assets/hotel-3.jpg";
import propFacilities from "@/assets/prop-facilities.jpg";
import propLobby from "@/assets/prop-lobby.jpg";
import propRestaurant from "@/assets/prop-restaurant.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuite from "@/assets/room-suite.jpg";

/**
 * Demo data for the customer Reservation Management module.
 * Shapes mirror the future reservation API so the UI stays unchanged when live
 * services replace this module.
 */

export type ReservationStatus =
  | "upcoming"
  | "pending-payment"
  | "checked-in"
  | "completed"
  | "cancelled";

export const reservationStatusLabels: Record<ReservationStatus, string> = {
  upcoming: "Upcoming",
  "pending-payment": "Pending Payment",
  "checked-in": "Checked In",
  completed: "Completed",
  cancelled: "Cancelled",
};

export type PaymentStatus = "paid" | "partially-paid" | "unpaid" | "refunded";

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  paid: "Paid in full",
  "partially-paid": "Partially paid",
  unpaid: "Awaiting payment",
  refunded: "Refunded",
};

export interface ReservationContact {
  reception: string;
  reservationsDesk: string;
  email: string;
  whatsapp: string | null;
}

export interface ReservationPolicy {
  title: string;
  body: string;
}

export type SpecialRequestStatus = "pending" | "approved" | "declined";

export interface SpecialRequest {
  id: string;
  label: string;
  detail: string;
  status: SpecialRequestStatus;
}

export type AddedServiceStatus =
  | "requested"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface AddedService {
  id: string;
  serviceId: string;
  name: string;
  image: string;
  date: string;
  time: string;
  price: number;
  status: AddedServiceStatus;
}

export interface Reservation {
  reference: string;
  hotelId: string;
  hotelName: string;
  image: string;
  destination: string;
  address: string;
  phone: string;
  email: string;
  mapsQuery: string;
  status: ReservationStatus;
  bookedOn: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  roomCategory: string;
  roomNumber: string | null;
  specialRequestsSummary: string;
  paymentStatus: PaymentStatus;
  total: number;
  amountPaid: number;
  paymentMethod: string;
  transactionReference: string;
  contact: ReservationContact;
  policies: ReservationPolicy[];
  specialRequests: SpecialRequest[];
  addedServices: AddedService[];
}

const standardPolicies: ReservationPolicy[] = [
  {
    title: "Cancellation Policy",
    body: "Free cancellation up to 48 hours before check-in. Cancellations within 48 hours are charged the first night. No-shows are charged the full stay.",
  },
  {
    title: "Check-in & Check-out",
    body: "Check-in from 14:00 and check-out by 11:00. Early check-in and late checkout are subject to availability and may carry a fee.",
  },
  {
    title: "Smoking Policy",
    body: "All rooms and indoor areas are non-smoking. Designated smoking terraces are available. A cleaning fee applies to smoking in the room.",
  },
  {
    title: "Children Policy",
    body: "Children of all ages are welcome. Under 6 stay free when sharing existing bedding. Cots are available on request.",
  },
  {
    title: "Pets Policy",
    body: "Assistance animals are always welcome. Other pets are not permitted in guest rooms or dining areas.",
  },
  {
    title: "Damage Policy",
    body: "A refundable incidentals hold may be placed at check-in. Guests are responsible for damage beyond normal wear.",
  },
];

export const reservations: Reservation[] = [
  {
    reference: "NBC-HRS-48210",
    hotelId: "harbour-house",
    hotelName: "The Harbour House",
    image: hotel2,
    destination: "Dar es Salaam",
    address: "Chole Road, Masaki, Dar es Salaam",
    phone: "+255 22 260 1180",
    email: "stay@harbourhouse.co.tz",
    mapsQuery: "The Harbour House, Masaki, Dar es Salaam",
    status: "upcoming",
    bookedOn: "2026-07-24",
    checkIn: "2026-08-16",
    checkOut: "2026-08-19",
    guests: 2,
    rooms: 1,
    roomCategory: "Deluxe Ocean View",
    roomNumber: null,
    specialRequestsSummary: "High floor, late arrival around 22:00",
    paymentStatus: "paid",
    total: 1_240_000,
    amountPaid: 1_240_000,
    paymentMethod: "Mobile Money · M-Pesa •••• 7412",
    transactionReference: "MPESA-9F42XK118",
    contact: {
      reception: "+255 22 260 1180",
      reservationsDesk: "+255 22 260 1185",
      email: "stay@harbourhouse.co.tz",
      whatsapp: "+255 754 118 220",
    },
    policies: standardPolicies,
    specialRequests: [
      {
        id: "sr-1",
        label: "Late Arrival",
        detail: "Arriving after 22:00 from flight KL569.",
        status: "approved",
      },
      {
        id: "sr-2",
        label: "Extra Pillows",
        detail: "Two additional soft pillows.",
        status: "pending",
      },
    ],
    addedServices: [
      {
        id: "as-1",
        serviceId: "airport-pickup",
        name: "Airport Pickup",
        image: destDar,
        date: "2026-08-16",
        time: "21:30",
        price: 85_000,
        status: "confirmed",
      },
    ],
  },
  {
    reference: "NBC-HRS-47155",
    hotelId: "zanzibar-pearl",
    hotelName: "Zanzibar Pearl Resort",
    image: destZanzibar,
    destination: "Zanzibar",
    address: "Nungwi Beach Road, Zanzibar",
    phone: "+255 24 223 3100",
    email: "reservations@zanzibarpearl.co.tz",
    mapsQuery: "Nungwi Beach, Zanzibar",
    status: "pending-payment",
    bookedOn: "2026-08-01",
    checkIn: "2026-09-04",
    checkOut: "2026-09-08",
    guests: 3,
    rooms: 2,
    roomCategory: "Family Beach Suite",
    roomNumber: null,
    specialRequestsSummary: "Connecting rooms if possible",
    paymentStatus: "partially-paid",
    total: 2_180_000,
    amountPaid: 654_000,
    paymentMethod: "Control Number · 991 204 887 314",
    transactionReference: "CN-991204887314",
    contact: {
      reception: "+255 24 223 3100",
      reservationsDesk: "+255 24 223 3102",
      email: "reservations@zanzibarpearl.co.tz",
      whatsapp: null,
    },
    policies: standardPolicies,
    specialRequests: [
      {
        id: "sr-3",
        label: "Baby Cot",
        detail: "One cot for a 9 month old.",
        status: "approved",
      },
      {
        id: "sr-4",
        label: "Dietary Requirements",
        detail: "One guest is gluten intolerant.",
        status: "pending",
      },
    ],
    addedServices: [],
  },
  {
    reference: "NBC-HRS-46022",
    hotelId: "kilimanjaro-view",
    hotelName: "Kilimanjaro View Lodge",
    image: destArusha,
    destination: "Arusha",
    address: "Njiro Hill, Arusha",
    phone: "+255 27 254 4400",
    email: "frontdesk@kiliviewlodge.co.tz",
    mapsQuery: "Njiro Hill, Arusha",
    status: "checked-in",
    bookedOn: "2026-07-02",
    checkIn: "2026-08-03",
    checkOut: "2026-08-07",
    guests: 2,
    rooms: 1,
    roomCategory: "Mountain Suite",
    roomNumber: "412",
    specialRequestsSummary: "Quiet room away from the lift",
    paymentStatus: "paid",
    total: 1_560_000,
    amountPaid: 1_560_000,
    paymentMethod: "Card · Visa •••• 4021",
    transactionReference: "VISA-7742LQ09",
    contact: {
      reception: "+255 27 254 4400",
      reservationsDesk: "+255 27 254 4405",
      email: "frontdesk@kiliviewlodge.co.tz",
      whatsapp: "+255 767 400 118",
    },
    policies: standardPolicies,
    specialRequests: [
      {
        id: "sr-5",
        label: "Wheelchair Access",
        detail: "Ground floor access to the restaurant.",
        status: "approved",
      },
    ],
    addedServices: [
      {
        id: "as-2",
        serviceId: "safari",
        name: "Safari Day Trip",
        image: destArusha,
        date: "2026-08-05",
        time: "06:00",
        price: 420_000,
        status: "confirmed",
      },
      {
        id: "as-3",
        serviceId: "massage",
        name: "Signature Massage",
        image: propFacilities,
        date: "2026-08-06",
        time: "17:00",
        price: 120_000,
        status: "requested",
      },
    ],
  },
  {
    reference: "NBC-HRS-44980",
    hotelId: "serena-manyara",
    hotelName: "Serena Lake Manyara",
    image: hotel1,
    destination: "Manyara",
    address: "Lake Manyara National Park, Manyara",
    phone: "+255 27 253 9000",
    email: "hello@serenamanyara.co.tz",
    mapsQuery: "Lake Manyara National Park",
    status: "completed",
    bookedOn: "2026-06-18",
    checkIn: "2026-07-18",
    checkOut: "2026-07-21",
    guests: 2,
    rooms: 1,
    roomCategory: "Escarpment Room",
    roomNumber: "208",
    specialRequestsSummary: "Anniversary stay",
    paymentStatus: "paid",
    total: 1_980_000,
    amountPaid: 1_980_000,
    paymentMethod: "Mobile Money · Tigo Pesa •••• 3388",
    transactionReference: "TIGO-5521PP74",
    contact: {
      reception: "+255 27 253 9000",
      reservationsDesk: "+255 27 253 9004",
      email: "hello@serenamanyara.co.tz",
      whatsapp: "+255 786 900 400",
    },
    policies: standardPolicies,
    specialRequests: [],
    addedServices: [
      {
        id: "as-4",
        serviceId: "anniversary-setup",
        name: "Anniversary Setup",
        image: roomSuite,
        date: "2026-07-19",
        time: "18:00",
        price: 180_000,
        status: "completed",
      },
    ],
  },
  {
    reference: "NBC-HRS-43117",
    hotelId: "dodoma-capital",
    hotelName: "Dodoma Capital Hotel",
    image: hotel3,
    destination: "Dodoma",
    address: "Kikuyu Avenue, Dodoma",
    phone: "+255 26 232 1100",
    email: "stay@dodomacapital.co.tz",
    mapsQuery: "Kikuyu Avenue, Dodoma",
    status: "cancelled",
    bookedOn: "2026-05-11",
    checkIn: "2026-06-02",
    checkOut: "2026-06-04",
    guests: 1,
    rooms: 1,
    roomCategory: "Executive Room",
    roomNumber: null,
    specialRequestsSummary: "None",
    paymentStatus: "refunded",
    total: 480_000,
    amountPaid: 0,
    paymentMethod: "Card · Mastercard •••• 8890",
    transactionReference: "MC-3320RF55",
    contact: {
      reception: "+255 26 232 1100",
      reservationsDesk: "+255 26 232 1104",
      email: "stay@dodomacapital.co.tz",
      whatsapp: null,
    },
    policies: standardPolicies,
    specialRequests: [],
    addedServices: [],
  },
];

export function findReservationByReference(reference: string): Reservation | undefined {
  return reservations.find(
    (reservation) => reservation.reference.toLowerCase() === reference.toLowerCase(),
  );
}

/* ------------------------------------------------------------------ */
/* Reservation timeline                                                */
/* ------------------------------------------------------------------ */

export type TimelineStageKey = "booked" | "confirmed" | "upcoming" | "checked-in" | "completed";

export interface TimelineStage {
  key: TimelineStageKey;
  label: string;
  icon: LucideIcon;
  state: "done" | "current" | "todo";
}

const stageOrder: { key: TimelineStageKey; label: string; icon: LucideIcon }[] = [
  { key: "booked", label: "Booked", icon: ClipboardCheck },
  { key: "confirmed", label: "Confirmed", icon: ShieldCheck },
  { key: "upcoming", label: "Upcoming", icon: CalendarCheck },
  { key: "checked-in", label: "Checked In", icon: DoorOpen },
  { key: "completed", label: "Completed", icon: Flag },
];

/** Only the stages that apply to the reservation's current status. */
export function timelineFor(reservation: Reservation): TimelineStage[] {
  if (reservation.status === "cancelled") {
    return [
      { ...stageOrder[0], state: "done" },
      { key: "confirmed", label: "Cancelled", icon: Flag, state: "current" },
    ];
  }

  const reachedIndex: Record<Exclude<ReservationStatus, "cancelled">, number> = {
    "pending-payment": 0,
    upcoming: 2,
    "checked-in": 3,
    completed: 4,
  };

  const reached = reachedIndex[reservation.status as Exclude<ReservationStatus, "cancelled">];
  const visible = stageOrder.slice(0, Math.max(reached + 2, 2)).slice(0, stageOrder.length);

  return visible.map((stage, index) => ({
    ...stage,
    state: index < reached ? "done" : index === reached ? "current" : "todo",
  }));
}

/* ------------------------------------------------------------------ */
/* Hotel services & experiences                                        */
/* ------------------------------------------------------------------ */

export type ServiceCategoryKey =
  | "dining"
  | "transportation"
  | "wellness"
  | "experiences"
  | "room-services"
  | "celebration";

export type ServiceAvailability = "available" | "limited" | "on-request";

export const serviceAvailabilityLabels: Record<ServiceAvailability, string> = {
  available: "Available",
  limited: "Limited slots",
  "on-request": "On request",
};

export type ServiceInputKey =
  | "date"
  | "time"
  | "passengers"
  | "flightNumber"
  | "quantity"
  | "notes";

export interface HotelService {
  id: string;
  category: ServiceCategoryKey;
  name: string;
  description: string;
  longDescription: string;
  includes: string[];
  duration: string;
  price: number;
  priceUnit: string;
  terms: string;
  availability: ServiceAvailability;
  image: string;
  inputs: ServiceInputKey[];
}

export const serviceCategories: {
  key: ServiceCategoryKey;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "dining", label: "Dining", icon: UtensilsCrossed },
  { key: "transportation", label: "Transportation", icon: Car },
  { key: "wellness", label: "Wellness", icon: Flower2 },
  { key: "experiences", label: "Experiences", icon: Compass },
  { key: "room-services", label: "Room Services", icon: BedDouble },
  { key: "celebration", label: "Celebration", icon: PartyPopper },
];

const baseTerms =
  "Requests are confirmed by the hotel within 24 hours. Charges are settled at the property and can be cancelled free of charge up to 12 hours before the scheduled time.";

export const hotelServices: HotelService[] = [
  // Dining
  {
    id: "breakfast",
    category: "dining",
    name: "Breakfast",
    description: "Full à la carte and buffet breakfast served in the main restaurant.",
    longDescription:
      "Start the day with a generous buffet of tropical fruit, freshly baked pastries and hot dishes prepared to order, plus barista coffee.",
    includes: ["Buffet and à la carte menu", "Barista coffee and juices", "Served 06:30 – 10:30"],
    duration: "90 minutes",
    price: 35_000,
    priceUnit: "per guest",
    terms: baseTerms,
    availability: "available",
    image: propRestaurant,
    inputs: ["date", "time", "quantity", "notes"],
  },
  {
    id: "lunch",
    category: "dining",
    name: "Lunch",
    description: "Coastal-inspired lunch menu served poolside or in the restaurant.",
    longDescription:
      "A relaxed midday menu of grilled seafood, salads and Tanzanian classics, served wherever you are most comfortable.",
    includes: ["Two courses", "Soft drink or juice", "Poolside or restaurant seating"],
    duration: "60 minutes",
    price: 55_000,
    priceUnit: "per guest",
    terms: baseTerms,
    availability: "available",
    image: propRestaurant,
    inputs: ["date", "time", "quantity", "notes"],
  },
  {
    id: "dinner",
    category: "dining",
    name: "Dinner",
    description: "Three-course chef's dinner with a nightly changing menu.",
    longDescription:
      "An evening menu built around the day's market catch and produce, paired with a curated wine and mocktail list.",
    includes: ["Three courses", "Chef's amuse-bouche", "Served 18:30 – 22:30"],
    duration: "2 hours",
    price: 90_000,
    priceUnit: "per guest",
    terms: baseTerms,
    availability: "limited",
    image: propRestaurant,
    inputs: ["date", "time", "quantity", "notes"],
  },
  {
    id: "room-service",
    category: "dining",
    name: "Room Service",
    description: "In-room dining available around the clock.",
    longDescription:
      "The full menu delivered to your room, plus a late-night selection between 23:00 and 06:00.",
    includes: ["24 hour menu", "Table setup in room", "Service charge included"],
    duration: "Within 45 minutes",
    price: 25_000,
    priceUnit: "service fee",
    terms: baseTerms,
    availability: "available",
    image: roomDeluxe,
    inputs: ["date", "time", "notes"],
  },
  {
    id: "private-dining",
    category: "dining",
    name: "Private Dining",
    description: "A dedicated table on the terrace with a personal server.",
    longDescription:
      "A private setting for a celebration or quiet evening, with a bespoke menu agreed with the chef in advance.",
    includes: ["Private table setup", "Dedicated server", "Bespoke menu"],
    duration: "3 hours",
    price: 380_000,
    priceUnit: "per booking",
    terms: baseTerms,
    availability: "on-request",
    image: propLobby,
    inputs: ["date", "time", "quantity", "notes"],
  },

  // Transportation
  {
    id: "airport-pickup",
    category: "transportation",
    name: "Airport Pickup",
    description: "Meet and greet on arrival with a private transfer to the hotel.",
    longDescription:
      "A driver meets you in the arrivals hall with a name board and escorts you to an air-conditioned vehicle. Flights are monitored for delays.",
    includes: ["Meet and greet", "Flight monitoring", "Bottled water and Wi-Fi on board"],
    duration: "45 minutes",
    price: 85_000,
    priceUnit: "per vehicle",
    terms: baseTerms,
    availability: "available",
    image: destDar,
    inputs: ["date", "time", "passengers", "flightNumber", "notes"],
  },
  {
    id: "airport-dropoff",
    category: "transportation",
    name: "Airport Drop-off",
    description: "Private transfer from the hotel to the airport.",
    longDescription:
      "Departure transfer timed to your flight, with luggage assistance from the lobby to the terminal.",
    includes: ["Private vehicle", "Luggage assistance", "Departure timing advice"],
    duration: "45 minutes",
    price: 80_000,
    priceUnit: "per vehicle",
    terms: baseTerms,
    availability: "available",
    image: destDar,
    inputs: ["date", "time", "passengers", "flightNumber", "notes"],
  },
  {
    id: "private-driver",
    category: "transportation",
    name: "Private Driver",
    description: "A car and driver at your disposal for the day.",
    longDescription:
      "A professional driver and vehicle for meetings, shopping or sightseeing, charged by the day with fuel included.",
    includes: ["Vehicle and driver", "Fuel included", "Up to 10 hours"],
    duration: "Full day",
    price: 260_000,
    priceUnit: "per day",
    terms: baseTerms,
    availability: "limited",
    image: destDar,
    inputs: ["date", "time", "passengers", "notes"],
  },

  // Wellness
  {
    id: "spa",
    category: "wellness",
    name: "Spa Journey",
    description: "A signature spa ritual using locally sourced botanicals.",
    longDescription:
      "A full ritual combining a body scrub, wrap and scalp treatment, finished with tea on the relaxation deck.",
    includes: ["Body scrub and wrap", "Scalp treatment", "Relaxation deck access"],
    duration: "2 hours",
    price: 240_000,
    priceUnit: "per guest",
    terms: baseTerms,
    availability: "limited",
    image: propFacilities,
    inputs: ["date", "time", "quantity", "notes"],
  },
  {
    id: "massage",
    category: "wellness",
    name: "Signature Massage",
    description: "Deep tissue or aromatherapy massage in the spa or in your room.",
    longDescription:
      "Choose the pressure and oils you prefer; therapists can attend in the spa suite or set up in your room.",
    includes: ["60 minute treatment", "Choice of oils", "In-room option"],
    duration: "60 minutes",
    price: 120_000,
    priceUnit: "per guest",
    terms: baseTerms,
    availability: "available",
    image: propFacilities,
    inputs: ["date", "time", "quantity", "notes"],
  },
  {
    id: "sauna",
    category: "wellness",
    name: "Private Sauna",
    description: "Exclusive use of the sauna and steam suite.",
    longDescription:
      "The thermal suite reserved for you alone, with cold plunge, herbal infusions and towels provided.",
    includes: ["Private thermal suite", "Herbal infusions", "Towels and robes"],
    duration: "45 minutes",
    price: 70_000,
    priceUnit: "per session",
    terms: baseTerms,
    availability: "available",
    image: propFacilities,
    inputs: ["date", "time", "notes"],
  },
  {
    id: "gym",
    category: "wellness",
    name: "Personal Training",
    description: "One-to-one session with a resident trainer.",
    longDescription:
      "A tailored session in the fitness centre or a sunrise run along the shoreline with a trainer.",
    includes: ["Certified trainer", "Programme plan", "Towel and water"],
    duration: "50 minutes",
    price: 95_000,
    priceUnit: "per session",
    terms: baseTerms,
    availability: "on-request",
    image: propFacilities,
    inputs: ["date", "time", "notes"],
  },

  // Experiences
  {
    id: "city-tour",
    category: "experiences",
    name: "City Tour",
    description: "Guided half-day tour of the city's landmarks and markets.",
    longDescription:
      "A local guide leads you through the old quarter, the fish market and the craft district, with stops for street food.",
    includes: ["Local guide", "Entrance fees", "Bottled water"],
    duration: "4 hours",
    price: 180_000,
    priceUnit: "per guest",
    terms: baseTerms,
    availability: "available",
    image: destDar,
    inputs: ["date", "time", "passengers", "notes"],
  },
  {
    id: "safari",
    category: "experiences",
    name: "Safari Day Trip",
    description: "Full-day game drive with a private guide and packed lunch.",
    longDescription:
      "An early departure to the reserve in a 4x4 with a pop-up roof, returning at dusk. Park fees and lunch included.",
    includes: ["Private 4x4 and guide", "Park fees", "Packed lunch"],
    duration: "Full day",
    price: 420_000,
    priceUnit: "per guest",
    terms: baseTerms,
    availability: "limited",
    image: destArusha,
    inputs: ["date", "time", "passengers", "notes"],
  },
  {
    id: "boat-cruise",
    category: "experiences",
    name: "Sunset Boat Cruise",
    description: "Dhow cruise along the coast with canapés at sunset.",
    longDescription:
      "A traditional dhow sails the bay as the sun drops, with canapés, soft drinks and a small crew on board.",
    includes: ["Dhow charter", "Canapés and drinks", "Life jackets"],
    duration: "2 hours",
    price: 210_000,
    priceUnit: "per guest",
    terms: baseTerms,
    availability: "available",
    image: destZanzibar,
    inputs: ["date", "time", "passengers", "notes"],
  },
  {
    id: "cultural-tour",
    category: "experiences",
    name: "Cultural Tour",
    description: "Village visit with craft workshops and a home-cooked meal.",
    longDescription:
      "Spend an afternoon with a local family, learning weaving or cooking techniques and sharing a meal together.",
    includes: ["Community guide", "Workshop materials", "Home-cooked meal"],
    duration: "5 hours",
    price: 160_000,
    priceUnit: "per guest",
    terms: baseTerms,
    availability: "on-request",
    image: destArusha,
    inputs: ["date", "time", "passengers", "notes"],
  },

  // Room services
  {
    id: "early-check-in",
    category: "room-services",
    name: "Early Check-in",
    description: "Access your room from 09:00 instead of 14:00.",
    longDescription:
      "Guaranteed early access to your room so you can settle in and freshen up after an overnight arrival.",
    includes: ["Room from 09:00", "Luggage handling", "Breakfast access"],
    duration: "One-off",
    price: 90_000,
    priceUnit: "per stay",
    terms: baseTerms,
    availability: "limited",
    image: roomDeluxe,
    inputs: ["date", "time", "notes"],
  },
  {
    id: "late-checkout",
    category: "room-services",
    name: "Late Checkout",
    description: "Keep your room until 18:00 on departure day.",
    longDescription:
      "Extended access to your room and the facilities on the day you leave, ideal for evening flights.",
    includes: ["Room until 18:00", "Pool and spa access", "Luggage storage"],
    duration: "One-off",
    price: 110_000,
    priceUnit: "per stay",
    terms: baseTerms,
    availability: "limited",
    image: roomDeluxe,
    inputs: ["date", "time", "notes"],
  },
  {
    id: "room-upgrade",
    category: "room-services",
    name: "Room Upgrade",
    description: "Move up to the next room category, subject to availability.",
    longDescription:
      "An upgrade to a higher category with more space, a better view and additional in-room amenities.",
    includes: ["Next category room", "Welcome amenity", "Priority housekeeping"],
    duration: "Per night",
    price: 150_000,
    priceUnit: "per night",
    terms: baseTerms,
    availability: "on-request",
    image: roomSuite,
    inputs: ["date", "quantity", "notes"],
  },
  {
    id: "extra-bed",
    category: "room-services",
    name: "Extra Bed",
    description: "An additional bed or cot placed in your room.",
    longDescription:
      "A rollaway bed or cot with full bedding, set up before arrival or during turndown.",
    includes: ["Rollaway bed or cot", "Full bedding", "Daily housekeeping"],
    duration: "Per night",
    price: 60_000,
    priceUnit: "per night",
    terms: baseTerms,
    availability: "available",
    image: roomDeluxe,
    inputs: ["date", "quantity", "notes"],
  },

  // Celebration
  {
    id: "birthday-package",
    category: "celebration",
    name: "Birthday Package",
    description: "Room decoration, cake and a sparkling toast.",
    longDescription:
      "The team decorates your room while you are out and prepares a cake and chilled bottle for your return.",
    includes: ["Room decoration", "Celebration cake", "Sparkling toast"],
    duration: "One-off",
    price: 220_000,
    priceUnit: "per booking",
    terms: baseTerms,
    availability: "available",
    image: roomSuite,
    inputs: ["date", "time", "notes"],
  },
  {
    id: "anniversary-setup",
    category: "celebration",
    name: "Anniversary Setup",
    description: "Candlelit turndown, petals and a private toast.",
    longDescription:
      "An evening setup with candles, rose petals and a handwritten card from the hotel team.",
    includes: ["Candlelit turndown", "Rose petals", "Handwritten card"],
    duration: "One-off",
    price: 180_000,
    priceUnit: "per booking",
    terms: baseTerms,
    availability: "available",
    image: roomSuite,
    inputs: ["date", "time", "notes"],
  },
  {
    id: "honeymoon-package",
    category: "celebration",
    name: "Honeymoon Package",
    description: "Suite decoration, breakfast in bed and a couples treatment.",
    longDescription:
      "A full honeymoon programme across your stay: decorated suite, breakfast in bed and a couples spa treatment.",
    includes: ["Decorated suite", "Breakfast in bed", "Couples spa treatment"],
    duration: "Across the stay",
    price: 640_000,
    priceUnit: "per booking",
    terms: baseTerms,
    availability: "on-request",
    image: roomSuite,
    inputs: ["date", "notes"],
  },
  {
    id: "flowers",
    category: "celebration",
    name: "Flowers",
    description: "A seasonal bouquet arranged by a local florist.",
    longDescription:
      "A hand-tied bouquet of seasonal blooms delivered to your room or presented on arrival.",
    includes: ["Seasonal bouquet", "Vase and card", "Room delivery"],
    duration: "One-off",
    price: 75_000,
    priceUnit: "per bouquet",
    terms: baseTerms,
    availability: "available",
    image: propLobby,
    inputs: ["date", "time", "quantity", "notes"],
  },
  {
    id: "cake",
    category: "celebration",
    name: "Celebration Cake",
    description: "Patisserie cake personalised with your message.",
    longDescription:
      "Choose chocolate, vanilla or passion fruit; the pastry team pipes your message and delivers it chilled.",
    includes: ["Choice of flavour", "Personal message", "Room or restaurant delivery"],
    duration: "One-off",
    price: 95_000,
    priceUnit: "per cake",
    terms: baseTerms,
    availability: "available",
    image: propRestaurant,
    inputs: ["date", "time", "quantity", "notes"],
  },
];

export function servicesForCategory(category: ServiceCategoryKey): HotelService[] {
  return hotelServices.filter((service) => service.category === category);
}

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

export function formatMoney(amount: number, currency = "TZS"): string {
  return `${currency} ${new Intl.NumberFormat("en-US").format(amount)}`;
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(diff / 86_400_000));
}

/** Icon used by the "Hotel Services & Experiences" section heading. */
export const servicesHeadingIcon: LucideIcon = Sparkles;
