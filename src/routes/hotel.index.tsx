import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/hotel/")({
  beforeLoad: () => {
    throw redirect({ to: "/hotel/dashboard" });
  },
});
