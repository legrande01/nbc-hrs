Problem: The hotel result card currently leaves unused vertical space below the price/CTA row. Because the grid stretches both columns to the same height, the image column can also pull the content column taller than its content needs, leaving a gap at the bottom of the card.

Goal: Remove all vertical space below the price/CTA and the image so the card is as compact as its content.

Plan:

1. Adjust `src/components/nbc/HotelResultCard.tsx` content column
   - Remove the bottom padding from the content wrapper (currently `p-6 lg:p-7`) so the CTA row sits directly on the card's bottom edge. Use `px-6 pt-6 pb-0 lg:px-7 lg:pt-7`.

2. Prevent the grid from stretching the content column taller than its content
   - Add `items-start` to the article grid so columns do not stretch to match a taller sibling.

3. Adjust the image column so it does not dictate a taller card height
   - Replace the current `aspect-4/3 md:aspect-auto md:h-full` / `className="md:h-full"` approach on the image carousel with a single consistent aspect ratio (e.g., `aspect-4/3` or `aspect-3/2`) across breakpoints so the image height matches the natural content height.

4. Verify visually
   - Check the `/hotels` listing on desktop and mobile to confirm:
     - No space below the price/CTA row inside the card.
     - No extra space below the image.
     - Cards remain aligned in the listing grid.

No backend or data changes are required.