import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

/** Full editorial detail for one NBC Hospitality property. */
export default defineTool({
  name: "get_hotel_details",
  title: "Get hotel details",
  description:
    "Return the full profile of one NBC Hospitality property: overview, amenities, address, nearby places, policies and FAQs.",
  inputSchema: {
    hotelId: z.string().describe("Property id returned by search_hotels, e.g. 'harbour-house'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ hotelId }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }

    const { getPropertyDetail } = await import("@/lib/nbc-property");
    const property = getPropertyDetail(hotelId);

    if (!property) {
      return {
        content: [{ type: "text", text: `No property found with id "${hotelId}".` }],
        isError: true,
      };
    }

    const payload = {
      id: property.hotel.id,
      name: property.hotel.name,
      city: property.hotel.city,
      area: property.hotel.area,
      stars: property.hotel.stars,
      rating: property.hotel.rating,
      reviewCount: property.hotel.reviewCount,
      priceFrom: property.hotel.priceFrom,
      currency: property.hotel.currency,
      positioning: property.positioning,
      overview: property.overview,
      highlights: property.highlights,
      amenities: property.serviceAmenities,
      extraServices: property.extraServices,
      address: property.address,
      nearby: property.nearby,
      policies: property.policies,
      faqs: property.faqs,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
