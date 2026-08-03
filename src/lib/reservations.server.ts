import { generateReference, normalisePhone } from "@/lib/auth.server";

/** Server-only reservation persistence and guest lookup. */

export interface ReservationRoomLine {
  roomId: string;
  roomName: string;
  quantity: number;
  nightlyRate: number;
  subtotal: number;
}

export interface SaveReservationInput {
  reference?: string;
  userId?: string | null;
  hotelId: string;
  hotelName: string;
  hotelLocation?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: ReservationRoomLine[];
  currency: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  statusLabel?: string;
}

export interface ReservationRecord {
  reference: string;
  hotelName: string;
  hotelLocation: string | null;
  guestName: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: ReservationRoomLine[];
  currency: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  statusLabel: string | null;
  createdAt: string;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function saveReservation(input: SaveReservationInput): Promise<{ reference: string }> {
  const db = await admin();
  const reference = input.reference?.trim() || generateReference("NBC");

  const { error } = await db.from("reservations").upsert(
    {
      reference,
      user_id: input.userId ?? null,
      hotel_id: input.hotelId,
      hotel_name: input.hotelName,
      hotel_location: input.hotelLocation ?? null,
      guest_name: input.guestName,
      guest_email: input.guestEmail.trim().toLowerCase(),
      guest_phone: normalisePhone(input.guestPhone),
      check_in: input.checkIn,
      check_out: input.checkOut,
      adults: input.adults,
      children: input.children,
      rooms: JSON.parse(JSON.stringify(input.rooms)),
      currency: input.currency,
      total_amount: input.totalAmount,
      payment_method: input.paymentMethod,
      payment_status: input.paymentStatus,
      status_label: input.statusLabel ?? null,
    },
    { onConflict: "reference" },
  );

  if (error) throw new Error(error.message);
  return { reference };
}

function toRecord(row: Record<string, unknown>): ReservationRecord {
  return {
    reference: row.reference as string,
    hotelName: row.hotel_name as string,
    hotelLocation: (row.hotel_location as string | null) ?? null,
    guestName: row.guest_name as string,
    checkIn: row.check_in as string,
    checkOut: row.check_out as string,
    adults: row.adults as number,
    children: row.children as number,
    rooms: (row.rooms as ReservationRoomLine[]) ?? [],
    currency: row.currency as string,
    totalAmount: Number(row.total_amount ?? 0),
    paymentMethod: row.payment_method as string,
    paymentStatus: row.payment_status as string,
    statusLabel: (row.status_label as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

/**
 * Guest lookup. Both the reference and a matching contact detail are required,
 * so a reference on its own never reveals a reservation.
 */
export async function findReservation(
  reference: string,
  contact: string,
): Promise<ReservationRecord | null> {
  const db = await admin();
  const { data } = await db
    .from("reservations")
    .select("*")
    .eq("reference", reference.trim().toUpperCase())
    .maybeSingle();

  if (!data) return null;

  const value = contact.trim();
  const matches = value.includes("@")
    ? data.guest_email === value.toLowerCase()
    : data.guest_phone === normalisePhone(value);

  return matches ? toRecord(data as Record<string, unknown>) : null;
}

export async function listReservationsForUser(userId: string): Promise<ReservationRecord[]> {
  const db = await admin();
  const { data } = await db
    .from("reservations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => toRecord(row as Record<string, unknown>));
}
