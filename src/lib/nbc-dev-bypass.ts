/**
 * TEMPORARY development/preview-only access bypass for the Hotel Admin area.
 *
 * This exists purely so the completed Hotel Admin Dashboard can be reviewed
 * without going through partner onboarding, OTP verification, application
 * approval or the hotel_admin role check. It never runs in a production
 * build: `import.meta.env.DEV` is statically false there, so every guarded
 * branch is dropped by the bundler.
 *
 * None of the real authentication, onboarding, verification, RBAC or hotel
 * approval logic is modified — this module only adds a dev-only shortcut.
 */

import { hotelProperty } from "@/lib/nbc-hotel-admin";

/** True only in the development/preview runtime. Always false in production. */
export const isHotelAdminDevBypassEnabled: boolean = import.meta.env.DEV === true;

/** Clearly identifiable mock hotel administrator used by the dev bypass. */
export const demoHotelAdmin = {
  name: "NBC HRS Demo Hotel Admin",
  email: "demo.hotel.admin@nbc-hrs.dev",
  role: "hotel_admin" as const,
  propertyName: hotelProperty.name,
};
