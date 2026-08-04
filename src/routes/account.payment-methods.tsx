import { createFileRoute, redirect } from "@tanstack/react-router";

import { AccountPlaceholder } from "@/components/nbc/AccountPlaceholder";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account/payment-methods")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user)
      throw redirect({ to: "/account/login", search: { next: "/account/payment-methods" } });
  },
  head: () => ({
    meta: [
      { title: "Payment methods · NBC Hospitality" },
      { name: "description", content: "Manage how you pay for stays across NBC Hospitality." },
      { property: "og:title", content: "Payment methods · NBC Hospitality" },
      { property: "og:description", content: "Your saved ways to pay with NBC Hospitality." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AccountPlaceholder
      eyebrow="Customer Account"
      title="Payment methods"
      description="Saved cards, mobile money wallets and your NBC account link will live here."
      emptyTitle="Payment management is coming soon"
      emptyDescription="You will soon be able to add, remove and set a default way to pay, plus link your NBC account."
    />
  ),
});
