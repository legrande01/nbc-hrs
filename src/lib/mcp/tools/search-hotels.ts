import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

/**
 * Read-only search over the NBC Hospitality property inventory.
 * Data modules are imported lazily so this file stays import-safe.
 */
export default defineTool({
  name: "search_hotels",
  title: "Search hotels",
  description:
    "Search NBC Hospitality properties by city, property type, star rating or nightly price range.",
  inputSchema: {
    city: z.string().optional().describe("City name, e.g. 'Zanzibar' or 'Dar es Salaam'."),
    propertyType: z
      .enum(["hotel", "resort", "apartment", "lodge", "guest-house"])
      .optional()
      .describe("Property category filter."),
    minStars: z.number().optional().describe("Minimum official star classification (3-5)."),
    maxPrice: z.number().optional().describe("Maximum nightly rate in TZS."),
    limit: z.number().optional().describe("Maximum number of results to return (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ city, propertyType, minStars, maxPrice, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }

    const { discoveryHotels } = await import("@/lib/nbc-discovery");

    const results = discoveryHotels
      .filter((hotel) => (city ? hotel.city.toLowerCase() === city.toLowerCase() : true))
      .filter((hotel) => (propertyType ? hotel.propertyType === propertyType : true))
      .filter((hotel) => (typeof minStars === "number" ? hotel.stars >= minStars : true))
      .filter((hotel) => (typeof maxPrice === "number" ? hotel.priceFrom <= maxPrice : true))
      .sort((a, b) => a.recommendedRank - b.recommendedRank)
      .slice(0, Math.max(1, Math.min(limit ?? 10, 25)))
      .map((hotel) => ({
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        area: hotel.area,
        propertyType: hotel.propertyType,
        stars: hotel.stars,
        rating: hotel.rating,
        reviewCount: hotel.reviewCount,
        priceFrom: hotel.priceFrom,
        currency: hotel.currency,
        personality: hotel.personality,
        amenities: hotel.amenities,
      }));

    return {
      content: [{ type: "text", text: JSON.stringify({ count: results.length, results }, null, 2) }],
      structuredContent: { count: results.length, results },
    };
  },
});
