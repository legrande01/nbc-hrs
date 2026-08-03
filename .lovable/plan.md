Reorganise the hotel details page so the three broken-out sections (Overview, Description, Amenities, Landmarks) are merged into one cohesive "About this property" block, while keeping Property Highlights as a sidebar and moving the gallery below it.

## Current state

- `src/routes/hotels.$hotelId.tsx` renders the details page as a series of separate horizontal sections:
  1. Overview + Property Highlights + Gallery
  2. Description
  3. Amenities
  4. Landmarks
  5. Choose Your Room
  6. Reviews
  7. Policies
  8. FAQ
- The user wants the first three content sections collapsed into one unified block, as shown in the sketch, with the gallery moved beneath it.

## What we will build

### New "About this property" section

A single section with a two-column desktop layout:

- Left column (main content)
  - Eyebrow and heading "About this property"
  - Overview paragraphs (the existing description text kept as the overview body)
  - "Landmarks" subsection with compact horizontal cards for each nearby place
  - "Amenities" subsection shown as a three-column checkmark list (replacing the current chip row)
- Right column (sidebar)
  - "Property Highlights" card (preserved from the current Overview section)

### Gallery moved below

The `PropertyGallery` component will move out of the Overview section and be rendered as a standalone "Imagery" section directly below the new combined block.

### Removed sections

- The standalone "Description" section will be removed.
- The standalone "Amenities" section will be removed.
- The standalone "Landmarks and location" section will be removed.

## Files to edit

- `src/routes/hotels.$hotelId.tsx` — restructure the sections, move the gallery, update the heading and labels, and render amenities as a checkmark grid.
- `src/components/nbc/PropertyGallery.tsx` — no structural changes needed; it will be repositioned in the page.

## Implementation notes

- Use the existing `SectionHeading` component for the new combined section heading.
- Keep the existing `nearbyIcons` and `amenityMeta` mapping for landmark and amenity icons.
- Render amenities in a CSS grid (`grid-cols-2 sm:grid-cols-3`) with a `Check` icon for each item.
- Keep landmarks as horizontal cards but sized compactly so they sit comfortably within the new block.
- Maintain the same section width, padding, and responsive breakpoints as the rest of the page.
- Ensure the heading hierarchy remains semantically correct: a single `h2` for the combined section, then `h3` for the subsections (Landmarks, Amenities).
- No changes to data models or external APIs are required; this is a pure frontend layout change.

## Verification

- Type-check the modified route.
- Visually confirm the new layout matches the sketch: one combined block with highlights on the right, gallery below, and no separate Description / Amenities / Landmarks sections.
