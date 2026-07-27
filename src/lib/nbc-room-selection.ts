import type { AmenityKey } from "@/lib/nbc-content";
import { getPropertyDetail, type PropertyDetail } from "@/lib/nbc-property";

/**
 * Placeholder room-selection contract.
 * Shapes mirror the future availability API so presentation components stay
 * unchanged when live rates and inventory are introduced.
 */

export interface RoomPromotion {
  id: string;
  label: string;
  detail: string;
  /** Nights charged out of every N nights, e.g. 3-for-2 => { every: 3, charged: 2 }. */
  freeNight?: { every: number; charged: number };
  /** Percentage discount applied to the nightly rate. */
  percentOff?: number;
}

export interface RoomCategory {
  id: string;
  name: string;
  image: string;
  /** Nightly rate before promotions and taxes. */
  nightlyRate: number;
  sizeSqm: number;
  bedType: string;
  maxAdults: number;
  maxChildren: number;
  amenities: AmenityKey[];
  cancellation: string;
  breakfast: string;
  promotion?: RoomPromotion;
  /** Rooms left for the requested dates. Only shown once dates are supplied. */
  roomsLeft: number;
  highDemand: boolean;
}

export interface RoomSelectionSearch {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

export const TAX_RATE = 0.18;

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toNumber(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

/** Parses raw URL search into typed, always-complete room-selection state. */
export function parseRoomSelectionSearch(search: Record<string, unknown>): RoomSelectionSearch {
  return {
    checkIn: toString(search.checkIn),
    checkOut: toString(search.checkOut),
    adults: toNumber(search.adults, 2, 1, 12),
    children: toNumber(search.children, 0, 0, 8),
    rooms: toNumber(search.rooms, 1, 1, 6),
  };
}

/** Nights between the two dates, or 0 when dates are incomplete/invalid. */
export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return diff > 0 ? diff : 0;
}

export function formatStayDate(value: string): string {
  if (!value) return "Not selected";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not selected";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const promotions: Record<string, RoomPromotion> = {
  deluxe: {
    id: "early-bird",
    label: "Early Bird Discount",
    detail: "Save 10% when you reserve ahead of arrival.",
    percentOff: 10,
  },
  "executive-suite": {
    id: "three-for-two",
    label: "Stay 3 Nights, Pay for 2",
    detail: "Every third night of your stay is complimentary.",
    freeNight: { every: 3, charged: 2 },
  },
  "family-room": {
    id: "free-breakfast",
    label: "Free Breakfast",
    detail: "Breakfast for the whole family is included in this rate.",
  },
};

const roomProfiles: Record<
  string,
  {
    sizeSqm: number;
    maxAdults: number;
    maxChildren: number;
    cancellation: string;
    breakfast: string;
    roomsLeft: number;
    highDemand: boolean;
  }
> = {
  deluxe: {
    sizeSqm: 32,
    maxAdults: 2,
    maxChildren: 1,
    cancellation: "Free cancellation up to 48 hours before check-in",
    breakfast: "Breakfast included for 2 guests",
    roomsLeft: 6,
    highDemand: true,
  },
  "executive-suite": {
    sizeSqm: 58,
    maxAdults: 2,
    maxChildren: 2,
    cancellation: "Free cancellation up to 24 hours before check-in",
    breakfast: "Breakfast and evening canapés included",
    roomsLeft: 2,
    highDemand: false,
  },
  "family-room": {
    sizeSqm: 46,
    maxAdults: 4,
    maxChildren: 3,
    cancellation: "Free cancellation up to 72 hours before check-in",
    breakfast: "Breakfast included for 2 adults and 2 children",
    roomsLeft: 4,
    highDemand: false,
  },
};

const fallbackProfile = {
  sizeSqm: 30,
  maxAdults: 2,
  maxChildren: 1,
  cancellation: "Free cancellation up to 48 hours before check-in",
  breakfast: "Breakfast available as an extra",
  roomsLeft: 5,
  highDemand: false,
};

/** Builds the placeholder room inventory for a property. */
export function getRoomCategories(property: PropertyDetail): RoomCategory[] {
  return property.rooms.map((room) => {
    const profile = roomProfiles[room.id] ?? fallbackProfile;
    return {
      id: room.id,
      name: room.name,
      image: room.image,
      nightlyRate: room.priceFrom,
      bedType: room.bedType,
      amenities: room.amenities,
      promotion: promotions[room.id],
      ...profile,
    };
  });
}

export function getRoomSelectionData(hotelId: string) {
  const property = getPropertyDetail(hotelId);
  if (!property) return undefined;
  return { property, categories: getRoomCategories(property) };
}

export interface OccupancyCheck {
  fits: boolean;
  reason?: string;
}

/** Validates a room category against the requested adults and children. */
export function checkOccupancy(room: RoomCategory, search: RoomSelectionSearch): OccupancyCheck {
  const problems: string[] = [];
  if (search.adults > room.maxAdults) {
    problems.push(`${room.maxAdults} adult${room.maxAdults === 1 ? "" : "s"}`);
  }
  if (search.children > room.maxChildren) {
    problems.push(
      room.maxChildren === 0
        ? "no children"
        : `${room.maxChildren} child${room.maxChildren === 1 ? "" : "ren"}`,
    );
  }
  if (problems.length === 0) return { fits: true };
  return {
    fits: false,
    reason: `This room accommodates a maximum of ${problems.join(" and ")}. Adjust your search or choose a larger category.`,
  };
}

/** Nights actually charged for one room after promotions. */
export function chargedNights(room: RoomCategory, nights: number): number {
  const promo = room.promotion?.freeNight;
  if (!promo || nights <= 0) return nights;
  const cycles = Math.floor(nights / promo.every);
  return nights - cycles * (promo.every - promo.charged);
}

/** Subtotal for one room category selection, before taxes. */
export function roomSubtotal(room: RoomCategory, nights: number, quantity: number): number {
  const billableNights = chargedNights(room, Math.max(nights, 1));
  const rate = room.promotion?.percentOff
    ? room.nightlyRate * (1 - room.promotion.percentOff / 100)
    : room.nightlyRate;
  return Math.round(rate * billableNights * quantity);
}

export interface SelectionLine {
  room: RoomCategory;
  quantity: number;
  subtotal: number;
}

export interface SelectionTotals {
  lines: SelectionLine[];
  roomCount: number;
  subtotal: number;
  taxes: number;
  total: number;
}

/** Builds the live reservation totals from the current selection map. */
export function buildTotals(
  categories: RoomCategory[],
  selection: Record<string, number>,
  nights: number,
): SelectionTotals {
  const lines: SelectionLine[] = categories
    .filter((room) => (selection[room.id] ?? 0) > 0)
    .map((room) => {
      const quantity = selection[room.id];
      return { room, quantity, subtotal: roomSubtotal(room, nights, quantity) };
    });

  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const taxes = Math.round(subtotal * TAX_RATE);

  return {
    lines,
    roomCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    taxes,
    total: subtotal + taxes,
  };
}
