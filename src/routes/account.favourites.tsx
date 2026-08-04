import { createFileRoute, redirect } from "@tanstack/react-router";

import { AccountPlaceholder } from "@/components/nbc/AccountPlaceholder";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account/favourites")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user)
      throw redirect({ to: "/account/login", search: { next: "/account/favourites" } });
  },
  head: () => ({
    meta: [
      { title: "Favourite hotels · NBC Hospitality" },
      { name: "description", content: "The NBC Hospitality properties you have saved for later." },
      { property: "og:title", content: "Favourite hotels · NBC Hospitality" },
      { property: "og:description", content: "Properties you have saved across the NBC network." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AccountPlaceholder
      eyebrow="Customer Account"
      title="Favourite hotels"
      description="Hotels you save while browsing will gather here for a quicker return visit."
      emptyTitle="No favourite hotels yet"
      emptyDescription="Tap the heart on any property and it will be waiting for you here."
    />
  ),
});
