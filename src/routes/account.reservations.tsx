import { createFileRoute, redirect } from "@tanstack/react-router";

import { AccountPlaceholder } from "@/components/nbc/AccountPlaceholder";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account/reservations")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user)
      throw redirect({ to: "/account/login", search: { next: "/account/reservations" } });
  },
  head: () => ({
    meta: [
      { title: "My reservations · NBC Hospitality" },
      {
        name: "description",
        content: "Review your upcoming and past NBC Hospitality reservations.",
      },
      { property: "og:title", content: "My reservations · NBC Hospitality" },
      { property: "og:description", content: "Your upcoming and past stays with NBC Hospitality." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AccountPlaceholder
      eyebrow="Customer Account"
      title="My reservations"
      description="Every stay you book with NBC Hospitality will be listed here."
      emptyTitle="Reservation management is coming soon"
      emptyDescription="We are preparing a full reservation view with modifications, invoices and check-in details."
    />
  ),
});
