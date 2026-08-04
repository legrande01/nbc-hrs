import { createFileRoute, redirect } from "@tanstack/react-router";

import { AccountPlaceholder } from "@/components/nbc/AccountPlaceholder";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account/rewards")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/account/login", search: { next: "/account/rewards" } });
  },
  head: () => ({
    meta: [
      { title: "Rewards & loyalty · NBC Hospitality" },
      { name: "description", content: "Track the reward points you earn on every NBC stay." },
      { property: "og:title", content: "Rewards & loyalty · NBC Hospitality" },
      { property: "og:description", content: "Reward points earned across NBC Hospitality stays." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AccountPlaceholder
      eyebrow="Customer Account"
      title="Rewards & loyalty"
      description="Points earned, tier progress and redemption options will appear here."
      emptyTitle="The rewards module is on its way"
      emptyDescription="Keep booking with NBC Hospitality — your points are being tracked and will be redeemable soon."
    />
  ),
});
