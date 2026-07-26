## Goal

Replace the Guest Reviews grid (three cards of unequal height) with **one unified card section** containing an **auto-sliding review carousel** that shows one review at a time.

## Layout

```text
+------------------------------------------------------------------+
|  GUEST REVIEWS            What guests say        [View All Reviews]|
+------------------------------------------------------------------+
|  4.8  * * * * *        |   " Faultless from arrival to check-out  |
|  Based on 412 verified |     The team remembered our names...     |
|  guest reviews         |     Amina H. - Dar es Salaam - June 2026 |
|                        |                                          |
|                        |            < >          o • o            |
+------------------------------------------------------------------+
```

- One rounded card (`border border-border/70 bg-card shadow-card`) wrapping both the rating summary and the carousel, split by a divider on desktop and stacked on mobile.
- Left: score, stars, review count (existing content, no card shell of its own).
- Right: carousel viewport with a **fixed min-height** so every slide is the same height regardless of quote length — this removes the uneven-card problem.

## Carousel behaviour

- Use the existing `src/components/ui/carousel.tsx` (Embla, already installed).
- Add `embla-carousel-autoplay` for auto-advance (~5s), loop enabled.
- Pause on hover/focus, resume on leave; respect `prefers-reduced-motion` (no autoplay).
- Manual controls: prev/next arrow buttons plus clickable dot indicators showing the active review.
- Accessible: carousel region labelled, dots as buttons with `aria-label` "Show review N".

## Implementation

1. New component `src/components/nbc/ReviewCarousel.tsx` — presentation only, takes `reviews`, `rating`, `reviewCount`; owns the autoplay plugin, hover-pause and dots.
2. `src/routes/hotels.$hotelId.tsx` — Guest Reviews section: keep `SectionHeading` + "View All Reviews" action, replace the summary box + `<ul>` grid with `<ReviewCarousel />`.
3. Styling uses existing tokens only (`nbc-gold` stars, `nbc-scarlet` quote mark, `shadow-card`, existing radii/spacing) to stay consistent with the rest of the module.

## Technical notes

- Adds one dependency: `embla-carousel-autoplay` (matches the installed Embla v8).
- No data-model changes; `property.reviews` stays as-is.
