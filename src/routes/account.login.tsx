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
import { loginSchema } from "@/lib/auth-schemas";
import { setRememberMe } from "@/lib/nbc-session";

function safeNext(value: unknown): string {
  if (typeof value !== "string") return "/account";
  if (!value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

export const Route = createFileRoute("/account/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown> & SearchSchemaInput) => ({ next: safeNext(search?.next) }),
  head: () => ({
    meta: [
      { title: "Sign in to your account · NBC Hospitality" },
      {
        name: "description",
        content:
          "Sign in to NBC Hospitality with your email address or phone number to manage reservations and your NBC membership.",
      },
      { property: "og:title", content: "Sign in · NBC Hospitality" },
      {
        property: "og:description",
        content: "Access your NBC Hospitality reservations, profile and membership benefits.",
      },
    ],
  }),
  component: CustomerLoginPage,
});

function CustomerLoginPage() {
  const { next } = useSearch({ from: "/account/login" });
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.assign(next);
    });
  }, [next]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ identifier, password, rememberMe: remember });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details and try again.");
      return;
    }

    setBusy(true);
    try {
      const { email } = await resolveLoginEmail({ data: { identifier } });
      if (!email) {
        setError("We could not find an account with those details.");
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
      setError(cause instanceof Error ? cause.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Customer Account"
      title="Sign in to your account"
      description="Use the email address or phone number registered to your NBC Hospitality account."
      footer={
        <div className="grid gap-2 text-sm text-muted-foreground">
          <p>
            New to NBC Hospitality?{" "}
            <Link to="/account/register" className="font-medium text-nbc-royal hover:underline">
              Create an account
            </Link>
          </p>
          <p>
            Booked as a guest?{" "}
            <Link to="/find-reservation" className="font-medium text-nbc-royal hover:underline">
              Find my reservation
            </Link>
          </p>
          <p>
            Hotel partner?{" "}
            <Link to="/partners/login" className="font-medium text-nbc-royal hover:underline">
              Hotel login
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <AuthCard>
          <div className="grid gap-2">
            <Label htmlFor="identifier">Email address or phone number</Label>
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
