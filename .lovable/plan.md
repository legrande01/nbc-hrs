# Unblock the Hotel Partner Dashboard for development

Goal: sign in as a real hotel partner and reach the hotel admin dashboard without waiting for manual approval, so the hotel modules can be built. Preview/development only — the published site keeps the real approval flow.

## What you get

1. **A ready-made demo hotel account** you can sign in with at `/partners/login`:
   - Email: `demo.hotel.admin@nbc-hrs.dev`
   - Password: `NbcDemo2026!`
   - Attached to an approved, verified demo property with the hotel admin role, so it lands straight on the hotel dashboard.
2. **Auto-approval of new partner registrations in preview**: any hotel that registers in the preview environment is instantly marked verified/approved and granted the hotel admin role, then routed to the hotel dashboard instead of the "under review" screen.
3. The existing pending application (ABC) is also approved so that account works too.
4. A small "Development preview — verification bypassed" notice stays visible wherever the bypass applies, so it is never mistaken for production behaviour.

Nothing about the real onboarding, OTP, RBAC, or approval logic is deleted — the bypass is an extra, environment-gated path.

## Technical approach

- **Migration**: insert the demo auth user + profile (email/phone verified), a `hotel_applications` row with `status = 'approved'`, and a `user_roles` row with `hotel_admin`. Also update the existing pending application to `approved` and give its admin user the `hotel_admin` role. Grants/RLS on those tables are already in place.
- **Dev auto-approve**: extend `src/lib/partner.server.ts` `submitApplication` to accept a `devBypass` flag. When set, it inserts the application with `status = 'approved'`, marks the profile verified, and inserts the `hotel_admin` role. The flag is passed from `src/routes/partners.register.tsx` only when `isHotelAdminDevBypassEnabled` (`import.meta.env.DEV`) is true, and the server re-checks `process.env.NODE_ENV !== 'production'` inside the handler so it can never fire in the published build.
- **Post-registration routing**: in dev bypass mode, `partners.register` navigates to `/hotel/dashboard` instead of the OTP/pending screens.
- **Partner dashboard gate**: `src/routes/partners.dashboard.tsx` already redirects unauthenticated users; when the application status is `approved` it should link/redirect to `/hotel/dashboard`.
- **Hotel area access**: `/hotel/dashboard` stays reachable; the existing `src/lib/nbc-dev-bypass.ts` banner in `HotelAdminLayout` is reused as the dev indicator.

## Verification

Sign in with the demo credentials in preview and confirm the hotel dashboard renders (desktop + mobile), then register a throwaway partner and confirm it lands on the dashboard directly.
