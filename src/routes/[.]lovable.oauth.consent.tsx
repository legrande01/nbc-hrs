import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type AuthorizationClient = { name?: string; client_uri?: string; redirect_uri?: string };
type AuthorizationDetails = {
  client?: AuthorizationClient;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};

type OAuthApi = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  // Browser-only: the session lives in localStorage, absent during SSR.
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    authorization_id: typeof search.authorization_id === "string" ? search.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/auth", search: { next: location.pathname + location.searchStr } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-xl font-semibold text-foreground">
        Could not load this authorization request
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
  component: Consent,
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? "this app";
  const scopes = (details?.scope ?? "").split(" ").filter(Boolean);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error: decisionError } = approve
      ? await oauthApi().approveAuthorization(authorization_id)
      : await oauthApi().denyAuthorization(authorization_id);
    if (decisionError) {
      setBusy(false);
      setError(decisionError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
      <div className="grid gap-5 rounded-2xl border border-border/70 bg-card p-6 shadow-card">
        <div>
          <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Authorize access</p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Connect {clientName} to NBC Hospitality
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {clientName} will be able to call NBC Hospitality tools while you are signed in.
          </p>
        </div>

        {details?.client?.redirect_uri ? (
          <p className="break-all text-xs text-muted-foreground">
            Redirects to {details.client.redirect_uri}
          </p>
        ) : null}

        {scopes.length ? (
          <ul className="grid gap-1 text-sm text-muted-foreground">
            {scopes.map((scope) => (
              <li key={scope}>
                {scope === "email"
                  ? "Share your email address"
                  : scope === "profile" || scope === "openid"
                    ? "Share your basic profile"
                    : `Additional permission requested: ${scope}`}
              </li>
            ))}
          </ul>
        ) : null}

        <p className="text-xs leading-relaxed text-muted-foreground">
          This does not bypass NBC Hospitality permissions or backend policies.
        </p>

        {error ? (
          <p role="alert" className="text-sm text-nbc-scarlet">
            {error}
          </p>
        ) : null}

        <div className="grid gap-2">
          <Button size="lg" disabled={busy} onClick={() => decide(true)}>
            Approve
          </Button>
          <Button variant="outline" size="lg" disabled={busy} onClick={() => decide(false)}>
            Cancel connection
          </Button>
        </div>
      </div>
    </main>
  );
}
