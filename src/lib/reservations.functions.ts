import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  findReservation,
  listReservationsForUser,
  saveReservation,
  type SaveReservationInput,
} from "@/lib/reservations.server";

export const persistReservation = createServerFn({ method: "POST" })
  .inputValidator((data: SaveReservationInput) => data)
  .handler(async ({ data }) => saveReservation(data));

export const lookupReservation = createServerFn({ method: "POST" })
  .inputValidator((data: { reference: string; contact: string }) => data)
  .handler(async ({ data }) => ({
    reservation: await findReservation(data.reference, data.contact),
  }));

export const myReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => ({
    reservations: await listReservationsForUser(context.userId),
  }));
