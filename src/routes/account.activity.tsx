import { createFileRoute, redirect } from "@tanstack/react-router";

import { AccountPlaceholder } from "@/components/nbc/AccountPlaceholder";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account/activity")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/account/login", search: { next: "/account/activity" } });
  },
  head: () => ({
    meta: [
      { title: "Activity · NBC Hospitality" },
      { name: "description", content: "A full history of your NBC Hospitality account activity." },
      { property: "og:title", content: "Activity · NBC Hospitality" },
      { property: "og:description", content: "Confirmations, payments and reminders in one log." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AccountPlaceholder
      eyebrow="Customer Account"
      title="Account activity"
      description="Confirmations, payments, emails and reminders across your NBC Hospitality account."
      emptyTitle="The full activity log is coming soon"
      emptyDescription="Your latest four events are already shown on the dashboard timeline."
    />
  ),
});
