import { auth, defineMcp } from "@lovable.dev/mcp-js";

import getHotelDetailsTool from "./tools/get-hotel-details";
import listRoomCategoriesTool from "./tools/list-room-categories";
import searchHotelsTool from "./tools/search-hotels";

// The OAuth issuer must be the direct auth host; the project ref is inlined at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "nbc-hospitality-hub",
  title: "NBC Hospitality Hub",
  version: "0.1.0",
  instructions:
    "Tools for the NBC Hospitality platform. Use `search_hotels` to find properties across Tanzania, `get_hotel_details` for a full property profile, and `list_room_categories` for room types, rates and promotions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchHotelsTool, getHotelDetailsTool, listRoomCategoriesTool],
});
