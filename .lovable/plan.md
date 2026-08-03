# Sprint 2 — Identity & Authentication Foundation

Adds customer accounts, guest reservation lookup, and a separate hotel partner
onboarding/login experience. Existing pages, design tokens and components are
reused as-is; the booking journey stays unchanged for guests.

## 1. Customer registration (multi-step)

New route `/account/register` using the existing card/form styling from the
current sign-in page.

- **Step 1 — Create Account:** first name, last name, email, phone, password,
  confirm password. Zod-validated, inline errors.
- **Step 2 — Verification:** two 6-digit codes, email and phone, both required.
  Email code is sent by real email. Phone code is simulated (generated and
  stored in the backend, surfaced in the UI as a demo hint) so the full flow
  works now and can be swapped for real SMS later. Codes expire in 10 minutes
  with resend + cooldown.
- **Account activation:** only after both codes verify. Profile completion
  (photo, country, language, preferences) is offered afterwards and can be
  skipped — it never blocks access.

## 2. Customer login, recovery, session

New route `/account/login` replacing the current `/auth` page (the old path
redirects, so the existing OAuth consent flow keeps working).

- Single identifier field accepting **email or phone number** + password.
- Remember Me (long-lived session vs. session-only).
- Forgot password → OTP to email or phone → reset password screen.
- Session persistence and Logout; header shows an account menu when signed in
  instead of the Login button.
- Unverified accounts are blocked from authenticated areas and sent back to the
  verification step.

New authenticated area `/account` (protected): dashboard shell with profile,
reservations placeholder, and an **NBC Membership** card that is a placeholder
service only — linking is not implemented this sprint, but the hook points for
"Pay from NBC Account" and "Loyalty Points" are prepared.

## 3. Guests & Find My Reservation

Guest booking stays exactly as it is — no login prompts added.

- Reservations are now saved to the database at confirmation, with the booking
  reference, guest contact details, hotel, dates, rooms, totals and payment
  status.
- New public route `/find-reservation`, linked from the main navigation
  (replacing the inert "Support" item with "My Reservation"). Fields: booking
  reference + email or phone. A match shows the reservation details using the
  existing confirmation layout components. Lookup is rate-limited and requires
  both fields to match, so references alone leak nothing.

## 4. Hotel partner authentication

Completely separate entry points and screens, same underlying auth service.

- `/partner/login` — hotel administrator sign-in.
- `/partner/register` — 4-step onboarding:
  1. **Business information:** hotel name, TIN, business registration number
     (optional), business email, business phone, plus uploads for Business
     License and TIN Certificate.
  2. **Property information:** property type, star rating, number of rooms,
     country, region, district, physical address.
  3. **Administrator account:** full name, email, phone, password, confirm.
  4. **Application submitted:** application reference + "Pending NBC Review".
- Partners can sign in immediately. While pending they land on
  `/partner/dashboard` with only: application status timeline, uploaded
  documents, edit submitted information, re-upload requested documents, and
  contact NBC support. All operational modules are absent and locked.
- "For Hotels" in the main navigation becomes a real link to a partner entry
  page with Hotel Login and Become a Hotel Partner.

## 5. Payments cleanup

Remove Buy Now Pay Later and Save to Buy everywhere — payment library, payment
page, confirmation statuses, and any related copy. Remaining methods:

- Everyone: Card, Mobile Money (USSD push), Control Number.
- NBC linked members only: Pay from NBC Account, Loyalty Points (shown as
  locked with a "Link your NBC account" invitation until membership exists).

## Technical notes

- Backend tables: `profiles` (customer identity + verification flags),
  `user_roles` + `app_role` enum (`customer`, `hotel_admin`, `nbc_admin`) in a
  separate table for future RBAC, `otp_codes` (hashed codes, purpose, expiry,
  attempt counter), `reservations`, `hotel_applications`, and a private storage
  bucket for partner documents. Every table gets grants and RLS scoped to the
  owning user; the reservation lookup goes through a server function, not a
  public read policy.
- Auth uses the existing backend auth service. Phone-based login maps the phone
  to the account's email server-side, so both identifiers hit one login path.
- OTP generation/verification, reservation lookup, and partner application
  writes are all server functions with Zod validation; verification state is
  never trusted from the client.
- Route structure follows the existing pattern: public routes at top level,
  protected areas under the authenticated layout with a role check.
- Reuses `GlobalNav`, `GlobalFooter`, `SectionHeading`, button/input/card
  primitives and NBC tokens. New shared pieces: an auth page shell, an OTP input
  field, and a step indicator — all built on existing components, no new design
  language.
- Fully responsive: single-column stacked steps on mobile, two-column layouts
  from the tablet breakpoint up.
