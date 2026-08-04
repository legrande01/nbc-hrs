import { createFileRoute, redirect } from "@tanstack/react-router";

import { AccountPlaceholder } from "@/components/nbc/AccountPlaceholder";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account/settings")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/account/login", search: { next: "/account/settings" } });
  },
  head: () => ({
    meta: [
      { title: "Profile & settings · NBC Hospitality" },
      { name: "description", content: "Your NBC Hospitality profile details and preferences." },
      { property: "og:title", content: "Profile & settings · NBC Hospitality" },
      { property: "og:description", content: "Manage your NBC Hospitality profile preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AccountPlaceholder
      eyebrow="Customer Account"
      title="Profile & settings"
      description="Personal details, travel preferences and security settings will be managed here."
      emptyTitle="Profile editing is coming soon"
      emptyDescription="This sprint introduces the dashboard only — editing your details arrives with the profile module."
    />
  ),
});
