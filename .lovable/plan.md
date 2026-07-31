# Hotel Listing & Hotel Details Enhancement

Extends existing NBC components and tokens. No new booking-flow routes; the journey stays Listing → Details → Room Selection → Reservation → Payment → Confirmation.

## 1. Shared additions

- **`RoomImageCarousel`** — one new reusable manual-swipe carousel built on the existing `components/ui/carousel` (Embla). No autoplay; arrows on hover (desktop), swipe + dot indicators (mobile). Used by hotel cards, room category cards, variation cards and the room details modal.
- **`AvailabilityBadge`** — one shared badge with `available` / `few-left` / `sold-out` states using existing semantic tokens. Availability is **always shown as a badge**; it never changes a CTA label.
- **`FavouriteButton`** — heart toggle, persisted in `localStorage` (no auth required), used on listing cards and the details hero.
- **`OverflowChips`** — small helper that renders the first N chips plus a "+X more" chip.

## 2. Data model (placeholder libs, same style as today)

- `nbc-discovery.ts`: add `images: string[]` (5–6), `distanceKm`, `availability`, and room-category teasers per hotel.
- `nbc-room-selection.ts`: add `images`, `view`, `balcony`, plus a `variants[]` array per category (size, bed, occupancy, highlights, extra features, availability) and richer `description` / `policies` for the details modal.

## 3. Hotel Listing (`/hotels`)

`HotelResultCard` rewritten in place (no duplicate component): carousel → name → ★ rating (N Reviews) • distance → location → **2–3 room category chips + "+X more"** → **3 amenity chips + "+X more"** → starting price/night → availability badge. Favourite overlays the carousel. Single CTA "View Details"; "Find Your Stay" removed.

**Sticky search bar**: new `StickySearchBar` revealed via `IntersectionObserver` once the hero search scrolls out. Compact row (Destination · Check-in · Check-out · Guests/Rooms) expanding into the existing `HotelSearch` in a popover/sheet. Submitting **patches only the stay fields** in the URL search state — price, star, type, amenity filters and sort are preserved (page resets to 1).

## 4. Hotel Details (`/hotels/$hotelId`)

- `PropertyHero` height reduced ~50%; overlay gains rating line, location, Favourite, Share (Web Share API + clipboard fallback) and primary "Book Now".
- Gallery unchanged.
- Section order: Property Overview → Short Description → Amenities → Nearby Landmarks & Attractions → **Choose Your Room** → Guest Reviews → Property Policies (table layout) → FAQs → Footer.

## 5. Choose Your Room + Compare

`RoomPreviewCard` upgraded: carousel, name, bed type, max guests, 3 highlight amenities, price/night, availability badge, compare checkbox, CTA "Select Room".

New `CompareRoomsDrawer` (existing `ui/drawer`, bottom sheet): up to 3 categories compared across images, price, size, bed, occupancy, view, balcony, breakfast, amenities, cancellation, availability, CTA. A persistent compare bar stays docked at the bottom once ≥1 room is selected and **remains until explicitly dismissed** (clear/close), surviving drawer open/close and scrolling. A 4th selection shows a friendly limit message. The drawer overlays the page, so scroll position is preserved on close.

## 6. Available Rooms (existing `/hotels/$hotelId/rooms`)

Selecting a category deep-links here with the category preselected; the page lists that category's variations. Each variation card: carousel, size, bed, occupancy, highlight amenities, extra features, availability badge, "View Room Details" link, and CTA **"Book Now"** at all times — disabled when sold out, with a secondary "Notify When Available" action shown alongside the sold-out badge.

- **`RoomDetailsModal`** — carousel with **image zoom** (click/tap to zoom, pinch-zoom and drag-to-pan on touch, Esc/close to reset), description, specs, full amenities, policies, cancellation, smoking, other info, bottom "Book Now".
- **`NotifyMeModal`** — Full Name, Email, Phone with zod validation; no login required.

## 7. Booking summary

Existing `ReservationSummary` extended (not duplicated) with a Coupon/Discount code field and Loyalty point redemption. Demo logic in `nbc-room-selection.ts`: a small set of valid codes and a mock loyalty balance, applied as discount lines above the existing total rows. Current pricing layout untouched.

## Technical notes

- **Database**: one new table `public.room_notifications` (hotel id, room id, full name, email, phone). Anonymous inserts allowed, no public read — writes go through a server function with zod validation. Migration includes GRANTs and RLS policies.
- All carousels are manual only; Embla autoplay is not installed.
- All colors/spacing/radii via existing tokens in `src/styles.css`; no hardcoded values.
- Responsive verification of listing, details, compare drawer and modals via Playwright at mobile and desktop widths before finishing.
