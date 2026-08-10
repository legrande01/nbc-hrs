import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy path — the module is now "Payments". */
export const Route = createFileRoute("/account/payment-methods")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/account/payments" });
  },
});
