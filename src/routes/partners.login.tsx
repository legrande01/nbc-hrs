import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import type { SearchSchemaInput } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AuthCard, AuthShell } from "@/components/nbc/AuthShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { resolveLoginEmail } from "@/lib/auth.functions";
import { setRememberMe } from "@/lib/nbc-session";

function safeNext(value: unknown): string {
  if (typeof value !== "string") return "/partners/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/partners/dashboard";
  return value;
}

export const Route = createFileRoute("/partners/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown> & SearchSchemaInput) => ({ next: safeNext(search?.next) }),
  head: () => ({
    meta: [
      { title: "Hotel partner login · NBC Hospitality" },
      {
        name: "description",
        content:
          "Hotel partners sign in to manage their NBC Hospitality application, property profile and operations dashboard.",
      },
      { property: "og:title", content: "Hotel partner login · NBC Hospitality" },
      {
        property: "og:description",
        content: "Access the NBC Hospitality hotel partner dashboard.",
      },
    ],
  }),
  component: PartnerLoginPage,
});

function PartnerLoginPage() {
  const { next } = useSearch({ from: "/partners/login" });
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.assign(next);
    });
  }, [next]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { email } = await resolveLoginEmail({ data: { identifier } });
      if (!email) {
        setError("We could not find a partner account with those details.");
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      setRememberMe(remember);
      window.location.assign(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign in failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Hotel Partners"
      title="Hotel partner sign in"
      description="Manage your property application, documents and — once approved — your operations dashboard."
      footer={
        <div className="grid gap-2 text-sm text-muted-foreground">
          <p>
            Not yet a partner?{" "}
            <Link to="/partners/register" className="font-medium text-nbc-royal hover:underline">
              Apply to list your property
            </Link>
          </p>
          <p>
            Looking for your booking?{" "}
            <Link
              to="/account/login"
              search={{ next: "/account" }}
              className="font-medium text-nbc-royal hover:underline"
            >
              Customer sign in
            </Link>
          </p>
          {isHotelAdminDevBypassEnabled ? (
            <p className="rounded-xl border border-nbc-gold/40 bg-nbc-gold/10 p-3 text-xs">
              Development preview only —{" "}
              <Link to="/hotel/dashboard" className="font-medium text-nbc-royal hover:underline">
                open the {demoHotelAdmin.name} dashboard
              </Link>
            </p>
          ) : null}
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <AuthCard>
          <div className="grid gap-2">
            <Label htmlFor="identifier">Work email or phone number</Label>
            <Input
              id="identifier"
              autoComplete="username"
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={remember}
                onCheckedChange={(value) => setRemember(value === true)}
              />
              Remember me
            </label>
            <Link
              to="/account/forgot-password"
              className="text-sm font-medium text-nbc-royal hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          {error ? (
            <p role="alert" className="text-sm text-nbc-scarlet">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="scarlet" size="lg" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate({ to: "/" })}>
            Back to home
          </Button>
        </AuthCard>
      </form>
    </AuthShell>
  );
}
