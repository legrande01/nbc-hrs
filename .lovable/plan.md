Plan: Remove the card shell from the left Property Overview column so it reads as a normal block of content.

1. Update the left column container in `src/routes/hotels.$hotelId.tsx` (lines 121-167):
   - Remove `rounded-2xl border border-border/70 bg-card p-7 shadow-card`.
   - Keep `grid h-fit content-start gap-8` so the About, Location, and Nearby sections remain vertically separated.
   - Leave the right-hand Highlights & Amenities card unchanged.

2. Verify:
   - Run `bunx tsgo -p tsconfig.json --noEmit` to confirm type safety.
   - Capture a screenshot of the Property Overview section to confirm the left column no longer appears as a card.

No other sections or functionality will change.