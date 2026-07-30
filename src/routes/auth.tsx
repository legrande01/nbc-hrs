import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { GlobalNav } from "@/components/nbc/GlobalNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

/** Only same-origin relative paths may be used as a post-auth return target. */
function safeNext(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    next: safeNext(search.next),
  }),
  head: () => ({
    meta: [
      { title: "Sign in · NBC Hospitality" },
      {
        name: "description",
        content:
          "Sign in to your NBC Hospitality account to manage reservations and connect trusted apps to your profile.",
      },
      { property: "og:title", content: "Sign in · NBC Hospitality" },
      {
        property: "og:description",
        content: "Access your NBC Hospitality account and connected integrations.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { next } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const returnTo = safeNext(next);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) window.location.assign(returnTo);
    });
    return () => {
      active = false;
    };
  }, [returnTo]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}${returnTo}` },
      });
      setBusy(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        window.location.assign(returnTo);
        return;
      }
      setMessage("Check your inbox to confirm your email, then sign in.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    window.location.assign(returnTo);
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />
      <main className="mx-auto flex max-w-md flex-col gap-6 px-5 py-16">
        <div>
          <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">NBC Hospitality</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {mode === "signin" ? "Sign in to your account" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your account keeps your reservations together and authorises the apps you connect to
            NBC Hospitality.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6 shadow-card"
        >
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-nbc-scarlet">
              {error}
            </p>
          ) : null}
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

          <Button type="submit" size="lg" disabled={busy}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>

          <button
            type="button"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setMessage(null);
            }}
          >
            {mode === "signin"
              ? "New to NBC Hospitality? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </form>

        <Button variant="ghost" onClick={() => navigate({ to: "/" })}>
          Back to home
        </Button>
      </main>
    </div>
  );
}
