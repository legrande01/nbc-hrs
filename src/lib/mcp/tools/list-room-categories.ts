import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

/** Room categories, rates and promotions for one property. */
export default defineTool({
  name: "list_room_categories",
  title: "List room categories",
  description:
    "List the bookable room categories for an NBC Hospitality property, including nightly rate, occupancy, promotions and cancellation terms.",
  inputSchema: {
    hotelId: z.string().describe("Property id returned by search_hotels, e.g. 'harbour-house'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ hotelId }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }

    const { getRoomSelectionData } = await import("@/lib/nbc-room-selection");
    const data = getRoomSelectionData(hotelId);

    if (!data) {
      return {
        content: [{ type: "text", text: `No property found with id "${hotelId}".` }],
        isError: true,
      };
    }

    const rooms = data.rooms.map((room) => ({
      id: room.id,
      name: room.name,
      nightlyRate: room.nightlyRate,
      currency: data.property.hotel.currency,
      sizeSqm: room.sizeSqm,
      bedType: room.bedType,
      maxAdults: room.maxAdults,
      maxChildren: room.maxChildren,
      amenities: room.amenities,
      breakfast: room.breakfast,
      cancellation: room.cancellation,
      promotion: room.promotion
        ? { label: room.promotion.label, detail: room.promotion.detail }
        : null,
      roomsLeft: room.roomsLeft,
    }));

    const payload = {
      hotelId: data.property.hotel.id,
      hotelName: data.property.hotel.name,
      taxRatePercent: 18,
      rooms,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
