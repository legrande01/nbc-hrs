import { createFileRoute, redirect } from "@tanstack/react-router";

import { AccountPlaceholder } from "@/components/nbc/AccountPlaceholder";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account/notifications")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user)
      throw redirect({ to: "/account/login", search: { next: "/account/notifications" } });
  },
  head: () => ({
    meta: [
      { title: "Notifications · NBC Hospitality" },
      { name: "description", content: "Stay updates, reminders and offers from NBC Hospitality." },
      { property: "og:title", content: "Notifications · NBC Hospitality" },
      { property: "og:description", content: "Reminders and updates about your NBC stays." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AccountPlaceholder
      eyebrow="Customer Account"
      title="Notifications"
      description="Check-in reminders, confirmations and member offers will be collected here."
      emptyTitle="Nothing new right now"
      emptyDescription="We will let you know the moment there is something worth your attention."
    />
  ),
});
