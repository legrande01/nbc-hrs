import type { DiscoveryHotel } from "@/lib/nbc-discovery";

import destArusha from "@/assets/dest-arusha.jpg";
import destDar from "@/assets/dest-dar.jpg";
import destDodoma from "@/assets/dest-dodoma.jpg";
import destMwanza from "@/assets/dest-mwanza.jpg";
import destZanzibar from "@/assets/dest-zanzibar.jpg";
import hotel1 from "@/assets/hotel-1.jpg";
import hotel2 from "@/assets/hotel-2.jpg";
import hotel3 from "@/assets/hotel-3.jpg";
import propFacilities from "@/assets/prop-facilities.jpg";
import propLobby from "@/assets/prop-lobby.jpg";
import propRestaurant from "@/assets/prop-restaurant.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomFamily from "@/assets/room-family.jpg";
import roomSuite from "@/assets/room-suite.jpg";

/**
 * Placeholder media + availability derivation.
 * Deterministic per id so server and client render identically, and so the
 * shapes stay stable when live inventory replaces this module.
 */

export type AvailabilityStatus = "available" | "few-left" | "sold-out";

export const availabilityLabels: Record<AvailabilityStatus, string> = {
  available: "Available",
  "few-left": "Few Rooms Left",
  "sold-out": "Sold Out",
};

const propertyPool = [
  propLobby,
  propRestaurant,
  propFacilities,
  hotel1,
  hotel2,
  hotel3,
  destDar,
  destZanzibar,
  destArusha,
  destDodoma,
  destMwanza,
];

const roomPool = [roomDeluxe, roomSuite, roomFamily, propLobby, propFacilities, propRestaurant];

/** Small stable string hash. */
function hash(value: string): number {
  let total = 0;
  for (let index = 0; index < value.length; index += 1) {
    total = (total * 31 + value.charCodeAt(index)) % 100000;
  }
  return total;
}

function pick<T>(pool: T[], seed: number, count: number, exclude?: T): T[] {
  const out: T[] = [];
  let cursor = seed % pool.length;
  while (out.length < count) {
    const candidate = pool[cursor % pool.length];
    cursor += 1;
    if (candidate === exclude || out.includes(candidate)) continue;
    out.push(candidate);
  }
  return out;
}

export interface CarouselImage {
  src: string;
  alt: string;
}

/** 6 property images, always led by the hotel's own hero shot. */
export function hotelImages(hotel: DiscoveryHotel): CarouselImage[] {
  const seed = hash(hotel.id);
  const extras = pick(propertyPool, seed, 5, hotel.image);
  return [hotel.image, ...extras].map((src, index) => ({
    src,
    alt:
      index === 0
        ? `${hotel.name} in ${hotel.area}, ${hotel.city}`
        : `${hotel.name} — property photo ${index + 1}`,
  }));
}

/** 5 room images, always led by the room's own shot. */
export function roomImages(roomId: string, roomName: string, base: string): CarouselImage[] {
  const seed = hash(roomId + roomName);
  const extras = pick(roomPool, seed, 4, base);
  return [base, ...extras].map((src, index) => ({
    src,
    alt: index === 0 ? roomName : `${roomName} — photo ${index + 1}`,
  }));
}

/** Walking distance from the searched destination centre, in km. */
export function hotelDistanceKm(hotel: DiscoveryHotel): number {
  return Math.round((0.3 + (hash(hotel.id) % 62) / 10) * 10) / 10;
}

/** Property-level availability for the current stay window. */
export function hotelAvailability(hotel: DiscoveryHotel): AvailabilityStatus {
  const bucket = hash(hotel.id) % 10;
  if (bucket === 0) return "sold-out";
  if (bucket <= 3) return "few-left";
  return "available";
}

/** Maps remaining inventory onto the shared availability vocabulary. */
export function availabilityFromRoomsLeft(roomsLeft: number): AvailabilityStatus {
  if (roomsLeft <= 0) return "sold-out";
  if (roomsLeft <= 2) return "few-left";
  return "available";
}
