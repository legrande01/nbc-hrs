## Flow and routes

```text
/hotels/$hotelId/rooms          Room Selection      (exists)
/hotels/$hotelId/reservation    Reservation Details (new)
/hotels/$hotelId/payment        Payment             (new)
/hotels/$hotelId/confirmation   Confirmation        (new)
```

Each step inherits the same stay search params (`checkIn`, `checkOut`, `adults`, `children`, `rooms`) and uses the same defensive `beforeLoad` guard pattern already on Room Selection — invalid context redirects one step back, never forward. A shared `BookingStepper` header gives the four routes a single-flow feel.

## Booking session (not form state)

`src/lib/nbc-booking-flow.tsx` models a **booking session / draft reservation**, not temporary form state, so backend reservation locking is additive later:

- `sessionId`, `createdAt`, `expiresAt` (hold window), `status: draft | pending_payment | confirmed | expired`
- `stay` (dates, occupancy), `propertyId`, `roomLines` (category, quantity, rate snapshot)
- `pricing` snapshot (subtotal, taxes, total, currency) — rates captured at selection time, as a real hold would
- `owner`, `paymentOutcome`
- Actions shaped like future server calls: `startSession`, `updateOwner`, `selectPayment`, `confirmSession`, `releaseSession`

In-memory React context this sprint; the same interface later backed by a server function with no component changes.

## Step 1 — Reservation Details

Deliberately minimal. No guest assignment, no room assignment — those belong to Reception. The form is organised into two labelled groups:

**Contact Information**
- Full Name
- Email
- Phone

**Traveller Information**
- Country / Nationality
- Preferred Language (English / Swahili) — stored on the session for future multilingual communications

**Optional**: estimated arrival time, special requests (free text).

Plus a compliance notice — all staying guests must present a valid government-issued ID at check-in, per Tanzanian regulations — and a sticky read-only reservation summary reused from `ReservationSummary`. CTA: "Continue to Payment".

## Step 2 — Payment

Two visually separated groups.

**NBC Exclusive**
1. Buy Now Pay Later (BNPL)
2. Save to Buy (S2B)
3. Loyalty Points

**Available to Everyone**
1. Mobile Money (USSD Push)
2. Card Payment
3. Control Number

Exclusive methods are always visible (option B). Without a linked NBC account each shows its benefit line, is non-selectable, and a shared "Link NBC Account" card carries the action — an invitation, never an error state.

Selecting a method expands an inline panel with only that method's fields: instalment preview (BNPL), savings-goal progress and drawdown (S2B), points balance and conversion (Loyalty), phone number (Mobile Money), card fields (Card), reference preview (Control Number).

The reservation summary on this screen is **strictly read-only** — no quantity steppers, no date or occupancy editing. A single "Modify reservation" link returns the guest to the Reservation step, which is the only place stay details can change. NBC-linked state comes from `src/lib/nbc-profile.ts`, a demo profile shaped like a real user profile — no artificial UI toggle.

CTA label varies by method ("Confirm & Pay", "Confirm with Points", "Generate Control Number").

## Step 3 — Booking Confirmation

One route driven by a single `PaymentOutcome`:

| Method | Status | Headline |
| --- | --- | --- |
| Mobile Money / Card | paid | Reservation Confirmed & Paid |
| Control Number | pending | Reservation Confirmed — Awaiting Payment |
| BNPL | financed | Reservation Confirmed — Financed by NBC |
| Save to Buy | paid | Reservation Confirmed — Paid from your savings goal |
| Loyalty Points | paid | Reservation Confirmed — Paid with loyalty points |

Shared shell: booking reference, hotel and stay summary, room lines, amount, reservation owner, the ID-at-check-in notice, plus actions — download/print, add to calendar, **"Email Booking Confirmation Again"** (stubbed session action with success toast, ready for backend), view booking, back to home. A method-specific block slots in: BNPL instalment schedule, Control Number with deadline and where to pay, S2B goal drawdown, Loyalty points redeemed and remaining balance.

## New files

- `src/lib/nbc-booking-flow.tsx` — booking session context, lifecycle, step guards
- `src/lib/nbc-payments.ts` — ordered method catalogue, eligibility, outcome types
- `src/lib/nbc-profile.ts` — demo profile with NBC-link state
- `src/components/nbc/BookingStepper.tsx`
- `src/components/nbc/ReservationOwnerForm.tsx`
- `src/components/nbc/ComplianceNotice.tsx`
- `src/components/nbc/PaymentMethodCard.tsx`
- `src/components/nbc/LinkNbcAccountCard.tsx`
- `src/components/nbc/ConfirmationHeader.tsx` + per-method detail blocks
- Three new routes as listed above

All extend existing NBC tokens and components — no new colour, type, or spacing decisions.

## Not in scope

Real payment processing, real NBC account linking/auth, persistence, outbound email, and the Hotel/NBC Operations platforms.
