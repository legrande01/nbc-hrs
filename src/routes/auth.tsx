import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy sign-in path. The customer identity flow now lives under /account. */
export const Route = createFileRoute("/auth")({
  beforeLoad: ({ search }) => {
    const next = (search as { next?: string }).next;
    const safe = typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/account";
    throw redirect({ to: "/account/login", search: { next: safe } });
  },
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : "/account",
  }),
});
