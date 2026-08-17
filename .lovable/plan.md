# Align Reservations Overview and Room Status to the NBC palette

Both widgets currently mix colours outside the NBC brand palette (emerald, violet, orange) alongside Royal, Scarlet and Gold, so they read as a generic dashboard rather than an NBC surface.

## What changes

**Reservations Overview (bar chart)**
- Confirmed: NBC Royal
- Checked-in: NBC Royal at 55% (lighter tint of the same hue)
- Checked-out: NBC Gold
- Legend dots and bars use the same three tokens, so the chart stays a Royal-led scale with one warm accent.

**Room Status (distribution bar + list)**
- Occupied: NBC Royal
- Reserved: NBC Royal 60%
- Available: NBC Royal Soft (light tint)
- Cleaning: NBC Gold
- Maintenance: NBC Scarlet 60%
- Out of Service: NBC Scarlet

Ordering stays as-is; only the colour ramp changes so the bar reads left-to-right from deep Royal to light, then warns in Gold/Scarlet.

## Technical notes

- Tones live as Tailwind classes in `roomStatus` (`src/lib/nbc-hotel-admin.ts`) and in the `series` array of `TrendChart` (`src/routes/hotel.dashboard.tsx`).
- Tints use existing tokens with opacity utilities (e.g. `bg-nbc-royal/55`, `bg-nbc-royal-soft`) — no new hardcoded colours, no new CSS variables.
- No layout, data or logic changes; presentation only.
