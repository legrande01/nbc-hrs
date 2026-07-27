## Goal

Make Room Selection a strict comparison screen that always receives a valid booking context. All availability collection moves to Hotel Details via a modal.

```text
Home → Discovery (search) → Hotel Details (sell + availability modal) → Room Selection (compare) → Guest Details
```

## What changes

### 1. Hotel Details becomes the availability gate
- `/hotels/$hotelId` gains `validateSearch` so it can carry `checkIn`, `checkOut`, `adults`, `children`, `rooms` forward from Discovery (discovery result cards pass the active search when linking to a property).
- Every "Book Now" / "View Available Rooms" CTA (hero, room preview cards, bottom CTA) routes through one shared handler:
  - Valid dates present → navigate straight to `/hotels/$hotelId/rooms` with those params.
  - Dates missing or invalid → open the Availability modal.

### 2. New Availability modal
- New `src/components/nbc/AvailabilityModal.tsx` — a dialog reusing the field layout from `AvailabilityPanel`: check-in, check-out, adults, children, rooms.
- Guest-focused copy:
  - Title: "Choose your stay dates"
  - Subtitle: "Select your travel dates and guests to view available rooms."
  - Primary action: "View Available Rooms"
- Validation: check-out after check-in, at least 1 adult, at least 1 room. Submit navigates to Room Selection with the collected params; the modal never renders room results.
- Pre-fills from any partial params in the URL, otherwise sensible defaults.
- `AvailabilityPanel.tsx` is removed once the modal replaces it (its field markup is lifted into a shared internal form).

### 3. Room Selection becomes strict
In `src/routes/hotels.$hotelId_.rooms.tsx`:
- Remove the `AvailabilityPanel` render path, the `runAvailabilityCheck` handler, and the `hasDates` conditional branching.
- Add a `beforeLoad` guard as **defensive programming only** — it validates the booking context and, if invalid, redirects back to `/hotels/$hotelId` carrying any existing params. In the normal journey this never fires, because Hotel Details always collects availability before navigating. No empty state, no search form, no placeholder page on this route.
- The page body renders unconditionally: read-only Booking Summary header → room category cards → reservation summary → continue CTA.

### 4. CTA rename
- "Continue to checkout" becomes **"Continue to Guest Details"** in both `ReservationSummary.tsx` (sticky sidebar) and the bottom CTA in the rooms route.

### 5. Shared stay-context helper
- Add `isCompleteStay(search)` to `src/lib/nbc-room-selection.ts`, used by both the Hotel Details CTA handler and the Room Selection guard, so "valid booking context" is defined once.

## Not in scope

Guest Details, Payment, Confirmation. No changes to Discovery filtering logic beyond forwarding the active search into property links.

## Technical notes

- Room Selection keeps `validateSearch: parseRoomSelectionSearch`; the guard uses `throw redirect(...)` from `@tanstack/react-router` in `beforeLoad`.
- Hotel Details keeps its existing `head()` metadata; adding `validateSearch` does not affect SSR or prerender.
- Modal open state is local `useState` in the Hotel Details route component, passed to hero and room preview cards through their existing CTA callbacks — no new global state.
- Date fields use the shadcn datepicker with `pointer-events-auto` on the calendar so it stays interactive inside the dialog.
